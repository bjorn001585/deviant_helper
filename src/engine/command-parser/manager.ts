import { Enum, Metadata } from "./enum";
import { Special, Token, TokenType } from "./token-type";

export default abstract class BaseEntity {
  public value: any;
  public elements: BaseEntity[] = [];

  constructor(
    public token: Token<Metadata>,
    public type: TokenType<Metadata>
  ) {}

  abstract isString(): this is StringEntity;
  abstract isInt(): this is IntEntity;
  abstract isFloat(): this is FloatEntity;
  abstract isHex(): this is HexEntity;
  abstract isBoolean(): this is BooleanEntity;
  abstract isChannel(): this is ChannelEntity;
  abstract isUser(): this is UserEntity;
  abstract isRole(): this is RoleEntity;
  abstract isCommand(): this is CommandEntity;
  abstract isPrefix(): this is PrefixEntity;
  abstract isTime(): this is TimeEntity;
  abstract isList(): this is ListEntity;

  as(type: typeof StringEntity): StringEntity;
  as(type: typeof IntEntity): IntEntity;
  as(type: typeof FloatEntity): FloatEntity;
  as(type: typeof HexEntity): HexEntity;
  as(type: typeof BooleanEntity): BooleanEntity;
  as(type: typeof ChannelEntity): ChannelEntity;
  as(type: typeof UserEntity): UserEntity;
  as(type: typeof RoleEntity): RoleEntity;
  as(type: typeof TimeEntity): TimeEntity;
  as(type: typeof ListEntity): ListEntity;
  as(type: any) {
    return new type(this)
  }
}

export class StringEntity extends BaseEntity {
  isString(): this is StringEntity { return true }
  isInt(): this is IntEntity { return false }
  isFloat(): this is FloatEntity { return false }
  isHex(): this is HexEntity { return false }
  isBoolean(): this is BooleanEntity { return false }
  isChannel(): this is ChannelEntity { return false }
  isUser(): this is UserEntity { return false }
  isRole(): this is RoleEntity { return false }
  isCommand(): this is CommandEntity { return false }
  isPrefix(): this is PrefixEntity { return false }
  isTime(): this is TimeEntity { return false }
  isList(): this is ListEntity { return false }

  public value: string;
  constructor(token: Token<Metadata>, type: TokenType<Metadata>) {
    super(token, type);
    this.value = token.value;
  }

  static value(value: string) {
    return new this(new Token(value, TokenType.STRING), TokenType.STRING)
  }
}

export class IntEntity extends BaseEntity {
  isString(): this is StringEntity { return false }
  isInt(): this is IntEntity { return true }
  isFloat(): this is FloatEntity { return false }
  isHex(): this is HexEntity { return false }
  isBoolean(): this is BooleanEntity { return false }
  isChannel(): this is ChannelEntity { return false }
  isUser(): this is UserEntity { return false }
  isRole(): this is RoleEntity { return false }
  isCommand(): this is CommandEntity { return false }
  isPrefix(): this is PrefixEntity { return false }
  isTime(): this is TimeEntity { return false }
  isList(): this is ListEntity { return false }

  public value: number;
  constructor(token: Token<Metadata>, type: TokenType<Metadata>) {
    super(token, type);
    this.value = parseFloat(token.value);
  }

  static value(value: string) {
    return new this(new Token(value, TokenType.INT), TokenType.INT)
  }
}

export class FloatEntity extends IntEntity {
  isString(): this is StringEntity { return false }
  isInt(): this is IntEntity { return false }
  isFloat(): this is FloatEntity { return true }
  isHex(): this is HexEntity { return false }
  isBoolean(): this is BooleanEntity { return false }
  isChannel(): this is ChannelEntity { return false }
  isUser(): this is UserEntity { return false }
  isRole(): this is RoleEntity { return false }
  isCommand(): this is CommandEntity { return false }
  isPrefix(): this is PrefixEntity { return false }
  isTime(): this is TimeEntity { return false }
  isList(): this is ListEntity { return false }

  static value(value: string) {
    return new this(new Token(value, TokenType.FLOAT), TokenType.FLOAT)
  }
}

