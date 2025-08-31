'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import SafeImage from '@/components/ui/safe-image';

const Logo = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder to prevent layout shift
<<<<<<< HEAD
    return <div style={{ width: '160px', height: '42px' }} />;
=======
    return <div style={{ width: '160px', height: '48px' }} />;
>>>>>>> e306945224a6eb3b53126efe517d23f7d5d88b5b
  }

  const logoSrc = theme === 'dark' ? '/logo/sharia-logo-light.svg' : '/logo/sharia-logo-dark.svg';

  return (
<<<<<<< HEAD
    <div style={{ position: 'relative', width: '160px', height: '42px' }}>
=======
    <div style={{ position: 'relative', width: '160px', height: '48px' }}>
>>>>>>> e306945224a6eb3b53126efe517d23f7d5d88b5b
      <SafeImage
        src={logoSrc}
        alt="Sharia Expense Logo"
        fill
        sizes="160px"
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  );
};

export default Logo;