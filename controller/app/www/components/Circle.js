import React from 'react';

export default ({radius, children, style, ...props}) =>
    <div style={{
        width: `${radius*2}px`,
        height: `${radius*2}px`,
        borderRadius: `${radius}px`,
        overflow: "hidden",
        ...style
    }} {...props}>
        {children}
    </div>
