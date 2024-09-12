import DateTime from "../util/dataTime";

export abstract class BaseType<T = any, K extends string = string> {
  constructor(public value = null as T, public type: K) {}

  abstract isInt(): this is DataTypeInt<number>;
  abstract isString(): this is DataTypeString<string>;
  abstract isList(): this is DataTypeList<BaseType>;
  abstract isMap<
    KV extends Record<string, BaseType>
  >(): this is DataTypeMap<KV>;
  abstract isEnum<K extends string, V extends K>(): this is DataTypeEnum<K, V>;
  abstract isBoolean(): this is DataTypeBoolean<boolean>;
  abstract isDateTime(): this is DataTypeDateTime<DateTime>
}

export class DataTypeInt<T extends number> extends BaseType<T | null, "int"> {
  isInt(): this is DataTypeInt<number> { return true; }
  isString(): this is DataTypeString<string> { return false; }
  isList(): this is DataTypeList<BaseType> { return false; }
  isMap<KV extends Record<string, BaseType>>(): this is DataTypeMap<KV> { return false; }
  isEnum<K extends string, V extends K>(): this is DataTypeEnum<K, V> { return false; }
  isBoolean(): this is DataTypeBoolean<boolean> { return false; }
  isDateTime(): this is DataTypeDateTime<DateTime> { return false; }

  constructor(value: T | null = null) {
    super(value, "int");
  }
}

export class DataTypeString<T extends string> extends BaseType<
  T | null,
  "string"
> {
  isInt(): this is DataTypeInt<number> { return false; }
  isString(): this is DataTypeString<string> { return true; }
  isList(): this is DataTypeList<BaseType> { return false; }
  isMap<KV extends Record<string, BaseType>>(): this is DataTypeMap<KV> { return false; }
  isEnum<K extends string, V extends K>(): this is DataTypeEnum<K, V> { return false; }
  isBoolean(): this is DataTypeBoolean<boolean> { return false; }
  isDateTime(): this is DataTypeDateTime<DateTime> { return false; }

  constructor(value: T | null = null) {
    super(value, "string");
  }
}

export class DataTypeList<V extends BaseType> extends BaseType<V[], "array"> {
  isInt(): this is DataTypeInt<number> { return false; }
  isString(): this is DataTypeString<string> { return false; }
  isList(): this is DataTypeList<BaseType> { return true; }
  isMap<KV extends Record<string, BaseType>>(): this is DataTypeMap<KV> { return false; }
  isEnum<K extends string, V extends K>(): this is DataTypeEnum<K, V> { return false; }
  isBoolean(): this is DataTypeBoolean<boolean> { return false; }
  isDateTime(): this is DataTypeDateTime<DateTime> { return false; }

  constructor(public elements: V[], value = [] as V[], isUnique?: boolean) {
    super(value, "array");

    if(isUnique != undefined && isUnique) {
      console.log("List:isUnique");
    
      elements = Array.from(new Set(elements))
    }

    const hasEnum = elements.some((type) => type.type == "enum");
    const hasNonEnum = elements.some((type) => type.type != "enum");

    if (hasEnum && hasNonEnum) {
      throw new Error("Array cannot have both enum and non-enum types");
    }
  }
}

export class DataTypeMap<KV extends Record<string, BaseType>> extends BaseType<
  KV,
  "map"
> {
  isInt(): this is DataTypeInt<number> { return false; }
  isString(): this is DataTypeString<string> { return false; }
  isList(): this is DataTypeList<BaseType> { return false; }
  isMap<KV extends Record<string, BaseType>>(): this is DataTypeMap<KV> { return true; }
  isEnum<K extends string, V extends K>(): this is DataTypeEnum<K, V> { return false; }
  isBoolean(): this is DataTypeBoolean<boolean> { return false; }
  isDateTime(): this is DataTypeDateTime<DateTime> { return false; }

  constructor(value: KV) {
    super(value, "map");
  }
}

export class DataTypeEnum<
  K extends string | number,
  V extends K
> extends BaseType<V, "enum"> {
  isInt(): this is DataTypeInt<number> { return false; }
  isString(): this is DataTypeString<string> { return false; }
  isList(): this is DataTypeList<BaseType> { return false; }
  isMap<KV extends Record<string, BaseType>>(): this is DataTypeMap<KV> { return false; }
  isEnum<K extends string, V extends K>(): this is DataTypeEnum<K, V> { return true; }
  isBoolean(): this is DataTypeBoolean<boolean> { return false; }
  isDateTime(): this is DataTypeDateTime<DateTime> { return false; }

  constructor(public elements: K[], public value: V) {
    super(value, "enum");
  }
}

export class DataTypeBoolean<V extends boolean> extends BaseType<V, "boolean"> {
  isInt(): this is DataTypeInt<number> { return false; }
  isString(): this is DataTypeString<string> { return false; }
  isList(): this is DataTypeList<BaseType> { return false; }
  isMap<KV extends Record<string, BaseType>>(): this is DataTypeMap<KV> {
    return false; }
  isEnum<K extends string, V extends K>(): this is DataTypeEnum<K, V> { return false; }
  isBoolean(): this is DataTypeBoolean<boolean> { return true; }
  isDateTime(): this is DataTypeDateTime<DateTime> { return false; }

  constructor(public value: V) {
    super(value, "boolean");
  }
}

export class DataTypeDateTime<V extends DateTime> extends BaseType<V | null, "datetime"> {
  isInt(): this is DataTypeInt<number> { return false; }
  isString(): this is DataTypeString<string> { return false; }
  isList(): this is DataTypeList<BaseType> { return false; }
  isMap<KV extends Record<string, BaseType>>(): this is DataTypeMap<KV> {
    return false; }
  isEnum<K extends string, V extends K>(): this is DataTypeEnum<K, V> { return false; }
  isBoolean(): this is DataTypeBoolean<boolean> { return false; }
  isDateTime(): this is DataTypeDateTime<DateTime> { return true; }

  constructor(public value: V | null = null) {
    super(value, "datetime");
  }
}

export type Infer<T> = {
  [Key in keyof T]: T[Key] extends DataTypeInt<number>
    ? number
    : T[Key] extends DataTypeString<string>
    ? string
    : T[Key] extends DataTypeBoolean<boolean>
    ? boolean
    : T[Key] extends DataTypeEnum<infer K1, any>
    ? K1
    : T[Key] extends DataTypeDateTime<infer K2>
    ? K2
    : T[Key] extends DataTypeList<infer V>
    ? V extends DataTypeMap<infer KV0>
      ? Infer<KV0>[]
      : V extends DataTypeEnum<infer K1, any>
      ? K1[]
      : V extends DataTypeString<string>
      ? string[]
      : V extends DataTypeInt<number>
      ? number[]
      : T[Key] extends DataTypeBoolean<boolean>
      ? boolean[]
      : T[Key] extends DataTypeDateTime<infer K2>
      ? K2[]
      : never
    : T[Key] extends DataTypeMap<infer KV0>
    ? Infer<KV0>
    : never;
};