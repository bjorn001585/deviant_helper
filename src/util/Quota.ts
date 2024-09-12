import DateTime from "./dataTime";
import Duration from "./duration";

class RequestData {
  constructor(
    public id: string,
    public timestamp: DateTime
  ) {}
}

type RequertTimestams = {
  [key: string]: RequestData[]
}

export class RequestQuota {
  private requestTimestamps: RequertTimestams = {};

  constructor(
    private requestsPerInterval: number,
    private interval: Duration
  ) {}

  public setDuration(duration: Duration) {
    this.interval = duration;
  }

  public canMakeRequest(id: string) {
    this.cleanUpExpiredRequests(id);

    const userRequests = this.requestTimestamps[id] ?? [];
    if(userRequests.length < this.requestsPerInterval) {
      userRequests.push(new RequestData(id, new DateTime()));
      this.requestTimestamps[id] = userRequests;
    } else {
      const oldestRequestTime = userRequests[0].timestamp;
      const currentTime = new DateTime();
      const timeDifference = currentTime.difference(oldestRequestTime);

      console.log(timeDifference);

      if(timeDifference.isNegative) {
        this.resetQuota(id)

        userRequests.push(new RequestData(id, currentTime))
        this.requestTimestamps[id] = userRequests

        return true
      } else {
        return false
      }
    }
  }

  private removeWhere<T>(list: T[], predicate: (item: T) => boolean): T[] {
    for (let i = list.length - 1; i >= 0; i--) {
      if (predicate(list[i])) {
        list.splice(i, 1);
      }
    }

    return list;
  }

  private cleanUpExpiredRequests(id: string): void {
    const currentTime = new DateTime();
    const userRequests = this.requestTimestamps[id] ?? [];

    const v = this.removeWhere(userRequests, request => request.timestamp.isBefore(currentTime.subtract(this.interval)))

    // console.log(v);

    this.requestTimestamps[id] = v;
  }

  public getRemainingRequests(id: string): number {
    this.cleanUpExpiredRequests(id);

    const userRequests = this.requestTimestamps[id] ?? [];
    return this.requestsPerInterval - userRequests.length;
  }

  public getTimeUntilNextRequest(id: string): Duration {
    this.cleanUpExpiredRequests(id);

    const userRequests = this.requestTimestamps[id] ?? [];

    if(userRequests.length < this.requestsPerInterval) {
      return Duration.zero();
    } else {
      const oldestRequestTime = userRequests[0].timestamp
      const nextRequestTime = oldestRequestTime.add(this.interval);
      const currentTime = new DateTime();

      return nextRequestTime.difference(currentTime)
    }
  }

  public resetQuota(id?: string) {
    if(id != null) {
      delete this.requestTimestamps[id];
    } else {
      for(const id of Object.keys(this.requestTimestamps)) {
        delete this.requestTimestamps[id]
      }
    }
  }
}