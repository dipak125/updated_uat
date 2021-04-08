import React from 'react';
import { Route, Redirect } from 'react-router-dom';

// const blockedPages = ["Registration", "Select-brand"]
const blockedPages = []


export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (     
        sessionStorage.getItem('auth_token') && !blockedPages.includes(props.match.url.split("/")[1])
            ? <Component {...props} />
            : <Redirect to={{ pathname: '/logout', state: { from: props.location } }} />
    )} />
)