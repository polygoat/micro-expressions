Micro Expressions for NodeJS
============================

Lightweight and easily extensible string-based expression engine

## Goals & Design

I created this tiny project to read (and parse) collections from JSON files that contained simple conditionals. As my architecture grew, I started using the same expressions for almost anything – even to query several databases. Keeping one simplistic language throughout your ecosystem simplifies both development and maintenance.

## Installation

Install using npm:

```shell
$ npm install micro-expression
```

## Usage

## Extending

To create micro expressions with your own set of operators, you can extend the MicroExpression class and overwrite the default behavior by declaring an `override_operators()` and/or a `get( expression )` method.

```javascript
const { MicroExpression } = require('micro-expression');

class MyExpression extends MicroExpression {
	override_operators() 	{ ... }
	get(expression) 		{ ... }
}
```
### Overriding Operators

The `override_operators` method takes no arguments, but **must return an object** with the operators as keys and according callbacks as values. The callback takes 2 arguments: `left` and `right`, representing both sides of the operator. If your operator e.g. doesn't have a left side, you must still declare a left parameter, but can ignore the passed argument.

```javascript
{
	'=': function(left, right) {
		return left === right;
	}
}
```

## Examples

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