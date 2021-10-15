/** @jsx Freak.createElement */
import * as Freak from '../src/index.js';

let Context = Freak.createContext('foo');

function Timestamp () {
	let value = Freak.useContext(Context);
	let [time, setTime] = Freak.useState(() => Date.now());

	Freak.useEffect(() => {
		let interval = setInterval(() => setTime(Date.now()), 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div>
			{time} - {value}
		</div>
	);
}

function App () {
	return (
		<Freak.Fragment>
			<Timestamp />

			<Freak.Provider context={Context} value='bar'>
				<Timestamp />

				<Freak.Provider context={Context} value='baz'>
					<Timestamp />
				</Freak.Provider>
			</Freak.Provider>
		</Freak.Fragment>
	);
}

Freak.render(<App />, document.getElementById('root'));
