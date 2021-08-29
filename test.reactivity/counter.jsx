/** @jsx h */
import { h, Fragment, createRoot, ref } from '../src.reactivity/index.js';


function Counter (props) {
	let count = ref(props.initialCount ?? 0);

	function handleClick () {
		count.value++;
	}

	return () => (
		<Fragment>
			<button onClick={handleClick}>
				{count.value}
			</button>

			<div>
				{props.children}
			</div>
		</Fragment>
	);
}

function App () {
	return () => (
		<Fragment>
			<Counter>
				<Counter initialCount={1}>
					<Counter initialCount={2}>
						<Counter initialCount={3}>
							Hello world!
						</Counter>
					</Counter>
				</Counter>
			</Counter>
		</Fragment>
	);
}

let root = createRoot(document.getElementById('root'));
root.render(<App />);
