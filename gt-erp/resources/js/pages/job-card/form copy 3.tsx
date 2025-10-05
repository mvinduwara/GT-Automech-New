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
import JobCardServiceForm from "./JobCardServiceForm";

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

type ExistingCharge = {
  id: number;
  name: string;
  charge: number;
  discount_type: 'percentage' | 'amount' | null;
  discount_value: number;
  total: number;
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
  existingCharges: ExistingCharge[];
}

export default function Form({ 
  jobCard, 
  vehicleServices, 
  existingServices,
  existingCharges 
}: Props) {
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

  const calculateServicesTotal = () => {
    return existingServices
      .filter(service => service.is_included)
      .reduce((sum, service) => sum + service.total, 0);
  };

  const calculateChargesTotal = () => {
    return existingCharges.reduce((sum, charge) => sum + charge.total, 0);
  };

  const calculateGrandTotal = () => {
    return calculateServicesTotal() + calculateChargesTotal();
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
              <JobCardServiceForm
                jobCardId={jobCard.id}
                vehicleServices={vehicleServices}
                existingServices={existingServices}
              />
              <JobCardChargesForm
                jobCardId={jobCard.id}
                existingCharges={existingCharges}
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

          {/* Services & Charges Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Services Card */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Services</CardTitle>
              </CardHeader>
              <CardContent>
                {existingServices.length > 0 ? (
                  <div className="space-y-3">
                    {existingServices.map((service) => (
                      <div 
                        key={service.id} 
                        className={`p-3 rounded-lg border ${
                          service.is_included 
                            ? 'bg-white border-gray-200' 
                            : 'bg-gray-50 border-gray-300 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="font-medium text-sm">
                              {service.vehicle_service.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {service.vehicle_service_option.name}
                            </p>
                          </div>
                          {!service.is_included && (
                            <Badge variant="outline" className="text-xs">
                              Excluded
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-gray-600">
                            Subtotal: Rs. {service.subtotal.toLocaleString()}
                          </span>
                          <span className="font-semibold">
                            Rs. {service.total.toLocaleString()}
                          </span>
                        </div>
                        {service.discount_type && service.discount_value > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Discount: {service.discount_type === 'percentage' 
                              ? `${service.discount_value}%` 
                              : `Rs. ${service.discount_value}`}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="pt-3 border-t mt-3">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Services Total:</span>
                        <span>Rs. {calculateServicesTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <p>No services added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Charges Card */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Charges</CardTitle>
              </CardHeader>
              <CardContent>
                {existingCharges.length > 0 ? (
                  <div className="space-y-3">
                    {existingCharges.map((charge) => (
                      <div 
                        key={charge.id} 
                        className="p-3 rounded-lg border bg-white"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm">{charge.name}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-gray-600">
                            Charge: Rs. {charge.charge.toLocaleString()}
                          </span>
                          <span className="font-semibold">
                            Rs. {charge.total.toLocaleString()}
                          </span>
                        </div>
                        {charge.discount_type && charge.discount_value > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Discount: {charge.discount_type === 'percentage' 
                              ? `${charge.discount_value}%` 
                              : `Rs. ${charge.discount_value}`}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="pt-3 border-t mt-3">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Charges Total:</span>
                        <span>Rs. {calculateChargesTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <p>No charges added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Grand Total Card */}
          {(existingServices.length > 0 || existingCharges.length > 0) && (
            <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">
                    Grand Total:
                  </span>
                  <span className="text-2xl font-bold text-indigo-600">
                    Rs. {calculateGrandTotal().toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}