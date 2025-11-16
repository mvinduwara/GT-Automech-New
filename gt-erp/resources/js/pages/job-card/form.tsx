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
import JobCardProductsForm from "./JobCardProductsForm";
import EmployeeAssignmentForm from "./EmployeeAssignmentForm";
import CreateInvoiceForm from "../invoice/CreateInvoiceForm";
import CreateInsuranceForm from "../insurance/CreateInsuranceForm";
import { AlertCircle, ArrowLeft, Printer } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import JobCardStatusForm from "./JobCardStatusForm";
import JobCardTypeForm from "./JobCardTypeForm";
import { Button } from "@/components/ui/button";

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

type Product = {
  id: number;
  part_number: string;
  name: string;
};

type ExistingProduct = {
  id: number;
  stock_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount_type: 'percentage' | 'amount' | null;
  discount_value: number;
  total: number;
  stock: {
    id: number;
    product: Product;
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
  jobCard: JobCard & {
    invoice?: {
      id: number;
      invoice_no: string;
      status: string;
    };
    insurance?: {
      id: number;
      insurance_no: string;
      status: string;
    };
  };
  vehicleServices: VehicleService[];
  existingServices: ExistingService[];
  existingCharges: ExistingCharge[];
  existingProducts: ExistingProduct[];
}

export default function Form({
  jobCard,
  vehicleServices,
  existingServices,
  existingCharges,
  existingProducts
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

  const calculateProductsTotal = () => {
    return existingProducts.reduce(
      (sum, product) => sum + Number(product.total || 0),
      0
    );
  };

  const handlePrint = () => {
    // window.print();
    const url = route('dashboard.job-card.print', jobCard.id);
    window.open(url, '_blank');
  };

  const calculateServicesTotal = () => {
    return existingServices
      .filter(service => service.is_included)
      .reduce((sum, service) => sum + Number(service.total || 0), 0);
  };

  const calculateChargesTotal = () => {
    return existingCharges.reduce(
      (sum, charge) => sum + Number(charge.total || 0),
      0
    );
  };

  const calculateGrandTotal = () => {
    return calculateServicesTotal() + calculateChargesTotal() + calculateProductsTotal();
  };

  const handleBack = () => {
    window.close();
  };

  return (
    <div>
      <Head title={`Job Card - ${jobCard.job_card_no}`} />

      <div className="py-6 " >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex gap-2 items-center ">
                  <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {jobCard.job_card_no}
                  </h1>
                </div>

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
                <JobCardStatusForm
                  id={jobCard.id}
                  currentStatus={jobCard.status}
                  jobCardNo={jobCard.job_card_no}
                />
                {jobCard.status === "pending" && (
                  <>
                    <JobCardTypeForm
                      id={jobCard.id}
                      currentType={jobCard.type}
                      jobCardNo={jobCard.job_card_no}
                      hasInvoice={!!jobCard.invoice}
                      hasInsurance={!!jobCard.insurance}
                      disabled={jobCard.status === 'cancelled'}
                    />
                  </>
                )
                }

                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Job Card
                </Button>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">

              <JobCardDrawer jobCard={jobCard} />

              {!jobCard.invoice && (
                <>
                  <JobCardServiceForm
                    jobCardId={jobCard.id}
                    vehicleServices={vehicleServices}
                    existingServices={existingServices}
                  />
                  <JobCardProductsForm
                    jobCardId={jobCard.id}
                    existingProducts={existingProducts}
                  />
                  <JobCardChargesForm
                    jobCardId={jobCard.id}
                    existingCharges={existingCharges}
                  />
                </>
              )}

              {jobCard.invoice && (
                <>
                  {jobCard.invoice && (existingServices.length > 0 || existingProducts.length > 0 || existingCharges.length > 0) && (
                    <Alert variant="destructive" className="mt-4 !text-red-800">
                      <AlertCircle className="h-4 w-4 !text-red-800" />
                      <AlertTitle className="!text-red-800">Warning: Invoice Already Exists</AlertTitle>
                      <AlertDescription className="!text-red-400">
                        This job card has an invoice (#{jobCard.invoice.invoice_no}).
                        Changes to items will NOT update the existing invoice.
                        Consider creating a supplementary invoice if needed.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Alert className="w-full">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Invoice has been generated. To modify items, cancel the existing invoice first.
                    </AlertDescription>
                  </Alert>
                </>
              )}
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
              <EmployeeAssignmentForm jobCard={jobCard} />
              {jobCard.type === 'insurance' ? (
                <CreateInsuranceForm
                  jobCardId={jobCard.id}
                  jobCardNo={jobCard.job_card_no}
                  grandTotal={calculateGrandTotal()}
                  hasInsurance={!!jobCard.insurance}
                  insuranceId={jobCard.insurance?.id}
                />
              ) : (
                <CreateInvoiceForm
                  jobCardId={jobCard.id}
                  jobCardNo={jobCard.job_card_no}
                  grandTotal={calculateGrandTotal()}
                  hasInvoice={!!jobCard.invoice}
                  invoiceId={jobCard.invoice?.id}
                />
              )}
            </div>
          </div>

          {/* Services, Products & Charges Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        className={`p-3 rounded-lg border ${service.is_included
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

            {/* Products Card */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                {existingProducts.length > 0 ? (
                  <div className="space-y-3">
                    {existingProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 rounded-lg border bg-white"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="font-medium text-sm">
                              {product.stock.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {product.quantity} × Rs. {product.unit_price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-gray-600">
                            Subtotal: Rs. {product.subtotal.toLocaleString()}
                          </span>
                          <span className="font-semibold">
                            Rs. {product.total.toLocaleString()}
                          </span>
                        </div>
                        {product.discount_type && product.discount_value > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            Discount: {product.discount_type === 'percentage'
                              ? `${product.discount_value}%`
                              : `Rs. ${product.discount_value}`}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="pt-3 border-t mt-3">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Products Total:</span>
                        <span>Rs. {calculateProductsTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <p>No products added yet</p>
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
          {(existingServices.length > 0 || existingCharges.length > 0 || existingProducts.length > 0) && (
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