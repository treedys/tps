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

export const ScanLink = ({scan, selected, onSelectedChange, ...props}) =>
    <PageSubLink to={`/scan/${scan.id}`}
        checkbox selected={selected} onChange={ e => onSelectedChange(scan.id, e.target.checked) }
        spinner={!scan.done} icon={`/scan/${scan.id}/preview-1.jpg`}
        {...props}>
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
    </PageSubLink>

export const ScanList = ({scans, selected, operational, onShoot, children, ...props}) =>
    <Col style={ styles.list.container }>
        <Row>
            <Button onClick={ onShoot } disabled={!operational} style={{width:"100%"}} >Scan</Button>
        </Row>
        <Col className="fill scroll">
            {scans?.sort((a,b)=>b.id-a.id).map( (scan) =>
                <ScanLink key={scan.id} scan={scan} selected={!!selected[scan.id]} {...props} />
            )}
            { children }
        </Col>
    </Col>

export default ScanList;

