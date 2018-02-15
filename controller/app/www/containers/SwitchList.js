import React from 'react';
import { Row, Col, Circle, Icon, LabeledTextInput, Centered } from '../components'
import { Route, NavLink  } from 'react-router-dom'

import assets from './assets/';

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
        }
    }
};

export const SwitchLink = ({switchData, ...props}) =>
    <NavLink to={`/cameras/${switchData.id}`}
        style={ styles.link.normal }
        activeStyle={ styles.link.active }>

        <Row className="fill">
            <div style={{ width: "8px" }}>
                <Route path={`/cameras/${switchData.id}`} render={ props => <div style={ styles.link.activeBar }/> }/>
            </div>
            <Circle radius={40} className="align-center" style={ styles.link.circle }>
                <Icon url={assets.switchIcon}/>
            </Circle>
            <Col style={{ margin: "1em" }} className="fill align-center">
                <Row style={ styles.link.description.primary }>
                    <span style={{ maxWidth: "6em" }}>{switchData.model}</span>
                    <span style={{ minWidth: "2em" }} className="fill"/>
                    <span>{switchData.interface}</span>
                </Row>
                <Row style={ styles.link.description.secondary }>
                    <span>{switchData.switchAddress}</span>
                    <span style={{ minWidth: "2em" }} className="fill"/>
                    <span>{switchData.hostAddress}</span>
                </Row>
            </Col>
        </Row>
    </NavLink>

export const SwitchList = ({switches, ...props}) =>
    <Col style={ styles.list.container } className="scroll">
        { switches && switches.map( (switchData) =>
            <SwitchLink key={switchData.id} switchData={switchData} {...props} />
        )}
    </Col>

export default SwitchList;

