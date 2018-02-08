import React from 'react';
import ReactDOM from 'react-dom';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const render = () => {
    ReactDOM.render(<h1>Hello, react world!</h1>, document.getElementById('App'));
};

render();

