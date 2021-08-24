import { Provider } from './context.js';
import { Fragment } from './fragment.js';
import { isVNode, jsxs } from './element.js';


export let currInstance = null
export let currIndex = 0;

export function getIndex () {
	return currIndex++;
}

export function diff (dom, next, prev, context, isSVG, excessDOM, prevDOM) {
	if (next._type !== isVNode) {
		return null;
	}

	let nextType = next.type;
	let nextProps = next.props;

	try {
		if (typeof nextType == 'function') {
			let instance = prev._instance || createInstance();
			next._instance = instance;

			instance.dom = dom;
			instance.vnode = next;
			instance.ctx = context;

			currInstance = instance;
			currIndex = 0;

			let result = nextType(nextProps);

			currInstance = null;

			// Check if component is our context provider, in which case we'll
			// set the appropriate context, and call any registered listeners.
			if (nextType == Provider && nextProps.context) {
				let ctx = nextProps.context;
				context = { ...context };

				let prevValue = context[ctx.id];
				let nextValue = nextProps.value;

				if (nextValue !== prevValue) {
					for (let listener of ctx._listeners) {
						listener();
					}
				}

				context[ctx.id] = nextValue;
			}

			if (result?.type == Fragment && result.key == null) {
				result = result.props.children;
			}
			else if (!Array.isArray(result)) {
				result = [result];
			}

			diffChildren(dom, result, next, prev, context, isSVG, excessDOM, prevDOM);
			flushLayoutEffects(instance, next);
		}
		else if (!excessDOM && next === prev) {
			next._child = prev._child;
			next._dom = prev._dom;
		}
		else {
			next._dom = diffElement(prev._dom, next, prev, context, isSVG, excessDOM);
		}
	} catch (error) {
		handleError(next, error);
	}
}

function diffElement (dom, next, prev, context, isSVG, excessDOM) {
	let type = next.type;
	let prevProps = prev.props;
	let nextProps = next.props;

	if (type === 'svg') {
		isSVG = true;
	}

	if (excessDOM != null) {
		for (let idx = 0; idx < excessDOM.length; idx++) {
			let child = excessDOM[idx];

			if (child && (child === dom || type ? child.localName == type : child.nodeType == 3)) {
				dom = child;
				excessDOM[idx] = null;
				break;
			}
		}
	}

	if (dom == null) {
		if (type === null) {
			return document.createTextNode(nextProps);
		}

		dom = isSVG
			? document.createElementNS('http://www.w3.org/2000/svg', type)
			: document.createElement(type, nextProps.is && { is: nextProps.is });

		excessDOM = null;
	}

	if (type === null) {
		if (dom.data !== nextProps) {
			dom.data = nextProps;
		}
	}
	else {
		excessDOM &&= [...dom.childNodes];
		prevProps ||= {};

		if (excessDOM != null) {
			prevProps = {};

			for (let idx = 0; idx < dom.attributes.length; idx++) {
				prevProps[dom.attributes[idx].name] = dom.attributes[idx].value;
			}
		}

		diffProps(dom, nextProps, prevProps, isSVG);

		if (nextProps.innerHTML) {
			next._child = [];
		}
		else {
			let child = next.props.children;
			if (!Array.isArray(child)) child = [child];

			diffChildren(dom, child, next, prev, context, isSVG, excessDOM, excessDOM ? excessDOM[0] : prev._child && getDOMSibling(prev, 0));

			if (excessDOM != null) {
				for (let idx = excessDOM.length; idx--;) {
					let node = excessDOM[idx];

					if (node != null) {
						node.remove();
					}
				}
			}
		}
	}

	return dom;
}

function diffProps (dom, nextProps, prevProps, isSVG) {
	for (let key in prevProps) {
		if (key !== 'children' && key !== 'key' && !(key in nextProps)) {
			setProperty(dom, key, null, prevProps[key], isSVG);
		}
	}

	for (let key in nextProps) {
		if (typeof nextProps[key] == 'function' && key !== 'children' && key !== 'key' && prevProps[key] !== nextProps[key]) {
			setProperty(dom, key, nextProps[key], prevProps[key], isSVG);
		}
	}
}

