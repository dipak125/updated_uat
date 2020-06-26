import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, DropdownButton, Dropdown } from 'react-bootstrap';
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
import Encryption from '../../shared/payload-encryption';

const initialValue = {
    first_name:"",
    last_name:"test",
    gender:"",
    dob: "",
    pancard:"",
    location:"",
    district:"test",
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
    eIA: "",
    stateName: "",
    pinDataArr: []
}

const ownerValidation = Yup.object().shape({
    first_name: Yup.string().required('Name is required'),
    // last_name:Yup.string().required('Last name is required'),
    gender: Yup.string().required('Gender is required'),
    dob:Yup.date().required('Date of birth is required'),
    pancard: Yup.string().required('Pancard is required'),
    location:Yup.string().required('Location is required'),
    // district: Yup.string().required('District is required'),
    pincode:Yup.string().required('Pincode is required'),
    address:Yup.string().required('Address is required'),
    phone: Yup.string().required('Phone No. is required'),
    email:Yup.string().required('Email is required'),

    is_carloan: Yup.mixed().required('This field is required'),
    bank_name:Yup.string().notRequired('Bank Name is required')
    .test(
        "isLoanChecking",
        function() {
            return "Please enter bank name"
        },
        function (value) {
            if (this.parent.is_carloan == 1 && !value) {   
                return false;    
            }
            return true;
        }
    ),
    bank_branch: Yup.string().notRequired('Bank branch is required')
    .test(
        "isLoanChecking",
        function() {
            return "Please enter bank branch"
        },
        function (value) {
            if (this.parent.is_carloan == 1 && !value) {   
                return false;    
            }
            return true;
        }
    ),

    nominee_relation_with:Yup.string().required('Nominee relation is required'),
    nominee_first_name: Yup.string().required('Nominee name is required'),
    // nominee_last_name:Yup.string().required('Nominee last name is required'), 
    nominee_gender: Yup.string().required('Nominee gender is required'),
    nominee_dob:Yup.string().required('Nominee DOB is required'),
   
    eIA: Yup.string().required('This field is required'),
})

class AdditionalDetails extends Component {


    state = {
        showEIA: false,
        is_eia_account: '',
        showLoan: false,
        is_loan_account: '',
        insurerList: [],
        policyHolder: {},
        nomineeDetails: {}
    };
    

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

