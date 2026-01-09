import { useEffect, useState } from 'react';

const MOBILE_MAX_WIDTH = 640;

interface AdaptiveParams {
  buttonSize: 'lg' | 'md' | 'sm';
  badgeSize: 'lg' | 'md' | 'sm';
}

const mobile: AdaptiveParams = {
  buttonSize: 'lg',
  badgeSize: 'md',
};

const desktop: AdaptiveParams = {
  buttonSize: 'md',
  badgeSize: 'sm',
};

export default function useAdaptiveParams(): AdaptiveParams & {
  isMobile: boolean;
} {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setIsMobile(w <= MOBILE_MAX_WIDTH);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const sizeParams = isMobile ? mobile : desktop;

  return { isMobile, ...sizeParams };
}
