import { getMoscowTime } from "./getMoscowTime";

export class LongTimeout {
  private MAX_TIMEOUT = 2147483647; // Максимальное значение для setTimeout (~24.8 дня)
  private currentTimeout: NodeJS.Timeout | null = null;
  private remainingDelay: number;
  private startTime: number | null = null;

  constructor(private callback: () => void, delay: number) {
    this.remainingDelay = delay;
    this.scheduleNextTimeout(this.remainingDelay);
  }

  private executeCallback = () => {
    try {
      this.callback();
    } catch (error) {
      console.error("Error executing callback:", error);
    }
  };

  private scheduleNextTimeout = (remainingDelay: number) => {
    const moscowTime = getMoscowTime()
    this.startTime = moscowTime.getTime();
    if (remainingDelay > this.MAX_TIMEOUT) {
      this.currentTimeout = setTimeout(() => {
        this.scheduleNextTimeout(remainingDelay - this.MAX_TIMEOUT);
      }, this.MAX_TIMEOUT);
    } else {
      this.currentTimeout = setTimeout(this.executeCallback, remainingDelay);
    }
  };

  public clear = () => {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  };

  public pause = () => {
    const moscowTime = getMoscowTime()
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
      if (this.startTime !== null) {
        this.remainingDelay -= moscowTime.getTime() - this.startTime;
      }
    }
  };

  public resume = () => {
    if (this.remainingDelay > 0) {
      this.scheduleNextTimeout(this.remainingDelay);
    }
  };

  public getRemainingTime = (): number => {
    const moscowTime = getMoscowTime()
    if (this.currentTimeout && this.startTime !== null) {
      return this.remainingDelay - (moscowTime.getTime() - this.startTime);
    }
    return this.remainingDelay;
  };
}