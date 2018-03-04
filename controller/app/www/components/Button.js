import React from 'react';

const styles = {
    button: {
        alignSelf: "baseline",
        color: '#FFFFFF',
        backgroundColor: "#00B7EC",
        border: '2px solid #00B7EC',
        borderRadius: '6px',
        margin: '1em',
        padding: '1em',
        fontSize: "1em",
        fontWeight: "bold",
        minWidth: "5em",
        boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px'
    }
};

export default ({children, style, ...props}) =>
    <button style={{ ...styles.button, ...style }} { ...props }>
        {children}
    </button>
