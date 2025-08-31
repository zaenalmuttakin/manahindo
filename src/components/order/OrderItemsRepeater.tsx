'use client';

import { useFieldArray, Controller, Control, UseFormRegister, FieldErrors, useWatch } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ProductSelect from "../product/ProductSelect";
import ProductGallery from "../product/ProductGallery";
import { Plus, Trash2, GalleryHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OrderFormData } from './CreateOrderForm'; // Import the main form type

interface OrderItemsRepeaterProps {
  control: Control<OrderFormData>;
  register: UseFormRegister<OrderFormData>;
  errors: FieldErrors<OrderFormData>;
}

const OrderItemsRepeater: React.FC<OrderItemsRepeaterProps> = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "orderItems",
  });

  const watchedItems = useWatch({ control, name: "orderItems" });

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {fields.map((item, index) => {
          const selectedProduct = watchedItems?.[index]?.product;
          const productError = errors.orderItems?.[index]?.product?.message;
          const qtyError = errors.orderItems?.[index]?.qty?.message;

          return (
            <motion.div
              key={item.id}
              className="p-4 border rounded-lg space-y-4 relative bg-muted/20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -300, transition: { duration: 0.3 } }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Select */}
                <div className="flex flex-col gap-1.5">
                  <Label>Product</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-grow">
                      <Controller
                        name={`orderItems.${index}.product`}
                        control={control}
                        rules={{ required: 'Product is required' }}
                        render={({ field }) => <ProductSelect value={field.value || undefined} onChange={field.onChange} />}
                      />
                    </div>
                    <ProductGallery
                      productId={selectedProduct?.value}
                      triggerButton={
                        <Button type="button" variant="outline" size="icon" disabled={!selectedProduct}>
                          <GalleryHorizontal className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                  {productError && <p className="text-sm text-red-500">{String(productError)}</p>}
                </div>

                {/* Color Input */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`color-${index}`}>Color</Label>
                  <Input id={`color-${index}`} {...register(`orderItems.${index}.color`)} placeholder="e.g., Blue, Red" />
                </div>
              </div>

              {/* Note Textarea */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`note-${index}`}>Note (Optional)</Label>
                <Textarea id={`note-${index}`} {...register(`orderItems.${index}.note`)} placeholder="Special instructions for this item..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quantity Input */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`qty-${index}`}>Quantity</Label>
                  <Input id={`qty-${index}`} type="number" {...register(`orderItems.${index}.qty`)} placeholder="1" />
                  {qtyError && <p className="text-sm text-red-500">{String(qtyError)}</p>}
                </div>

                {/* Discount Input */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`discount-${index}`}>Discount (%)</Label>
                  <Input id={`discount-${index}`} type="number" {...register(`orderItems.${index}.discount`)} placeholder="0" />
                </div>

                {/* File Upload Placeholder */}
                <div className="flex flex-col gap-1.5">
                  <Label>Files (Optional)</Label>
                  <div className="p-4 border-2 border-dashed rounded-md text-center text-muted-foreground h-full flex items-center justify-center">
                    <p className="text-xs">Upload coming soon</p>
                  </div>
                </div>
              </div>

              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-7 h-7"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          )}
        )}
      </AnimatePresence>

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ product: null, color: '', note: '', qty: 1, discount: 0 })}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
};

export default OrderItemsRepeater;