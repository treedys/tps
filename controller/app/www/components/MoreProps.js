import React from 'react';

export default class MoreProps extends React.Component {

    state = { focused: false, hovered: false, pressed: false };

    handleInputFocus = () => this.setState({ focused: true  });
    handleInputBlur  = () => this.setState({ focused: false });
    handleMouseEnter = () => this.setState({ hovered: true  });
    handleMouseLeave = () => this.setState({ hovered: false });
    handleMouseDown  = () => this.setState({ pressed: true  });
    handleMouseUp    = () => this.setState({ pressed: false });

    render() {
        const child = React.Children.only(this.props.children);

        return <child.type {...child.props}
                    focused = { this.state.focused }
                    hovered = { this.state.hovered }
                    pressed = { this.state.pressed }
                    onFocus      = { event => { this.handleInputFocus(); child.onFocus     ?.(event); } }
                    onBlur       = { event => { this.handleInputBlur (); child.onBlur      ?.(event); } }
                    onMouseEnter = { event => { this.handleMouseEnter(); child.onMouseEnter?.(event); } }
                    onMouseLeave = { event => { this.handleMouseLeave(); child.onMouseLeave?.(event); } }
                    onMouseDown  = { event => { this.handleMouseDown (); child.onMouseDown ?.(event); } }
                    onMouseUp    = { event => { this.handleMouseUp   (); child.onMouseUp   ?.(event); } }>
                    {child.props.children}
                </child.type>
    }
};
