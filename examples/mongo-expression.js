const _ = require('lodash');
const { MicroExpression } = require('../index');

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
		return (data) => _.get(data, expression, expression);
	}

	on_render(result) {
		this.selector = result;
		return result;
	}
}

module.exports = { MongoExpression };