import React from 'react';
import { Prompt } from 'react-router'
import moment from 'moment'
import produce from 'immer'
import { Row, Col, Spinner, Button, Form } from '../components'
import { LabeledTextInput, LabeledCheckbox, LabeledSelect } from '../components'

const styles = {
    preview: {
        container: {
            textAlign: 'center',
            verticalAlign: 'middle',
            overflow: 'scroll'
        },
        image: {
            maxWidth: '100%'
        },
    },
    information: {
        container: {
            padding: '1em',
            backgroundColor: "#F2F2F2",
            boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px',
            zIndex: '2'
        }
    }
};

export default class Scan extends React.Component {

    state = {}

    static getDerivedStateFromProps({scan}, oldState) {
        return (oldState.origScan!==scan) ? { scan, origScan:scan } : null;
    }

    componentDidUpdate(prevProps) {
        if(prevProps.scan!==this.props.scan)
            this.form?.reset();
    }

    onImageClick = () => this.setState( state => ({normalProjection: !state.normalProjection}) );

    FormButtons = ({form, changed}) =>
        <Row>
            <Prompt when={changed} message='You have unsaved changed, do you want to continue?'/>
            <Button className="fill" disabled={!changed} onClick={ () => this.props.onChange(this.state) }>Save </Button>
            <Button className="fill" disabled={!changed} onClick={ () => form.rollback() }>Reset</Button>
        </Row>

    getFormRef = form => { this.form = form; }

    render() {
        const { scan, status, fields, ...props } = this.props;

        if( !scan || !status)
            return <Row className="fill">
                <h1>No data</h1>
            </Row>

        return <Row className="fill">
            <div className="fill" style={ styles.preview.container }>
                { scan.done || !status.shooting
                    ? <img src={`/scan/${scan.id}/preview-${ this.state.normalProjection ? "1":"2"}.jpg`}
                        style={ styles.preview.image }
                        onClick={ this.onImageClick }/>
                    : <Spinner style={{margin:"20%"}}/>
                }
            </div>
            <Form ref={this.getFormRef}>
                <Col style={ styles.information.container }>

                    <Row>
                        { !scan.done && <Button onClick={ () => this.props.onAccept(scan) } disabled={status.shooting||status.downloading} className="fill">Accept  </Button> }
                        { !scan.done && <Button onClick={ () => this.props.onReject(scan) } disabled={status.shooting||status.downloading} className="fill">Reject  </Button> }

                        {  scan.done && <Button href={`/scan/${scan.id}.zip`}               className="fill">Download</Button> }
                        {  scan.done && <Button onClick={ () => this.props.onDelete(scan) } className="fill">Delete  </Button> }
                    </Row>

                    <h3>Scan information:</h3>

                    <Col style={{ display: "block" }} className="fill scroll">
                        <LabeledTextInput id="id"     label="ID"      value={this.state.scan.id       } readOnly />
                        <LabeledTextInput id="date"   label="Date"    value={`${moment(this.state.scan.date).toDate()}`} readOnly />

                        {
                            fields?.split(';').map(field => {
                                const [id,label,options] = field.split(':');

                                if(!options)
                                    return <Form.Field key={id}>
                                        <LabeledTextInput id={id} label={label} value={this.state.scan[id]} onChange={ e => { e.persist?.(); this.setState(produce( state => { state.scan[id] = e.target.value; } )); } } />
                                    </Form.Field>;
                                else
                                    return <Form.Field key={id}>
                                        <LabeledSelect    id={id} label={label} value={this.state.scan[id]} onChange={ e => { e.persist?.(); this.setState(produce( state => { state.scan[id] = e.target.value; } )); } } options={options.split(',')} />
                                    </Form.Field>;
                            })
                        }

                    </Col>

                    <Form.State>
                        <this.FormButtons/>
                    </Form.State>

                </Col>
            </Form>
        </Row>
    }
}
