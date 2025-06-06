import {
  FilterSet,
  Notification,
  Project,
  ProjectMember,
  Role,
  Team,
  TeamMember,
} from '@/app/lib/types/definitions';

export default function CheckFilters(
  filters: FilterSet,
  value: Project | Team | TeamMember | ProjectMember | Notification,
  userId: string,
): boolean {
  if (filters) {
    // NICKNAME
    if (filters.nickname?.size > 0) {
      if ('members' in value) {
        const nicknameMatches = value.members?.some(
          (member) => member.nickname && filters.nickname.has(member.nickname),
        );
        if (!nicknameMatches) return false;
      } else if ('initiator' in value) {
        if (!filters.nickname.has(value.initiator.nickname)) return false;
      }
    }

    // TEAM / PROJECT
    if (filters.team?.size > 0) {
      if ('members' in value) {
        const teamMatches = value.members?.some(
          (member) =>
            'team' in member && filters.team.has(member.team as string),
        );
        if (!teamMatches) return false;
      } else if ('role' in value && 'team' in value) {
        const teamMatches = filters.team.has((value as any).team as string);
        if (!teamMatches) return false;
      } else if ('target' in value) {
        if (!filters.team.has(value.target.name)) return false;
      }
    }

    // ROLE
    if (filters.role?.size > 0) {
      let roleMatches = true;
      if ('role' in value) roleMatches = filters.role.has(value.role as Role);
      else if ('members' in value)
        roleMatches = filters.role.has(
          value.members.find((member) => member.id === userId)?.role as Role,
        );
      else if ('metadata' in value)
        roleMatches = filters.role.has(value.metadata.role as Role);

      if (!roleMatches) return false;
    }

    // LAST CHANGE
    if (filters.lastChange) {
      const [periodStart, periodEnd] = filters.lastChange
        .split('_')
        .map((date, index) =>
          index
            ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
            : new Date(date),
        );

      const targetDate =
        'lastChange' in value
          ? new Date(value.lastChange)
          : 'createdAt' in value
            ? new Date(value.createdAt)
            : false;

      if (!(periodStart <= targetDate && targetDate <= periodEnd)) return false;
    }
  }
  return true;
}
