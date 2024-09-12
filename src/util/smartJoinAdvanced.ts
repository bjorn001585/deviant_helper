interface SmartJoinOptions {
  separator: string;
  lastSeparator: string;
}

/**
 * Продвинутая функция для умного преобразования списка в строку с настройками.
 * @param items - массив строк, которые нужно соединить.
 * @param options - объект с настройками для соединения элементов.
 * @returns строка, представляющая элементы массива, соединенные согласно настройкам.
 */
export function smartJoinAdvanced(
  items: string[],
  options?: Partial<SmartJoinOptions>
): string {
  // Значения по умолчанию для разделителей
  const separator = options?.separator ?? ", ";
  const lastSeparator = options?.lastSeparator ?? " и ";

  if (items.length === 0) {
    return "";
  } else if (items.length === 1) {
    return items[0];
  } else {
    const allButLast = items.slice(0, -1).join(separator);
    const lastItem = items[items.length - 1];
    return `${allButLast}${lastSeparator}${lastItem}`;
  }
}
