import React from 'react';
import moment from 'moment'
import { Row, Col, Spinner, Button } from '../components'
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

export default ({ calibration, previewCamera, onDelete}) => calibration ?
    <Row className="fill">
        <div className="fill" style={ styles.preview.container }>
            { calibration.done
                ? <img src={`/calibration/${calibration.id}/${previewCamera}.jpg`} style={ styles.preview.image }/>
                : <Spinner style={{margin:"20%"}}/>
            }
        </div>
        <Col style={ styles.information.container }>

            <Row>
                <Button href={`/calibration/${calibration.id}.zip`    } disabled={!calibration.downloadingEnd} className="fill">Download JPG</Button>
                <Button href={`/calibration/${calibration.id}.zip?mkv`} disabled={!calibration.encodingEnd   } className="fill">Download MKV</Button>
                <Button onClick={onDelete}                              disabled={!calibration.done          } className="fill">   Delete   </Button>
            </Row>

            <h3>Calibration information:</h3>

            <Col style={{ display: "block" }} className="fill scroll">
                <LabeledTextInput id="id"   label="ID"   value={        calibration.id             } readOnly />
                <LabeledTextInput id="date" label="Date" value={ moment(calibration.date).toDate() } readOnly />
                { calibration.failed?.length && <LabeledTextInput id="failed" label="Failed" value={ calibration.failed.join(' ')} readOnly /> }
            </Col>
        </Col>
    </Row>
    :
    <Row className="fill">
        <h1>No data</h1>
    </Row>
