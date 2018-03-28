import React from 'react';

const styles = {
    button: {
        alignSelf: "baseline",
        border: '2px solid rgba(0,0,0,0.3)',
        borderRadius: '6px',
        margin: '1em',
        padding: '1em',
        fontSize: "1em",
        fontWeight: "bold",
        minWidth: "5em",
        boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px'
    },
    enabled: {
        color: '#FFFFFF',
        backgroundColor: "#00B7EC",
    },
    disabled: {
        backgroundColor: '#CCC',
        color: '#444'
    }
};

export default ({ disabled, children, style, ...props}) =>
    <button disabled={disabled} style={{ ...styles.button, ...(disabled?styles.disabled:styles.enabled), ...style }} { ...props }>
        {children}
    </button>
