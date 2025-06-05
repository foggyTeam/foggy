import { danger, info, primary, success, warning } from '@/tailwind.config';
import { Role } from '@/app/lib/types/definitions';

export const rolesList: Role[] = ['admin', 'editor', 'reader', 'owner'];
export const colorMap: any = {
  owner: info.DEFAULT,
  admin: danger.DEFAULT,
  editor: success.DEFAULT,
  reader: warning.DEFAULT,
  default: primary.DEFAULT,
};

export default function RoleCard({ role }: { role: Role | string }) {
  const cardColor: string = colorMap[role] || colorMap.default;

  return (
    <div
      style={{ borderColor: cardColor }}
      className="flex w-fit min-w-[72px] max-w-32 items-center justify-center gap-1 rounded-full border-1.5 px-3 py-0.5"
    >
      <p style={{ color: cardColor }} className="truncate text-nowrap text-xs">
        {role}
      </p>
    </div>
  );
}
