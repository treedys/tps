import React from 'react';
import { Col, Icon } from '../components'
import { NavLink  } from 'react-router-dom'

const styles = {
    link: {
        normal: {
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
    list: {
        last: {
            backgroundColor: "#2A303B",
            borderTop: "#414650 2px solid"
        }
    }
};

const preventDefault = e => e.preventDefault();

export const PageLink = ({to, title, icon, disabled, onClick, ...props}) =>
    <NavLink to={to} activeClassName="active"
        style={{ ...styles.link.normal, ...(disabled && styles.link.disabled) }}
        activeStyle={ styles.link.active }
        onClick={ disabled ? preventDefault : onClick }
        {...props}>
        <Col>
            { icon && <Icon url={icon} style={ styles.link.icon }/> }
            <span>{title}</span>
        </Col>
    </NavLink>

export const PageList = ({children, ...props}) =>
    <Col className="scroll">
        {children}
        <div className="fill" style={ styles.list.last }/>
    </Col>

export default PageList;
