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
	const [count, setCount] = Freak.useState(0)

	const increment = () => {
		setCount(count + 1)
	}

	return (
		<Freak.Fragment>
			<button onClick={increment}>
				count: {count}
			</button>

			<fieldset>
				<legend>Unmemoized</legend>
				<UnmemoizedCounter>
					<UnmemoizedCounter>
					</UnmemoizedCounter>
				</UnmemoizedCounter>
			</fieldset>

			<fieldset>
				<legend>Memoized</legend>
				<MemoizedCounter>
					<MemoizedCounter>
					</MemoizedCounter>
				</MemoizedCounter>
			</fieldset>
		</Freak.Fragment>
	)
}

Freak.render(<App />, document.getElementById('root'));
