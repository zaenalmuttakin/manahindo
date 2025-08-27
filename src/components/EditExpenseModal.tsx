'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ExpenseForm from "./ExpenseForm";
import { Expense } from "@/models/Expense"; // Assuming Expense model is exported

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSuccess: () => void;
}

export default function EditExpenseModal({ isOpen, onClose, expense, onSuccess }: EditExpenseModalProps) {
  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Data Belanja</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          expense={expense}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
