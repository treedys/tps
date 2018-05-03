import React from 'react';
import Row from './Row';

const styles = {
    normal: {
        container: {
            padding: '.5em 0em'
        },
        label: {
            width: "5em",
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
    active: {
        label: {
            color: "#00B7EC"
        },
        select: {
            color: '#343B4B',
            border: '2px solid #00B7EC'
        }
    }
};

export default class LabeledSelect extends React.Component {

    state = { isFocused: false };

    handleInputFocus = () => this.setState({ isFocused: true });
    handleInputBlur = () => this.setState({ isFocused: false });

    render() {
        const { isFocused } = this.state;
        const { id, label, labelStyle, style, containerStyle, optionStyle, options, children, ...props } = this.props;

        return <Row style={{ ...styles.normal.container, ...containerStyle }}>
            { label && <label
                htmlFor={id}
                style={{ ...styles.normal.label, ...( isFocused ? styles.active.label : {} ), ...labelStyle }}>
                {label}
            </label> }
            <select className="fill"
                id={id}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
                style={{ ...styles.normal.select, ...( isFocused ? styles.active.select : {} ), ...style }}
                {...props}>
                { options?.map( option => <option key={option.value || option} style={{ ...styles.normal.option , ...optionStyle }} value={option.value || option}>{option.name || option}</option>)}
                {children}
            </select>
        </Row>
    }
};
