import React from 'react';
import { Row, Centered, Circle, Icon } from '../components'

const styles = {
    circle: {
        display: "inline-block",
        backgroundColor: "#5A7287",
        color: "#2A303B",
        border: "3px solid white",
        margin: "1em",
        fontSize: '1.5em',
        fontWeight: 'bold',
        boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px',
        textAlign: 'center',
        paddingTop: '1em',
        textDecoration: 'none'
    },
    port: {
        backgroundColor: "#5A72C7",
    },
    camera: {
        backgroundColor: "#5AC772",
    }
};

export const PortLink = ({ switchData, port, ...params }) =>
    <Circle radius={40} className="align-center" style={{ ...styles.circle, ...styles.port }}>
        {port}
    </Circle>

export const CameraLink = ({ camera, ...params }) =>
    <Circle radius={40} className="align-center" style={{ ...styles.circle, ...styles.camera }}>
        { camera.port }
    </Circle>

export const CameraList = ({ switchData, cameras, ...params }) => {
    let result = [];

    if(switchData) {
        for(let port=0; port<switchData.ports; port++) {
            let camera = cameras.find( camera =>
                camera.port==port && camera.interface==switchData.interface);

            if(camera && camera.online)
                result.push(<CameraLink camera={camera} {...params} />);
            else
                result.push(<PortLink switchData={switchData} port={port} {...params} />);
        }
    }

    return <div>{result}</div>;
};

export default CameraList;
