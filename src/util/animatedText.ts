export default function animationText(width: number, messages: string[]) {
  const frames: string[] = [];

  const fillSpace = "-";

  for (let message of messages) {
    let lastIndex = 0;

    if (message.length < width) {
      const fill = Math.floor((width - message.length) / 2);
      message = `${fillSpace.repeat(fill)}${message}${fillSpace.repeat(fill)}`;
    }

    for (let i = 0; i < message.length; i++) {
      const fix = Math.max(0, i - width);
      const frame1 = message.slice(fix, i).padStart(width, fillSpace);
      frames.push(frame1);

      lastIndex = fix;
    }

    for (let i = 0; i < message.length; i++) {
      frames.push(
        message
          .slice(i + lastIndex + 1, i + lastIndex + width)
          .padEnd(width, fillSpace),
      );
    }
  }

  return new Proxy(frames, {
    get(target, index) {
      const position = typeof index == "string" ? parseInt(index) : 0;
      return target[position % target.length];
    },
  });
}
