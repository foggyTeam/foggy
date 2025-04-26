import {
  FilterSet,
  Project,
  ProjectMember,
  Role,
  Team,
  TeamMember,
} from '@/app/lib/types/definitions';

export default function CheckFilters(
  filters: FilterSet,
  value: Project | Team | TeamMember | ProjectMember, // | Notification
  userId: string,
): boolean {
  if (filters) {
    if (filters.nickname?.size > 0 && 'members' in value) {
      const nicknameMatches = value.members?.some(
        (member) => member.nickname && filters.nickname.has(member.nickname),
      );
      if (!nicknameMatches) return false;
    }

    if (filters.team?.size > 0) {
      if ('members' in value) {
        const teamMatches = value.members?.some(
          (member) =>
            'team' in member && filters.team.has(member.team as string),
        );
        if (!teamMatches) return false;
      }
      if ('role' in value) {
        const teamMatches =
          'team' in value ? filters.team.has(value.team as string) : false;
        if (!teamMatches) return false;
      }
    }

    if (filters.role?.size > 0) {
      let roleMatches = true;
      if ('role' in value) roleMatches = filters.role.has(value.role as Role);
      else if ('members' in value)
        roleMatches = filters.role.has(
          value.members?.find((member) => member.id === userId)?.role as Role,
        );
      if (!roleMatches) return false;
    }

    if (filters.lastChange) {
      const [periodStart, periodEnd] = filters.lastChange
        .split('_')
        .map((date) => new Date(date));
      const targetDate =
        'lastChange' in value ? new Date(value.lastChange) : false;

      if (!(periodStart <= targetDate && targetDate <= periodEnd)) return false;
    }
  }
  return true;
}
