"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type FormData = {
  store: string;
  date: Date;
  items: {
    name: string;
    qty: number | undefined;
    price: number | undefined;
  }[];
};

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export default function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const { register, control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      store: "",
      date: new Date(),
      items: [{ name: "", qty: undefined, price: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    // Hitung total
    const total = data.items.reduce(
      (sum, item) => sum + (item.qty || 0) * (item.price || 0),
      0
    );
    const expenseData = { ...data, total };

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      if (res.ok) {
        // Reset form
        reset();

        // Panggil callback jika ada
        if (onSuccess) {
          onSuccess();
        }

        alert("Data berhasil disimpan!");
      } else {
        const errorData = await res.json();
        alert(`Terjadi kesalahan: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Data Belanja</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2 w-full">
            <div className="flex flex-col gap-2">
              <Label htmlFor="store">Nama Toko</Label>
              <Input
                id="store"
                {...register("store", { required: "Nama toko harus diisi" })}
                placeholder="Nama toko"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Tanggal</Label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "dd MMMM yyyy")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
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
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Daftar Belanja</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex space-x-2 items-end mt-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full">
                  <Input
                    placeholder="Nama barang"
                    {...register(`items.${index}.name` as const, {
                      required: "Nama barang harus diisi",
                    })}
                  />
                  <Input
                    type="number"
                    placeholder="Jumlah"
                    min="1"
                    {...register(`items.${index}.qty` as const, {
                      valueAsNumber: true,
                      required: "Jumlah harus diisi",
                      min: { value: 0, message: "Jumlah minimal 1" },
                    })}
                  />
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-muted-foreground sm:text-sm">
                        Rp
                      </span>
                    </div>
                    <Controller
                      control={control}
                      name={`items.${index}.price`}
                      rules={{ required: "Harga harus diisi" }}
                      render={({ field }) => (
                        <Input
                          type="text"
                          placeholder="Harga"
                          inputMode="numeric"
                          className="pl-9"
                          onBlur={field.onBlur}
                          ref={field.ref}
                          value={
                            field.value === undefined
                              ? ""
                              : new Intl.NumberFormat("id-ID").format(
                                  field.value
                                )
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(
                              value === "" ? undefined : Number(value)
                            );
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={() => append({ name: "", qty: undefined, price: undefined })}
            >
              <Plus className="h-4 w-4 mr-2" /> Tambah Barang
            </Button>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
