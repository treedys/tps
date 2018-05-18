import React from 'react';

export default class Focused extends React.Component {

    state = { isFocused: false };

    handleInputFocus = () => this.setState({ isFocused: true  });
    handleInputBlur  = () => this.setState({ isFocused: false });

    render() {
        const child = React.Children.only(this.props.children);

        return <child.type {...child.props}
                    isFocused={ this.state.isFocused }
                    onFocus={ event => { this.handleInputFocus(); child.onFocus?.(event); } }
                    onBlur ={ event => { this.handleInputBlur (); child.onBlur ?.(event); } }>
                    {child.props.children}
                </child.type>
    }
};
