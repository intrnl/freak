import { getHookState } from './diff.js'
import { CProvider } from './utils.js';

let contextId = 0;

export function createContext (defaultValue) {
	return {
		_id: 'c' + contextId++,
		_value: defaultValue,
	};
}

export function Provider (props, ctx) {
	let { children, context, value } = props;

	let state = getHookState();
	let listeners = state._listeners ||= new Set();

	if (state._value !== value) {
		state._value = value;

		for (let listener of listeners) {
			listener();
		}
	}

	ctx[context._id] = state;
	return children;
}

Provider.type = CProvider;
