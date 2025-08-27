import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Autocomplete, AutocompleteOption } from "@/components/ui/autocomplete";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import debounce from 'lodash.debounce';
import { Expense } from "./ExpenseTable"; // Import from ExpenseTable

// Data types from backend models
interface IStore {
  _id: string;
  name: string;
}

interface IProduct {
  _id: string;
  name: string;
  price: number;
}

// New, more specific type for product autocomplete options
interface ProductAutocompleteOption extends AutocompleteOption {
  price: number;
}

// Form data structure
type FormData = {
  store: AutocompleteOption | null;
  date: Date;
  items: {
    product: ProductAutocompleteOption | AutocompleteOption | null;
    quantity: number | undefined;
    price: number | undefined;
  }[];
};

interface ExpenseFormProps {
  expense?: Expense | null;
  onSuccess?: () => void;
  onCancel?: () => void; // Add onCancel prop
}

export default function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const { control, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      store: null,
      date: new Date(),
      items: [{ product: null, quantity: undefined, price: undefined }],
    },
  });

  useEffect(() => {
    if (expense) {
      reset({
        store: { value: expense.store, label: expense.storeInfo.name },
        date: new Date(expense.date),
        items: expense.items.map(item => ({
          // Ensure productInfo exists for mapping, though it should with the aggregation
          product: { value: item.product, label: item.name, price: item.price },
          quantity: item.quantity,
          price: item.price,
        })),
      });
    } else {
      reset({
        store: null,
        date: new Date(),
        items: [{ product: null, quantity: undefined, price: undefined }],
      });
    }
  }, [expense, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [newlyAddedIndex, setNewlyAddedIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeOptions, setStoreOptions] = useState<AutocompleteOption[]>([]);
  const [productOptions, setProductOptions] = useState<Record<number, ProductAutocompleteOption[]>>({});

  const selectedStore = watch("store");

  // Debounced fetch functions
  const fetchStores = useMemo(() => debounce(async (name: string) => {
    if (!name) return;
    try {
      const res = await fetch(`/api/stores?name=${name}`);
      if (!res.ok) {
        setStoreOptions([]);
        return;
      }
      const data: IStore[] = await res.json();
      if (Array.isArray(data)) {
        setStoreOptions(data.map(s => ({ value: s._id, label: s.name })));
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStoreOptions([]);
    }
  }, 300), []);

  const fetchProducts = useMemo(() => debounce(async (name: string, storeId: string, index: number) => {
    if (!name || !storeId) return;
    try {
      const res = await fetch(`/api/products?name=${name}&storeId=${storeId}`);
      if (!res.ok) {
        setProductOptions(prev => ({ ...prev, [index]: [] }));
        return;
      }
      const data: IProduct[] = await res.json();
      if (Array.isArray(data)) {
        const options: ProductAutocompleteOption[] = data.map(p => ({ value: p._id, label: p.name, price: p.price }));
        setProductOptions(prev => ({ ...prev, [index]: options }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProductOptions(prev => ({ ...prev, [index]: [] }));
    }
  }, 300), []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    if (!data.store) {
        toast.error("Nama toko harus diisi");
        setIsSubmitting(false);
        return;
    }

    const total = data.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
      0
    );

    const expenseData = {
      // For existing stores, data.store.value is the ID. 
      // For new stores, the API handles creation based on the name string.
      store: data.store.value,
      items: data.items.map(item => ({
        // Same logic for products
        product: item.product?.value,
        name: item.product?.label,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      date: data.date,
    };

    try {
      const url = expense ? `/api/expenses?id=${expense._id}` : '/api/expenses';
      const method = expense ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });

      if (res.ok) {
        // Don't reset the form if it's an inline edit, parent will handle it
        if (!expense) {
          reset();
        }
        if (onSuccess) onSuccess();
        toast.success(`Data berhasil ${expense ? 'diperbarui' : 'disimpan'}!`);
      } else {
        const errorData = await res.json();
        toast.error(`Terjadi kesalahan: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={onCancel ? "border-none shadow-none" : ""}>
      <CardHeader>
        <CardTitle>{expense ? 'Edit' : 'Tambah'} Data Belanja</CardTitle>
        {onCancel && <p className="text-sm text-muted-foreground">Mengubah data untuk toko {expense?.storeInfo.name}.</p>}
      </CardHeader>
      <CardContent className={onCancel ? "p-0" : ""}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Nama Toko</Label>
              <Controller
                name="store"
                control={control}
                rules={{ required: "Nama toko harus diisi" }}
                render={({ field }) => (
                  <Autocomplete
                    placeholder="Ketik untuk mencari toko..."
                    emptyMessage="Toko tidak ditemukan."
                    options={storeOptions}
                    value={field.value ?? undefined}
                    onInputChange={fetchStores}
                    onChange={(option) => field.onChange(option)}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tanggal</Label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "dd MMMM yyyy") : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Daftar Belanja</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex space-x-2 items-end">
                <div className="grid grid-cols-5 gap-2 w-full">
                  <div className="col-span-2">
                    <Controller
                      name={`items.${index}.product`}
                      control={control}
                      rules={{ required: "Nama barang harus diisi" }}
                      render={({ field: productField }) => (
                        <Autocomplete
                          placeholder="Ketik nama barang..."
                          emptyMessage="Barang tidak ditemukan."
                          options={productOptions[index] || []}
                          value={productField.value ?? undefined}
                          onInputChange={(search) => {
                            if (selectedStore) {
                              fetchProducts(search, selectedStore.value, index);
                            }
                            setNewlyAddedIndex(null); // Reset focus trigger when user types
                          }}
                          onChange={(option) => {
                            productField.onChange(option);
                            // Type-safe check for price
                            if (option && 'price' in option) {
                              setValue(`items.${index}.price`, (option as ProductAutocompleteOption).price, { shouldValidate: true });
                            }
                            setNewlyAddedIndex(null); // Reset focus trigger after selection
                          }}
                          isFocused={index === newlyAddedIndex}
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-1">
                    <Controller
                      control={control}
                      name={`items.${index}.quantity`}
                      rules={{ required: "Qty harus diisi", min: { value: 0, message: "Qty tidak boleh negatif" } }}
                      render={({ field }) => (
                        <Input
                          type="number"
                          placeholder="Qty"
                          {...field}
                          onChange={(e) => {
                            const numValue = e.target.valueAsNumber;
                            if (isNaN(numValue)) {
                              field.onChange(undefined); // Treat invalid/empty input as undefined
                            } else {
                              field.onChange(Math.max(0, numValue)); // Ensure value is never negative
                            }
                          }}
                          value={field.value ?? ""}
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <Controller
                      control={control}
                      name={`items.${index}.price`}
                      rules={{ required: "Harga harus diisi" }}
                      render={({ field }) => (
                        <Input
                          type="text"
                          placeholder="Harga"
                          inputMode="numeric"
                          value={field.value === undefined ? "" : new Intl.NumberFormat("id-ID").format(field.value)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(value === "" ? undefined : Number(value));
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
                {fields.length > 1 && (
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={() => {
                const newIndex = fields.length;
                append({ product: null, quantity: undefined, price: undefined });
                setNewlyAddedIndex(newIndex);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Tambah Barang
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : expense ? "Simpan Perubahan" : "Simpan"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Batal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
