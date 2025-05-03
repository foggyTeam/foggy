import userStore from '@/app/stores/userStore';

export default function CompareByRole(a: any, b: any) {
  const thisUserId = userStore.user?.id;

  const rolePriority: any = {
    owner: 5,
    admin: 4,
    team: 3,
    editor: 2,
    reader: 1,
  };

  if (a.id === thisUserId) return -1;
  if (b.id === thisUserId) return 1;

  return rolePriority[b.role] - rolePriority[a.role];
}
