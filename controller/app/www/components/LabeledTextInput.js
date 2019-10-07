import React from 'react';
import MoreProps from './MoreProps';
import Row from './Row';

const styles = {
    normal: {
        container: {
            padding: '.5em 0em'
        },
        label: {
            width: "6em",
            fontSize: "1em",
            alignSelf: "center",
            marginRight: "1em",
            fontWeight: "bold",
            color: "#5A7287",
            transition: 'box-shadow 0.1s'
        },
        input: {
            color: '#BDBDBD',
            backgroundColor: "#FFFFFF",
            border: '1px solid #E1E7E7',
            borderRadius: '6px',
            padding: '1em',
            fontSize: "1em",
            transition: 'box-shadow 0.1s'
        }
    },
    hovered: {
        label: {
            color: "#00C0F0"
        },
        input: {
            color: '#384050',
            border: '1px solid #00C0F0'
        }
    },
    focused: {
        label: {
            color: "#00B7EC"
        },
        input: {
            color: '#343B4B',
            border: '1px solid #00B7EC',
            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 8px'
        }
    },
    invalid: {
        label: {
            color: '#EC4747'
        },
        input: {
            border: '1px solid #EC4747'
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

const LabeledTextInput = ({ id, label, labelStyle, style, containerStyle, value, children, focused, hovered, pressed, changed, invalid, ...props }) =>
    <Row style={{ ...styles.normal.container, ...containerStyle }}>
        { label && <label
            htmlFor={id}
            style={{
                ...styles.normal.label,
                ...( changed && styles.changed.label ),
                ...( focused && styles.focused.label ),
                ...( hovered && styles.hovered.label ),
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
                ...( hovered && styles.hovered.input ),
                ...( invalid && styles.invalid.input ),
                ...style
            }}
            value={value!==undefined?value:''}
            {...props}/>
        {children}
    </Row>

export default props => <MoreProps><LabeledTextInput {...props}/></MoreProps>
