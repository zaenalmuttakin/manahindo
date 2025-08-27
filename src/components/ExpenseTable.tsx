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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ExpenseForm from './ExpenseForm';

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
  store: string; // store ID
  items: ExpenseItem[];
  total: number;
  date: string;
  storeInfo: StoreInfo; // Populated by aggregation
}

// Props for the ExpenseTable component
interface ExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  onDataChange: () => void;
}

export default function ExpenseTable({ expenses, loading, onDataChange }: ExpenseTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState<Date | undefined>();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [abbreviations, setAbbreviations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [groupsPerPage, setGroupsPerPage] = useState(5);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [confirmationText, setConfirmationText] = useState("");

  // Fetch abbreviations on mount
  useEffect(() => {
    fetchAbbreviations();
  }, []);

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

  const fetchAbbreviations = async () => {
    try {
      const res = await fetch('/api/abbreviations');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAbbreviations(data);
      }
    } catch (error) {
      console.error('Error fetching abbreviations:', error);
    }
  };

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

  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.split(' ').map(word => {
      if (abbreviations.includes(word.toUpperCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  };

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

  if (loading) {
    return <Card className="flex flex-col h-full items-center justify-center"><p>Memuat data...</p></Card>;
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
            paginatedDateGroups.map(([date, dateExpenses]) => (
              <div key={date} className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{date}</h2>
                {dateExpenses.map((expense) => (
                  <div key={expense._id} className="mb-6 border rounded-lg p-4">
                    {editingExpenseId === expense._id ? (
                      <ExpenseForm 
                        expense={expense} 
                        onSuccess={handleUpdateSuccess}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <div>
                        <h3 className="text-lg font-medium mb-2">{toTitleCase(expense.storeInfo.name)}</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nama Barang</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Harga</TableHead>
                              <TableHead>Jumlah</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {expense.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{toTitleCase(item.name)}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.price.toLocaleString('id-ID')}</TableCell>
                                <TableCell>{(item.quantity * item.price).toLocaleString('id-ID')}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="font-bold">
                              <TableCell colSpan={3} className="text-right">Total</TableCell>
                              <TableCell>{expense.total.toLocaleString('id-ID')}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <div className="flex justify-end space-x-2 mt-2">
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
            <p className="text-sm text-muted-foreground">Grup per halaman</p>
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
                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data belanja dari toko{" "}
                <span className="font-bold">{toTitleCase(expenseToDelete?.storeInfo.name || '')}</span> secara permanen.
                <br />
                Untuk mengonfirmasi, ketik{" "}
                &ldquo;<span className="font-bold text-red-500">{toTitleCase(expenseToDelete?.storeInfo.name || '')}</span>&rdquo; di bawah ini.
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
                disabled={confirmationText !== toTitleCase(expenseToDelete?.storeInfo.name || '')}
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}