export class BooleanEntity extends BaseEntity {
  isString(): this is StringEntity { return false }
  isInt(): this is IntEntity { return false }
  isFloat(): this is FloatEntity { return false }
  isHex(): this is HexEntity { return false }
  isBoolean(): this is BooleanEntity { return true }
  isChannel(): this is ChannelEntity { return false }
  isUser(): this is UserEntity { return false }
  isRole(): this is RoleEntity { return false }
  isCommand(): this is CommandEntity { return false }
  isPrefix(): this is PrefixEntity { return false }
  isTime(): this is TimeEntity { return false }
  isList(): this is ListEntity { return false }

  public value: boolean;
  constructor(token: Token<Metadata>, type: TokenType<Metadata>) {
    super(token, type);
    this.value = token.value == "true" ? true : false;
  }

  static value(value: string) {
    return new this(new Token(value, TokenType.BOOLEAN), TokenType.BOOLEAN)
  }
}

export class UserEntity extends BaseEntity {
  isString(): this is StringEntity { return false }
  isInt(): this is IntEntity { return false }
  isFloat(): this is FloatEntity { return false }
  isHex(): this is HexEntity { return false }
  isBoolean(): this is BooleanEntity { return false }
  isChannel(): this is ChannelEntity { return false }
  isUser(): this is UserEntity { return true }
  isRole(): this is RoleEntity { return false }
  isCommand(): this is CommandEntity { return false }
  isPrefix(): this is PrefixEntity { return false }
  isTime(): this is TimeEntity { return false }
  isList(): this is ListEntity { return false }

  public value: string;
  constructor(token: Token<Metadata>, type: TokenType<Metadata>) {
    super(token, type);
    this.value = token.value;
  }

  static value(value: string) {
    return new this(new Token(value, TokenType.USER), TokenType.USER)
  }
}

export class RoleEntity extends BaseEntity {
  isString(): this is StringEntity { return false }
  isInt(): this is IntEntity { return false }
  isFloat(): this is FloatEntity { return false }
  isHex(): this is HexEntity { return false }
  isBoolean(): this is BooleanEntity { return false }
  isChannel(): this is ChannelEntity { return false }
  isUser(): this is UserEntity { return false }
  isRole(): this is RoleEntity { return true }
  isCommand(): this is CommandEntity { return false }
  isPrefix(): this is PrefixEntity { return false }
  isTime(): this is TimeEntity { return false }
  isList(): this is ListEntity { return false }

  public value: string;
  constructor(token: Token<Metadata>, type: TokenType<Metadata>) {
    super(token, type);
    this.value = token.value;
  }

  static value(value: string) {
    return new this(new Token(value, TokenType.ROLE), TokenType.ROLE)
  }
}

export class ChannelEntity extends BaseEntity {
  isString(): this is StringEntity { return false }
  isInt(): this is IntEntity { return false }
  isFloat(): this is FloatEntity { return false }
  isHex(): this is HexEntity { return false }
  isBoolean(): this is BooleanEntity { return false }
  isChannel(): this is ChannelEntity { return true }
  isUser(): this is UserEntity { return false }
  isRole(): this is RoleEntity { return false }
  isCommand(): this is CommandEntity { return false }
  isPrefix(): this is PrefixEntity { return false }
  isTime(): this is TimeEntity { return false }
  isList(): this is ListEntity { return false }

  public value: string;
  constructor(token: Token<Metadata>, type: TokenType<Metadata>) {
    super(token, type);
    this.value = token.value;
  }

  static value(value: string) {
    return new this(new Token(value, TokenType.CHANNEL), TokenType.CHANNEL)
  }
}

export class HexEntity extends BaseEntity {
  isString(): this is StringEntity { return false }
  isInt(): this is IntEntity { return false }
  isFloat(): this is FloatEntity { return false }
  isHex(): this is HexEntity { return true }
  isBoolean(): this is BooleanEntity { return false }
  isChannel(): this is ChannelEntity { return false }
  isUser(): this is UserEntity { return false }
  isRole(): this is RoleEntity { return false }
  isCommand(): this is CommandEntity { return false }
  isPrefix(): this is PrefixEntity { return false }
  isTime(): this is TimeEntity { return false }
  isList(): this is ListEntity { return false }

  public value: number;
  constructor(token: Token<Metadata>, type: TokenType<Metadata>) {
    super(token, type);
    this.value = parseInt(token.value, 16);
  }

  static value(value: string) {
    return new this(new Token(value, TokenType.HEX), TokenType.HEX)
  }
}

