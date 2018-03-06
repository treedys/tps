import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom'

import { Row, Col, Button } from './components/';
import {
    Header,
    PageList, PageLink,
    SwitchList, CameraList,
    System, Settings
} from './containers/';

import assets from './assets/';

import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import rx from 'feathers-reactive';

const styles = {
    container: {
        width: "100%",
        height: "100%"
    }
}

let socketio = io();

socketio.on("reconnect_failed", () => socketio.socket.reconnect());

const feathersApp = feathers()
    .configure(feathers.socketio(socketio))
    .configure(rx({idField: "id"}));

const switchesService = feathersApp.service('/api/switches');
const  camerasService = feathersApp.service('/api/cameras' );
const   statusService = feathersApp.service('/api/status'  );
const   configService = feathersApp.service('/api/config'  );

export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    setStateAsync(newState) {
        return new Promise( resolve =>
            this.setState(
                oldState => ({ ...oldState, ...newState }),
                resolve));
    }

    componentDidMount() {
        this.switches = switchesService.watch().find().subscribe( switches => this.setStateAsync({ switches }));
        this.cameras  =  camerasService.watch().find().subscribe(  cameras => this.setStateAsync({ cameras  }));
        this.status   =   statusService.watch().get( 0 ).subscribe( status => this.setStateAsync({ status }));
        this.config   =   configService.watch().get('0').subscribe( config => this.setStateAsync({ config }));
    }

    componentWillUnmount() {
        this.switches.unsubscribe();
        this.cameras .unsubscribe();
        this.status  .unsubscribe();
        this.config  .unsubscribe();
    }

    shoot = () => { fetch('/api/shoot', { method: 'POST' }); }

    render = () =>
        <Router>
            <Col style={ styles.container }>
                <Header/>
                <Row className="fill">
                    <PageList>
                        <PageLink to="/shoot"       title="Shoot!"      icon={assets.shoot} onClick={this.shoot} />
                        <PageLink to="/session"     title="Session"     icon={assets.session}/>
                        <PageLink to="/calibration" title="Calibration" icon={assets.calibration}/>
                        <PageLink to="/cameras"     title="Cameras"     icon={assets.cameras}/>
                        <PageLink to="/settings"    title="Settings"    icon={assets.settings}/>
                    </PageList>

                    <Route path="/cameras" render={ props =>
                        <SwitchList switches={ this.state.switches }/>
                    }/>

                    <Col className="fill scroll">

                        <Route path="/cameras/:switchId" render={ props =>
                            <CameraList cameras={this.state.cameras} switchData={ this.state.switches && this.state.switches[props.match.params.switchId] }/>
                        }/>

                        <Route path="/settings" render={ props =>
                            <Settings settings={this.state.config} onSave={config => configService.update('0', config)}/>
                        }/>

                        <Route path="/system" render={ props =>
                            <System status={this.state.status}/>
                        }/>

                    </Col>
                </Row>
            </Col>
        </Router>
}

