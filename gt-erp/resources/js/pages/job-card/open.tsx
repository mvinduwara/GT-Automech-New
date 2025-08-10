import { Button } from '@/components/ui/button';
import {
  Customer,
  DrainPlugSeal,
  Oil,
  OilBrand,
  OilFilter,
  Service,
  ServiceOption,
  Vehicle
} from '@/types/types';
import {
  drainPlugSeals,
  formatCurrency,
  getOilsByBrand,
  oilBrands,
  oilFilters,
  services,
} from '@/lib/db';
import { Head } from "@inertiajs/react";
import { ChevronLeft, ChevronRight, DollarSign, Eye, FileText, Gauge, Plus } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { searchCustomers, searchVehicles } from './actions';

interface JobCardData {
  customer?: Customer;
  vehicle?: Vehicle;
  mileage?: number;
  oilBrand?: OilBrand;
  oil?: Oil;
  oilFilter?: OilFilter;
  drainPlugSeal?: DrainPlugSeal;
  services: Array<{
    service: Service;
    option?: ServiceOption;
    ignored: boolean;
  }>;
  advancePayment?: number;
}

interface SelectionButtonProps {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const SelectionButton: React.FC<SelectionButtonProps> = ({
  isSelected,
  onClick,
  children,
  className = ''
}) => {
  const getSelectedStyles = () => {
    return 'bg-primary/15 shadow-violet-200 text-slate-800';
    // return 'border-violet-400 bg-gradient-to-r from-violet-200 to-pink-200 shadow-violet-200 text-slate-800';
  };

  const getUnselectedStyles = () => {
    return 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600';
  };

  return (
    <button
      onClick={onClick}
      className={`!w-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 !p-6 rounded-2xl border-2 text-left ${isSelected ? getSelectedStyles() : getUnselectedStyles()
        } ${className}`}
    >
      {children}
    </button>
  );
};

export default function Open() {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobCardData, setJobCardData] = useState<JobCardData>({
    services: services.map(service => ({
      service,
      option: service.options[0],
      ignored: false
    }))
  });

  // Search states
  const [customerSearch, setCustomerSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showCustomerOptions, setShowCustomerOptions] = useState(false);
  const [showVehicleOptions, setShowVehicleOptions] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // New states for mileage and advance payment
  const [mileageInput, setMileageInput] = useState('');
  const [advancePaymentInput, setAdvancePaymentInput] = useState('');

  // Search results
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [vehicleResults, setVehicleResults] = useState<Vehicle[]>([]);

  // const handleCustomerSearch = useCallback((value: string) => {
  //   setCustomerSearch(value);
  //   if (value.length >= 2) {
  //     const results = searchCustomers(value);
  //     setCustomerResults(results);
  //     setShowCustomerOptions(true);
  //   } else {
  //     setShowCustomerOptions(false);
  //   }
  // }, []);

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
console.log("vehicleResults",vehicleResults)
  // const handleVehicleSearch = useCallback((value: string) => {
  //   setVehicleSearch(value);
  //   if (value.length >= 2) {
  //     const results = searchVehicles(value);
  //     setVehicleResults(results);
  //     setShowVehicleOptions(true);
  //   } else {
  //     setShowVehicleOptions(false);
  //   }
  // }, []);

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

  const handleMileageUpdate = () => {
    const mileage = parseInt(mileageInput);
    if (mileage && mileage > 0) {
      setJobCardData(prev => ({ ...prev, mileage }));
    }
  };

  const handleAdvancePaymentUpdate = () => {
    const advancePayment = parseFloat(advancePaymentInput);
    if (advancePayment >= 0) {
      setJobCardData(prev => ({ ...prev, advancePayment }));
    }
  };

  const selectOilBrand = (brand: OilBrand) => {
    setJobCardData(prev => ({ ...prev, oilBrand: brand, oil: undefined }));
  };

  const selectOil = (oil: Oil) => {
    setJobCardData(prev => ({ ...prev, oil }));
  };

  const selectOilFilter = (filter: OilFilter) => {
    setJobCardData(prev => ({ ...prev, oilFilter: filter }));
  };

