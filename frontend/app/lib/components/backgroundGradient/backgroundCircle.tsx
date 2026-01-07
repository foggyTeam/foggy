'use client';

import styles from '@/app/lib/components/backgroundGradient/backgroundGradient.module.css';
import { circleParams } from '@/app/lib/components/backgroundGradient/backgroundGradient';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function BackgroundCircle({ params }: { params: circleParams }) {
  const [isBoardPage, setIsBoardPage] = useState(false);
  const boardPageRegex = /^\/project\/[^\/]+\/[^\/]+\/[^\/]+$/;
  const path = usePathname();

  const position = (initial: number) => {
    if (!isBoardPage) return initial;
    return initial > 34 ? 85 : -15;
  };

  useEffect(() => {
    setIsBoardPage(!!path.match(boardPageRegex));
  }, [path]);

  return (
    <div
      className={styles.circle}
      style={{
        width: `${params.width}px`,
        height: `${params.height}px`,
        rotate: `${params.rotation}deg`,
        top: `${position(params.top)}%`,
        left: `${params.left}%`,
        animationDuration: `${params.duration}s`,
        '--circle-color': params.color,
        transition: `top ${params.duration / 2}s ease, left ${
          params.duration / 2
        }s ease, width ${params.duration / 2}s ease, height ${
          params.duration / 2
        }s ease`,
      }}
    />
  );
}
