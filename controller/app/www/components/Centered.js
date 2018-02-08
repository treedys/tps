import React from 'react';

export default ({className, children, ...props}) =>
    <div className={`${className||''} align-center`} {...props}>
        {children}
    </div>
