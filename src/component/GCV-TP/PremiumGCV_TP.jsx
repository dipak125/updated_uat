import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
// import Otp from "./Otp"
import axios from "../../shared/axios";
import { withRouter, Link, Route } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from "yup";
import Encryption from '../../shared/payload-encryption';
import queryString from 'query-string';
import fuel from '../common/FuelTypes';
import swal from 'sweetalert';
import moment from "moment";

const initialValue = {
    gateway : ""
}
const menumaster_id = 7

const validatePremium = Yup.object().shape({
    refNo: Yup.string().notRequired('Reference number is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Please enter valid reference number"
    }),
    })

class PremiumGCV extends Component {

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
            refNumber: "",
            paymentStatus: [],
            accessToken: "",
            PolicyArray: [],
            memberdetails: [],
            nomineedetails:[],
            relation: [],
            step_completed: "0",
            vehicleDetails: [],
            policyHolder: [],
            policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 
                                queryString.parse(this.props.location.search).access_id : 
                                localStorage.getItem("policyHolder_refNo")
        };
    }


    handleClose(e) {
        this.setState({ show: false, });
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
        this.props.history.push(`/AdditionalDetails_GCV_TP/${productId}`);
    }

    handleSubmit = (values) => {
        // this.setState({ show: true, refNo: values.refNo, whatsapp: values.whatsapp });
        const {policyHolder} = this.state
        
        if(policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.slug && values.gateway == 1) {
            if(policyHolder.bcmaster.paymentgateway.slug == "csc_wallet") {
                this.payment()
            }
            if(policyHolder.bcmaster.paymentgateway.slug == "razorpay") {
                this.Razor_payment()
            }
            if(policyHolder.bcmaster.paymentgateway.slug == "PPINL") {
                this.paypoint_payment()
            }
        }
        else if (policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.slug && values.gateway == 2) {
            this.props.history.push(`/Vedvag_gateway/${this.props.match.params.productId}?access_id=${this.state.policyHolder_refNo}`);
        }
    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'
        let encryption = new Encryption();
    
        axios.get(`gcv-tp/policy-holder/details/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [];
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                let bcMaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.bcmaster : {};
                let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {}
                let menumaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.menumaster : {};
		        let dateDiff = 0
                this.setState({
                    motorInsurance,vehicleDetails,step_completed,policyHolder,bcMaster,request_data,menumaster,
                    refNumber: decryptResp.data.policyHolder.reference_no,
                    paymentStatus: decryptResp.data.policyHolder.payment ? decryptResp.data.policyHolder.payment[0] : [],
                    memberdetails : decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [],
                    nomineedetails: decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.nominee[0]:[]
                    
                })
                this.getAccessToken(motorInsurance)          
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    getAccessToken = (motorInsurance) => {
        axios
            .post(`/callTokenService`)
            .then((res) => {
                this.setState({
                    accessToken: res.data.access_token,
                });
                this.fullQuote(res.data.access_token, motorInsurance)
            })
            .catch((err) => {
                this.setState({
                    accessToken: '',
                });
                this.props.loadingStop();
            });
    };

    fullQuote = (access_token, motorInsurance) => {
        const formData = new FormData();
        let encryption = new Encryption();

        const post_data = {
            'ref_no':this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0',
            'access_token':access_token,
            'idv_value': motorInsurance.idv_value,
            'policy_type':  motorInsurance.policy_type,
            'add_more_coverage': motorInsurance.add_more_coverage,
            'cng_kit': motorInsurance.cng_kit,
            'cngKit_Cost': Math.floor(motorInsurance.cngkit_cost),
            'PA_Cover': motorInsurance && motorInsurance.pa_cover ? motorInsurance.pa_cover : '0',
            'coverage_data': motorInsurance && motorInsurance.add_more_coverage_request_json != null ? motorInsurance.add_more_coverage_request_json : "",
        }

        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        console.log("post_data--fullQuotePMGCV- ", post_data)
        axios.post('fullQuotePMGCV', formData)
            .then(res => {
                if (res.data.PolicyObject) {
                    this.setState({
                        fulQuoteResp: res.data.PolicyObject,
                        PolicyArray: res.data.PolicyObject.PolicyLobList,
                        error: [],
                    });
                } 
                else if(res.data.ValidateResult) {
                    swal(res.data.ValidateResult.message)
                }
                else {
                    this.setState({
                        fulQuoteResp: [],
                        error: res.data,
                    });
                }
                this.props.loadingStop();
            })
            .catch(err => {
                this.setState({
                    serverResponse: [],
                });
                this.props.loadingStop();
            })
    }

    payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment_motor.php?refrence_no=${refNumber}`
    }

    Razor_payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/pay.php?refrence_no=${refNumber}`
    }

    paypoint_payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/ppinl/pay.php?refrence_no=${refNumber}`
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
        const { policyHolder, show, fulQuoteResp, motorInsurance, error, error1, refNumber, bcMaster,request_data,menumaster,
            paymentStatus, relation, memberdetails,nomineedetails, vehicleDetails, step_completed } = this.state
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
								
					 {/*<div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">        
						<SideNav />
             		 </div>*/}
							
							
							
                            { step_completed >= '4' && vehicleDetails.vehicletype_id == '7' ?
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox premiumGcv">
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
                                                        {phrases['PolRefNumber']} {fulQuoteResp.QuotationNo}
                                                        </h4>
                                                    </div>

                                                    <Row>
                                                        <Col sm={12} md={12} lg={9}>
                                                            <div className="rghtsideTrigr">
                                                                <Collapsible trigger={phrases['PolicyDetails']}>
                                                                    <div className="listrghtsideTrigr">
                                                                        <Row>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="motopremium">
                                                                                    Policy Start date:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="premamount">
                                                                                    {request_data && request_data.start_date ? moment(request_data.start_date).format('DD-MM-yyy') : null}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={6}>
                                                                                <div className="motopremium">
                                                                                    Policy End Date:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="premamount">
                                                                                {request_data && request_data.end_date ? moment(request_data.end_date).format('DD-MM-yyy') : null}
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
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
                                                                <Collapsible trigger={phrases['RMPolicy']} open= {true}>
                                                                    <div className="listrghtsideTrigr">
                                                                        <Row>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="motopremium">
                                                                                {phrases['Premium']}:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="premamount">
                                                                                    ₹ {fulQuoteResp.DuePremium}
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="motopremium">
                                                                                {phrases['GrossPremium']}:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="premamount">
                                                                                    ₹ {Math.round(fulQuoteResp.BeforeVatPremium)}
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="motopremium">
                                                                                {phrases['GST']}:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="premamount">
                                                                                    ₹ {Math.round(fulQuoteResp.TGST)}
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
                                                                                        <Col sm={12} md={10}>
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
                                                                                                    <FormGroup>{phrases['Brand']}:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : ""}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{phrases['Model']}</FormGroup>
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

                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{phrases['BodyStyle']}</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.body_style ? vehicleDetails.varientmodel.body_style : null}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{phrases['GrossVehicleWeight']}</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.gross_vechicle_weight ? vehicleDetails.varientmodel.gross_vechicle_weight : null}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                            {/* <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{phrases['IDVofVehicle']}</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{motorInsurance && motorInsurance.idv_value ? motorInsurance.idv_value : null}</FormGroup>
                                                                                                </Col>
                                                                                            </Row> */}

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
                                                                                        <Col sm={12} md={12}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                {motorInsurance.policy_for == '1' ?  <FormGroup>{phrases['Name']}:</FormGroup> : <FormGroup>Company Name:</FormGroup> }
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{memberdetails.first_name }</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            {motorInsurance.policy_for == '1' ?     
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
                                                                                            {motorInsurance.policy_for == '1' ?
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
                                                                        {motorInsurance.policy_for == '1'  && motorInsurance.pa_flag == '1' ?      
                                                                            <div>
                                                                            <strong>Nominee Details :</strong>
                                                                                <br/>
                                                                                <Row>
                                                                                    <Col sm={12} md={12}>
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

                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{phrases['Gender']}</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{nomineedetails && nomineedetails.gender == "m" ? "Male" : "Female"}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <p></p>
                                                                            </Row>
                                                                        </div> : null}

                                                                        {motorInsurance.policy_for == '1' && nomineedetails && nomineedetails.is_appointee == '1' && motorInsurance.pa_flag == '1' ?      
                                                                            <div>
                                                                            <strong>{phrases['AppoDetails']} :</strong>
                                                                                <br/>
                                                                                <Row>
                                                                                    <Col sm={12} md={12}>
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
                                                                    {/* <div className="paymntgatway">
                                                                        Select Payment Gateway
                                                                        <div>
                                                                        <img src={require('../../assets/images/green-check.svg')} alt="" className="m-r-10" />
                                                                        { policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.logo ? <img src={require('../../assets/images/'+ policyHolder.bcmaster.paymentgateway.logo)} alt="" /> :
                                                                        null
                                                                        }
                                                                        </div>
                                                                    </div> */}
                                                                     <div className="paymntgatway">
                                                                        Select Payment Gateway
                                                                        <div>
                                                                        {/* <img src={require('../../assets/images/green-check.svg')} alt="" className="m-r-10" /> */}
                                                                        <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='gateway'                                            
                                                                            value='1'
                                                                            key='1'  
                                                                            onChange={(e) => {
                                                                                setFieldValue(`gateway`, e.target.value);
                                                                            }}
                                                                            checked={values.gateway == '1' ? true : false}
                                                                        />
                                                                            <span className="checkmark " /><span className="fs-14"> 
                                                                        
                                                                                { policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.logo ? <img src={require('../../assets/images/'+ policyHolder.bcmaster.paymentgateway.logo)} alt="" /> :
                                                                                null
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                        </div>

                                                                        {policyHolder.bcmaster && policyHolder.bcmaster.id === 2 ?
                                                                        <div>
                                                                        <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='gateway'                                            
                                                                            value='2'
                                                                            key='1'  
                                                                            onChange={(e) => {
                                                                                setFieldValue(`gateway`, e.target.value);
                                                                            }}
                                                                            checked={values.gateway == '2' ? true : false}
                                                                        />
                                                                            <span className="checkmark " /><span className="fs-14"> 
                                                                        
                                                                                { policyHolder.bcmaster && policyHolder.bcmaster.id === 2 ? <img src={require('../../assets/images/vedavaag.png')} alt="" /> :
                                                                                null
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                        </div> : null }
                                                                    </div>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>

                                                            <Row>&nbsp;</Row>
                                                            <div className="d-flex justify-content-left resmb">
                                                                <Button className="backBtn" type="button" onClick={this.additionalDetails.bind(this, productId)}>{phrases['Back']}</Button>
 								                                    {bcMaster && bcMaster.eligible_for_payment_link == 1 ?
                                                                    <div>
                                                                    <Button type="button" className="proceedBtn" onClick = {this.sendPaymentLink.bind(this)}>  Send Payment Link  </Button>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                                    </div> : null }
                                                                {fulQuoteResp.QuotationNo && values.gateway != "" ?
                                                                    <Button type="submit"
                                                                        className="proceedBtn"
                                                                    >
                                                                        {phrases['MakePayment']}
                                                                </Button> 
                                                            : null}
                                                            </div>
                                                        </Col>


                                                        <Col sm={12} md={4} lg={3}>
                                                            <div className="motrcar"><img src={require('../../assets/images/motor-car.svg')} alt="" /></div>
                                                        </Col>
                                                    </Row>
                                                </section>
                                            </Form>
                                        );
                                    }}
                                </Formik>

                            </div> : step_completed == "" ? "Forbidden" : null }
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
    connect(mapStateToProps, mapDispatchToProps)(PremiumGCV)
);
