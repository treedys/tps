import React from 'react';
import moment from 'moment'
import { Row, Col, Spinner, LabeledTextInput, LabeledCheckbox, LabeledSelect } from '../components'
import { updateState, changeState } from '../utils'

const styles = {
    preview: {
        container: {
            textAlign: 'center',
            verticalAlign: 'middle',
            overflow: 'scroll'
        },
        image: {
            maxWidth: '100%'
        },
    },
    information: {
        container: {
            padding: '1em',
            backgroundColor: "#F2F2F2",
            boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px',
            zIndex: '2'
        }
    }
};

@updateState
@changeState
export default class Scan extends React.Component {

    updateState({scan}) { this.setState( state => ({ ...scan })); }

    onImageClick = () => this.setState( state => ({normalProjection: !state.normalProjection}) );

    render() {
        const { scan, ...props } = this.props;

        if( !scan )
            return <Row className="fill">
                <h1>No data</h1>
            </Row>

        return <Row className="fill">
            <div className="fill" style={ styles.preview.container }>
                { scan.done
                    ? <img src={`/scan/${scan.id}/preview-${ this.state.normalProjection ? "1":"2"}.jpg`}
                        style={ styles.preview.image }
                        onClick={ this.onImageClick }/>
                    : <Spinner style={{margin:"20%"}}/>
                }
            </div>
            <Col style={ styles.information.container }>

                <a href={`/scan/${scan.id}.zip`}>Download</a>

                <h3>Scan information:</h3>

                <Col style={{ display: "block" }} className="fill scroll">
                    <LabeledTextInput id="id"     label="ID"      value={this.state.id       } readOnly />
                    <LabeledTextInput id="date"   label="Date"    value={`${moment(this.state.date).toDate()}`} readOnly />

                    <LabeledTextInput id="name"   label="Name"    value={this.state.name     } onChange={ (e) => this.changeState({   name: e.target.value }) } />
                    <LabeledTextInput id="email"  label="Email"   value={this.state.email    } onChange={ (e) => this.changeState({  email: e.target.value }) } />
                    <LabeledSelect    id="gender" label="Gender"  value={this.state.gender   } onChange={ (e) => this.changeState({ gender: e.target.value }) } options={["male","female"]}/>
                    <LabeledTextInput if="age"    label="Age"     value={this.state.age      } onChange={ (e) => this.changeState({    age: e.target.value }) } />

                    <LabeledCheckbox id="SKETCHFAB_ENABLE" label="SKETCHFAB_ENABLE" value={this.state.SKETCHFAB_ENABLE } onChange={ (e) => this.changeState({ SKETCHFAB_ENABLE: e.target.value})} />
                    <LabeledCheckbox id="bodylabprocess"   label="BodyLab process"  value={this.state.bodylabprocess   } onChange={ (e) => this.changeState({   bodylabprocess: e.target.value})} />
                    <LabeledCheckbox id="cleanScan"        label="Clean Scan"       value={this.state.cleanScan        } onChange={ (e) => this.changeState({        cleanScan: e.target.value})} />
                    <LabeledCheckbox id="closeFit"         label="Close Fit"        value={this.state.closeFit         } onChange={ (e) => this.changeState({         closeFit: e.target.value})} />
                    <LabeledCheckbox id="refineHead"       label="Refine Head"      value={this.state.refineHead       } onChange={ (e) => this.changeState({       refineHead: e.target.value})} />
                    <LabeledSelect   id="hands"            label="Hands"            value={this.state.hands            } onChange={ (e) => this.changeState({            hands: e.target.value})} options={["open", "closed"]} />

                </Col>
            </Col>
        </Row>
    }
}
