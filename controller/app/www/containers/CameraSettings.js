import React from 'react';
import produce from 'immer'
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

    updateState({settings}) { this.setState( state => ({ settings })); }

    render() {
        const {settings, ...props} = this.props;

        return <Col className="scroll fill" style={ styles.container }>
            <table style={{width:"100%"}}>
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
                        <td><LabeledTextInput value={this.state.settings.projection.quality} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.quality = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .quality} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .quality = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Sharpness</td>
                        <td><LabeledTextInput value={this.state.settings.projection.sharpness} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.sharpness = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .sharpness} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .sharpness = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Contrast</td>
                        <td><LabeledTextInput value={this.state.settings.projection.contrast} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.contrast = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .contrast} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .contrast = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Brightness</td>
                        <td><LabeledTextInput value={this.state.settings.projection.brightness} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.brightness = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .brightness} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .brightness = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Saturation</td>
                        <td><LabeledTextInput value={this.state.settings.projection.saturation} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.saturation = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .saturation} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .saturation = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Shutter speed</td>
                        <td><LabeledTextInput value={this.state.settings.projection.shutterSpeed} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.shutterSpeed = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .shutterSpeed} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .shutterSpeed = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>ISO</td>
                        <td><LabeledTextInput value={this.state.settings.projection.iso} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.iso = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .iso} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .iso = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Red gain</td>
                        <td><LabeledTextInput value={this.state.settings.projection.redGain} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.redGain = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .redGain} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .redGain = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Blue gain</td>
                        <td><LabeledTextInput value={this.state.settings.projection.blueGain} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.blueGain = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .blueGain} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .blueGain = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Dynamic range expansion</td>
                        <td><LabeledSelect options={drcOptions} value={this.state.settings.projection.drc} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.drc = e.target.value; } )); } } /></td>
                        <td><LabeledSelect options={drcOptions} value={this.state.settings.normal    .drc} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .drc = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>White balance</td>
                        <td><LabeledSelect options={whiteBalanceOptions} value={this.state.settings.projection.whiteBalance} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.whiteBalance = e.target.value; } )); } } /></td>
                        <td><LabeledSelect options={whiteBalanceOptions} value={this.state.settings.normal    .whiteBalance} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .whiteBalance = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Open camera interface</td>
                        <td><LabeledCheckbox checked={this.state.settings.projection.open} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.open = e.target.checked; } )); } } /></td>
                        <td><LabeledCheckbox checked={this.state.settings.normal    .open} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .open = e.target.checked; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>Close camera interface</td>
                        <td><LabeledCheckbox checked={this.state.settings.projection.close} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.close = e.target.checked; } )); } } /></td>
                        <td><LabeledCheckbox checked={this.state.settings.normal    .close} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .close = e.target.checked; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>GPIO 17 delay</td>
                        <td><LabeledTextInput value={this.state.settings.projection.gpioDelay17} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.gpioDelay17 = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .gpioDelay17} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .gpioDelay17 = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>GPIO 18 delay</td>
                        <td><LabeledTextInput value={this.state.settings.projection.gpioDelay18} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.gpioDelay18 = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .gpioDelay18} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .gpioDelay18 = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>GPIO 22 delay</td>
                        <td><LabeledTextInput value={this.state.settings.projection.gpioDelay22} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.gpioDelay22 = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .gpioDelay22} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .gpioDelay22 = e.target.value; } )); } } /></td>
                    </tr>
                    <tr>
                        <td style={styles.label}>GPIO 27 delay</td>
                        <td><LabeledTextInput value={this.state.settings.projection.gpioDelay27} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.projection.gpioDelay27 = e.target.value; } )); } } /></td>
                        <td><LabeledTextInput value={this.state.settings.normal    .gpioDelay27} onChange={ e => { e.persist(); this.changeState(produce( state => { state.settings.normal    .gpioDelay27 = e.target.value; } )); } } /></td>
                    </tr>
                </tbody>
            </table>
        </Col>
    }
}
