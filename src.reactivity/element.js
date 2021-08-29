export let isVNode = Symbol.for('freak.vnode');

export function h (type, props, ...children) {
	if (!props) {
		props = {};
	}

	if (children.length) {
		props.children = children;
	}

	return createVNode(type, props, props.ref, props.key);
}

export function createVNode (type, props, ref, key = null) {
	return {
		_type: isVNode,

		_depth: 0,
		_instance: null,
		_parent: null,

		_child: null,

		_dom: undefined,
		_parentDom: undefined,
		_nextDom: undefined,

		type: type,
		props: props,
		ref: ref,
		key: key,
	};
}
