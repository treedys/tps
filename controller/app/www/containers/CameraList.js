import React from 'react';
import { Row, Centered, Circle, Icon } from '../components'
import assets from './assets'

const styles = {
    cell: {
        width: `${100/8}%`
    },
    camera: {
        position: "relative",
        boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px'
    },
    port: {
        position: "absolute",
        bottom: "4px",
        right: "4px",
        margin: "0px",
        color: 'white',
        textShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px'
    },
    led: {
        position: "absolute",
        top: "4px",
        left: "4px",
        borderRadius: "6px",
        width: "12px",
        height: "12px",
        boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px'
    },
    on: {
        background: "green"
    },
    off: {
        background: "red"
    }
};

export const CameraLink = ({ camera, port, ...params }) =>
    <div style={styles.camera}>
        <img src={ camera.online ? `/preview/${camera.id}/0-2.jpg` : assets.noise } style={{width:'100%', height:'auto'}} {...params} />
        <p style={styles.port}>{port} - {camera.index}</p>
        <div style={{ ...styles.led, ...( camera.online ? styles.on : styles.off) }}/>
    </div>

export const SwitchCameraList = ({ switchData, cameras, ...params }) => {

    if(!switchData || !cameras)
        return <h1>Switch is not connected</h1>;

    let rows = [];

    for(let row=0; row<(switchData.ports+7)/8; row++) {

        let cols = [];

        for(let col=0; col<8; col++) {

            const port = row*8+col;

            if(port<switchData.ports) {

                const camera = cameras.find( camera =>
                    camera.port==port && camera.switchAddress==switchData.address)
                        || { online: false, port: port, switchAddress: switchData.address } ;

                cols.push(<td style={styles.cell}><CameraLink camera={camera} port={port} {...params}/></td>);
            }
        }
        rows.push(<tr>{cols}</tr>);
    }

    return <table><tbody>{rows}</tbody></table>;
};

export default SwitchCameraList;
