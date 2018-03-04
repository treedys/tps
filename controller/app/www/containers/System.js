import React from 'react';

import { Row, Col, Button } from '../components/';

const camera_restart = () => { fetch('/api/cameras/restart', { method: 'POST' }); }

export const System = props =>
    <Col>
        <Row>
            <Button onClick={camera_restart}>Restart all cameras</Button>
        </Row>
    </Col>
