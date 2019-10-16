import React from 'react';
import { NavLink  } from 'react-router-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { Row, Col } from '../components/';
import assets from './assets'

const styles = {
    cell: {
        width: `${100/8}%`
    },
    camera: {
        width: "100%",
        height: "auto",
        position: "relative",
        boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px',
        overflow: 'auto'
    },
    switchIndex: {
        position: "absolute",
        top: "4px",
        right: "4px",
        margin: "0px",
        color: 'white',
        textShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px'
    },
    portIndex: {
        position: "absolute",
        bottom: "4px",
        right: "4px",
        margin: "0px",
        color: 'white',
        textShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px'
    },
    port: {
        position: "absolute",
        bottom: "4px",
        left: "4px",
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

export const CameraLink = ({ camera, switchData, index, style, className, ...params }) =>
    <div className={ className } style={{ ...styles.camera, ...style }}>
        <NavLink to={`/cameras/${camera?.id}`}>
            <img src={ camera?.online ? `/preview/${camera.id}/0-2.jpg?${Math.floor(Date.now()/2000)}` : assets.noise } style={{width:'100%', height:'auto', verticalAlign:'top'}} {...params} />
        </NavLink>
        <p style={styles.port}>{index||camera?.index||"--"}</p>
        <div style={{ ...styles.led, ...( camera?.online ? styles.on : styles.off) }}/>
        <div style={ styles.switchIndex }>{camera?.switchName||"--"}</div>
        <div style={ styles.portIndex }>{camera?.port||"--"}</div>
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

                cols.push(<td style={styles.cell} key={port}><CameraLink camera={camera} switchData={switchData} {...params}/></td>);
            }
        }
        rows.push(<tr key={row}>{cols}</tr>);
    }

    return <Col className='fill scroll'>
        <table style={{padding:"10px"}}><tbody>{rows}</tbody></table>
    </Col>;
};

const cameraDrag = 'CAMERA';

export const Camera = ({ ...params }) => {
    const [{isDragging}, connectDragSource] = useDrag({
        item: {
            type: cameraDrag,
            mac: params.camera?.mac
        },
        canDrag: monitor => !!params.camera,
        collect: monitor => ({
            isDragging: monitor.isDragging()
        })
    });

    const [{isOver}, connectDropTarget] = useDrop({
        accept: cameraDrag,
        drop: (item, monitor) => params.onDrop?.(params.index, item.mac),
	collect: monitor => ({
            isOver: monitor.isOver()
        })
    });

    return !isDragging && connectDropTarget(connectDragSource(
        <div>
            <CameraLink
                style={{ ...(isOver && { border:"2px solid black" }) }}
                {...params}
            />
        </div>));
};

export const CameraList = ({ config, cameras, switches, onConfigChange, ...props}) => {
    if( !(config && cameras) )
        return <h1>No data</h1>;

    let rows = [];

    const add = (label, source, start, count, onDrop) => {
        rows.push(<tr key={rows.length}><td colSpan={config.columns}><h1>{label}</h1></td></tr>);

        const cellStyle = {
            width   :`${100/config.columns}%`,
            minWidth:`${100/config.columns}%`,
            maxWidth:`${100/config.columns}%`
        };

        let index = 0;

        for(let row=0; index<count; row++) {
            let columns = [];

            for(let column=0; column<config.columns; column++) {
                const mac = index<count && source[start+index];
                const camera = cameras.find( camera => camera.mac==mac );
                const switchData = switches?.find( switchData => switchData.address == camera?.switchAddress );

                if(index<count) {
                    columns.push(<td key={column} style={cellStyle}><Camera camera={camera} switchData={switchData} index={start+index} onDrop={onDrop}/></td>);
                } else {
                    columns.push(<td key={column} style={{ ...cellStyle, border:"2px solid #55555522", borderRadius:"5px",  minHeight:"40px"}}/>);
                }

                index++;
            }

            rows.push(<tr key={rows.length}>{columns}</tr>);
        }
    }

    const onDropMap = (index, mac) => {
        let result = {
            map: config.map ? config.map.slice(0) : [],
            new: config.new ? config.new.slice(0) : []
        };

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

        onConfigChange?.({ ...config, map: result.map, new: result.new });
    };

    const onDropNew = (index, mac) => {
        let result = {
            map: config.map.slice(0),
            new: config.new.slice(0)
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

        onConfigChange?.({ ...config, map: result.map, new: result.new });
    };

    if(true)              add("Cameras",       config.map,                          0, config.rows*config.columns, onDropMap);
    if(config.extra)      add("Extra cameras", config.map, config.rows*config.columns, config.extra              , onDropMap);
    if(config.new.length) add("New",           config.new,                          0, config.new.length         , onDropNew);

    return <Col className='fill scroll'>
        <DndProvider backend={HTML5Backend}>
            <table style={{padding:"10px"}}><tbody>{rows}</tbody></table>
        </DndProvider>
    </Col>;
}

export default SwitchCameraList;
