import {
  FilterObject,
  Project,
  ProjectMember,
  ProjectRole,
  Team,
  TeamMember,
} from '@/app/lib/types/definitions';

export function checkFilters(
  filters: FilterObject[],
  value: Project | Team | TeamMember | ProjectMember,
  userId: string,
): boolean {
  return filters.every((filter) => {
    switch (filter.field) {
      case 'nickname':
        return (
          value.members?.some(
            (member) => member.nickname === filter.referenceValue,
          ) || value.nickname === filter.referenceValue
        );

      case 'name':
        return value.name === filter.referenceValue;

      case 'team':
        return value.members.some(
          (member) =>
            member.role === ('team' as ProjectRole) &&
            member.nickname === filter.referenceValue,
        );

      case 'role':
        return (
          value.members.find((member) => member.id === userId)?.role ===
          filter.referenceValue
        );

      case 'lastChange':
        return value.lastChange === filter.referenceValue;

      default:
        return true;
    }
  });
}

export default function FilterMenu({ filters, setFilters }) {
  return <p>I am a filter</p>;
}
