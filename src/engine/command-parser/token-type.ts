import { Enum, Metadata } from "./enum";

export class TokenType<Meta extends Metadata> extends Enum<string, Meta> {
  public static readonly STRING = new TokenType('STRING');
  public static readonly INT = new TokenType('INT');
  public static readonly FLOAT = new TokenType('FLOAT');
  public static readonly BOOLEAN = new TokenType('BOOLEAN');
  public static readonly ANY = new TokenType('ANY');
  public static readonly FLAG = new TokenType('FLAG');
  public static readonly HEX = new TokenType('HEX');
  public static readonly ROLE = new TokenType('ROLE');
  public static readonly USER = new TokenType('USER');
  public static readonly CHANNEL = new TokenType('CHANNEL');
  public static readonly LIST = new TokenType('LIST');

  public static readonly SECONDS = new TokenType('SECONDS', { description: "time mark" });
  public static readonly MINUTES = new TokenType('MINUTES', { description: "time mark" });
  public static readonly HOURS = new TokenType('HOURS', { description: "time mark" });
  public static readonly DAYS = new TokenType('DAYS', { description: "time mark" });
  public static readonly MONTHS = new TokenType('MONTHS', { description: "time mark" });
  public static readonly YEARS = new TokenType('YEARS', { description: "time mark" });
  public static readonly TIME = new TokenType('TIME', { description: "base time mark" });
}

export class Operator<Meta extends Metadata> extends Enum<string, Meta> {
  public static readonly LEFT_TRIANGLE_BRACKET = new Operator('LEFT_TRIANGLE_BRACKET', { value: "<" });
  public static readonly RIGHT_TRIANGLE_BRACKET = new Operator('RIGHT_TRIANGLE_BRACKET', { value: ">" });
  public static readonly MINUS = new Operator('MINUS', { value: "-" });
  public static readonly DOT = new Operator('DOT', { value: "." });
  public static readonly DOG = new Operator('DOG', { value: "@" });
  public static readonly AMPERSANT = new Operator('AMPERSANT', { value: "&" });
  public static readonly EXCLAMATION_MARK = new Operator('EXCLAMATION_MARK', { value: "!" });
  public static readonly HASH = new Operator('HASH', { value: "#" });
  public static readonly COMMA= new Operator('COMMA', { value: "," });

  static toMapList<Meta extends Metadata>() {
    const data: { char: string, token: Enum<string, Meta> }[] = [];

    for(const _enum of this.valuesOf()) {
      if(_enum instanceof this) {
        data.push({
          char: _enum.metadata.value,
          token: _enum
        });
      }
    }

    return data;
  }
}

export class Special<Meta extends Metadata> extends Enum<string, Meta>  {
  public static readonly EOF = new Special('EOF', { description: "end of file" });
  public static readonly PREFIX = new Special('PREFIX', { description: "prefix" });
  public static readonly COMMAND = new Special('COMMAND', { description: "command" });
}

export class Token<Meta extends Metadata> {
  constructor(
    public value: string, 
    public type: Enum<string, Meta>
  ) {}
}