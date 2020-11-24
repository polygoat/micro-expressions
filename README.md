Micro Expressions for NodeJS
============================

Lightweight, fast and easily extensible string interpolation engine

[![npm][npm-badge]][npm] [![npm][travis-badge]][npm]


[npm]: https://www.npmjs.org/package/micro-expressions
[npm-badge]: https://img.shields.io/npm/v/micro-expressions.svg?style=flat-square
[travis-badge]: https://api.travis-ci.com/polygoat/micro-expressions.svg?branch=main&status=passed

## Goals & Design

[Template literals][], a.k.a. template strings, string interpolation, or sometimes simply called expressions, are part of ECMAScript for development, but can not be parsed during runtime. The Pythoneers amongst you might know this paradigm as [String formats][] or "F-Strings".

I created this tiny project to read (and parse) collections from JSON files that contained simple conditionals. As my architecture grew, I started using the same expressions for almost anything – even to query several databases. Keeping one simplistic language throughout my ecosystem simplified both development and maintenance for me.

[Template literals]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
[String formats]: https://realpython.com/python-f-strings/

## Installation

Install using npm:

```shell
$ npm install micro-expressions
```

## Usage
Newly created MicroExpressions take one argument: the _`expression`_.
The input is being parsed automagically and turned into functions that take a data container as argument for rendering.
```javascript
const { MicroExpression } = require('micro-expressions');

const data = {
	name: 'Dan',
	foo: { 
		bar: 4 
	},
	group: ['Vlad', 'Bartmoss'],
	test: 8
};

console.log( new MicroExpression("foo.bar").render_with(data) );
// outputs 4

console.log( new MicroExpression("foo.bar < 3").render_with(data) );
// outputs false

console.log( new MicroExpression("foo.bar >= 4").render_with(data) );
// outputs true

console.log( new MicroExpression("foo.bar!=test").render_with(data) );
// outputs true

console.log( new MicroExpression("name in group").render_with(data) );
// outputs false

console.log( new MicroExpression("Vlad in group").render_with(data) );
// outputs true


```
Use `render_with( data_container )` to render all templates using `data_container` as context.

```javascript
new MicroExpression(expression).render_with( data_container );
```

As MicroExpression is using lodash's get helper, it supports object paths in _dot notation_:

```javascript
new MicroExpression('foo.bar < 10').render_with({ foo: { bar: 4 } });
```

## Extending

To create micro expressions with your own set of operators, you can extend the MicroExpression class and overwrite the default behavior by declaring an `override_operators()` and/or a `get( expression )` method.

```javascript
const { MicroExpression } = require('micro-expressions');

class MyExpression extends MicroExpression {
	override_operators() { 
		... 
	}

	get(expression) { 
		... 
	}
}
```
### Overriding Operators

The `override_operators` method takes no arguments, but **must return an object** with the operators as keys and according callbacks as values. The callback takes 2 arguments: `left` and `right`, representing both sides of the operator. If your operator e.g. doesn't have a left side, you must still declare a left parameter, but can ignore the passed argument.

```javascript
{
	'!': function(left, right) {
		return !right;
	}
}
```

### Overriding Templating

The `get` method takes one argument: _expression_. All operands are passed to this method before the entire expression is being evaluated.

In its simplest form, you can override `get` like so:

```javascript
const { MicroExpression } = require('micro-expressions');

class SQLExpression extends MicroExpression {
	get(expression) {
		return data => data[expression] || expression;
	}
}
````

### Hooking into `.render` and `.render_with`

You can declare a method `on_render` that gets passed the current rendering results as single argument.

## Testing

This package comes with a set of standard JEST cases located in `[tests/all.test.js][]`

Run them using:
```bash
$ npm test
```

[tests/all.test.js]: https://github.com/polygoat/micro-components-py/tree/main/tests/all.test.js


## Examples

In the following example, I used the **MicroExpression** class to parse conditions loaded from a JSON file:

**[steps.json]**
```json
[
	{
		"if": "answer=yes",
		"message": "affirmative."
	}, 
	{
		"if": "answer=no",
		"message": "negative."
	}
]
```

**[index.js]**
```javascript
let message = 'maybe.';
const steps = require('./steps.json');
const answer = 'no';

_.each(steps, (step, i) => {
	const condition = new MicroExpression(step.if);
	if(condition.render_with({ answer })) {
		message = step.message;
	}
});

console.log('The outcome is', message);
```

The output will be:
```shell
The outcome is negative
```

Here is an example of **extending MicroExpression**:

```javascript
class MyExpression extends MicroExpression {
	override_operators() 	{  
		return {
			'=':  (left, right) => left === right,
			'!=': (left, right) => left !== right,
			'!':  (left, right) => !right,
			'~':  (left, right) => Math.abs(left - right) < 10
		}
	}
}
```

Make sure you check out the [subclass MongoExpression][] and [the tests][] to see examples of implementation.

[subclass MongoExpression]: https://github.com/polygoat/micro-expression/blob/main/examples/mongo-expression.js
[the tests]: https://github.com/polygoat/micro-expression/blob/main/tests/all.test.js


License
-------
[MIT License][]

[MIT License]: https://github.com/polygoat/micro-expression/blob/main/LICENSE