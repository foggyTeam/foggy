import { Notification } from '@/app/lib/types/definitions';
import settingsStore from '@/app/stores/settingsStore';
import { colorMap } from '@/app/lib/components/members/roleCard';

export default function NotificationMainText({
  type,
  initiator,
  target,
  metadata,
}: Pick<Notification, 'type' | 'initiator' | 'target' | 'metadata'>) {
  const roleColor: string = colorMap[metadata.role] || colorMap.default;
  const textClasses: string = 'h-fit w-full text-start text-default-700';

  const replaceFields = (s: string) => {
    return s
      .replace('_', (target?.name || '').toUpperCase())
      .replace('NAME', (target?.name || '').toUpperCase())
      .replace('USER', initiator.nickname);
  };

  switch (type) {
    case 'PROJECT_INVITE':
      return (
        <p className={textClasses}>
          {replaceFields(
            settingsStore.t.notifications.invite.project.description1,
          )}
          <span style={{ color: roleColor }}>{metadata.role}</span>
          {replaceFields(
            settingsStore.t.notifications.invite.project.description2,
          )}
        </p>
      );
    case 'TEAM_INVITE':
      return (
        <p className={textClasses}>
          {replaceFields(
            settingsStore.t.notifications.invite.team.description1,
          )}
          <span style={{ color: roleColor }}>{metadata.role}</span>
          {replaceFields(
            settingsStore.t.notifications.invite.team.description2,
          )}
        </p>
      );
    case 'PROJECT_JOIN_REQUEST':
      return (
        <p className={textClasses}>
          {replaceFields(
            settingsStore.t.notifications.request.project.description1,
          )}
          <span style={{ color: roleColor }}>{metadata.role}</span>
          {replaceFields(
            settingsStore.t.notifications.request.project.description2,
          )}
        </p>
      );
    case 'TEAM_JOIN_REQUEST':
      return (
        <p className={textClasses}>
          {replaceFields(
            settingsStore.t.notifications.request.team.description1,
          )}
          <span style={{ color: roleColor }}>{metadata.role}</span>
          {replaceFields(
            settingsStore.t.notifications.request.team.description2,
          )}
        </p>
      );
    case 'PROJECT_JOIN_ACCEPTED':
      return (
        <p className={textClasses}>
          {replaceFields(
            settingsStore.t.notifications.request.project.accepted,
          )}
          <span style={{ color: roleColor }}>{metadata.role}</span>.
        </p>
      );
    case 'TEAM_JOIN_ACCEPTED':
      return (
        <p className={textClasses}>
          {replaceFields(settingsStore.t.notifications.request.team.accepted)}
          <span style={{ color: roleColor }}>{metadata.role}</span>.
        </p>
      );
    case 'PROJECT_JOIN_REJECTED':
      return (
        <p className={textClasses}>
          {replaceFields(
            settingsStore.t.notifications.request.project.rejected,
          )}
        </p>
      );
    case 'TEAM_JOIN_REJECTED':
      return (
        <p className={textClasses}>
          {replaceFields(settingsStore.t.notifications.request.team.rejected)}
          <span style={{ color: roleColor }}>{metadata.role}</span>.
        </p>
      );
    case 'PROJECT_MEMBER_ADDED':
      return (
        <p className={textClasses}>
          {replaceFields(settingsStore.t.notifications.newMember.project)}
          <span style={{ color: roleColor }}>{metadata.role}</span>.
        </p>
      );
    case 'TEAM_MEMBER_ADDED':
      return (
        <p className={textClasses}>
          {replaceFields(settingsStore.t.notifications.newMember.team)}
          <span style={{ color: roleColor }}>{metadata.role}</span>.
        </p>
      );
  }
}
