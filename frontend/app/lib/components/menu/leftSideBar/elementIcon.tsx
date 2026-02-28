import { ProjectElementTypes } from '@/app/lib/types/definitions';
import {
  FolderIcon,
  LayoutDashboardIcon,
  NetworkIcon,
  ScanTextIcon,
} from 'lucide-react';
import { info } from '@/tailwind.config';

export default function ElementIcon({
  elementType,
}: {
  elementType: ProjectElementTypes;
}) {
  switch (elementType) {
    case 'SIMPLE':
      return <LayoutDashboardIcon className="stroke-primary h-6 sm:h-5" />;
    case 'GRAPH':
      return <NetworkIcon className="stroke-secondary h-6 sm:h-5" />;
    case 'DOC':
      return (
        <ScanTextIcon
          className="h-6 sm:h-5"
          style={{ color: info.light.DEFAULT }}
        />
      );
    case 'SECTION':
      return <FolderIcon className="stroke-success h-6 sm:h-5" />;
  }
}
