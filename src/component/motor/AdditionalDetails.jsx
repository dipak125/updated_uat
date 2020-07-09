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
import {  PersonAge } from "../../shared/dateFunctions";
import Encryption from '../../shared/payload-encryption';


const minDobAdult = moment(moment().subtract(64, 'years').calendar())
const maxDobAdult = moment().subtract(18, 'years').calendar();
const minDobNominee = moment(moment().subtract(100, 'years').calendar())
const maxDobNominee = moment().subtract(18, 'years').calendar();

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
    is_eia_account: "",
    eia_no: "",
    stateName: "",
    pinDataArr: [],
    pincode_id: ""
}

const ownerValidation = Yup.object().shape({
    first_name: Yup.string().required('Name is required')
        .min(3, function() {
            return "First name must be 3 chracters & last name 1 characters long"
        })
        .max(40, function() {
            return "Full name must be maximum 40 chracters"
        })
        .matches(/^[A-Za-z]{3,20}[\s][A-Za-z]{1,20}$/, function() {
            return "Please enter valid name"
        }),
    // last_name:Yup.string().required('Last name is required'),
    gender: Yup.string().required('Gender is required')
    .matches(/^[MmFf]$/, function() {
        return "Please select valid gender"
    }),
    dob:Yup.date().required('Date of birth is required')
    .test(
        "18YearsChecking",
        function() {
            return "Age should me minium 18 years and maximum 64 years"
        },
        function (value) {
            if (value) {
                const ageObj = new PersonAge();
                return ageObj.whatIsMyAge(value) <= 64 && ageObj.whatIsMyAge(value) >= 18;
            }
            return true;
        }
    ),
    pancard: Yup.string()
    .notRequired(function() {
        return "Enter PAN number"
    }).matches(/^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/, function() {
        return "Please enter valid Pan Number"
    }),
    pincode_id:Yup.string().required('Location is required'),

    pincode:Yup.string().required('Pincode is required')
    .matches(/^[0-9]{6}$/, function() {
        return "Please enter valid pin code"
    }),

    address:Yup.string().required('Address is required')
    // .matches(/^(?![0-9._])(?!.*[0-9._]$)(?!.*\d_)(?!.*_\d)[a-zA-Z0-9_.,-\\]+$/, 
    .matches(/^[a-zA-Z0-9\s,/.-]*$/, 
    function() {
        return "Please enter valid address"
    }),
    phone: Yup.string()
    .matches(/^[6-9][0-9]{9}$/,'Invalid Mobile number').required('Phone No. is required'),
    email:Yup.string().email().required('Email is required').min(9, function() {
        return "Email must be minimum 9 chracters"
    })
    .max(75, function() {
        return "Email must be maximum 75 chracters"
    }),

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
    ).matches(/^[A-Za-z][A-Za-z\s]*$/, function() {
        return "Please enter bank name"
    }),
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
    ).matches(/^[A-Za-z][A-Za-z\s]*$/, function() {
        return "Please enter bank branch"
    }),

    nominee_relation_with:Yup.string().required('Nominee relation is required'),
    nominee_first_name: Yup.string().required('Nominee name is required')
        .min(3, function() {
            return "Name must be minimum 3 chracters"
        })
        .max(40, function() {
            return "Name must be maximum 40 chracters"
        })
        .matches(/^[A-Za-z]{3,20}[\s][A-Za-z]{1,20}$/, function() {
            return "Please enter valid name"
        }),
    // nominee_last_name:Yup.string().required('Nominee last name is required'), 
    nominee_gender: Yup.string().required('Nominee gender is required')
        .matches(/^[MmFf]$/, function() {
            return "Please select valid gender"
    }),
    nominee_dob:Yup.date().required('Nominee DOB is required')
        .test(
        "3monthsChecking",
        function() {
            return "Age should be minium 3 months"
        },
        function (value) {
            if (value) {
                const ageObj = new PersonAge();
                return ageObj.whatIsMyAge(value) <= 100 && ageObj.whatIsMyAge(value) >= 18;
            }
            return true;
        }
    ),
   
    is_eia_account: Yup.string().required('This field is required'),
    eia_no: Yup.string()
    .test(
        "isEIAchecking",
        function() {
            return "Please enter EIA no"
        },
        function (value) {
            if (this.parent.is_eia_account == 1 && !value) {   
                return false;    
            }
            return true;
        }
    )
    .min(13, function() {
        return "EIA no must be minimum 13 chracters"
    })
    .max(13, function() {
        return "EIA no must be maximum 13 chracters"
    }).matches(/^[1245][0-9]{0,13}$/,'Please enter valid EIA no').notRequired('EIA no is required'),
})

