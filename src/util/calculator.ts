export class Calculator {
  private static OPERATOR_PRECEDENCE = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "%": 2,
  };

  private static isOperator(token: string): boolean {
    return token in Calculator.OPERATOR_PRECEDENCE;
  }

  private static isValidOperator(token: string): boolean {
    return token in Calculator.OPERATOR_PRECEDENCE;
  }

  private static applyOperator(
    operator: string,
    operand1: number,
    operand2: number,
  ): number {
    switch (operator) {
      case "+":
        return operand1 + operand2;
      case "-":
        return operand1 - operand2;
      case "*":
        return operand1 * operand2;
      case "/":
        return operand1 / operand2;
      case "%":
        return operand1 % operand2;
      default:
        throw new Error("Invalid operator");
    }
  }

  private static tokenize(expression: string): string[] {
    const tokens: string[] = [];
    let currentToken = "";
    let prevChar = "";

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];

      if (char === " ") {
        continue;
      } else if (char === "(" || char === ")") {
        if (currentToken !== "") {
          tokens.push(currentToken);
          currentToken = "";
        }
        tokens.push(char);
      } else if (Calculator.isOperator(char)) {
        if (currentToken !== "") {
          tokens.push(currentToken);
          currentToken = "";
        }

        // Проверяем, является ли оператор унарным минусом
        if (
          char === "-" &&
          (prevChar === "" ||
            prevChar === "(" ||
            Calculator.isOperator(prevChar))
        ) {
          currentToken += "-";
          prevChar = char;
          continue;
        }

        tokens.push(char);
      } else {
        currentToken += char;
      }

      prevChar = char;
    }

    if (currentToken !== "") {
      tokens.push(currentToken);
    }

    return tokens;
  }

  private static infixToPostfix(tokens: string[]): string[] {
    const output: string[] = [];
    const operatorStack: string[] = [];
    const PRECEDENCE: any = Calculator.OPERATOR_PRECEDENCE;

    for (const token of tokens) {
      if (!Calculator.isOperator(token) && token !== "(" && token !== ")") {
        output.push(token);
      } else if (Calculator.isOperator(token)) {
        while (
          operatorStack.length > 0 &&
          Calculator.isOperator(operatorStack[operatorStack.length - 1]) &&
          PRECEDENCE[token] <=
            PRECEDENCE[operatorStack[operatorStack.length - 1]]
        ) {
          output.push(operatorStack.pop()!);
        }
        operatorStack.push(token);
      } else if (token === "(") {
        operatorStack.push(token);
      } else if (token === ")") {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] !== "("
        ) {
          output.push(operatorStack.pop()!);
        }
        if (operatorStack.length === 0) {
          throw new Error("Mismatched parentheses");
        }
        operatorStack.pop();
      }
    }

    while (operatorStack.length > 0) {
      const operator = operatorStack.pop();
      if (operator === "(" || operator === ")") {
        throw new Error("Mismatched parentheses");
      }
      output.push(operator!);
    }

    return output;
  }

  private static evaluatePostfix(tokens: string[]): number {
    const operandStack: number[] = [];

    for (const token of tokens) {
      if (!Calculator.isOperator(token)) {
        operandStack.push(parseFloat(token));
      } else {
        if (!Calculator.isValidOperator(token)) {
          throw new Error("Invalid operator: " + token);
        }

        const operand2 = operandStack.pop();
        const operand1 = operandStack.pop();
        if (operand1 === undefined || operand2 === undefined) {
          throw new Error("Invalid expression");
        }
        const result = Calculator.applyOperator(token, operand1, operand2);
        operandStack.push(result);
      }
    }

    if (operandStack.length !== 1) {
      throw new Error("Invalid expression");
    }

    return operandStack[0];
  }

  public static calculate(expression: string): number {
    const tokens = Calculator.tokenize(expression);
    const postfixTokens = Calculator.infixToPostfix(tokens);
    const result = Calculator.evaluatePostfix(postfixTokens);
    return result;
  }
}
