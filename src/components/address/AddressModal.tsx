'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import AddressList from './AddressList';
import AddressForm from './AddressForm';

interface AddressModalProps {
  customerId: string;
  selectedAddressId?: string;
  onSelectAddress: (addressId: string) => void;
}

const slideVariants: Variants = {
  hiddenRight: {
    x: "100%",
    opacity: 0,
  },
  hiddenLeft: {
    x: "-100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exitRight: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.2 },
  },
  exitLeft: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const AddressModal: React.FC<AddressModalProps> = ({ customerId, selectedAddressId, onSelectAddress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [direction, setDirection] = useState(1); // 1 for right-to-left, -1 for left-to-right

  const handleSelectAndClose = (addressId: string) => {
    onSelectAddress(addressId);
    setIsOpen(false);
  };

  const showForm = () => {
    setDirection(1);
    setView('form');
  };

  const showList = () => {
    setDirection(-1);
    setView('list');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{selectedAddressId ? "Change Address" : "Choose Address"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="relative h-[550px] overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            {view === 'list' && (
              <motion.div
                key="list"
                custom={direction}
                variants={slideVariants}
                initial={direction === 1 ? "hiddenRight" : "hiddenLeft"}
                animate="visible"
                exit={direction === 1 ? "exitLeft" : "exitRight"}
                className="absolute w-full h-full p-6"
              >
                <AddressList
                  customerId={customerId}
                  selectedAddressId={selectedAddressId}
                  onSelectAddress={handleSelectAndClose}
                  onAddNewAddress={showForm}
                />
              </motion.div>
            )}
            {view === 'form' && (
              <motion.div
                key="form"
                custom={direction}
                variants={slideVariants}
                initial="hiddenRight"
                animate="visible"
                exit="exitRight"
                className="absolute w-full h-full p-6 bg-background"
              >
                <AddressForm
                  customerId={customerId}
                  onSaveSuccess={(newAddress) => {
                    onSelectAddress(newAddress._id);
                    showList();
                  }}
                  onBack={showList}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressModal;