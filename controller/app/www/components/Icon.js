import React from 'react';
import ReactSVG from 'react-svg';

export default ({ style, ...props}) =>
    props.src.toLowerCase().endsWith("svg")
        ? <ReactSVG svgStyle={style} {...props}/>
        : <div><img    style={style} {...props}/></div>
