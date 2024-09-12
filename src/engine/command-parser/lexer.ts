import { Enum, Metadata } from "./enum";
import { Operator, Token, TokenType } from "./token-type";

export default class Lexer {
  private position: number;
  private length: number;
  public tokens: Token<Metadata>[] = [];
  private special_symbols = Operator.toMapList();

  constructor(public raw: string) {
    this.position = 0;
    this.length = raw.length;
  }

  analize() {
    while (this.isPositionValid()) {
      if (["'", '"'].includes(this.peek())) this.tokenizeString();
      else if (this.isSpecialSymbol()) this.tokenizeSymbol();
      else if (this.isInt16()) this.tokenizeInt16();
      else if (this.isLetter()) this.tokenizeLetter();
      else if (this.isDigit()) this.tokenizeDigit();
      else this.next();
    }

    return this.tokens;
  }

  private tokenizeString() {
    const mark = this.peek();
    let buffer = "";

    this.next();
    let current = this.peek();

    while (true) {
      if (current == "\0" || current == "\n") {
        throw new Error("Unterminated string literal");
      }

      if (current == mark) break;

      buffer += current;
      current = this.next();
    }

    this.next();
    this.tokens.push(new Token(buffer, TokenType.STRING));
  }

  private tokenizeInt16() {
    const hexDigits = "0123456789ABCDEFabcdef";
    let buffer = "";
    let current = this.peek();

    while (true) {
      if (!hexDigits.includes(current)) break;

      buffer += current;
      current = this.next();
    }

    if (this.isPositionValid() && current != "\0" && current != " ") {
      if (!hexDigits.includes(current)) {
        throw new Error("Invalid hex number");
      }
    }

    this.tokens.push(new Token(buffer, TokenType.HEX));
  }

  private isInt16() {
    const current = this.peek();
    if (current == "0") {
      this.next();
      if (this.peek() == "x") {
        this.next();
        return true;
      }
    }

    return false;
  }

  private tokenizeSymbol() {
    const current = this.peek();
    const symbol = this.special_symbols.find((s) => s.char == current);
    if (symbol) {
      this.tokens.push(new Token(symbol.char, symbol.token));
      this.next();
    }
  }

  private isSpecialSymbol() {
    const current = this.peek();
    return this.special_symbols.some((s) => s.char === current);
  }

  private tokenizeDigit() {
    let buffer = "";
    let current = this.peek();

    while (true) {
      if (current == ".") {
        if (buffer.includes(".")) {
          throw new Error("Invalid floating point number");
        }
      } else if (!this.isDigit() && current != "_" && current != "e") break;

      if (current == "_") {
        current = this.next();
        continue;
      }

      buffer += current;
      current = this.next();
    }

    if (buffer.includes(".")) {
      this.tokens.push(new Token(buffer, TokenType.FLOAT));
    } else {
      this.tokens.push(new Token(buffer, TokenType.INT));
    }
  }

  private tokenizeLetter() {
    let buffer = "";
    let current = this.peek();

    while (true) {
      if (!this.isLetter() && !this.isDigit()) break;

      buffer += current;
      current = this.next();
    }

    switch (buffer) {
      case "true":
      case "false":
        this.tokens.push(new Token(buffer, TokenType.BOOLEAN));
        break;
      case "с":
      case "сек":
      case "секунд":
      case "секунда":
      case "секунды":
      case "секунду":
      case "s":
      case "sec":
      case "second":
      case "seconds":
        this.tokens.push(new Token(buffer, TokenType.SECONDS));
        break;

      // Минуты
      case "м":
      case "мин":
      case "минут":
      case "минута":
      case "минуты":
      case "минуту":
      case "m":
      case "min":
      case "minute":
      case "minutes":
        this.tokens.push(new Token(buffer, TokenType.MINUTES));
        break;

      // Часы
      case "ч":
      case "час":
      case "часов":
      case "часа":
      case "h":
      case "hr":
      case "hour":
      case "hours":
        this.tokens.push(new Token(buffer, TokenType.HOURS));
        break;

      // Дни
      case "д":
      case "дн":
      case "день":
      case "дня":
      case "дней":
      case "дню":
      case "d":
      case "day":
      case "days":
        this.tokens.push(new Token(buffer, TokenType.DAYS));
        break;

      // Месяцы
      case "мес":
      case "месяц":
      case "месяца":
      case "месяцев":
      case "M":
      case "mo":
      case "mon":
      case "month":
      case "months":
        this.tokens.push(new Token(buffer, TokenType.MONTHS));
        break;

      // Годы
      case "г":
      case "год":
      case "года":
      case "лет":
      case "году":
      case "y":
      case "yr":
      case "year":
      case "years":
        this.tokens.push(new Token(buffer, TokenType.YEARS));
        break;
      default:
        this.tokens.push(new Token(buffer, TokenType.STRING));
    }
  }

  private isDigit(): boolean {
    const digits = "0123456789";
    return digits.includes(this.peek());
  }

  private isLetter() {
    const ru: string = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя"
      .split("")
      .map((char) => `${char}${char.toUpperCase()}`)
      .join("");
    const en: string = "abcdefghijklmnopqrstuvwxyz"
      .split("")
      .map((char) => `${char}${char.toUpperCase()}`)
      .join("");

    return ru.concat(en).includes(this.peek());
  }

  private isPositionValid() {
    return this.position < this.length;
  }

  private peek(position: number = 0) {
    const relationPosition = this.position + position;

    if (relationPosition >= this.length) {
      return "\0";
    }

    return this.raw[relationPosition];
  }

  private next(position: number = 0) {
    this.position++;
    return this.peek(position);
  }
}
