import React from 'react';

import MoreProps from './MoreProps';

const styles = {
    button: {
        borderRadius: '6px',
        margin: '1em',
        padding: '1em',
        fontSize: "1em",
        fontWeight: "bold",
        minWidth: "5em",
        textDecoration: 'none',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'box-shadow 0.1s'
    },
    enabled: {
        border: '1px solid rgba(0,0,0,0.2)',
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 6px 8px',
        color: '#FFFFFF',
        backgroundColor: "#00B7EC",
    },
    disabled: {
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 8px',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        color: 'rgba(0, 0, 0, 0.3)'
    },
    pressed: {
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 8px',
    },
    hovered: {
        backgroundColor: "#00C0F0",
    }
};

const Button = ({ pressed, focused, hovered, disabled, children, style, href, ...props}) => href
    ? <a href={disabled?null:href} disabled={disabled} style={{ ...styles.button, ...(disabled?styles.disabled:styles.enabled), ...(pressed && styles.pressed), ...(hovered && styles.hovered), ...style }} { ...props }>{children}</a>
    : <button                      disabled={disabled} style={{ ...styles.button, ...(disabled?styles.disabled:styles.enabled), ...(pressed && styles.pressed), ...(hovered && styles.hovered), ...style }} { ...props }>{children}</button>

export default props => <MoreProps><Button {...props}/></MoreProps>
