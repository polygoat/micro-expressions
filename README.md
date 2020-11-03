Micro Expressions for NodeJS
============================

Lightweight and easily extensible string-based expression engine

## Goals & Design

I created this tiny project to read (and parse) collections from JSON files that contained simple conditionals. As my architecture grew, I started using the same expressions for almost anything – even to query several databases. Keeping one simplistic language throughout my ecosystem simplified both development and maintenance for me.

## Installation

Install using npm:

```shell
$ npm install micro-expression
```

## Usage
Newly created MicroExpressions take one argument: the _`expression`_.
The input is being parsed automagically and turned into functions that take a data container as argument for rendering.
```javascript
new MicroExpression( expression );
```
Use `render_with( data_container )` to render all templates using `data_container` as context.

```javascript
new MicroExpression(expression).render_with( data_container );
```

## Extending

To create micro expressions with your own set of operators, you can extend the MicroExpression class and overwrite the default behavior by declaring an `override_operators()` and/or a `get( expression )` method.

```javascript
const { MicroExpression } = require('micro-expression');

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
	'=': function(left, right) {
		return left === right;
	}
}
```

### Overriding Templating

The `get` method takes one argument: _expression_. ###TODO

### Hooking into `.render` and `.render_with`

You can declare a method `on_render` that gets passed the current rendering results as single argument.

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

console.log(`\nThe outcome is ${message}.`);
```

The output will be:
```shell
The outcome is negative.
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