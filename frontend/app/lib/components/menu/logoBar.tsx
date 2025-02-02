import FoggyLogo from '@/app/lib/components/svg/foggyLogo';
import { primary } from '@/tailwind.config';
import clsx from 'clsx';
import { bg_container, sh_container } from '@/app/lib/utils/style_definitions';
import Link from 'next/link';

export default function LogoBar() {
  return (
    <div
      className={clsx(
        'absolute left-0 top-8 z-50 flex flex-col items-center justify-center ' +
          'rounded-l-none rounded-br-[64px] rounded-tr-2xl px-1 py-12',
        bg_container,
        sh_container,
      )}
    >
      <Link href="/">
        <FoggyLogo fill={primary[600]} width={56} height={56} />
      </Link>
    </div>
  );
}
