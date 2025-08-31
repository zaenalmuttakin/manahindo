'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Assuming IAddress will be defined in a shared types file or imported from model
interface IAddress {
  _id: string;
  receiverName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface AddressListProps {
  customerId: string;
  selectedAddressId?: string;
  onSelectAddress: (addressId: string) => void;
  onAddNewAddress: () => void; // Callback to trigger showing the AddressForm
}

const AddressList: React.FC<AddressListProps> = ({ 
  customerId, 
  selectedAddressId, 
  onSelectAddress, 
  onAddNewAddress 
}) => {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;

    const fetchAddresses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/addresses?customerId=${customerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch addresses');
        }
        const data: IAddress[] = await response.json();
        setAddresses(data);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [customerId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Choose Shipping Address</h3>
        <Button variant="outline" onClick={onAddNewAddress}>Add Address</Button>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No addresses found for this customer.</p>
        ) : (
          addresses.map(address => (
            <div
              key={address._id}
              onClick={() => onSelectAddress(address._id)}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-all",
                selectedAddressId === address._id 
                  ? "border-primary ring-2 ring-primary shadow-lg"
                  : "hover:border-primary/50"
              )}
            >
              <div className="flex justify-between items-start">
                <p className="font-semibold">{address.receiverName}</p>
                <p className="text-sm text-muted-foreground">{address.phone}</p>
              </div>
              <address className="text-sm text-muted-foreground not-italic mt-1">
                {address.street}, {address.city}, {address.state}, {address.postalCode}, {address.country}
                {address.landmark && <div className="mt-1">({address.landmark})</div>}
              </address>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressList;
