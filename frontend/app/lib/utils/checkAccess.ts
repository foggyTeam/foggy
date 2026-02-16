import { Role } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';
import teamsStore from '@/app/stores/teamsStore';

export default function CheckAccess(
  approvedRoles: Role[],
  type?: 'project' | 'team',
): boolean {
  if (!type) return false;

  return (approvedRoles as (Role | undefined)[]).includes(
    type === 'project' ? projectsStore.myRole : teamsStore.myRole,
  );
}
