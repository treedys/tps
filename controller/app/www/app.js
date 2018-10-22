import React from 'react';
import { createHashHistory as createHistory } from 'history';
import { Router, Route, Switch } from 'react-router-dom';
import Badge from 'react-notification-badge';
import { Effect as BadgeEffect } from 'react-notification-badge';

import dataminrUtils from 'dataminr-react-components/dist/utils/Utils';

import { Row, Col, Button } from './components/';
import {
    Header,
    PageList, PageLink,
    Scan, ScanList,
    Calibration, CalibrationList,
    SwitchList, SwitchCameraList, CameraList,
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

/* bugfixing various synchronisation issues */
const postpone = async () =>
    new Promise( (resolve, reject) =>
        setTimeout(resolve, 0)
    );

import componentCss from 'dataminr-react-components/dist/react-components.css';

const confirmDialog = async (title, text) => {
    const result = await new Promise( (resolve,reject) =>
        dataminrUtils.confirmDialog(title, text,
            () => { resolve(true);  return true; } ,
            () => { resolve(false); return true; } ));

    /* FIXME: await two iterations to solve nasty confirmDialog bug */
    await postpone();
    await postpone();

    return result;
}

@changeState
export default class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            scansSelection: {},
            calibrationsSelection: {}
        };
        this.history = createHistory();
    }

    componentDidMount() {
        this.switches     = services.    switches.watch().find()  .subscribe(     switches => this.changeState({ switches     }));
        this.cameras      = services.     cameras.watch().find()  .subscribe(      cameras => this.changeState({ cameras      }));
        this.scans        = services.       scans.watch().find()  .subscribe(        scans => this.changeState({ scans        }));
        this.calibrations = services.calibrations.watch().find()  .subscribe( calibrations => this.changeState({ calibrations }));
        this.status       = services.      status.watch().get( 0 ).subscribe(       status => this.changeState({ status       }));
        this.config       = services.      config.watch().get('0').subscribe(       config => this.changeState({ config       }));
    }

    componentWillUnmount() {
        this.switches    .unsubscribe();
        this.cameras     .unsubscribe();
        this.scans       .unsubscribe();
        this.calibrations.unsubscribe();
        this.status      .unsubscribe();
        this.config      .unsubscribe();
    }

    shootScan = async () => {
        try {
            const response = await fetch('/api/shoot/scan', { method: 'POST' });
            const { id:scanId } = await response.json();

            this.history.replace(`/scan/${scanId}`);
        } catch(error) {
            console.log("Shoot scan error:", error);
        }
    }

    shootCalibration = async () => {
        try {
            const response = await fetch('/api/shoot/calibration', { method: 'POST' });
            const { id:calibrationId } = await response.json();

            this.history.replace(`/calibration/${calibrationId}`);
        } catch(error) {
            console.log("Shoot calibration error:", error);
        }
    }

    shootPreview = async () => {
        try {
            await fetch('/api/shoot/preview', { method: 'POST' });
        } catch(error) {
            console.log("Shoot preview error:", error);
        }
    }

    onScanSelectedChange = async (scanId, checked) => {

        /* FIXME: await one iteration to solve nasty react checkbox bug */
        await postpone();

        this.setState( state => ({
            ...state,
            scansSelection: {
                ...state.scansSelection,
                [scanId]: checked
            }
        }));
    }

    onScanSelectAll = () => this.setState( state => ({
        ...state,
        scansSelection: {
            ...state.scans.reduce((selection, scan)=>({ ...selection, [scan.id]:true }), {})
        }
    }));

    acceptScan = async scanId => {
        try {
            await fetch(`/scan/${scanId}/download`, { method: 'POST' });
        } catch(error) {
            console.log("Scan accept error:", error);
        }
    }

    rejectScan = async scanId => {
        try {
            await services.scans.remove(scanId);
            this.onScanSelectedChange(scanId, false);
        } catch(error) {
            console.log("Scan reject error:", error);
        }
    }

    deleteScan = async scanId => {

        let list = Object.entries(this.state.scansSelection).filter( entry => !!entry[1] ).map( entry => entry[0] );
        list = list.length ? list : [scanId];

        try {
            for(let id of list) {
                const scan = this.state.scans.find( s => s.id==id );

                /* check if someone else already delete this scan */
                if(!scan) {
                    this.onScanSelectedChange(id, false);
                    continue;
                }

                if(!scan.zipDownloaded && !await confirmDialog('Confirm delete',
                    `Scan ${scan.id} is never downloaded, are you sure that want to delete it?`))
                    continue;

                if(id==scanId)
                    this.history.replace('/scan');

                await services.scans.remove(id);
                this.onScanSelectedChange(id, false);
            }

        } catch(error) {
            console.log("Delete scan error:", error);
        }
    }

    onCalibrationSelectedChange = async (calibrationId, checked) => {

        /* FIXME: await one iteration to solve nasty react checkbox bug */
        await postpone();

        this.setState( state => ({
            ...state,
            calibrationsSelection: {
                ...state.calibrationsSelection,
                [calibrationId]: checked
            }
        }));
    }

    onCalibrationSelectAll = () => this.setState( state => ({
        ...state,
        calibrationsSelection: {
            ...state.calibrations.reduce((selection, calibration)=>({ ...selection, [calibration.id]:true }), {})
        }
    }));

    deleteCalibration = async calibrationId  => {

        let list = Object.entries(this.state.calibrationsSelection).filter( entry => !!entry[1] ).map( entry => entry[0] );
        list = list.length ? list : [calibrationId];

        try {
            for(let id of list) {
                const calibration = this.state.calibrations.find( c => c.id==id );

                if(!calibration) {
                    this.onCalibrationSelectedChange(id, false);
                    continue;
                }

                if(!calibration.zipDownloaded && !await confirmDialog('Confirm delete',
                    `Calibration ${calibration.id} is never downloaded, are you sure that want to delete it?`))
                    continue;

                if(id==calibrationId)
                    this.history.replace('/calibration');

                await services.calibrations.remove(id);
                this.onCalibrationSelectedChange(id, false);
            }
        } catch(error) {
            console.log("Delete calibration error:", error);
        }
    }

    offlineCameras = () => this.state?.config?.scanner?.map?.filter( mac => mac && !(this.state?.cameras?.find( camera => camera.mac==mac && camera.online )))?.length || 0;
    cameraProblems = () => this.state?.config?.scanner?.new.length+this.offlineCameras();
    scannerBusy = () =>
            !this.state?.status?.operational ||
            this.state?.status?.shooting     ||
            this.state?.status?.downloading;

    render = () =>
        <Router history={this.history}>
            <Col style={ styles.container }>
                <Header/>
                <Row className="fill">
                    <PageList>
                        <PageLink to="/scan"        title="Scan"        icon={assets.shoot}       />
                        <PageLink to="/calibration" title="Calibration" icon={assets.calibration} />
                        <PageLink to="/cameras"     title="Cameras"     icon={assets.cameras}      >
                            <Badge count={this.cameraProblems()} effect={BadgeEffect.SCALE} containerStyle={{position:"absolute", top:"1em", right:"1em"}}/>
                        </PageLink>
                        <PageLink to="/settings"    title="Settings"    icon={assets.settings}    />
                    </PageList>

                    <Switch>
                        <Route path="/scan" render={ props =>
                            <ScanList scans={ this.state.scans }
                                selected={ this.state.scansSelection }
                                onShoot={ this.shootScan }
                                onSelectedChange={ this.onScanSelectedChange }
                                onSelectAll={ this.onScanSelectAll }
                                operational={!this.scannerBusy()} />
                        }/>

                        <Route path="/calibration" render={ props =>
                            <CalibrationList calibrations={ this.state.calibrations }
                                selected={ this.state.calibrationsSelection }
                                onShoot={ this.shootCalibration }
                                onSelectedChange={ this.onCalibrationSelectedChange }
                                onSelectAll={ this.onCalibrationSelectAll }
                                operational={!this.scannerBusy()} />
                        }/>

                        <Route path="/cameras" render={ props =>
                            <SwitchList switches={ this.state.switches } onShoot={this.shootPreview} operational={this.state.status?.operational} />
                        }/>
                    </Switch>

                    <Switch>

                        <Route path="/scan/:scanId" render={ props =>
                            <Scan scan={ this.state.scans?.find(scan => scan.id == props.match.params.scanId)}
                                status={ this.state.status }
                                fields={ this.state.config?.scanFields }
                                onAccept={   scan   => this.acceptScan( scan.id )}
                                onReject={   scan   => this.rejectScan( scan.id )}
                                onChange={ ({scan}) => services.scans.update( scan.id, scan)}
                                onDelete={   scan   => this.deleteScan( scan.id )}
                            />
                        }/>

                        <Route path="/calibration/:calibrationId" render={ props =>
                            <Calibration calibration={ this.state.calibrations?.find(calibration => calibration.id == props.match.params.calibrationId)}
                                onChange={ ({calibration}) => services.calibrations.update( props.match.params.calibrationId, calibration)}
                                onDelete={ () => this.deleteCalibration( props.match.params.calibrationId )}
                            />
                        }/>

                        <Route path="/cameras/map" render={ props =>
                                <CameraList cameras={this.state.cameras} switches={ this.state.switches } config={this.state.config?.scanner} onConfigChange={ config => services.config.patch('0', { scanner: config }) }/>
                        }/>

                        <Route path="/cameras/:switchId" render={ props =>
                            <SwitchCameraList cameras={this.state.cameras} switchData={ this.state.switches?.[props.match.params.switchId] }/>
                        }/>

                        <Route path="/settings" render={ props =>
                            <Settings settings={this.state.config} onChange={ ({settings}) => services.config.update('0', settings) }/>
                        }/>

                    </Switch>
                </Row>
            </Col>
        </Router>
}

