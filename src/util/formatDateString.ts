/**
 * Функция для преобразования строки с датой в формат "8 Сентября 2024 года в 20:31"
 * @param dateString - строка с датой в формате ISO
 * @returns строка с датой в формате "8 Сентября 2024 года в 20:31"
 */
export function formatDateString(dateString: string): string {
  const date = new Date(dateString);

  // Массив с названиями месяцев
  const months = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];

  // Извлечение компонентов даты
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");

  // Формирование строки с датой
  return `${day} ${month} ${year} года в ${hours}:${minutes}`;
}
