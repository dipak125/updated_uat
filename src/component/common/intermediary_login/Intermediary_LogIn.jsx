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
import axiosExternal from "../../../shared/axiosExternal";

const initialValues = {
    userId: "",
    password: "",
    broker_id: ""
};

const passResetInitialValues = {
    email: ""
}

const loginvalidation = Yup.object().shape({
    userId: Yup.string().email("User Id must be a valid email").required('Please enter email id').min(8, function() {
        return "Minimum 8 characters"
    })
    .max(75, function() {
        return "Maximum 75 characters"
    }).matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9])*@\w+([-]?\w+)*(\.\w{2,3})+$/,'Invalid email id'),

    password: Yup.string().required("Please enter password"),
    broker_id: Yup.string().required("Please select broker"),
});

const passResetValidation = Yup.object().shape({
    email: Yup.string().email("Email Id must be a valid email").required('Please enter email id')
        .min(8, function() {
        return "Minimum 8 characters"
        })
        .max(75, function() {
            return "Maximum 75 characters"
        })
        .matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9])*@\w+([-]?\w+)*(\.\w{2,3})+$/,'Invalid email id'),
    });



class Intermediary_LogIn extends Component {
    state = {
        email: '',
        pass: '',
        rememberMe: 0,
        errMsg: null,
        respArray: [],
        broker_id: "",
        showModal: false,
        message: null
    }

    fetchPhrases = () => {
        this.props.loadingStart();
        axios
          .post(`maintenance/fetchPhrases`, {})
          .then(res => {
            let phraseData = (res.data.phrase ? res.data.phrase : []);
            localStorage.setItem("phrases", JSON.stringify(phraseData) )
            this.props.loadingStop();
            // return true
          })
          .catch(err => {
            this.setState({
              phrases: []
            });
            this.props.loadingStop();
            return false
          });
      }

    componentDidMount() {
        localStorage.clear()
        sessionStorage.removeItem('logo')
        let bodyClass = [];
        bodyClass.length && document.body.classList.remove(...bodyClass);
        document.body.classList.add("loginBody");

    }

    handleSubmit = (values, actions) => {
        this.props.loadingStart()
        axiosExternal
          .get(`/core/user/forgot-password/${values.email}`)
          .then(res => {
            if(res.data.error == false) {
                actions.setSubmitting(false);
                this.props.loadingStop();
                this.setState({showModal: false, message: res.data.msg, errMsg: null})
            }else {
                actions.setSubmitting(false);
                this.props.loadingStop();
                this.setState({ errMsg: res.data.msg, message: null})
            }
            
          })
          .catch(err => {
            this.setState({
                errMsg: err.data.msg,
                message: null,
                showModal: false
            });
            this.props.loadingStop();
            actions.setSubmitting(false);
          });
    }

    callFetchPhrase = async () => {
        const result = await this.fetchPhrases();
    }


    handle_AutoSubmit = (value, actions) => {
        // console.log('values', value);
        return new Promise(resolve => {
            setTimeout(() => {
                let values = {}
                this.props.loadingStart();
                values.rememberMe = this.state.rememberMe;
                values.emailAddress= value.userId;
                values.password= value.password;
                values.bc_id= sessionStorage.getItem('csc_id')
                values.user_type= sessionStorage.getItem('type')
                this.props.onFormSubmit(values,
                    () => {
                        this.props.loadingStop();
                        if(this.callFetchPhrase()){
                            setTimeout(
                                function() {
                                    this.props.history.push('/Dashboard')
                                }
                                .bind(this),
                                300
                            );
                        }
                    },
                    (err) => {
                        this.props.loadingStop();
                        if (err.data.error) {
                            this.setState({ errMsg: err.data.error });
                        } else {
                            // console.log(err.data);
                        }
                    }
                );
                actions.setSubmitting(false);
            }
            , 20)
        })
    }

    resetPassword =() => {
        this.setState({showModal:true})
    }

    handleModalClose=()=> {
        this.setState({showModal:false})
    }


