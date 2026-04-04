import { ProjectElementTypes } from '@/app/lib/types/definitions';
import {
  FolderIcon,
  LayoutDashboardIcon,
  NetworkIcon,
  ScanTextIcon,
} from 'lucide-react';
import { info } from '@/tailwind.config';
import clsx from 'clsx';

export default function ElementIcon({
  elementType,
  className,
}: {
  elementType: ProjectElementTypes;
  className?: string;
}) {
  switch (elementType) {
    case 'SIMPLE':
      return (
        <LayoutDashboardIcon
          className={clsx('stroke-primary h-6 sm:h-5', className)}
        />
      );
    case 'GRAPH':
      return (
        <NetworkIcon
          className={clsx('stroke-secondary h-6 sm:h-5', className)}
        />
      );
    case 'DOC':
      return (
        <ScanTextIcon
          className={clsx('h-6 sm:h-5', className)}
          style={{ color: info.light.DEFAULT }}
        />
      );
    case 'SECTION':
      return (
        <FolderIcon className={clsx('stroke-success h-6 sm:h-5', className)} />
      );
  }
}
