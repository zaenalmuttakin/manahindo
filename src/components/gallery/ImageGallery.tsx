'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import SafeImage from '@/components/ui/safe-image';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
  expenseId: string;
  onImageDeleteSuccess: (deletedImagePath: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex,
  expenseId,
  onImageDeleteSuccess,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{ path: string; fileName: string } | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, images]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handleDeleteImage = () => {
    if (!images || images.length === 0) return;

    const imagePathToDelete = images[currentIndex];
    const fileName = imagePathToDelete.split('/').pop();
    setImageToDelete({ path: imagePathToDelete, fileName: fileName || '' });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    const { path, fileName } = imageToDelete;

    try {
      const res = await fetch(`/api/uploads?expenseId=${expenseId}&imagePath=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`Gambar ${fileName} berhasil dihapus!`);
        onImageDeleteSuccess(path); // Notify parent to refresh data
        // Adjust current index if the last image was deleted
        if (images.length === 1) {
          onClose(); // Close gallery if no images left
        } else if (currentIndex === images.length - 1) {
          setCurrentIndex(images.length - 2); // Move to previous image if last one deleted
        }
      } else {
        const errorData = await res.json();
        toast.error(`Gagal menghapus gambar: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting image from gallery:', error);
      toast.error('Terjadi kesalahan jaringan saat menghapus gambar.');
    }
  };

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-4">
        <DialogHeader className="pb-2">
          <DialogTitle>Image Gallery</DialogTitle>
          <DialogDescription>
            {images.length > 0 ? `Image ${currentIndex + 1} of ${images.length}` : 'No images'}
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
          {images.length > 0 && currentImage ? (
            <SafeImage
              src={`${baseUrl}${currentImage}`}
              alt={`View of expense attachment ${currentIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              style={{ objectFit: "contain" }}
              className="rounded-md"
              priority
            />
          ) : (
            <p className="text-muted-foreground">No images to display.</p>
          )}

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/70 dark:bg-black/50 dark:hover:bg-black/70 rounded-full"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/70 dark:bg-black/50 dark:hover:bg-black/70 rounded-full"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-between items-center pt-4">
          <Button variant="destructive" onClick={handleDeleteImage} disabled={images.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Image
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Image Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Gambar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus gambar ini:
              <span className="font-bold"> {imageToDelete?.fileName}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default ImageGallery;