function diffChildren (dom, result, nextParent, prevParent, context, isSVG, excessDOM, prevDOM) {
	let prevArray = prevParent && prevParent._child || [];
	let prevArrayLen = prevArray.length;

	let nextArray = nextParent._child = [];
	let firstChildDOM = null;

	let refs = [];

	for (let idx = 0; idx < result.length; idx++) {
		let nextChild = result[idx];
		let type = typeof nextChild;

		if (nextChild == null || type == 'boolean') {
			nextChild = nextArray[idx] = null;
		}
		else if (type == 'string' || type == 'number' || type == 'bigint') {
			nextChild = nextArray[idx] = jsxs(null, nextChild);
		}
		else if (Array.isArray(nextChild)) {
			nextChild = nextArray[idx] = jsxs(Fragment, { children: nextChild });
		}
		else if (nextChild._depth > 0) {
			nextChild = nextArray[idx] = jsxs(nextChild.type, nextChild.props, nextChild.key);
		}
		else {
			nextArray[idx] = nextChild;
		}

		if (nextChild == null) {
			continue;
		}

		nextChild._parent = nextParent;
		nextChild._depth = nextParent._depth + 1;

		let prevChild = prevArray[idx];

		if (prevChild === null || (prevChild && nextChild.key === prevChild.key && nextChild.type === prevChild.type)) {
			prevArray[idx] = undefined;
		}
		else {
			for (let j = 0; j < prevArrayLen; j++) {
				prevChild = prevArray[j];

				if (prevChild && nextChild.key === prevChild.key && nextChild.type === prevChild.type) {
					prevArray[j] = undefined;
					break;
				}
				prevChild = null;
			}
		}

		prevChild ||= {};
		diff(dom, nextChild, prevChild, context, isSVG, excessDOM, prevDOM);

		let nextDOM = nextChild._dom;

		if (nextChild.ref && nextChild.ref !== prevChild.ref) {
			if (prevChild.ref) refs.push([prevChild.ref, null, nextChild]);
			refs.push([nextChild.ref, nextChild._instance, nextChild]);
		}

		if (nextDOM != null) {
			if (firstChildDOM == null) {
				firstChildDOM = nextDOM;
			}

			if (typeof nextChild.type == 'function' && nextChild._child == prevChild._child) {
				nextChild._next = prevDOM = reorderChildren(nextChild, dom, prevDOM);
			}
			else {
				prevDOM = placeChild(dom, nextChild, prevChild, prevArray, nextDOM, prevDOM);
			}

			if (typeof nextParent.type === 'function') {
				nextParent._next = prevDOM;
			}
		}
		else if (prevDOM && prevChild._dom == prevDOM && prevDOM.parentNode != dom) {
			prevDOM = getDOMSibling(prevChild);
		}
	}

	nextParent._dom = firstChildDOM;

	for (let idx = prevArrayLen; idx--;) {
		let prev = prevArray[idx];

		if (prev != null) {
			if (typeof nextParent.type == 'function' && prev._dom != null && prev._dom == nextParent._next) {
				nextParent._next = getDOMSibling(prevParent, idx + 1);
			}

			unmount(prev, prev);
		}
	}

	for (let [ref, value, vnode] of refs) {
		applyRef(ref, value, vnode);
	}
}

function reorderChildren (vnode, next, prev) {
	for (let idx = 0; idx < vnode._child.length; idx++) {
		let child = vnode._child[idx];

		if (child) {
			child._parent = vnode;

			if (typeof child.type == 'function') {
				prev = reorderChildren(child, next, prev);
			}
			else {
				prev = placeChild(next, child, child, vnode._child, child._dom, prev);
			}
		}
	}

	return prev;
}

function placeChild (dom, next, prev, prevChildren, nextDOM, prevDOM) {
	let place;

	if (next._next !== undefined) {
		place = next._next;
		next._next = undefined;
	}
	else if (prev == null || nextDOM != prevDOM || nextDOM.parentNode == null) {
		outer: if (prevDOM == null || prevDOM.parentNode != dom) {
			dom.appendChild(nextDOM);
			place = null;
		}
		else {
			for (let sibling = prevDOM, idx = 0; (sibling = sibling.nextSibling) && idx < prevChildren.length; idx += 2) {
				if (sibling == nextDOM) {
					break outer;
				}
			}

			dom.insertBefore(nextDOM, prevDOM);
			place = prevDOM;
		}
	}

	if (place !== undefined) {
		prevDOM = place;
	}
	else {
		prevDOM = nextDOM.nextSibling;
	}

	return prevDOM;
}

function setProperty (dom, name, value, prevValue, isSVG) {
	jump: if (name == 'style') {
		if (typeof value == 'string') {
			dom.style.cssText = value;
		} else {
			if (typeof prevValue == 'string') {
				dom.style.cssText = prevValue = '';
			}

			if (prevValue) {
				for (name in prevValue) {
					if (!(value && name in value)) {
						setStyle(dom.style, name, '');
					}
				}
			}

			if (value) {
				for (name in value) {
					if (!prevValue || value[name] !== prevValue[name]) {
						setStyle(dom.style, name, value[name]);
					}
				}
			}
		}
	}
	else if (name[0] == 'o' && name[1] == 'n') {
		if (name.toLowerCase() in dom) {
			name = name.toLowerCase().slice(2);
		}
		else {
			name = name.slice(2);
		}

		(dom._listeners ||= {})[name] = value;

		if (value) {
			dom.removeEventListener(name, prevValue);
			dom.addEventListener(name, value);
		}
		else {
			dom.removeEventListener(name, prevValue);
		}
	}
	else {
		if (isSVG && name === 'className') {
			name = 'class';
		}
		else if (name !== 'href' &&name !== 'list' &&name !== 'form' &&name !== 'tabIndex' &&name !== 'download' && name in dom) {
			try {
				dom[name] = value == null ? '' : value;
				// labelled break is 1b smaller here than a return statement (sorry)
				break jump;
			} catch {}
		}

		if (typeof value != 'function') {
			if (value != null && (value !== false || (name[0] == 'a' && name[1] == 'r' && name[2] == 'i' && name[3] == 'a'))) {
				dom.setAttribute(name, value);
			}
			else {
				dom.removeAttribute(name);
			}
		}
	}
}