  const selectDrainPlugSeal = (seal: DrainPlugSeal) => {
    setJobCardData(prev => ({ ...prev, drainPlugSeal: seal }));
  };

  const updateService = (serviceId: number, optionId?: number, ignored?: boolean) => {
    setJobCardData(prev => ({
      ...prev,
      services: prev.services.map(item => {
        if (item.service.id === serviceId) {
          const newOption = optionId ? item.service.options.find(opt => opt.id === optionId) : item.option;
          return {
            ...item,
            option: newOption,
            ignored: ignored !== undefined ? ignored : item.ignored
          };
        }
        return item;
      })
    }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return jobCardData.customer;
      case 2: return jobCardData.vehicle;
      case 3: return jobCardData.mileage && jobCardData.mileage > 0;
      case 4: return jobCardData.oilBrand;
      case 5: return jobCardData.oil;
      case 6: return jobCardData.oilFilter;
      case 7: return jobCardData.drainPlugSeal;
      case 8: return true;
      case 9: return true; // Advance payment is optional
      default: return false;
    }
  };

  const getTotalAmount = () => {
    let total = 0;
    if (jobCardData.oil) total += jobCardData.oil.price;
    if (jobCardData.oilFilter) total += jobCardData.oilFilter.price;
    if (jobCardData.drainPlugSeal) total += jobCardData.drainPlugSeal.price;

    jobCardData.services.forEach(item => {
      if (!item.ignored && item.option) {
        total += item.option.price;
      }
    });

    return total;
  };

  const getRemainingAmount = () => {
    const total = getTotalAmount();
    const advance = jobCardData.advancePayment || 0;
    return total - advance;
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
                <button disabled
                  onClick={() => window.open('/customer/create', '_blank')}
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
                <button disabled
                  onClick={() => window.open('/vehicle/create', '_blank')}
                  className="px-8 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-200 flex items-center gap-3 text-lg font-medium shadow-lg"
                // className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-3 text-lg font-medium shadow-lg"
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
                  onChange={(e) => setMileageInput(e.target.value)}
                  onBlur={handleMileageUpdate}
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
                      Current Mileage: {jobCardData.mileage.toLocaleString()} km
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Select Oil Brand
              </h2>
              <p className="text-slate-600 text-lg">Choose your preferred oil brand</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {oilBrands.map(brand => (
                <SelectionButton
                  key={brand.id}
                  isSelected={jobCardData.oilBrand?.id === brand.id}
                  onClick={() => selectOilBrand(brand)}
                  className="h-32 rounded-2xl text-lg font-semibold"
                >
                  {brand.name}
                </SelectionButton>
              ))}
            </div>
          </div>
        );

      case 5:
        const availableOils = jobCardData.oilBrand ? getOilsByBrand(jobCardData.oilBrand.id) : [];
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Select Oil
              </h2>
              <p className="text-slate-600 text-lg">Choose the right oil for your vehicle</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {availableOils.map(oil => (
                <SelectionButton
                  key={oil.id}
                  isSelected={jobCardData.oil?.id === oil.id}
                  onClick={() => selectOil(oil)}
                  className="h-40 p-6 rounded-2xl border-2 text-left"
                >
                  <div className="h-full flex flex-col justify-between">
                    <div className="text-lg font-semibold text-slate-800">{oil.name}</div>
                    <div className="text-2xl font-bold text-emerald-600">{formatCurrency(oil.price)}</div>
                  </div>
                </SelectionButton>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Select Oil Filter
              </h2>
              <p className="text-slate-600 text-lg">Choose the appropriate oil filter</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {oilFilters.map(filter => (
                <SelectionButton
                  key={filter.id}
                  isSelected={jobCardData.oilFilter?.id === filter.id}
                  onClick={() => selectOilFilter(filter)}
                  className="h-44"
                >
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <div className="text-lg font-semibold text-slate-800 mb-2">{filter.name}</div>
                      <div className="text-sm text-slate-600">{filter.vehicle_compatibility}</div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{formatCurrency(filter.price)}</div>
                  </div>
                </SelectionButton>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Select Drain Plug Seal
              </h2>
              <p className="text-slate-600 text-lg">Choose the right drain plug seal</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {drainPlugSeals.map(seal => (
                <SelectionButton
                  key={seal.id}
                  isSelected={jobCardData.drainPlugSeal?.id === seal.id}
                  onClick={() => selectDrainPlugSeal(seal)}
                  className="h-44"
                >
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <div className="text-lg font-semibold text-slate-800 mb-2">{seal.name}</div>
                      <div className="text-sm text-slate-600">{seal.vehicle_compatibility}</div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{formatCurrency(seal.price)}</div>
                  </div>
                </SelectionButton>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Customize Services
              </h2>
              <p className="text-slate-600 text-lg">Select and customize your services</p>
            </div>
            <div className="space-y-6 max-w-4xl mx-auto">
              {jobCardData.services.map(({ service, option, ignored }) => (
                <div
                  key={service.id}
                  className={`p-8 rounded-2xl border-2 transition-all duration-300 shadow-lg ${ignored
                    ? 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'
                    : 'border-slate-200 bg-white'
                    }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-semibold ${ignored ? 'text-red-700' : 'text-slate-800'}`}>
                      {service.name}
                    </h3>
                    <Button
                      onClick={() => updateService(service.id, undefined, !ignored)}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${ignored
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg'
                        : 'bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-800 shadow-lg'
                        }`}
                    >
                      {ignored ? 'Include Service' : 'Ignore Service'}
                    </Button>
                  </div>

                  {!ignored && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {service.options.map(serviceOption => (
                        <SelectionButton
                          key={serviceOption.id}
                          isSelected={option?.id === serviceOption.id}
                          onClick={() => updateService(service.id, serviceOption.id)}
                          className="p-5 rounded-xl border-2 text-left"
                        >
                          <div className="font-semibold text-lg mb-2 text-slate-800">{serviceOption.name}</div>
                          <div className="text-lg font-bold text-emerald-600">
                            {formatCurrency(serviceOption.price)}
                          </div>
                        </SelectionButton>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Advance Payment
              </h2>
              <p className="text-slate-600 text-lg">Optional: Add advance payment or skip to pay later</p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border border-slate-200 mb-8">
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-slate-800 mb-2">Total Amount</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                    {formatCurrency(getTotalAmount())}
                  </div>
                </div>

                <div className="relative mb-6">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                  <input
                    type="number"
                    placeholder="Enter advance payment (optional)"
                    value={advancePaymentInput}
                    onChange={(e) => setAdvancePaymentInput(e.target.value)}
                    onBlur={handleAdvancePaymentUpdate}
                    className="w-full pl-14 pr-6 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm"
                    min="0"
                    max={getTotalAmount()}
                    step="0.01"
                  />
                </div>

                {jobCardData.advancePayment !== undefined && jobCardData.advancePayment > 0 && (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="text-sm text-emerald-600 font-semibold">Advance Payment</div>
                      <div className="text-xl font-bold text-emerald-700">
                        {formatCurrency(jobCardData.advancePayment)}
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <div className="text-sm text-orange-600 font-semibold">Remaining Amount</div>
                      <div className="text-xl font-bold text-orange-700">
                        {formatCurrency(getRemainingAmount())}
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center mt-6">
                  <p className="text-slate-500 text-sm">
                    You can skip this step and collect payment upon completion
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
            <div className="text-slate-600">{jobCardData.vehicle.make_year} {jobCardData.vehicle.model.name}</div>
            {jobCardData.mileage && (
              <div className="text-sm text-slate-500 mt-1">Mileage: {jobCardData.mileage.toLocaleString()} km</div>
            )}
          </div>
        )}

        {jobCardData.oilBrand && (
          <div className="border-b border-slate-200 pb-6">
            <h4 className="font-semibold text-slate-600 mb-3 text-sm uppercase tracking-wider">Oil Brand</h4>
            <div className="text-lg font-semibold text-slate-800">{jobCardData.oilBrand.name}</div>
          </div>
        )}

        {jobCardData.oil && (
          <div className="border-b border-slate-200 pb-6">
            <h4 className="font-semibold text-slate-600 mb-3 text-sm uppercase tracking-wider">Oil</h4>
            <div className="text-lg font-semibold text-slate-800">{jobCardData.oil.name}</div>
            <div className="text-emerald-600 font-bold text-xl">{formatCurrency(jobCardData.oil.price)}</div>
          </div>
        )}

        {jobCardData.oilFilter && (
          <div className="border-b border-slate-200 pb-6">
            <h4 className="font-semibold text-slate-600 mb-3 text-sm uppercase tracking-wider">Oil Filter</h4>
            <div className="text-lg font-semibold text-slate-800">{jobCardData.oilFilter.name}</div>
            <div className="text-emerald-600 font-bold text-xl">{formatCurrency(jobCardData.oilFilter.price)}</div>
          </div>
        )}

        {jobCardData.drainPlugSeal && (
          <div className="border-b border-slate-200 pb-6">
            <h4 className="font-semibold text-slate-600 mb-3 text-sm uppercase tracking-wider">Drain Plug Seal</h4>
            <div className="text-lg font-semibold text-slate-800">{jobCardData.drainPlugSeal.name}</div>
            <div className="text-emerald-600 font-bold text-xl">{formatCurrency(jobCardData.drainPlugSeal.price)}</div>
          </div>
        )}

        <div className="pt-6">
          <Button variant={'secondary'}
            onClick={() => setShowServiceModal(true)}
          >
            <Eye className="w-5 h-5" />
            View Services
          </Button>

          <div className="text-3xl font-bold text-slate-800 border-t border-slate-200 pt-6">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              Total: {formatCurrency(getTotalAmount())}
            </div>
          </div>

          {jobCardData.advancePayment !== undefined && jobCardData.advancePayment > 0 && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-sm text-emerald-600 font-semibold">Advance Paid</div>
              <div className="text-lg font-bold text-emerald-700">{formatCurrency(jobCardData.advancePayment)}</div>
              <div className="text-sm text-orange-600 mt-1">
                Remaining: {formatCurrency(getRemainingAmount())}
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div className="mt-8">
              <Button
                onClick={() => window.open('/dashboard/job-card/invoice', '_blank')}
                className="w-full px-6 py-4 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl hover:from-violet-600 hover:to-violet-700 transition-all duration-200 flex items-center justify-center gap-3 text-lg font-semibold shadow-lg"
              >
                <FileText className="w-5 h-5" />
                View Invoice
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ServiceModal = () => {
    if (!showServiceModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Selected Services
              </h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-slate-400 hover:text-slate-600 text-3xl font-light transition-colors duration-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {jobCardData.services
                .filter(({ ignored }) => !ignored)
                .map(({ service, option }) => (
                  <div key={service.id} className="border border-slate-200 rounded-xl p-6 bg-gradient-to-r from-slate-50 to-slate-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-semibold text-slate-800">{service.name}</h4>
                        {option && (
                          <div className="text-slate-600 text-lg mt-1">{option.name}</div>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {option ? formatCurrency(option.price) : formatCurrency(service.base_price)}
                      </div>
                    </div>
                  </div>
                ))}

              <div className="border-t border-slate-300 pt-6 mt-8">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span className="text-slate-800">Services Total:</span>
                  <span className="text-emerald-600">
                    {formatCurrency(
                      jobCardData.services
                        .filter(({ ignored }) => !ignored)
                        .reduce((total, { option, service }) => {
                          return total + (option ? option.price : service.base_price);
                        }, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                Step {currentStep} of 9
              </span>
              <span className="ml-4 text-slate-600 font-medium">
                {currentStep === 1 && 'Customer Selection'}
                {currentStep === 2 && 'Vehicle Selection'}
                {currentStep === 3 && 'Vehicle Mileage'}
                {currentStep === 4 && 'Oil Brand Selection'}
                {currentStep === 5 && 'Oil Selection'}
                {currentStep === 6 && 'Oil Filter Selection'}
                {currentStep === 7 && 'Drain Plug Seal Selection'}
                {currentStep === 8 && 'Service Customization'}
                {currentStep === 9 && 'Advance Payment'}
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
                    onClick={() => setCurrentStep(Math.min(9, currentStep + 1))}
                    disabled={!canProceedToNext() || currentStep === 9}
                  >
                    {currentStep === 8 ? 'Next: Payment' : currentStep === 9 ? 'Complete' : 'Next'}
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

      <ServiceModal />
    </div>
  );
}