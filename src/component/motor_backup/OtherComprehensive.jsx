import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import BackContinueButton from '../common/button/BackContinueButton';
import { Formik, Field, Form, FieldArray } from "formik";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";

const initialValue = {}

class OtherComprehensive extends Component {

    state = {
        showCNG: false,
        is_CNG_account: '',
        showLoan: false,
        is_loan_account: ''
    };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    showCNGText = (value) =>{
        if(value == 1){
            this.setState({
                showCNG:true,
                is_CNG_account:1
            })
        }
        else{
            this.setState({
                showCNG:false,
                is_CNG_account:0
            })
        }
    }

    vehicleDetails = (productId) => {      
        this.props.history.push(`/Select-brand/${productId}`);
    }


    handleSubmit = () => {
        const {productId} = this.props.match.params 
        this.props.history.push(`/Additional_details/${productId}`);
    }


    render() {
        const {showCNG, is_CNG_account} = this.state
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
                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                <section className="brand colpd m-b-25">
                    <div className="d-flex justify-content-left">
                        <div className="brandhead m-b-10">
                            <h4 className="m-b-30">Covers your Car + Damage to Others (Comprehensive)</h4>
                        </div>
                    </div>
                    <Formik initialValues={initialValue} onSubmit={this.handleSubmit}>
                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                    return (
                        <Form>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                                <div className="rghtsideTrigr W-90 m-b-30">
                                    <Collapsible trigger="Default Covered Coverages & Benefit" >
                                        <div className="listrghtsideTrigr">
                                            Hello
                                        </div>
                                    </Collapsible>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <span className="fs-16">Insured Declared Value</span>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={2} lg={2}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name="IDV"
                                                type="text"
                                                placeholder="5,00,000"
                                                autoComplete="off"
                                                className="premiumslid"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            />
                                            {errors.IDV && touched.IDV ? (
                                                <span className="errorMsg">{errors.IDV}</span>
                                            ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={12} lg={6}>
                                        <FormGroup>
                                            <img src={require('../../assets/images/slide.svg')} alt="" className="W-90" />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={5} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <span className="fs-16"> Have you fitted external CNG Kit</span>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={3} lg={3}>
                                        <FormGroup>
                                            <div className="d-inline-flex m-b-35">
                                                <div className="p-r-25">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='cngKit'                                            
                                                        value='1'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`cngKit`, e.target.value);
                                                            this.showCNGText(1);
                                                        }}
                                                        checked={values.cngKit == '1' ? true : false}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='cngKit'                                            
                                                        value='0'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`cngKit`, e.target.value);
                                                            this.showCNGText(0);
                                                        }}
                                                        checked={values.cngKit == '0' ? true : false}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">No</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    {showCNG || is_CNG_account == 1 ?
                                    <Col sm={12} md={12} lg={4}>
                                        <FormGroup>
                                        <div className="insurerName">   
                                            <Field
                                                name="cngCost"
                                                type="text"
                                                placeholder="Cost of Kit"
                                                autoComplete="off"
                                                className="W-80"
                                                value = {values.cngCost}
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            />
                                            {errors.cngCost && touched.cngCost ? (
                                            <span className="errorMsg">{errors.cngCost}</span>
                                            ) : null}                                             
                                            </div>
                                        </FormGroup>
                                    </Col> : ''}
                                </Row>

                                <Row>
                                    <Col sm={12} md={12} lg={12}>
                                        <FormGroup>
                                            <span className="fs-18"> Add  more coverage to your plan.</span>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row className="m-b-40">
                                    <Col sm={12} md={6} lg={6}>
                                        <label className="customCheckBox formGrp formGrp">Basic Roadside Assistance
                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool"/></a>
                                            </OverlayTrigger>
                                            <Field
                                                type="checkbox"
                                                name='roadsideAssistance'                                            
                                                value='1'
                                                className="user-self"
                                                // checked={values.roadsideAssistance ? true : false}
                                            />
                                            <span className="checkmark mL-0"></span>
                                            <span className="error-message"></span>
                                        </label>
                                    </Col>

                                    <Col sm={12} md={6} lg={6}>
                                        <label className="customCheckBox formGrp formGrp">Cover for Consumables
                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                                <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                </OverlayTrigger>
                                                <Field
                                                    type="checkbox"
                                                    name='consumables'                                            
                                                    value='1'
                                                    className="user-self"
                                                    // checked={values.consumables ? true : false}
                                                />
                                                <span className="checkmark mL-0"></span>
                                                <span className="error-message"></span>
                                            </label>
                                    </Col>

                                    <Col sm={12} md={6} lg={6}>
                                        <label className="customCheckBox formGrp formGrp">Depreciation Reimbursement
                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                                <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt=""  className="premtool"/></a>
                                                </OverlayTrigger>
                                                <Field
                                                    type="checkbox"
                                                    name='depReimbursement'                                            
                                                    value='1'
                                                    className="user-self"
                                                    // checked={values.consumables ? true : false}
                                                />
                                                <span className="checkmark mL-0"></span>
                                                <span className="error-message"></span>
                                            </label>
                                    </Col>

                                    <Col sm={12} md={6} lg={6}>
                                        <label className="customCheckBox formGrp formGrp">Return To Invoice
                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                                <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                </OverlayTrigger>
                                                <Field
                                                    type="checkbox"
                                                    name='invoice'                                            
                                                    value='1'
                                                    className="user-self"
                                                    // checked={values.consumables ? true : false}
                                                />
                                                <span className="checkmark mL-0"></span>
                                                <span className="error-message"></span>
                                            </label>
                                    </Col>

                                    <Col sm={12} md={6} lg={6}>
                                        <label className="customCheckBox formGrp formGrp">Engine Guard
                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                                <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                </OverlayTrigger>
                                                <Field
                                                    type="checkbox"
                                                    name='engineGuard'                                            
                                                    value='1'
                                                    className="user-self"
                                                    // checked={values.consumables ? true : false}
                                                />
                                                <span className="checkmark mL-0"></span>
                                                <span className="error-message"></span>
                                            </label>
                                    </Col>
                                    </Row>    
                                    <div className="d-flex justify-content-left resmb">
                                        <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.vehicleDetails.bind(this,productId)}>
                                            {isSubmitting ? 'Wait..' : 'Back'}
                                        </Button> 
                                        <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                            {isSubmitting ? 'Wait..' : 'Next'}
                                        </Button> 
                                        </div>
                                    </Col>

                                    <Col sm={12} md={3}>
                                        <div className="justify-content-left regisBox">
                                            <h3 className="premamnt"> Total Premium Amount</h3>
                                            <div className="rupee"> ??? 5000</div>
                                            <div className="text-center"> <button className="brkbtn">Breakup</button></div>
                                        </div>
                                    </Col>
                                </Row>
                                </Form>
                                );
                            }}
                        </Formik>
                    </section>
                    <Footer />
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(OtherComprehensive));