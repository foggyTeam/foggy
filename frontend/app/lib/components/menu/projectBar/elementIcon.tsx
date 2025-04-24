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
      return <LayoutDashboardIcon className="h-5 stroke-primary-400" />;
    case 'GRAPH':
      return <CableIcon className="h-5 stroke-secondary-400" />;
    case 'TREE':
      return <NetworkIcon className="h-5 stroke-danger-400" />;
    case 'SECTION':
      return <FolderIcon className="h-5 stroke-success-400" />;
  }
}
