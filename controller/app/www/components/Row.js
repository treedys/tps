import React from 'react';

export default ({className, children, ...props}) =>
    <div className={`${className||''} row`} {...props}>
        {children}
    </div>
