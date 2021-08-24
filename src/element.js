export let isVNode = Symbol('freak.vnode');

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

	return jsxs(type, props, key);
}

export function jsxs (type, props, key = null) {
	return {
		_type: isVNode,

		_depth: 0,
		_instance: null,
		_parent: null,

		_child: null,

		_parentDom: undefined,
		_dom: undefined,
		_next: undefined,

		type: type,
		props: props,
		key: key,
		ref: props.ref,
	};
}
