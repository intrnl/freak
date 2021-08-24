/** @jsx Freak.createElement */
import * as Freak from '../src/index.js';


function Counter () {
	let [count, setCount] = Freak.useState(0);

	function handleClick () {
		setCount(count + 1);
	}

	return (
		<button onClick={handleClick}>
			{count}
		</button>
	)
}

function Timestamp () {
	let [time, setTime] = Freak.useState(() => Date.now());

	Freak.useEffect(() => {
		let interval = setInterval(() => setTime(Date.now()), 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div>
			{time}
		</div>
	);
}

function App () {
	return (
		<Freak.Fragment>
			<Timestamp />
			<Counter />
			<Counter />
		</Freak.Fragment>
	);
}

Freak.render(<App />, document.getElementById('root'));
