"use client";

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
    return <div style={{ width: '120px', height: '32px' }} />;
  }

  const logoSrc = theme === 'dark' ? '/logo/sharia-logo-light.svg' : '/logo/sharia-logo-dark.svg';

  return <SafeImage src={logoSrc} alt="Sharia Expense" width={120} height={32} />;
};

export default Logo;
