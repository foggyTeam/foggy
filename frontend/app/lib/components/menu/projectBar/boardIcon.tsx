import { BoardTypes } from '@/app/lib/utils/definitions';
import { CableIcon, LayoutDashboardIcon, NetworkIcon } from 'lucide-react';

export default function BoardIcon({ boardType }: { boardType: BoardTypes }) {
  switch (boardType) {
    case BoardTypes.SIMPLE:
      return <LayoutDashboardIcon className="stroke-success-400" />;
    case BoardTypes.GRAPH:
      return <CableIcon className="stroke-primary-400" />;
    case BoardTypes.TREE:
      return <NetworkIcon className="stroke-secondary-400" />;
  }
}