class AdditionalDetails extends Component {


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
        relation: []
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
            'pincode_id':values['pincode_id'],
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
            'is_eia_account': values['is_eia_account'],
            'eia_no': values['eia_no'],
            'address': values['address']
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
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                 let decryptResp = JSON.parse(encryption.decrypt(res.data))
                 console.log("decrypt", decryptResp)
                 let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {};
                 let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                 let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                 let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : {};
                 let nomineeDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.nominee : {}
                 let is_loan_account = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.is_carloan : 0
                 let quoteId = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.quote_id : ""
                 let is_eia_account=  policyHolder && (policyHolder.is_eia_account == 0 || policyHolder.is_eia_account == 1) ? policyHolder.is_eia_account : ""
                 let bankDetails = decryptResp.data.policyHolder && decryptResp.data.policyHolder.bankdetail ? decryptResp.data.policyHolder.bankdetail[0] : {};
                 let addressDetails = JSON.parse(decryptResp.data.policyHolder.pincode_response)
                 this.setState({
                    quoteId, motorInsurance, previousPolicy, vehicleDetails, policyHolder, nomineeDetails, is_loan_account, is_eia_account, bankDetails, addressDetails
                })
                this.props.loadingStop();
                this.fetchPrevAreaDetails(addressDetails)
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
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
                this.setState({
                    relation: []
                });
            })
        
    }

    componentDidMount() {
        this.fetchData();
        this.fetchRelationships();
    }

   

    render() {
        const {showEIA, is_eia_account, showLoan, is_loan_account, nomineeDetails, 
            bankDetails,policyHolder, stateName, pinDataArr, quoteId, addressDetails, relation} = this.state
        const {productId} = this.props.match.params 
        

        let newInitialValues = Object.assign(initialValue, {
            first_name: policyHolder && policyHolder.first_name ? policyHolder.first_name : "",
            gender:  policyHolder && policyHolder.gender ? policyHolder.gender : "",
            dob: policyHolder && policyHolder.dob ? new Date(policyHolder.dob) : "",
            pancard: policyHolder && policyHolder.pancard ? policyHolder.pancard : "",
            pincode_id: addressDetails && addressDetails.id ? addressDetails.id : "",
            pincode: policyHolder && policyHolder.pincode ? policyHolder.pincode : "",
            address: policyHolder && policyHolder.address ? policyHolder.address : "",
            is_carloan:is_loan_account,
            bank_name: bankDetails ? bankDetails.bank_name : "",
            bank_branch: bankDetails ? bankDetails.bank_branch : "",
            nominee_relation_with: nomineeDetails && nomineeDetails.relation_with ? nomineeDetails.relation_with.toString() : "",
            nominee_first_name: nomineeDetails && nomineeDetails.first_name ? nomineeDetails.first_name : "",
            nominee_gender: nomineeDetails && nomineeDetails.gender ? nomineeDetails.gender : "",
            nominee_dob: nomineeDetails && nomineeDetails.dob ? new Date(nomineeDetails.dob) : "",
            
            phone: policyHolder && policyHolder.mobile ? policyHolder.mobile : "",
            email:  policyHolder && policyHolder.email_id ? policyHolder.email_id : "",
            address: policyHolder && policyHolder.address ? policyHolder.address : "",
            is_eia_account:  is_eia_account,
            eia_no: policyHolder && policyHolder.eia_no ? policyHolder.eia_no : "",

        });

        const quoteNumber =
        quoteId ? (
            <h4>You are just one steps away in getting your policy ready and your Quotation Number: {quoteId}. Please share a few more details. </h4>
        ) : null;

        // console.log("newInitialValues", newInitialValues)
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
                <section className="brand m-b-25">
                    <div className="brand-bg">

                        <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit}
                        validationSchema={ownerValidation}
                        >
                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                             let value = values.nominee_first_name;

                            //  value = value.replace(/[^A-Za-z]/ig, '')
                            //  values.nominee_first_name = value;
                            
                        return (
                        <Form>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                            <div className="d-flex justify-content-left brandhead">
                            {quoteNumber}
                            </div>
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
                                        <FormGroup className="m-b-25">
                                            <div className="insurerName nmbract">
                                                <span>+91</span>
                                            <Field
                                                name='phone'
                                                type="text"
                                                placeholder="Phone No. "
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
                                                    setFieldTouched("state");
                                                    setFieldTouched("pincode");
                                                    setFieldValue("pincode", e.target.value);
                                                    setFieldValue("state", stateName ? stateName[0] : values.state);
                                                    setFieldValue("pincode_id", "");
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
                                                {pinDataArr && pinDataArr.length > 0 && pinDataArr.map((resource,rindex)=>
                                                    <option value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                )}
                                                    
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
                                                    name="state"
                                                    type="text"
                                                    placeholder="State"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value={stateName ? stateName : values.state} 
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
                                            maxDate={new Date(maxDobNominee)}
                                            minDate={new Date(minDobNominee)}
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
                                           { relation.map((relations, qIndex) => 
                                            <option value={relations.id}>{relations.name}</option>                                        
                                           )}
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
                                                        name='is_eia_account'                                            
                                                        value='1'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`is_eia_account`, e.target.value);
                                                            this.showEIAText(1);
                                                        }}
                                                        checked={values.is_eia_account == '1' ? true : false}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                        <Field
                                                        type="radio"
                                                        name='is_eia_account'                                            
                                                        value='0'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`is_eia_account`, e.target.value);
                                                            this.showEIAText(0);
                                                        }}
                                                        checked={values.is_eia_account == '0' ? true : false}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">No</span>
                                                        {errors.is_eia_account && touched.is_eia_account ? (
                                                        <span className="errorMsg">{errors.is_eia_account}</span>
                                                    ) : null}
                                                    </label>
                                                </div>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    {showEIA || is_eia_account == '1' ?
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <div className="insurerName">   
                                            <Field
                                                name="eia_no"
                                                type="text"
                                                placeholder="EIA Number"
                                                autoComplete="off"
                                                value = {values.eia_no}
                                                maxLength="13"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            />
                                            {errors.eia_no && touched.eia_no ? (
                                            <span className="errorMsg">{errors.eia_no}</span>
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