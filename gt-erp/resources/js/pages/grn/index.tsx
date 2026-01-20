// resources/js/Pages/Index.tsx
import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Grn {
  id: number;
  grn_no: string;
  supplier: string;
  po: string;
  status: string;
  total: number;
  created_at: string;
  date: string;
}

interface Props {
  grns: Grn[];
  filters: { search?: string; status?: string; start?: string; end?: string };
}

export default function Index({ grns, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || '');
  const [start, setStart] = useState(filters.start || '');
  const [end, setEnd] = useState(filters.end || '');

  const { flash } = usePage().props as any;
  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const applyFilter = () =>
    router.get('/dashboard/grn', { search, status, start, end }, { preserveState: true });

  const clearFilter = () => {
    setSearch(''); setStatus(''); setStart(''); setEnd('');
    router.get('/dashboard/grn');
  };

  const destroy = (id: number) => {
    if (!confirm('Delete this GRN?')) return;
    router.delete(`/dashboard/grn/${id}`);
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'GRN', href: '/dashboard/grn' }]}>
      <Head title="GRN" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Good Received Notes</h1>
          <Link hidden href="/dashboard/grn/create">
            <Button>Add New GRN</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
          <Input placeholder="GRN / Supplier / PO / Total" value={search} onChange={e => setSearch(e.target.value)} />
          <Input type="date" value={start} onChange={e => setStart(e.target.value)} />
          <Input type="date" value={end} onChange={e => setEnd(e.target.value)} />
          <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded p-2">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="complete">Complete</option>
          </select>
          <div className="flex gap-2">
            <Button onClick={applyFilter}>Apply</Button>
            <Button variant="outline" onClick={clearFilter}>Clear</Button>
          </div>
        </div>

        <Table>
          <TableCaption>GRN records</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>GRN No</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>PO</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total (LKR)</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grns.map((g) => (
              <TableRow key={g.id}>
                <TableCell>{g.grn_no}</TableCell>
                <TableCell>{g.supplier ?? ""}</TableCell>
                <TableCell>{g.po}</TableCell>
                <TableCell>{g.status}</TableCell>
                <TableCell>LKR {g.total.toFixed(2)}</TableCell>
                <TableCell>{g.date}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/dashboard/grn/${g.id}`}>
                    <Button size="sm" variant="outline">View</Button>
                  </Link>
                  <Link href={`/dashboard/grn/${g.id}/edit`}>
                    <Button size="sm">Edit</Button>
                  </Link>
                  <Button size="sm" variant="destructive" onClick={() => destroy(g.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
}