import React from 'react';
import { Col, Row, Centered, Circle, Icon, LabeledCheckbox, Spinner } from '../components'
import { Route, NavLink  } from 'react-router-dom'

const styles = {
    link: {
        normal: {
            position: "relative",
            textDecoration: "none",
            textAlign: "center",
            padding: "1em 2em",
            backgroundColor: "#2A303B",
            borderTop: "#414650 2px solid",
            borderBottom: "#16171B 2px solid",
            color: "#5A7287"
        },
        disabled: {
            color: "#5A728700"
        },
        active: {
            backgroundColor: "#191D25",
            borderTop: "#161A21 2px solid",
            borderBottom: "#16171B 2px solid",
            color: "#00B7EC"
        },
        icon: {
            width: "80px",
            height: "80px"
        },
    },
    sublink: {
        normal: {
            position: "relative",
            color: "#5A7287",
            backgroundColor: "#FFFFFF",
            borderBottom: "2px solid #EDEDED",
            textDecoration: "none"
        },
        active: {
            color: "#00B7EC",
            backgroundColor: "#F9F9F9"
        },
        activeBar: {
            width: "100%",
            height: "100%",
            backgroundColor: "#00B7EC"
        },
        circle: {
            border: "3px solid white",
            margin: "0.5em",
            boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px'
        },
        icon: {
            width: "100%",
            height: "auto"
        }
    },
    list: {
        last: {
            backgroundColor: "#2A303B",
            borderTop: "#414650 2px solid"
        }
    }
};

const preventDefault = e => e.preventDefault();

export const PageLink = ({to, title, icon, disabled, onClick, children, style, ...props}) =>
    <NavLink to={to} activeClassName="active"
        style={{ ...styles.link.normal, ...(disabled && styles.link.disabled), ...style }}
        activeStyle={ styles.link.active }
        onClick={ disabled ? preventDefault : onClick }
        {...props}>
        <Col>
            { icon && <Icon url={icon} style={ styles.link.icon }/> }
            <span>{title}</span>
            {children}
        </Col>
    </NavLink>

export const PageSubLink = ({to, spinner, icon, checkbox, selected, onChange, children, style, ...props}) =>
    <NavLink to={to}
        style={{ ...styles.sublink.normal, ...style }}
        activeStyle={ styles.sublink.active }
        {...props}>
        <Row className="fill">
            <div style={{ width: "8px" }}>
                <Route path={to} render={ () => <div style={ styles.sublink.activeBar }/> }/>
            </div>
            { checkbox!==undefined && <Centered><LabeledCheckbox checked={selected} onChange={ e => onChange(e) }/></Centered> }
            { (spinner||icon) && <Circle radius={40} className="align-center" style={ styles.sublink.circle }>{ spinner ? <Spinner/> : <Icon url={icon+`?${Date.now()}`} style={ styles.sublink.icon }/> }</Circle> }
            {children}
        </Row>
    </NavLink>

export const PageList = ({children, ...props}) =>
    <Col className="scroll"
        {...props}>
        {children}
        <div className="fill" style={ styles.list.last }/>
    </Col>

export default PageList;
