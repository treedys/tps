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
    }

    componentDidMount() {
        this.switches = services.switches.watch().find().subscribe( switches => this.changeState({ switches }));
        this.cameras  = services. cameras.watch().find().subscribe(  cameras => this.changeState({ cameras  }));
        this.status   = services.  status.watch().get( 0 ).subscribe( status => this.changeState({ status }));
        this.config   = services.  config.watch().get('0').subscribe( config => this.changeState({ config }));
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
                            <Settings settings={this.state.config} onSave={config => services.config.update('0', config)}/>
                        }/>

                        <Route path="/system" render={ props =>
                            <System status={this.state.status}/>
                        }/>

                    </Col>
                </Row>
            </Col>
        </Router>
}

