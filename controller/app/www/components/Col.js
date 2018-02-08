import React from 'react';

export default ({className, children, ...props}) =>
    <div className={`${className||''} col`} {...props}>
        {children}
    </div>