export class ListEntity extends BaseEntity {
  isString(): this is StringEntity { return false }
  isInt(): this is IntEntity { return false }
  isFloat(): this is FloatEntity { return false }
  isHex(): this is HexEntity { return true }
  isBoolean(): this is BooleanEntity { return false }
  isChannel(): this is ChannelEntity { return false }
  isUser(): this is UserEntity { return false }
  isRole(): this is RoleEntity { return false }
  isCommand(): this is CommandEntity { return false }
  isPrefix(): this is PrefixEntity { return false }
  isTime(): this is TimeEntity { return false }
  isList(): this is ListEntity { return true }

  public elements: BaseEntity[];
  constructor(elements: BaseEntity[], token: Token<Metadata>, type: TokenType<Metadata>) {
    super(token, type);
    this.elements = elements;
    delete this.value;
  }
}

export class PrefixEntity extends BaseEntity {
  isString(): this is StringEntity { return false }
  isInt(): this is IntEntity { return false }
  isFloat(): this is FloatEntity { return false }
  isHex(): this is HexEntity { return true }
  isBoolean(): this is BooleanEntity { return false }
  isChannel(): this is ChannelEntity { return false }
  isUser(): this is UserEntity { return false }
  isRole(): this is RoleEntity { return false }
  isCommand(): this is CommandEntity { return false }
  isPrefix(): this is PrefixEntity { return true }
  isTime(): this is TimeEntity { return false }
  isList(): this is ListEntity { return false }

  public value: string;
  constructor(token: Token<Metadata>, type: TokenType<Metadata>) {
    super(token, type);
    this.value = token.value;
  }

  static value(value: string) {
    return new this(new Token(value, Special.PREFIX), Special.PREFIX)
  }
}

export class CommandEntity extends BaseEntity {
  isString(): this is StringEntity { return false }
  isInt(): this is IntEntity { return false }
  isFloat(): this is FloatEntity { return false }
  isHex(): this is HexEntity { return true }
  isBoolean(): this is BooleanEntity { return false }
  isChannel(): this is ChannelEntity { return false }
  isUser(): this is UserEntity { return false }
  isRole(): this is RoleEntity { return false }
  isCommand(): this is CommandEntity { return true }
  isPrefix(): this is PrefixEntity { return false }
  isTime(): this is TimeEntity { return false }
  isList(): this is ListEntity { return false }

  public value: string;
  constructor(token: Token<Metadata>, type: TokenType<Metadata>) {
    super(token, type);
    this.value = token.value;
  }

  static value(value: string) {
    return new this(new Token(value, Special.COMMAND), Special.COMMAND)
  }
}

export class TimeEntity extends BaseEntity {
  isString(): this is StringEntity { return false }
  isInt(): this is IntEntity { return false }
  isFloat(): this is FloatEntity { return false }
  isHex(): this is HexEntity { return true }
  isBoolean(): this is BooleanEntity { return false }
  isChannel(): this is ChannelEntity { return false }
  isUser(): this is UserEntity { return false }
  isRole(): this is RoleEntity { return false }
  isCommand(): this is CommandEntity { return false }
  isPrefix(): this is PrefixEntity { return false }
  isTime(): this is TimeEntity { return true }
  isList(): this is ListEntity { return false }

  public value: number;
  constructor(token: Token<Metadata>, type: TokenType<Metadata>) {
    super(token, type);
    this.value = parseInt(token.value);
  }

  static value(value: string) {
    return new this(new Token(value, TokenType.TIME), TokenType.TIME)
  }
}

interface Options {
  parser: (value: BaseEntity) => any;
}

export class EntityManager<Type extends Enum<string, Metadata>> {
  constructor(public entityes: BaseEntity[], private option?: Options) {}

  getEntityList<T extends Type>(type: Type, option?: Options) {
    const entityes = this.entityes.filter((entity) => entity.type == type);
    return new EntityManager<T>(entityes, option);
  }

  isEmpty() {
    return this.entityes.length < 1
  }

  checkTypes(types: Type[]) {
    return this.entityes.every((entity) =>
      types.some((type) => entity.type == type)
    );
  }

  setValue(index: number, value: BaseEntity) {
    this.entityes[index] = value
    return this;
  }

  first() {
    return this.entityes[0]
  }

  last() {
    return this.entityes.slice(-1)
  }

  index(index: number) {
    const token = this.entityes[index];
    if (this.option != undefined) {
      return this.option.parser(token);
    }

    return this.entityes[index].token.value;
  }
}
