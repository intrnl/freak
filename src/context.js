let contextId = 0;

export function createContext (defaultValue) {
	return {
		id: 'ctx' + contextId++,
		value: defaultValue,
	};
}

export function Provider (props, ctx) {
	let { children, context, value } = props;

	let state = ctx[context.id] ||= { value, listeners: new Set() };

	if (value !== state.value) {
		state.value = value;

		for (let listener of state.listeners) {
			listener(value);
		}
	}

	return children;
}

Provider.ctx = true;
