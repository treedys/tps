import React from 'react';

export default class MoreProps extends React.Component {

    state = { focused: false };

    handleInputFocus = () => this.setState({ focused: true  });
    handleInputBlur  = () => this.setState({ focused: false });

    render() {
        const child = React.Children.only(this.props.children);

        return <child.type {...child.props}
                    focused={ this.state.focused }
                    onFocus={ event => { this.handleInputFocus(); child.onFocus?.(event); } }
                    onBlur ={ event => { this.handleInputBlur (); child.onBlur ?.(event); } }>
                    {child.props.children}
                </child.type>
    }
};
