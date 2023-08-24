/**
 * Eva programming language.
 *
 * AST interpreter.
 *
 * Course info: http://dmitrysoshnikov.com/courses/essentials-of-interpretation/
 *
 * (C) 2018-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

const Environment = require('./Environment');
const Transformer = require('./transform/Transformer');
const evaParser = require('./parser/evaParser');

const fs = require('fs');

/**
 * Eva interpreter.
 */
class Eva {
  /**
   * Creates an Eva instance with the global environment.
   */
  constructor(global = GlobalEnvironment) {
    this.global = global;
    this._transformer = new Transformer();
  }

  /**
   * Evaluates global code wrapping into a block.
   */
  evalGlobal(exp) {
    return this._evalBody(exp, this.global);
  }

  /**
   * Evaluates an expression in the given environment.
   */
  eval(exp, env = this.global) {

    // --------------------------------------------
    // Self-evaluating expressions:

    if (this._isNumber(exp)) return exp;

    if (this._isString(exp)) return exp.slice(1, -1);
    // --------------------------------------------
    // Block: sequence of expressions

    if (exp[0] === 'begin') {
      const blockEnv = new Environment({}, env);
      return this._evalBlock(exp, blockEnv);
    }

    // --------------------------------------------
    // Variable declaration: (var foo 10)

    if (exp[0] === 'var') {
      let [_, name, value] = exp;
      return env.define(name, this.eval(value, env));
    }

    // --------------------------------------------
    // Variable update: (set foo 10)

    if (exp[0] === 'set') {
      let [_, name, value] = exp;
      return env.assign(name, this.eval(value, env));
    }

    // --------------------------------------------
    // Variable access: foo

    if (this._isVariableName(exp)) {
      return env.lookup(exp);
    }

    // --------------------------------------------
    // if-expression:

    if (exp[0] === 'if') {
      let [_, cond, ifTrue, ifFalse] = exp;
      if (this.eval(cond, env)) return this.eval(ifTrue, env)
      else return this.eval(ifFalse, env);
    }

    // --------------------------------------------
    // while-expression:

    if (exp[0] === 'while') {
      let [_, cond, body] = exp; 
      let res;
      while (this.eval(cond, env)) {
        res = this.eval(body, env);
      }
      return res;
    }

    // --------------------------------------------
    // Function declaration: (def square (x) (* x x))
    //
    // Syntactic sugar for: (var square (lambda (x) (* x x)))

    if (exp[0] === 'def') {
      let [_, name, params, body] = exp;
      return env.define(name, this.eval(['lambda', params, body], env));
    }

    // --------------------------------------------
    // Switch-expression: (switch (cond1, block1) ... )
    //
    // Syntactic sugar for nested if-expressions

    if (exp[0] === 'switch') {
      // Implement here: see Lecture 14
    }

    // --------------------------------------------
    // For-loop: (for init condition modifier body )
    //
    // Syntactic sugar for: (begin init (while condition (begin body modifier)))

    if (exp[0] === 'for') {
      // Implement here: see Lecture 14
    }

    // --------------------------------------------
    // Increment: (++ foo)
    //
    // Syntactic sugar for: (set foo (+ foo 1))

    if (exp[0] === '++') {
      // Implement here: see Lecture 14
    }

    // --------------------------------------------
    // Decrement: (-- foo)
    //
    // Syntactic sugar for: (set foo (- foo 1))

    if (exp[0] === '--') {
      // Implement here: see Lecture 14
    }

    // --------------------------------------------
    // Increment: (+= foo inc)
    //
    // Syntactic sugar for: (set foo (+ foo inc))

    if (exp[0] === '+=') {
      // Implement here: see Lecture 14
    }

    // --------------------------------------------
    // Decrement: (-= foo dec)
    //
    // Syntactic sugar for: (set foo (- foo dec))

    if (exp[0] === '-=') {
      // Implement here: see Lecture 14
    }

    // --------------------------------------------
    // Lambda function: (lambda (x) (* x x))

    if (exp[0] === 'lambda') {
      let [_, params, body] = exp;
      return {
        params,
        body,
        env 
      };
    }

    // --------------------------------------------
    // Class declaration: (class <Name> <Parent> <Body>)

    if (exp[0] === 'class') {
      // Implement here: see Lecture 15
    }

    // --------------------------------------------
    // Super expressions: (super <ClassName>)

    if (exp[0] === 'super') {
      // Implement here: see Lecture 16
    }

    // --------------------------------------------
    // Class instantiation: (new <Class> <Arguments>...)

    if (exp[0] === 'new') {
      // Implement here: see Lecture 15
    }

    // --------------------------------------------
    // Property access: (prop <instance> <name>)

    if (exp[0] === 'prop') {
      // Implement here: see Lecture 15
    }

    // --------------------------------------------
    // Module declaration: (module <name> <body>)

    if (exp[0] === 'module') {
      // Implement here: see Lecture 17
    }

    // --------------------------------------------
    // Module import: (import <name>)
    // (import (export1, export2, ...) <name>)

    if (exp[0] === 'import') {
      // Implement here: see Lecture 17
    }

    // --------------------------------------------
    // Function calls:
    //
    // (print "Hello World")
    // (+ x 5)
    // (> foo bar)

    if (Array.isArray(exp)) {

      const fn = this.eval(exp[0], env);

      const args = exp
        .slice(1)
        .map(arg => this.eval(arg, env));

      // 1. Native function:

      // See Lecture 10

      if (typeof fn === 'function') {
        return fn(...args);
      }

      // 2. User-defined function:

      return this._callUserDefinedFunction(fn, args);
    }


    throw `Unimplemented: ${JSON.stringify(exp)}`;
  }

  _callUserDefinedFunction(fn, args) {
    let activationEnv = new Environment({}, fn.env);
    for (var i = 0; i < fn.params.length; i++) {
      activationEnv.define(fn.params[i], args[i]);
    }
    return this._evalBody(fn.body, activationEnv);
  }

  _evalBody(body, env) {
    if (body[0] === 'begin') {
      return this._evalBlock(body, env);
    }
    return this.eval(body, env);
  }

  _evalBlock(block, env) {
    let res = null;
    block.slice(1).forEach(element => {
      res = this.eval(element, env);
    });
    return res;
  }

  _isNumber(exp) {
    return typeof exp === 'number';
  }

  _isString(exp) {
    return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
  }

  _isVariableName(exp) {
    return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]+$/.test(exp);
  }
}

/**
 * Default Global Environment.
 */
const GlobalEnvironment = new Environment({
  null: null,

  true: true,
  false: false,

  VERSION: '0.1',

  // Operators:

  '+'(op1, op2) {
    return op1 + op2;
  },

  '*'(op1, op2) {
    return op1 * op2;
  },

  '-'(op1, op2 = null) {
    if (op2 == null) {
      return -op1;
    }
    return op1 - op2;
  },

  '/'(op1, op2) {
    return op1 / op2;
  },

  // Comparison:

  '>'(op1, op2) {
    return op1 > op2;
  },

  '<'(op1, op2) {
    return op1 < op2;
  },

  '>='(op1, op2) {
    return op1 >= op2;
  },

  '<='(op1, op2) {
    return op1 <= op2;
  },

  '='(op1, op2) {
    return op1 === op2;
  },

  // Console output:

  print(...args) {
    console.log(...args);
  },
});


module.exports = Eva;