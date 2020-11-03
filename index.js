#!/usr/bin/env node

const _ = require('lodash');
const is_numeric = str => !!(_.isNumber(str) || str.match(/^[\-+]?\d+(\.\d+)?$/g));

class MicroExpression {
	selector   = {};
	projection = {};
	operators = {
		'!':	(left, right) => !right,
		'=':	(left, right) => left == right,
		'!=':	(left, right) => left != right,
		'>':	(left, right) => left > right,
		'>=':	(left, right) => left >= right,
		'<':	(left, right) => left < right,
		'<=':	(left, right) => left <= right,
		'in': 	(left, right) => right.indexOf(left) > -1,
		'nin': 	(left, right) => right.indexOf(left) === -1,
	};

	parsing_info = {
		tokens: [],
		operators: []
	};

	constructor(query, operators) {
		if('override_operators' in this) {
			this.operators = this.override_operators();
		}
		this.parse(query);
	}

	get(expression) {
		return data => {
			let result = expression + '';

			if(expression in data) {
				result = data[expression];
			} else {
				result = _.get(data, expression, expression);
			}

			try {
				return JSON.parse(result);
			} catch(e) {
				return result;
			}
		}
	}

	parse(query) {
		if(_.isString(query)) {
			if(is_numeric(query)) {
				this.numeric = parseFloat(query);
			} else {
				let operators = this.operators;
				let operator_keys = _.sortBy(Object.keys(operators), 'length').reverse();
				operator_keys = _.map(operator_keys, _.escapeRegExp);
				
				const splitter = new RegExp('\\s*(' + operator_keys.join('|') + ')\\s*');

				let elements = _.filter(_.map(query.split(splitter), entry => entry.trim()));

				this.parsing_info.tokens = [...elements];

				elements.reverse();

				let op_left = () => undefined;
				let op_right = () => undefined;
				let op_current = undefined;

				op_left.noop = true;
				op_right.noop = true;

				_.each(elements, (element, i) => {
					if(element in operators) {
						op_current = this.operators[element];
						let operator = op_current;
						this.parsing_info.operators.push(element);
						
						if(i == elements.length - 1) {
							this.selector[op_right.element] = (data) => operator(op_left(data), op_right(data));
						}

					} else {
						let parsed_element = this.get(element);
						
						if(op_current) {
							op_left = parsed_element;
							op_left.element = element;
							let operator = op_current;
							
							let result = (data) => operator(op_left(data), op_right(data));
							
							if('result' in this.selector) {
								this.selector.result = (data) => this.selector.result(data) && result(data);
							} else {
								this.selector.result = result;
							}

							op_current = false;
						} else {
							op_right = parsed_element;
							op_right.element = element;
						}
					}
				});

				
				if(!_.size(this.selector)) {
					let args = [op_left, op_right];
					
					if(!op_current) {
						args = _.filter(args, arg => !arg.noop);
						op_current = expression =>  data => expression;
						this.no_operator = true;
					}

					let operator = op_current;
					this.selector.result = (data) => operator(..._.map(args, arg => arg(data)))(data);
				}
			}
		} else if(_.isNumber(query)) {
			this.numeric = query;
		}
		delete this.operators;
		return this;
	}

	render() {
		return this.render_with({});
	}

	render_with(data={}) {
		this.result = undefined;

		if(_.size(this.selector)) {
			_.each(this.selector, (selector, key) => {
				const value = selector(data);

				if(this.result) {
					this.result = this.result && value;
				} else {
					this.result = value;
				}
			});
		}

		if(_.isUndefined(this.result)) {
			this.result = this.numeric;
		}

		if('on_render' in this) {
			this.result = this.on_render(this.result);
		}

		return this.result;
	}
}

class MongoExpression extends MicroExpression {
	override_operators() {
		return {
			'=':	(left, right) => new Object({ [left]: right }),
			'!':	(left, right) => {
				this.projection[right] = -1;
				return { [right]: { $exists: -1 } };
			},
			'!=':	(left, right) => new Object({ [left]: { $ne: right } }),
			'>':  	(left, right) => new Object({ [left]: { $gt: right } }),
			'>=':  	(left, right) => new Object({ [left]: { $gte: right } }),
			'<':  	(left, right) => new Object({ [left]: { $lt: right } }),
			'<=':  	(left, right) => new Object({ [left]: { $lte: right } }),
			'in':  	(left, right) => new Object({ [left]: { $in: right } }),
		};
	}

	get(expression) {
		expression = super.get(expression)({});
		if(this.parsing_info.tokens.length == 1) {
			if(_.isString(expression)) {
				this.projection[expression] = 1;
				return (data) => new Object({ [expression]: { $exists: 1 } });
			}
		}
		return (data) => expression;
	}

	on_render(result) {
		this.selector = result;
		return result;
	}
}

const test_expression = new MicroExpression( process.argv[2] );

const storage = { hu: { loo: 4, entries: [0, 6, 4]}, foo: 'hu.loo' };

console.log( test_expression.render_with(storage) );

console.log('test_expression', test_expression);
module.exports = { MicroExpression };