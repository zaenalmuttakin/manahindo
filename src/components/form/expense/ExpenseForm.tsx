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
import { useDropzone, FileRejection, FileError } from 'react-dropzone';
import SafeImage from '@/components/ui/safe-image';
import { motion, AnimatePresence } from "framer-motion";

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
  attachments: string[];
  thumbnailPath?: string;
};

interface ExpenseFormProps {
  expense?: Expense | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const { control, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      store: null,
      date: new Date(),
      items: [{ product: null, quantity: undefined, price: undefined }],
      attachments: expense?.attachments || [],
      thumbnailPath: expense?.thumbnailPath || undefined,
    },
  });

  const [newlySelectedFiles, setNewlySelectedFiles] = useState<File[]>([]);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (expense) {
      reset({
        store: { value: expense.store, label: expense.storeInfo.name },
        date: new Date(expense.date),
        items: expense.items.map(item => ({
          product: { value: item.product, label: item.name, price: item.price },
          quantity: item.quantity,
          price: item.price,
        })),
        attachments: expense.attachments || [],
        thumbnailPath: expense.thumbnailPath || undefined,
      });
    } else {
      reset({
        store: null,
        date: new Date(),
        items: [{ product: null, quantity: undefined, price: undefined }],
        attachments: [],
        thumbnailPath: undefined,
      });
    }
  }, [expense, reset]);

  // Effect to manage object URLs
  useEffect(() => {
    const newObjectUrls = Object.fromEntries(
      newlySelectedFiles.map(file => [file.name, URL.createObjectURL(file)])
    );
    setObjectUrls(newObjectUrls);

    return () => {
      // Revoke URLs when component unmounts or files change
      Object.values(newObjectUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [newlySelectedFiles]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [newlyAddedIndex, setNewlyAddedIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storeOptions, setStoreOptions] = useState<AutocompleteOption[]>([]);
  const [productOptions, setProductOptions] = useState<Record<number, ProductAutocompleteOption[]>>({});

  const selectedStore = watch("store");
  const attachments = watch("attachments");
  const thumbnailPath = watch("thumbnailPath");

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

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setFileUploadError(null);

    const totalFilesCount = newlySelectedFiles.length + attachments.length;
    const newFilesToAdd = acceptedFiles.filter(file => {
      const maxFileSize = 2 * 1024 * 1024; // 4MB
      const allowedTypes = ['image/jpeg', 'image/png'];

      if (!allowedTypes.includes(file.type)) {
        setFileUploadError(`File type not allowed: ${file.name}. Only JPEG and PNG are allowed.`);
        return false;
      }
      if (file.size > maxFileSize) {
        setFileUploadError(`File size exceeds 4MB for ${file.name}.`);
        return false;
      }
      return true;
    });

    if (totalFilesCount + newFilesToAdd.length > 4) {
      setFileUploadError('Maximum 4 files allowed. Some files were not added.');
      setNewlySelectedFiles(prevFiles => [
        ...prevFiles,
        ...newFilesToAdd.slice(0, 4 - totalFilesCount),
      ]);
    } else {
      setNewlySelectedFiles(prevFiles => [...prevFiles, ...newFilesToAdd]);
    }

    if (fileRejections.length > 0) {
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach((err: FileError) => {
          setFileUploadError(`${file.name}: ${err.message}`);
        });
      });
    }
  }, [newlySelectedFiles, attachments]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    maxFiles: 4,
    noClick: newlySelectedFiles.length + attachments.length >= 4,
    noKeyboard: newlySelectedFiles.length + attachments.length >= 4,
  });

  const removeNewlySelectedFile = (fileToRemove: File) => {
    setNewlySelectedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    if (objectUrls[fileToRemove.name]) {
      URL.revokeObjectURL(objectUrls[fileToRemove.name]);
      setObjectUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[fileToRemove.name];
        return newUrls;
      });
    }
  };

  const removeExistingAttachment = (pathToRemove: string) => {
    setValue("attachments", attachments.filter(path => path !== pathToRemove), { shouldDirty: true });
    if (thumbnailPath === pathToRemove) {
      setValue("thumbnailPath", undefined, { shouldDirty: true });
    }
  };

  const handleFileUpload = async (folderId: string): Promise<string[]> => {
    if (newlySelectedFiles.length === 0) {
      return [];
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('folderId', folderId); // Add folderId to the form data
    newlySelectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload files');
      }

      const data = await res.json();
      toast.success('Files uploaded successfully!');
      setNewlySelectedFiles([]); // Clear newly selected files after upload
      return data.paths;
    } catch (error: unknown) {
      console.error('Error uploading files:', error);
      setFileUploadError(error instanceof Error ? error.message : 'Failed to upload files.');
      return [];
    } finally {
      setIsSubmitting(false);
    }
  };

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

    // Base expense data without attachments
    const baseExpenseData = {
      store: data.store.value,
      items: data.items.map(item => ({
        product: item.product?.value,
        name: item.product?.label,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
      date: data.date,
    };

    try {
      if (expense) {
        // UPDATE EXISTING EXPENSE
        const expenseId = expense._id || expense.oid; // Keep oid fallback just in case
        if (!expenseId) {
          toast.error("Expense ID is missing. Cannot update.");
          setIsSubmitting(false);
          return;
        }

        let uploadedPaths: string[] = [];
        if (newlySelectedFiles.length > 0) {
          uploadedPaths = await handleFileUpload(expenseId); // Use expenseId as the folderId
          if (uploadedPaths.length === 0 && newlySelectedFiles.length > 0) { // Upload failed
            setIsSubmitting(false);
            return;
          }
        }

        const finalAttachments = [...(data.attachments || []), ...uploadedPaths];
        const finalThumbnailPath = data.thumbnailPath || (uploadedPaths.length > 0 ? uploadedPaths[0] : expense.thumbnailPath);

        const updatePayload = {
          ...baseExpenseData,
          attachments: finalAttachments,
          thumbnailPath: finalThumbnailPath,
        };

        const res = await fetch(`/api/expenses?id=${expenseId}`, {
          method: 'PUT',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to update expense");
        }

        toast.success("Data berhasil diperbarui!");
        if (onSuccess) onSuccess();

      } else {
        // CREATE NEW EXPENSE
        const createRes = await fetch('/api/expenses', {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(baseExpenseData), // Create expense first to get its ID
        });

        if (!createRes.ok) {
          const errorData = await createRes.json();
          throw new Error(errorData.error || "Failed to create expense");
        }

        const createdExpense = await createRes.json();
        const newExpenseId = createdExpense._id || createdExpense.oid;

        if (!newExpenseId) {
          toast.error("Failed to create expense or get its ID. File upload skipped.");
        } else {
          let uploadedPaths: string[] = [];
          if (newlySelectedFiles.length > 0) {
            uploadedPaths = await handleFileUpload(newExpenseId); // Use the new _id as the folderId

            if (uploadedPaths.length > 0) {
              // If upload was successful, update the expense with attachment paths
              const updatePayload = {
                ...baseExpenseData,
                attachments: uploadedPaths,
                thumbnailPath: uploadedPaths[0] || undefined,
              };

              const updateRes = await fetch(`/api/expenses?id=${newExpenseId}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatePayload),
              });

              if (!updateRes.ok) {
                const errorData = await updateRes.json();
                toast.error(`Expense created, but failed to save attachments: ${errorData.error}`);
              }
            } else {
              toast.warning("Expense created, but file upload failed. You can add files by editing.");
            }
          }
        }
        
        toast.success("Data berhasil disimpan!");
        reset({ store: null, date: new Date(), items: [{ product: null, quantity: undefined, price: undefined }], attachments: [], thumbnailPath: undefined });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan jaringan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allFiles = useMemo(() => {
    const existing = attachments.map(path => ({ type: 'existing', path }));
    const newly = newlySelectedFiles.map(file => ({ type: 'new', file, url: objectUrls[file.name] }));
    return [...existing, ...newly];
  }, [attachments, newlySelectedFiles, objectUrls]);

  const totalCurrentFiles = allFiles.length;

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
                        {field.value ? format(field.value, "d MMM yy") : <span>Pilih tanggal</span>}
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
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  className="flex space-x-2 items-start"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                  transition={{
                    opacity: { duration: 0.2, ease: "linear" },
                    x: { duration: 0.3, ease: "easeInOut", delay: 0.2 }
                  }}
                >
                  <div className="flex w-full flex-col gap-2">
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
                            setNewlyAddedIndex(null);
                          }}
                          onChange={(option) => {
                            productField.onChange(option);
                            if (option && 'price' in option) {
                              setValue(`items.${index}.price`, (option as ProductAutocompleteOption).price, { shouldValidate: true });
                            }
                            setNewlyAddedIndex(null);
                          }}
                          isFocused={index === newlyAddedIndex}
                        />
                      )}
                    />
                    <div className="grid grid-cols-2 gap-2">
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
                                field.onChange(undefined);
                              } else {
                                field.onChange(Math.max(0, numValue));
                              }
                            }}
                            value={field.value ?? ""}
                          />
                        )}
                      />
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
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="transition-all hover:brightness-110">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="file-upload">Upload Bukti Pembelian (Max 4 files, 4MB/file, JPEG/PNG)</Label>
              <div
                {...getRootProps()}
                className={cn(
                  "flex flex-wrap items-center justify-center gap-2 p-2 min-h-[60px] border border-gray-300 rounded-md cursor-pointer transition-colors",
                  "hover:border-gray-400",
                  isDragActive ? "border-blue-500 bg-blue-50" : "",
                  totalCurrentFiles >= 4 ? "cursor-not-allowed opacity-70" : ""
                )}
                //style={{ minWidth: 'calc(5 * (50px + 8px) + 16px)' }} // 10 thumbnails (w-16=64px) + gap-2 (8px) + padding (16px)
              >
                <Input {...getInputProps()} id="file-upload" className="hidden" />
                {totalCurrentFiles === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground w-full">
                    <UploadCloud className="h-6 w-6 mb-1" />
                    {isDragActive ? (
                      <p>Drop the files here ...</p>
                    ) : (
                      <p>Drag n drop or click to select files</p>
                    )}
                  </div>
                ) : (
                  <>
                    {attachments.map((path, index) => (
                      <div key={`existing-${index}`} className="relative w-14 h-14 border rounded-md overflow-hidden flex-shrink-0">
                        <SafeImage
                          src={path}
                          alt={`Existing attachment ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeExistingAttachment(path); }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs transition-all hover:brightness-110"
                          aria-label={`Remove existing attachment ${index + 1}`}
                        >
                          <XCircle size={12} />
                        </button>
                      </div>
                    ))}
                    {newlySelectedFiles.map((file, index) => (
                      <div key={`new-${index}`} className="relative w-14 h-14 border rounded-md overflow-hidden flex-shrink-0">
                        {objectUrls[file.name] && (
                          <SafeImage
                            src={objectUrls[file.name]}
                            alt={file.name}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                          />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeNewlySelectedFile(file); }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs transition-all hover:brightness-110"
                          aria-label={`Remove ${file.name}`}
                        >
                          <XCircle size={12} />
                        </button>
                      </div>
                    ))}
                    {totalCurrentFiles < 4 && (
                      <div className="flex flex-col items-center text-center text-muted-foreground ml-2">
                        <UploadCloud className="h-6 w-6 mb-1" />
                        <p className="text-sm">MAX 4</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              {fileUploadError && <p className="text-red-500 text-sm">{fileUploadError}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 justify-end">
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