import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";


const initialValues = {
    fname: "",
    lname: "",
    gender: "",
    dob: "",
    relation: ""
}

const validateNominee = Yup.object().shape({
    lname: Yup.string().required(function() {
        return "Please enter a last name"
    }),
    fname: Yup.string(function() {
        return "Please enter name"
    }).required(function() {
        return "Please enter name"
    })
        .min(3, function() {
            return "Name must be minimum 3 chracters"
        })
        .max(40, function() {
            return "Name must be maximum 3 chracters"
        })
        .matches(/^[A-Za-z][A-Za-záéíñóúüÁÉÍÑÓÚÜ\s\-']*[A-Za-z\s]$/, function() {
            return "Please enter valid name"
    }),
    gender: Yup.string().required(function() {
            return "Please enter a last name"
    }),
    dob: Yup
        .date()
        .required( function() {
            return "Please enter DOB"
    }),
    relation: Yup.string().required(function() {
        return "Please enter relation"
    })
})

class NomineeDetails extends Component {

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    addressInfo = (productId) => {
        this.props.history.push(`/Address/${productId}`);
    }

    handleSubmit = (event) => {
        const {productId} = this.props.match.params
        this.props.history.push(`/PolicyDetails/${productId}`);
    }


    render() {
        const {productId} = this.props.match.params

        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">Arogya Sanjeevani Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <div className="justify-content-left brandhead  m-b-20">
                                            <h4 className="fs-18">You are just one step away from geting your policy ready</h4>
                                        </div>
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Nominee  Details</h4>
                                        </div>

                                    <Formik initialValues={initialValues} onSubmit={this.handleSubmit} 
                                    validationSchema={validateNominee}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                    return (
                                    <Form>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

                                                <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="fname"
                                                                    type="text"
                                                                    placeholder="First Name"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.fname}
                                                                />
                                                                {errors.fname && touched.fname ? (
                                                                <span className="errorMsg">{errors.fname}</span>
                                                                ) : null}
                                                                
                                                            </div>
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="lname"
                                                                    type="text"
                                                                    placeholder="Last Name"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.lname}
                                                                />
                                                                {errors.lname && touched.lname ? (
                                                                <span className="errorMsg">{errors.lname}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>


                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name="gender"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.gender}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Select gender</option>
                                                                        <option value="male">Male</option>
                                                                        <option value="female">Female</option>
                                                                    </Field>     
                                                                    {errors.gender && touched.gender ? (
                                                                        <span className="errorMsg">{errors.gender}</span>
                                                                    ) : null}     
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row className="m-b-45">
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="dob"
                                                                minDate={new Date()}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="DOB"
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                maxDate={new Date()}
                                                                minDate={new Date(1/1/1900)}
                                                                className="datePckr"
                                                                onChange={(value) => {
                                                                    setFieldTouched("dob");
                                                                    setFieldValue("dob", value);
                                                                    }}
                                                                selected={values.dob}
                                                            />
                                                            {errors.dob && touched.dob ? (
                                                                <span className="errorMsg">{errors.dob}</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>


                                                    <Col sm={12} md={4} lg={6}>
                                                        <FormGroup>
                                                            <div className="formSection">                                                           
                                                                <Field
                                                                    name="relation"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.relation}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Relation with Primary Insured</option>
                                                                <option value="male">Father</option>
                                                                <option value="female">Mother</option>
                                                                <option value="female">Spouse</option>
                                                                </Field>     
                                                                {errors.relation && touched.relation ? (
                                                                    <span className="errorMsg">{errors.relation}</span>
                                                                ) : null}        
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.addressInfo.bind(this, productId )}>
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </Button> 
                                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                    {isSubmitting ? 'Wait..' : 'Next'}
                                                </Button> 
                                                </div>
                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="regisBox">
                                                    <h3 className="medihead">Assurance of Insurance Everywhere in India, for every Indian </h3>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Form>
                                    );
                                    }}
                                    </Formik>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </BaseComponent>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
      loading: state.loader.loading
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop())
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(NomineeDetails));