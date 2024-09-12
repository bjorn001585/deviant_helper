/**
 * Функция для генерации случайных байтов
 * @param length - количество байтов
 * @returns массив случайных байтов
 */
function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Функция для генерации уникального идентификатора (UUIDv4)
 * @returns строка с уникальным идентификатором
 */
export function generateUUIDv4(): string {
  const bytes = getRandomBytes(16);

  // Устанавливаем версии и варианта UUID
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Версия 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Вариант 1

  // Преобразуем байты в строку UUID
  const uuid = [...bytes]
    .map((byte, index) => {
      const hex = byte.toString(16).padStart(2, "0");
      if (index === 4 || index === 6 || index === 8 || index === 10) {
        return `-${hex}`;
      }
      return hex;
    })
    .join("");

  return uuid;
}
