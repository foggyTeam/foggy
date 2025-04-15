import {
  FilterSet,
  Project,
  ProjectMember,
  ProjectRole,
  Team,
  TeamMember,
} from '@/app/lib/types/definitions';

export default function CheckFilters(
  filters: FilterSet,
  value: Project | Team | TeamMember | ProjectMember, // | Notification
  userId: string,
): boolean {
  if (filters) {
    if (filters.nickname?.size > 0 && value.members) {
      const nicknameMatches = value.members?.some((member) =>
        filters.nickname.has(member.nickname),
      );
      if (!nicknameMatches) return false;
    }

    if (filters.team?.size > 0 && value.members) {
      const teamMatches = value.members?.some(
        (member) =>
          member.role === ('team' as ProjectRole) &&
          filters.team.has(member.name),
      );
      if (!teamMatches) return false;
    }

    if (filters.role?.size > 0 && (value.role || value.members)) {
      const roleMatches =
        filters.role.has(
          value.members?.find((member) => member.id === userId)
            ?.role as ProjectRole,
        ) || filters.role.has(value.role);
      if (!roleMatches) return false;
    }

    if (filters.lastChange) {
      const [periodStart, periodEnd] = filters.lastChange
        .split('_')
        .map((date) => new Date(date));
      const targetDate = new Date(value.lastChange);

      if (!(periodStart <= targetDate && targetDate <= periodEnd)) return false;
    }
  }
  return true;
}
