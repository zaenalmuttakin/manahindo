'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import ProductCard from './ProductCard';

interface IProduct {
  _id: string;
  name: string;
  description: string;
  price?: number;
  gallery: {
    photos: string[];
    videos: string[];
  };
}

interface ProductGalleryProps {
  productId?: string; // Allow productId to be optional
  triggerButton: React.ReactNode;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ productId, triggerButton }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'photo' | 'video'; url: string } | null>(null);

  useEffect(() => {
    // Only fetch if the dialog is open and we have a productId
    if (isOpen && productId) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch product details');
          }
          const data: IProduct = await response.json();
          setProduct(data);
          // Set the first photo as the default selected media
          if (data.gallery?.photos?.length > 0) {
            setSelectedMedia({ type: 'photo', url: data.gallery.photos[0] });
          } else if (data.gallery?.videos?.length > 0) {
            setSelectedMedia({ type: 'video', url: data.gallery.videos[0] });
          }
        } catch (error) {
          console.error('Error fetching product:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [isOpen, productId]); // Removed product from dependency array to avoid re-fetching

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col sm:flex-row gap-6 p-4">
        {/* Left Side: Media Display */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative w-full h-3/5 bg-muted rounded-lg overflow-hidden">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : selectedMedia?.type === 'photo' ? (
              <Image src={selectedMedia.url} alt="Selected Product Photo" fill style={{ objectFit: 'contain' }} sizes="50vw" />
            ) : selectedMedia?.type === 'video' ? (
              <video src={selectedMedia.url} controls className="w-full h-full object-contain">Your browser does not support the video tag.</video>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No media selected</div>
            )}
          </div>
          <div className="w-full h-2/5">
            <h4 className="text-sm font-medium mb-2">Media</h4>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 h-full overflow-y-auto pr-2">
              {isLoading ? (
                [...Array(5)].map((_, i) => <Skeleton key={i} className="w-full h-20 rounded-md" />)
              ) : (
                <>
                  {product?.gallery.photos.map((photo, index) => (
                    <div key={index} className="relative w-full h-20 rounded-md overflow-hidden cursor-pointer ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2" onClick={() => setSelectedMedia({ type: 'photo', url: photo })}>
                      <Image src={photo} alt={`Product thumbnail ${index + 1}`} fill style={{ objectFit: 'cover' }} sizes="10vw" />
                    </div>
                  ))}
                  {product?.gallery.videos.map((video, index) => (
                    <div key={index} className="relative w-full h-20 rounded-md overflow-hidden cursor-pointer bg-black flex items-center justify-center" onClick={() => setSelectedMedia({ type: 'video', url: video })}>
                      <video src={video} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <p className="text-white text-xs">VIDEO</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div className="w-full sm:w-1/3">
          <ProductCard product={product ?? undefined} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductGallery;