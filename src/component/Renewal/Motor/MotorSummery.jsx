import React, { Component } from 'react';	
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';	
import Collapsible from 'react-collapsible';	
import { Formik, Field, Form } from "formik";	
import BaseComponent from '../../BaseComponent';	
import SideNav from '../../common/side-nav/SideNav';	
import Footer from '../../common/footer/Footer';	
// import Otp from "./Otp"	
import axios from "../../../shared/axios";	
import { withRouter, Link, Route } from "react-router-dom";	
import { loaderStart, loaderStop } from "../../../store/actions/loader";	
import { connect } from "react-redux";	
import * as Yup from "yup";	
import Encryption from '../../../shared/payload-encryption';	
import queryString from 'query-string';	
import fuel from '../../common/FuelTypes';	
import swal from 'sweetalert';	
import moment from "moment";	
import {registrationNoFormat, paymentGateways} from '../../../shared/reUseFunctions';	
const initialValue = {	
    gateway : ""	
}	
const vehicleModel = {
    1: 'Model',
    3: 'TwoWheelModel',
    4: 'GCVModel',
    7: 'MISCDModel'
}
const vehicleBrand = {
    1: 'Brand',
    3: 'TwoWheelBrand',
    4: 'GcvBrand',
    7: 'MISCDBrand'
}
const motor_productIds = [2,6,7,8,11,15,17,18];
const menumaster_id = 7	
const validatePremium = Yup.object().shape({	
    refNo: Yup.string().notRequired('Reference number is required')	
    .matches(/^[a-zA-Z0-9]*$/, function() {	
        return "Please enter valid reference number"	
    }),	
    })	
class MotorSummery extends Component {	
    constructor(props) {	
        super(props);	
        this.handleClose = this.handleClose.bind(this);	
        this.state = {	
            show: false,	
            refNo: "",	
            whatsapp: "",	
            fulQuoteResp: [],	
            motorInsurance: [],	
            error: [],	
            purchaseData: [],	
            error1: [],	
            paymentStatus: [],	
            accessToken: "",	
            PolicyArray: [],	
            memberdetails: [],	
            nomineedetails:[],	
            relation: [],	
            policyHolder: [],	
	        step_completed: "0",	
            vehicleDetails: [],	
            previousPolicy: [],	
            request_data: [],	
            breakin_flag: 0,	
            policyCoverage: [],
            paymentgateway: [],
            policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 	
                                queryString.parse(this.props.location.search).access_id : 	
                                localStorage.getItem("policyHolder_refNo")	
        };	
    }	
    handleClose(e) {	
        this.setState({ show: false, });	
    }	
    handleOtp(e) {	
        console.log("otp", e)	
        this.setState({ show: false, });	
        this.props.history.push(`/ThankYou_motor`)	
    }	
    changePlaceHoldClassAdd(e) {	
        let element = e.target.parentElement;	
        element.classList.add('active');	
    }	
    changePlaceHoldClassRemove(e) {	
        let element = e.target.parentElement;	
        e.target.value.length === 0 && element.classList.remove('active');	
    }	
    additionalDetails = (productId) => {	
        this.props.history.push(`/AdditionalDetails_GCV/${productId}`);	
    }	

    handleSubmit = (values) => {    
        const { policyHolder_refNo , policyHolder} = this.state
        const { productId } = this.props.match.params
        paymentGateways(values, policyHolder, policyHolder_refNo, productId)
    }

    fetchData = () => {	
        const { productId } = this.props.match.params	
        let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'	
        let encryption = new Encryption();	
    	
        axios.get(`renewal/policy-details/${policyHolder_id}`)	
            .then(res => {	
                // let decryptResp = JSON.parse(encryption.decrypt(res.data))
                let decryptResp = res.data
                console.log("decrypt", decryptResp)	
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}	
                let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [];	
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};	
                let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};	
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {}	
                let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";	
                let bcMaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.bcmaster : {};	
                let menumaster = decryptResp.data.policyHolder && decryptResp.data.policyHolder.vehiclebrandmodel && decryptResp.data.policyHolder.vehiclebrandmodel.vehiclemodel ? decryptResp.data.policyHolder.vehiclebrandmodel.vehiclemodel.menumaster_id : {};
                let policyCoverage = decryptResp.data.policyHolder && decryptResp.data.policyHolder.renewalinfo && decryptResp.data.policyHolder.renewalinfo.renewalcoverage ? decryptResp.data.policyHolder.renewalinfo.renewalcoverage : []
                let dateDiff = 0	
                let paymentgateway = decryptResp.data.policyHolder && decryptResp.data.policyHolder.bcmaster && decryptResp.data.policyHolder.bcmaster.paymentgateway
                	
