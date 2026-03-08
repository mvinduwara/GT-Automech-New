<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\{
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithTitle,
    ShouldAutoSize
};
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PettyCashDailySummariesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        return [
            'Report Date',
            'Voucher Count',
            'Total Requested (LKR)',
            'Total Spent (LKR)',
            'Total Balance (LKR)',
            'Finalized Count'
        ];
    }

    public function map($summary): array
    {
        return [
            $summary->report_date,
            $summary->voucher_count,
            number_format($summary->total_requested, 2, '.', ''),
            number_format($summary->total_spent, 2, '.', ''),
            number_format($summary->total_balance, 2, '.', ''),
            $summary->finalized_count
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Petty Cash Daily Summaries';
    }
}
