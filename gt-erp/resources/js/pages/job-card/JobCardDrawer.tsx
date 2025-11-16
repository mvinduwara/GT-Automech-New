import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

interface Props {
    jobCard: JobCard
}

export function JobCardDrawer({ jobCard }: Props) {
    return (
        <Drawer direction="left">
            <DrawerTrigger asChild>
                <Button variant="secondary">View Details</Button>
            </DrawerTrigger>
            <DrawerContent className="w-fit h-screen max-h-screen flex flex-col rounded-none">
                <DrawerHeader className="shrink-0">
                    <DrawerTitle>Job Card Details</DrawerTitle>
                </DrawerHeader>

                {/* Scrollable main content */}
                <div className="flex-1 overflow-y-auto px-4 space-y-6">
                    {/* Customer Info */}
                    <section>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Customer Information
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Name:</span>
                                <span className="text-sm font-medium">
                                    {jobCard.customer.title} {jobCard.customer.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Mobile:</span>
                                <span className="text-sm font-medium">{jobCard.customer.mobile}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Address:</span>
                                <span className="text-sm font-medium text-right max-w-xs">
                                    {jobCard.customer.address}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Vehicle Info */}
                    <section className="border-t pt-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Vehicle Information
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Vehicle No:</span>
                                <span className="text-sm font-medium">{jobCard.vehicle.vehicle_no}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Brand:</span>
                                <span className="text-sm font-medium">
                                    {jobCard.vehicle.brand?.name || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Model:</span>
                                <span className="text-sm font-medium">
                                    {jobCard.vehicle.model?.name || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Year:</span>
                                <span className="text-sm font-medium">{jobCard.vehicle.make_year}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Mileage:</span>
                                <span className="text-sm font-medium">
                                    {jobCard.mileage.toLocaleString()} km
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Additional Info */}
                    <section className="border-t pt-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Additional Information
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Assigned To:</span>
                                <span className="text-sm font-medium">{jobCard.user.name}</span>
                            </div>
                            {jobCard.remarks && (
                                <div className="mt-3">
                                    <span className="text-sm text-gray-600 block mb-1">Remarks:</span>
                                    <p className="text-sm font-medium bg-gray-50 p-3 rounded-md">
                                        {jobCard.remarks}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Footer (fixed bottom) */}
                <DrawerFooter className="shrink-0 border-t">
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
