import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom'

import { Row, Col } from './components/';
import {
    Header,
    PageList, PageLink
} from './containers/';

import assets from './assets/';

const styles = {
    container: {
        width: "100%",
        height: "100%"
    }
}

export default class App extends React.Component {

    constructor(props) {
        super(props);
    }

    render = () =>
        <Router>
            <Col style={ styles.container }>
                <Header/>
                <Row className="fill">
                    <PageList>
                        <PageLink to="/shoot"       title="Shoot!"      icon={assets.shoot}/>
                        <PageLink to="/session"     title="Session"     icon={assets.session}/>
                        <PageLink to="/calibration" title="Calibration" icon={assets.calibration}/>
                        <PageLink to="/cameras"     title="Cameras"     icon={assets.cameras}/>
                        <PageLink to="/settings"    title="Settings"    icon={assets.settings}/>
                    </PageList>
                </Row>
            </Col>
        </Router>
}

