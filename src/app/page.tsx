'use client';

import { useState } from 'react';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseTable from '@/components/ExpenseTable';

export default function Home() {
  const [refreshTable, setRefreshTable] = useState(0);

  const handleExpenseAdded = () => {
    // Trigger refresh table dengan mengubah state
    setRefreshTable(prev => prev + 1);
  };

  return (
    <main className="container mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExpenseForm onSuccess={handleExpenseAdded} />
        <ExpenseTable key={refreshTable} />
      </div>
    </main>
  );
}