import { ProjectElementTypes } from '@/app/lib/types/definitions';
import {
  CableIcon,
  FolderIcon,
  LayoutDashboardIcon,
  NetworkIcon,
} from 'lucide-react';

export default function ElementIcon({
  elementType,
}: {
  elementType: ProjectElementTypes;
}) {
  switch (elementType) {
    case 'SIMPLE':
      return <LayoutDashboardIcon className="stroke-primary-400 h-6 sm:h-5" />;
    case 'GRAPH':
      return <CableIcon className="stroke-secondary-400 h-6 sm:h-5" />;
    case 'TREE':
      return <NetworkIcon className="stroke-danger-400 h-6 sm:h-5" />;
    case 'SECTION':
      return <FolderIcon className="stroke-success-400 h-6 sm:h-5" />;
  }
}
