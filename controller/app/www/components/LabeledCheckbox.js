import React from 'react';
import Row from './Row';

/* TODO: Could be merged with LabeledTextInput */

const styles = {
    normal: {
        container: {
            padding: '.5em 0em'
        },
        label: {
            fontSize: "1em",
            alignSelf: "baseline",
            marginLeft: "1em",
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
    active: {
        label: {
            color: "#00B7EC"
        },
        input: {
            color: '#343B4B',
            border: '#00B7EC'
        }
    }
};

export default class LabeledCheckbox extends React.Component {

    state = { isFocused: false };

    handleInputFocus = () => this.setState({ isFocused: true });
    handleInputBlur = () => this.setState({ isFocused: false });

    render() {
        const { isFocused } = this.state;
        const {id, label, labelStyle, style,  ...props} = this.props;

        return <Row style={ styles.normal.container }>
            <input type="checkbox"
                id={id}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
                style={{ ...styles.normal.input, ...( isFocused ? styles.active.input : {} ), ...style }}
                {...props}/>
            <label
                htmlFor={id}
                style={{ ...styles.normal.label, ...( isFocused ? styles.active.label : {} ), ...labelStyle }}>
                {label}
            </label>
        </Row>
    }
}
