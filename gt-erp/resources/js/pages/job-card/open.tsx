import { Button } from '@/components/ui/button';
import {
  Customer,
  Vehicle
} from '@/types/types';

import { Head, router } from "@inertiajs/react";
import { ChevronLeft, ChevronRight, Gauge, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { searchCustomers, searchVehicles } from './actions';

interface JobCardData {
  customer?: Customer;
  vehicle?: Vehicle;
  mileage?: number;
}

export default function Open() {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobCardData, setJobCardData] = useState<JobCardData>({});

  const [customerSearch, setCustomerSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showCustomerOptions, setShowCustomerOptions] = useState(false);
  const [showVehicleOptions, setShowVehicleOptions] = useState(false);

  const [mileageInput, setMileageInput] = useState('');

  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [vehicleResults, setVehicleResults] = useState<Vehicle[]>([]);

  const handleCustomerSearch = useCallback(async (value: string) => {
    setCustomerSearch(value);

    if (value.length >= 3) {
      const results = await searchCustomers(value);
      console.log("results", results)
      setCustomerResults(results?.data);
      setShowCustomerOptions(true);
    } else {
      setShowCustomerOptions(false);
    }
  }, []);

  const handleVehicleSearch = useCallback(async (value: string) => {
    setVehicleSearch(value);

    if (value.length >= 3) {
      const results = await searchVehicles(value);
      console.log("searchVehicles results", results)
      setVehicleResults(results?.data);
      setShowVehicleOptions(true);
    } else {
      setShowVehicleOptions(false);
    }
  }, []);

  const selectCustomer = (customer: Customer) => {
    setJobCardData(prev => ({ ...prev, customer }));
    setCustomerSearch(`${customer.name} - ${customer.mobile}`);
    setShowCustomerOptions(false);
  };

  const selectVehicle = (vehicle: Vehicle) => {
    setJobCardData(prev => ({ ...prev, vehicle }));
    setVehicleSearch(`${vehicle.vehicle_no} - ${vehicle.make_year} ${vehicle.model?.name}`);
    setShowVehicleOptions(false);
  };

  const createJobCard = () => {
    console.log("Creating Job Card");

    if (!jobCardData.customer || !jobCardData.vehicle || !jobCardData.mileage) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      customer_id: jobCardData.customer.id,
      vehicle_id: jobCardData.vehicle.id,
      mileage: jobCardData.mileage,
    };

    console.log("Creating Job Card with payload:", payload);

    router.post("/dashboard/job-card/store", payload, {
      onSuccess: (page) => {
        console.log("dashboard/job-card/store", page)
        const flashData = page.props.flash;

        if (flashData?.success) {
          toast.success(flashData?.success);
        }

        if (flashData?.job_card_id) {
          console.log("Job Card ID:", flashData?.job_card_id);
          setJobCardId(flashData?.job_card_id);
        }
      },
      onError: (errors) => {
        console.error("Validation errors:", errors);
        toast.error("Failed to create Job Card");
      },
      onFinish: () => {
        console.log("Request finished");
      }
    });
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return !!jobCardData.customer;
      case 2: return !!jobCardData.vehicle;
      case 3: return mileageInput.trim() !== '' && parseInt(mileageInput) > 0;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Select Customer
              </h2>
              <p className="text-slate-600 text-lg">Search by mobile number or name</p>
            </div>
            <div className="relative max-w-2xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Enter customer mobile number or name..."
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                  />
                </div>
                {/* <CustomerCreateDialog /> */}
                <button
                  onClick={() => window.open('/dashboard/customer/create', '_blank')}
                  className="px-8 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 flex items-center gap-3 text-lg font-medium shadow-lg"
                // className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-3 text-lg font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add Customer
                </button>
              </div>
              {showCustomerOptions && customerResults.length > 0 && (
                <div className="absolute top-full left-0 right-20 bg-white border-2 border-slate-200 rounded-xl mt-3 shadow-2xl z-10 overflow-hidden">
                  <div className="w-full flex flex-col">
                    {customerResults.map(customer => (
                      <button
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className="!w-full px-6 py-4 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-b last:border-b-0 border-slate-100 text-lg transition-all duration-200"
                      >
                        <div className="font-semibold text-slate-800">{customer.name}</div>
                        <div className="text-slate-600">{customer.mobile}</div>
                        <div className="text-sm text-slate-500 mt-1">{customer.address}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Select Vehicle
              </h2>
              <p className="text-slate-600 text-lg">Search by vehicle number</p>
            </div>
            <div className="relative max-w-2xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Enter vehicle number..."
                    value={vehicleSearch}
                    onChange={(e) => handleVehicleSearch(e.target.value)}
                    className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                  />
                </div>
                <button
                  onClick={() => window.open('/dashboard/vehicle/create', '_blank')}
                  className="px-8 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 flex items-center gap-3 text-lg font-medium shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add Vehicle
                </button>
              </div>

              {showVehicleOptions && vehicleResults.length > 0 && (
                <div className="absolute top-full left-0 right-20 bg-white border-2 border-slate-200 rounded-xl mt-3 shadow-2xl z-10 overflow-hidden">
                  <div className="flex flex-col">
                    {vehicleResults.map(vehicle => (
                      <button
                        key={vehicle.id}
                        onClick={() => selectVehicle(vehicle)}
                        className="!w-full px-6 py-4 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-b last:border-b-0 border-slate-100 text-lg transition-all duration-200"
                      >
                        <div className="font-semibold text-slate-800">{vehicle.vehicle_no}</div>
                        <div className="text-slate-600">{vehicle.make_year} {vehicle.model?.name} ({vehicle.make_year})</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Enter Vehicle Mileage
              </h2>
              <p className="text-slate-600 text-lg">Current odometer reading</p>
            </div>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Gauge className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                <input
                  type="number"
                  placeholder="Enter mileage (km)"
                  value={mileageInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMileageInput(value);
                    const num = parseInt(value);
                    if (!isNaN(num) && num > 0) {
                      setJobCardData(prev => ({ ...prev, mileage: num }));
                    }
                  }}
                  className="w-full pl-14 pr-6 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                  min="0"
                  step="1"
                />
              </div>
              <div className="text-center mt-6">
                <p className="text-slate-500 text-sm">Enter the current mileage shown on the odometer</p>
                {jobCardData.mileage && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-emerald-700 font-semibold">
                      Current Mileage: {jobCardData.mileage} km
                      {/* Current Mileage: {jobCardData.mileage.toLocaleString()} km */}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

    }
  };

  const renderSummaryPanel = () => (
    <div className=" rounded-2xl shadow-xl p-8 h-fit backdrop-blur-sm bg-white/95 border border-slate-200">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-8">
        Job Card Summary
      </h3>

      <div className="space-y-6">
        {jobCardData.customer && (
          <div className="border-b border-slate-200 pb-6">
            <h4 className="font-semibold text-slate-600 mb-3 text-sm uppercase tracking-wider">Customer</h4>
            <div className="text-lg font-semibold text-slate-800">{jobCardData.customer.name}</div>
            <div className="text-slate-600">{jobCardData.customer.mobile}</div>
          </div>
        )}

        {jobCardData.vehicle && (
          <div className="border-b border-slate-200 pb-6">
            <h4 className="font-semibold text-slate-600 mb-3 text-sm uppercase tracking-wider">Vehicle</h4>
            <div className="text-lg font-semibold text-slate-800">{jobCardData.vehicle.vehicle_no}</div>
            <div className="text-slate-600">{jobCardData.vehicle.make_year} {jobCardData.vehicle.model?.name}</div>
            {jobCardData.mileage && (
              <div className="text-sm text-slate-500 mt-1">Mileage: {jobCardData.mileage} km</div>
              // <div className="text-sm text-slate-500 mt-1">Mileage: {jobCardData.mileage.toLocaleString()} km</div>
            )}
          </div>
        )}

      </div>
    </div>
  );

  return (
    <div>
      <Head title="Open Job Card" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Open Job Card
            </h1>
            <div className="flex items-center mt-4 text-lg">
              <span className="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow-lg">
                Step {currentStep} of 3
              </span>
              <span className="ml-4 text-slate-600 font-medium">
                {currentStep === 1 && 'Customer Selection'}
                {currentStep === 2 && 'Vehicle Selection'}
                {currentStep === 3 && 'Vehicle Mileage'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 min-h-[600px] border border-slate-200">
                {renderStepContent()}

                <div className="flex justify-between mt-12 pt-8 border-t border-slate-200">
                  <Button
                    variant={'ghost'}
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </Button>

                  <Button
                    onClick={() => {
                      if (currentStep === 3) {
                        createJobCard();
                      } else {
                        setCurrentStep((prev) => Math.min(3, prev + 1));
                      }
                    }}
                    disabled={!canProceedToNext()}
                  >
                    {currentStep === 3 ? 'Create Job Card' : 'Next'}
                    <ChevronRight className="w-5 h-5" />
                  </Button>

                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              {renderSummaryPanel()}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}