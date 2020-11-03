#!/usr/bin/env node

const { MicroExpression } = require('../index');

describe('MicroExpression', () => {
	test('Passing through of strings and numbers: "test", 6, and 6.5', () => {
		let str_result = new MicroExpression('test').render();
		let int_result = new MicroExpression('6').render();
		let float_result = new MicroExpression('6.5').render();

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
		result = new MicroExpression('foo< 5').render_with({ foo: 4 });
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