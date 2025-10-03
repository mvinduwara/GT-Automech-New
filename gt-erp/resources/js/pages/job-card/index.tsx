import { useForm, usePage, Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import RemarkForm from "./RemarkForm";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Job Cards", href: "/dashboard/job-card" },
];

export default function Index() {
    const { jobCards, pendingJobCards, filters } = usePage().props as {
        jobCards: any;
        pendingJobCards: any[];
        filters: { search?: string; status?: string; type?: string };
    };

    const { data, setData, get, reset } = useForm({
        search: filters.search || "",
        status: filters.status || "",
        type: filters.type || "",
    });

    const applyFilters = () => {
        get(route("dashboard.job-card.index"), { preserveState: true });
    };

    const clearFilters = () => {
        reset();
        get(route("dashboard.job-card.index"), { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Job Cards" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="h1 font-bold">All Job Cards</h1>
                    <div className="flex items-center justify-end gap-2">
                        <a target='_blank' href={'/dashboard/job-card/open'}>
                            <Button >Open New Job Card</Button>
                        </a>
                    </div>
                </div>

                {/* 🔹 Pending Job Cards Grid */}
                {pendingJobCards.length > 0 && (
                    <div>
                        <h2 className="mb-2 text-lg font-semibold">Pending Job Cards</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {pendingJobCards.map((card) => (
                                <div
                                    key={card.id}
                                    className="rounded-xl border bg-white p-4 shadow"
                                >
                                    <h3 className="font-bold">{card.job_card_no}</h3>
                                    <p>Customer: {card.customer?.name}</p>
                                    <p>Vehicle: {card.vehicle?.vehicle_no}</p>
                                    <p>Mileage: {card.mileage}</p>
                                    <p className="text-yellow-600">Status: {card.status}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🔹 Filters */}
                <div className="flex flex-wrap items-end gap-2 rounded-xl border bg-white p-4 shadow">
                    <div>
                        <label className="block text-sm font-medium">Search</label>
                        <input
                            type="text"
                            value={data.search}
                            onChange={(e) => setData("search", e.target.value)}
                            className="rounded-md border px-2 py-1"
                            placeholder="Job card, customer, vehicle..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Status</label>
                        <select
                            value={data.status}
                            onChange={(e) => setData("status", e.target.value)}
                            className="rounded-md border px-2 py-1"
                        >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Type</label>
                        <select
                            value={data.type}
                            onChange={(e) => setData("type", e.target.value)}
                            className="rounded-md border px-2 py-1"
                        >
                            <option value="">All</option>
                            <option value="general">General</option>
                            <option value="repair">Repair</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={applyFilters}>Apply</Button>
                        <Button variant="outline" onClick={clearFilters}>
                            Clear
                        </Button>
                    </div>
                </div>

                {/* 🔹 Job Cards Table */}
                <div className="overflow-x-auto rounded-xl border bg-white shadow">
                    <Table className="w-full">
                        <TableCaption>Recent Job Cards</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Card No</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Vehicle</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Mileage</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobCards.data.map((card: any) => (
                                <TableRow key={card.id}>
                                    <TableCell className="cursor-pointer hover:underline">
                                        <Link href={`/dashboard/job-card/${card.id}/view`}>
                                            {card.job_card_no}</Link>
                                    </TableCell>
                                    <TableCell>{card.customer?.name}</TableCell>
                                    <TableCell>{card.vehicle?.vehicle_no}</TableCell>
                                    <TableCell>{card.status}</TableCell>
                                    <TableCell>{card.mileage}</TableCell>
                                    <TableCell>
                                        {new Date(card.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <RemarkForm id={card.id} remarks={card.remarks} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* 🔹 Pagination */}
                <div className="mt-4 flex items-center justify-center gap-2">
                    {jobCards.links.map((link: any, idx: number) => (
                        <Button
                            key={idx}
                            variant={link.active ? "default" : "outline"}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
