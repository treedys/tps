import mixin from 'lodash-decorators/mixin'

export const changeState = mixin({
    changeState(newState) {
        return new Promise( resolve =>
            this.setState(
                (newState instanceof Function) ? newState : (oldState) => ({...oldState, ...newState}),
                () => {
                    this.props.onChange?.(this.state);
                    resolve();
                }
            )
        );
    }
});
