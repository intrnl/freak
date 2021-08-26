import { currInstance, enqueueRenderInstance } from './diff.js';
import { createElement } from './element.js';
import { useErrorBoundary } from './hooks.js';

export function Suspense (props) {
	let instance = currInstance;

	useErrorBoundary((err) => {
		if (err?.finally) {
			err.finally(() => enqueueRenderInstance(instance));
			return true;
		}
	});

	return props.children;
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
