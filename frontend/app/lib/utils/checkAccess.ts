import { Role } from '@/app/lib/types/definitions';
import projectsStore from '@/app/stores/projectsStore';

export default function CheckAccess(approvedRoles: Role[]): boolean {
  return (approvedRoles as (Role | undefined)[]).includes(projectsStore.myRole);
}
