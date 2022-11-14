import { currInstance, getHookState, enqueueInstanceRender } from './diff.js';


export function useErrorBoundary (callback) {
	currInstance._handleError = callback;
}

export function useContext (context) {
	let ctx = currInstance._context;
	let instance = currInstance;

	let state = ctx[context._id];

	useLayoutEffect(() => {
		if (state) {
			let callback = () => enqueueInstanceRender(instance);

			state._listeners.add(callback);
			return () => state._listeners.delete(callback);
		}
	}, [state]);

	return (state || context)._value;
}

export function useReducer (reducer, initialState, init) {
	let state = getHookState();

	if (!state._instance) {
		initialState = init ? init(initialState) : invokeOrReturn(undefined, initialState);

		let dispatch = (action) => {
			let prevState = state._value[0];
			let nextState = state._reducer(prevState, action);

			if (prevState !== nextState) {
				state._value = [nextState, dispatch];
				enqueueInstanceRender(state._instance);
			}
		};

		state._value = [initialState, dispatch];
		state._instance = currInstance;
	}

	state._reducer = reducer;
	return state._value;
}

export function useState (initialState) {
	return useReducer(invokeOrReturn, initialState);
}

export function useEffect (callback, args) {
	let state = getHookState();

	if (argsChanged(state._args, args)) {
		state._value = callback;
		state._args = args;

		currInstance._post.push(state);
	}
}

export function useLayoutEffect (callback, args) {
	let state = getHookState();

	if (argsChanged(state._args, args)) {
		state._value = callback;
		state._args = args;

		currInstance._pre.push(state);
	}
}

export function useMemo (factory, args) {
	let state = getHookState();

	if (argsChanged(state._args, args)) {
		state._value = factory();
		state._args = args;
	}

	return state._value;
}

export function useCallback (callback, args) {
	return useMemo(() => callback, args);
}

export function useRef (initialValue) {
	return useMemo(() => ({ current: initialValue }), []);
}

export function useImperativeHandle (ref, creator, args) {
	useLayoutEffect(() => {
		if (typeof ref == 'function') {
			ref(creator());
			return () => ref(null);
		}
		else if (ref) {
			ref.current = creator();
			return () => ref.current = null;
		}
	}, args == null ? [ref] : args.concat(ref));
}


function argsChanged (prev, next) {
	if (!prev || prev.length != next.length) {
		return true;
	}

	for (let idx = 0, len = prev.length; idx < len; idx++) {
		if (prev[idx] !== next[idx]) {
			return true;
		}
	}

	return false;
}

function invokeOrReturn (value, fn) {
	return typeof fn == 'function' ? fn(value) : fn;
}
