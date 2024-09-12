interface DurationOptions {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
  microseconds?: number;
}

export default class Duration {
  private static readonly microsecondsPerMillisecond = 1000;
  private static readonly millisecondsPerSecond = 1000;
  private static readonly secondsPerMinute = 60;
  private static readonly minutesPerHour = 60;
  private static readonly hoursPerDay = 24;
  private static readonly microsecondsPerSecond =
    Duration.microsecondsPerMillisecond * Duration.millisecondsPerSecond;
  private static readonly microsecondsPerMinute =
    Duration.microsecondsPerSecond * Duration.secondsPerMinute;
  private static readonly microsecondsPerHour =
    Duration.microsecondsPerMinute * Duration.minutesPerHour;
  private static readonly microsecondsPerDay =
    Duration.microsecondsPerHour * Duration.hoursPerDay;

  private readonly _microseconds: number;

  constructor({
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0,
    microseconds = 0,
  }: DurationOptions) {
    this._microseconds =
      microseconds +
      Duration.microsecondsPerMillisecond * milliseconds +
      Duration.microsecondsPerSecond * seconds +
      Duration.microsecondsPerMinute * minutes +
      Duration.microsecondsPerHour * hours +
      Duration.microsecondsPerDay * days;
  }

  public get isNegative() {
    return this._microseconds < 0;
  }

  public static zero(): Duration {
    return new Duration({ microseconds: 0 });
  }

  public abs() {
    return new Duration({ microseconds: Math.abs(this._microseconds) });
  }

  public plus(other: Duration): Duration {
    return new Duration({
      microseconds: this._microseconds + other._microseconds,
    });
  }

  public minus(other: Duration): Duration {
    return new Duration({
      microseconds: this._microseconds - other._microseconds,
    });
  }

  public multipliedBy(factor: number): Duration {
    return new Duration({
      microseconds: Math.round(this._microseconds * factor),
    });
  }

  public dividedBy(quotient: number): Duration {
    if (quotient === 0) {
      throw new Error("Integer division by zero");
    }
    return new Duration({
      microseconds: Math.floor(this._microseconds / quotient),
    });
  }

  public lessThan(other: Duration): boolean {
    return this._microseconds < other._microseconds;
  }

  public greaterThan(other: Duration): boolean {
    return this._microseconds > other._microseconds;
  }

  public lessThanOrEqual(other: Duration): boolean {
    return this._microseconds <= other._microseconds;
  }

  public greaterThanOrEqual(other: Duration): boolean {
    return this._microseconds >= other._microseconds;
  }

  public get inDays(): number {
    return Math.floor(this._microseconds / Duration.microsecondsPerDay);
  }

  public get inHours(): number {
    return Math.floor(this._microseconds / Duration.microsecondsPerHour);
  }

  public get inMinutes(): number {
    return Math.floor(this._microseconds / Duration.microsecondsPerMinute);
  }

  public get inSeconds(): number {
    return Math.floor(this._microseconds / Duration.microsecondsPerSecond);
  }

  public get inMilliseconds(): number {
    return Math.floor(this._microseconds / Duration.microsecondsPerMillisecond);
  }

  public get inMicroseconds(): number {
    return this._microseconds;
  }

  public equals(other: Duration): boolean {
    return this._microseconds === other._microseconds;
  }

  public toString(): string {
    let microseconds = this._microseconds;
    let sign = "";
    let negative = microseconds < 0;

    let hours = Math.floor(microseconds / Duration.microsecondsPerHour);
    microseconds = microseconds % Duration.microsecondsPerHour;

    if (negative) {
      hours = -hours;
      microseconds = -microseconds;
      sign = "-";
    }

    let minutes = Math.floor(microseconds / Duration.microsecondsPerMinute);
    microseconds = microseconds % Duration.microsecondsPerMinute;

    let minutesPadding = minutes < 10 ? "0" : "";

    let seconds = Math.floor(microseconds / Duration.microsecondsPerSecond);
    microseconds = microseconds % Duration.microsecondsPerSecond;

    let secondsPadding = seconds < 10 ? "0" : "";
    let microsecondsText = microseconds.toString().padStart(6, "0");

    return `${sign}${hours}:${minutesPadding}${minutes}:${secondsPadding}${seconds}.${microsecondsText}`;
  }

  [Symbol.for("nodejs.util.inspect.custom")]() {
    return `${this.constructor.name} { ${this} }`;
  }
}
