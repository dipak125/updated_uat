import React, { Component } from "react";
import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../../store/actions/loader";
import {
    Row,
    Col,
    Button,
    Modal,
} from "react-bootstrap";

import { Link } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import "./LogIn.css";
import { intermediate_authProcess } from "../../../store/actions/auth";
import BaseComponent from '../../BaseComponent';
import axiosBCintegration from "../../../shared/axiosBCintegration"
import Encryption from '../../../shared/payload-encryption';
import queryString from 'query-string';
import swal from 'sweetalert';
import axios from "../../../shared/axios";

const initialValues = {
    confirmPassword: "",
    password: "",
    OTP: ""
};



const loginvalidation = Yup.object().shape({
    password: Yup.string().required("Please enter password"),
    confirmPassword: Yup.string().required("Please enter confirm password"),
    OTP: Yup.string().required("Please enter OTP"),
});



class Reset_Password extends Component {
    state = {
        email: '',
        pass: '',
        rememberMe: 0,
        errMsg: null,
        respArray: [],
        broker_id: "",
        showModal: false
    }

    componentDidMount() {
        localStorage.clear()
    
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    handleSubmit = (values, actions) => {

        const formData = new FormData();
        if(values.confirmPassword !=values.password) {
            swal("Password and confirm password does not match")
        return false;
        }
        else {
            this.props.loadingStart();
            formData.append('confirmPassword',values.confirmPassword)
            formData.append('password',values.password)
            formData.append('OTP',values.OTP)
    
            axiosBCintegration.post('bc-login', formData)
            .then(res=>{          
                if(res.data.error == false) {
                    let bcLoginData = res.data.data ? res.data.data : []                      
                    this.fetchTokenDetails(bcLoginData.token)
                    actions.setSubmitting(false)
                }
                else {
                    actions.setSubmitting(false)
                    this.props.loadingStop();
                }  
            }).
            catch(err=>{
                this.props.loadingStop();
                actions.setSubmitting(false)
    
            })
        }
    }
    


    render() {
        const { email, pass, rememberMe, broker_id,showModal } = this.state;

        return (
            <BaseComponent>
                <div className="page-wrapper">  
                    <div className="container-fluid">
                        <div className="row">
                            <div className="d-flex justify-content-center brand lginpg">
                                <div className="login-box-body">
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={loginvalidation}
                                        onSubmit={this.handleSubmit}
                                    >
                                        {({ values, errors, isValid, touched, isSubmitting,setFieldValue, setFieldTouched, }) => {
                                            return (
                                                <Form>
                                                    <h3 className="login-box-msg">Reset Password</h3>
                                                    <br />
                                                    {this.state.errMsg ? (
                                                        <Row className="show-grid">
                                                            <Col md={12}>
                                                                <div className="errorMsg loginError">{this.state.errMsg}</div>
                                                            </Col>
                                                        </Row>
                                                    ) : null}

                                                    <div className="row formSection">
                                                        <label className="col-md-4">Password :</label>
                                                        <div className="col-md-4">

                                                            <Field
                                                                name="password"
                                                                type="text"
                                                                placeholder=""
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.password}

                                                            />
                                                            {errors.password && touched.password ? (
                                                                <span className="errorMsg">{errors.password}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <div className="row formSection">
                                                        <label className="col-md-4">Confirm Password :</label>
                                                        <div className="col-md-4">

                                                            <Field
                                                                name="confirmPassword"
                                                                type="text"
                                                                placeholder=""
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.confirmPassword}

                                                            />
                                                            {errors.confirmPassword && touched.confirmPassword ? (
                                                                <span className="errorMsg">{errors.confirmPassword}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <div className="row formSection">
                                                        <label className="col-md-4">OTP :</label>
                                                        <div className="col-md-4">

                                                            <Field
                                                                name="OTP"
                                                                type="text"
                                                                placeholder=""
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.OTP}

                                                            />
                                                            {errors.OTP && touched.OTP ? (
                                                                <span className="errorMsg">{errors.OTP}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <div className="cntrbtn">
                                                        <Button className={`btnPrimary`} type="submit" >
                                                            Submit
                                                        </Button>
                                                    </div>
                                                </Form>
                                            );
                                        }}
                                    </Formik> 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </BaseComponent>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        // loading: state.auth.loading,
        token: state.auth.token
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onFormSubmit: (data, onSuccess, onFailure) => dispatch(intermediate_authProcess(data, onSuccess, onFailure)),
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Reset_Password);


