'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';

interface SafeImageProps extends ImageProps {
  fallbackSrc?: string | null;
}

const SafeImage = (props: SafeImageProps) => {
  const { src, fallbackSrc = null, alt, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setIsError(false);
  }, [src]);

  if (isError) {
    return null;
  }

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt || "image"}
      onError={() => {
        if (fallbackSrc) {
          setImgSrc(fallbackSrc);
        } else {
          setIsError(true);
        }
      }}
    />
  );
};

export default SafeImage;