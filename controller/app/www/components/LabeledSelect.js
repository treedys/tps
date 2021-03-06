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
            color: "#5A7287"
        },
        select: {
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearence: "none",
            color: '#BDBDBD',
            backgroundColor: "#FFFFFF",
            border: '1px solid #E1E7E7',
            borderRadius: '6px',
            padding: '1em',
            fontSize: "1em"
        },
        option: {
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearence: "none",
            color: '#343B4B',
            backgroundColor: "#FFFFFF",
            fontSize: "1em"
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
        select: {
            color: '#343B4B',
            border: '1px solid #00B7EC',
            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 8px'
        }
    },
    invalid: {
        label: {
            color: '#EC4747'
        },
        select: {
            border: '1px solid #EC4747'
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

const LabeledSelect = ({ id, label, labelStyle, style, containerStyle, optionStyle, value, options, children, focused, hovered, pressed, changed, invalid, ...props }) =>
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
        <select className="fill"
            id={id}
            style={{
                ...styles.normal.select,
                ...( changed && styles.changed.select ),
                ...( focused && styles.focused.select ),
                ...( hovered && styles.hovered.select ),
                ...( invalid && styles.invalid.select ),
                ...style
            }}
            value={value!==undefined?value:''}
            {...props}>
            <option key={undefined} value='' hidden disabled/>
            { options?.map( option => typeof option != "object" ? { name:option, value:option } : option ).map( option => <option key={option.value} style={{ ...styles.normal.option , ...optionStyle }} value={option.value}>{option.name}</option>)}
            {children}
        </select>
    </Row>

export default props => <MoreProps UGLY_FF_SELECT_FIX={true}><LabeledSelect {...props}/></MoreProps>
