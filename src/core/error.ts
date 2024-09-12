interface IEntityErrorHandler { }

class EntityErrorHandler extends Error {
  constructor(
    public message: string,
    public payload: IEntityErrorHandler = {},
  ) {
    super(message);
    super.name = this.constructor.name;
  }
}

export class EmptyDocument extends EntityErrorHandler {}
export class UserNotFound extends EntityErrorHandler {}
export class UserIsBlocked extends EntityErrorHandler {}
export class UserSalfException extends EntityErrorHandler {}
export class AmountIsOutOfRange extends EntityErrorHandler {}
export class DailyLimitReached extends EntityErrorHandler {}
export class UniqueException extends EntityErrorHandler {}
export class PrimeException extends EntityErrorHandler {}
