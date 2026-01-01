<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with('employee');

        // Filter by Date Range or Single Date
        if ($request->has('from_date') && $request->has('to_date')) {
             $query->whereBetween('date', [$request->from_date, $request->to_date]);
        } elseif ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        // Filter by Employee ID
        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        // Filter by Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by Employee Name or Mobile (Search)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('employee', function ($q) use ($search) {
                $q->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('attendance_machine_id', 'like', "%{$search}%");
            });
        }

        $attendances = $query->orderBy('date', 'desc')->paginate(20)->withQueryString();

        return Inertia::render('Attendance/Index', [
            'attendances' => $attendances,
            'filters' => $request->only(['date', 'from_date', 'to_date', 'employee_id', 'status', 'search']),
        ]);
    }

    // ... import method ...




    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $data = array_map('str_getcsv', file($path));

        Log::info("Starting attendance import. Rows: " . count($data));

        $importedCount = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($data as $index => $row) {
                // Skip empty lines or header
                if (count($row) < 2) {
                     continue;
                }
                
                // Simple heuristic for header: First column is "MachineID" or similar text, not a number
                if ($index === 0 && !is_numeric($row[0])) {
                    \Illuminate\Support\Facades\Log::info("Skipping likely header row: " . implode(',', $row));
                    continue;
                }

                $machineId = trim($row[0]);
                $timestamp = trim($row[1]);
                
                if (empty($machineId) || empty($timestamp)) {
                     $errors[] = "Row " . ($index + 1) . ": Missing ID or Timestamp.";
                     continue;
                }

                // Try to parse timestamp
                try {
                    $dt = Carbon::parse($timestamp);
                } catch (\Exception $e) {
                    $errors[] = "Row " . ($index + 1) . ": Invalid date format ($timestamp)";
                    continue;
                }

                $date = $dt->format('Y-m-d');
                $time = $dt->format('H:i:s');

                $employee = Employee::where('attendance_machine_id', $machineId)->first();

                if (!$employee) {
                    $errors[] = "Row " . ($index + 1) . ": No Employee found with Machine ID '$machineId'";
                    \Illuminate\Support\Facades\Log::warning("Import Warning: No employee found for machine_id: $machineId");
                    continue;
                }

                // Check if attendance record exists for this day
                $attendance = Attendance::firstOrCreate(
                    ['employee_id' => $employee->id, 'date' => $date],
                    ['status' => 'present'] // Default to present if created
                );

                if (!$attendance->clock_in) {
                    $attendance->clock_in = $time;
                } else {
                    // We need to compare full timestamps.
                    // $attendance->date is cast to 'date' (Carbon instance at 00:00:00)
                    // We must format it to Y-m-d string to safely concatenate with time string.
                    $dateStr = $attendance->date instanceof Carbon ? $attendance->date->format('Y-m-d') : $attendance->date;
                    
                    $existingClockIn = Carbon::parse($dateStr . ' ' . $attendance->clock_in);
                    
                    if ($dt->lt($existingClockIn)) {
                        // Current time is earlier than existing clock_in.
                        $oldClockIn = $attendance->clock_in;
                        $attendance->clock_in = $time;
                        
                        // If we didn't have a clock out, make the old clock-in the clock-out
                        if (!$attendance->clock_out) {
                             $attendance->clock_out = $oldClockIn;
                        }
                    } else {
                        // potentially clock out.
                        if ($attendance->clock_out) {
                            $existingClockOut = Carbon::parse($dateStr . ' ' . $attendance->clock_out);
                            if ($dt->gt($existingClockOut)) {
                                $attendance->clock_out = $time;
                            }
                        } else {
                            $attendance->clock_out = $time;
                        }
                    }
                }
                
                // Recalculate late/overtime
                $this->calculateHours($attendance);

                $attendance->save();
                $importedCount++;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Import failed entirely: " . $e->getMessage());
            return back()->withErrors(['file' => 'Import failed: ' . $e->getMessage()]);
        }

        \Illuminate\Support\Facades\Log::info("Import completed. Imported: $importedCount. Errors: " . count($errors));

        if (count($errors) > 0) {
            return redirect()->back()
                ->with('success', "Imported $importedCount records with some issues.")
                ->with('import_errors', $errors);
        }

        return redirect()->back()->with('success', "Imported $importedCount records successfully.");
    }



    public function report(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);
        $employeeId = $request->input('employee_id');

        $query = Attendance::with('employee')
            ->whereMonth('date', $month)
            ->whereYear('date', $year);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        $attendances = $query->orderBy('date')->get();

        // Calculate Statistics
        $totalDays = $attendances->count();
        $present = $attendances->where('status', 'present')->count();
        $late = $attendances->where('status', 'late')->count();
        $absent = $attendances->where('status', 'absent')->count();
        $totalLateMinutes = $attendances->sum('late_minutes');
        $totalOvertimeMinutes = $attendances->sum('overtime_minutes');

        // Group by Employee for Table
        $employeeStats = $attendances->groupBy('employee_id')->map(function ($records) {
            $emp = $records->first()->employee;
            return [
                'employee' => $emp,
                'present' => $records->where('status', 'present')->count(),
                'late' => $records->where('status', 'late')->count(),
                'absent' => $records->where('status', 'absent')->count(),
                'late_minutes' => $records->sum('late_minutes'),
                'overtime_minutes' => $records->sum('overtime_minutes'),
            ];
        })->values();

        return Inertia::render('Attendance/Reports', [
            'stats' => [
                'total_days' => $totalDays, // Total records, effectively
                'present' => $present,
                'late' => $late,
                'absent' => $absent,
                'total_late_minutes' => $totalLateMinutes,
                'total_overtime_minutes' => $totalOvertimeMinutes,
            ],
            'employee_stats' => $employeeStats,
            'filters' => [
                'month' => $month,
                'year' => $year,
                'employee_id' => $employeeId,
            ],
            'employees' => Employee::select('id', 'first_name', 'last_name', 'attendance_machine_id')->get(),
        ]);
    }
    public function employeeHistory(Request $request, $employee_id)
    {
        $employee = Employee::findOrFail($employee_id);

        $query = Attendance::where('employee_id', $employee_id);

        if ($request->has('from_date') && $request->has('to_date')) {
            $query->whereBetween('date', [$request->from_date, $request->to_date]);
        } elseif ($request->has('month') && $request->has('year')) {
             $query->whereMonth('date', $request->month)
                   ->whereYear('date', $request->year);
        }

        $attendances = $query->orderBy('date', 'desc')->paginate(31)->withQueryString();

        return Inertia::render('Attendance/EmployeeHistory', [
            'employee' => $employee,
            'attendances' => $attendances,
            'filters' => $request->only(['from_date', 'to_date', 'month', 'year']),
        ]);
    }

    public function exportPdf(Request $request)
    {
        // Implementation for PDF export
        // ... (Logic to be filled in next step using multi_replace to be safe, or just here if I am confident)
        // Let's implement basic filtering first to fetch data
        
        $query = Attendance::with('employee');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('from_date') && $request->filled('to_date')) {
             $query->whereBetween('date', [$request->from_date, $request->to_date]);
        } elseif ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('employee', function ($q) use ($search) {
                $q->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('attendance_machine_id', 'like', "%{$search}%");
            });
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.attendance_pdf', compact('attendances'));
        return $pdf->download('attendance_report.pdf');
    }

    public function exportExcel(Request $request) 
    {
         // Quick implementation using a collection export or manually if needed.
         // For now, let's just dump a simple CSV or use a library if installed. 
         // Composer.json showed "maatwebsite/excel": "^1.1", but that version is very old (Laravel 4/5 era?).
         // Wait, composer.json had "phpoffice/phpspreadsheet": "^5.1". 
         // It also had "maatwebsite/excel": "^1.1" which is weird. 
         
         // Let's stick to CSV generation for "Excel" export to be safe and fast without dependency hell,
         // or use basic PHPSpreadsheet if needed. 
         // Actually, let's just do a CSV response Stream for maximum compatibility and speed.

         $query = Attendance::with('employee');

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('from_date') && $request->filled('to_date')) {
             $query->whereBetween('date', [$request->from_date, $request->to_date]);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('employee', function ($q) use ($search) {
                $q->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('attendance_machine_id', 'like', "%{$search}%");
            });
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=attendance_report.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($attendances) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Employee ID', 'Name', 'Date', 'Clock In', 'Clock Out', 'Status', 'Late (min)', 'Overtime (min)']);

            foreach ($attendances as $row) {
                fputcsv($file, [
                    $row->employee->attendance_machine_id ?? 'N/A',
                    $row->employee->first_name . ' ' . $row->employee->last_name,
                    $row->date,
                    $row->clock_in,
                    $row->clock_out,
                    $row->status,
                    $row->late_minutes,
                    $row->overtime_minutes
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
    private function calculateHours(Attendance $attendance)
    {
        if ($attendance->clock_in && $attendance->clock_out) {
            // Use the attendance specific date for accurate comparison
            $dateStr = $attendance->date instanceof Carbon ? $attendance->date->format('Y-m-d') : $attendance->date;
            
            $start = Carbon::parse($dateStr . ' ' . $attendance->clock_in);
            $end = Carbon::parse($dateStr . ' ' . $attendance->clock_out);
            
            // Work Logic: 8:00 AM to 5:00 PM (17:00)
            $workStart = Carbon::parse($dateStr . ' 08:00:00');
            $workEnd = Carbon::parse($dateStr . ' 17:00:00');
            
            // Calculate Late
            if ($start->gt($workStart)) {
                // Add tolerance? e.g. 5 mins. For now strict.
                $attendance->late_minutes = $start->diffInMinutes($workStart);
                $attendance->status = 'late';
            } else {
                $attendance->late_minutes = 0;
                // If previously late but now on time (re-import?), reset status if it was just 'late'
                if ($attendance->status === 'late') {
                    $attendance->status = 'present';
                }
            }

            // Calculate Overtime
            if ($end->gt($workEnd)) {
                $attendance->overtime_minutes = $end->diffInMinutes($workEnd);
            } else {
                $attendance->overtime_minutes = 0;
            }
        }
    }
}
