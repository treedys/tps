import React from 'react';
import produce from 'immer'
import { Row, Col, Button } from '../components'
import { LabeledTextInput, LabeledCheckbox, LabeledSelect } from '../components'
import CameraSettings from './CameraSettings'
import { changeState } from '../utils'

const styles = {
    container: {
        display: "block",
        padding: '1em',
        backgroundColor: "#F2F2F2"
    }
};

@changeState
export default class Settings extends React.Component {

    state = {}

    static getDerivedStateFromProps = ({settings}) => ({settings})

    render() {
        const { onSave, ...props} = this.props;

        if(!this.state?.settings?.camera)
            return <h1>No data</h1>;

        return <Col className="scroll fill" style={ styles.container }>

            <h3>Scanner settings:</h3>

            <Col style={ styles.container }>
                <LabeledTextInput id="preview"    label="Preview camera" value={this.state.settings.preview   } onChange={ (e) => { e.persist(); this.changeState(produce( state => { state.settings.preview    = e.target.value; } )); } } />
                <LabeledTextInput id="nextId"     label="Next ID"        value={this.state.settings.nextId    } onChange={ (e) => { e.persist(); this.changeState(produce( state => { state.settings.nextId     = e.target.value; } )); } } />
                <LabeledTextInput id="scanFields" label="Scan fields"    value={this.state.settings.scanFields} onChange={ (e) => { e.persist(); this.changeState(produce( state => { state.settings.scanFields = e.target.value; } )); } } />
                <Row style={{width:"100%"}}>
                    <LabeledTextInput id="columns" label="Columns" value={this.state.settings.scanner.columns} onChange={ (e) => { e.persist(); this.changeState(produce( state => { state.settings.scanner.columns = e.target.value; } )); } } containerStyle={{ width:`${100/3}%`, padding:'0.5em 0.0em 0.5em 0.0em' }} />
                    <LabeledTextInput id="rows"    label="Rows"    value={this.state.settings.scanner.rows   } onChange={ (e) => { e.persist(); this.changeState(produce( state => { state.settings.scanner.rows    = e.target.value; } )); } } containerStyle={{ width:`${100/3}%`, padding:'0.5em 0.0em 0.5em 0.5em' }} />
                    <LabeledTextInput id="extra"   label="Extra"   value={this.state.settings.scanner.extra  } onChange={ (e) => { e.persist(); this.changeState(produce( state => { state.settings.scanner.extra   = e.target.value; } )); } } containerStyle={{ width:`${100/3}%`, padding:'0.5em 0.0em 0.5em 0.5em' }} />
                </Row>
            </Col>

            <h3>Camera settings:</h3>
            <CameraSettings settings={this.state.settings.camera} onChange={ ({settings}) => this.changeState(produce( state => { state.settings.camera = settings; } )) } />
        </Col>
    }
}
