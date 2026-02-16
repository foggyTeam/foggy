import { Role } from '@/app/lib/types/definitions';
import { createContext, useContext } from 'react';

interface MembersContextType {
  memberType: 'team' | 'project';
  myRole: Role | null;
  removeMember: (
    id: string,
    newOwnerId?: string | null,
    removeType?: 'breakup' | 'entire' | null,
  ) => void;
  updateMemberRole: (
    id: string,
    newRole: Role,
    changeType?: 'override' | 'updateMax' | null,
  ) => void;
}

const MembersContext = createContext<MembersContextType | null>(null);

export const useMembersContext = () => {
  const context = useContext(MembersContext);
  if (!context)
    throw new Error('useContext must be used within a ContextProvider');
  return context;
};

export default MembersContext;
