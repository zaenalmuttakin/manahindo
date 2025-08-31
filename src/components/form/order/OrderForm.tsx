'use client';

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Form data structure
type FormData = {
  customer_name: string;
  order_date: Date;
  death_line: Date;
  products: {
    product_name: string;
    color: string;
    qty: number;
    note: string;
  }[];
};

interface OrderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function OrderForm({ onSuccess, onCancel }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      customer_name: '',
      order_date: new Date(),
      death_line: new Date(),
      products: [{ product_name: '', color: '', qty: 1, note: '' }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      console.log("Form data:", data);
      // Implementasi API call untuk menyimpan data pesanan
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      
      // if (!response.ok) throw new Error('Gagal menyimpan pesanan');
      
      toast.success("Pesanan berhasil disimpan!");
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Gagal menyimpan pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Pesanan Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customer_name">Nama Pelanggan</Label>
            <Controller
              name="customer_name"
              control={control}
              rules={{ required: "Nama pelanggan harus diisi" }}
              render={({ field }) => (
                <Input
                  id="customer_name"
                  placeholder="Masukkan nama pelanggan"
                  {...field}
                  className={cn(errors.customer_name && "border-destructive")}
                />
              )}
            />
            {errors.customer_name && (
              <p className="text-sm text-destructive">{errors.customer_name.message}</p>
            )}
          </div>

          {/* Order Date */}
          <div className="space-y-2">
            <Label htmlFor="order_date">Tanggal Pesanan</Label>
            <Controller
              name="order_date"
              control={control}
              rules={{ required: "Tanggal pesanan harus diisi" }}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                        errors.order_date && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.order_date && (
              <p className="text-sm text-destructive">{errors.order_date.message}</p>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="death_line">Deadline</Label>
            <Controller
              name="death_line"
              control={control}
              rules={{ required: "Deadline harus diisi" }}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                        errors.death_line && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : "Pilih deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.death_line && (
              <p className="text-sm text-destructive">{errors.death_line.message}</p>
            )}
          </div>

          {/* Products Repeater */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Produk</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ product_name: '', color: '', qty: 1, note: '' })}
              >
                <Plus className="h-4 w-4 mr-1" /> Tambah Produk
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`products.${index}.product_name`}>Nama Produk</Label>
                    <Controller
                      name={`products.${index}.product_name`}
                      control={control}
                      rules={{ required: "Nama produk harus diisi" }}
                      render={({ field }) => (
                        <Input
                          id={`products.${index}.product_name`}
                          placeholder="Masukkan nama produk"
                          {...field}
                          className={cn(
                            errors.products?.[index]?.product_name && "border-destructive"
                          )}
                        />
                      )}
                    />
                    {errors.products?.[index]?.product_name && (
                      <p className="text-sm text-destructive">
                        {errors.products[index]?.product_name?.message}
                      </p>
                    )}
                  </div>

                  {/* Color */}
                  <div className="space-y-2">
                    <Label htmlFor={`products.${index}.color`}>Warna</Label>
                    <Controller
                      name={`products.${index}.color`}
                      control={control}
                      rules={{ required: "Warna harus diisi" }}
                      render={({ field }) => (
                        <Input
                          id={`products.${index}.color`}
                          placeholder="Masukkan warna"
                          {...field}
                          className={cn(
                            errors.products?.[index]?.color && "border-destructive"
                          )}
                        />
                      )}
                    />
                    {errors.products?.[index]?.color && (
                      <p className="text-sm text-destructive">
                        {errors.products[index]?.color?.message}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor={`products.${index}.qty`}>Jumlah</Label>
                    <Controller
                      name={`products.${index}.qty`}
                      control={control}
                      rules={{ 
                        required: "Jumlah harus diisi",
                        min: { value: 1, message: "Jumlah minimal 1" }
                      }}
                      render={({ field }) => (
                        <Input
                          id={`products.${index}.qty`}
                          type="number"
                          min={1}
                          placeholder="Masukkan jumlah"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                          className={cn(
                            errors.products?.[index]?.qty && "border-destructive"
                          )}
                        />
                      )}
                    />
                    {errors.products?.[index]?.qty && (
                      <p className="text-sm text-destructive">
                        {errors.products[index]?.qty?.message}
                      </p>
                    )}
                  </div>

                  {/* Note */}
                  <div className="space-y-2">
                    <Label htmlFor={`products.${index}.note`}>Catatan</Label>
                    <Controller
                      name={`products.${index}.note`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          id={`products.${index}.note`}
                          placeholder="Masukkan catatan (opsional)"
                          {...field}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Remove Product Button */}
                {fields.length > 1 && (
                  <div className="flex justify-end mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Hapus
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Batal
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Pesanan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}