import FoggySmall from '@/app/lib/components/svg/foggySmall';
import { primary } from '@/tailwind.config';
import clsx from 'clsx';
import { bg_container } from '@/app/lib/types/styles';
import Link from 'next/link';

export default function LogoBar() {
  return (
    <div
      className={clsx(
        'absolute left-0 top-8 z-50 flex flex-col items-center justify-center ' +
          'rounded-l-none rounded-br-[64px] rounded-tr-2xl px-2 py-12',
        bg_container,
      )}
    >
      <Link href="/">
        <FoggySmall fill={primary[500]} width={48} height={48} />
      </Link>
    </div>
  );
}
