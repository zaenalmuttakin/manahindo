'use client';

import { useState, useEffect } from 'react';
import ExpenseForm from '@/components/form/expense/ExpenseForm';
import ExpenseTable, { Expense } from '@/components/table/expense/ExpenseTable';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setExpenses(data);
        }
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <main>
      {/* Mobile Layout */}
      <div className="md:hidden grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <ExpenseForm onSuccess={fetchExpenses} />
        </div>
        <div className="lg:col-span-2">
          <ExpenseTable
            expenses={expenses}
            loading={loading}
            onDataChange={fetchExpenses}
          />
        </div>
      </div>

      {/* Desktop Layout - Side by Side */}
      <div className="hidden md:block w-full h-full p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-full">
          <div className="lg:col-span-1">
            <ExpenseForm onSuccess={fetchExpenses} />
          </div>
          <div className="lg:col-span-2">
            <ExpenseTable
              expenses={expenses}
              loading={loading}
              onDataChange={fetchExpenses}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
