/** @jsx Freak.createElement */
import * as Freak from '../src/index.js';

function useRenderCount () {
	const ref = Freak.useRef(0);
	return ++ref.current;
}

function UnmemoizedCounter (props) {
	const [count, setCount] = Freak.useState(0);
	const renderCount = useRenderCount();

	const increment = () => {
		setCount(count + 1);
	};

	return (
		<fieldset>
			<legend>
				<button onClick={increment}>
					increment: {count}
				</button>
				<span>
					rendered: {renderCount} times
				</span>
			</legend>

			{props.children}
		</fieldset>
	)
}

const MemoizedCounter = Freak.memo(UnmemoizedCounter);

function App () {
	return (
		<fieldset>
			<legend>Unmemoized</legend>
			<UnmemoizedCounter>
				<UnmemoizedCounter>

				</UnmemoizedCounter>
			</UnmemoizedCounter>
		</fieldset>
	)
}

Freak.render(<App />, document.getElementById('root'));
