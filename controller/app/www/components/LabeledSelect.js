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
        select: {
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearence: "none",
            alignSelf: "baseline",
            color: '#BDBDBD',
            backgroundColor: "#FFFFFF",
            border: '2px solid #E1E7E7',
            borderRadius: '6px',
            padding: '1em',
            fontSize: "1em"
        },
        option: {
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearence: "none",
            alignSelf: "baseline",
            color: '#343B4B',
            backgroundColor: "#FFFFFF",
            fontSize: "1em"
        }
    },
    focused: {
        label: {
            color: "#00B7EC"
        },
        select: {
            color: '#343B4B',
            border: '2px solid #00B7EC'
        }
    },
    invalid: {
        label: {
            color: '#EC4747'
        },
        select: {
            border: '2px solid #EC4747'
        }
    },
    changed: {
        label: {
        },
        select: {
            color: '#343B4B',
        }
    }
};

const LabeledSelect = ({ id, label, labelStyle, style, containerStyle, optionStyle, value, options, children, focused, changed, invalid, ...props }) =>
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
        <select className="fill"
            id={id}
            style={{
                ...styles.normal.select,
                ...( changed && styles.changed.select ),
                ...( focused && styles.focused.select ),
                ...( invalid && styles.invalid.select ),
                ...style
            }}
            value={value!==undefined?value:''}
            {...props}>
            <option key={undefined} value='' hidden disabled/>
            { options?.map( option => <option key={option.value || option} style={{ ...styles.normal.option , ...optionStyle }} value={option.value || option}>{option.name || option}</option>)}
            {children}
        </select>
    </Row>

export default props => <Focused><LabeledSelect {...props}/></Focused>
