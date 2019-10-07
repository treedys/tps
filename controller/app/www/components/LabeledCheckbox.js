import React from 'react';
import Focused from './Focused';
import Row from './Row';

/* TODO: Could be merged with LabeledTextInput */

const styles = {
    normal: {
        container: {
            padding: '.5em 0em'
        },
        label: {
            fontSize: "1em",
            alignSelf: "center",
            marginLeft: "1em",
            fontWeight: "bold",
            color: "#5A7287"
        },
        input: {
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
            border: '#00B7EC'
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

const LabeledCheckbox = ({id, label, labelStyle, style, checked, focused, changed, invalid, ...props}) =>
    <Row style={ styles.normal.container }>
        <input type="checkbox"
            id={id}
            style={{
                ...styles.normal.input,
                ...( changed && styles.changed.input ),
                ...( focused && styles.focused.input ),
                ...( invalid && styles.invalid.input ),
                ...style
            }}
            checked={!!checked}
            {...props}/>
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
    </Row>

export default props => <Focused><LabeledCheckbox {...props}/></Focused>
