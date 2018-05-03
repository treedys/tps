import React from 'react';
import moment from 'moment'
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
export default class Calibration extends React.Component {

    updateState({calibration}) { this.setState( state => ({ ...calibration })); }

    render() {
        const { calibration, ...props } = this.props;

        if( !calibration )
            return <Row className="fill">
                <h1>No data</h1>
            </Row>

        return <Row className="fill">
            <div className="fill" style={ styles.preview.container }>
                { calibration.done
                    ? <img src={`/calibration/${calibration.id}/preview.jpg`} style={ styles.preview.image }/>
                    : <Spinner style={{margin:"20%"}}/>
                }
            </div>
            <Col style={ styles.information.container }>

                <Row>
                    <Button href={`/calibration/${calibration.id}.zip`} disabled={!calibration.done} className="fill">Download</Button>
                    <Button onClick={this.props.onDelete}               disabled={!calibration.done} className="fill">Delete</Button>
                </Row>

                <h3>Calibration information:</h3>

                <Col style={{ display: "block" }} className="fill scroll">
                    <LabeledTextInput id="id"     label="ID"      value={this.state.id       } readOnly />
                    <LabeledTextInput id="date"   label="Date"    value={`${moment(this.state.date).toDate()}`} readOnly />
                </Col>
            </Col>
        </Row>
    }
}
