'use client';

import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Autocomplete, AutocompleteOption } from "@/components/ui/autocomplete";
import { Plus, Trash2, CalendarIcon, UploadCloud, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import debounce from 'lodash.debounce';
import { Expense } from "@/components/table/expense/ExpenseTable";
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { motion } from "framer-motion";

// --- TYPES ---
interface IStore { _id: string; name: string; }
interface IProduct { _id: string; name: string; price: number; }
interface ProductAutocompleteOption extends AutocompleteOption { price: number; }

// State for newly uploaded files, containing the File object and its blob preview URL
interface UploadedFile {
  file: File;
  preview: string;
}

// Form data structure
type FormData = {
  store: AutocompleteOption | null;
  date: Date;
  items: { product: ProductAutocompleteOption | null; quantity: number | undefined; price: number | undefined; }[];
  attachments: string[]; // Paths of files already on the server
};

interface ExpenseFormProps {
  expense?: Expense | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const { control, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: { store: null, date: new Date(), items: [], attachments: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // --- STATE MANAGEMENT ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeOptions, setStoreOptions] = useState<AutocompleteOption[]>([]);
  const [productOptions, setProductOptions] = useState<Record<number, ProductAutocompleteOption[]>>({});
  
  // CORRECTED FILE UPLOAD STATE
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- DATA WATCHING ---
  const selectedStore = watch("store");
  const existingAttachments = watch("attachments");

  // --- DATA FETCHING ---
  const fetchStores = useMemo(() => debounce(async (name: string) => {
    if (!name) return;
    try {
      const res = await fetch(`/api/stores?name=${name}`);
      const data: IStore[] = await res.json();
      setStoreOptions(data.map(s => ({ value: s._id, label: s.name })));
    } catch (e) { setStoreOptions([]); }
  }, 300), []);

  const fetchProducts = useMemo(() => debounce(async (name: string, storeId: string, index: number) => {
    if (!name || !storeId) return;
    try {
      const res = await fetch(`/api/products?name=${name}&storeId=${storeId}`);
      const data: IProduct[] = await res.json();
      const options: ProductAutocompleteOption[] = data.map(p => ({ value: p._id, label: p.name, price: p.price }));
      setProductOptions(prev => ({ ...prev, [index]: options }));
    } catch (e) { setProductOptions(prev => ({ ...prev, [index]: [] })); }
  }, 300), []);

  // --- FORM INITIALIZATION ---
  useEffect(() => {
    if (expense) {
      reset({
        store: { value: expense.store, label: expense.storeInfo.name },
        date: new Date(expense.date),
        items: expense.items.map(item => ({ product: { value: item.product, label: item.name, price: item.price }, quantity: item.quantity, price: item.price })),
        attachments: expense.attachments || [],
      });
    } else {
      reset({ store: null, date: new Date(), items: [{ product: null, quantity: undefined, price: undefined }], attachments: [] });
    }
  }, [expense, reset]);

  // --- CORRECTED FILE HANDLING LOGIC ---

  // Cleanup blob URLs when the component unmounts
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(uf => URL.revokeObjectURL(uf.preview));
    };
  }, [uploadedFiles]);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setUploadError(null);
    const currentTotal = uploadedFiles.length + existingAttachments.length;

    if (fileRejections.length > 0) {
      setUploadError(fileRejections[0].errors[0].message);
    }

    if (currentTotal + acceptedFiles.length > 4) {
      setUploadError('Maximum 4 files allowed.');
      return;
    }

    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setUploadedFiles(current => [...current, ...newFiles]);
  }, [uploadedFiles, existingAttachments]);

  const removeNewFile = (previewUrl: string) => {
    const fileToRevoke = uploadedFiles.find(f => f.preview === previewUrl);
    if (fileToRevoke) {
      URL.revokeObjectURL(fileToRevoke.preview);
    }
    setUploadedFiles(current => current.filter(f => f.preview !== previewUrl));
  };

  const removeExistingAttachment = (path: string) => {
    setValue("attachments", existingAttachments.filter(p => p !== path), { shouldDirty: true });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  // --- FORM SUBMISSION ---
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      let uploadedPaths: string[] = [];
      const expenseId = expense?._id;

      if (uploadedFiles.length > 0) {
        const filesToUpload = new FormData();
        // For new expenses, we need an ID first. For existing, we use the one we have.
        const folderId = expenseId || 'temp'; 
        filesToUpload.append('folderId', folderId);
        uploadedFiles.forEach(uf => filesToUpload.append('files', uf.file));

        const uploadRes = await fetch('/api/uploads', { method: 'POST', body: filesToUpload });
        if (!uploadRes.ok) throw new Error('File upload failed.');
        const uploadData = await uploadRes.json();
        uploadedPaths = uploadData.paths;
      }

      const total = data.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);
      const payload = {
        store: data.store?.value,
        date: data.date,
        items: data.items.map(item => ({ product: item.product?.value, name: item.product?.label, quantity: item.quantity, price: item.price })),
        total,
        attachments: [...data.attachments, ...uploadedPaths],
        thumbnailPath: data.attachments[0] || uploadedPaths[0],
      };

      const url = expense ? `/api/expenses?id=${expenseId}` : '/api/expenses';
      const method = expense ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${method === 'POST' ? 'create' : 'update'} expense`);
      }

      toast.success(`Data berhasil ${expense ? 'diperbarui' : 'disimpan'}!`);
      if (onSuccess) onSuccess();
      if (!expense) reset(); // Reset form only on creation
      setUploadedFiles([]); // Clear file previews

    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalFiles = existingAttachments.length + uploadedFiles.length;

  return (
    <Card className={onCancel ? "border-none shadow-none" : ""}>
      <CardHeader><CardTitle>{expense ? 'Edit' : 'Tambah'} Data Belanja</CardTitle></CardHeader>
      <CardContent className={onCancel ? "p-0" : ""}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Store and Date Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Nama Toko</Label><Controller name="store" control={control} rules={{ required: true }} render={({ field }) => <Autocomplete placeholder="Cari toko..." emptyMessage="Toko tidak ditemukan." options={storeOptions} value={field.value ?? undefined} onInputChange={fetchStores} onChange={field.onChange} />} /></div>
            <div><Label>Tanggal</Label><Controller control={control} name="date" render={({ field }) => <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "d MMM yy") : <span>Pilih tanggal</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>} /></div>
          </div>

          {/* Items Field Array */}
          <div className="flex flex-col gap-2">
            <Label>Daftar Belanja</Label>
            {fields.map((field, index) => (
              <motion.div key={field.id} className="flex items-start space-x-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="flex-grow space-y-2">
                  <Controller name={`items.${index}.product`} control={control} rules={{ required: true }} render={({ field: pField }) => <Autocomplete placeholder="Nama barang" emptyMessage="Barang tidak ditemukan" options={productOptions[index] || []} value={pField.value ?? undefined} onInputChange={(s) => selectedStore && fetchProducts(s, selectedStore.value, index)} onChange={(opt) => { pField.onChange(opt); if (opt && 'price' in opt) setValue(`items.${index}.price`, (opt as ProductAutocompleteOption).price); }} />} />
                  <div className="grid grid-cols-2 gap-2">
                    <Controller name={`items.${index}.quantity`} control={control} rules={{ required: true, min: 1 }} render={({ field }) => <Input type="number" placeholder="Qty" {...field} onChange={e => field.onChange(e.target.valueAsNumber || undefined)} value={field.value || ''} />} />
                    <Controller name={`items.${index}.price`} control={control} rules={{ required: true }} render={({ field }) => <Input placeholder="Harga" value={field.value === undefined ? "" : new Intl.NumberFormat("id-ID").format(field.value)} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "") === "" ? undefined : Number(e.target.value.replace(/\D/g, "")))} />} />
                  </div>
                </div>
                {fields.length > 1 && <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>}
              </motion.div>
            ))}
            <Button type="button" variant="outline" className="mt-2" onClick={() => append({ product: null, quantity: undefined, price: undefined })}><Plus className="h-4 w-4 mr-2" />Tambah Barang</Button>
          </div>

          {/* --- REFACTORED FILE UPLOAD UI --- */}
          <div className="space-y-2">
            <Label>Upload Bukti Pembelian</Label>
            <div {...getRootProps()} className={cn("flex flex-wrap gap-2 p-2 min-h-[64px] border-2 border-dashed rounded-md items-center justify-center cursor-pointer", isDragActive && "border-blue-500", totalFiles >= 4 && "cursor-not-allowed opacity-50")}>
              <input {...getInputProps()} />
              {existingAttachments.map(path => (
                <div key={path} className="relative h-16 w-16 rounded-md overflow-hidden">
                  <Image src={path} alt="Existing attachment" fill sizes="10vw" style={{ objectFit: 'cover' }} />
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeExistingAttachment(path); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><XCircle size={14} /></button>
                </div>
              ))}
              {uploadedFiles.map(({ file, preview }) => (
                <div key={preview} className="relative h-16 w-16 rounded-md overflow-hidden">
                  <Image src={preview} alt={file.name} fill sizes="10vw" style={{ objectFit: 'cover' }} />
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeNewFile(preview); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><XCircle size={14} /></button>
                </div>
              ))}
              {totalFiles < 4 && (
                <div className="h-16 w-16 flex flex-col items-center justify-center text-muted-foreground">
                  <UploadCloud className="h-6 w-6" />
                  <span className="text-xs">Upload</span>
                </div>
              )}
            </div>
            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : expense ? "Simpan Perubahan" : "Simpan"}</Button>
            {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Batal</Button>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}