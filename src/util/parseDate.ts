import { parse, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

export function parseDate(dateString: string): Date | null {
  // Определяем массив с возможными форматами дат
  const formats = [
    'd MMMM yyyy',   // например, "17 ноября 2001"
    'dd.MM.yyyy',    // например, "17.11.2001"
    'yyyy-MM-dd',    // например, "2001-11-17"
    'MM/dd/yyyy',    // например, "11/17/2001"
    'MMMM d, yyyy',  // например, "November 17, 2001"
    'd MMM yyyy',    // например, "17 Nov 2001"
    'dd/MM/yyyy',    // например, "17/11/2001"
    'd-MMM-yyyy',    // например, "17-Nov-2001"
    'd.M.yyyy',      // например, "17.11.2001"
    'd/M/yyyy',      // например, "17/11/2001"
    'd-M-yyyy',      // например, "17-11-2001"
    // Добавь сюда другие форматы, которые тебе нужны
  ];

  // Пытаемся распарсить дату, используя каждый из форматов
  for (const format of formats) {
    const parsedDate = parse(dateString, format, new Date(), { locale: ru });
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  }

  // Если ни один из форматов не подошёл, возвращаем null
  return null;
}