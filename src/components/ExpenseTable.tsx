'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ExpenseItem {
  name: string;
  qty: number;
  price: number;
}

interface Expense {
  _id: string;
  store: string;
  items: ExpenseItem[];
  total: number;
  date: string;
}

export default function ExpenseTable() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState<Date | undefined>();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [abbreviations, setAbbreviations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [groupsPerPage, setGroupsPerPage] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedExpense, setEditedExpense] = useState<Partial<Expense> | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [confirmStoreName, setConfirmStoreName] = useState('');

  useEffect(() => {
    fetchExpenses();
    fetchAbbreviations();
  }, []);

  useEffect(() => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.map(expense => ({
        ...expense,
        items: expense.items.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(expense => expense.items.length > 0);
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
  }, [searchTerm, searchDate, expenses]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchAbbreviations = async () => {
    try {
      const res = await fetch('/api/abbreviations');
      const data = await res.json();
      setAbbreviations(data);
    } catch (error) {
      console.error('Error fetching abbreviations:', error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense._id);
    setEditedExpense({ ...expense });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedExpense(null);
  };

  const handleSave = async () => {
    if (!editedExpense || !editingId) return;

    const total = editedExpense.items?.reduce((acc, item) => acc + (item.qty || 0) * (item.price || 0), 0) || 0;
    const finalExpense = { ...editedExpense, total };

    try {
      const res = await fetch(`/api/expenses?id=${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalExpense),
      });

      if (res.ok) {
        const updatedExpense = await res.json();
        setExpenses(prev => prev.map(exp => exp._id === editingId ? updatedExpense : exp));
        handleCancel();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDelete = (expense: Expense) => {
    setDeleteTarget(expense);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/expenses?id=${deleteTarget._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setExpenses(prev => prev.filter(exp => exp._id !== deleteTarget._id));
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
        setConfirmStoreName('');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Expense) => {
    if (editedExpense) {
      setEditedExpense({ ...editedExpense, [field]: e.target.value });
    }
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, field: keyof ExpenseItem) => {
    if (editedExpense && editedExpense.items) {
      const newItems = [...editedExpense.items];
      const item = newItems[index];

      if (field === 'name') {
        item[field] = e.target.value;
      } else { // field is 'qty' or 'price'
        item[field] = parseFloat(e.target.value) || 0;
      }

      setEditedExpense({ ...editedExpense, items: newItems });
    }
  };

  const handleAddItem = () => {
    if (editedExpense && editedExpense.items) {
      const newItems = [...editedExpense.items, { name: '', qty: 0, price: 0 }];
      setEditedExpense({ ...editedExpense, items: newItems });
    }
  };

  const handleRemoveItem = (index: number) => {
    if (editedExpense && editedExpense.items) {
      const newItems = editedExpense.items.filter((_, i) => i !== index);
      setEditedExpense({ ...editedExpense, items: newItems });
    }
  };

  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str.split(' ').map(word => {
      if (abbreviations.includes(word.toUpperCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  };

  const groupedByDate = filteredExpenses.reduce((acc: { [key: string]: Expense[] }, expense) => {
    const date = new Date(expense.date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(expense);
    return acc;
  }, {});

  const dateGroups = Object.entries(groupedByDate);
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

  return (
    <>
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-opacity-10 backdrop-blur-sm z-40 flex justify-center items-center">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Hapus Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Anda akan menghapus data belanja dari <span className="font-bold">{toTitleCase(deleteTarget.store)}</span>.
                Tindakan ini tidak dapat diurungkan.
              </p>
              <div>
                <Label htmlFor="confirm-delete" className="block mb-2">Ketik &ldquo;<span className="font-bold text-red-500">{deleteTarget.store}</span>&rdquo; untuk konfirmasi</Label>
                <Input
                  id="confirm-delete"
                  value={confirmStoreName}
                  onChange={(e) => setConfirmStoreName(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteTarget(null);
                setConfirmStoreName('');
              }}>Batal</Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={confirmStoreName !== deleteTarget.store}
              >
                Hapus Permanen
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      <Card className="md:sticky md:top-4 md:flex md:flex-col md:max-h-[calc(100vh-2rem)]">
        <CardHeader>
          <CardTitle>Riwayat Belanja</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
            <Input
              placeholder="Cari nama barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !searchDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchDate ? format(searchDate, "dd MMMM yyyy") : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={searchDate}
                  onSelect={setSearchDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {paginatedDateGroups.map(([date, dateExpenses]) => (
            <div key={date} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{date}</h2>

              {dateExpenses.map((expense) => (
                <div key={expense._id} className="mb-6">
                  {editingId === expense._id ? (
                    <div>
                      <Input
                        value={editedExpense?.store || ''}
                        onChange={(e) => handleInputChange(e, 'store')}
                        className="text-lg font-medium mb-2"
                      />
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama Barang</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Jumlah</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {editedExpense?.items?.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Input value={item.name} onChange={(e) => handleItemChange(e, index, 'name')} />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={item.qty} onChange={(e) => handleItemChange(e, index, 'qty')} />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={item.price} onChange={(e) => handleItemChange(e, index, 'price')} />
                              </TableCell>
                              <TableCell>{(item.qty * item.price).toLocaleString('id-ID')}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={5}>
                              <Button variant="outline" size="sm" onClick={handleAddItem}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Tambah Item
                              </Button>
                            </TableCell>
                          </TableRow>
                          <TableRow className="font-bold">
                            <TableCell colSpan={3} className="text-right">Total</TableCell>
                            <TableCell>{editedExpense?.items?.reduce((acc, item) => acc + item.qty * item.price, 0).toLocaleString('id-ID')}</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" onClick={handleCancel}>Batal</Button>
                        <Button onClick={handleSave}>Simpan</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium mb-2">{toTitleCase(expense.store)}</h3>
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
                              <TableCell>{item.qty}</TableCell>
                              <TableCell>{item.price.toLocaleString('id-ID')}</TableCell>
                              <TableCell>{(item.qty * item.price).toLocaleString('id-ID')}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold">
                            <TableCell colSpan={3} className="text-right">Total</TableCell>
                            <TableCell>{expense.total.toLocaleString('id-ID')}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <div className="flex justify-end space-x-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(expense)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(expense)}>Hapus</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
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
    </>
  );
}