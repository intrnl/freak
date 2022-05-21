/** @jsx Freak.createElement */
import * as Freak from '../src/index.js';

function App () {
	let elementRef = Freak.useRef();
	let componentRef = Freak.useRef();

	Freak.useEffect(() => {
		console.log({ elementRef, componentRef });
	}, []);

	return (
		<Freak.Fragment>
			<div ref={elementRef}>Hello world!</div>
			<Child ref={componentRef} />
		</Freak.Fragment>
	);
}

function Child (props) {
	Freak.useImperativeHandle(props.ref, () => ({
		log: (message) => console.log(message),
	}));

	return (
		<div>Child component</div>
	);
}

Freak.render(<App />, document.getElementById('root'));
