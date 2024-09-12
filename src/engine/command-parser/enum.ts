export type Metadata = { [key: string]: any };

export class Enum<V extends string, Meta extends Metadata> {
  private static values: Enum<any, Metadata>[] = [];
  public readonly value: V;
  public readonly metadata: Meta;

  protected constructor(value: V, metadata = {} as Meta) {
    this.value = value;
    this.metadata = metadata;
    Enum.values.push(this);
  }

  public toString(): string {
    return String(this.value);
  }

  public static valuesOf<Meta extends Metadata, T extends Enum<any, Meta>>(): T[] {
    return this.values as T[];
  }

  public static contains(value: any): boolean {
    return this.values.some(enumValue => enumValue.value === value);
  }

  public static findBy<Meta extends Metadata, T extends Enum<any, Meta>>(token: Enum<string, Meta>): T | undefined {
    return this.values.find(enumValue => enumValue.value === token.value) as T | undefined;
  }

  public static serialize<Meta extends Metadata, T extends Enum<any, Meta>>(enumValue: T): string {
    return enumValue.toString();
  }

  public static deserialize<Meta extends Metadata, T extends Enum<any, Meta>>(value: string, enumType: { new (...args: any[]): T }): T | undefined {
    return this.valuesOf<Meta, T>().find(enumValue => enumValue.toString() === value);
  }
}