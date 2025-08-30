'use client';

import { useState, useMemo } from 'react';
import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete';
import { Skeleton } from '@/components/ui/skeleton';
import debounce from 'lodash.debounce';
import { toast } from 'sonner';

interface IStore {
  _id: string;
  name: string;
}

interface StoreSelectProps {
  value?: AutocompleteOption;
  onChange: (option: AutocompleteOption | null | undefined) => void;
}

const StoreSelect: React.FC<StoreSelectProps> = ({ value, onChange }) => {
  const [stores, setStores] = useState<AutocompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStores = useMemo(() => 
    debounce(async (searchTerm: string) => {
      if (!searchTerm) {
        setStores([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/stores?name=${searchTerm}`);
        if (!response.ok) throw new Error('Failed to fetch stores');
        const data: IStore[] = await response.json();
        const options = data.map(store => ({
          value: store._id,
          label: store.name,
        }));
        setStores(options);
      } catch (error) {
        console.error('Error fetching stores:', error);
        setStores([]);
      } finally {
        setIsLoading(false);
      }
    }, 300), 
  []);

  const handleSelect = async (option?: AutocompleteOption | null) => {
    if (option?.__isNew__) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/stores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: option.value }),
        });
        if (!response.ok) throw new Error('Failed to create store');
        const newStore: IStore = await response.json();
        toast.success(`New store created: ${newStore.name}`);
        onChange({ value: newStore._id, label: newStore.name });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not create store');
        onChange(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      onChange(option);
    }
  };

  return (
    <Autocomplete
      creatable
      placeholder="Search or create a store..."
      emptyMessage={isLoading ? "Loading..." : "No stores found."}
      options={stores}
      value={value}
      onChange={handleSelect}
      onInputChange={fetchStores}
    />
  );
};

export default StoreSelect;
