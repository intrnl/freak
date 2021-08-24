/** @jsx Freak.createElement */
import * as Freak from '../src/index.js';

function App () {
	let [toggle, setToggle] = Freak.useState(false);

	function handleClick () {
		setToggle(!toggle);
	}

	return (
		<Freak.Fragment>
			<button onClick={handleClick}>
				toggle: {String(toggle)}
			</button>

			{toggle ? (
				<div>One</div>
			) : (
				<div>Two</div>
			)}
			<div>Foo</div>
			{toggle ? (
				<div>Three</div>
			) : (
				<div>Four</div>
			)}
		</Freak.Fragment>
	);
}

Freak.render(<App />, document.getElementById('root'));
