import React from 'react';
import produce from 'immer'
import { Row, Col, LabeledTextInput, LabeledCheckbox, LabeledSelect, Form } from '../components'
import { changeState } from '../utils'

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

const shotIntervalOptions = [ "normal", "short" ];
const stripLightOptions  = [ "full", "high", "medium", "low" ];

@changeState
export default class CameraSettings extends React.Component {

    state = {}

    static getDerivedStateFromProps = ({settings}, oldState) => oldState.origSettings!==settings ? { settings, origSettings:settings } : null;

    render() {
        const {settings, ...props} = this.props;

        return <Col className="scroll fill" style={ styles.container }>
            <Form.Field><LabeledSelect id="shotInterval" label="Shot interval" options={shotIntervalOptions} value={this.state.settings.shotInterval} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.shotInterval = value; } )); } } /></Form.Field>
            {
                this.state.settings.shotInterval=="short" ? <>
                    <Form.Field><LabeledTextInput label="Quality"                                             value={this.state.settings.projection.quality        } onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.quality         = value; } )); } } /></Form.Field>
                    <Form.Field><LabeledTextInput label="Sharpness"                                           value={this.state.settings.projection.sharpness      } onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.sharpness       = value; } )); } } /></Form.Field>
                    <Form.Field><LabeledTextInput label="Contrast"                                            value={this.state.settings.projection.contrast       } onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.contrast        = value; } )); } } /></Form.Field>
                    <Form.Field><LabeledTextInput label="Brightness"                                          value={this.state.settings.projection.brightness     } onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.brightness      = value; } )); } } /></Form.Field>
                    <Form.Field><LabeledTextInput label="Saturation"                                          value={this.state.settings.projection.saturation     } onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.saturation      = value; } )); } } /></Form.Field>
                    <Form.Field><LabeledTextInput label="Shutter speed"                                       value={this.state.settings.projection.shutterSpeed   } onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.shutterSpeed    = value; } )); } } /></Form.Field>
                    <Form.Field><LabeledTextInput label="ISO"                                                 value={this.state.settings.projection.iso            } onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.iso             = value; } )); } } /></Form.Field>
                    <Form.Field><LabeledSelect    label="DRC (experimental)"    options={drcOptions}          value={this.state.settings.projection.drc            } onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.drc             = value; } )); } } /></Form.Field>
                    <Form.Field><LabeledSelect    label="White balance"         options={whiteBalanceOptions} value={this.state.settings.projection.whiteBalance   } onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.whiteBalance    = value; } )); } } /></Form.Field>
                    <Form.Field><LabeledTextInput label="Projection delay"                                    value={this.state.settings.projection.projectionDelay} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.projectionDelay = value; } )); } } /></Form.Field>
                    <Form.Field><LabeledSelect    label="Strip light intensity" options={stripLightOptions}   value={this.state.settings.projection.stripLight     } onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.stripLight      = value; } )); } } /></Form.Field>
                    </> :
                    <table style={{width:"100%"}}>
                        <thead>
                            <tr>
                                <th style={styles.label}/>
                                <th style={styles.label}>Projection shot</th>
                                <th style={styles.label}>Normal shot</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={styles.label}>Quality</td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.projection.quality} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.quality = value; } )); } } /></Form.Field></td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.normal    .quality} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.normal    .quality = value; } )); } } /></Form.Field></td>
                            </tr>
                            <tr>
                                <td style={styles.label}>Sharpness</td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.projection.sharpness} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.sharpness = value; } )); } } /></Form.Field></td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.normal    .sharpness} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.normal    .sharpness = value; } )); } } /></Form.Field></td>
                            </tr>
                            <tr>
                                <td style={styles.label}>Contrast</td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.projection.contrast} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.contrast = value; } )); } } /></Form.Field></td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.normal    .contrast} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.normal    .contrast = value; } )); } } /></Form.Field></td>
                            </tr>
                            <tr>
                                <td style={styles.label}>Brightness</td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.projection.brightness} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.brightness = value; } )); } } /></Form.Field></td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.normal    .brightness} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.normal    .brightness = value; } )); } } /></Form.Field></td>
                            </tr>
                            <tr>
                                <td style={styles.label}>Saturation</td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.projection.saturation} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.saturation = value; } )); } } /></Form.Field></td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.normal    .saturation} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.normal    .saturation = value; } )); } } /></Form.Field></td>
                            </tr>
                            <tr>
                                <td style={styles.label}>Shutter speed</td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.projection.shutterSpeed} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.shutterSpeed = value; } )); } } /></Form.Field></td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.normal    .shutterSpeed} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.normal    .shutterSpeed = value; } )); } } /></Form.Field></td>
                            </tr>
                            <tr>
                                <td style={styles.label}>ISO</td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.projection.iso} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.iso = value; } )); } } /></Form.Field></td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.normal    .iso} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.normal    .iso = value; } )); } } /></Form.Field></td>
                            </tr>
                            <tr>
                                <td style={styles.label}>DRC (experimental)</td>
                                <td><Form.Field><LabeledSelect options={drcOptions} value={this.state.settings.projection.drc} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.drc = value; } )); } } /></Form.Field></td>
                                <td><Form.Field><LabeledSelect options={drcOptions} value={this.state.settings.normal    .drc} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.normal    .drc = value; } )); } } /></Form.Field></td>
                            </tr>
                            <tr>
                                <td style={styles.label}>White balance</td>
                                <td><Form.Field><LabeledSelect options={whiteBalanceOptions} value={this.state.settings.projection.whiteBalance} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.whiteBalance = value; } )); } } /></Form.Field></td>
                                <td><Form.Field><LabeledSelect options={whiteBalanceOptions} value={this.state.settings.normal    .whiteBalance} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.normal    .whiteBalance = value; } )); } } /></Form.Field></td>
                            </tr>
                            <tr>
                                <td style={styles.label}>Projection delay</td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.projection.projectionDelay} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.projectionDelay = value; } )); } } /></Form.Field></td>
                                <td><Form.Field><LabeledTextInput value={this.state.settings.normal    .projectionDelay} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.normal    .projectionDelay = value; } )); } } /></Form.Field></td>
                            </tr>
                            <tr>
                                <td style={styles.label}>Strip light intensity</td>
                                <td><Form.Field><LabeledSelect options={stripLightOptions} value={this.state.settings.projection.stripLight} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.projection.stripLight = value; } )); } } /></Form.Field></td>
                                <td><Form.Field><LabeledSelect options={stripLightOptions} value={this.state.settings.normal    .stripLight} onChange={ ({target:{value}}) => { this.changeState(produce( state => { state.settings.normal    .stripLight = value; } )); } } /></Form.Field></td>
                            </tr>
                        </tbody>
                    </table>
            }
        </Col>
    }
}
