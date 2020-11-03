#!/usr/bin/env node


describe('MicroExpression', () => {
	const { MicroExpression } = require('../index');

	test('Passing through of strings and numbers: "test", 6, and 6.5', () => {
		let str_result = new MicroExpression('test').render();
		let int_result = new MicroExpression('6').render();
		let float_result = new MicroExpression('6.5').render_with({});

		expect(str_result).toBe('test');
		expect(int_result).toBe(6);
		expect(float_result).toBe(6.5);
	});

	test('Simple template parsing: "foo" from { "foo": "bar" }', () => {
		let result = new MicroExpression('foo').render_with({ foo: 'bar' });
		expect(result).toBe('bar');
	});

	test('Negation operator: "!foo" from { "foo": false }', () => {
		let result = new MicroExpression('!foo').render_with({ foo: false });
		expect(result).toBe(true);
	});

	test('Comparisons: =, <, !=, <=, >, >= for { "foo": 4 }', () => {
		let result = new MicroExpression('foo = 4').render_with({ foo: 4 });
		expect(result).toBe(true);
		result = new MicroExpression('foo< 5', { foo: 4 }).result;
		expect(result).toBe(true);
		result = new MicroExpression('foo >4').render_with({ foo: 4 });
		expect(result).toBe(false);
		result = new MicroExpression('foo >=4').render_with({ foo: 4 });
		expect(result).toBe(true);
		result = new MicroExpression('foo<=5').render_with({ foo: 4 });
		expect(result).toBe(true);
		result = new MicroExpression('foo!=3').render_with({ foo: 4 });
		expect(result).toBe(true);
	});

	test('Special operators: in and nin for { entries: [9, 6, 8] }', () => {
		let result = new MicroExpression('6 in entries').render_with({ entries: [9,6,8] });
		expect(result).toBe(true);
		result = new MicroExpression('3 in entries').render_with({ entries: [9,6,8] });
		expect(result).toBe(false);
		result = new MicroExpression('3 nin entries').render_with({ entries: [9,6,8] });
		expect(result).toBe(true);
	});
});

describe('MongoExpression', () => {
	const { MongoExpression } = require('../examples/mongo-expression.js');

	test('Passing through of numbers: 6 and 6.5', () => {
		let int_result = new MongoExpression('6').render();
		let float_result = new MongoExpression('6.5').render();

		expect(int_result).toBe(6);
		expect(float_result).toBe(6.5);
	});

	test('Simple field existence check: "foo" turns to { foo: { $exists: 1 } }, { foo: 1 }', () => {
		let $expression = new MongoExpression('foo');
		$expression.render();
		expect($expression.selector).toEqual({ foo: { $exists: 1 } });
		expect($expression.projection).toEqual({ foo: 1 });
	});

	test('Comparison operation: "foo.bar=4" turns to { "foo.bar": 4 }', () => {
		let selector = new MongoExpression('foo.bar=4').render();
		expect(selector).toEqual({ 'foo.bar': 4 });
	});

	test('Comparison operation: "foo.bar>4" turns to { "foo.bar": { $gt: 4 } }', () => {
		let selector = new MongoExpression('foo.bar >4').render();
		expect(selector).toEqual({ 'foo.bar': { $gt: 4 } });
	});

	test('Comparison operation: "foo.bar >= 4" turns to { "foo.bar": { $gte: 4 } }', () => {
		let selector = new MongoExpression('foo.bar>= 4').render();
		expect(selector).toEqual({ 'foo.bar': { $gte: 4 } });
	});

	test('Special operations: "foo.bar in entries" turns to { "foo.bar": { $in: ["A", 5, 99] } }', () => {
		let selector = new MongoExpression('foo.bar in entries').render_with({ entries: ['A', 5, 99] });
		expect(selector).toEqual({ 'foo.bar': { $in: ['A', 5, 99] } });
	});
});