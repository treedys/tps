import React from 'react';
import Focused from './Focused';
import Row from './Row';

const styles = {
    normal: {
        container: {
            padding: '.5em 0em'
        },
        label: {
            width: "6em",
            fontSize: "1em",
            alignSelf: "baseline",
            marginRight: "1em",
            fontWeight: "bold",
            color: "#5A7287"
        },
        input: {
            alignSelf: "baseline",
            color: '#BDBDBD',
            backgroundColor: "#FFFFFF",
            border: '2px solid #E1E7E7',
            borderRadius: '6px',
            padding: '1em',
            fontSize: "1em"
        }
    },
    focused: {
        label: {
            color: "#00B7EC"
        },
        input: {
            color: '#343B4B',
            border: '2px solid #00B7EC'
        }
    },
    invalid: {
        label: {
            color: '#EC4747'
        },
        input: {
            border: '2px solid #EC4747'
        }
    },
    changed: {
        label: {
        },
        input: {
            color: '#343B4B',
        }
    }
};

/* TODO: Don't reinvent the wheel, research these instead:
 * https://www.npmjs.com/package/aphrodite
 * https://www.npmjs.com/package/radium
 * https://www.npmjs.com/package/style-it */

const LabeledTextInput = ({ id, label, labelStyle, style, containerStyle, value, children, focused, changed, invalid, ...props }) =>
    <Row style={{ ...styles.normal.container, ...containerStyle }}>
        { label && <label
            htmlFor={id}
            style={{
                ...styles.normal.label,
                ...( changed && styles.changed.label ),
                ...( focused && styles.focused.label ),
                ...( invalid && styles.invalid.label ),
                ...labelStyle
            }}>
            {label}
        </label> }
        <input className="fill"
            id={id}
            style={{
                ...styles.normal.input,
                ...( changed && styles.changed.input ),
                ...( focused && styles.focused.input ),
                ...( invalid && styles.invalid.input ),
                ...style
            }}
            value={value!==undefined?value:''}
            {...props}/>
        {children}
    </Row>

export default props => <Focused><LabeledTextInput {...props}/></Focused>
