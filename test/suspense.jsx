/** @jsx Freak.createElement */
import * as Freak from '../src/index.js';

function LazifiedComponent (props) {
	return (
		<div>Hello world, the count is {props.count}</div>
	);
}

let LazyComponent = Freak.lazy(() => {
	return new Promise((resolve) => {
		setTimeout(resolve, 3000, { default: LazifiedComponent });
	});
});

function App () {
	return (
		<Freak.Suspense fallback={<div>Suspended...</div>}>
			<LazyComponent count={3} />
		</Freak.Suspense>
	)
}

Freak.render(<App />, document.getElementById('root'));
