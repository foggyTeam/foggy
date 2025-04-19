import { danger, info, secondary, success, warning } from '@/tailwind.config';
import { Role } from '@/app/lib/types/definitions';

export default function RoleCard({ role }: { role: Role | string }) {
  const colorMap: any = {
    owner: info.DEFAULT,
    admin: danger.DEFAULT,
    editor: success.DEFAULT,
    reader: warning.DEFAULT,
    default: secondary.DEFAULT,
  };
  const cardColor: string = colorMap[role] || colorMap.default;

  return (
    <div
      style={{ borderColor: cardColor }}
      className="flex w-[72px] items-center justify-center gap-1 rounded-full border-1.5 px-3 py-0.5"
    >
      <p style={{ color: cardColor }} className="text-xs">
        {role}
      </p>
    </div>
  );
}
