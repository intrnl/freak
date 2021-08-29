import { currInstance } from './diff.js';


export function provide (key, value) {
	let context = currInstance._context;
	context[key] = value;
}

export function inject (key, defaultValue) {
	let context = currInstance._context;
	return key in context ? context[key] : defaultValue;
}

export function onRenderError (callback) {
	currInstance._error = callback;
}
