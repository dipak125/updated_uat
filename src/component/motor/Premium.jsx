import React, { Component, Suspense } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
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
import {registrationNoFormat, paymentGateways} from '../../shared/reUseFunctions';
const Otp = React.lazy(() => import('../common/Otp/Otp'));

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

class Premium extends Component {

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            refNo: "",
            whatsapp: "",
            paymentButton: false,
            smsButton: true,
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
            policyHolder: [],
	        step_completed: "0",
            vehicleDetails: [],
            previousPolicy: [],
            request_data: [],
            breakin_flag: 0,
            menumaster: [],
            hide:0,
            paymentgateway: [],
            policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 
                                queryString.parse(this.props.location.search).access_id : 
                                localStorage.getItem("policyHolder_refNo")
        };
    }

    handleClose(e) {
        this.setState({ show: false, });
    }

    handleOtp=(e)=> {
        if(e === true) {
            this.setState({ show: false, paymentButton: true, smsButton: false});
        }
        else {
            this.setState({ show: false, paymentButton: false, smsButton: true});
        }
    }

    handleModal = () => {
        this.setState({ show: true});
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
        this.props.history.push(`/Additional_details/${productId}`);
    }

    handleSubmit = (values) => {    
        const { refNumber , policyHolder} = this.state
        const { productId } = this.props.match.params
        paymentGateways(values, policyHolder, refNumber, productId)
    }
    dateDiffrence=(value)=>
    {
        const {vehicleDetails}=this.state
          let date1=moment(new Date(value.EffectiveDate))
          let date2=moment(new Date(value.ExpiryDate))
        //  let date=date1.diff(date2,"months");
        let date=Math.floor((date2-date1)/(1000*60*60*24))
         
         console.log("diff",Math.floor((date2-date1)/(1000*60*60*24)));
        this.setState({
            ...this.state,
            product_name:date>=360 ?vehicleDetails && vehicleDetails.vehicletype && vehicleDetails.vehicletype.description:"M4W - SHORT TERM"
        })

    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'
        let encryption = new Encryption();
    
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [];
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {}
                let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";
                let bcMaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.bcmaster : {};
                let menumaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.menumaster : {};
		        let dateDiff = 0
                let paymentgateway = decryptResp.data.policyHolder && decryptResp.data.policyHolder.bcmaster && decryptResp.data.policyHolder.bcmaster.bcpayment
                
                let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
                let paymentButton = false
                let smsButton = false

                if (user_data) {
                    user_data = JSON.parse(encryption.decrypt(user_data.user));

                    if( user_data.user_type == "RAP" && user_data.bc_master_id == "5" && user_data.login_type == "4" ) {
                        paymentButton =  true
                        smsButton = false
                    }
                    else if(user_data.login_type == "4") {
                        paymentButton = bcMaster && bcMaster.eligible_for_otp_screen == 1 ? false : true
                        smsButton = bcMaster && bcMaster.eligible_for_otp_screen == 1 ? true : false
                    }
                    else {
                        paymentButton = true
                        smsButton = false
                    }
                }
            
                this.setState({
                    motorInsurance,policyHolder,vehicleDetails,previousPolicy,request_data,menumaster, step_completed, bcMaster, paymentgateway,
                    refNumber: decryptResp.data.policyHolder.reference_no, paymentButton, smsButton,
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

    fetchRequestData = () => {
        let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'
        let encryption = new Encryption();
    
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {}
                this.setState({
                    request_data
                })
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
        formData.append('page_name', `Premium/${this.props.match.params.productId}`)

        this.props.loadingStart();
        return new Promise((resolve, reject) => {
            axios.post('breakin/create',formData)
            .then(res=>{
                if(res.data.error == false) {
                    swal(`Your breakin request has been raised. Your inspection Number: ${res.data.data.inspection_no}`)
                    resolve(res.data.data.inspection_no);
                    this.props.loadingStop();
                }
                else {
                    swal(`Error: ${res.data.msg}`)
                    reject(Error("Promise rejected"));
                    this.props.loadingStop();
                }
                
            }).
            catch(err=>{
                reject(Error("Promise rejected"));
                this.props.loadingStop();
            })  
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

    breakinService = (motorInsurance,previousPolicy, request_data, policyHolder) => {
        let policy_type_id= motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : ""
        let dateDiff = 0
        return new Promise((resolve, reject) => {
            if((previousPolicy && policyHolder.break_in_status != "Vehicle Recommended and Reports Uploaded") || (policy_type_id == "3" && policyHolder.break_in_status != "Vehicle Recommended and Reports Uploaded") ){
                dateDiff = previousPolicy ? Math.floor(moment().diff(previousPolicy.end_date, 'days', true)) : "";
                let previousPolicyName = previousPolicy ? previousPolicy.name : ""

                if(dateDiff > 0 || previousPolicyName == "2" || policy_type_id == "3") {                
                    const formData1 = new FormData();
                    let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'
                    formData1.append('policy_ref_no',policyHolder_id)
                    axios.post('breakin/checking', formData1)
                    .then(res => {	
                        let break_in_checking = res.data.data.break_in_checking	
                        let break_in_inspection_no = res.data.data.break_in_inspection_no
                        let break_in_status = res.data.data.break_in_status
                        if( break_in_checking == true) {
                            this.setState({breakin_flag: 1})
                            if(break_in_inspection_no == "" && (break_in_status == null || break_in_status == "0")) {
                                swal({
                                    title: "Breakin",
                                    text: `Your Quotation number is ${request_data.quote_id}. Your vehicle needs inspection. Do you want to raise inspection.`,
                                    icon: "warning",
                                    buttons: true,
                                    dangerMode: true,
                                })
                                .then((willCreate) => {
                                    if (willCreate) {
                                        let breakinResponse = this.callBreakin(motorInsurance && motorInsurance.registration_no)
                                        breakinResponse.then((value)=> {
                                            resolve({'inspectionNumber' :value , 'inspection' : 1})
                                        })
                                        .catch((err)=>{
                                            reject(err)
                                        })
                                    }
                                    else {
                                        this.props.loadingStop();
                                    }
                                })
                            }
                            else {
                                resolve({'inspectionNumber' : break_in_inspection_no, 'inspection' : 1})
                                swal({
                                    title: "Breakin",
                                    text: `Breakin already raised. \nBreaking number ${break_in_inspection_no}.`,
                                    icon: "warning",
                                })
                            }
                        }
                        else {
                            resolve({'inspectionNumber' :"" , 'inspection' : 2})
                        }  
                        
                    })
                    .catch(err => {
                        this.setState({breakin_flag: 1})
                        this.props.loadingStop();
                    })
                }
                else {
                    resolve({'inspectionNumber' :"" , 'inspection' : 0})
                }
            }
            else {
                resolve({'inspectionNumber' :"" , 'inspection' : 0})
            }
        })
    }

    fullQuote = (access_token, motorInsurance) => {
        const formData = new FormData();
        let encryption = new Encryption();
        let dateDiff = 0
        let policy_type_id= motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : ""
        const {previousPolicy, request_data, policyHolder} = this.state

        let breakInService = this.breakinService(motorInsurance, previousPolicy, request_data, policyHolder)
        breakInService.then((value)=> {
            const post_data = {
                'ref_no':this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0',
                'access_token':access_token,
                'idv_value': motorInsurance.idv_value,
                'policy_type':  motorInsurance.policy_type,
                'add_more_coverage': motorInsurance.add_more_coverage,
                'coverage_data': motorInsurance && motorInsurance.add_more_coverage_request_json != null ? motorInsurance.add_more_coverage_request_json : "",	
                'cng_kit': motorInsurance.cng_kit,
                'cngKit_Cost': Math.floor(motorInsurance.cngkit_cost),
                'PA_Cover': motorInsurance && motorInsurance.pa_cover ? motorInsurance.pa_cover : '0',
            }

            formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
            console.log("post_data--fullQuotePMCAR- ", post_data)
            axios.post('fullQuotePMCAR', formData)
                .then(res => {
                    console.log("fullQuoteResponse====",res.data.ValidateResult)
                   if(res.data.ValidateResult)
                   {
                        this.setState({
                            ...this.state,
                            hide:1
                        })
                        this.props.loadingStop();
                   }
                   else{
                    if(res.data.PolicyObject )
                    {
                        this.dateDiffrence(res.data.PolicyObject)
                    }
                    if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
                    
                        this.setState({
                            fulQuoteResp: res.data.PolicyObject,
                            PolicyArray: res.data.PolicyObject.PolicyLobList,
                            error: [],
                            startDate:res.data.PolicyObject && res.data.PolicyObject.EffectiveDate,
                            endDate:res.data.PolicyObject && res.data.PolicyObject.ExpiryDate
                        });
                        this.fetchRequestData()
                        
                    } else {
                        this.setState({
                            fulQuoteResp: [],
                            error: res.data,
                        });
                    }
                    this.props.loadingStop();  
                }                  
                })
                .catch(err => {
                    this.setState({
                        serverResponse: [],
                    });
                    this.props.loadingStop();
                })
            
        })
        .catch((err)=> {
            swal(err)
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
        const { policyHolder, paymentgateway, fulQuoteResp, motorInsurance, error, error1, refNumber, paymentStatus, relation,hide, 
            memberdetails,nomineedetails, vehicleDetails, breakin_flag, show, bcMaster, step_completed, paymentButton, smsButton } = this.state
        const { productId } = this.props.match.params
        console.log("product name",vehicleDetails && vehicleDetails.vehicletype ? vehicleDetails.vehicletype.description : null)
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
								
                            { step_completed >= '4' && vehicleDetails.vehicletype_id == '2' ?
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox premiumPage1">
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
                                                            <h4>{phrases['PremiumDetails']}</h4>
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
                                                                    <Collapsible trigger={phrases['PolicyDetails']} >
                                                                        <div className="listrghtsideTrigr">
                                                                            <Row>                                                                      
                                                                                <Col sm={12} md={6}>
                                                                                    <div className="motopremium">
                                                                                        Policy Start date:
                                                                                    </div>
                                                                                </Col> 
                                                                                <Col sm={12} md={6}>
                                                                                <div className="premamount">
                                                                                    {fulQuoteResp && fulQuoteResp.EffectiveDate ? moment(fulQuoteResp.EffectiveDate).format('DD-MM-yyy') : null}
                                                                                </div>
                                                                                </Col>

                                                                                <Col sm={12} md={6}>
                                                                                <div className="motopremium">
                                                                                    Policy End Date:
                                                                                </div>
                                                                                </Col>
                                                                                <Col sm={12} md={6}>
                                                                                    <div className="premamount">
                                                                                    {fulQuoteResp && fulQuoteResp.ExpiryDate ? moment(fulQuoteResp.ExpiryDate).format('DD-MM-yyy') : null}
                                                                                    </div>
                                                                                </Col>
                                                                                <Col sm={12} md={6}>
                                                                                <div className="motopremium">
                                                                                    Product Name:
                                                                                </div>
                                                                                </Col>
                                                                                <Col sm={12} md={6}>
                                                                                <div className="premamount">
                                                                                {this.state.product_name}
                                                                                </div>
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                    </Collapsible>
                                                                </div>

                                                            <div className="rghtsideTrigr">
                                                                <Collapsible trigger={phrases['RMPolicy']}  open= {true}>
                                                                    <div className="listrghtsideTrigr">
                                                                        <Row>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="motopremium">
                                                                                    {phrases['Premium']}:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="premamount">
                                                                                    ??? {fulQuoteResp.DuePremium}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={6}>
                                                                                <div className="motopremium">
                                                                                    {phrases['GrossPremium']}:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="premamount">
                                                                                    ??? {Math.round(fulQuoteResp.BeforeVatPremium)}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={6}>
                                                                                <div className="motopremium">
                                                                                    {phrases['GST']}:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={6}>
                                                                                <div className="premamount">
                                                                                    ??? {Math.round(fulQuoteResp.TGST)}
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
                                                                                        <Col sm={12} md={12}>
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
                                                                                                    <FormGroup>{phrases['FuelType']}</FormGroup>
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
                                                                                                    <FormGroup>{phrases['IDVofVehicle']}</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{motorInsurance && motorInsurance.idv_value ? motorInsurance.idv_value : null}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

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
                                                                                    <strong>{phrases['OwnerDetails']} :</strong>
                                                                                    <br/>
                                                                                       <Row>
                                                                                        <Col sm={12} md={12}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                            {motorInsurance.policy_for == '1' ?  <FormGroup>{phrases['Name']}:</FormGroup> : <FormGroup>{phrases['CompanyName']}:</FormGroup> }
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{memberdetails.first_name }</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                        {motorInsurance.policy_for == '1' ?
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{phrases['Age']}:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    {/* <FormGroup>{memberdetails.dob}</FormGroup> */}
                                                                                                    <FormGroup>{ memberdetails && memberdetails.dob ? Math.floor(moment().diff(memberdetails.dob, 'years', true) ) : null}</FormGroup>
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
                                                                            </div> : (<p></p>)}
                                                                        {motorInsurance.policy_for == '1' && motorInsurance.pa_flag == '1' ?
                                                                            <div>
                                                                            <strong>{phrases['NomineeDetails']} :</strong>
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
                                                                                                <FormGroup>{phrases['Age']}:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                {/* <FormGroup>{ nomineedetails ? moment(nomineedetails.dob).format("DD-MM-YYYY") : null}</FormGroup> */}
                                                                                                <FormGroup>{ nomineedetails && nomineedetails.dob ? Math.floor(moment().diff(nomineedetails.dob, 'years', true) ) : null}</FormGroup>
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
                                                                     <div className="paymntgatway">
                                                                     {phrases['SelectPayGateway']}

                                                                     { paymentgateway && paymentgateway.length > 0 ? paymentgateway.map((gateways,index) =>
                                                                        gateways.hasOwnProperty('paymentgateway') && gateways.paymentgateway ? 
                                                                        <div>
                                                                            {/* {console.log("gateways--------------- ", gateways)} */}
                                                                            <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='gateway'                                            
                                                                                value={index+1}
                                                                                key= {index} 
                                                                                onChange={(e) => {
                                                                                    setFieldValue(`gateway`, e.target.value);
                                                                                    setFieldValue(`slug`, gateways.paymentgateway.slug);
                                                                                }}
                                                                                checked={values.gateway == `${index+1}` ? true : false}
                                                                            />
                                                                                <span className="checkmark " /><span className="fs-14"> 
                                                                            
                                                                                    { gateways.paymentgateway.logo ? <img src={require('../../assets/images/'+ gateways.paymentgateway.logo)} alt="" /> :
                                                                                    null
                                                                                    }
                                                                                </span>
                                                                            </label>
                                                                        </div> : null
                                                                        ) : null}

                                                                    </div>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>

                                                            <Row>&nbsp;</Row>
                                                            <div className="d-flex justify-content-left resmb">
                                                                <Button className="backBtn" type="button" onClick={this.additionalDetails.bind(this, productId)}>Back</Button>
                                                                
                                                                {bcMaster && bcMaster.eligible_for_payment_link == 1 && breakin_flag == 0 && fulQuoteResp.QuotationNo && hide == 0?
                                                                    <div>
                                                                        <Button type="button" className="proceedBtn" onClick = {this.sendPaymentLink.bind(this)}>  {phrases['PaymentLink']}  </Button>
                                                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                                                    </div> : null }

                                                                {smsButton === true && breakin_flag == 0 && fulQuoteResp.QuotationNo && hide == 0 ?
                                                                    <Button className="backBtn" type="button" onClick={this.handleModal.bind(this)}>{phrases['SendSMS']}</Button>
                                                                : null}

                                                                {fulQuoteResp.QuotationNo && breakin_flag == 0 && values.gateway != "" && paymentButton === true && hide == 0 ?
                                                                    <Button type="submit"
                                                                        className="proceedBtn"
                                                                    >
                                                                        {phrases['MakePayment']}
                                                                </Button> 
                                                            : null}
                                                            </div>
                                                        </Col>


                                                        <Col sm={12} md={3} lg={3}>
                                                            <div className="motrcar"><img src={require('../../assets/images/motor-car.svg')} alt="" /></div>
                                                        </Col>
                                                    </Row>
                                                </section>
                                            </Form>
                                        );
                                    }}
                                </Formik>
                                {smsButton === true && breakin_flag == 0 && fulQuoteResp.QuotationNo ?
                                <Modal className="" bsSize="md"
                                    show={show}
                                    onHide={this.handleClose}>
                                    <div className="otpmodal">
                                    <Modal.Header closeButton />
                                        <Modal.Body>
                                            <Suspense fallback={<div>Loading...</div>}>
                                            <Otp
                                                quoteNo={fulQuoteResp.QuotationNo}
                                                duePremium={fulQuoteResp.DuePremium}
                                                refNumber={refNumber}
                                                // whatsapp={whatsapp}
                                                reloadPage={(e) => this.handleOtp(e)}
                                            />
                                            </Suspense>
                                        </Modal.Body>
                                    </div>
                                </Modal>
                                : null }

                            </div>
                            : step_completed == "" ? "Forbidden" : null }
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
    connect(mapStateToProps, mapDispatchToProps)(Premium)
);
