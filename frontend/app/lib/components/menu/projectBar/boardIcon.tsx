import { BoardTypes } from '@/app/lib/types/definitions';
import { CableIcon, LayoutDashboardIcon, NetworkIcon } from 'lucide-react';

export default function BoardIcon({ boardType }: { boardType: BoardTypes }) {
  switch (boardType) {
    case 'SIMPLE':
      return <LayoutDashboardIcon className="h-5 stroke-success-400" />;
    case 'GRAPH':
      return <CableIcon className="h-5 stroke-primary-400" />;
    case 'TREE':
      return <NetworkIcon className="h-5 stroke-secondary-400" />;
  }
}
