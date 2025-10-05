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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Trash2, Plus } from "lucide-react";

type VehicleServiceOption = {
  id: number;
  name: string;
  price: number;
};

type VehicleService = {
  id: number;
  name: string;
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
};

type ServiceFormData = {
  vehicle_service_id: number | null;
  vehicle_service_option_id: number | null;
  is_included: boolean;
  discount_type: 'percentage' | 'amount' | null;
  discount_value: number;
};

type JobCardServiceFormProps = {
  jobCardId: number;
  vehicleServices: VehicleService[];
  existingServices: ExistingService[];
};

function JobCardServiceForm({ 
  jobCardId, 
  vehicleServices, 
  existingServices 
}: JobCardServiceFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [services, setServices] = useState<ServiceFormData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadExistingServices();
    }
  }, [isOpen]);

  const loadExistingServices = () => {
    if (existingServices && existingServices.length > 0) {
      const mappedServices = existingServices.map(service => ({
        vehicle_service_id: service.vehicle_service_id,
        vehicle_service_option_id: service.vehicle_service_option_id,
        is_included: service.is_included,
        discount_type: service.discount_type,
        discount_value: service.discount_value,
      }));
      setServices(mappedServices);
    } else {
      setServices([getEmptyService()]);
    }
  };

  const getEmptyService = (): ServiceFormData => ({
    vehicle_service_id: null,
    vehicle_service_option_id: null,
    is_included: true,
    discount_type: null,
    discount_value: 0,
  });

  const addService = () => {
    setServices([...services, getEmptyService()]);
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices.length > 0 ? newServices : [getEmptyService()]);
  };

  const updateService = (index: number, field: keyof ServiceFormData, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };

    if (field === 'vehicle_service_id') {
      newServices[index].vehicle_service_option_id = null;
    }

    setServices(newServices);
  };

  const getAvailableOptions = (serviceId: number | null): VehicleServiceOption[] => {
    if (!serviceId) return [];
    const service = vehicleServices.find(s => s.id === serviceId);
    return service?.options || [];
  };

  const calculateServiceTotal = (service: ServiceFormData): number => {
    if (!service.vehicle_service_option_id) return 0;

    const option = vehicleServices
      .find(s => s.id === service.vehicle_service_id)
      ?.options.find(o => o.id === service.vehicle_service_option_id);

    if (!option) return 0;

    const subtotal = option.price;
    
    if (!service.discount_type || service.discount_value === 0) {
      return subtotal;
    }

    if (service.discount_type === 'percentage') {
      return Math.round(subtotal - (subtotal * service.discount_value / 100));
    }
    
    return Math.max(0, subtotal - service.discount_value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validServices = services.filter(
      s => s.vehicle_service_id && s.vehicle_service_option_id
    );

    if (validServices.length === 0) {
      alert('Please add at least one valid service');
      return;
    }

    setLoading(true);

    router.post(
      route('dashboard.job-card.services.store', jobCardId),
      { services: validServices },
      {
        onSuccess: () => {
          setIsOpen(false);
          setServices([getEmptyService()]);
        },
        onError: (errors) => {
          console.error('Failed to save services:', errors);
          alert('Failed to save services. Please check the form and try again.');
        },
        onFinish: () => {
          setLoading(false);
        }
      }
    );
  };

  const handleCancel = () => {
    setServices([getEmptyService()]);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadExistingServices();
    }
  };

  const getTotalAmount = (): number => {
    return services
      .filter(s => s.is_included && s.vehicle_service_option_id)
      .reduce((sum, service) => sum + calculateServiceTotal(service), 0);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          Manage Services
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>Job Card Services</AlertDialogTitle>
            <AlertDialogDescription>
              Add or modify services for Job Card #{jobCardId}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            {services.map((service, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Service {index + 1}</h4>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={service.is_included ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateService(index, 'is_included', !service.is_included)}
                    >
                      {service.is_included ? 'Included' : 'Excluded'}
                    </Button>
                    {services.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Select
                      value={service.vehicle_service_id?.toString() || ''}
                      onValueChange={(value) => 
                        updateService(index, 'vehicle_service_id', parseInt(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleServices.map((vs) => (
                          <SelectItem key={vs.id} value={vs.id.toString()}>
                            {vs.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Service Option</Label>
                    <Select
                      value={service.vehicle_service_option_id?.toString() || ''}
                      onValueChange={(value) => 
                        updateService(index, 'vehicle_service_option_id', parseInt(value))
                      }
                      disabled={!service.vehicle_service_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableOptions(service.vehicle_service_id).map((option) => (
                          <SelectItem key={option.id} value={option.id.toString()}>
                            {option.name} - Rs. {option.price.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select
                      value={service.discount_type || 'none'}
                      onValueChange={(value) => 
                        updateService(
                          index, 
                          'discount_type', 
                          value === 'none' ? null : value
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No discount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Discount</SelectItem>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="amount">Amount (Rs.)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={service.discount_value}
                      onChange={(e) => 
                        updateService(index, 'discount_value', parseFloat(e.target.value) || 0)
                      }
                      disabled={!service.discount_type}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {service.vehicle_service_option_id && (
                  <div className="flex justify-end items-center pt-2 border-t">
                    <span className="text-sm font-medium">
                      Total: Rs. {calculateServiceTotal(service).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addService}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Service
            </Button>

            <div className="flex justify-between items-center pt-4 border-t-2">
              <span className="text-lg font-semibold">Grand Total:</span>
              <span className="text-lg font-bold">
                Rs. {getTotalAmount().toLocaleString()}
              </span>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              type="button"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Services'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default JobCardServiceForm;