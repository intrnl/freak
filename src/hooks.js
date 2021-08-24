import { currInstance, getIndex, enqueueRenderInstance } from './diff.js';


export function useErrorBoundary (callback) {
	currInstance.err = callback;
}

export function useContext (context) {
	let id = context.id;
	let ctx = currInstance.ctx;
	let instance = currInstance;

	useLayoutEffect(() => {
		let callback = () => enqueueRenderInstance(instance);

		context._listeners.add(callback);
		return () => context._listeners.delete(callback);
	});

	return id in ctx ? ctx[id] : context.value;
}

export function useReducer (reducer, initialState, init) {
	let state = getHookState(getIndex());

	if (!state.instance) {
		initialState = init ? init(initialState) : invokeOrReturn(undefined, initialState);

		let dispatch = (action) => {
			let prevState = state.value[0];
			let nextState = state.reducer(prevState, action);

			if (prevState !== nextState) {
				state.value = [nextState, dispatch];
				enqueueRenderInstance(state.instance);
			}
		};

		state.value = [initialState, dispatch];
	}

	state.reducer = reducer;
	state.instance = currInstance;
	return state.value;
}

export function useState (initialState) {
	return useReducer(invokeOrReturn, initialState);
}

export function useEffect (callback, args) {
	let state = getHookState(getIndex());

	if (argsChanged(state.args, args)) {
		state.value = callback;
		state.args = args;

		currInstance.post.push(state);
	}
}

export function useLayoutEffect (callback, args) {
	let state = getHookState(getIndex());

	if (argsChanged(state.args, args)) {
		state.value = callback;
		state.args = args;

		currInstance.pre.push(state);
	}
}

export function useMemo (factory, args) {
	let state = getHookState(getIndex());

	if (argsChanged(state.args, args)) {
		state.value = factory();
		state.args = args;
	}

	return state.value;
}

export function useCallback (callback, args) {
	return useMemo(() => callback, args);
}

export function useRef (initialValue) {
	return useMemo(() => ({ current: initialValue }));
}


function getHookState (index) {
	let hooks = currInstance.hooks;

	if (index >= hooks.length) {
		hooks.push({});
	}

	return hooks[index];
}

function argsChanged (prev, next) {
	return !prev || prev.length != next.length || next.some((val, idx) => val !== prev[idx]);
}

function invokeOrReturn (value, fn) {
	return typeof fn == 'function' ? fn(value) : fn;
}
