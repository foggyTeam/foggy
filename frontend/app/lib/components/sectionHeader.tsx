export default function SectionHeader({
  sectionTitle,
  sectionAvatar,
  value,
  onValueChange,
  favoriteFilter,
  setFavoriteFilter,
  notificationFilter,
  setNotificationFilter,
  addNew,
  addMember,
  openSettings,
}: {
  sectionTitle: string;
  sectionAvatar?: string;
  value: string;
  onValueChange;
  favoriteFilter?: boolean;
  setFavoriteFilter?;
  notificationFilter?: boolean;
  setNotificationFilter?;
  addNew?;
  addMember?;
  openSettings?;
}) {
  return <p>Hello</p>;
}
