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
            overflow: 'scroll',
            scrollbarWidth: 'none'
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

    static getDerivedStateFromProps = ({scan}, oldState) => (oldState.origScan!==scan) ? { scan, origScan:scan } : null;

    componentDidUpdate(prevProps) {
        if(prevProps.scan!==this.props.scan)
            this.form?.reset();
    }

    onImageClick = () => this.setState( state => ({normalProjection: !state.normalProjection}) );

    FormButtons = ({form, changed, invalid}) =>
        <Row>
            <Prompt when={changed} message='You have unsaved changed, do you want to continue?'/>
            <Button className="fill" disabled={!changed||invalid} onClick={ () => this.props.onChange(this.state) }>Save</Button>
            <Button className="fill" disabled={!changed         } onClick={ () => form.rollback()                 }>Undo</Button>
        </Row>

    getFormRef = form => { this.form = form; }

    render() {
        const { scan, status, previewCamera, fields, ...props } = this.props;

        if( !scan || !status)
            return <Row className="fill">
                <h1>No data</h1>
            </Row>

        const everyFieldIsPopulated = fields?.split(';')
            .map( field => field.split(':') )
            .every( ([id,label,options]) => scan[id] );

        const enableDownloadJPG = everyFieldIsPopulated && scan.downloadingEnd;
        const enableDownloadMKV = everyFieldIsPopulated && scan.encodingEnd;

        return <Row className="fill">
            <div className="fill" style={ styles.preview.container }>
                { scan.done || !status.shooting
                    ? <img src={`/scan/${scan.id}/${previewCamera}-${this.state.normalProjection ? "1":"2"}.jpg`}
                        style={ styles.preview.image }
                        onClick={ this.onImageClick }/>
                    : <Spinner style={{margin:"20%"}}/>
                }
            </div>
            <Form ref={this.getFormRef}>
                <Col style={ styles.information.container }>

                    <Row>
                        { !scan.downloadingEnd && <Button onClick={ () => this.props.onAccept(scan) } disabled={status.shooting||status.downloading} className="fill">Accept  </Button> }
                        { !scan.downloadingEnd && <Button onClick={ () => this.props.onReject(scan) } disabled={status.shooting||status.downloading} className="fill">Reject  </Button> }

                        {  scan.downloadingEnd && <Button href=   {`/scan/${scan.id}.zip`           } disabled={!enableDownloadJPG}                  className="fill">Download JPG</Button> }
                        {  scan.downloadingEnd && <Button href=   {`/scan/${scan.id}.zip?mkv`       } disabled={!enableDownloadMKV}                  className="fill">Download MKV</Button> }
                        {  scan.downloadingEnd && <Button onClick={ () => this.props.onDelete(scan) } disabled={!scan.done}                          className="fill">   Delete   </Button> }
                    </Row>

                    <Col style={{ display: "block" }} className="fill scroll">
                        <h3>Scan information:</h3>
                        <LabeledTextInput id="id"   label="ID"   value={       scan.id            } readOnly />
                        <LabeledTextInput id="date" label="Date" value={moment(scan.date).toDate()} readOnly />
                        { scan.failed?.length && <LabeledTextInput id="failed" label="Failed" value={ scan.failed.join(' ')} readOnly /> }

                        { fields && <h3>Custom fields:</h3> }
                        {
                            fields?.split(';').map(field => {
                                const [id,label,options] = field.split(':');

                                if(!options)
                                    return <Form.Field key={id} validators={[Form.Field.Required]}>
                                        <LabeledTextInput id={id} label={label} value={this.state.scan[id]} onChange={ e => { e.persist?.(); this.setState(produce( state => { state.scan[id] = e.target.value; } )); } } />
                                    </Form.Field>;
                                else
                                    return <Form.Field key={id} validators={[Form.Field.Required]}>
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
