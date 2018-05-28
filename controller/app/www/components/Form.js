import React from 'react';
import { Map } from 'immutable';

const Context = React.createContext();

class FieldLifecycleWrapper extends React.Component {
    /* FIXME: Place these methods in Form.Field class
     *        React context is not accessible from life cycle methods
     *        https://github.com/facebook/react/issues/12397
     * */
    componentDidMount()             { this.props.form.register      (this.props.field); }
    componentWillUnmount()          { this.props.form.unregister    (this.props.field); }
    componentWillReceiveProps(next) { this.props.form.handleNewProps(this.props.field, next); }

    render = () => this.props.children;
}

export default class Form extends React.Component {

    static Field = class Field extends React.Component {

        getValue = ()    => React.Children.only(this.props.children).props.value;
        setValue = value => React.Children.only(this.props.children).props.onChange({ target: { value } });

        render() {
            const child = React.Children.only(this.props.children);

            return <Context.Consumer>{ ({form}) =>
                    <FieldLifecycleWrapper field={this} form={form}>
                        <child.type
                            {...child.props}
                            form={form}
                            changed={form.isChanged(this)}>
                            {child.props.children}
                        </child.type>
                    </FieldLifecycleWrapper>
            }</Context.Consumer>;
        }
    }

    static State = class State extends React.Component {
        render() {
            return <Context.Consumer>{ ({form}) =>
                    React.Children.map(this.props.children, child =>
                        <child.type
                            {...child.props}
                            form={form}
                            changed={form.hasChangedField()}>
                            {child.props.children}
                        </child.type>
                    )}</Context.Consumer>;
        }
    }

    state = { fields: Map(), form: this };

    register  (field) { this.setState( ({fields}) => ({ fields: fields.set(field, { changed: false, value: field.props.children.props.value }  ) }) ); }
    unregister(field) { this.setState( ({fields}) => ({ fields: fields.delete(field) }) ); }

    isChanged (field) { return this.state.fields.get(field)?.changed || undefined; }

    hasChangedField() { return this.state.fields.some( fieldState => fieldState.changed ); }

    rollback() {
        this.state.fields.forEach( (fieldState, field) => {
            // WARNING: Don't return false!
            // Unlike Array#forEach, if any call returns false, the iteration will stop.
            // http://facebook.github.io/immutable-js/docs/#/Map/forEach
            fieldState.changed && field.setValue(fieldState.value);
        });
    }

    reset() {
        this.setState( ({fields}) => ({
            fields: fields.map( (oldFieldState, field) => ({
                value: field.getValue(),
                changed:false
            }))
        }));
    }

    handleNewProps(field, newProps) {
        const fieldState = this.state.fields.get(field);
        const newValue = newProps.children.props.value;

        if(!fieldState.changed && fieldState.value!=newValue) {
            this.setState( ({fields}) => ({
                fields: fields.update(field, oldFieldState => ({
                    ...oldFieldState,
                    changed: true
                }))
            }));
        } else if(fieldState.changed && fieldState.value==newValue) {
            this.setState( ({fields}) => ({
                fields: fields.update(field, oldFieldState => ({
                    ...oldFieldState,
                    changed: false
                }))
            }));
        }
    }

    render() {
        return <Context.Provider value={this.state}>
            {this.props.children}
        </Context.Provider>
    }
};