                this.setState({	
                    motorInsurance,policyHolder,vehicleDetails,previousPolicy,request_data,menumaster,step_completed, bcMaster,	policyCoverage,paymentgateway,
                    paymentStatus: decryptResp.data.policyHolder.payment ? decryptResp.data.policyHolder.payment[0] : [],	
                    memberdetails : decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [],	
                    nomineedetails: decryptResp.data.policyHolder && decryptResp.data.policyHolder.request_data.nominee ? decryptResp.data.policyHolder.request_data.nominee[0]:[]	
                    	
                })	
                this.props.loadingStop();
                // this.getAccessToken(motorInsurance)       	
            })	
            .catch(err => {	
                // handle error	
                this.props.loadingStop();	
            })	
    }	
    callBreakin=(regnNumber)=>{	
        const formData = new FormData();	
        let encryption = new Encryption();	
        let num = regnNumber	
        let numLength = num.length	
        let val =""	
        let formatVal = num.substring(0, 1)	
        for(var i=0;i<=14;i++){	
            formatVal = val+num.substring(i, i+1)	
            val = registrationNoFormat(formatVal, numLength)	
        }	
        let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'	
        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";	
        if(bc_data) {	
            bc_data = JSON.parse(encryption.decrypt(bc_data));	
        }	
        formData.append('bcmaster_id', sessionStorage.getItem('csc_id') ? "5" : bc_data ? bc_data.agent_id : "" ) 	
        formData.append('ref_no', policyHolder_id) 	
        formData.append('registrationNo', val)	
        this.props.loadingStart();	
        axios.post('breakin/create',formData)	
        .then(res=>{	
            swal(`Your breakin request has been raised. Your inspection Number: ${res.data.data.inspection_no}`)	
            this.props.loadingStop();	
        }).	
        catch(err=>{	
            this.props.loadingStop();	
        })  	
    }	
	

    fetchRelationships=()=>{	
        this.props.loadingStart();	
        axios.get('relations')	
        .then(res=>{	
            let relation = res.data.data ? res.data.data : []                        	
            this.setState({	
                relation	
            });	
            this.fetchData()	
        }).	
        catch(err=>{	
            this.props.loadingStop();	
            this.setState({	
                relation: []	
            });	
        })	
    	
    }	
    
    sendPaymentLink = () => {	
        let encryption = new Encryption();	
        const formData = new FormData();	
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;	
        formData.append('reference_no', policyHolder_refNo)	
    	
        this.props.loadingStart();	
        axios	
          .post("send-payment-link", formData)	
          .then((res) => {	
            swal(res.data.msg)	
            this.props.loadingStop();	
          })	
          .catch((err) => {	
            this.props.loadingStop();	
          });	
      };	
    	
    componentDidMount() {	
        // this.fetchData()	
        this.fetchRelationships()	
    }	
    render() {	
        const { policyHolder, show, paymentgateway, motorInsurance, error, error1, paymentStatus, bcMaster,policyCoverage,	
             relation, memberdetails,nomineedetails, vehicleDetails, breakin_flag, step_completed, request_data,menumaster, } = this.state	
        const { productId } = this.props.match.params	

        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null	
        const errMsg =	
            error && error.message ? (	
                <span className="errorMsg">	
                    <h6>	
                        <strong>	
                            Thank you for showing your interest for buying product.Due to some	
                            reasons, we are not able to issue the policy online.Please call	
                            1800 22 1111	
                    </strong>	
                    </h6>	
                </span>	
            ) : null;	
        const paymentErrMsg =	
            paymentStatus && paymentStatus.transaction_status == 103 ? (	
                <span className="errorMsg">	
                    <h6>	
                        <strong>	
                            Payment failed. Please try again	
                    </strong>	
                    </h6>	
                </span>	
            ) : null;	

        const policyCoverageList =  policyCoverage && policyCoverage.length > 0 ?
            policyCoverage.map((coverage, qIndex) => (
                coverage.renewalsubcoverage && coverage.renewalsubcoverage.length > 0 ? coverage.renewalsubcoverage.map((benefit, bIndex) => (
                    parseInt(benefit.interest_premium) != 0 ?
                    <div>
                        <Row>
                            <Col sm={12} md={6}>
                                <FormGroup>{benefit.interest_name}</FormGroup>
                            </Col>
                            <Col sm={12} md={6}>
                                <FormGroup>₹ {Math.round(benefit.interest_premium)}</FormGroup>
                            </Col>
                        </Row>
                    </div> : null
            )) : 
            parseInt(coverage.annual_premium) != 0 ?
            <div>
                <Row>
                    <Col sm={12} md={6}>
                    <FormGroup>{coverage.cover_name}</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                    <FormGroup>₹ {Math.round(coverage.annual_premium)}  </FormGroup>                      
                    </Col>
                </Row> 
            </div> : null
        )) : null  

        return (	
            <>	
                <BaseComponent>	
                <div className="page-wrapper">
                    <div className="container-fluid">
                        <div className="row">					
                           <aside className="left-sidebar">
                            <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
                            <SideNav />
                            </div>
                            </aside>

                            {/* { step_completed >= '4' && vehicleDetails.vehicletype_id == '8' ?	 */}
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox">	
                                <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>	
                                <Formik initialValues={initialValue} onSubmit={this.handleSubmit}	
                                validationSchema={validatePremium}	
                                >	
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {	
                                        return (	
                                            <Form>	
                                                <section className="brand m-t-11 m-b-25">	
                                                    <div className="d-flex justify-content-left">	
                                                        <div className="brandhead m-b-10">	
                                                            <h4>{phrases['PremiumDetails']} </h4>	
                                                        </div>	
                                                    </div>	
                                                    <div className="brandhead m-b-30">	
                                                        <h5>{errMsg}</h5>	
                                                        <h5>{paymentErrMsg}</h5>	
                                                        <h4>	
                                                        {phrases['PolRefNumber']} {request_data.quote_id}	
                                                        </h4>	
                                                    </div>	
                                                    <Row>	
                                                        <Col sm={12} md={9} lg={9}>	
                                                            <div className="rghtsideTrigr">	
                                                                <Collapsible trigger={phrases['PolicyDetails']}>	
                                                                    <div className="listrghtsideTrigr">	
                                                                        <Row>	
                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Policy Start date:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    {request_data && request_data.start_date ? moment(request_data.start_date).format('DD-MM-yyy') : null}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Policy End Date:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                {request_data && request_data.end_date ? moment(request_data.end_date).format('DD-MM-yyy') : null}
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Product Name:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="premamount">
                                                                                {vehicleDetails && vehicleDetails.vehicletype ? vehicleDetails.vehicletype.description : null}
                                                                                </div>
                                                                            </Col>
                                                                        </Row>	
                                                                    </div>	
                                                                </Collapsible>	
                                                            </div>	
                                                            
                                                            <div className="rghtsideTrigr">
                                                                <Collapsible trigger={phrases['DefaultCovered']} >
                                                                    <div className="listrghtsideTrigr">
                                                                        {policyCoverageList}
                                                                    </div>
                                                                </Collapsible>
                                                            </div>
                                                            <div className="rghtsideTrigr">	
                                                                <Collapsible trigger={phrases['RMPolicy']}  open= {true}>	
                                                                    <div className="listrghtsideTrigr">	
                                                                        <Row>	
                                                                            <Col sm={12} md={3}>	
                                                                                <div className="motopremium">	
                                                                                {phrases['Premium']}:	
                                                                                </div>	
                                                                            </Col>	
                                                                            <Col sm={12} md={3}>	
                                                                                <div className="premamount">	
                                                                                    ₹ {request_data.payable_premium}	
                                                                                </div>	
                                                                            </Col>	
                                                                            <Col sm={12} md={3}>	
                                                                                <div className="motopremium">	
                                                                                {phrases['GrossPremium']}:	
                                                                                </div>	
                                                                            </Col>	
                                                                            <Col sm={12} md={3}>	
                                                                                <div className="premamount">	
                                                                                    ₹ {Math.round(request_data.gross_premium)}	
                                                                                </div>	
                                                                            </Col>	
                                                                            <Col sm={12} md={3}>	
                                                                                <div className="motopremium">	
                                                                                {phrases['GST']}:	
                                                                                </div>	
                                                                            </Col>	
                                                                            <Col sm={12} md={3}>	
                                                                                <div className="premamount">	
                                                                                    ₹ {Math.round(request_data.service_tax)}	
                                                                                </div>	
                                                                            </Col>	
                                                                        </Row>	
                                                                    </div>	
                                                                </Collapsible>	
                                                            </div>	
                                                            
                                                            <div className="rghtsideTrigr m-b-30">	
                                                                <Collapsible trigger={phrases['VehicleDetails']} >	
                                                                    <div className="listrghtsideTrigr">	
                                                                        {memberdetails ?	
                                                                                <div>	
                                                                                    <Row>	
                                                                                        <Col sm={12} md={9}>	
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{phrases['RegNo']}:</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{motorInsurance && motorInsurance.registration_no}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                <FormGroup>{ menumaster ? phrases[vehicleBrand[menumaster]] : null}:</FormGroup>
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : ""}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{ menumaster ? phrases[vehicleModel[menumaster]] : null}</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : ""}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{phrases['Variant']}</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.varient ? vehicleDetails.varientmodel.varient : ""}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{phrases['ChasisNumber']}</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{motorInsurance && motorInsurance.chasis_no  ? motorInsurance.chasis_no : ""}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{phrases['EngineNumber']}</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                <FormGroup>{motorInsurance && motorInsurance.engine_no  ? motorInsurance.engine_no : ""}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{phrases['Fuel']}</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fuel_type ? fuel[parseInt(vehicleDetails.varientmodel.fuel_type)] : null}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{phrases['Seating']}</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.seating ? vehicleDetails.varientmodel.seating : null}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	

                                                                                            {vehicleDetails && vehicleDetails.vehicletype && motor_productIds.includes(vehicleDetails.vehicletype.id) ?
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{phrases['BodyStyle']}</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.body_style ? vehicleDetails.varientmodel.body_style : null}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	: null }

                                                                                            {vehicleDetails && vehicleDetails.vehicletype && motor_productIds.includes(vehicleDetails.vehicletype.id) ?
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{phrases['GrossVehicleWeight']}</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.gross_vechicle_weight ? vehicleDetails.varientmodel.gross_vechicle_weight : null}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	: null }
                                                                                            {request_data && parseInt(request_data.IDV_Suggested) == 0 ? null :
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{phrases['IDVofVehicle']}</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{request_data && request_data.IDV_Suggested ? parseInt(request_data.IDV_Suggested) : null}</FormGroup>
                                                                                                </Col>
                                                                                            </Row> }
                                                                                        </Col>	
                                                                                    </Row>	
                                                                                    <Row>	
                                                                                        <p></p>	
                                                                                    </Row>	
                                                                                </div>	
                                                                            : (<p></p>)}	
                                                                                   	
                                                                        <div>	
                                                                            <Row>	
                                                                                <p></p>	
                                                                            </Row>	
                                                                        </div>	
                                                                    </div>	
                                                                </Collapsible>	
                                                            </div>	
                                                            
                                                            <div className="rghtsideTrigr m-b-30">	
                                                                <Collapsible trigger={phrases['MemberDetails']} >	
                                                                    <div className="listrghtsideTrigr">	
                                                                        {memberdetails ?	
                                                                                <div>	
                                                                                    <strong>{phrases['OwnerDetails']} </strong>	
                                                                                    <br/>	
                                                                                       <Row>	
                                                                                        <Col sm={12} md={6}>	
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                {motorInsurance && motorInsurance.policy_for == '1' ?  <FormGroup>{phrases['Name']}:</FormGroup> : <FormGroup>{phrases['CompanyName']}:</FormGroup> }	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{memberdetails.first_name }</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	
                                                                                            { motorInsurance && motorInsurance.policy_for == '1' ?     	
                                                                                                <Row>	
                                                                                                    <Col sm={12} md={6}>	
                                                                                                        <FormGroup>{phrases['DateOfBirth']}:</FormGroup>	
                                                                                                    </Col>	
                                                                                                    <Col sm={12} md={6}>	
                                                                                                        <FormGroup>{ memberdetails ? moment(memberdetails.dob).format("DD-MM-YYYY") : null}</FormGroup>	
                                                                                                    </Col>	
                                                                                                </Row> : 	
                                                                                                <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{phrases['IncorporationDate']}:</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{ memberdetails ? moment(memberdetails.date_of_incorporation).format("DD-MM-YYYY") : null}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>}	
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{phrases['MobileNo']}:</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{memberdetails.mobile}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	
                                                                                            <Row>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{phrases['EmailId']}:</FormGroup>	
                                                                                                </Col>	
                                                                                                <Col sm={12} md={6}>	
                                                                                                    <FormGroup>{memberdetails.email_id}</FormGroup>	
                                                                                                </Col>	
                                                                                            </Row>	
                                                                                            {motorInsurance && motorInsurance.policy_for == '1' ?	
                                                                                                <Row>	
                                                                                                    <Col sm={12} md={6}>	
                                                                                                        <FormGroup>{phrases['Gender']}</FormGroup>	
                                                                                                    </Col>	
                                                                                                    <Col sm={12} md={6}>	
                                                                                                        <FormGroup>{memberdetails.gender == "m" ? "Male" : "Female"}</FormGroup>	
                                                                                                    </Col>	
                                                                                                </Row> :	
                                                                                                <Row>	
                                                                                                    <Col sm={12} md={6}>	
                                                                                                        <FormGroup>{phrases['GSTIN']}:</FormGroup>	
                                                                                                    </Col>	
                                                                                                    <Col sm={12} md={6}>	
                                                                                                        <FormGroup>{memberdetails.gstn_no}</FormGroup>	
                                                                                                    </Col>	
                                                                                                </Row> }	
                                                                                        </Col>	
                                                                                    </Row>	
                                                                                    <Row>	
                                                                                        <p></p>	
                                                                                    </Row>	
                                                                                </div>	
                                                                            : (<p></p>)}	
                                                                        {nomineedetails ?             	
                                                                        <div>	
                                                                        <strong>{phrases['NomineeDetails']} :</strong>	
                                                                            <br/>	
                                                                            <Row>	
                                                                                <Col sm={12} md={6}>	
                                                                                    <Row>	
                                                                                        <Col sm={12} md={6}>	
                                                                                            <FormGroup>{phrases['Name']}:</FormGroup>	
                                                                                        </Col>	
                                                                                        <Col sm={12} md={6}>	
                                                                                            <FormGroup>{nomineedetails ? nomineedetails.first_name : null}</FormGroup>	
                                                                                        </Col>	
                                                                                    </Row>	
                                                                                    <Row>	
                                                                                        <Col sm={12} md={6}>	
                                                                                            <FormGroup>{phrases['DateOfBirth']}:</FormGroup>	
                                                                                        </Col>	
                                                                                        <Col sm={12} md={6}>	
                                                                                            <FormGroup>{ nomineedetails ? moment(nomineedetails.dob).format("DD-MM-YYYY") : null}</FormGroup>	
                                                                                        </Col>	
                                                                                    </Row>	
                                                                                    <Row>	
                                                                                        <Col sm={12} md={6}>	
                                                                                            <FormGroup>{phrases['ProposerRelation']}:</FormGroup>	
                                                                                        </Col>	
                                                                                        <Col sm={12} md={6}>	
                                                                                        {nomineedetails && relation.map((relations, qIndex) => 	
                                                                                        relations.id == nomineedetails.relation_with ?	
                                                                                            <FormGroup>{relations.name}</FormGroup> : null	
                                                                                        )}	
                                                                                        </Col>	
                                                                                    </Row>	
                                                                                    {/* <Row>	
                                                                                        <Col sm={12} md={6}>	
                                                                                            <FormGroup>{phrases['Gender']}</FormGroup>	
                                                                                        </Col>	
                                                                                        <Col sm={12} md={6}>	
                                                                                            <FormGroup>{nomineedetails && nomineedetails.gender == "m" ? "Male" : "Female"}</FormGroup>	
                                                                                        </Col>	
                                                                                    </Row>	 */}
                                                                                </Col>	
                                                                            </Row>	
                                                                            <Row>	
                                                                                <p></p>	
                                                                            </Row>	
                                                                        </div> : null}	
                                                                        {nomineedetails && nomineedetails.is_appointee == '1' ?      	
                                                                            <div>	
                                                                            <strong>{phrases['AppoDetails']} :</strong>	
                                                                                <br/>	
                                                                                <Row>	
                                                                                    <Col sm={12} md={6}>	
                                                                                        <Row>	
                                                                                            <Col sm={12} md={6}>	
                                                                                                <FormGroup>{phrases['Name']}:</FormGroup>	
                                                                                            </Col>	
                                                                                            <Col sm={12} md={6}>	
                                                                                                <FormGroup>{nomineedetails && nomineedetails.appointee_name ? nomineedetails.appointee_name : null}</FormGroup>	
                                                                                            </Col>	
                                                                                        </Row>	
                                                                                        <Row>	
                                                                                            <Col sm={12} md={6}>	
                                                                                                <FormGroup>{phrases['RelationNominee']}:</FormGroup>	
                                                                                            </Col>	
                                                                                            <Col sm={12} md={6}>	
                                                                                            {nomineedetails && nomineedetails.appointee_relation_with && relation.map((relations, qIndex) => 	
                                                                                            relations.id == nomineedetails.appointee_relation_with ?	
                                                                                                <FormGroup>{relations.name}</FormGroup> : null	
                                                                                            )}	
                                                                                            </Col>	
                                                                                        </Row>	
                                                                                    </Col>	
                                                                                </Row>	
                                                                                <Row>	
                                                                                    <p></p>	
                                                                                </Row>	
                                                                            </div> : null }	
                                                                    </div>	
                                                                </Collapsible>	
                                                            </div>	
                                                            
                                                            <Row>	
                                                            <Col sm={12} md={6}>	
                                                            </Col>	
                                                                <Col sm={12} md={6}>	
                                                                    <FormGroup>	
                                                                     <div className="paymntgatway">	

                                                                     { paymentgateway && paymentgateway.length > 0 ? paymentgateway.map((gateways,index) =>
                                                                        // gateways.hasOwnProperty('paymentgateway') && gateways.paymentgateway ? 
                                                                        <div>
                                                                            <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='gateway'                                            
                                                                                value={index+1}
                                                                                key= {index} 
                                                                                onChange={(e) => {
                                                                                    setFieldValue(`gateway`, e.target.value);
                                                                                    setFieldValue(`slug`, gateways.slug);
                                                                                }}
                                                                                checked={values.gateway == `${index+1}` ? true : false}
                                                                            />
                                                                                <span className="checkmark " /><span className="fs-14"> 
                                                                            
                                                                                    { gateways.logo ? <img src={require('../../../assets/images/'+ gateways.logo)} alt="" /> :
                                                                                    null
                                                                                    }
                                                                                </span>
                                                                            </label>
                                                                        </div> 
                                                                        // : null
                                                                        ) : null}	
                                                                        
                                                                    </div>	
                                                                    </FormGroup>	
                                                                </Col>	
                                                            </Row>	
                                                            <Row>&nbsp;</Row>	
                                                            <div className="d-flex justify-content-left resmb">	
                                                                {/* <Button className="backBtn" type="button" onClick={this.additionalDetails.bind(this, productId)}>{phrases['Back']}</Button>	 */}
                                                            {bcMaster && bcMaster.eligible_for_payment_link == 1 ?
                                                                <div>
                                                                <Button type="button" className="proceedBtn" onClick = {this.sendPaymentLink.bind(this)}>  {phrases['PaymentLink']}  </Button>	
                                                                &nbsp;&nbsp;&nbsp;&nbsp;	
                                                                </div> : null }
                                                                {request_data.quote_id && breakin_flag == 0 && values.gateway != "" ?	
                                                                    <Button type="submit"	
                                                                        className="proceedBtn"	
                                                                    >	
                                                                        {phrases['MakePayment']}	
                                                                </Button> 	
                                                            : null}	
                                                            </div>	
                                                        </Col>	
                                                        <Col sm={12} md={3} lg={3}>	
                                                            <div className="motrcar"><img src={require('../../../assets/images/motor-car.svg')} alt="" /></div>	
                                                        </Col>	
                                                    </Row>	
                                                </section>	
                                            </Form>	
                                        );	
                                    }}	
                                </Formik>	
                            </div> 	
                            {/* : step_completed == "" ? "Forbidden" : null }	 */}
                            <Footer />	
                        </div>	
                    </div>	
                    </div>
                </BaseComponent>	
            </>	
        );	
    }	
}	
const mapStateToProps = (state) => {	
    return {	
        loading: state.loader.loading,	
    };	
};	
const mapDispatchToProps = (dispatch) => {	
    return {	
        loadingStart: () => dispatch(loaderStart()),	
        loadingStop: () => dispatch(loaderStop()),	
    };	
};	
export default withRouter(	
    connect(mapStateToProps, mapDispatchToProps)(MotorSummery)	
);	
