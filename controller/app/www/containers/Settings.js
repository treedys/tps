import React from 'react';
import { Row, Col, Button } from '../components'
import { LabeledTextInput, LabeledCheckbox, LabeledSelect } from '../components'
import CameraSettings from './CameraSettings'
import { updateState, changeState } from '../utils'

const styles = {
    container: {
        display: "block",
        padding: '1em',
        backgroundColor: "#F2F2F2"
    }
};

@updateState
@changeState
export default class Settings extends React.Component {

    updateState({settings}) { this.setState( state => ({ ...settings })); }

    render() {
        const { onSave, ...props} = this.props;

        if(!this.state.camera)
            return <h1>No data</h1>;

        return <Col className="scroll fill" style={ styles.container }>

            <h3>Scanner settings:</h3>

            <Col style={ styles.container }>
                <LabeledTextInput id="preview"    label="Preview camera" value={this.state.preview   } onChange={ (e) => { e.persist(); this.changeState( state => ({    preview: e.target.value })); } } />
                <LabeledTextInput id="nextId"     label="Next ID"        value={this.state.nextId    } onChange={ (e) => { e.persist(); this.changeState( state => ({     nextId: e.target.value })); } } />
                <LabeledTextInput id="scanFields" label="Scan fields"    value={this.state.scanFields} onChange={ (e) => { e.persist(); this.changeState( state => ({ scanFields: e.target.value })); } } />
                <Row style={{width:"100%"}}>
                    <LabeledTextInput id="columns" label="Columns" value={this.state.scanner.columns} onChange={ (e) => { e.persist(); this.changeState( state => ({ scanner: { ...state.scanner, columns: e.target.value }})); } } containerStyle={{ width:`${100/3}%`, padding:'0.5em 0.0em 0.5em 0.0em' }} />
                    <LabeledTextInput id="rows"    label="Rows"    value={this.state.scanner.rows   } onChange={ (e) => { e.persist(); this.changeState( state => ({ scanner: { ...state.scanner,    rows: e.target.value }})); } } containerStyle={{ width:`${100/3}%`, padding:'0.5em 0.0em 0.5em 0.5em' }} />
                    <LabeledTextInput id="extra"   label="Extra"   value={this.state.scanner.extra  } onChange={ (e) => { e.persist(); this.changeState( state => ({ scanner: { ...state.scanner,   extra: e.target.value }})); } } containerStyle={{ width:`${100/3}%`, padding:'0.5em 0.0em 0.5em 0.5em' }} />
                </Row>
            </Col>

            <h3>Camera settings:</h3>
            <CameraSettings settings={this.state.camera} onChange={ camera => this.changeState( state => ({ camera }))} />
        </Col>
    }
}
