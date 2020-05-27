import React, { Component } from 'react';
import { Route, Switch, HashRouter,Redirect, withRouter } from "react-router-dom";
import { Formik, Field, Form } from "formik";

import { connect } from "react-redux";
import Loadable from 'react-loadable';
import { authValidate } from "../../store/actions/auth";
import { PrivateRoute } from "../../shared/private-route";
import Loader from "react-loader-spinner";

import LogIn from "../common/login/LogIn";
// import Motor from '../motor/Motor';
import SelectBrand from '../SelectBrand/SelectBrand';
// import Products from '../products/Products';
import Health from '../health/InformationYourself';
import MedicalDetails from '../health/MedicalDetails';

const componentLoader = () => {
    return (
        <div style={{ height: "540px" }}>
            <div className="loading">
                <Loader type="Oval" color="#000000" height="50" width="50" />
            </div>
        </div>
    )
}
const loadingContent = componentLoader();

const Products = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../products/Products.jsx"),
    loading: () => loadingContent
});


class Routes extends Component {
    render() {
        this.props.onAuthPersist();
        return (
            <>
                <HashRouter>
                    <Switch>
                        <Route exact path="/login" component={LogIn} />                        
                        <PrivateRoute exact path="/Products" component={Products} />
                        <PrivateRoute exact path="/Health/:productId" component={Health} />
                        <PrivateRoute exact path="/MedicalDetails/:productId/:familyInfo" component={MedicalDetails} />
                        <PrivateRoute exact path="/Select-brand" component={SelectBrand} />
                        <Redirect from="/" to="/Products" />
                    </Switch>
                </HashRouter>
            </>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.auth.token
    }
  
  }
  
  const mapDispatchToProps = dispatch => {
    return {
        onAuthPersist: () => dispatch(authValidate())
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Routes);




