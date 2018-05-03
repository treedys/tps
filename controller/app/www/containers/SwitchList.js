import React from 'react';
import { Row, Col, Button } from '../components';
import { PageSubLink } from './PageList.js';

import assets from './assets/';

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
        }
    }
};

export const CamerasMapLink = props =>
    <PageSubLink to={'/cameras/map'}
        icon={assets.cameras}>
        <Col style={{ margin: "1em" }} className="fill align-center">
            <Row style={ styles.link.description.primary }>
                <span style={{ maxWidth: "6em" }}>Map</span>
            </Row>
        </Col>
    </PageSubLink>

export const SwitchLink = ({switchData, ...props}) =>
    <PageSubLink to={`/cameras/${switchData.id}`}
        icon={assets.switchIcon}>
        <Col style={{ margin: "1em" }} className="fill align-center">
            <Row style={ styles.link.description.primary }>
                <span style={{ maxWidth: "6em" }}>{switchData.name}</span>
                <span style={{ minWidth: "2em" }} className="fill"/>
                <span>{switchData.interface}</span>
            </Row>
            <Row style={ styles.link.description.secondary }>
                <span>{switchData.switchAddress}</span>
                <span style={{ minWidth: "2em" }} className="fill"/>
                <span>{switchData.hostAddress}</span>
            </Row>
        </Col>
    </PageSubLink>

export const SwitchList = ({switches, operational, onShoot, children, ...props}) =>
    <Col style={ styles.list.container } className="scroll">
        <Row>
            <Button onClick={ onShoot } disabled={!operational} style={{width:"100%"}}>Preview</Button>
        </Row>
        <Col className="fill scroll">
            <CamerasMapLink/>
            { switches?.map( (switchData) =>
                <SwitchLink key={switchData.id} switchData={switchData} {...props} />
            )}
            { children }
        </Col>
    </Col>

export default SwitchList;

