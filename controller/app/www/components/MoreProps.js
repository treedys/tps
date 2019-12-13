import React from 'react';

export default props => {

    const [ focused, setFocused ] = React.useState(false);
    const [ hovered, setHovered ] = React.useState(false);
    const [ pressed, setPressed ] = React.useState(false);

    const child = React.Children.only(props.children);

    return <child.type {...child.props}
        focused = { focused }
        hovered = { hovered }
        pressed = { pressed }
        onFocus      = { event => { setFocused(true ); child.onFocus     ?.(event); } }
        onBlur       = { event => { setFocused(false); child.onBlur      ?.(event); } }
        onMouseEnter = { event => { setHovered(true ); child.onMouseEnter?.(event); } }
        onMouseLeave = { event => { setHovered(false); child.onMouseLeave?.(event); } }
        onMouseDown  = { event => { setPressed(true ); child.onMouseDown ?.(event); } }
        onMouseUp    = { event => { setPressed(false); child.onMouseUp   ?.(event); } }>
        {child.props.children}
    </child.type>
};
