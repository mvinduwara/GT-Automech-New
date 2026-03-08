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

class PettyCashDayDetailsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle, ShouldAutoSize
{
    protected $vouchers;
    protected $date;

    public function __construct($vouchers, $date)
    {
        $this->vouchers = $vouchers;
        $this->date = $date;
    }

    public function collection()
    {
        return $this->vouchers;
    }

    public function headings(): array
    {
        return [
            'Voucher #',
            'Payee',
            'Description',
            'Status',
            'Requested Amount (LKR)',
            'Actual Spent (LKR)',
            'Balance (LKR)',
            'Requested By',
            'Approved By',
            'Finalized At'
        ];
    }

    public function map($voucher): array
    {
        return [
            $voucher->voucher_number,
            $voucher->name,
            $voucher->description,
            strtoupper($voucher->status),
            number_format($voucher->requested_amount, 2, '.', ''),
            number_format($voucher->actual_amount, 2, '.', ''),
            number_format($voucher->balance_amount, 2, '.', ''),
            $voucher->requestedBy->name ?? 'N/A',
            $voucher->approvedBy->name ?? 'N/A',
            $voucher->finalized_at ? $voucher->finalized_at->format('Y-m-d H:i') : 'Not Finalized'
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
        return 'Petty Cash Details - ' . $this->date;
    }
}
