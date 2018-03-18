import mixin from 'lodash-decorators/mixin'

export const updateState = mixin({
    componentWillMount()                 { this.updateState(this.props); },
    componentWillReceiveProps(nextProps) { this.updateState(nextProps); }
});

export const changeState = mixin({
    changeState(newState) {
        return new Promise( resolve =>
            this.setState(
                (oldState) => ({...oldState, ...newState}),
                () => {
                    this.props.onChange && this.props.onChange(this.state);
                    resolve();
                }
            )
        );
    }
});
