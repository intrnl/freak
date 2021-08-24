/** @jsx Freak.createElement */
import * as Freak from '../src/index.js';

let Context = Freak.createContext('foo');

function Consumer () {
	let value = Freak.useContext(Context);

	return (
		<div>{value}</div>
	);
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
			<Consumer />

			<Freak.Provider context={Context} value='bar'>
				<Timestamp />
				<Consumer />

				<Freak.Provider context={Context} value='baz'>
					<Timestamp />
					<Consumer />
				</Freak.Provider>
			</Freak.Provider>
		</Freak.Fragment>
	);
}

Freak.render(<App />, document.getElementById('root'));
