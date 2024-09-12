import BaseEntity, { BooleanEntity, ChannelEntity, CommandEntity, EntityManager, FloatEntity, HexEntity, IntEntity, ListEntity, PrefixEntity, RoleEntity, StringEntity, TimeEntity, UserEntity } from "./manager";
import { Enum, Metadata } from "./enum";
import Lexer from "./lexer";
import { Operator, Special, Token, TokenType } from "./token-type";

export default class Parser {
  private position: number;
  private size: number;
  private tokens: Token<Metadata>[];

  private EOF = new Token("", Special.EOF);

  constructor(tokens: Token<Metadata>[]);
  constructor(analyzer: Lexer);
  constructor(other: any) {
    if (other instanceof Lexer) {
      other = other.analize();
    }

    this.tokens = other;
    this.position = 0;
    this.size = other.length;
  }

  parse() {
    const entityes: BaseEntity[] = []
    let prefix: PrefixEntity | null = null
    let command: CommandEntity | null = null
    const flags: Record<string, BaseEntity> = {}

    if(this.match(TokenType.STRING, false)) {
      try {
        const prefixName = this.consume(TokenType.STRING)
        this.consume(Operator.DOT)
        prefix = new PrefixEntity(prefixName, Special.PREFIX)
      } catch (error) {
        throw new Error("Expected command")
      }
      if(this.match(TokenType.STRING, false)) {
        const commandName = this.consume(TokenType.STRING)
        command = new CommandEntity(commandName, Special.COMMAND)
      } else {
        throw new Error("Invalid command")
      }
    }

    while(!this.match(this.EOF.type)) {
      if(this.matches([
        Operator.LEFT_TRIANGLE_BRACKET,
        TokenType.INT,
        TokenType.STRING,
        TokenType.BOOLEAN,
        TokenType.FLOAT,
        TokenType.HEX,
        TokenType.SECONDS,
        TokenType.MINUTES,
        TokenType.HOURS,
        TokenType.DAYS,
        TokenType.YEARS,
      ], false)) {
        entityes.push(this.parsePrimitive())
      } else if(this.match(Operator.MINUS)) {
        const flagsResult = this.flagExpression()
        
        for(const [key, value] of Object.entries(flagsResult)) {
          if(flags[key] != undefined)
            throw new Error(`The flag '${key}' already exists.`)
          flags[key] = value
        }
      } else {
        throw new Error("Invalid syntax")
      }
    }

    return { prefix, command, manager: new EntityManager(entityes), flags }
  }

  private flagExpression() {
    const flags: Record<string, BaseEntity> = {};
    const listEntityes: BaseEntity[] = [];
    if(this.matches([
      TokenType.STRING,
      TokenType.SECONDS,
      TokenType.MINUTES,
      TokenType.HOURS,
      TokenType.DAYS,
      TokenType.YEARS
    ], false)) {
      const name = this.consume(this.peek(0).type);
    
      if(flags[name.value] != undefined)
        throw new Error(`The flag '${name.value}' already exists.`)
      flags[name.value] = new BooleanEntity(new Token("true", TokenType.BOOLEAN), TokenType.BOOLEAN);
  
      if(this.matches([
        TokenType.INT,
        TokenType.STRING,
        TokenType.BOOLEAN,
        TokenType.FLOAT,
        TokenType.HEX,
        TokenType.SECONDS,
        TokenType.MINUTES,
        TokenType.HOURS,
        TokenType.DAYS,
        TokenType.MONTHS,
        TokenType.YEARS,
      ], false)) {
        const primitive = this.parsePrimitive()
        flags[name.value] = primitive;

        while(this.match(Operator.COMMA)) {
          const primitive = this.parsePrimitive()
          listEntityes.push(primitive)
        }

        if(listEntityes.length > 0) {
          flags[name.value] = new ListEntity([primitive, ...listEntityes], new Token("[...]", TokenType.LIST), TokenType.LIST)
        }
      }
    }

    if(this.match(Operator.MINUS)) {
      const _flags = this.flagExpression();

      for(const [ key, value ] of Object.entries(_flags)) {
        flags[key] = value
      }

      return flags;
    }

    return flags;
  }

