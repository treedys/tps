import React from 'react';
import ReactDOM from 'react-dom';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const render = () => {
    const App = require('./app').default;
    ReactDOM.render(<App></App>, document.getElementById('App'));
};

render();

