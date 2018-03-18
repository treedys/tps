import React from 'react';
import { Row, Centered, Circle, Icon } from '../components'
import assets from './assets'

const styles = {
    logo: {
        margin: "1em",
        height: "80px",
        width: "auto"
    },
    language: {
        margin: "1em"
    },
    alerts: {
        margin: "1em",
        height: "30px",
        width: "auto"
    },
    user: {
        circle: {
            border: "3px solid white",
            margin: "1em",
            boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px'
        },
        icon: {
            width: "100%",
            height: "auto"
        }
    },
    container: {
        width: "100%",
        backgroundColor: "#343B4B",
        boxShadow: 'rgba(0, 0, 0, 0.156863) 0px 0px 10px, rgba(0, 0, 0, 0.227451) 0px 0px 10px',
        zIndex: '1'
    }
};

export const Logo     = (props) => <Icon url={ assets.logoTreedys } style={ styles.logo     } {...props}/>
export const Language = (props) => <Icon url={ assets.language    } style={ styles.language } {...props}/>
export const Alerts   = (props) => <Icon url={ assets.cloche      } style={ styles.alerts   } {...props}/>

export const User     = (props) =>
    <Circle radius={40} style={ styles.user.circle }>
        <Icon url={ assets.user } style={ styles.user.icon }/>
    </Circle>

export const Header = (props) =>
    <Row style={ styles.container }>
        <Centered> <Logo/>     </Centered>
        <span className="fill"/>
        <Centered> <Language/> </Centered>
        <Centered> <Alerts/>   </Centered>
        <Centered> <User/>     </Centered>
    </Row>

export default Header;
