import React from 'react';
import ReactDOM from 'react-dom';

const render = () => {
    const App = require('./app').default;
    ReactDOM.render(<App></App>, document.getElementById('App'));
};

render();

