import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter, Link, Route } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { setSmeRiskData,setSmeData,setSmeOthersDetailsData,setSmeProposerDetailsData } from "../../store/actions/sukhsam";
import * as Yup from "yup";
import Encryption from '../../shared/payload-encryption';
import queryString from 'query-string';
import swal from 'sweetalert';
import moment from "moment";
import {paymentGateways} from '../../shared/reUseFunctions';

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


class Premium_sukhsam extends Component {

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
            policyHolder: [],
            vehicleDetails: [],
            previousPolicy: [],
            request_data: [],
            breakin_flag: 0,
            policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 
                                queryString.parse(this.props.location.search).access_id : 
                                localStorage.getItem("policy_holder_ref_no")
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
        this.props.history.push(`/AdditionalDetails_Sookshma/${productId}`);
    }

    handleSubmit = (values) => {    
        const { refNumber , policyHolder} = this.state
        const { productId } = this.props.match.params
        paymentGateways(values, policyHolder, refNumber, productId)
    }


    callBreakin=()=>{

        const formData = new FormData();
        let encryption = new Encryption();
        let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'
        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }
        formData.append('bcmaster_id', sessionStorage.getItem('csc_id') ? "5" : bc_data ? bc_data.agent_id : "" ) 
        formData.append('ref_no', policyHolder_id) 

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


    componentDidMount() {
        this.quoteUpdate()
    }

    getGender = (gender) => {

        if(gender == 'm'){
            return 'Male';
        }else if(gender == 'f'){
            return 'Female';
        }

    }

    sendPaymentLink = () => {
        let encryption = new Encryption();
        const formData = new FormData();
        let policyHolder_refNo = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no") : 0;
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

    // quoteUpdate=(values, actions)=>{
    //     const {productId} = this.props.match.params 
    //     const formData = new FormData();
    //     let encryption = new Encryption();
            
    //     let formDataNew = new FormData(); 
    //     let post_data_new = {
    //         'id': this.props.policy_holder_id,
    //         'menumaster_id': this.props.menumaster_id,
    //         'page_name': `Premium_Sookshma/${productId}`,

    //     }
    //     formDataNew.append('enc_data',encryption.encrypt(JSON.stringify(post_data_new)))
        
    //     this.props.loadingStart();
    //     axios.post('/sookshama/quote',
    //     formDataNew
    //     ).then(res=>{
    //             let decryptResp = JSON.parse(encryption.decrypt(res.data));   
    //             this.fetchPolicyDetails()     
    //     })
    //     .catch(err=>{
    //         this.props.loadingStop();
    //         let decryptErr = JSON.parse(encryption.decrypt(err.data));  
    //         console.log("decryptErr --------------- ", decryptErr)
    //     })
    // }

    quoteUpdate=(values, actions)=>{
        const {productId} = this.props.match.params 
        let promiseReturn = this.fetchPolicyDetails()
        
        promiseReturn.then((value)=> {
            let encryption = new Encryption(); 
            let formDataNew = new FormData(); 
            let post_data_new = {
                'id': this.props.policy_holder_id,
                'menumaster_id': this.props.menumaster_id,
                'page_name': `Premium_Sookshma/${productId}`,
    
            }
            formDataNew.append('enc_data',encryption.encrypt(JSON.stringify(post_data_new)))
            
            this.props.loadingStart();
            axios.post('/sookshama/quote',
            formDataNew
            ).then(res=>{
                    let decryptResp = JSON.parse(encryption.decrypt(res.data));   
                    this.props.loadingStop();  
            })
            .catch(err=>{
                this.props.loadingStop();
                let decryptErr = JSON.parse(encryption.decrypt(err.data));  
                console.log("decryptErr --------------- ", decryptErr)
            })
        })
    }

    fetchPolicyDetails=()=>{
        let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no"):0;
        let encryption = new Encryption();
        return new Promise((resolve, reject) => {
            this.props.loadingStart();
            axios.get(`sookshama/details/${policy_holder_ref_no}`)
            .then(res=>{
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log("decryptResp -------->",decryptResp)
                if(decryptResp.data.policyHolder.step_no > 0){
    
                    this.props.setData({
                        start_date:decryptResp.data.policyHolder.request_data.start_date,
                        end_date:decryptResp.data.policyHolder.request_data.end_date,
                        
                        policy_holder_id:decryptResp.data.policyHolder.id,
                        policy_holder_ref_no:policy_holder_ref_no,
                        request_data_id:decryptResp.data.policyHolder.request_data.id,
                        completed_step:decryptResp.data.policyHolder.step_no,
                        menumaster_id:decryptResp.data.policyHolder.menumaster_id,
                        paymentgateway: decryptResp.data.policyHolder && decryptResp.data.policyHolder.bcmaster && decryptResp.data.policyHolder.bcmaster.bcpayment,
                        payment_link_status: decryptResp.data.policyHolder && decryptResp.data.policyHolder.bcmaster ? decryptResp.data.policyHolder.bcmaster.eligible_for_payment_link : 0
                    });
    
                }
    
                if(decryptResp.data.policyHolder.step_no == 1 || decryptResp.data.policyHolder.step_no > 1){
    
                    let risk_arr = JSON.parse(decryptResp.data.policyHolder.sookshamainfo.risk_address);
    
                    this.props.setRiskData(
                        {
                            shop_building_name:risk_arr.shop_building_name,
                            block_no:risk_arr.block_no,
                            street_name:risk_arr.street_name,
                            plot_no:risk_arr.plot_no,
                            house_flat_no:risk_arr.house_flat_no,
                            pincode:decryptResp.data.policyHolder.sookshamainfo.pincode,
                            pincode_id:decryptResp.data.policyHolder.sookshamainfo.pincode_id,
    
                            buildings_si:decryptResp.data.policyHolder.sookshamainfo.buildings_si,
                            plant_machinary_si:decryptResp.data.policyHolder.sookshamainfo.plant_machinary_si,
                            furniture_fixture_si:decryptResp.data.policyHolder.sookshamainfo.furniture_fixture_si,
                            stock_raw_mat:decryptResp.data.policyHolder.sookshamainfo.stock_raw_mat,
                            finish_goods:decryptResp.data.policyHolder.sookshamainfo.finish_goods,
                            stock_wip:decryptResp.data.policyHolder.sookshamainfo.stock_wip,
                            content_sum_insured: decryptResp.data.policyHolder.sookshamainfo.fire_content_si,
                            stock_sum_insured : decryptResp.data.policyHolder.sookshamainfo.fire_stock_si
                        }
                    );
                }
    
                if(decryptResp.data.policyHolder.step_no == 2 || decryptResp.data.policyHolder.step_no > 2){
    
                    this.props.setSmeOthersDetails({
                    
                        // previous_start_date:decryptResp.data.policyHolder.previouspolicy.start_date,
                        // previous_end_date:decryptResp.data.policyHolder.previouspolicy.end_date,
                        // Commercial_consideration:decryptResp.data.policyHolder.previouspolicy.Commercial_consideration,
                        // Previous_Policy_No:decryptResp.data.policyHolder.previouspolicy.policy_no,
                        // insurance_company_id:decryptResp.data.policyHolder.previouspolicy.insurancecompany_id,
                        // address:decryptResp.data.policyHolder.previouspolicy.address,
                        // is_claim: decryptResp.data.policyHolder.sookshamainfo.is_claim,
                        // previous_policy_check: decryptResp.data.policyHolder.previouspolicy.policy_no ? 1 : 0,
    
                        financial_party: decryptResp.data.policyHolder.sookshamainfo.financial_party ? decryptResp.data.policyHolder.sookshamainfo.financial_party : "",
                        financial_modgaged : decryptResp.data.policyHolder.sookshamainfo.financial_modgaged ? decryptResp.data.policyHolder.sookshamainfo.financial_modgaged : "",
                        financer_name: decryptResp.data.policyHolder.sookshamainfo.financer_name ? decryptResp.data.policyHolder.sookshamainfo.financer_name : ""
        
                    });
    
                }
    
                if(decryptResp.data.policyHolder.step_no == 3 || decryptResp.data.policyHolder.step_no > 3){
    
                    let address = JSON.parse(decryptResp.data.policyHolder.address);
    
                    this.props.setSmeProposerDetails(
                        {
                            first_name:decryptResp.data.policyHolder.first_name,
                            last_name:decryptResp.data.policyHolder.last_name,
                            salutation_id:decryptResp.data.policyHolder.salutation_id,
                            date_of_birth:decryptResp.data.policyHolder.dob,
                            email_id:decryptResp.data.policyHolder.email_id,
                            mobile:decryptResp.data.policyHolder.mobile,
                            gender:decryptResp.data.policyHolder.gender,
                            pan_no:decryptResp.data.policyHolder.pancard,
                            gstn_no:decryptResp.data.policyHolder.gstn_no,
    
                            com_street_name:address.street_name,
                            com_plot_no:address.plot_no,
                            com_building_name:address.house_building_name,
                            com_block_no:address.block_no,
                            com_house_flat_no:address.house_flat_no,
                            com_pincode:decryptResp.data.policyHolder.pincode,
                            com_pincode_id:decryptResp.data.policyHolder.pincode_id
                        }
                    );
                }
    
                let pincode_area_arr = JSON.parse(decryptResp.data.policyHolder.pincode_response);
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                
                this.setState(
                    {
                        salutationName:decryptResp.data.policyHolder.salutation.displayvalue,
                        pincodeArea:pincode_area_arr.LCLTY_SUBRB_TALUK_TEHSL_NM,
                        quoteId:decryptResp.data.policyHolder.request_data.quote_id,
                        gst:decryptResp.data.policyHolder.request_data.service_tax,
                        grossPremium:decryptResp.data.policyHolder.request_data.gross_premium,
                        payablePremium:decryptResp.data.policyHolder.request_data.net_premium,
                        refNumber:decryptResp.data.policyHolder.reference_no,
                        // logo:decryptResp.data.policyHolder.bcmaster.paymentgateway.logo,
                        policyHolder:decryptResp.data.policyHolder,
                        paymentgateway: decryptResp.data.policyHolder && decryptResp.data.policyHolder.bcmaster && decryptResp.data.policyHolder.bcmaster.bcpayment,
                        vehicleDetails
                    }
                );
                resolve("Promise resolved successfully");
                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
                // let decryptErr = JSON.parse(encryption.decrypt(err.data));
                //console.log("decryptErr --------> ",err.data)
                swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111")
                reject(Error("Promise rejected"));
               // return false;
            })        

        })
       
      
    }

    render() {
        const { policyHolder, show, vehicleDetails, paymentgateway, error, error1, quoteId, paymentStatus, relation, memberdetails,nomineedetails, breakin_flag } = this.state
        const { productId } = this.props.match.params

        const policyHolder_refNo = queryString.parse(this.props.location.search).access_id ? 
        queryString.parse(this.props.location.search).access_id : 
        localStorage.getItem("policyHolder_refNo")

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

                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox">
                                <h4 className="text-center mt-3 mb-3">SME Package Insurance</h4>
                                <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                                validationSchema={validatePremium}
                                >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                        return (
                                            <Form>
                                                <section className="brand m-t-11 m-b-25">
                                                    <div className="d-flex justify-content-left">
                                                        <div className="brandhead m-b-10">
                                                       { quoteId ? <h4>Your Quotation Number is: {quoteId} </h4> : null }
                                                        </div>
                                                    </div>
                                                    <div className="brandhead m-b-30">
                                                        <h5>{errMsg}</h5>
                                                        <h5>{paymentErrMsg}</h5>
                                                        <h4>
                                                            {/* Policy Reference Number {fulQuoteResp.QuotationNo} */}
                                                        </h4>
                                                    </div>

                                                    <Row>
                                                        <Col sm={12} md={9} lg={9}>
                                                            <div className="rghtsideTrigr">
                                                                    <Collapsible trigger="Policy Details" >
                                                                        <div className="listrghtsideTrigr">
                                                                            <Row>
                                                                                <Col sm={12} md={3}>
                                                                                    <div className="motopremium">
                                                                                        Policy Start date:
                                                                                    </div>
                                                                                </Col>
                                                                                <Col sm={12} md={3}>
                                                                                    <div className="premamount">
                                                                                        {this.props.start_date ? moment(this.props.start_date).format('DD-MM-yyy') : null}
                                                                                    </div>
                                                                                </Col>

                                                                                <Col sm={12} md={3}>
                                                                                    <div className="motopremium">
                                                                                        Policy End Date:
                                                                                    </div>
                                                                                </Col>
                                                                                <Col sm={12} md={3}>
                                                                                    <div className="premamount">
                                                                                    {this.props.end_date ? moment(this.props.end_date).format('DD-MM-yyy') : null}
                                                                                    </div>
                                                                                </Col>
                                                                                <Col sm={12} md={3}>
                                                                                    <div className="motopremium">
                                                                                        Product Name:
                                                                                    </div>
                                                                                </Col>
                                                                                <Col sm={12} md={3}>
                                                                                    <div className="premamount">
                                                                                    {vehicleDetails && vehicleDetails.vehicletype ? vehicleDetails.vehicletype.description : null}
                                                                                    </div>
                                                                                </Col>
                                                                            </Row>
                                                                        </div>

                                                                    </Collapsible>
                                                                </div>
                                                            
                                                            <div className="rghtsideTrigr">
                                                                <Collapsible trigger="Premium Details"  open= {true}>
                                                                    <div className="listrghtsideTrigr">
                                                                        <Row>
                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Net Premium:
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {this.state.grossPremium}
                                                                                </div>
                                                                            </Col>
                                                                            
                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    GST:
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {this.state.gst}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Final Premium:
                                                                                </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {this.state.payablePremium}
                                                                                </div>
                                                                            </Col>
                                                                        </Row>
                                                                    </div>

                                                                </Collapsible>
                                                            </div>
                                                         
                                                            <div className="rghtsideTrigr">
                                                                    <Collapsible trigger="Proposer Details" >
                                                                        <div className="listrghtsideTrigr">
                                                                            <div>
                                                                                {/* <strong>Proposer Details:</strong>
                                                                                <br/> */}
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>Title:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{this.state.salutationName}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>First Name:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{this.props.first_name}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>Last Name:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{this.props.last_name}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>Email:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{this.props.email_id}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>Date Of Birth:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{moment(new Date(this.props.date_of_birth)).format("DD-MM-YYYY")}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>Mobile Number:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{this.props.mobile}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>Gender:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{this.getGender(this.props.gender)}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>GSTN:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{this.props.gstn_no}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>Pan No.:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{this.props.pan_no}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <p></p>
                                                                                </Row>
                                                                            </div>
                                                                        </div>
                                                                    </Collapsible>
                                                                </div>

                                                            <div className="rghtsideTrigr m-b-30">
                                                            <Collapsible trigger="Communication Details" >
                                                                <div className="listrghtsideTrigr">
                                                                    <div>
                                                                        {/* <strong>Communication Details:</strong>
                                                                        <br/> */}
                                                                        <Row>
                                                                            <Col sm={12} md={6}>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <FormGroup>House/Building Name:</FormGroup>
                                                                                    </Col>
                                                                                    <Col sm={12} md={6}>
                                                                                        <FormGroup>{this.props.com_building_name}</FormGroup>
                                                                                    </Col>
                                                                                </Row>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col sm={12} md={6}>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <FormGroup>Street Name:</FormGroup>
                                                                                    </Col>
                                                                                    <Col sm={12} md={6}>
                                                                                        <FormGroup>{this.props.com_street_name}</FormGroup>
                                                                                    </Col>
                                                                                </Row>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col sm={12} md={6}>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <FormGroup>Plot No.:</FormGroup>
                                                                                    </Col>
                                                                                    <Col sm={12} md={6}>
                                                                                        <FormGroup>{this.props.com_plot_no}</FormGroup>
                                                                                    </Col>
                                                                                </Row>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col sm={12} md={6}>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <FormGroup>Pincode:</FormGroup>
                                                                                    </Col>
                                                                                    <Col sm={12} md={6}>
                                                                                        <FormGroup>{this.props.com_pincode}</FormGroup>
                                                                                    </Col>
                                                                                </Row>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col sm={12} md={6}>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <FormGroup>Pincode Area:</FormGroup>
                                                                                    </Col>
                                                                                    <Col sm={12} md={6}>
                                                                                        <FormGroup>{this.state.pincodeArea}</FormGroup>
                                                                                    </Col>
                                                                                </Row>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <p></p>
                                                                        </Row>
                                                                    </div>
                                                                </div>
                                                            </Collapsible>    
                                                        </div>

                                                            <Row>
                                                            <Col sm={12} md={6}>
                                                            </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>

                                                                    { paymentgateway && paymentgateway.length > 0 ? paymentgateway.map((gateways,index) =>
                                                                        gateways.hasOwnProperty('paymentgateway') && gateways.paymentgateway ? 
                                                                        <div key = {index}>
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
                                                                    
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>

                                                            <div className="d-flex justify-content-left resmb">
                                                                <Button className="backBtn" type="button" onClick={this.additionalDetails.bind(this,productId)}>Back</Button>
                                                               
                                                                { this.props.payment_link_status == 1 ?
                                                                    <div>
                                                                    <Button type="button" className="proceedBtn" onClick = {this.sendPaymentLink.bind(this)}>  Send Payment Link  </Button>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                                                    </div> : null }

                                                                {this.state.quoteId && this.state.quoteId != '' && values.gateway != "" ?
                                                                    <Button type="submit"
                                                                        className="proceedBtn"  type="submit"  disabled={isSubmitting ? true : false}>
                                                                        Generate Policy
                                                                </Button> 
                                                            : null}
                                                            </div>
                                                        </Col>
                                                        <Col sm={12} md={3}>
                                                        <div className="regisBox medpd">
                                                            <h5 className="medihead">Exclusions: </h5>
                                                            <h4>
                                                                <ul>
                                                                    <li className="txtRegistr resmb-15">Shops on wheels</li>
                                                                    <li className="txtRegistr resmb-15">Kutcha Construction</li>
                                                                    <li className="txtRegistr resmb-15">Basement Risks</li>
                                                                    <li className="txtRegistr resmb-15">Shops dealing in Fire-Crackers / Arms / Ammunition, Precious Jewellery </li>
                                                                    <li className="txtRegistr resmb-15">Godown / Standalone Storage Risks</li>
                                                                </ul>
                                                            </h4>
                                                        </div>
                                                        </Col>
                                                    </Row>
                                                </section>
                                            </Form>
                                        );
                                    }}
                                </Formik>

                            </div>
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

        policy_holder_ref_no:state.sukhsam.policy_holder_ref_no,
        menumaster_id:state.sukhsam.menumaster_id,
        policy_holder_id:state.sukhsam.policy_holder_id,

        start_date: state.sukhsam.start_date,
        end_date: state.sukhsam.end_date,


        house_building_name: state.sukhsam.house_building_name,
        block_no: state.sukhsam.block_no,
        street_name: state.sukhsam.street_name,
        content_sum_insured: state.sukhsam.content_sum_insured,
        house_flat_no: state.sukhsam.house_flat_no,
        pincode: state.sukhsam.pincode,
        pincode_id: state.sukhsam.pincode_id,
        buildings_sum_insured: state.sukhsam.buildings_sum_insured,
        content_sum_insured: state.sukhsam.content_sum_insured,
        stock_sum_insured: state.sukhsam.stock_sum_insured,

        first_name:state.sukhsam.first_name,
        last_name:state.sukhsam.last_name,
        salutation_id:state.sukhsam.salutation_id,
        date_of_birth:state.sukhsam.date_of_birth,
        email_id:state.sukhsam.email_id,
        mobile:state.sukhsam.mobile,
        gender:state.sukhsam.gender,
        pan_no:state.sukhsam.pan_no,
        gstn_no:state.sukhsam.gstn_no,

        com_street_name:state.sukhsam.com_street_name,
        com_plot_no:state.sukhsam.com_plot_no,
        com_building_name:state.sukhsam.com_building_name,
        com_block_no:state.sukhsam.com_block_no,
        com_house_flat_no:state.sukhsam.com_house_flat_no,
        com_pincode:state.sukhsam.com_pincode,
        com_pincode_id:state.sukhsam.com_pincode_id,

        
        previous_start_date:state.sukhsam.previous_start_date,
        previous_end_date:state.sukhsam.previous_end_date,
        Previous_Policy_No:state.sukhsam.Previous_Policy_No,
        insurance_company_id:state.sukhsam.insurance_company_id,
        previous_city:state.sukhsam.previous_city,

        payment_link_status: state.sukhsam.payment_link_status
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
        setData:(data) => dispatch(setSmeData(data)),
        setRiskData:(data) => dispatch(setSmeRiskData(data)),
        setSmeProposerDetails:(data) => dispatch(setSmeProposerDetailsData(data)),
        setSmeOthersDetails:(data) => dispatch(setSmeOthersDetailsData(data))
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Premium_sukhsam)
);
