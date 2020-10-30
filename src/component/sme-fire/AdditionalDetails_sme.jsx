import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip  } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import Footer from '../common/footer/Footer';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios"
import moment from "moment";
import {  PersonAge } from "../../shared/dateFunctions";
import Encryption from '../../shared/payload-encryption';


const minDobAdult = moment(moment().subtract(100, 'years').calendar())
const maxDobAdult = moment().subtract(18, 'years').calendar();
const minDobNominee = moment(moment().subtract(100, 'years').calendar())
const maxDobNominee = moment().subtract(3, 'months').calendar();
const maxDoi = new Date()
const minDoi = moment(moment().subtract(100, 'years').calendar())
const eia_desc = "The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy"

const initialValue = {
    first_name:"",
    last_name:"",
    gender:"",
    dob: "",
    pancard:"",
    pincode:"",
    is_carloan:"",
    bank_name:"",
    bank_branch:"",
    nominee_relation_with:"",
    nominee_first_name:"",
    nominee_last_name:"test",
    nominee_gender:"",
    nominee_dob: "",
    phone: "",
    email: "",
    address: "",
    is_eia_account: "0",
    eia_no: "",
    stateName: "",
    pinDataArr: [],
    pincode_id: "",
    org_level: "",
    net_premium: "0",
    salutation_id: ""
}

const ownerValidation = Yup.object().shape({
   
})

class AdditionalDetails_sme extends Component {


    state = {
        showEIA: false,
        is_eia_account: '',
        showLoan: false,
        is_loan_account: '',
        insurerList: [],
        policyHolder: {},
        nomineeDetails: {},
        quoteId: "",
        bankDetails: {},
        addressDetails: [],
        relation: [],
        step_completed: "0",
        appointeeFlag: false,
        is_appointee:0,
        request_data: [],
        titleList: []
    };
    
    ageCheck = (value) => {
        const ageObj = new PersonAge();
        let age = ageObj.whatIsMyAge(value)
        if(age < 18){
            this.setState({
                appointeeFlag: true,
                is_appointee:1
            })
        }
        else {
            this.setState({
                appointeeFlag: false,
                is_appointee:0
            })
        } 
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    showEIAText = (value) =>{
        if(value == 1){
            this.setState({
                showEIA:true,
                is_eia_account:1
            })
        }
        else{
            this.setState({
                showEIA:false,
                is_eia_account:0
            })
        }
    }

    showLoanText = (value) =>{
        if(value == 1){
            this.setState({
                showLoan:true,
                is_loan_account:1
            })
        }
        else{
            this.setState({
                showLoan:false,
                is_loan_account:0
            })
        }
    }

    otherDetails = (productId) => {
        this.props.history.push(`/OtherDetails/${productId}`);
    }


    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params 
        const {motorInsurance, request_data} = this.state
        this.props.history.push(`/Premium_SME/${productId}`);
    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`gcv-tp/policy-holder/details/${policyHolder_id}`)
            .then(res => {
                 let decryptResp = JSON.parse(encryption.decrypt(res.data))
                 console.log("decrypt---", decryptResp)
                 let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {};
                 let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                 let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                 let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : {};
                 let nomineeDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.nominee[0] : {}
                 let is_loan_account = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.is_carloan : 0
                 let quoteId = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.quote_id : ""
                 let is_eia_account=  policyHolder && (policyHolder.is_eia_account == 0 || policyHolder.is_eia_account == 1) ? policyHolder.is_eia_account : ""
                 let bankDetails = decryptResp.data.policyHolder && decryptResp.data.policyHolder.bankdetail ? decryptResp.data.policyHolder.bankdetail[0] : {};
                 let addressDetails = JSON.parse(decryptResp.data.policyHolder.pincode_response)
                 let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";
                 let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {};
            
                 console.log('is_appointee', nomineeDetails ? nomineeDetails.is_appointee : "efg")
                //  return false;
                 this.setState({
                    quoteId, motorInsurance, previousPolicy, vehicleDetails, policyHolder, nomineeDetails, is_loan_account, 
                    is_eia_account, bankDetails, addressDetails, step_completed, request_data,
                    is_appointee: nomineeDetails ? nomineeDetails.is_appointee : ""
                    
                })
                this.props.loadingStop();
                this.fetchSalutation(addressDetails, motorInsurance)
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    fetchAreadetails=(e)=>{
        let pinCode = e.target.value;      

        if(pinCode.length==6){
            const formData = new FormData();
            this.props.loadingStart();
            let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
        //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
           formData.append('pincode',pinCode)
           axios.post('pincode-details',
            formData
            ).then(res=>{       
                let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
                this.setState({
                    pinDataArr: res.data.data,
                    stateName,
                });
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
            })          
        }       
    }

    
    fetchPrevAreaDetails=(addressDetails)=>{
        if(addressDetails){
            let pincode = addressDetails.PIN_CD;
            const formData = new FormData();
            // let encryption = new Encryption();

        //    const post_data_obj = {
        //         'pincode':pincode.toString()
        //     };
           // let encryption = new Encryption();
        //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

            formData.append('pincode', pincode)
            this.props.loadingStart();
            axios.post('pincode-details',
            formData
            ).then(res=>{
                let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
                this.setState({
                    pinDataArr: res.data.data,
                    stateName,
                });
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
            })
        }
        
    }

    fetchRelationships=()=>{

            this.props.loadingStart();
            axios.get('relations')
            .then(res=>{
                let relation = res.data.data ? res.data.data : []                        
                this.setState({
                    relation
                });
                this.fetchData();
            }).
            catch(err=>{
                this.props.loadingStop();
                this.setState({
                    relation: []
                });
            })
        
    }

    fetchSalutation=(addressDetails, motorInsurance)=>{

        const formData = new FormData();
        let policy_for = motorInsurance && motorInsurance.policy_for ? motorInsurance.policy_for : "1"
        this.props.loadingStart();
        formData.append('policy_for_flag', policy_for)
        axios.post('salutation-list', formData)
        .then(res=>{
            let titleList = res.data.data.salutationlist ? res.data.data.salutationlist : []                        
            this.setState({
                titleList
            });
            this.props.loadingStop();
            this.fetchPrevAreaDetails(addressDetails)
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                titleList: []
            });
        })
    
}

