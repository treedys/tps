import React from 'react';
import moment from 'moment'
import Badge from 'react-notification-badge';
import { Effect as BadgeEffect } from 'react-notification-badge';
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
        }
    }
};

export const ScanLink = ({scan, selected, previewCamera, onSelectedChange, ...props}) =>
    <PageSubLink to={`/scan/${scan.id}`}
        checkbox selected={selected} onChange={ e => onSelectedChange(scan.id, e.target.checked) }
        spinner={!scan.done} icon={`/scan/${scan.id}/${previewCamera}-1.jpg`}
        style={{ backgroundColor: scan.zipDownloaded ? "#EEEEEE":"#FFFFFF" }}
        {...props}>
        <Badge count={scan.failed?.length} effect={BadgeEffect.SCALE} containerStyle={{width: undefined, height: undefined, position:"relative", top:"1em", right:"1em"}}/>
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
            <Row style={ styles.link.description.secondary }>
                <span>D:{moment(scan.downloadingEnd).diff(scan.downloadingStart, 'seconds')}</span>
                <span style={{ minWidth: "2em" }} className="fill"/>
                <span>E:{moment(scan.   encodingEnd).diff(scan.   encodingStart, 'seconds')}</span>
            </Row>
        </Col>
    </PageSubLink>

export const ScanList = ({scans, selected, operational, previewCamera, onShoot, onSelectAll, children, ...props}) =>
    <Col style={ styles.list.container }>
        <Row>
            <Button onClick={ onShoot } disabled={!operational} style={{width:"100%"}} >Scan</Button>
        </Row>
        <Col className="fill scroll">
            {scans?.sort((a,b)=>b.id-a.id).map( (scan) =>
                <ScanLink key={scan.id} scan={scan} selected={!!selected[scan.id]} previewCamera={previewCamera} {...props} />
            )}
            { children }
        </Col>
        <Row>
            <Button onClick={ onSelectAll } style={{width:"100%"}}>Select All</Button>
        </Row>
    </Col>

export default ScanList;

