import { jsx } from './element.js';
import { currInstance, enqueueRenderInstance } from './diff.js';
import { Fragment } from './fragment.js';
import { CSuspense } from './utils.js';


export function lazy (loader) {
	let promise;
	let component;
	let error;

	function LazyComponent (props) {
		if (!promise) {
			promise = loader();

			promise.then(
				(exports) => (component = exports.default || exports),
				(err) => (error = err),
			);
		}

		if (error) {
			throw error;
		}

		if (!component) {
			throw promise;
		}

		return jsx(component, props);
	}

	return LazyComponent;
}

export function Suspense (props) {
	let state = currInstance._suspense ||= {
		_suspended: false,
		_pendingSuspensionCount: 0,
		_suspenders: [],
		_detachOnNextRender: null,
	};

	let suspended = state._suspended;
	let detachOnNextRender = state._detachOnNextRender;

	if (detachOnNextRender) {
		let children = currInstance._vnode._child;

		if (children) {
			let detachedParent = document.createElement('div');
			let detachedInstance = children[0]._instance;

			children[0] = detachedClone(
				detachOnNextRender,
				detachedParent,
				(detachedInstance._odom = detachedInstance._dom),
			);
		}
	}

	return [
		jsx(Fragment, { children: suspended ? [] : props.children }),
		suspended && jsx(Fragment, { children: [props.fallback] })
	];
}

Suspense.type = CSuspense;
Suspense._childDidSuspend = handleChildDidSuspend;

function handleChildDidSuspend (instance, promise, suspendingVNode) {
	let suspendingInstance = suspendingVNode._instance;

	let state = instance._suspense;
	let suspenders = state._suspenders;

	suspenders.push(suspendingInstance);

	let resolved = false;

	let onSuspensionComplete = () => {
		if (!--state._pendingSuspensionCount) {
			let suspendedVNode = state._suspended;
			let suspendedInstance = suspendedVNode._instance;

			instance._vnode._child[0] = removeOriginal(
				suspendedVNode,
				suspendedInstance._dom,
				suspendedInstance._odom,
			);

			state._suspended = state._detachOnNextRender = null;
			enqueueRenderInstance(instance);

			let suspended = suspenders.splice(0, suspenders.length);

			for (let instance of suspended) {
				enqueueRenderInstance(instance);
			}
		}
	};

	let onResolved = () => {
		if (resolved) {
			return;
		}

		resolved = true;
		suspendingInstance._onSuspensionResolve = null;

		onSuspensionComplete();
	};

	suspendingInstance._onSuspensionResolve = onResolved;

	state._pendingSuspensionCount++;
	state._suspended = state._detachOnNextRender = instance._vnode._child[0];

	promise.then(onResolved, onResolved);
	enqueueRenderInstance(instance);
}

function detachedClone (vnode, detachedParent, parentDom) {
	if (vnode) {
		let instance = vnode._instance;
		vnode = { ...vnode };

		if (instance) {
			let hooks = instance._hooks;

			for (let hook of hooks) {
				if (typeof hook._cleanup === 'function') {
					hook._cleanup();
				}
			}

			hooks.length = 0;

			if (instance._dom === parentDom) {
				instance._dom = detachedParent;
			}

			vnode._instance = null;
		}

		let next = [];

		for (let child of vnode._child) {
			let nextChild = detachedClone(child, detachedParent, parentDom);
			next.push(nextChild);
		}

		vnode._child = next;
	}

	return vnode;
}

function removeOriginal (vnode, detachedParent, originalParent) {
	if (vnode) {
		let next = [];
		let instance = vnode._instance;
		let children = vnode._child;

		if (children) {
			for (let child of children) {
				let nextChild = removeOriginal(child, detachedParent, originalParent);
				next.push(nextChild);
			}
		}

		if (instance && instance._dom === detachedParent) {
			if (vnode._dom) {
				originalParent.insertBefore(vnode._dom, vnode._nextDOM);
			}

			instance._dom = originalParent;
		}

		vnode._id = null;
		vnode._child = next;
	}

	return vnode;
}
