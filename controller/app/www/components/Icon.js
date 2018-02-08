import React from 'react';
import ReactSVG from 'react-svg';

export default ({url, ...props}) =>
    url.toLowerCase().endsWith("svg")
        ? <ReactSVG path={url} {...props}/>
        : <div><img src={url} {...props}/></div>
