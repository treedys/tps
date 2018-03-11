import React from 'react';

import { Row, Col, Button } from '../components/';

const camera_restart = () => { fetch('/api/cameras/restart', { method: 'POST' }); }
const camera_erase   = () => { fetch('/api/cameras/erase'  , { method: 'POST' }); }
const camera_exec    = () => { fetch('/api/cameras/exec'   , { method: 'POST' }); }

export const System = ({ status, ...props }) =>
    <Col>
        <Row>
            <Button disabled={ !status || status.restarting } onClick={camera_restart}>Restart all cameras</Button>
            <Button onClick={camera_erase}>Erase preview shots</Button>
            <Button onClick={camera_exec}>Backdoor check</Button>
        </Row>
    </Col>
