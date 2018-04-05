import React from 'react';
import moment from 'moment'
import { Row, Col, Circle, Icon, Button, Centered, Spinner } from '../components'
import { LabeledCheckbox } from '../components'
import { Route, NavLink  } from 'react-router-dom'
import assets from './assets'

const styles = {
    link: {
        normal: {
            backgroundColor: "#FFFFFF",
            borderBottom: "2px solid #EDEDED",
            textDecoration: "none"
        },
        active: {
            backgroundColor: "#F9F9F9"
        },
        activeBar: {
            width: "100%",
            height: "100%",
            backgroundColor: "#00B7EC"
        },
        circle: {
            border: "3px solid white",
            margin: "0.5em",
            boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px'
        },
        icon: {
            width: "100%",
            height: "auto"
        },
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
    <NavLink to={`/calibration/${calibration.id}`}
        style={ styles.link.normal }
        activeStyle={ styles.link.active }>
        <Row className="fill">
            <div style={{ width: "8px" }}>
                <Route path={`/calibration/${calibration.id}`} render={ props => <div style={ styles.link.activeBar }/> }/>
            </div>
            <Centered><LabeledCheckbox checked={selected} onChange={ e => onSelectedChange(calibration.id, e.target.checked) }/></Centered>
            <Circle radius={40} className="align-center" style={ styles.link.circle }>
                { !calibration.done && <Spinner/> }
                { calibration.done &&
                    <Icon url={`/calibration/${calibration.id}/preview.jpg`} style={ styles.link.icon }/>
                }
            </Circle>
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
        </Row>
    </NavLink>

export const CalibrationList = ({calibrations, selected, operational, onShoot, children, ...props}) =>
    <Col style={ styles.list.container }>
        <Row>
            <Button onClick={ onShoot } disabled={!operational} style={{width:"100%"}}>Calibration</Button>
        </Row>
        <Col className="fill scroll">
            {calibrations && calibrations.sort((a,b)=>b.id-a.id).map( (calibration) =>
                <CalibrationLink key={calibration.id} calibration={calibration} selected={!!selected[calibration.id]} {...props} />
            )}
            { children }
        </Col>
    </Col>

export default CalibrationList;

