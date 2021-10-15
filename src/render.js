import { diff } from './diff.js';
import { vnode } from './element.js';
import { Fragment } from './fragment.js';


export function render (next, dom) {
	let prev = dom._vdom;
	next = dom._vdom = vnode(Fragment, { children: [next] });

	let context = {};
	let isSVG = !!dom.ownerSVGElement;
	let excessDOM = prev
		? null
		: dom.firstChild
			? Array.from(dom.childNodes)
			: null;

	diff(dom, next, prev || {}, context, isSVG, excessDOM);
}
