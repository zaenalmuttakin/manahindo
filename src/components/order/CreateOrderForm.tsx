'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import CustomerSelect from '@/components/customer/CustomerSelect';
import AddressModal from '@/components/address/AddressModal';
import OrderItemsRepeater from '@/components/order/OrderItemsRepeater';
import { AutocompleteOption } from '@/components/ui/autocomplete';

// Manual type definition, removing Zod for now to resolve TS conflicts.
export interface OrderItemData {
  product: AutocompleteOption | null;
  color?: string;
  note?: string;
  qty: number;
  discount: number;
}

export interface OrderFormData {
  orderDate: Date;
  deadline: Date;
  customer: AutocompleteOption | null;
  addressId: string | null;
  orderItems: OrderItemData[];
}

export default function CreateOrderForm() {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    // resolver: zodResolver(orderFormSchema), // Zod resolver removed
    defaultValues: {
      orderDate: new Date(),
      deadline: new Date(),
      customer: null,
      addressId: null,
      orderItems: [{ product: null, color: '', note: '', qty: 1, discount: 0 }],
    },
  });

  const selectedCustomer = watch('customer');
  const selectedAddressId = watch('addressId');

  const onSubmit = async (data: OrderFormData) => {
    toast.info("Submitting order...");
    try {
      const payload = {
        ...data,
        customerId: data.customer?.value,
        orderItems: data.orderItems.map(item => ({
          productId: item.product?.value,
          productName: item.product?.label,
          color: item.color,
          note: item.note,
          qty: item.qty,
          discount: item.discount,
          files: [], // Placeholder for now
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      toast.success("Order created successfully!");
      // Optionally reset the form or redirect
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Select */}
            <div className="flex flex-col gap-2">
              <Label>Customer</Label>
              <Controller
                name="customer"
                control={control}
                render={({ field }) => <CustomerSelect value={field.value || undefined} onChange={(option) => {
                  field.onChange(option);
                  setValue('addressId', null);
                }} />}
              />
              {errors.customer && <p className="text-sm text-red-500">{errors.customer.message}</p>}
            </div>

            {/* Order Date */}
            <div className="flex flex-col gap-2">
              <Label>Order Date</Label>
              <Controller
                name="orderDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.orderDate && <p className="text-sm text-red-500">{errors.orderDate.message}</p>}
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-2">
              <Label>Deadline</Label>
              <Controller
                name="deadline"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.deadline && <p className="text-sm text-red-500">{errors.deadline.message}</p>}
            </div>
          </div>

          {/* Address Section */}
          {selectedCustomer && (
            <div className="pt-6 border-t">
              <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
              <AddressModal 
                customerId={selectedCustomer.value}
                selectedAddressId={selectedAddressId ?? undefined}
                onSelectAddress={(id) => setValue('addressId', id, { shouldValidate: true })}
              />
              {errors.addressId && <p className="text-sm text-red-500 mt-2">{errors.addressId.message}</p>}
            </div>
          )}

          {/* Order Items Repeater */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-medium mb-2">Order Items</h3>
            <OrderItemsRepeater control={control} register={register} errors={errors} />
            {errors.orderItems && <p className="text-sm text-red-500 mt-2">{errors.orderItems.message}</p>}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Create Order'}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
