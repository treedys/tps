import React from 'react';
import { createHashHistory as createHistory } from 'history';
import { Router, Route, Switch } from 'react-router-dom';

import { Row, Col, Button } from './components/';
import {
    Header,
    PageList, PageLink,
    Scan, ScanList,
    SwitchList, CameraList,
    Settings
} from './containers/';

import assets from './assets/';

import services from './services';

import { changeState } from './utils/decorators';

const styles = {
    container: {
        width: "100%",
        height: "100%"
    }
}

@changeState
export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
        this.history = createHistory();
    }

    componentDidMount() {
        this.switches = services.switches.watch().find().subscribe( switches => this.changeState({ switches }));
        this.cameras  = services. cameras.watch().find().subscribe(  cameras => this.changeState({ cameras  }));
        this.scans    = services.   scans.watch().find().subscribe(    scans => this.changeState({ scans    }));
        this.config   = services.  config.watch().get('0').subscribe( config => this.changeState({ config }));
    }

    componentWillUnmount() {
        this.switches.unsubscribe();
        this.cameras .unsubscribe();
        this.scans   .unsubscribe();
        this.config  .unsubscribe();
    }

    shoot = async () => {
        try {
            const response = await fetch('/api/shoot', { method: 'POST' });
            const { id:scanId } = await response.json();

            this.history.replace(`/scan/${scanId}`);
        } catch(error) {
            console.log("Shoot error:", error);
        }
    }

    deleteScan = async scanId => {
        try {
            this.history.replace('/scan');
            await services.scans.remove(scanId);
        } catch(error) {
            console.log("Delete error:", error);
        }
    }

    preview = async () => {
        try {
            await fetch('/api/preview', { method: 'POST' });
        } catch(error) {
            console.log("Preview error:", error);
        }
    }

    render = () =>
        <Router history={this.history}>
            <Col style={ styles.container }>
                <Header/>
                <Row className="fill">
                    <PageList>
                        <PageLink to="/shoot"       title="Shoot!"      icon={assets.shoot}       disabled={!this.state.status||!this.state.status.operational} onClick={this.shoot}   />
                        <PageLink to="/session"     title="Session"     icon={assets.session}     disabled={!this.state.status||!this.state.status.operational}                        />
                        <PageLink to="/calibration" title="Calibration" icon={assets.calibration} disabled={!this.state.status||!this.state.status.operational}                        />
                        <PageLink to="/cameras"     title="Cameras"     icon={assets.cameras}                                                                   onClick={this.preview} />
                        <PageLink to="/settings"    title="Settings"    icon={assets.settings}                                                                                         />
                    </PageList>

                    <Switch>
                        <Route path="/cameras" render={ props =>
                            <SwitchList switches={ this.state.switches }/>
                        }/>

                        <Route render={ props =>
                                <ScanList scans={ this.state.scans }/>
                        }/>
                    </Switch>

                    <Col className="fill scroll">

                        <Route path="/scan/:scanId" render={ props =>
                            <Scan scan={ this.state.scans && this.state.scans.find(scan => scan.id == props.match.params.scanId)}
                                onChange={ scan => services.scans.update( props.match.params.scanId, scan)}
                                onDelete={ () => this.deleteScan( props.match.params.scanId )}
                            />
                        }/>

                        <Route path="/cameras/:switchId" render={ props =>
                            <CameraList cameras={this.state.cameras} switchData={ this.state.switches && this.state.switches[props.match.params.switchId] }/>
                        }/>

                        <Route path="/settings" render={ props =>
                            <Settings settings={this.state.config} onSave={config => services.config.update('0', config)}/>
                        }/>

                    </Col>
                </Row>
            </Col>
        </Router>
}

