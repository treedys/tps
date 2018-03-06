import mixin from 'lodash-decorators/mixin'

export const updateState = mixin({
    componentWillMount()                 { this.updateState(this.props); },
    componentWillReceiveProps(nextProps) { this.updateState(nextProps); }
});

export const changeState = mixin({
    changeState(obj) {
        this.setState(
            (state) => ({...state, ...obj}),
            () => this.props.onChange && this.props.onChange(this.state)
        );
    }
});
