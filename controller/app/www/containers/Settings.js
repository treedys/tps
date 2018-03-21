import React from 'react';
import { Row, Col, Button } from '../components'
import CameraSettings from './CameraSettings'
import { updateState } from '../utils'

const styles = {
    container: {
        display: "block",
        padding: '1em',
        backgroundColor: "#F2F2F2"
    }
};

@updateState
export default class Settings extends React.Component {

    updateState({settings}) { this.setState( state => ({ ...settings })); }

    render() {
        const { onSave, ...props} = this.props;

        if(!this.state.camera)
            return <h1>No data</h1>;

        return <Col className="scroll fill" style={ styles.container }>

            <h3>Camera settings:</h3>
            <CameraSettings settings={this.state.camera} onChange={ camera => this.setState( state => ({ camera }))} />
            <Row>
                <Button onClick={ (e) => onSave(this.state) }>Save</Button>
            </Row>
        </Col>
    }
}
