'use client';

import { useState, useMemo } from 'react';
import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete';
import debounce from 'lodash.debounce';
import { toast } from 'sonner';

interface Customer {
  _id: string;
  name: string;
  phone: string;
}

interface CustomerSelectProps {
  value?: AutocompleteOption;
  onChange: (option: AutocompleteOption | null | undefined) => void;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({ value, onChange }) => {
  const [customers, setCustomers] = useState<AutocompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCustomers = useMemo(() =>
    debounce(async (searchTerm: string) => {
      if (!searchTerm) {
        setCustomers([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/customers?name=${searchTerm}`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data: Customer[] = await response.json();
        const options = data.map(customer => ({
          value: customer._id,
          label: `${customer.name} - ${customer.phone}`,
        }));
        setCustomers(options);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
  []);

  const handleSelect = async (option?: AutocompleteOption | null) => {
    if (option?.__isNew__) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: option.value, phone: '' }), // Create new customer
        });
        if (!response.ok) throw new Error('Failed to create customer');
        const newCustomer: Customer = await response.json();
        toast.success(`New customer created: ${newCustomer.name}`);
        // Pass the newly created customer (with real ID) to the form
        onChange({ value: newCustomer._id, label: newCustomer.name });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not create customer');
        onChange(null); // Clear the value on error
      } finally {
        setIsLoading(false);
      }
    } else {
      onChange(option); // Pass existing selection or null
    }
  };

  return (
    <Autocomplete
      creatable
      placeholder="Search or create a customer..."
      emptyMessage={isLoading ? "Loading..." : "No customers found."}
      options={customers}
      value={value}
      onChange={handleSelect}
      onInputChange={fetchCustomers}
    />
  );
};

export default CustomerSelect;