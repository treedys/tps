import React from 'react';
import ReactSVG from 'react-svg';

export default ({url, style, ...props}) =>
    url.toLowerCase().endsWith("svg")
        ? <ReactSVG path={url} svgStyle={style} {...props}/>
        : <div><img src={url} style={style} {...props}/></div>
