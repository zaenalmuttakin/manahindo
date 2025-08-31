'use client';

import { useState, useMemo } from 'react';
import { Autocomplete, AutocompleteOption } from '@/components/ui/autocomplete';
import debounce from 'lodash.debounce';

interface IProduct {
  _id: string;
  name: string;
  price?: number;
}

interface ProductSelectProps {
  value?: AutocompleteOption;
  onChange: (option: AutocompleteOption | null | undefined) => void;
}

const ProductSelect: React.FC<ProductSelectProps> = ({ value, onChange }) => {
  const [products, setProducts] = useState<AutocompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = useMemo(() => 
    debounce(async (searchTerm: string) => {
      if (!searchTerm) {
        setProducts([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?name=${searchTerm}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data: IProduct[] = await response.json();
        const options = data.map(product => ({
          value: product._id,
          label: product.price ? `${product.name} - Rp ${product.price.toLocaleString('id-ID')}` : product.name,
        }));
        setProducts(options);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 300), 
  []);

  return (
    <Autocomplete
      creatable
      placeholder="Search or create a product..."
      emptyMessage={isLoading ? "Loading..." : "No products found."}
      options={products}
      value={value}
      onChange={onChange}
      onInputChange={fetchProducts}
    />
  );
};

export default ProductSelect;
