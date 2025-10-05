import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Save, FileText, X, Package, Wrench, Shield, Gift } from 'lucide-react';

// Dummy Data
const CUSTOMERS = [
  { id: 1, name: 'John Doe', mobile: '0771234567', address: '123 Main St, Colombo' },
  { id: 2, name: 'Jane Smith', mobile: '0779876543', address: '456 Galle Rd, Kalutara' },
  { id: 3, name: 'Bob Wilson', mobile: '0763456789', address: '789 Kandy Rd, Kaduwela' },
];

const VEHICLES = [
  { id: 1, customer_id: 1, vehicle_no: 'CAB-1234', brand: 'Toyota', model: 'Corolla', year: 2020 },
  { id: 2, customer_id: 1, vehicle_no: 'CAB-5678', brand: 'Honda', model: 'Civic', year: 2019 },
  { id: 3, customer_id: 2, vehicle_no: 'WP-9012', brand: 'Nissan', model: 'March', year: 2021 },
  { id: 4, customer_id: 3, vehicle_no: 'KY-3456', brand: 'Suzuki', model: 'Swift', year: 2022 },
];

const PRODUCTS = [
  { id: 1, name: 'Engine Oil 5W-30', part_number: 'EO-5W30', stock: 45, price: 2500.00, category: 'Oils' },
  { id: 2, name: 'Brake Pads Front', part_number: 'BP-F01', stock: 12, price: 4500.00, category: 'Brakes' },
  { id: 3, name: 'Air Filter', part_number: 'AF-001', stock: 28, price: 850.00, category: 'Filters' },
  { id: 4, name: 'Spark Plugs Set', part_number: 'SP-SET4', stock: 8, price: 3200.00, category: 'Ignition' },
  { id: 5, name: 'Side Mirror Left', part_number: 'SM-L01', stock: 5, price: 6500.00, category: 'Body Parts' },
  { id: 6, name: 'Coolant 1L', part_number: 'CL-1L', stock: 32, price: 950.00, category: 'Fluids' },
];

// Service Packages (like in the image)
const SERVICE_PACKAGES = [
  {
    id: 1,
    name: 'Toyota 0w20 4L Full Service',
    items: ['0w20 4L Oil', 'Oil filter', 'Drain plug seal'],
    price: 15300.00,
    brand: 'Toyota'
  },
  {
    id: 2,
    name: 'Toyota 5w30 4L Full Service',
    items: ['5w30 4L Oil', 'Oil filter', 'Drain plug seal'],
    price: 14560.00,
    brand: 'Toyota'
  },
  {
    id: 3,
    name: 'Mobile 5w30 4L Full Service',
    items: ['5w30 4L Oil', 'Oil filter', 'Drain plug seal'],
    price: 13400.00,
    brand: 'Mobile'
  },
  {
    id: 4,
    name: 'Castrol 0w20 3L Full Service',
    items: ['0w20 3L Oil', 'Oil filter', 'Drain plug seal'],
    price: 12150.00,
    brand: 'Castrol'
  },
  {
    id: 5,
    name: 'Suzuki Green 2 Full Service',
    items: ['Green 2 Oil', 'Oil Filter', 'Oil Change'],
    price: 28750.00,
    brand: 'Suzuki'
  },
];

// Mandatory Services with Options (VehicleService model)
const VEHICLE_SERVICES = [
  {
    id: 1,
    name: 'Body Wash',
    is_mandatory: true,
    options: [
      { id: 1, name: 'Basic Wash', price: 800.00 },
      { id: 2, name: 'Premium Wash', price: 1000.00 },
      { id: 3, name: 'Deluxe Wash & Wax', price: 1500.00 },
    ]
  },
  {
    id: 2,
    name: 'Engine Tune-up',
    is_mandatory: true,
    options: [
      { id: 4, name: 'Basic Tune-up', price: 2500.00 },
      { id: 5, name: 'Complete Tune-up', price: 4000.00 },
    ]
  },
  {
    id: 3,
    name: 'Wheel Alignment',
    is_mandatory: false,
    options: [
      { id: 6, name: 'Front Alignment', price: 1500.00 },
      { id: 7, name: '4-Wheel Alignment', price: 2500.00 },
    ]
  },
];

