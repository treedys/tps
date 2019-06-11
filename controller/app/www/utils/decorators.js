import mixin from 'lodash-decorators/mixin'

// FIXME: Replace `mixin` with manual decorator
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
