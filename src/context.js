let contextId = 0;

export function createContext (defaultValue) {
	return {
		_listeners: new Set(),
		id: 'ctx' + contextId++,
		value: defaultValue,
	};
}

export function Provider (props) {
	return props.children;
}
