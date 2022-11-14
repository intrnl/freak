import { vnode } from './element.js';
import { Fragment } from './fragment.js';


function jsx (type, props, key) {
	return vnode(type, props, key);
}

export {
	Fragment,
	jsx as jsx,
	jsx as jsxs,
	jsx as jsxDEV,
};
