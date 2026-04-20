import FoggySmall from '@/app/lib/components/svg/foggySmall';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import Link from 'next/link';
import { useState } from 'react';

export default function LogoBar() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={clsx(
        'absolute top-8 left-0 z-50 flex flex-col items-center justify-center ' +
          'rounded-l-none rounded-tr-2xl rounded-br-[64px] px-2 py-12',
        bg_container,
      )}
    >
      <Link href="/">
        <FoggySmall
          withGradient={isHovered}
          className={clsx(
            'transition-all duration-300',
            isHovered
              ? 'stroke-primary stroke-2'
              : 'fill-primary stroke-primary stroke-0',
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          width={48}
          height={48}
        />
      </Link>
    </div>
  );
}
