"use client";

import SafeImage from '@/components/ui/safe-image';
import { cn } from '@/lib/utils';

interface PhotoStackProps {
  images: string[];
  onClick: () => void;
  className?: string;
}

const PhotoStack: React.FC<PhotoStackProps> = ({ images, onClick, className }) => {
  if (!images || images.length === 0) {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  // Take up to 3 images for the stack effect
  const stackedImages = images.slice(0, 3);

  return (
    <div
      className={cn("relative flex items-center justify-center w-16 h-12 cursor-pointer group", className)}
      onClick={onClick}
    >
      {stackedImages.map((src, index) => (
        <div
          key={index}
          className="absolute w-10 h-10 rounded-md overflow-hidden border-2 border-white dark:border-gray-800 shadow-md transition-transform duration-300 ease-in-out group-hover:rotate-0"
          style={{
            transform: `rotate(${index * 10 - 10}deg) translateX(${index * 8 - 8}px)`,
            zIndex: stackedImages.length - index,
          }}
        >
          <SafeImage
            src={`${baseUrl}${src}`}
            alt={`Attachment ${index + 1}`}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
        </div>
      ))}
      {images.length > 3 && (
        <div
          className="absolute bottom-0 right-0 flex items-center justify-center w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full border-2 border-white dark:border-gray-800"
          style={{ zIndex: stackedImages.length + 1 }}
        >
          +{images.length - 3}
        </div>
      )}
       {images.length > 1 && images.length <=3 && (
        <div
          className="absolute bottom-0 right-0 flex items-center justify-center w-5 h-5 bg-gray-700 text-white text-xs font-bold rounded-full border-2 border-white dark:border-gray-800"
          style={{ zIndex: stackedImages.length + 1 }}
        >
          {images.length}
        </div>
      )}
    </div>
  );
};

export default PhotoStack;
