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
import Encryption from '../../../shared/payload-encryption';
import queryString from 'query-string';
import swal from 'sweetalert';
import axios from "../../../shared/axios";

const initialValues = {
    confirmPassword: "",
    password: "",
    currentPassword: ""
};



const loginvalidation = Yup.object().shape({
    password: Yup.string().required("Please enter password"),
    confirmPassword: Yup.string().required("Please enter confirm password"),
    currentPassword: Yup.string().required("Please enter current password"),
});



class Reset_Password extends Component {
    state = {
        email: '',
        pass: '',
        rememberMe: 0,
        errMsg: null,
        respArray: [],
        broker_id: "",
        showModal: false,
        errMsg: ""

    }

    componentDidMount() {
    
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
        let encryption = new Encryption();
        let users = sessionStorage.getItem('users') ? JSON.parse(sessionStorage.getItem('users')) : "";
        let user_data = ""
        if(users) {
            user_data = users.user
            user_data = JSON.parse(encryption.decrypt(user_data));  
        }
        if(values.confirmPassword !=values.password) {
            swal("Password and confirm password does not match")
        return false;
        }
        else {
            this.props.loadingStart();
            formData.append('user_id',user_data.master_user_id)
            formData.append('new_password',values.password)
            formData.append('old_password',values.currentPassword)
    
            axios.post('user/change-default-password', formData)
            .then(res=>{          
                if(res.data.error == false) {
                    users.user = encryption.encrypt(JSON.stringify(res.data.data))
                    sessionStorage.setItem("users", JSON.stringify(users))
                    this.props.loadingStop();
                    this.setState({errMsg: ""})
                    swal(res.data.msg)
                    this.props.history.push('/Dashboard')
                    actions.setSubmitting(false)
                }
                else {
                    this.setState({errMsg: res.data.msg})
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
                <div className="d-flex justify-content-center brand lginpg reset-paswd">  
                    <div className="login-box-body">
                        <Formik
                            initialValues={initialValues}
                            validationSchema={loginvalidation}
                            onSubmit={this.handleSubmit}
                        >
                            {({ values, errors, isValid, touched, isSubmitting,setFieldValue, setFieldTouched, }) => {
                                return (
                                    <Form>
                                       
                                        <br />
                                        {this.state.errMsg ? (
                                            <Row className="show-grid">
                                                <Col md={12}>
                                                    <div className="errorMsg loginError">{this.state.errMsg}</div>
                                                </Col>
                                            </Row>
                                        ) : null}
                                        <div className="row formSection">
                                            <label className="col-md-4"><b>Current Password :</b></label>
                                            <div className="col-md-4">

                                                <Field
                                                    name="currentPassword"
                                                    type="text"
                                                    placeholder=""
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value={values.currentPassword}

                                                />
                                                {errors.currentPassword && touched.currentPassword ? (
                                                    <span className="errorMsg">{errors.currentPassword}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="row formSection">
                                            <label className="col-md-4"><b>New Password :</b></label>
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
                                            <label className="col-md-4"><b>Confirm Password :</b></label>
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


