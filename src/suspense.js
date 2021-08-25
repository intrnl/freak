import { createElement } from './element.js';
import { useState, useErrorBoundary } from './hooks.js';

export function Suspense (props) {
	let { fallback, children } = props;
	let [pending, setPending] = useState(false);

	useErrorBoundary((err) => {
		if (err?.then) {
			let callback = () => setPending(false);

			err.then(callback, callback);
			setPending(true);
			return true;
		}
	});

	return pending ? fallback : children;
}

export function lazy (loader) {
	let component;
	let promise;
	let error;

	return function LazyComponent (props) {
		if (!promise) {
			promise = loader().then(
				(exports) => component = exports.default || exports,
				(err) => error = err,
			);
		}

		if (error) {
			throw error;
		}

		if (!component) {
			throw promise;
		}

		return createElement(component, props);
	}
}
