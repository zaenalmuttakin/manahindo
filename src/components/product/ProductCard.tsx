'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Assuming IProduct will be defined in a shared types file or imported from model
interface IProduct {
  name: string;
  description: string;
  price?: number;
  gallery: {
    photos: string[];
    videos: string[];
  };
}

interface ProductCardProps {
  product?: IProduct;
  isLoading: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mt-2" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-8 w-1/3" />
        </CardFooter>
      </Card>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{product.description}</p>
      </CardContent>
      {product.price && (
        <CardFooter>
          <p className="text-xl font-bold">Rp {product.price.toLocaleString('id-ID')}</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductCard;
