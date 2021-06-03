import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Encryption from './payload-encryption';

// const blockedPages = ["Registration", "Select-brand"]
const blockedPages = []

// export const PrivateRoute = ({ component: Component, ...rest }) => (
//     <Route {...rest} render={props => (     
//         sessionStorage.getItem('auth_token') && !blockedPages.includes(props.match.url.split("/")[1])
//             ? <Component {...props} />
//             : <Redirect to={{ pathname: '/logout', state: { from: props.location } }} />
//     )} />
// )


export const PrivateRoute = ({ component: Component, ...rest }) => {
    let user_data = sessionStorage.getItem('users') ? JSON.parse(sessionStorage.getItem('users')) : "";
        if(user_data) {
            let encryption = new Encryption();
            user_data = user_data.user
            user_data = JSON.parse(encryption.decrypt(user_data));  
        }
        return(
            <Route {...rest} render={props => (     
                sessionStorage.getItem('auth_token') && !blockedPages.includes(props.match.url.split("/")[1]) ?
                 user_data && user_data.manually_password_changed == "0" ? <Component {...props} /> : <Redirect to={{ pathname: '/Reset_Password', state: { from: props.location } }} />
                    : <Redirect to={{ pathname: '/logout', state: { from: props.location } }} />
            )} />)
}