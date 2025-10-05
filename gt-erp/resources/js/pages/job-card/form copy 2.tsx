import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Head } from "@inertiajs/react";
import { format } from "date-fns";
import CustomerForm from "./CustomerForm";
import { JobCardDrawer } from "./JobCardDrawer";
import MileageForm from "./MileageForm";
import RemarkForm from "./RemarkForm";
import VehicleForm from "./VehicleForm";
import JobCardChargesForm from "./JobCardChargesForm";

type JobCardType = "general" | "service" | "insurance";
type JobCardStatus = "pending" | "complete" | "cancelled";


type VehicleServiceOption = {
    id: number;
    name: string;
    price: number;
    status: string;
};

type VehicleService = {
    id: number;
    name: string;
    status: string;
    options: VehicleServiceOption[];
};

type ExistingService = {
    id: number;
    vehicle_service_id: number;
    vehicle_service_option_id: number;
    is_included: boolean;
    subtotal: number;
    discount_type: 'percentage' | 'amount' | null;
    discount_value: number;
    total: number;
    vehicle_service: {
        id: number;
        name: string;
    };
    vehicle_service_option: {
        id: number;
        name: string;
        price: number;
    };
};


interface Customer {
  id: number;
  title: string;
  name: string;
  mobile: string;
  address: string;
}

interface VehicleBrand {
  id: number;
  name: string;
}

interface VehicleModel {
  id: number;
  name: string;
}

interface Vehicle {
  id: number;
  vehicle_no: string;
  vehicle_brand_id: number;
  vehicle_model_id: number;
  make_year: string;
  brand?: VehicleBrand;
  model?: VehicleModel;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface JobCard {
  id: number;
  job_card_no: string;
  vehicle_id: number;
  customer_id: number;
  user_id: number;
  mileage: number;
  date: string;
  remarks: string | null;
  type: JobCardType;
  status: JobCardStatus;
  customer: Customer;
  vehicle: Vehicle;
  user: User;
}

interface Props {
  jobCard: JobCard;
  vehicleServices: VehicleService[];
    existingServices: ExistingService[];
}

export default function Form({ jobCard ,vehicleServices, 
    existingServices }: Props) {
  const getStatusColor = (status: JobCardStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "complete":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeColor = (type: JobCardType) => {
    switch (type) {
      case "general":
        return "bg-blue-500";
      case "service":
        return "bg-purple-500";
      case "insurance":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div>
      <Head title={`Job Card - ${jobCard.job_card_no}`} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {jobCard.job_card_no}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Created on {format(new Date(jobCard.date), "PPP")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(jobCard.status)}>
                  {jobCard.status.toUpperCase()}
                </Badge>
                <Badge className={getTypeColor(jobCard.type)}>
                  {jobCard.type.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <JobCardDrawer jobCard={jobCard} />
              <JobCardChargesForm
    jobCardId={jobCard.id} 
    // existingCharges={jobCard.charges} 
/>
              <CustomerForm
                id={jobCard.id}
                customer={jobCard.customer}
              />
              <VehicleForm
                id={jobCard.id}
                vehicle={jobCard.vehicle}
              />
              <MileageForm
                id={jobCard.id}
                mileage={jobCard.mileage}
              />
              <RemarkForm
                id={jobCard.id}
                remarks={jobCard.remarks || ""}
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Customer & Vehicle Info */}


            {/* Right Column - Services & Parts (placeholder for future) */}
            <Card>
              <CardHeader>
                <CardTitle>Services & Parts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <p>Services and parts section coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}