function setStyle (style, key, value) {
	if (key[0] === '-') {
		style.setProperty(key, value);
	}
	else if (value == null) {
		style[key] = '';
	}
	else if (typeof value != 'number') {
		style[key] = value;
	}
	else {
		style[key] = value + 'px';
	}
}

function unmount (vnode, parent, skip) {
	if (vnode.ref) {
		if (!vnode.ref.current || vnode.ref.current !== vnode._dom) {
			applyRef(vnode.ref, null, parent);
		}
	}

	if (vnode._instance) {
		clearEffects(vnode._instance);
	}

	if (vnode._child) {
		for (let child of vnode._child) {
			if (child) {
				unmount(vnode, parent, typeof vnode.type != 'function');
			}
		}
	}

	if (!skip && vnode._dom != null) {
		vnode._dom.remove();
	}

	vnode._dom = null;
	vnode._next = null;
}

function getDOMSibling (vnode, idx) {
	if (idx == null) {
		return vnode._parent ? getDOMSibling(vnode._parent, vnode._parent._child.indexOf(vnode) + 1) : null;
	}

	for (; idx < vnode._child.length; idx++) {
		let sibling = vnode._child[idx];

		if (sibling != null && sibling._dom != null) {
			return sibling._dom;
		}
	}

	return typeof vnode.type == 'function' ? getDOMSibling(vnode) : null;
}

function updateParentDOMPointers (vnode) {
	if ((vnode = vnode._parent) != null && vnode._instance != null) {
		vnode._dom = null;

		for (let idx = 0; idx < vnode._child.length; idx++) {
			let child = vnode._child[idx];

			if (child != null && child._dom != null) {
				vnode._dom = child._dom;
				break;
			}
		}

		return updateParentDOMPointers(vnode);
	}
}

function applyRef (ref, value, vnode) {
	try {
		if (typeof ref == 'function') {
			ref(value);
		} else {
			ref.current = value;
		}
	} catch (err) {
		handleError(vnode, err);
	}
}


/// Error handling
function handleError (vnode, error) {
	while (vnode = vnode._parent) {
		try {
			let instance = vnode._instance;
			if (!instance || !instance.err) continue;

			instance.err(error);
			return;
		} catch (err) {
			error = err;
		}
	}

	throw error;
}


/// Components
function createInstance () {
	return {
		ctx: null,
		vnode: null,
		dom: null,

		hooks: [],
		pre: [],
		post: [],

		err: null,
	};
}

let renderQueue = [];

export function enqueueRenderInstance (instance) {
	if (!renderQueue.length) {
		requestAnimationFrame(flushRenderInstance);
	}

	renderQueue.push(instance);
}

function flushRenderInstance () {
	let queue;
	let length;

	while ((length = renderQueue.length)) {
		queue = renderQueue.sort((a, b) => a.vnode._depth - b.vnode._depth);
		renderQueue = [];

		for (let instance of queue) {
			renderInstance(instance);
		}
	}
}

export function renderInstance (instance) {
	let prev = instance.vnode;
	let next = jsxs(prev.type, prev.props, prev.key);

	let parent = instance.dom;
	let prevDOM = prev._dom;

	if (parent) {
		if (prevDOM == null) {
			prevDOM = getDOMSibling(next);
		}

		diff(parent, next, prev, instance.ctx, !!parent.ownerSVGElement, [prevDOM], prevDOM);

		if (next._dom != prevDOM) {
			updateParentDOMPointers(next);
		}
	}
}


/// Effects
function flushLayoutEffects (instance) {
	let pre = instance.pre;
	let queue = pre.splice(0, pre.length);

	for (let effect of queue) {
		invokeCleanup(effect);
		invokeHook(effect);
	}

	requestAnimationFrame(() => flushEffects(instance));
}

function flushEffects (instance) {
	let post = instance.post;
	let queue = post.splice(0, post.length);

	try {
		for (let effect of queue) {
			invokeCleanup(effect);
			invokeHook(effect);
		}
	} catch (error) {
		handleError(instance.vnode, error);
	}
}

function clearEffects (instance) {
	try {
		for (let effect of instance.hooks) {
			invokeCleanup(effect);
		}
	} catch (error) {
		handleError(instance.vnode, error);
	}
}

function invokeCleanup (hook) {
	let prevInstance = currInstance;

	if (typeof hook.cleanup === 'function')  {
		hook.cleanup();
	}

	currInstance = prevInstance;
}

function invokeHook (hook) {
	let prevInstance = currInstance;

	hook.cleanup = hook.value();

	currInstance = prevInstance;
}
