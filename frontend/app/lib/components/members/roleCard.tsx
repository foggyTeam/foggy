import { danger, info, primary, success, warning } from '@/tailwind.config';
import { Role } from '@/app/lib/types/definitions';

export const rolesList: Role[] = ['admin', 'editor', 'reader', 'owner'];
export const colorMap: any = {
  owner: info.light.DEFAULT,
  admin: danger.light.DEFAULT,
  editor: success.light.DEFAULT,
  reader: warning.light.DEFAULT,
  default: primary.light.DEFAULT,
};

export default function RoleCard({ role }: { role: Role | string }) {
  const cardColor: string = colorMap[role] || colorMap.default;

  return (
    <div
      style={{ borderColor: cardColor }}
      className="border-1.5 flex w-fit max-w-32 min-w-[72px] items-center justify-center gap-1 rounded-full px-3 py-0.5"
    >
      <p style={{ color: cardColor }} className="truncate text-xs text-nowrap">
        {role}
      </p>
    </div>
  );
}
