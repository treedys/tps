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
        input: {
            alignSelf: "baseline",
            color: '#BDBDBD',
            backgroundColor: "#FFFFFF",
            border: '2px solid #E1E7E7',
            borderRadius: '6px',
            padding: '1em',
            fontSize: "1em"
        },
    },
    active: {
        label: {
            color: "#00B7EC"
        },
        input: {
            color: '#343B4B',
            border: '2px solid #00B7EC'
        }
    }
};

export default class LabeledTextInput extends React.Component {

    state = { isFocused: false };

    /* TODO: Don't reinvent the wheel, research these instead:
     * https://www.npmjs.com/package/aphrodite
     * https://www.npmjs.com/package/radium
     * https://www.npmjs.com/package/style-it */

    handleInputFocus = () => this.setState({ isFocused: true });
    handleInputBlur = () => this.setState({ isFocused: false });

    render() {
        const { isFocused } = this.state;
        const { id, label, labelStyle, style, containerStyle, children, ...props } = this.props;

        return <Row style={{ ...styles.normal.container, ...containerStyle }}>
            { label && <label
                htmlFor={id}
                style={{ ...styles.normal.label, ...( isFocused ? styles.active.label : {} ), ...labelStyle }}>
                {label}
            </label> }
            <input className="fill"
                id={id}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
                style={{ ...styles.normal.input, ...( isFocused ? styles.active.input : {} ), ...style }}
                {...props}/>
            {children}
        </Row>
    }
}
