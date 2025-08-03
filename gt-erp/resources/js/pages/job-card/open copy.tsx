import React, { useState, useCallback, useEffect } from 'react';
import { Head } from "@inertiajs/react";
import { Search, Plus, ChevronRight, ChevronLeft, Eye, FileText, Printer } from 'lucide-react';
import {
  customers,
  vehicles,
  oilBrands,
  oils,
  oilFilters,
  drainPlugSeals,
  services,
  searchCustomers,
  searchVehicles,
  getOilsByBrand,
  getCustomerById,
  getVehicleById,
  getOilBrandById,
  getOilById,
  getOilFilterById,
  getDrainPlugSealById,
  formatCurrency,
  Customer,
  Vehicle,
  OilBrand,
  Oil,
  OilFilter,
  DrainPlugSeal,
  Service,
  ServiceOption
} from '@/lib/db';

interface JobCardData {
  customer?: Customer;
  vehicle?: Vehicle;
  oilBrand?: OilBrand;
  oil?: Oil;
  oilFilter?: OilFilter;
  drainPlugSeal?: DrainPlugSeal;
  services: Array<{
    service: Service;
    option?: ServiceOption;
    ignored: boolean;
  }>;
}

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

  // Search results
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [vehicleResults, setVehicleResults] = useState<Vehicle[]>([]);

  const handleCustomerSearch = useCallback((value: string) => {
    setCustomerSearch(value);
    if (value.length >= 2) {
      const results = searchCustomers(value);
      setCustomerResults(results);
      setShowCustomerOptions(true);
    } else {
      setShowCustomerOptions(false);
    }
  }, []);

  const handleVehicleSearch = useCallback((value: string) => {
    setVehicleSearch(value);
    if (value.length >= 2) {
      const results = searchVehicles(value);
      setVehicleResults(results);
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
    setVehicleSearch(`${vehicle.vehicle_number} - ${vehicle.make} ${vehicle.model}`);
    setShowVehicleOptions(false);
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
      case 3: return jobCardData.oilBrand;
      case 4: return jobCardData.oil;
      case 5: return jobCardData.oilFilter;
      case 6: return jobCardData.drainPlugSeal;
      case 7: return true;
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

  const handlePrintInvoice = () => {
    // Navigate to invoice page
    window.open('/dashboard/job-card/invoice', '_blank');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Select Customer</h2>
            <div className="relative">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter customer mobile number or name..."
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => window.open('/customer/create', '_blank')}
                  className="px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 text-lg font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
              
              {showCustomerOptions && customerResults.length > 0 && (
                <div className="absolute top-full left-0 right-16 bg-white border-2 border-gray-300 rounded-lg mt-2 shadow-lg z-10">
                  {customerResults.map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className="w-full px-4 py-4 text-left hover:bg-gray-100 border-b last:border-b-0 text-lg"
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-gray-600">{customer.mobile}</div>
                      <div className="text-sm text-gray-500">{customer.address}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Select Vehicle</h2>
            <div className="relative">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter vehicle number..."
                    value={vehicleSearch}
                    onChange={(e) => handleVehicleSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => window.open('/vehicle/create', '_blank')}
                  className="px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 text-lg font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>
              
              {showVehicleOptions && vehicleResults.length > 0 && (
                <div className="absolute top-full left-0 right-16 bg-white border-2 border-gray-300 rounded-lg mt-2 shadow-lg z-10">
                  {vehicleResults.map(vehicle => (
                    <button
                      key={vehicle.id}
                      onClick={() => selectVehicle(vehicle)}
                      className="w-full px-4 py-4 text-left hover:bg-gray-100 border-b last:border-b-0 text-lg"
                    >
                      <div className="font-medium">{vehicle.vehicle_number}</div>
                      <div className="text-gray-600">{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                      <div className="text-sm text-gray-500">{vehicle.engine_capacity}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Select Oil Brand</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {oilBrands.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => selectOilBrand(brand)}
                  className={`p-6 rounded-lg border-2 text-lg font-medium transition-all ${
                    jobCardData.oilBrand?.id === brand.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        const availableOils = jobCardData.oilBrand ? getOilsByBrand(jobCardData.oilBrand.id) : [];
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Select Oil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOils.map(oil => (
                <button
                  key={oil.id}
                  onClick={() => selectOil(oil)}
                  className={`p-6 rounded-lg border-2 text-left transition-all ${
                    jobCardData.oil?.id === oil.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-medium">{oil.name}</div>
                  <div className="text-xl font-bold text-green-600 mt-2">{formatCurrency(oil.price)}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Select Oil Filter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {oilFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => selectOilFilter(filter)}
                  className={`p-6 rounded-lg border-2 text-left transition-all ${
                    jobCardData.oilFilter?.id === filter.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-medium">{filter.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{filter.vehicle_compatibility}</div>
                  <div className="text-xl font-bold text-green-600 mt-2">{formatCurrency(filter.price)}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Select Drain Plug Seal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drainPlugSeals.map(seal => (
                <button
                  key={seal.id}
                  onClick={() => selectDrainPlugSeal(seal)}
                  className={`p-6 rounded-lg border-2 text-left transition-all ${
                    jobCardData.drainPlugSeal?.id === seal.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-medium">{seal.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{seal.vehicle_compatibility}</div>
                  <div className="text-xl font-bold text-green-600 mt-2">{formatCurrency(seal.price)}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Customize Services</h2>
            <div className="space-y-4">
              {jobCardData.services.map(({ service, option, ignored }) => (
                <div
                  key={service.id}
                  className={`p-6 rounded-lg border-2 ${
                    ignored ? 'border-red-200 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-medium ${ignored ? 'text-red-600' : 'text-gray-800'}`}>
                      {service.name}
                    </h3>
                    <button
                      onClick={() => updateService(service.id, undefined, !ignored)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        ignored
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {ignored ? 'Include' : 'Ignore'}
                    </button>
                  </div>
                  
                  {!ignored && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {service.options.map(serviceOption => (
                        <button
                          key={serviceOption.id}
                          onClick={() => updateService(service.id, serviceOption.id)}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            option?.id === serviceOption.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium">{serviceOption.name}</div>
                          <div className="text-sm font-bold text-green-600 mt-1">
                            {formatCurrency(serviceOption.price)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSummaryPanel = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Job Card Summary</h3>
      
      <div className="space-y-4">
        {jobCardData.customer && (
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-600 mb-2">Customer</h4>
            <div className="text-lg font-medium">{jobCardData.customer.name}</div>
            <div className="text-gray-600">{jobCardData.customer.mobile}</div>
          </div>
        )}

        {jobCardData.vehicle && (
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-600 mb-2">Vehicle</h4>
            <div className="text-lg font-medium">{jobCardData.vehicle.vehicle_number}</div>
            <div className="text-gray-600">{jobCardData.vehicle.make} {jobCardData.vehicle.model}</div>
          </div>
        )}

        {jobCardData.oilBrand && (
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-600 mb-2">Oil Brand</h4>
            <div className="text-lg font-medium">{jobCardData.oilBrand.name}</div>
          </div>
        )}

        {jobCardData.oil && (
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-600 mb-2">Oil</h4>
            <div className="text-lg font-medium">{jobCardData.oil.name}</div>
            <div className="text-green-600 font-bold">{formatCurrency(jobCardData.oil.price)}</div>
          </div>
        )}

        {jobCardData.oilFilter && (
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-600 mb-2">Oil Filter</h4>
            <div className="text-lg font-medium">{jobCardData.oilFilter.name}</div>
            <div className="text-green-600 font-bold">{formatCurrency(jobCardData.oilFilter.price)}</div>
          </div>
        )}

        {jobCardData.drainPlugSeal && (
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-600 mb-2">Drain Plug Seal</h4>
            <div className="text-lg font-medium">{jobCardData.drainPlugSeal.name}</div>
            <div className="text-green-600 font-bold">{formatCurrency(jobCardData.drainPlugSeal.price)}</div>
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={() => setShowServiceModal(true)}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 mb-4"
          >
            <Eye className="w-5 h-5" />
            View Services
          </button>

          <div className="text-xl font-bold text-gray-800 border-t pt-4">
            Total: {formatCurrency(getTotalAmount())}
          </div>

          {currentStep === 7 && (
            <div className="space-y-3 mt-6">
              <button
                onClick={handlePrintInvoice}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                View Invoice
              </button>
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print Invoice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ServiceModal = () => {
    if (!showServiceModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Selected Services</h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {jobCardData.services
                .filter(({ ignored }) => !ignored)
                .map(({ service, option }) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-lg font-medium">{service.name}</h4>
                        {option && (
                          <div className="text-gray-600">{option.name}</div>
                        )}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {option ? formatCurrency(option.price) : formatCurrency(service.base_price)}
                      </div>
                    </div>
                  </div>
                ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Services Total:</span>
                  <span className="text-green-600">
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
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Open Job Card</h1>
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <span className="bg-blue-500 text-white px-2 py-1 rounded">Step {currentStep} of 7</span>
              <span className="ml-2">
                {currentStep === 1 && 'Customer Selection'}
                {currentStep === 2 && 'Vehicle Selection'}
                {currentStep === 3 && 'Oil Brand Selection'}
                {currentStep === 4 && 'Oil Selection'}
                {currentStep === 5 && 'Oil Filter Selection'}
                {currentStep === 6 && 'Drain Plug Seal Selection'}
                {currentStep === 7 && 'Service Customization'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6 min-h-[600px]">
                {renderStepContent()}
                
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <button
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                  
                  <button
                    onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
                    disabled={!canProceedToNext() || currentStep === 7}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
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