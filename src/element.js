import { VNode } from './utils.js';


export let uid = 0;

export function isValidElement (vnode) {
	return vnode && vnode._type === VNode;
}

export function cloneElement (element, props, ...children) {
	props = { ...element.props, ...props };

	if (children.length > 0) {
		props.children = children;
	}

	return jsx(element.type, props, props.key || element.key);
}

export function createElement (type, props, ...children) {
	if (props === null) {
		props = {};
	}

	if (children.length > 0) {
		props.children = children;
	}

	return jsx(type, props, props.key);
}


export function jsx (type, props, key) {
	if (!Array.isArray(props.children)) {
		props.children = [props.children];
	}

	return vnode(type, props, key);
}

export function jsxs (type, props, key) {
	return vnode(type, props, key);
}

export function vnode (type, props, key = null, id = uid++) {
	return {
		_type: VNode,

		_id: id,
		_depth: 0,
		_instance: null,
		_parent: null,

		_child: null,

		_dom: undefined,
		_nextDOM: undefined,

		type: type,
		props: props,
		key: key,
		ref: props.ref,
	};
}
