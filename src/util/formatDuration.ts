import { getDeclension } from "./getDeclension";

export function formatDuration(ms: number, format: "sec" | "ms" = "ms", slice: number = 10) {
  const msPerSecond = format == "ms" ? 1000 : 1;
  const msPerMinute = msPerSecond * 60;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerYear = msPerDay * (365 * 3 + 366) / 4; // Усредненное количество дней в году за 4 года
  const msPerMonth = msPerYear / 12; // Усредненное количество дней в месяце

  const timeUnits = [
    { label: ['год', 'года', 'лет'], value: Math.floor(msPerYear) },
    { label: ['месяц', 'месяца', 'месяцев'], value: Math
      .floor(msPerMonth) },
    { label: ['день', 'дня', 'дней'], value: msPerDay},
    { label: ['час', 'часа', 'часов'], value: msPerHour },
    { label: ['минуту', 'минуты', 'минут'], value: msPerMinute },
    { label: ['секунду', 'секунды', 'секунд'], value: msPerSecond }
  ];

  let remainingTime = ms;
  const parts = [];


  for (const unit of timeUnits) {
    const unitValue = Math.floor(remainingTime / unit.value);
    if (unitValue > 0) {
      parts.push(`${unitValue} ${getDeclension(unitValue, unit.label)}`);
      remainingTime %= unit.value;
    }
  }

  // Если время меньше 1 секунды, добавляем 0с
  if (parts.length === 0) {
    parts.push("0 секунд");
  }

  // Форматируем строку с разделителями
  const formattedTime = parts.slice(0, slice).join(", ").replace(/, ([^,]*)$/, " и $1");

  return formattedTime;
}