    componentDidMount() {
        // this.fetchRelationships();
    }

   

    render() {
        const {showLoan, is_eia_account, is_loan_account, nomineeDetails, motorInsurance,appointeeFlag, is_appointee, showEIA, titleList,
            bankDetails,policyHolder, stateName, pinDataArr, quoteId, addressDetails, relation,step_completed,vehicleDetails,request_data} = this.state
        const {productId} = this.props.match.params 
        

        let newInitialValues = Object.assign(initialValue);

        // const quoteNumber =
        // quoteId ? (
        //     <h4>You are just one steps away in getting your policy ready and your Quotation Number: {quoteId}. Please share a few more details. </h4>
        // ) : null;
        const quoteNumber =
            <h4>You are just one steps away in getting your policy ready and your Quotation Number: SME12345678. Please share a few more details. </h4>


        
        return (
            <>
                <BaseComponent>
                <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                        <SideNav />
                    </div>
                <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                <h4 className="text-center mt-3 mb-3">SME Pre UW</h4>

                <section className="brand m-b-25">
                    <div className="brand-bg">

                        <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit}
                        validationSchema={ownerValidation}
                        >
                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                             let value = values.nominee_first_name;
                            // console.log("errors", errors)
                        return (
                        <Form>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                            <div className="d-flex justify-content-left brandhead">
                            {quoteNumber}
                            <div className="brandhead"> 
                                <p>&nbsp;</p>
                            </div>
                            </div>

                                <div className="d-flex justify-content-left">
                                    <div className="brandhead">
                                        <h4 className="fs-18 m-b-30">PROPOSER DETAILS</h4>
                                    </div>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={2}>
                                        <FormGroup>
                                            <div className="formSection">
                                            <Field
                                                name='salutation_id'
                                                component="select"
                                                autoComplete="off"                                                                        
                                                className="formGrp"
                                            >
                                                <option value="">Title</option>
                                                {titleList.map((title, qIndex) => ( 
                                                <option value={title.id}>{title.displayvalue}</option>
                                                ))}
                                            </Field>     
                                            {errors.salutation_id && touched.salutation_id ? (
                                            <span className="errorMsg">{errors.salutation_id}</span>
                                            ) : null}              
                                            </div>
                                        </FormGroup>
                                    </Col>

                                    <Col sm={12} md={4} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='first_name'
                                                type="text"
                                                placeholder= "Full Name"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.first_name}                                                                            
                                            />
                                                {errors.first_name && touched.first_name ? (
                                            <span className="errorMsg">{errors.first_name}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>
 
                                        <Col sm={12} md={4} lg={4}>
                                            <FormGroup>
                                                <div className="insurerName">
                                                <Field
                                                    name='gstn_no'
                                                    type="text"
                                                    placeholder= "GSTIN"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value = {values.gstn_no}                                                                            
                                                />
                                                    {errors.gstn_no && touched.gstn_no ? (
                                                <span className="errorMsg">{errors.gstn_no}</span>
                                                ) : null} 
                                                </div>
                                            </FormGroup>
                                        </Col> 
                                </Row>

                                <Row>                                 
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <DatePicker
                                            name="dob"
                                            dateFormat="dd MMM yyyy"
                                            placeholderText="DOB"
                                            peekPreviousMonth
                                            peekPreviousYear
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            maxDate={new Date(maxDobAdult)}
                                            minDate={new Date(minDobAdult)}
                                            className="datePckr"
                                            selected={values.dob}
                                            onChange={(val) => {
                                                setFieldTouched('dob');
                                                setFieldValue('dob', val);
                                                }}
                                        />
                                        {errors.dob && touched.dob ? (
                                            <span className="errorMsg">{errors.dob}</span>
                                        ) : null}  
                                        </FormGroup>
                                    </Col>

                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup className="m-b-25">
                                            <div className="insurerName nmbract">
                                                <span>+91</span>
                                            <Field
                                                name='phone'
                                                type="text"
                                                placeholder="Mobile No. "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.phone}
                                                maxLength="10" 
                                                className="phoneinput pd-l-25"                                                                          
                                            />
                                            {errors.phone && touched.phone ? (
                                            <span className="errorMsg msgpositn">{errors.phone}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='pancard'
                                                type="text"
                                                placeholder="PAN Card No. "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.pancard.toUpperCase()} 
                                                onChange= {(e)=> 
                                                    setFieldValue('pancard', e.target.value.toUpperCase())
                                                    }                                                                           
                                            />
                                            {errors.pancard && touched.pancard ? (
                                            <span className="errorMsg">{errors.pancard}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>                               
                                </Row>
                                
                                <Row> 
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='email'
                                                type="email"
                                                placeholder="Email "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.email}                                                                            
                                            />
                                            {errors.email && touched.email ? (
                                            <span className="errorMsg">{errors.email}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row> 

                                <div className="d-flex justify-content-left carloan">
                                    <h4> </h4>
                                </div>
                                {motorInsurance && motorInsurance.policy_for == '1' && motorInsurance.pa_flag == '1' ?
                                <Fragment>
                                <div className="d-flex justify-content-left carloan">
                                    <h4> Nominee Details</h4>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='nominee_first_name'
                                                type="text"
                                                placeholder="Nominee Name"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.nominee_first_name}                                                                            
                                            />
                                            {errors.nominee_first_name && touched.nominee_first_name ? (
                                            <span className="errorMsg">{errors.nominee_first_name}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="formSection">
                                            <Field
                                                name='nominee_gender'
                                                component="select"
                                                autoComplete="off"                                                                        
                                                className="formGrp"
                                            >
                                            <option value="">Select gender</option>
                                                <option value="m">Male</option>
                                                <option value="f">Female</option>
                                            </Field>     
                                            {errors.nominee_gender && touched.nominee_gender ? (
                                            <span className="errorMsg">{errors.nominee_gender}</span>
                                            ) : null}              
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <DatePicker
                                            name="nominee_dob"
                                            dateFormat="dd MMM yyyy"
                                            placeholderText="DOB"
                                            peekPreviousMonth
                                            peekPreviousYear
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            maxDate={new Date(maxDobNominee)}
                                            minDate={new Date(minDobNominee)}
                                            className="datePckr"
                                            selected={values.nominee_dob}
                                            onChange={(val) => {
                                                this.ageCheck(val)
                                                setFieldTouched('nominee_dob');
                                                setFieldValue('nominee_dob', val);
                                                }}
                                        />
                                        {errors.nominee_dob && touched.nominee_dob ? (
                                            <span className="errorMsg">{errors.nominee_dob}</span>
                                        ) : null}  
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="formSection">
                                            <Field
                                                name="nominee_relation_with"
                                                component="select"
                                                autoComplete="off"
                                                value={values.nominee_relation_with}
                                                className="formGrp"
                                            >
                                            <option value="">Relation with Primary Insured</option>
                                           { relation.map((relations, qIndex) => 
                                           relations.id != 1 ?
                                            <option value={relations.id}>{relations.name}</option> : null                                
                                           )}
                                            </Field>     
                                            {errors.nominee_relation_with && touched.nominee_relation_with ? (
                                                <span className="errorMsg">{errors.nominee_relation_with}</span>
                                            ) : null}        
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                {appointeeFlag || is_appointee == '1' ? 
                                    <div>
                                        <div className="d-flex justify-content-left carloan">
                                            <h4> </h4>
                                        </div>
                                        <div className="d-flex justify-content-left carloan">
                                            <h4> Appointee  Details</h4>
                                        </div>
                                        <Row className="m-b-45">
                                            <Col sm={12} md={4} lg={4}>
                                                <FormGroup>
                                                    <div className="insurerName">
                                                        <Field
                                                            name="appointee_name"
                                                            type="text"
                                                            placeholder="Appointee Name"
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value={values.appointee_name}
                                                        />
                                                        {errors.appointee_name && touched.appointee_name ? (
                                                        <span className="errorMsg">{errors.appointee_name}</span>
                                                        ) : null}
                                                        
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={12} md={4} lg={6}>
                                                <FormGroup>
                                                    <div className="formSection">                                                           
                                                        <Field
                                                            name="appointee_relation_with"
                                                            component="select"
                                                            autoComplete="off"
                                                            value={values.appointee_relation_with}
                                                            className="formGrp"
                                                        >
                                                        <option value="">Relation with Nominee</option>
                                                        { relation.map((relations, qIndex) => 
                                                            <option value={relations.id}>{relations.name}</option>                                        
                                                        )}
                                                        </Field>     
                                                        {errors.appointee_relation_with && touched.appointee_relation_with ? (
                                                            <span className="errorMsg">{errors.appointee_relation_with}</span>
                                                        ) : null}        
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                </div>  : null } 
                                </Fragment> : null }

                                <div className="d-flex justify-content-left carloan">
                                    <h4> </h4>
                                </div>

                                 
                                <div className="d-flex justify-content-left">
                                    <div className="brandhead">
                                        <h4 className="fs-18 m-b-30">COMMUNICATION ADDRESS</h4>
                                    </div>
                                </div>
                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="pincode"
                                                    type="test"
                                                    placeholder="Pincode"
                                                    autoComplete="off"
                                                    maxlength = "6"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    onKeyUp={e=> this.fetchAreadetails(e)}
                                                    value={values.pincode}
                                                    maxLength="6"
                                                    onInput= {(e)=> {
                                                       
                                                    }}
                                                />
                                                {errors.pincode && touched.pincode ? (
                                                <span className="errorMsg">{errors.pincode}</span>
                                                ) : null}                                                   
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="formSection">
                                                <Field
                                                    name="pincode_id"
                                                    component="select"
                                                    autoComplete="off"
                                                    value={values.pincode_id}
                                                    className="formGrp"
                                                >
                                                <option value="">Select Area</option>
                                                {/* {pinDataArr && pinDataArr.length > 0 && pinDataArr.map((resource,rindex)=>
                                                    <option value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                )} */}
                                                    
                                                    {/*<option value="area2">Area 2</option>*/}
                                                </Field>     
                                                {errors.pincode_id && touched.pincode_id ? (
                                                    <span className="errorMsg">{errors.pincode_id}</span>
                                                ) : null}     
                                            </div>
                                        </FormGroup>
                                        
                                    </Col>
                                </Row> 
                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='address'
                                                type="text"
                                                placeholder="Plot No. "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.address}                                                                            
                                            />
                                            {errors.address && touched.address ? (
                                            <span className="errorMsg">{errors.address}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='Building_Name'
                                                type="text"
                                                placeholder="Building Name"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.address}                                                                            
                                            />
                                            {errors.address && touched.address ? (
                                            <span className="errorMsg">{errors.address}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='Street_Name'
                                                type="text"
                                                placeholder="Street Name"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.address}                                                                            
                                            />
                                            {errors.address && touched.address ? (
                                            <span className="errorMsg">{errors.address}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-left carloan">
                                    <h4> </h4>
                                </div>
                                <div className="d-flex justify-content-left resmb">
                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.otherDetails.bind(this,productId)}>
                                    {isSubmitting ? 'Wait..' : 'Back'}
                                </Button> 
                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                    {isSubmitting ? 'Wait..' : 'Next'}
                                </Button> 
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
                <Footer />
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(AdditionalDetails_sme));