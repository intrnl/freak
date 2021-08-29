import { h } from './element.js';
import { diff } from './diff.js';

import { Fragment } from './fragment.js';


export function createRoot (root) {
	let context = Object.create(null);

	let isSVG = !!root.ownerSVGElement;

	let app = {
		render (next) {
			let prev = root._vdom;
			next = root._vdom = h(Fragment, null, next);

			let excessDOM = prev ? null : root.firstChild ? Array.from(root.childNodes) : null;

			diff(root, next, prev || {}, context, isSVG, excessDOM);
		},
		provide (key, value) {
			context[key] = value;
		},
	};

	return app;
}