// Other custom services
const SERVICES = [
  { id: 101, name: 'Labor Charge', price: 0, type: 'custom' },
  { id: 102, name: 'Inspection', price: 2000.00, type: 'service' },
  { id: 103, name: 'Diagnosis', price: 1500.00, type: 'service' },
];

const JobCardPOS = () => {
  const [step, setStep] = useState(1);
  const [jobCardType, setJobCardType] = useState('general');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [mileage, setMileage] = useState('');
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [customPrice, setCustomPrice] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
  
  // For mandatory services in service jobcard
  const [mandatoryServices, setMandatoryServices] = useState({});
  const [showMandatoryModal, setShowMandatoryModal] = useState(false);

  // Filter vehicles by selected customer
  const customerVehicles = useMemo(() => {
    if (!selectedCustomer) return [];
    return VEHICLES.filter(v => v.customer_id === selectedCustomer.id);
  }, [selectedCustomer]);

  // Filter products/services by search
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.part_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredServicePackages = useMemo(() => {
    return SERVICE_PACKAGES.filter(sp => 
      sp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sp.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredVehicleServices = useMemo(() => {
    return VEHICLE_SERVICES.filter(vs => 
      vs.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredServices = useMemo(() => {
    return SERVICES.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Calculate totals with discount types
  const calculateLineTotal = (item) => {
    const baseTotal = item.quantity * item.unit_price;
    
    if (item.is_foc) return 0;
    
    if (item.discount_type === 'percentage') {
      const discountAmount = (baseTotal * (item.discount_value || 0)) / 100;
      return baseTotal - discountAmount;
    } else {
      return baseTotal - (item.discount_value || 0);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const discountTotal = items.reduce((sum, item) => {
    if (item.is_foc) return sum + (item.quantity * item.unit_price);
    
    if (item.discount_type === 'percentage') {
      return sum + ((item.quantity * item.unit_price * (item.discount_value || 0)) / 100);
    }
    return sum + (item.discount_value || 0);
  }, 0);
  const total = subtotal - discountTotal;

  const addProduct = (product) => {
    const existing = items.find(i => i.product_id === product.id && i.type === 'product');
    if (existing) {
      updateQuantity(existing.id, existing.quantity + 1);
    } else {
      const newItem = {
        id: Date.now(),
        product_id: product.id,
        type: 'product',
        description: product.name,
        quantity: 1,
        unit_price: product.price,
        discount_type: 'fixed',
        discount_value: 0,
        is_foc: false,
        line_total: product.price,
        stock_available: product.stock,
      };
      setItems([...items, newItem]);
    }
    setSearchTerm('');
  };

  const addServicePackage = (servicePackage) => {
    const newItem = {
      id: Date.now(),
      service_package_id: servicePackage.id,
      type: 'service_package',
      description: servicePackage.name,
      sub_items: servicePackage.items,
      quantity: 1,
      unit_price: servicePackage.price,
      discount_type: 'fixed',
      discount_value: 0,
      is_foc: false,
      line_total: servicePackage.price,
    };
    setItems([...items, newItem]);
    setSearchTerm('');
  };

  const addVehicleServiceOption = (service, option) => {
    const newItem = {
      id: Date.now(),
      vehicle_service_id: service.id,
      vehicle_service_option_id: option.id,
      type: 'vehicle_service',
      description: `${service.name} - ${option.name}`,
      is_mandatory: service.is_mandatory,
      quantity: 1,
      unit_price: option.price,
      discount_type: 'fixed',
      discount_value: 0,
      is_foc: false,
      line_total: option.price,
    };
    setItems([...items, newItem]);
    
    // Track mandatory service selection
    if (service.is_mandatory) {
      setMandatoryServices(prev => ({...prev, [service.id]: option.id}));
    }
  };

  const addService = (service, price = null, customName = null) => {
    const servicePrice = price || service.price;
    const serviceName = customName || service.name;
    const newItem = {
      id: Date.now(),
      service_id: service.id,
      type: 'service',
      description: serviceName,
      quantity: 1,
      unit_price: servicePrice,
      discount_type: 'fixed',
      discount_value: 0,
      is_foc: false,
      line_total: servicePrice,
    };
    setItems([...items, newItem]);
    setSearchTerm('');
    setCustomPrice('');
    setCustomServiceName('');
  };

  const updateQuantity = (itemId, newQty) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const qty = Math.max(1, Math.min(newQty, item.stock_available || 999));
        return { ...item, quantity: qty, line_total: calculateLineTotal({...item, quantity: qty}) };
      }
      return item;
    }));
  };

  const updateDiscount = (itemId, value, type) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          discount_value: Math.max(0, parseFloat(value) || 0),
          discount_type: type || item.discount_type
        };
        return { ...updatedItem, line_total: calculateLineTotal(updatedItem) };
      }
      return item;
    }));
  };

  const toggleFOC = (itemId) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, is_foc: !item.is_foc };
        return { ...updatedItem, line_total: calculateLineTotal(updatedItem) };
      }
      return item;
    }));
  };

  const removeItem = (itemId) => {
    const item = items.find(i => i.id === itemId);
    // Remove from mandatory tracking if it's a mandatory service
    if (item?.is_mandatory && item?.vehicle_service_id) {
      setMandatoryServices(prev => {
        const updated = {...prev};
        delete updated[item.vehicle_service_id];
        return updated;
      });
    }
    setItems(items.filter(i => i.id !== itemId));
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCustomer(null);
    setSelectedVehicle(null);
    setMileage('');
    setItems([]);
    setSearchTerm('');
    setMandatoryServices({});
  };

  const canProceed = () => {
    if (step === 1) return selectedCustomer !== null;
    if (step === 2) return selectedVehicle !== null;
    if (step === 3) return mileage !== '';
    return true;
  };

  // Check if all mandatory services are selected
  const allMandatoryServicesSelected = () => {
    const mandatoryServiceIds = VEHICLE_SERVICES.filter(vs => vs.is_mandatory).map(vs => vs.id);
    return mandatoryServiceIds.every(id => mandatoryServices[id]);
  };

  const proceedToStep4 = () => {
    if (jobCardType === 'service') {
      // Check if mandatory services are selected
      if (!allMandatoryServicesSelected()) {
        setShowMandatoryModal(true);
        return;
      }
    }
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Mandatory Services Modal */}
      {showMandatoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Select Mandatory Services</h2>
            <p className="text-sm text-gray-600 mb-4">Please select options for all mandatory services before proceeding.</p>
            
            {VEHICLE_SERVICES.filter(vs => vs.is_mandatory).map(service => (
              <div key={service.id} className="mb-4 border-b pb-4">
                <h3 className="font-semibold mb-2">{service.name} <span className="text-red-500">*</span></h3>
                <div className="space-y-2">
                  {service.options.map(option => (
                    <label key={option.id} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`service-${service.id}`}
                        checked={mandatoryServices[service.id] === option.id}
                        onChange={() => {
                          setMandatoryServices(prev => ({...prev, [service.id]: option.id}));
                        }}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{option.name}</div>
                        <div className="text-sm text-gray-600">Rs. {option.price.toFixed(2)}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  // Add selected mandatory services to items
                  VEHICLE_SERVICES.filter(vs => vs.is_mandatory).forEach(service => {
                    if (mandatoryServices[service.id]) {
                      const option = service.options.find(o => o.id === mandatoryServices[service.id]);
                      if (option && !items.find(i => i.vehicle_service_id === service.id)) {
                        addVehicleServiceOption(service, option);
                      }
                    }
                  });
                  setShowMandatoryModal(false);
                  setStep(4);
                }}
                disabled={!allMandatoryServicesSelected()}
                className={`flex-1 py-2 rounded-lg font-semibold ${
                  allMandatoryServicesSelected()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
              <button
                onClick={() => setShowMandatoryModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Job Card System</h1>
              <p className="text-sm text-gray-500">POS-Style Job Card Management</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Job Card Type Selection */}
          {step === 1 && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setJobCardType('general')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  jobCardType === 'general' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Package className="w-4 h-4" />
                General
              </button>
              <button
                onClick={() => setJobCardType('service')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  jobCardType === 'service' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Wrench className="w-4 h-4" />
                Service
              </button>
              <button
                onClick={() => setJobCardType('insurance')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  jobCardType === 'insurance' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                Insurance
              </button>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= s ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 4 && <div className={`w-12 h-1 ${step > s ? 'bg-blue-500' : 'bg-gray-300'}`} />}
              </div>
            ))}
            <div className="ml-4 text-sm font-medium text-gray-700">
              {step === 1 && 'Select Customer'}
              {step === 2 && 'Select Vehicle'}
              {step === 3 && 'Enter Mileage'}
              {step === 4 && 'Add Items'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Left Panel - Selection/Search */}
          <div className="col-span-2 bg-white rounded-lg shadow-sm p-4">
            {step === 1 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Select Customer</h2>
                <div className="space-y-2">
                  {CUSTOMERS.map(customer => (
                    <div
                      key={customer.id}
                      onClick={() => setSelectedCustomer(customer)}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedCustomer?.id === customer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="font-semibold">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.mobile}</div>
                      <div className="text-sm text-gray-500">{customer.address}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Select Vehicle</h2>
                <div className="space-y-2">
                  {customerVehicles.map(vehicle => (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedVehicle?.id === vehicle.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-lg">{vehicle.vehicle_no}</div>
                      <div className="text-sm text-gray-600">{vehicle.brand} {vehicle.model} ({vehicle.year})</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Enter Mileage</h2>
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Mileage (km)
                  </label>
                  <input
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg"
                    placeholder="Enter mileage"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="flex gap-2 mb-4 border-b overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 font-medium whitespace-nowrap ${
                      activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                    }`}
                  >
                    Products
                  </button>
                  {jobCardType === 'service' && (
                    <>
                      <button
                        onClick={() => setActiveTab('packages')}
                        className={`px-4 py-2 font-medium whitespace-nowrap ${
                          activeTab === 'packages' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                        }`}
                      >
                        Service Packages
                      </button>
                      <button
                        onClick={() => setActiveTab('vehicle-services')}
                        className={`px-4 py-2 font-medium whitespace-nowrap ${
                          activeTab === 'vehicle-services' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                        }`}
                      >
                        Vehicle Services
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 font-medium whitespace-nowrap ${
                      activeTab === 'services' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                    }`}
                  >
                    Other Services
                  </button>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                      placeholder={`Search ${activeTab}...`}
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {/* Products Tab */}
                  {activeTab === 'products' && filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => addProduct(product)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.part_number}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600">Rs. {product.price.toFixed(2)}</div>
                          <div className={`text-sm ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                            Stock: {product.stock}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Service Packages Tab */}
                  {activeTab === 'packages' && filteredServicePackages.map(pkg => (
                    <div
                      key={pkg.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold">{pkg.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Includes: {pkg.items.join(', ')}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">Brand: {pkg.brand}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">Rs. {pkg.price.toFixed(2)}</div>
                          <button
                            onClick={() => addServicePackage(pkg)}
                            className="mt-1 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                          >
                            Add Package
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Vehicle Services Tab */}
                  {activeTab === 'vehicle-services' && filteredVehicleServices.map(service => (
                    <div key={service.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-semibold mb-2 flex items-center gap-2">
                        {service.name}
                        {service.is_mandatory && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Mandatory</span>}
                      </div>
                      <div className="space-y-2">
                        {service.options.map(option => (
                          <div key={option.id} className="flex justify-between items-center pl-4 py-2 border-l-2 border-gray-300">
                            <div>
                              <div className="text-sm font-medium">{option.name}</div>
                              <div className="text-xs text-gray-500">Rs. {option.price.toFixed(2)}</div>
                            </div>
                            <button
                              onClick={() => addVehicleServiceOption(service, option)}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Other Services Tab */}
                  {activeTab === 'services' && (
                    <>
                      {/* Custom Service Entry */}
                      <div className="p-4 mb-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-sm mb-3 text-blue-900">Add Custom Service</h4>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={customServiceName}
                            onChange={(e) => setCustomServiceName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder="Service name (e.g., Wheel Repair, Labour Charge)"
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={customPrice}
                              onChange={(e) => setCustomPrice(e.target.value)}
                              className="flex-1 px-3 py-2 border rounded-lg text-sm"
                              placeholder="Price (Rs.)"
                            />
                            <button
                              onClick={() => {
                                if (customServiceName && customPrice) {
                                  addService(
                                    { id: Date.now(), name: customServiceName, price: 0, type: 'custom' },
                                    parseFloat(customPrice),
                                    customServiceName
                                  );
                                }
                              }}
                              disabled={!customServiceName || !customPrice}
                              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                                customServiceName && customPrice
                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Predefined Services */}
                      <div className="text-xs font-semibold text-gray-500 mb-2 px-1">PREDEFINED SERVICES</div>
                      {filteredServices.map(service => (
                        <div
                          key={service.id}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="font-semibold">{service.name}</div>
                              <div className="text-sm text-gray-500 capitalize">{service.type}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {service.type === 'custom' ? (
                                <>
                                  <input
                                    type="text"
                                    value={customServiceName}
                                    onChange={(e) => setCustomServiceName(e.target.value)}
                                    className="w-32 px-2 py-1 border rounded text-sm"
                                    placeholder="Service name"
                                  />
                                  <input
                                    type="number"
                                    value={customPrice}
                                    onChange={(e) => setCustomPrice(e.target.value)}
                                    className="w-24 px-2 py-1 border rounded text-sm"
                                    placeholder="Price"
                                  />
                                  <button
                                    onClick={() => {
                                      if (customServiceName && customPrice) {
                                        addService(service, parseFloat(customPrice), customServiceName);
                                      }
                                    }}
                                    disabled={!customServiceName || !customPrice}
                                    className={`px-3 py-1 rounded text-sm ${
                                      customServiceName && customPrice
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    Add
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div className="font-semibold text-blue-600">Rs. {service.price.toFixed(2)}</div>
                                  <button
                                    onClick={() => addService(service)}
                                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {step < 4 && (
              <div className="mt-6">
                <button
                  onClick={() => step === 3 ? proceedToStep4() : setStep(step + 1)}
                  disabled={!canProceed()}
                  className={`w-full py-3 rounded-lg font-semibold ${
                    canProceed()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Summary & Cart */}
          <div className="space-y-4">
            {/* Customer/Vehicle Info */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3">Job Card Info</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium capitalize">{jobCardType}</span>
                </div>
                {selectedCustomer && (
                  <div>
                    <span className="text-gray-500">Customer:</span>
                    <div className="font-medium">{selectedCustomer.name}</div>
                    <div className="text-gray-600">{selectedCustomer.mobile}</div>
                  </div>
                )}
                {selectedVehicle && (
                  <div>
                    <span className="text-gray-500">Vehicle:</span>
                    <div className="font-medium">{selectedVehicle.vehicle_no}</div>
                    <div className="text-gray-600">{selectedVehicle.brand} {selectedVehicle.model}</div>
                  </div>
                )}
                {mileage && (
                  <div>
                    <span className="text-gray-500">Mileage:</span>
                    <span className="ml-2 font-medium">{mileage} km</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Items */}
            {step === 4 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold mb-3">Items ({items.length})</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                  {items.map(item => (
                    <div key={item.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium flex-1 pr-2">
                          {item.description}
                          {item.is_mandatory && (
                            <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">Mandatory</span>
                          )}
                          {item.sub_items && (
                            <div className="text-xs text-gray-500 mt-1">
                              • {item.sub_items.join(' • ')}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Quantity */}
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border rounded text-sm"
                          min="1"
                        />
                        <span className="text-sm">× Rs. {item.unit_price.toFixed(2)}</span>
                      </div>

                      {/* Discount Controls */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={item.discount_type}
                            onChange={(e) => updateDiscount(item.id, item.discount_value, e.target.value)}
                            className="px-2 py-1 border rounded text-xs"
                            disabled={item.is_foc}
                          >
                            <option value="fixed">Fixed</option>
                            <option value="percentage">%</option>
                          </select>
                          <input
                            type="number"
                            value={item.discount_value}
                            onChange={(e) => updateDiscount(item.id, e.target.value, item.discount_type)}
                            className="flex-1 px-2 py-1 border rounded text-xs"
                            placeholder="Discount"
                            min="0"
                            disabled={item.is_foc}
                          />
                          <button
                            onClick={() => toggleFOC(item.id)}
                            className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                              item.is_foc ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            <Gift className="w-3 h-3" />
                            FOC
                          </button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="text-right mt-2 font-semibold text-sm">
                        {item.is_foc ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          <span>Rs. {item.line_total.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      No items added yet
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount/FOC:</span>
                    <span className="font-medium text-red-600">- Rs. {discountTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 space-y-2">
                  <button
                    disabled={items.length === 0}
                    className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                      items.length > 0
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Create Invoice
                  </button>
                  <button
                    disabled={items.length === 0}
                    className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                      items.length > 0
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCardPOS;