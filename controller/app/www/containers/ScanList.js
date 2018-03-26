import React from 'react';
import moment from 'moment'
import { Row, Col, Circle, Icon, LabeledTextInput, Centered } from '../components'
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
            minWidth: '200px',
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

export const ScanLink = ({scan, ...props}) =>
    <NavLink to={`/scan/${scan.id}`}
        style={ styles.link.normal }
        activeStyle={ styles.link.active }>
        <Row className="fill">
            <div style={{ width: "8px" }}>
                <Route path={`/scan/${scan.id}`} render={ props => <div style={ styles.link.activeBar }/> }/>
            </div>
            <Circle radius={40} className="align-center" style={ styles.link.circle }>
                <Icon url={`/scan/${scan.id}/preview-1.jpg`} style={ styles.link.icon }/>
            </Circle>
            <Col style={{ margin: "1em" }} className="fill align-center">
                <Row style={ styles.link.description.primary }>
                    <span style={{ maxWidth: "6em" }}>{scan.name}</span>
                    <span style={{ minWidth: "2em" }} className="fill"/>
                    <span>{moment(scan.date).format('HH:mm')}</span>
                </Row>
                <Row style={ styles.link.description.secondary }>
                    <span>{scan.id}</span>
                    <span style={{ minWidth: "2em" }} className="fill"/>
                    <span>{moment(scan.date).toDate().toLocaleDateString()}</span>
                </Row>
            </Col>
        </Row>
    </NavLink>

export const ScanList = ({scans, ...props}) =>
    <Col style={ styles.list.container }>
        <LabeledTextInput containerStyle={ styles.list.search.container }>
            <Centered>
                <Icon style={ styles.list.search.icon } url={ assets.search }/>
            </Centered>
        </LabeledTextInput>
        <Col className="fill scroll">
            {scans && scans.map( (scan) => <ScanLink key={scan.id} scan={scan} {...props} /> )}
        </Col>
    </Col>

export default ScanList;

