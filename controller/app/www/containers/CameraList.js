import React from 'react';
import { DragSource, DropTarget, DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Row, Col } from '../components/';
import assets from './assets'

const styles = {
    cell: {
        width: `${100/8}%`
    },
    camera: {
        position: "relative",
        boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px',
        borderRadius: '6px',
        overflow: 'hidden'
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
        <p style={styles.port}>{port} - { camera.index!=undefined ? camera.index : '--'}</p>
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

                cols.push(<td style={styles.cell} key={port}><CameraLink camera={camera} port={port} {...params}/></td>);
            }
        }
        rows.push(<tr key={row}>{cols}</tr>);
    }

    return <Col className='fill scroll'>
        <table style={{padding:"10px"}}><tbody>{rows}</tbody></table>
    </Col>;
};

const cameraDrag = 'CAMERA';

@DragSource(cameraDrag,
    {
        beginDrag: (props, monitor, component) => props.camera,
        canDrag: (props, monitor) => !!props.camera
    }, (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    })
)
@DropTarget(cameraDrag,
    {
        canDrop: (props, monitor) => true,
        drop: (props, monitor, component) => props.onDrop?.(props.index, monitor.getItem())
    }, (connect, monitor) => ({
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    })
)
export class Camera extends React.Component {
    render() {
        let { index, camera, isDragging, isOver, connectDragSource, connectDropTarget, ...props} = this.props;

        return !isDragging && connectDropTarget(connectDragSource(
            <div style={{ ...styles.camera, ...(isOver && { border:"2px solid black" }) }}>
                <img src={ camera?.online ? `/preview/${camera.mac}/0-2.jpg` : assets.noise } style={{width:'100%', height:'auto'}} />
                <p style={styles.port}>{index}</p>
                { camera && <div style={{ ...styles.led, ...( camera.online ? styles.on : styles.off) }}/> }
            </div>));
    }
}

@DragDropContext(HTML5Backend)
export class CameraList extends React.Component {

    render() {
        let { config, cameras, onConfigChange, ...props} = this.props;

        if( !(config && cameras) )
            return <h1>No data</h1>;

        let rows = [];

        const add = (label, source, start, count, onDrop) => {
            rows.push(<tr key={rows.length}><td colSpan={config.scanner.columns}><h1>{label}</h1></td></tr>);

            const cellStyle = {
                width:`${100/config.scanner.columns}%`,
                minWidth:`${100/config.scanner.columns}%`,
                maxWidth:`${100/config.scanner.columns}%`,
            };

            let index = 0;

            for(let row=0; index<count; row++) {
                let columns = [];

                for(let column=0; column<config.scanner.columns; column++) {
                    const mac = index<count && source[start+index];
                    const camera = cameras.find( camera => camera.mac==mac );

                    if(index<count) {
                        columns.push(<td key={column} style={cellStyle}><Camera camera={camera} index={start+index} onDrop={onDrop}/></td>);
                    } else {
                        columns.push(<td key={column} style={{ ...cellStyle, border:"2px solid #55555522", borderRadius:"5px",  minHeight:"40px"}}/>);
                    }

                    index++;
                }

                rows.push(<tr key={rows.length}>{columns}</tr>);
            }
        }

        const onDropMap = (index, { mac }) => {
            let result = {
                map: config.scanner.map ? config.scanner.map.slice(0) : [],
                new: config.scanner.new ? config.scanner.new.slice(0) : []
            };

            console.log(result);

            if(result.map[index]) {
                result.new.push(result.map[index]);
                result.map[index] = undefined;
            }

            const mapIndex = result.map.indexOf(mac);

            if(mapIndex>=0) {
                result.new.push(result.map[mapIndex]);
                result.map[mapIndex] = undefined;
            }

            const newIndex = result.new.indexOf(mac);

            if(newIndex>=0) {
                result.new.splice(newIndex, 1);
            }

            result.map[index] = mac;

            console.log(result);

            onConfigChange?.({ ...config, scanner: { ...config.scanner, map: result.map, new: result.new } });
        };

        const onDropNew = (index, {mac}) => {
            let result = {
                map: config.scanner.map.slice(0),
                new: config.scanner.new.slice(0)
            };

            const mapIndex = result.map.indexOf(mac);

            if(mapIndex>=0) {
                result.new.push(result.map[mapIndex]);
                result.map[mapIndex] = undefined;
            }

            const newIndex = result.new.indexOf(mac);

            if(newIndex>=0) {
                result.new.splice(newIndex, 1);
            }

            result.new.splice(index, 0, mac);

            onConfigChange?.({ ...config, scanner: { ...config.scanner, map: result.map, new: result.new } });
        };

        if(true)                      add("Cameras",       config.scanner.map,                                          0, config.scanner.rows*config.scanner.columns, onDropMap);
        if(config.scanner.extra)      add("Extra cameras", config.scanner.map, config.scanner.rows*config.scanner.columns, config.scanner.extra                      , onDropMap);
        if(config.scanner.new.length) add("New",           config.scanner.new,                                          0, config.scanner.new.length                 , onDropNew);

        return <Col className='fill scroll'>
            <table style={{padding:"10px"}}><tbody>{rows}</tbody></table>
        </Col>;
    }
}

export default SwitchCameraList;