    otherComprehensive = (productId) => {
        this.props.history.push(`/OtherComprehensive/${productId}`);
    }


    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params 
        const formData = new FormData(); 
        let encryption = new Encryption();
        const post_data = {
            'policy_holder_id':localStorage.getItem('policyHolder_id'),
            'menumaster_id':1,
            'first_name':values['first_name'],
            'last_name':values['last_name'],
            'gender':values['gender'],
            'dob':moment(values['dob']).format("YYYY-MM-DD"),
            'pancard':values['pancard'],
            'location':values['location'],
            'district':values['district'],
            'pincode':values['pincode'].toString(),
            'is_carloan':values['is_carloan'],
            'bank_name':values['bank_name'],
            'bank_branch':values['bank_branch'],
            'nominee_relation_with':values['nominee_relation_with'],
            'nominee_first_name':values['nominee_first_name'],
            'nominee_last_name':values['nominee_last_name'],
            'nominee_gender':values['nominee_gender'],
            'nominee_dob':moment(values['nominee_dob']).format("YYYY-MM-DD"),
            'phone': values['phone'],
            'email': values['email'],
        }
console.log('post_data', post_data);
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios
        .post(`/owner-details`, formData)
        .then(res => { 
            // this.props.loadingStop();
            this.props.history.push(`/Premium/${productId}`);
        })
        .catch(err => { 
          this.props.loadingStop();
          actions.setSubmitting(false)
        });

    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        this.props.loadingStart();
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                console.log(res);
                 let motorInsurance = res.data.data.policyHolder ? res.data.data.policyHolder.motorinsurance : {};
                 let previousPolicy = res.data.data.policyHolder ? res.data.data.policyHolder.previouspolicy : {};
                 let vehicleDetails = res.data.data.policyHolder ? res.data.data.policyHolder.vehiclebrandmodel : {};
                 let policyHolder = res.data.data.policyHolder ? res.data.data.policyHolder : {};
                 let nomineeDetails = res.data.data.policyHolder ? res.data.data.policyHolder.request_data.nominee[0] : {}
                 let is_loan_account = res.data.data.policyHolder ? res.data.data.policyHolder.is_carloan : 0
                this.setState({
                    motorInsurance, previousPolicy, vehicleDetails, policyHolder, nomineeDetails, is_loan_account
                })
                this.props.loadingStop();
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
           formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
           axios.post('generate-pincode-details',
            formData
            ).then(res=>{
                let pinData = res.data.trim();               
                let pinDataArr = JSON.parse(pinData.substring(0,pinData.length-10))   
                let stateName=pinDataArr.map(resource=>
                    resource.STATE_NM
                )  
                var unique = stateName.filter((v, i, a) => a.indexOf(v) === i);                                 
                this.setState({
                    pinDataArr,
                    stateName:unique,
                });
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
            })          
        }       
    }

    componentDidMount() {
        this.fetchData();
    }

   

    render() {
        const {showEIA, is_eia_account, showLoan, is_loan_account, nomineeDetails, policyHolder, stateName, pinDataArr} = this.state
        const {productId} = this.props.match.params 

        let newInitialValues = Object.assign(initialValue, {
            first_name: policyHolder && policyHolder.first_name ? policyHolder.first_name : "",
            gender:  policyHolder && policyHolder.gender ? policyHolder.gender : "",
            dob: policyHolder && policyHolder.dob ? new Date(policyHolder.dob) : "",
            pancard: policyHolder && policyHolder.pancard ? policyHolder.pancard : "",
            location: policyHolder && policyHolder.location ? policyHolder.location : "",
            pincode: policyHolder && policyHolder.pincode ? policyHolder.pincode : "",
            is_carloan:is_loan_account,
            // bank_name: policyHolder && policyHolder.length > 0 ? policyHolder.location : "",
            // bank_branch: policyHolder && policyHolder.length > 0 ? policyHolder.location : "",
            nominee_relation_with: nomineeDetails && nomineeDetails.relation_with ? nomineeDetails.relation_with : "",
            nominee_first_name: nomineeDetails && nomineeDetails.first_name ? nomineeDetails.first_name : "",
            nominee_gender: nomineeDetails && nomineeDetails.gender ? nomineeDetails.gender : "",
            nominee_dob: nomineeDetails && nomineeDetails.dob ? new Date(nomineeDetails.dob) : "",
            
            phone: policyHolder && policyHolder.mobile ? policyHolder.mobile : "",
            email:  policyHolder && policyHolder.email_id ? policyHolder.email_id : "",
            address: policyHolder && policyHolder.address ? policyHolder.address : "",
            eIA:  policyHolder && (policyHolder.is_eia_account == 0 || policyHolder.is_eia_account == 1) ? policyHolder.is_eia_account : "",

        });

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
                <section className="brand m-t-11 m-b-25">
                    <div className="brand-bg">
                        <div className="d-flex justify-content-left">
                            <div className="brandhead m-b-10">
                                <h4>You are just few steps away in getting your policy ready. Please share a few more details. </h4>
                            </div>
                        </div>

                        <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit}
                        validationSchema={ownerValidation}
                        >
                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                        return (
                        <Form>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                                <div className="d-flex justify-content-left carloan">
                                    <h4> Taken Car Loan</h4>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <div className="d-inline-flex m-b-35">
                                            <div className="p-r-25">
                                                <label className="customRadio3">
                                                <Field
                                                    type="radio"
                                                    name='is_carloan'                                            
                                                    value='1'
                                                    key='1'  
                                                    onChange={(e) => {
                                                        setFieldValue(`is_carloan`, e.target.value);
                                                        this.showLoanText(1);
                                                    }}
                                                    checked={values.is_carloan == '1' ? true : false}
                                                />
                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                </label>
                                            </div>

                                            <div className="">
                                                <label className="customRadio3">
                                                <Field
                                                    type="radio"
                                                    name='is_carloan'                                            
                                                    value='0'
                                                    key='1'  
                                                    onChange={(e) => {
                                                        setFieldValue(`is_carloan`, e.target.value); 
                                                        this.showLoanText(0);  
                                                    }}
                                                    checked={values.is_carloan == '0' ? true : false}
                                                />
                                                    <span className="checkmark" />
                                                    <span className="fs-14">No</span>
                                                </label>
                                                {errors.is_carloan && touched.is_carloan ? (
                                                <span className="errorMsg">{errors.is_carloan}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Col>
                                    {showLoan || is_loan_account == 1 ?
                                    <Fragment>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                    name='bank_name'
                                                    type="text"
                                                    placeholder="Bank Name"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value = {values.bank_name}                                                                            
                                            />
                                                {errors.bank_name && touched.bank_name ? (
                                            <span className="errorMsg">{errors.bank_name}</span>
                                            ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col> 
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                    name='bank_branch'
                                                    type="text"
                                                    placeholder="Bank Branch"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value = {values.bank_branch}                                                                            
                                            />
                                                {errors.bank_branch && touched.bank_branch ? (
                                            <span className="errorMsg">{errors.bank_branch}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    </Fragment>: ''}
                                </Row>
                                <Row>
                                    <Col>&nbsp;</Col>
                                </Row>

                                <div className="d-flex justify-content-left carloan">
                                    <h4> Owners Details</h4>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='first_name'
                                                type="text"
                                                placeholder="Full Name"
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
                                            <div className="formSection">
                                            <Field
                                                name='gender'
                                                component="select"
                                                autoComplete="off"                                                                        
                                                className="formGrp"
                                            >
                                            <option value="">Select gender</option>
                                                <option value="m">Male</option>
                                                <option value="f">Female</option>
                                            </Field>     
                                            {errors.gender && touched.gender ? (
                                            <span className="errorMsg">{errors.gender}</span>
                                            ) : null}              
                                            </div>
                                        </FormGroup>
                                    </Col>
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
                                            maxDate={new Date()}
                                            minDate={new Date(1/1/1900)}
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
                                </Row>

                                <Row>
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
                                                value = {values.pancard}                                                                            
                                            />
                                            {errors.pancard && touched.pancard ? (
                                            <span className="errorMsg">{errors.pancard}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>
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
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='phone'
                                                type="text"
                                                placeholder="Phone No. "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.phone}                                                                            
                                            />
                                            {errors.phone && touched.phone ? (
                                            <span className="errorMsg">{errors.phone}</span>
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
                                                placeholder="Address "
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
                                                name="pincode"
                                                type="number"
                                                placeholder="Pincode"
                                                autoComplete="off"
                                                maxlength = "6"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                onKeyUp={e=> this.fetchAreadetails(e)}
                                                value={values.pincode}
                                                onInput= {(e)=> {
                                                    setFieldTouched("state");
                                                    setFieldTouched("pincode");
                                                    setFieldValue("pincode", e.target.value);
                                                    setFieldValue("state", stateName ? stateName[0] : values.state);
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
                                                    name="location"
                                                    component="select"
                                                    autoComplete="off"
                                                    value={values.location}
                                                    className="formGrp"
                                                >
                                                <option value="">Select Area</option>
                                                {pinDataArr && pinDataArr.map((resource,rindex)=>
                                                    <option value={resource.LCLTY_SUBRB_TALUK_TEHSL_NM}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                )}
                                                    
                                                    {/*<option value="area2">Area 2</option>*/}
                                                </Field>     
                                                {errors.location && touched.location ? (
                                                    <span className="errorMsg">{errors.location}</span>
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
                                                    name="state"
                                                    type="text"
                                                    placeholder="State"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value={stateName ? stateName[0] : values.state} 
                                                    disabled = {true}
                                                    
                                                />
                                                {errors.state && touched.state ? (
                                                <span className="errorMsg">{errors.state}</span>
                                                ) : null}           
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

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
                                                placeholder="Full Name "
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
                                            maxDate={new Date()}
                                            minDate={new Date(1/1/1900)}
                                            className="datePckr"
                                            selected={values.nominee_dob}
                                            onChange={(val) => {
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
                                            <option value="father">father</option>
                                            <option value="mother">Mother</option>
                                            <option value="spouse">Spouse</option>
                                            </Field>     
                                            {errors.nominee_relation_with && touched.nominee_relation_with ? (
                                                <span className="errorMsg">{errors.nominee_relation_with}</span>
                                            ) : null}        
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <h4 className="fs-16">Do you have EIA account</h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="d-inline-flex m-b-35">
                                                <div className="p-r-25">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='eIA'                                            
                                                        value='1'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`eIA`, e.target.value);
                                                            this.showEIAText(1);
                                                        }}
                                                        checked={values.eIA == '1' ? true : false}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                        <Field
                                                        type="radio"
                                                        name='eIA'                                            
                                                        value='0'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`eIA`, e.target.value);
                                                            this.showEIAText(0);
                                                        }}
                                                        checked={values.eIA == '0' ? true : false}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">No</span>
                                                        {errors.eIA && touched.eIA ? (
                                                        <span className="errorMsg">{errors.eIA}</span>
                                                    ) : null}
                                                    </label>
                                                </div>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    {showEIA || is_eia_account == 1 ?
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <div className="insurerName">   
                                            <Field
                                                name="eia_account_no"
                                                type="text"
                                                placeholder="EIA Number"
                                                autoComplete="off"
                                                value = {values.eia_account_no}
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            />
                                            {errors.eia_account_no && touched.eia_account_no ? (
                                            <span className="errorMsg">{errors.eia_account_no}</span>
                                            ) : null}                                             
                                            </div>
                                        </FormGroup>
                                    </Col> : ''}
                                </Row> 
                                <div className="d-flex justify-content-left resmb">
                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.otherComprehensive.bind(this,productId)}>
                                    {isSubmitting ? 'Wait..' : 'Back'}
                                </Button> 
                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                    {isSubmitting ? 'Wait..' : 'Next'}
                                </Button> 
                                </div>

                            </Col>

                            <Col sm={12} md={3} lg={3}>
                                <div className="motrcar"><img src={require('../../assets/images/motor-car.svg')} alt="" /></div>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(AdditionalDetails));