import { currInstance, getHookState, enqueueRenderInstance } from './diff.js';


export function useErrorBoundary (callback) {
	currInstance._handleError = callback;
}

export function useContext (context) {
	let ctx = currInstance._context;
	let instance = currInstance;

	let state = ctx[context._id];

	useLayoutEffect(() => {
		if (state) {
			let callback = () => enqueueRenderInstance(instance);

			state._listeners.add(callback);
			return () => state._listeners.remove();
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
				enqueueRenderInstance(state._instance);
			}
		};

		state._value = [initialState, dispatch];
	}

	state._reducer = reducer;
	state._instance = currInstance;
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
	return useMemo(() => ({ current: initialValue }));
}


function argsChanged (prev, next) {
	return !prev || prev.length != next.length || next.some((val, idx) => val !== prev[idx]);
}

function invokeOrReturn (value, fn) {
	return typeof fn == 'function' ? fn(value) : fn;
}
