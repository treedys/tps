import React from 'react';
import { Row, Col, LabeledTextInput, LabeledCheckbox, LabeledSelect } from '../components'
import { updateState, changeState } from '../utils'

const styles = {
    container: {
        display: "block",
        padding: '1em',
        backgroundColor: "#F2F2F2"
    },
    label: {
        width: "5em",
        fontSize: "1em",
        alignSelf: "baseline",
        marginRight: "1em",
        fontWeight: "bold",
        color: "#5A7287"
    }
};

const drcOptions = [
    { value: 0, name: "off"    },
    { value: 1, name: "low"    },
    { value: 2, name: "medium" },
    { value: 3, name: "high"   }
];

const whiteBalanceOptions = [
    { value: 0, name: "Off"          },
    { value: 1, name: "Auto"         },
    { value: 2, name: "SunLight"     },
    { value: 3, name: "Cloudy"       },
    { value: 4, name: "Shade"        },
    { value: 5, name: "Tungsten"     },
    { value: 6, name: "Fluorescent"  },
    { value: 7, name: "Incandescent" },
    { value: 8, name: "Flash"        },
    { value: 9, name: "Horizon"      }
];

@updateState
@changeState
export default class CameraSettings extends React.Component {

    updateState({settings}) { this.setState( state => ({ ...settings })); }

    render() {
        const {settings, ...props} = this.props;

        return <Col className="scroll fill" style={ styles.container }>
            <table>
                <thead>
                    <tr>
                        <th style={styles.label}/>
                        <th style={styles.label}>Projection</th>
                        <th style={styles.label}>Normal</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={styles.label}>Quality</td>
                        <td><LabeledTextInput value={this.state.projection.quality} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, quality: e.target.value } } ) } /></td>
                        <td><LabeledTextInput value={this.state.normal    .quality} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     quality: e.target.value } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Sharpness</td>
                        <td><LabeledTextInput value={this.state.projection.sharpness} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, sharpness: e.target.value } } ) } /></td>
                        <td><LabeledTextInput value={this.state.normal    .sharpness} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     sharpness: e.target.value } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Contrast</td>
                        <td><LabeledTextInput value={this.state.projection.contrast} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, contrast: e.target.value } } ) } /></td>
                        <td><LabeledTextInput value={this.state.normal    .contrast} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     contrast: e.target.value } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Brightness</td>
                        <td><LabeledTextInput value={this.state.projection.brightness} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, brightness: e.target.value } } ) } /></td>
                        <td><LabeledTextInput value={this.state.normal    .brightness} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     brightness: e.target.value } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Saturation</td>
                        <td><LabeledTextInput value={this.state.projection.saturation} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, saturation: e.target.value } } ) } /></td>
                        <td><LabeledTextInput value={this.state.normal    .saturation} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     saturation: e.target.value } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Shutter speed</td>
                        <td><LabeledTextInput value={this.state.projection.shutterSpeed} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, shutterSpeed: e.target.value } } ) } /></td>
                        <td><LabeledTextInput value={this.state.normal    .shutterSpeed} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     shutterSpeed: e.target.value } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>ISO</td>
                        <td><LabeledTextInput value={this.state.projection.iso} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, iso: e.target.value } } ) } /></td>
                        <td><LabeledTextInput value={this.state.normal    .iso} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     iso: e.target.value } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Red gain</td>
                        <td><LabeledTextInput value={this.state.projection.redGain} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, redGain: e.target.value } } ) } /></td>
                        <td><LabeledTextInput value={this.state.normal    .redGain} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     redGain: e.target.value } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Blue gain</td>
                        <td><LabeledTextInput value={this.state.projection.blueGain} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, blueGain: e.target.value } } ) } /></td>
                        <td><LabeledTextInput value={this.state.normal    .blueGain} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     blueGain: e.target.value } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Dynamic range expansion</td>
                        <td><LabeledSelect options={drcOptions} value={this.state.projection.drc} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, drc: e.target.value } } ) } /></td>
                        <td><LabeledSelect options={drcOptions} value={this.state.normal    .drc} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     drc: e.target.value } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>White balance</td>
                        <td><LabeledSelect options={whiteBalanceOptions} value={this.state.projection.whiteBalance} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, whiteBalance: e.target.value } } ) } /></td>
                        <td><LabeledSelect options={whiteBalanceOptions} value={this.state.normal    .whiteBalance} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     whiteBalance: e.target.value } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Open camera interface</td>
                        <td><LabeledCheckbox checked={this.state.projection.open} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, open: e.target.checked } } ) } /></td>
                        <td><LabeledCheckbox checked={this.state.normal    .open} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     open: e.target.checked } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Close camera interface</td>
                        <td><LabeledCheckbox checked={this.state.projection.close} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, close: e.target.checked } } ) } /></td>
                        <td><LabeledCheckbox checked={this.state.normal    .close} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     close: e.target.checked } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>GPIO 17</td>
                        <td><LabeledCheckbox checked={this.state.projection.gpio17} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, gpio17: e.target.checked } } ) } /></td>
                        <td><LabeledCheckbox checked={this.state.normal    .gpio17} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     gpio17: e.target.checked } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>GPIO 18</td>
                        <td><LabeledCheckbox checked={this.state.projection.gpio18} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, gpio18: e.target.checked } } ) } /></td>
                        <td><LabeledCheckbox checked={this.state.normal    .gpio18} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     gpio18: e.target.checked } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>GPIO 22</td>
                        <td><LabeledCheckbox checked={this.state.projection.gpio22} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, gpio22: e.target.checked } } ) } /></td>
                        <td><LabeledCheckbox checked={this.state.normal    .gpio22} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     gpio22: e.target.checked } } ) } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>GPIO 27</td>
                        <td><LabeledCheckbox checked={this.state.projection.gpio27} onChange={ e => this.changeState({ ...this.state, projection: { ...this.state.projection, gpio27: e.target.checked } } ) } /></td>
                        <td><LabeledCheckbox checked={this.state.normal    .gpio27} onChange={ e => this.changeState({ ...this.state, normal:     { ...this.state.normal,     gpio27: e.target.checked } } ) } /></td>
                    </tr>
                </tbody>
            </table>
        </Col>
    }
}
