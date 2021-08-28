import { diff } from './diff.js';
import { jsxs } from './element.js';
import { Fragment } from './fragment.js';


export function render (next, dom, replace) {
	let prev = (replace || dom)._vdom;
	next = (replace || dom)._vdom = jsxs(Fragment, { children: [next] });

	let context = {};
	let isSVG = !!dom.ownerSVGElement;
	let excessDOM = replace
		? [replace]
		: prev
			? null
			: dom.firstChild
				? Array.from(dom.childNodes)
				: null;

	diff(dom, next, prev || {}, context, isSVG, excessDOM);
}
