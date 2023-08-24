/**
 * AST Transformer.
 *
 * Course info: http://dmitrysoshnikov.com/courses/essentials-of-interpretation/
 *
 * (C) 2018-present Dmitry Soshnikov <dmitry.soshnikov@gmail.com>
 */

class Transformer {

  /**
   * Translates `def`-expression (function declaration)
   * into a variable declaration with a lambda
   * expression.
   */
  transformDefToVarLambda(defExp) {
    const [_tag, name, params, body] = defExp;
    return ['var', name, ['lambda', params, body]];
  }

  /**
   * Transforms `switch` to nested `if`-expressions.
   */
  transformSwitchToIf(switchExp) {
    let branches = switchExp.slice(1);
    let ifElse = [];
    let currentIfElse = ifElse;

    for (let i = 0; i < branches.length - 1; i++) {
      let branch = branches[i];
      let [cond, body] = branch;  
    
      currentIfElse.push('if', cond, body);
      
      let next = branches[i + 1];
      if (next[0] === 'else') {
        currentIfElse.push(next[1]);
      } else {
        let newIfElse = [];
        currentIfElse.push(newIfElse);
        currentIfElse = newIfElse;
      }
    } 

    return ifElse;
  }

  /**
   * Transforms `for` to `while`
   */
  transformForToWhile(exp) {
    let [_tag, init, cond, modifier, body] = exp;
    return ['begin', init, ['while', cond, ['begin', body, modifier]]];
  }

  /**
   * Transforms `++ foo` to (set foo (+ foo 1))
   */
  transformIncToSet(incExp) {
    const [_tag, exp] = incExp;
    return this._incValToSet(exp, 1);
  }

  /**
   * Transforms `-- foo` to (set foo (- foo 1))
   */
  transformDecToSet(incExp) {
    const [_tag, exp] = incExp;
    return this._decValToSet(exp, 1);
  }

  /**
   * Transforms `+= foo val` to (set foo (+ foo val))
   */
  transformIncValToSet(incExp) {
    const [_tag, exp, val] = incExp;
    return this._incValToSet(exp, val);
  }

  /**
   * Transforms `-= foo val` to (set foo (+ foo val))
   */
  transformDecValToSet(incExp) {
    const [_tag, exp, val] = incExp;
    return this._decValToSet(exp, val);
  }

  _incValToSet(name, val) {
    return this._opValToSet('+', name, val);
  }

  _decValToSet(name, val) {
    return this._opValToSet('-', name, val);
  }

  _opValToSet(op, name, val) {
    return ['set', name, [op, name, val]];
  }
}

module.exports = Transformer;