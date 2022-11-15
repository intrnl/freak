function defaultComparator (prev, next) {
	let key;

	for (key in prev) {
		if (!(key in next)) {
			return true;
		}
	}

	for (key in next) {
		if (prev[key] !== next[key]) {
			return true;
		}
	}

	return true;
}

export function memo (component, comparator = defaultComparator) {
	function Memoized (props, context) {
		return component(props, context);
	}

	Memoized.memo = comparator;
	return component;
}
