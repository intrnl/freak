/** @jsx Freak.createElement */
import * as Freak from '../src/index.js';

function App () {
	return (
		<div>Hello world!</div>
	);
}

Freak.render(<App />, document.getElementById('root'));
