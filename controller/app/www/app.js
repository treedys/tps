import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom'

import { Row, Col } from './components/';
import {
    Header,
    PageList, PageLink,
    SwitchList, CameraList
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

        setInterval(async () => this.setStateAsync( { cameras: await camerasService.find() } ), 1000);
/*
        const updateService = (service, updater) => {
            service.on('created', updater);
            service.on('removed', updater);
            service.on('updated', updater);
            service.on('patched', updater);

            service.on('created', (data) => console.log('created:', data));
            service.on('removed', (data) => console.log('removed:', data));
            service.on('updated', (data) => console.log('updated:', data));
            service.on('patched', (data) => console.log('patched:', data));
        };

        const updateSwitches = async () =>
            this.setStateAsync( {
                switches: await switchesService.find()
            } );
        const updateCameras  = async () =>
            this.setStateAsync( {
                cameras: await  camerasService.find()
            } );

        await Promise.all([
            updateSwitches(),
            updateCameras()
        ]);

        updateService(switchesService, updateSwitches);
        updateService( camerasService, updateCameras );
*/
    }

    componentWillUnmount() {
        this.switches.unsubscribe();
        this.cameras .unsubscribe();
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
                    <Route path="/cameras" render={ props => <SwitchList switches={ this.state.switches }/> }/>
                    <Col className="fill scroll">
                        <Route path="/cameras/:switchId" render={ props =>
                            <CameraList cameras={this.state.cameras} switchData={ this.state.switches && this.state.switches[props.match.params.switchId] }/>
                        }/>
                    </Col>
                </Row>
            </Col>
        </Router>
}

