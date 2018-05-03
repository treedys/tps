import React from 'react';
import moment from 'moment'
import { Row, Col, Button } from '../components'
import { PageSubLink } from './PageList.js'

const styles = {
    link: {
        description: {
            primary: {
                color: "#343B4B",
                fontSize: "1.5em",
                fontWeight: "bold",
                marginBottom: ".5em"
            },
            secondary: {
                color: "#A3A3A8"
            }
        }
    },
    list: {
        container: {
            height: '100%',
            width: '350px',
            boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px',
            zIndex: '1'
        },
        search: {
            container: {
                padding: "1em",
                backgroundColor: "#F2F2F2",
                width: "100%"
            },
            icon: {
                paddingLeft: '1em'
            }
        },

    }
};

export const CalibrationLink = ({calibration, selected, onSelectedChange, ...props}) =>
    <PageSubLink to={`/calibration/${calibration.id}`}
        checkbox selected={selected} onChange={ e => onSelectedChange(calibration.id, e.target.checked) }
        spinner={!calibration.done} icon={`/calibration/${calibration.id}/preview.jpg`}
        style={{ backgroundColor: calibration.zipDownloaded ? "#EEEEEE":"#FFFFFF" }}
        {...props}>
        <Col style={{ margin: "1em" }} className="fill align-center">
            <Row style={ styles.link.description.primary }>
                <span style={{ maxWidth: "6em" }}>{calibration.id}</span>
                <span style={{ minWidth: "2em" }} className="fill"/>
                <span>{moment(calibration.date).format('HH:mm')}</span>
            </Row>
            <Row style={ styles.link.description.secondary }>
                <span style={{ minWidth: "2em" }} className="fill"/>
                <span>{moment(calibration.date).toDate().toLocaleDateString()}</span>
            </Row>
        </Col>
    </PageSubLink>

export const CalibrationList = ({calibrations, selected, operational, onShoot, onSelectAll, children, ...props}) =>
    <Col style={ styles.list.container }>
        <Row>
            <Button onClick={ onShoot } disabled={!operational} style={{width:"100%"}}>Calibration</Button>
        </Row>
        <Col className="fill scroll">
            {calibrations?.sort((a,b)=>b.id-a.id).map( (calibration) =>
                <CalibrationLink key={calibration.id} calibration={calibration} selected={!!selected[calibration.id]} {...props} />
            )}
            { children }
        </Col>
        <Row>
            <Button onClick={ onSelectAll } style={{width:"100%"}}>Select All</Button>
        </Row>
    </Col>

export default CalibrationList;

