'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ExpenseForm from '@/components/form//expense/ExpenseForm';
import SafeImage from '@/components/ui/safe-image';
import ImageGallery from '@/components/gallery/ImageGallery';
import PhotoStack from '@/components/ui/photo-stack';
import { Trash2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

// Interface for Store information
interface StoreInfo {
  _id: string;
  name: string;
}

// Interface for individual expense items
interface ExpenseItem {
  product: string; // product ID
  name: string; // denormalized name
  quantity: number;
  price: number;
}

// Main Expense interface, exported for use in page.tsx
export interface Expense {
  _id: string;
  oid?: string;
  store: string; // store ID
  items: ExpenseItem[];
  total: number;
  date: string;
  storeInfo: StoreInfo; // Populated by aggregation
  attachments: string[];
  thumbnailPath?: string;
}

// Props for the ExpenseTable component
interface ExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  onDataChange: () => void;
}

const ExpenseTableSkeleton = () => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="mb-8">
            <Skeleton className="h-7 w-1/3 mb-4" />
            <div className="mb-6 border rounded-lg p-4">
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-5 w-3/4" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-1/2" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-1/2" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-1/2" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, j) => (
                    <TableRow key={j}>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                      <TableCell><Skeleton className="h-12 w-full" /></TableCell>
                      <TableCell colSpan={2} className="text-right"><Skeleton className="h-5 w-1/4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="flex justify-end space-x-2 mt-2">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-9 w-16" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[70px]" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default function ExpenseTable({ expenses, loading, onDataChange }: ExpenseTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState<Date | undefined>();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [groupsPerPage, setGroupsPerPage] = useState(2);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentGalleryImages, setCurrentGalleryImages] = useState<string[]>([]);
  const [currentGalleryInitialIndex, setCurrentGalleryInitialIndex] = useState(0);
  const [currentGalleryExpenseId, setCurrentGalleryExpenseId] = useState<string>('');
  const [isThumbnailDeleteDialogOpen, setIsThumbnailDeleteDialogOpen] = useState(false);
  const [thumbnailToDelete, setThumbnailToDelete] = useState<{ expenseId: string; imagePath: string; fileName: string } | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  // Effect to filter expenses whenever the source data or filters change
  useEffect(() => {
    let filtered = expenses;

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.storeInfo.name.toLowerCase().includes(lowercasedFilter) ||
        expense.items.some(item => item.name.toLowerCase().includes(lowercasedFilter))
      );
    }

    if (searchDate) {
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getFullYear() === searchDate.getFullYear() &&
          expenseDate.getMonth() === searchDate.getMonth() &&
          expenseDate.getDate() === searchDate.getDate()
        );
      });
    }

    setFilteredExpenses(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, searchDate, expenses]);

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      const res = await fetch(`/api/expenses?id=${expenseToDelete._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Data berhasil dihapus!');
        onDataChange(); // Notify parent to refetch
      } else {
        const errorData = await res.json();
        toast.error(`Gagal menghapus: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
      setConfirmationText("");
    }
  };

  // --- Edit Handlers ---
  const handleEditClick = (expenseId: string) => {
    setEditingExpenseId(expenseId);
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
  };

  const handleUpdateSuccess = () => {
    setEditingExpenseId(null);
    onDataChange(); // Notify parent to refetch
  };
  // ---------------------

  const groupedByDate = filteredExpenses.reduce((acc: Map<string, Expense[]>, expense) => {
    const date = new Date(expense.date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc.has(date)) {
      acc.set(date, []);
    }
    acc.get(date)!.push(expense);
    return acc;
  }, new Map<string, Expense[]>());

  const dateGroups = Array.from(groupedByDate.entries());
  const safeGroupsPerPage = groupsPerPage > 0 ? groupsPerPage : 1;
  const totalPages = Math.ceil(dateGroups.length / safeGroupsPerPage);

  const handleGroupsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const num = parseInt(value, 10);
    if (value === "" || (num > 0 && !isNaN(num))) {
      setGroupsPerPage(num || 0);
      setCurrentPage(1);
    }
  };

  const paginatedDateGroups = dateGroups.slice(
    (currentPage - 1) * safeGroupsPerPage,
    currentPage * safeGroupsPerPage
  );

  const handleThumbnailClick = (expenseId: string, images: string[], initialIndex: number) => {
    setCurrentGalleryExpenseId(expenseId);
    setCurrentGalleryImages(images);
    setCurrentGalleryInitialIndex(initialIndex);
    setIsGalleryOpen(true);
  };

  const handleThumbnailDelete = (expenseId: string, imagePathToDelete: string) => {
    const fileName = imagePathToDelete.split('/').pop();
    setThumbnailToDelete({ expenseId, imagePath: imagePathToDelete, fileName: fileName || '' });
    setIsThumbnailDeleteDialogOpen(true);
  };

  const handleConfirmThumbnailDelete = async () => {
    if (!thumbnailToDelete) return;

    const { expenseId, imagePath, fileName } = thumbnailToDelete;

    try {
      const res = await fetch(`/api/uploads?expenseId=${expenseId}&imagePath=${encodeURIComponent(imagePath)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`Gambar ${fileName} berhasil dihapus!`);
        onDataChange(); // Refresh data to reflect deletion
      } else {
        const errorData = await res.json();
        toast.error(`Gagal menghapus gambar: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Terjadi kesalahan jaringan saat menghapus gambar.');
    }
  };

  const handleGalleryImageDeleteSuccess = () => {
    // This callback is from ImageGallery when an image is deleted from within the gallery
    // It should trigger a data refresh in ExpenseTable
    onDataChange();
  };

  if (loading) {
    return <ExpenseTableSkeleton />;
  }

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>Riwayat Belanja</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="search-input">Cari Data</Label>
              <Input
                id="search-input"
                placeholder="Cari nama toko atau barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="search-date">Filter Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="search-date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal", !searchDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchDate ? format(searchDate, "dd MMMM yyyy") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={searchDate} onSelect={setSearchDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {paginatedDateGroups.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">Tidak ada data untuk ditampilkan.</div>
          ) : (
            paginatedDateGroups.map(([dateKey, dateExpenses]) => (
              <div key={dateKey} className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{dateKey}</h2>
                {dateExpenses.map((expense) => (
                  <div key={expense._id} className="mb-6 border rounded-lg p-4 bg-card border-border">
                    {editingExpenseId === expense._id ? (
                      <ExpenseForm 
                        expense={expense} 
                        onSuccess={handleUpdateSuccess}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <div>
                        <h3 className="text-lg font-medium mb-2 text-foreground">{expense.storeInfo.name}</h3>
                        <div className="relative w-full overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="font-medium text-foreground">Nama Barang</TableHead>
                                <TableHead className="font-medium text-foreground text-center">Qty</TableHead>
                                <TableHead className="font-medium text-foreground text-right">Harga</TableHead>
                                <TableHead className="font-medium text-foreground text-right">Jumlah</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {expense.items.map((item, index) => (
                                <TableRow key={index} className="border-b border-border">
                                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                                  <TableCell className="text-center text-muted-foreground">{item.quantity}</TableCell>
                                  <TableCell className="text-right text-muted-foreground">{item.price.toLocaleString('id-ID')}</TableCell>
                                  <TableCell className="text-right font-medium text-foreground">{(item.quantity * item.price).toLocaleString('id-ID')}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="font-bold bg-muted/30">
                                <TableCell>
                                  {expense.attachments && expense.attachments.length > 0 && (
                                    <div className="mt-2 flex items-center">
                                      {/* --- Desktop View (> 500px) --- */}
                                      <div className="max-[500px]:hidden">
                                        <div className="flex flex-wrap justify-start gap-1">
                                          {expense.attachments.map((attachment, idx) => (
                                            <div key={idx} className="relative w-12 h-12 cursor-pointer group">
                                              <SafeImage
                                                src={`${baseUrl}${attachment}`}
                                                alt={`Attachment ${idx + 1}`}
                                                fill
                                                sizes="5vw"
                                                style={{ objectFit: "cover" }}
                                                className="rounded-md border border-border"
                                                onClick={() => handleThumbnailClick(expense._id, expense.attachments, idx)}
                                              />
                                              <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleThumbnailDelete(expense._id, attachment);
                                                }}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* --- Mobile View (<= 500px) --- */}
                                      <div className="hidden max-[500px]:block">
                                        <PhotoStack
                                          images={expense.attachments}
                                          onClick={() => handleThumbnailClick(expense._id, expense.attachments, 0)}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell colSpan={2} className="text-right text-foreground">Total</TableCell>
                                <TableCell>
                                  <div className="text-left font-bold text-foreground">{expense.total.toLocaleString('id-ID')}</div>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-border">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(expense._id)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(expense)}>Hapus</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-6">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="1"
              value={groupsPerPage > 0 ? groupsPerPage : ""}
              onChange={handleGroupsPerPageChange}
              className="h-8 w-[70px]"
              placeholder="5"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">
              Halaman {currentPage} dari {totalPages > 0 ? totalPages : 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-white/10 backdrop-blur-sm dark:bg-zinc-950/20" />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apakah Anda yakin?</DialogTitle>
              <DialogDescription>
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data belanja dari toko <span className="font-bold">{expenseToDelete?.storeInfo.name || ''}</span> secara permanen.
                <br />
                Untuk mengonfirmasi, ketik &ldquo;<span className="font-bold text-red-500">{expenseToDelete?.storeInfo.name || ''}</span>&rdquo; di bawah ini.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Ketik nama toko untuk konfirmasi"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={confirmationText !== (expenseToDelete?.storeInfo.name || '')}
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Thumbnail Delete Confirmation Dialog */}
      <AlertDialog open={isThumbnailDeleteDialogOpen} onOpenChange={setIsThumbnailDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Gambar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus gambar ini:
              <span className="font-bold"> {thumbnailToDelete?.fileName}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmThumbnailDelete} className="bg-red-500 text-white hover:bg-red-600">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Gallery Dialog */}
      <ImageGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={currentGalleryImages}
        initialIndex={currentGalleryInitialIndex}
        expenseId={currentGalleryExpenseId}
        onImageDeleteSuccess={handleGalleryImageDeleteSuccess}
      />
    </>
  );
}
