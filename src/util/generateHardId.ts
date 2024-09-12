export default function generateHardId(length: number): string {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const random = new SecureRandom();

  let id = "";
  let lastChar = "";

  while (id.length < length) {
    const newChar = characters[random.nextInt(characters.length)];

    if (newChar === lastChar) {
      continue;
    }

    let charCode = newChar.charCodeAt(0);
    let shift = random.nextInt(10) - 5;
    let newCharCode = charCode + shift;

    if (newCharCode < 48) {
      newCharCode = 48 + (48 - newCharCode);
    } else if (newCharCode > 122) {
      newCharCode = 122 - (newCharCode - 122);
    }

    const char = String.fromCharCode(newCharCode);

    if (!characters.includes(char)) {
      continue;
    }

    id += char;
    lastChar = newChar;
  }

  return id;
}

class SecureRandom {
  nextInt(max: number): number {
    return Math.floor(Math.random() * max);
  }
}
