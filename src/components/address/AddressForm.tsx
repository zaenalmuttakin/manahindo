'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Schema for address form validation
const addressSchema = z.object({
  receiverName: z.string().min(1, "Receiver name is required"),
  phone: z.string().min(1, "Phone number is required"),
  street: z.string().min(1, "Street address is required"),
  landmark: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface IAddress {
  _id: string;
  receiverName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface AddressFormProps {
  customerId: string;
  onSaveSuccess: (newAddress: IAddress) => void; // Callback after successful save
  onBack: () => void; // Callback to go back to the address list
}

const AddressForm: React.FC<AddressFormProps> = ({ customerId, onSaveSuccess, onBack }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const onSubmit = async (data: AddressFormData) => {
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, customerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save address');
      }

      const newAddress: IAddress = await response.json();
      toast.success('Address saved successfully!');
      reset();
      onSaveSuccess(newAddress);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <Button type="button" variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft />
        </Button>
        <h3 className="text-lg font-semibold">Add New Address</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="receiverName">Receiver Name</Label>
          <Input id="receiverName" {...register("receiverName")} />
          {errors.receiverName && <p className="text-sm text-red-500">{errors.receiverName.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="street">Street Address</Label>
        <Textarea id="street" {...register("street")} />
        {errors.street && <p className="text-sm text-red-500">{errors.street.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="landmark">Landmark (Optional)</Label>
        <Input id="landmark" {...register("landmark")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="city">City / Regency</Label>
          <Input id="city" {...register("city")} />
          {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="state">State / Province</Label>
          <Input id="state" {...register("state")} />
          {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register("country")} />
          {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input id="postalCode" {...register("postalCode")} />
          {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Address'}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
