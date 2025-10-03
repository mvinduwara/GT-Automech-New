import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { useCallback, useState, useEffect } from 'react';
import { Plus, Search, User, Car, Gauge } from 'lucide-react';
import { searchCustomers, searchVehicles } from './actions';

// Types
interface Customer {
  id: number;
  name: string;
  mobile: string;
  address: string;
  title: string;
}

interface Vehicle {
  id: number;
  vehicle_no: string;
  make_year: number;
  model: {
    id: number;
    name: string;
  };
  brand: {
    id: number;
    name: string;
  };
}

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  vehicle_brand_id: number;
}

interface PageProps {
  brands: Brand[];
  models: Model[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Job card',
    href: '/dashboard/job-card',
  },
  {
    title: 'New Job card',
    href: '/dashboard/job-card/create',
  },
];

export default function Create() {
  const { brands, models } = usePage<PageProps>().props;
  
  // Main form data
  const { data, setData, post, processing, errors } = useForm({
    customer_id: '',
    vehicle_id: '',
    mileage: '',
  });

  // Search states
  const [customerSearch, setCustomerSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [vehicleResults, setVehicleResults] = useState<Vehicle[]>([]);
  const [showCustomerOptions, setShowCustomerOptions] = useState(false);
  const [showVehicleOptions, setShowVehicleOptions] = useState(false);
console.log("customerResults", customerResults);
  console.log("vehicleResults", vehicleResults);
  // Selected items for display
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Dialog states
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);

  // Customer form for dialog
  const { data: customerData, setData: setCustomerData, post: postCustomer, processing: customerProcessing, errors: customerErrors, reset: resetCustomer } = useForm({
    title: '',
    name: '',
    mobile: '',
    address: '',
  });

  // Vehicle form for dialog
  const { data: vehicleData, setData: setVehicleData, post: postVehicle, processing: vehicleProcessing, errors: vehicleErrors, reset: resetVehicle } = useForm({
    vehicle_no: '',
    vehicle_brand_id: '',
    vehicle_model_id: '',
    make_year: '',
  });

  // Customer search handler
  const handleCustomerSearch = useCallback(async (value: string) => {
      console.log("handleCustomerSearch")
    setCustomerSearch(value);
    
    if (value.length >= 3) {
      const results = await searchCustomers(value);
      console.log("results",results)
      setCustomerResults(results.data || []);
      setShowCustomerOptions(true);
    } else {
      setShowCustomerOptions(false);
    }
  }, []);

  // Vehicle search handler
  const handleVehicleSearch = useCallback(async (value: string) => {
    setVehicleSearch(value);
    
    if (value.length >= 3) {
      const results = await searchVehicles(value);
      setVehicleResults(results.data || []);
      setShowVehicleOptions(true);
    } else {
      setShowVehicleOptions(false);
    }
  }, []);

  // Select customer
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setData('customer_id', customer.id.toString());
    setCustomerSearch(`${customer.name} - ${customer.mobile}`);
    setShowCustomerOptions(false);
  };

  // Select vehicle
  const selectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setData('vehicle_id', vehicle.id.toString());
    setVehicleSearch(`${vehicle.vehicle_no} - ${vehicle.make_year} ${vehicle.model.name}`);
    setShowVehicleOptions(false);
  };

  // Create customer
  const createCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    postCustomer('/dashboard/customer/store', {
      onSuccess: (response: any) => {
        toast.success('Customer created successfully!');
        // Select the newly created customer
        const newCustomer = response.props.customer; // Assuming the response includes the customer data
        if (newCustomer) {
          selectCustomer(newCustomer);
        }
        setShowCustomerDialog(false);
        resetCustomer();
      },
      onError: () => {
        toast.error('Failed to create customer. Please check the form for errors.');
      },
    });
  };

  // Create vehicle
  const createVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    postVehicle('/dashboard/vehicle/store', {
      onSuccess: (response: any) => {
        toast.success('Vehicle created successfully!');
        // Select the newly created vehicle
        const newVehicle = response.props.vehicle; // Assuming the response includes the vehicle data
        if (newVehicle) {
          selectVehicle(newVehicle);
        }
        setShowVehicleDialog(false);
        resetVehicle();
      },
      onError: () => {
        toast.error('Failed to create vehicle. Please check the form for errors.');
      },
    });
  };

  // Submit job card
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/dashboard/job-card/store', {
      onSuccess: () => {
        toast.success('Job card created successfully!');
      },
      onError: () => {
        toast.error('Failed to create job card. Please check the form for errors.');
      },
    });
  };

  // Filter models based on selected brand for vehicle creation
  const filteredModels = models.filter(model => 
    String(model.vehicle_brand_id) === vehicleData.vehicle_brand_id
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add New Job Card" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Create New Job Card</h1>
        </div>

        <form onSubmit={submit} className="max-w-4xl space-y-6">
          {/* Customer Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Customer Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="customer">Customer</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 relative">
                    <Input
                      id="customer"
                      type="text"
                      placeholder="Search customer by mobile number or name..."
                      value={customerSearch}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  
                  <AlertDialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Add New Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                          Create a new customer and select them for this job card.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      
                      <form onSubmit={createCustomer} className="space-y-4">
                        <div>
                          <Label htmlFor="customer-title">Title</Label>
                          <Select onValueChange={(value) => setCustomerData('title', value)} value={customerData.title}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a title" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mr">Mr</SelectItem>
                              <SelectItem value="Mrs">Mrs</SelectItem>
                              <SelectItem value="Ms">Ms</SelectItem>
                              <SelectItem value="Ven">Ven</SelectItem>
                              <SelectItem value="Dr">Dr</SelectItem>
                              <SelectItem value="Prof">Prof</SelectItem>
                            </SelectContent>
                          </Select>
                          {customerErrors.title && <p className="text-sm text-red-500 mt-1">{customerErrors.title}</p>}
                        </div>

                        <div>
                          <Label htmlFor="customer-name">Name</Label>
                          <Input
                            id="customer-name"
                            type="text"
                            value={customerData.name}
                            onChange={(e) => setCustomerData('name', e.target.value)}
                            placeholder="Customer Name"
                          />
                          {customerErrors.name && <p className="text-sm text-red-500 mt-1">{customerErrors.name}</p>}
                        </div>

                        <div>
                          <Label htmlFor="customer-mobile">Mobile</Label>
                          <Input
                            id="customer-mobile"
                            type="text"
                            value={customerData.mobile}
                            onChange={(e) => setCustomerData('mobile', e.target.value)}
                            placeholder="Mobile Number"
                          />
                          {customerErrors.mobile && <p className="text-sm text-red-500 mt-1">{customerErrors.mobile}</p>}
                        </div>

                        <div>
                          <Label htmlFor="customer-address">Address</Label>
                          <Textarea
                            id="customer-address"
                            value={customerData.address}
                            onChange={(e) => setCustomerData('address', e.target.value)}
                            placeholder="Customer Address"
                          />
                          {customerErrors.address && <p className="text-sm text-red-500 mt-1">{customerErrors.address}</p>}
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                          <AlertDialogAction type="submit" disabled={customerProcessing}>
                            {customerProcessing ? 'Creating...' : 'Create Customer'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </form>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {showCustomerOptions && customerResults.length > 0 && (
                  <div className="absolute top-full left-0 right-16 bg-white border rounded-md mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                    {customerResults.map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 focus:bg-blue-50 focus:outline-none"
                      >
                        <div className="font-semibold">{customer.title} {customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.mobile}</div>
                        <div className="text-xs text-gray-500">{customer.address}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedCustomer && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="font-semibold text-green-800">Selected Customer:</div>
                  <div className="text-green-700">{selectedCustomer.title} {selectedCustomer.name}</div>
                  <div className="text-sm text-green-600">{selectedCustomer.mobile}</div>
                </div>
              )}
              
              {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold">Vehicle Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="vehicle">Vehicle</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 relative">
                    <Input
                      id="vehicle"
                      type="text"
                      placeholder="Search vehicle by number..."
                      value={vehicleSearch}
                      onChange={(e) => handleVehicleSearch(e.target.value)}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  
                  <AlertDialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Add New Vehicle</AlertDialogTitle>
                        <AlertDialogDescription>
                          Create a new vehicle and select it for this job card.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      
                      <form onSubmit={createVehicle} className="space-y-4">
                        <div>
                          <Label htmlFor="vehicle-no">Vehicle Number</Label>
                          <Input
                            id="vehicle-no"
                            type="text"
                            value={vehicleData.vehicle_no}
                            onChange={(e) => setVehicleData('vehicle_no', e.target.value)}
                            placeholder="Vehicle Number"
                          />
                          {vehicleErrors.vehicle_no && <p className="text-sm text-red-500 mt-1">{vehicleErrors.vehicle_no}</p>}
                        </div>

                        <div>
                          <Label htmlFor="vehicle-brand">Brand</Label>
                          <Select
                            value={vehicleData.vehicle_brand_id}
                            onValueChange={(value) => {
                              setVehicleData('vehicle_brand_id', value);
                              setVehicleData('vehicle_model_id', ''); // Reset model when brand changes
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a brand" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map((brand) => (
                                <SelectItem key={brand.id} value={String(brand.id)}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {vehicleErrors.vehicle_brand_id && <p className="text-sm text-red-500 mt-1">{vehicleErrors.vehicle_brand_id}</p>}
                        </div>

                        <div>
                          <Label htmlFor="vehicle-model">Model</Label>
                          <Select
                            value={vehicleData.vehicle_model_id}
                            onValueChange={(value) => setVehicleData('vehicle_model_id', value)}
                            disabled={!vehicleData.vehicle_brand_id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredModels.map((model) => (
                                <SelectItem key={model.id} value={String(model.id)}>
                                  {model.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {vehicleErrors.vehicle_model_id && <p className="text-sm text-red-500 mt-1">{vehicleErrors.vehicle_model_id}</p>}
                        </div>

                        <div>
                          <Label htmlFor="vehicle-year">Make Year</Label>
                          <Input
                            id="vehicle-year"
                            type="number"
                            value={vehicleData.make_year}
                            onChange={(e) => setVehicleData('make_year', e.target.value)}
                            placeholder="Make Year"
                          />
                          {vehicleErrors.make_year && <p className="text-sm text-red-500 mt-1">{vehicleErrors.make_year}</p>}
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                          <AlertDialogAction type="submit" disabled={vehicleProcessing}>
                            {vehicleProcessing ? 'Creating...' : 'Create Vehicle'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </form>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {showVehicleOptions && vehicleResults.length > 0 && (
                  <div className="absolute top-full left-0 right-16 bg-white border rounded-md mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                    {vehicleResults.map(vehicle => (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => selectVehicle(vehicle)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 focus:bg-blue-50 focus:outline-none"
                      >
                        <div className="font-semibold">{vehicle.vehicle_no}</div>
                        <div className="text-sm text-gray-600">{vehicle.make_year} {vehicle.model.name}</div>
                        <div className="text-xs text-gray-500">Brand: {vehicle.brand.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedVehicle && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="font-semibold text-green-800">Selected Vehicle:</div>
                  <div className="text-green-700">{selectedVehicle.vehicle_no}</div>
                  <div className="text-sm text-green-600">{selectedVehicle.make_year} {selectedVehicle.model.name}</div>
                </div>
              )}
              
              {errors.vehicle_id && <p className="text-sm text-red-500">{errors.vehicle_id}</p>}
            </div>
          </div>

          {/* Mileage */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold">Vehicle Mileage</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="mileage">Current Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={data.mileage}
                  onChange={(e) => setData('mileage', e.target.value)}
                  placeholder="Enter current odometer reading"
                  min="0"
                  step="1"
                  className="mt-1"
                />
                {errors.mileage && <p className="text-sm text-red-500 mt-1">{errors.mileage}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" disabled={processing} className="px-8">
              {processing ? 'Creating Job Card...' : 'Create Job Card'}
            </Button>
            <Button variant="outline" type="button" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}