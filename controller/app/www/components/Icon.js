import React from 'react';
import ReactSVG from 'react-svg';
import reactToCSS from 'react-style-object-to-css';

export default ({ style, ...props}) =>
    props.src.toLowerCase().endsWith("svg")
        ? <ReactSVG beforeInjection={ svg => svg.setAttribute('style', reactToCSS(style)) } {...props}/>
        : <div><img style={style} {...props}/></div>