    render() {
        const { email, pass, rememberMe, broker_id,showModal } = this.state;
        const newInitialValues = Object.assign(initialValues, {
            userId: email ? email : '',
            password: pass ? pass : '',
            broker_id: broker_id ? broker_id : "2"

        });

        return (
            <BaseComponent>
                <div className="d-flex justify-content-center brand lginpg">
                    <div className="login-box-body">
                        <Formik
                            initialValues={newInitialValues}
                            validationSchema={loginvalidation}
                            onSubmit={this.handle_AutoSubmit}
                        >
                            {({ values, errors, isValid, touched, isSubmitting,setFieldValue, setFieldTouched, }) => {
                                return (
                                    <Form>
                                         {/* <h3 className="login-box-msg">Intermediate Login</h3> */}
                                        <br />
                                        {this.state.errMsg ? (
                                            <Row className="show-grid">
                                                <Col md={12}>
                                                    <div className="errorMsg loginError">{this.state.errMsg}</div>
                                                </Col>
                                            </Row>
                                        ) : null}
                                         {this.state.message ? (
                                            <Row className="show-grid">
                                                <Col md={12}>
                                                    <div className="successMsg">{this.state.message}</div>
                                                </Col>
                                            </Row>
                                        ) : null}

                                        <Row className="show-grid">
                                            <Col md={12}>
                                                <div className="form-group">
                                                    <label>User ID</label>
                                                    <Field
                                                        name="userId"
                                                        type="text"
                                                        className={`form-control`}
                                                        placeholder="User Id"
                                                        autoComplete="off"
                                                        value={values.userId}
                                                    />
                                                    {errors.userId && touched.userId ? (
                                                        <span className="errorMsg">{errors.userId}</span>
                                                    ) : null}
                                                </div>
                                            </Col>
                                            <Col md={12}>
                                                <div className="form-group">
                                                    <label>Password</label>
                                                    <Field
                                                        name="password"
                                                        type="password"
                                                        className={`form-control`}
                                                        autoComplete="off"
                                                        placeholder="Password"
                                                        value={values.password}
                                                    />
                                                    {errors.password && touched.password ? (
                                                        <span className="errorMsg">{errors.password}</span>
                                                    ) : null}
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row>
                                           <Col>&nbsp;</Col>
                                        </Row>

                                        <Row className="show-grid dropinput">
                                            <Col xs={8}>
                                            <Link to="#" onClick = {this.resetPassword.bind(this)} > Forgot Password </Link>
                                            </Col>
                                            <Col xs={4}>
                                                <Button
                                                    type="submit"
                                                    className={`btn btn-default btn-md ${
                                                        isSubmitting ? "btn-disable" : "btn-custom-red"
                                                        } pull-right`}
                                                    disabled={isSubmitting ? true : false}
                                                >
                                                    {isSubmitting ? "Signing In..." : "Sign In"}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                );
                            }}
                        </Formik>

                    </div>

                    <Modal show={showModal} onHide={this.handleModalClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Forgot Password</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <Formik
                            initialValues={passResetInitialValues}
                            validationSchema={passResetValidation}
                            onSubmit={this.handleSubmit}
                        >
                            {({ values, errors, isValid, touched, isSubmitting,setFieldValue, setFieldTouched, }) => {
                                return (
                                    <Form>
                                        <Row className="show-grid">
                                            <Col md={12}>
                                                <div className="form-group">
                                                    <label>Email ID</label>
                                                    <Field
                                                        name="email"
                                                        type="text"
                                                        className={`form-control`}
                                                        placeholder="Enter your Email ID"
                                                        autoComplete="off"
                                                        value={values.email}
                                                    />
                                                    {errors.email && touched.email ? (
                                                        <span className="errorMsg">{errors.email}</span>
                                                    ) : null}
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row className="show-grid dropinput">
                                            <Col md={12}>
                                                <Button
                                                    type="submit"
                                                    className={`btn btn-default btn-md ${
                                                        isSubmitting ? "btn-disable" : "btn-custom-red"
                                                        } pull-right`}
                                                    disabled={isSubmitting ? true : false}
                                                >
                                                    {isSubmitting ? "Sending..." : "Send Email Link"}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                )}}
                        </Formik>
                        </Modal.Body>
                        <Modal.Footer>
                        </Modal.Footer>
                    </Modal>

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

export default connect(mapStateToProps, mapDispatchToProps)(Intermediary_LogIn);
