import settingsStore from '@/app/stores/settingsStore';

export default function GetDateTime(date: string) {
  const inputDate = new Date(date); // Преобразуем строку в объект Date
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  const hours = String(inputDate.getHours()).padStart(2, '0');
  const minutes = String(inputDate.getMinutes()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;

  if (inputDate >= startOfToday) {
    return `${settingsStore.t.time.today}, ${formattedTime}`;
  } else if (inputDate >= startOfYesterday) {
    return `${settingsStore.t.time.yesterday}, ${formattedTime}`;
  }

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, '0');
  const day = String(inputDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}, ${formattedTime}`;
}
