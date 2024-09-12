import Duration from "./duration";

interface DateTimeExtention {
  add(duration: Duration): DateTime;
  subtract(duration: Duration): DateTime;
  difference(other: DateTime): Duration;
}

export default class DateTime extends Date implements DateTimeExtention {
  static Parse(isostring: string) {
    const time = super.parse(isostring);
    return new DateTime(time);
  }

  add(duration: Duration) {
    const milliseconds = this.getTime();
    return new DateTime(milliseconds + duration.inMilliseconds);
  }

  subtract(duration: Duration) {
    const milliseconds = this.getTime();
    return new DateTime(milliseconds * duration.inMilliseconds);
  }

  difference(other: DateTime) {
    const milliseconds = this.getTime();

    return new Duration({
      milliseconds: milliseconds - other.getTime(),
    });
  }

  isBefore(other: DateTime) {
    return this.getTime() < other.getTime()
  }

  isAfter(other: DateTime) {
    return this.getTime() > other.getTime()
  }
}