  private parsePrimitive() {    
    if(this.match(TokenType.HEX, false)) {
      const token = this.consume(TokenType.HEX);
      return new HexEntity(token, TokenType.HEX)
    } else if(this.match(TokenType.INT, false)) {
      const token = this.consume(TokenType.INT)

      if(this.matches([
        TokenType.SECONDS,
        TokenType.MINUTES,
        TokenType.HOURS,
        TokenType.DAYS,
        TokenType.MONTHS,
        TokenType.YEARS
      ], false)) {
        const time_mark = this.peek(0)
        return new TimeEntity(new Token(String(this.timeExpression(token, time_mark)), time_mark.type), TokenType.TIME)
      } else {
        return new IntEntity(token, TokenType.INT) 
      }
    } else if(this.match(TokenType.FLOAT, false)) {
      const token = this.consume(TokenType.FLOAT)
      return new FloatEntity(token, TokenType.FLOAT)
    } else if(this.match(TokenType.STRING, false)) {
      const token = this.consume(TokenType.STRING)
      return new StringEntity(token, TokenType.STRING)
    } else if(this.match(TokenType.BOOLEAN, false)) {
      const token = this.consume(TokenType.BOOLEAN)
      return new BooleanEntity(token, TokenType.BOOLEAN)
    } else if(this.match(Operator.LEFT_TRIANGLE_BRACKET)) {
      return this.parseDiscord()
    }

    throw new Error("Unknown primitive type")
  }

  private timeExpression(token: Token<Metadata>, mark: Token<Metadata>) {
    let value = 0;

    const seconds = 1000;
    const minutes = seconds * 60;
    const hours = minutes * 60;
    const days = hours * 24;
    const years = days * ((365 * 3 + 366) / 4);
    const months = years / 12
    
    switch(mark.type) {
      case TokenType.SECONDS: {
        this.consume(mark.type)
        value += parseInt(token.value) * seconds
        break;
      }
      case TokenType.MINUTES: {
        this.consume(mark.type)
        value += parseInt(token.value) * minutes
        break;
      }
      case TokenType.HOURS: {
        this.consume(mark.type)
        value += parseInt(token.value) * hours
        break;
      }
      case TokenType.DAYS: {
        this.consume(mark.type)
        value += parseInt(token.value) * days
        break;
      }
      case TokenType.MONTHS: {
        this.consume(mark.type)
        value += parseInt(token.value) * months
        break;
      }
      case TokenType.YEARS: {
        this.consume(mark.type)
        value += parseInt(token.value) * years
        break;
      }
      default: {
        return value
      }
    }

    if(this.match(TokenType.INT, false)) {
      const token = this.consume(TokenType.INT);
      const mark = this.peek(0)

      value += this.timeExpression(token, mark)
    }

    return value;
  }

  private parseDiscord() {
    if(this.match(Operator.DOG)) {
      if(this.match(Operator.AMPERSANT)) {
        return this.parseRole()
      } else {
        return this.parseUser()
      }
    } else if(this.match(Operator.HASH)) {
      return this.parseChannel()
    }

    throw new Error("Unknown type")
  }

  private parseUser() {
    const token = this.consume(TokenType.INT);
    this.consume(Operator.RIGHT_TRIANGLE_BRACKET)
    return new UserEntity(token, TokenType.USER)
  }

  private parseRole() {
    this.match(Operator.EXCLAMATION_MARK)
    const token = this.consume(TokenType.INT);
    this.consume(Operator.RIGHT_TRIANGLE_BRACKET)
    return new RoleEntity(token, TokenType.ROLE)
  }

  private parseChannel() {
    this.match(Operator.EXCLAMATION_MARK)
    const token = this.consume(TokenType.INT);
    this.consume(Operator.RIGHT_TRIANGLE_BRACKET)
    return new ChannelEntity(token, TokenType.CHANNEL)
  }

  private matches(tokens: Enum<string, Metadata>[], count = true) {
    return tokens.some((token) => this.match(token, count));
  }

  private match(token: Enum<string, Metadata>, count = true) {
    let current = this.peek(0);
    if (token != current.type) return false;
    if (count) this.position++;
    return true;
  }

  private consume(token: Enum<string, Metadata>) {
    let current = this.peek(0);
    if (token != current.type)
      throw new Error(
        `Token ${Enum.findBy(current.type)} doesn't match ${Enum.findBy(token)}`
      );
    this.position++;
    return current;
  }

  private peek(pos: number): Token<Metadata> {
    let relPos = this.position + pos;

    if (relPos >= this.size) return this.EOF;
    return this.tokens[relPos];
  }
}
