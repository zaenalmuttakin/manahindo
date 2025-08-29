"use client";

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';

const SafeImage = (props: ImageProps) => {
  const { src, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...rest}
      src={imgSrc}
      onError={() => {
        setImgSrc('/broken-image.png');
      }}
      alt={props.alt} // Ensure alt is always passed
    />
  );
};

export default SafeImage;
