import React from 'react';
import { Prompt } from 'react-router'
import produce from 'immer'
import { Row, Col, Button, Form } from '../components'
import { LabeledTextInput, LabeledCheckbox, LabeledSelect } from '../components'
import CameraSettings from './CameraSettings'

const styles = {
    container: {
        padding: '1em',
        backgroundColor: "#F2F2F2"
    }
};

export default class Settings extends React.Component {

    state = {}

    static getDerivedStateFromProps = ({settings}, oldState) => (oldState.origSettings!==settings) ? { settings, origSettings:settings } : null;

    componentDidUpdate(prevProps) {
        if(prevProps.settings!==this.props.settings)
            this.form?.reset();
    }

    FormButtons = ({form, changed}) =>
        <Row>
            <Prompt when={changed} message='You have unsaved changed, do you want to continue?'/>
            <Button className="fill" disabled={!changed} onClick={ () => this.props.onChange(this.state) }>Save</Button>
            <Button className="fill" disabled={!changed} onClick={ () => form.rollback()                 }>Undo</Button>
        </Row>

    getFormRef = form => { this.form = form; }

    render() {
        if(!this.state?.settings?.camera)
            return <h1>No data</h1>;

        return <Col className="fill" style={ styles.container }>
            <Form ref={this.getFormRef}>

                <Col style={{ display: "block" }} className="fill scroll">

                    <h3>Scanner settings:</h3>
                    <Col style={ styles.container }>
                        <Form.Field><LabeledTextInput id="hostname"   label="Network name"   value={this.state.settings.hostname  } onChange={ ({target:{value}}) => { this.setState(produce( state => { state.settings.hostname   = value; } )); } } /></Form.Field>
                        <Form.Field><LabeledTextInput id="preview"    label="Preview camera" value={this.state.settings.preview   } onChange={ ({target:{value}}) => { this.setState(produce( state => { state.settings.preview    = value; } )); } } /></Form.Field>
                        <Form.Field><LabeledTextInput id="nextId"     label="Next ID"        value={this.state.settings.nextId    } onChange={ ({target:{value}}) => { this.setState(produce( state => { state.settings.nextId     = value; } )); } } /></Form.Field>
                        <Form.Field><LabeledTextInput id="scanFields" label="Scan fields"    value={this.state.settings.scanFields} onChange={ ({target:{value}}) => { this.setState(produce( state => { state.settings.scanFields = value; } )); } } /></Form.Field>
                        <Row style={{width:"100%"}}>
                            <Form.Field><LabeledTextInput id="columns" label="Columns" value={this.state.settings.scanner.columns} onChange={ ({target:{value}}) => { this.setState(produce( state => { state.settings.scanner.columns = value; } )); } } containerStyle={{ width:`${100/3}%`, padding:'0.5em 0.0em 0.5em 0.0em' }} /></Form.Field>
                            <Form.Field><LabeledTextInput id="rows"    label="Rows"    value={this.state.settings.scanner.rows   } onChange={ ({target:{value}}) => { this.setState(produce( state => { state.settings.scanner.rows    = value; } )); } } containerStyle={{ width:`${100/3}%`, padding:'0.5em 0.0em 0.5em 0.5em' }} /></Form.Field>
                            <Form.Field><LabeledTextInput id="extra"   label="Extra"   value={this.state.settings.scanner.extra  } onChange={ ({target:{value}}) => { this.setState(produce( state => { state.settings.scanner.extra   = value; } )); } } containerStyle={{ width:`${100/3}%`, padding:'0.5em 0.0em 0.5em 0.5em' }} /></Form.Field>
                        </Row>
                    </Col>

                    <h3>Camera settings:</h3>
                    <CameraSettings settings={this.state.settings.camera} onChange={ ({settings}) => this.setState(produce( state => { state.settings.camera = settings; } )) } />

                </Col>

                <Form.State>
                    <this.FormButtons/>
                </Form.State>

            </Form>
        </Col>
    }
}
