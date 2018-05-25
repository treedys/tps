import React from 'react';
import moment from 'moment'
import produce from 'immer'
import { Row, Col, Spinner, Button } from '../components'
import { LabeledTextInput, LabeledCheckbox, LabeledSelect } from '../components'
import { updateState, changeState } from '../utils'

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

@updateState
@changeState
export default class Scan extends React.Component {

    updateState({scan}) { this.setState( state => ({ scan })); }

    onImageClick = () => this.setState( state => ({normalProjection: !state.normalProjection}) );

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
                                return <LabeledTextInput key={id} id={id} label={label} value={this.state.scan[id]} onChange={ e => { e.persist?.(); this.changeState(produce( state => { state.scan[id] = e.target.value; } )); } } />
                            else
                                return <LabeledSelect    key={id} id={id} label={label} value={this.state.scan[id]} onChange={ e => { e.persist?.(); this.changeState(produce( state => { state.scan[id] = e.target.value; } )); } } options={options.split(',')} />
                        })
                    }

                </Col>
            </Col>
        </Row>
    }
}
