/** @jsx Freak.createElement */
import * as Freak from '../src/index.js';


function App () {
	let [count, setCount] = Freak.useState(0);

	function handleClick () {
		setCount(count + 1);
	}

	Freak.useEffect(() => {
		console.log(`Enter ${count}`);
		return () => console.log(`Leave ${count}`);
	}, [count]);

	return (
		<button onClick={handleClick}>
			{count}
		</button>
	)
}

Freak.render(<App />, document.getElementById('root'));
