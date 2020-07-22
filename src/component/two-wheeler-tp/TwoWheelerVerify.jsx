import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import BackContinueButton from '../common/button/BackContinueButton';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import { Formik, Field, Form, FieldArray } from "formik";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios"
import Encryption from '../../shared/payload-encryption';
import * as Yup from "yup";
import swal from 'sweetalert';
import moment from "moment";
import {  PersonAge } from "../../shared/dateFunctions";
import { addDays } from 'date-fns';

const ageObj = new PersonAge();
const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
const maxDate = moment(minDate).add(30, 'day').calendar();
const minRegnDate = moment().subtract(18, 'years').calendar();

const initialValue = {
    registration_no: "",
    chasis_no: "",
    chasis_no_last_part: "",
    add_more_coverage: "",
    cng_kit: 0,
    // cngKit_Cost: 0,
    engine_no: "",
    vahanVerify: false,
    newRegistrationNo: ""
}
const ComprehensiveValidation = Yup.object().shape({

    registration_no: Yup.string().when("newRegistrationNo", {
        is: "NEW",       
        then: Yup.string(),
        otherwise: Yup.string().required('Please provide registration number').matches(/^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/, 'Invalid Registration number'),
    }),

    chasis_no_last_part:Yup.string().required('This field is required')
    .matches(/^([0-9]*)$/, function() {
        return "Invalid number"
    })
    .min(5, function() {
        return "Chasis no. should be last 5 digit"
    })
    .max(5, function() {
        return "Chasis no. should be last 5 digit"
    }),

    engine_no:Yup.string().required('Engine no is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Invalid engine number"
    })
    .min(5, function() {
        return "Engine no. should be minimum 5 characters"
    })
    .max(12, function() {
        return "Engine no. should be maximum 12 characters"
    }),

    chasis_no:Yup.string().required('Chasis no is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Invalid chasis number"
    })
    .min(5, function() {
        return "Chasis no. should be minimum 5 characters"
    })
    .max(12, function() {
        return "Chasis no. should be maximum 12 characters"
    }),

    vahanVerify:Yup.boolean().notRequired('Please verify chasis number')
    .test(
        "vahanVerifyChecking",
        function() {
            return "Please verify chasis number"
        },
        function (value) {
            if (value == false && this.parent.chasis_no_last_part && this.parent.chasis_no_last_part.length == 5) {  
                return false;
            }
            return true;
        }
    )
   
});


const Coverage = {
        "C101064":"Own Damage",
        "C101065":"Legal Liability to Third Party",
        "C101066":"PA Cover",
        "C101069":"Basic Road Side Assistance",
        "C101072":"Depreciation Reimbursement",
        "C101067":"Return to Invoice",
        "C101108":"Engine Guard",
        "C101111":"Cover for consumables"
}

class TwoWheelerVerify extends Component {

    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            showCNG: false,
            is_CNG_account: '',
            accessToken: '',
            serverResponse: [],
            fulQuoteResp: [],
            PolicyArray: [],
            show: false,
            sliderVal: '',
            motorInsurance: [],
            add_more_coverage: [],
            vahanDetails: [],
            vahanVerify: false,
            policyCoverage: [],
            regno:'',
            length:15,
            insurerList: [],
        };
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }

    handleChange = () => {
        this.setState({serverResponse: [], error: [] });
    }

    showCNGText = (value) =>{
        if(value == 1){
            this.setState({
                showCNG:true,
                is_CNG_account:1,
                serverResponse: [],
                error: []
            })
        }
        else{
            this.setState({
                showCNG:false,
                is_CNG_account:0,
                serverResponse: [],
                error: []
            })
        }
    }

    sliderValue = (value) => {
        this.setState({
            sliderVal: value,
            serverResponse: [],
            error: []
        })
    }

    vehicleDetails = (productId) => {      
        this.props.history.push(`/VehicleDetails/${productId}`);
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
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let values = []
                this.setState({
                    motorInsurance,
                    showCNG: motorInsurance.cng_kit == 1 ? true : false,
                    vahanVerify: motorInsurance.chasis_no && motorInsurance.engine_no ? true : false
                })
                this.props.loadingStop();
                this.getAccessToken(values)
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    getAccessToken = (values) => {
        this.props.loadingStart();
        axios
          .post(`/callTokenService`)
          .then((res) => {
            this.setState({
              accessToken: res.data.access_token,
            });
            this.fullQuote(res.data.access_token, values)
          })
          .catch((err) => {
            this.setState({
              accessToken: '',
            });
            this.props.loadingStop();
          });
      };


    getVahanDetails = (values, setFieldTouched, setFieldValue, errors) => {

        const formData = new FormData();
        if(values.newRegistrationNo == "NEW") {
            formData.append("regnNo", values.newRegistrationNo);
            setFieldTouched('registration_no');
            setFieldValue('registration_no', values.newRegistrationNo);
        }
        else {
            formData.append("regnNo", values.registration_no);
        }

        formData.append("chasiNo", values.chasis_no_last_part);
        
        if(errors.registration_no || errors.chasis_no_last_part) {
            swal("Please provide correct Registration number and Chasis number")
        }
        else {
            this.props.loadingStart()
            axios
            .post(`/getVahanDetails`,formData)
            .then((res) => {
                this.setState({
                vahanDetails: res.data,
                vahanVerify: res.data.length > 0 ? true : false
                });

                setFieldTouched('vahanVerify')
                res.data.length > 0 ?
                setFieldValue('vahanVerify', true) 
                : setFieldValue('vahanVerify', false)

                this.props.loadingStop();
            })
            .catch((err) => {
                this.setState({
                    vahanDetails: [],
                });
                swal("Please provide correct Registration number and Chasis number")
                this.props.loadingStop();
            });
        }
    };


    handleSubmit = (values) => {
        const { productId } = this.props.match.params
        const { motorInsurance, PolicyArray, sliderVal, add_more_coverage } = this.state
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0

        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        if(add_more_coverage.length > 0){
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'registration_no': motorInsurance.registration_no ? motorInsurance.registration_no : values.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'cng_kit': values.cng_kit,
                // 'cngkit_cost': values.cngKit_Cost,
                'engine_no': values.engine_no,
                'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
                'add_more_coverage': add_more_coverage
            }
        }
        else {
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'registration_no':motorInsurance.registration_no ? motorInsurance.registration_no : values.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'cng_kit': values.cng_kit,
                // 'cngkit_cost': values.cngKit_Cost,
                'engine_no': values.engine_no,
                'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
            }
        }
        console.log('post_data',post_data)
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('update-insured-value', formData).then(res => {
            this.props.loadingStop();
            if (res.data.error == false) {
                this.props.history.push(`/Additional_details/${productId}`);
            }

        })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    onRowSelect = (values,isSelect) =>{

        const { add_more_coverage} = this.state;
         var drv = [];
         if(isSelect) {          
            add_more_coverage.push(values);
            this.setState({
                add_more_coverage: add_more_coverage,
                serverResponse: [],
                error: []
            });                               
        }
        else {                
            const index = add_more_coverage.indexOf(values);    
            if (index !== -1) {  
                add_more_coverage.splice(index,1);
                this.setState({
                    serverResponse: [],
                    error: []
                });      
                }                  
        }
    }

    toInputUppercase = e => {
        e.target.value = ("" + e.target.value).toUpperCase();
      };


    componentDidMount() {

    }


    render() {
        const {insurerList, vahanDetails, error, policyCoverage, vahanVerify, fulQuoteResp, PolicyArray, 
            sliderVal, motorInsurance, serverResponse} = this.state
        const {productId} = this.props.match.params 
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        let sliderValue = sliderVal
        let minIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MinIDV_Suggested) : null
        let maxIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MaxIDV_Suggested) : null
        minIDV = minIDV + 1;
        maxIDV = maxIDV - 1;
        let newInitialValues = Object.assign(initialValue, {
            registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
            chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : "",
            chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
            add_more_coverage: motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage : "",
            // cng_kit: motorInsurance.cng_kit ? motorInsurance.cng_kit : "",
            // cng_kit: motorInsurance.cng_kit == 0 || motorInsurance.cng_kit == 1 ? motorInsurance.cng_kit : is_CNG_account,
            // cngKit_Cost: motorInsurance.cngkit_cost ? Math.round(motorInsurance.cngkit_cost) : 0,
            engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : "",
            vahanVerify: vahanVerify,
            // newRegistrationNo: localStorage.getItem('registration_number') == "NEW" ? localStorage.getItem('registration_number') : ""

        });

        const errMsg =
            error && error.message ? (
                <span className="errorMsg">
                <h6>
                    <strong>
                    Thank you for showing your interest for buying product.Due to some
                    reasons, we are not able to issue the policy online.Please call
                    180 22 1111
                    </strong>
                </h6>
                </span>
            ) : null;

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
                    <div className="d-flex justify-content-left">
                        <div className="brandhead">
                            <h4 className="fs-18 m-b-30">Please share your vehicle details.</h4>
                            <h5>{errMsg}</h5>
                        </div>
                    </div>
                    <Formik initialValues={newInitialValues} 
                    onSubmit={ this.handleSubmit} 
                    // validationSchema={ComprehensiveValidation}
                    >
                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                            this.state.regno = "";
                                          
                            if(values.registration_no.length>0 && values.newRegistrationNo != "NEW"){
                            if(values.registration_no.toLowerCase().substring(0, 2) == "dl")
                            {
                                
                                this.state.length = 15;
                                if(values.registration_no.length<11)
                            {
                               
                            this.state.regno=values.registration_no.replace(/[^A-Za-z0-9]+/g, '').replace(/(.{2})/g, '$1 ').trim();
                            
                            }
                            else{

                                this.state.regno=values.registration_no;                                                
                            }                                        

                            }   
                            else{ 
                                
                                this.state.length = 13;
                            if(values.registration_no.length<10)
                            {
                               
                            this.state.regno=values.registration_no.replace(/[^A-Za-z0-9]+/g, '').replace(/(.{2})/g, '$1 ').trim();
                            
                            }
                            else{
                                
                                this.state.regno=values.registration_no;
                                
                            }
                        }
                        }
                    return (
                        <Form>
                        <FormGroup>
                                <div className="carloan">
                                    <h4> Please verify your vehicle</h4>
                                </div>
                            </FormGroup>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                                <Row>
                                <Col sm={12} md={6} lg={4}>
                                <Row>
                                    
                                <Col sm={12} md={5} lg={6}>
                                    <FormGroup>
                                        <div className="insurerName">
                                        Registration No:
                                        </div>
                                    </FormGroup>
                                    </Col>
                            
                                    <Col sm={12} md={5} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            {values.newRegistrationNo != "NEW" ?
                                                    <Field
                                                        type="text"
                                                        name='registration_no' 
                                                        autoComplete="off"
                                                        className="premiumslid"   
                                                        // value= {values.registration_no}    
                                                        value={this.state.regno}
                                                        maxLength={this.state.length}
                                                        onInput={e=>{
                                                            this.toInputUppercase(e)
                                                        }}                                                 
                                                    /> :
                                                    <Field
                                                        type="text"
                                                        name='registration_no' 
                                                        autoComplete="off"
                                                        className="premiumslid"   
                                                        value= {values.newRegistrationNo}    
                                                        disabled = {true}                                                 
                                                    />

                                                }
                                                {errors.registration_no ? (
                                                    <span className="errorMsg">{errors.registration_no}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                </Col>

                                <Col sm={12} md={6} lg={5}>
                                <Row>
                                <Col sm={12} md={5} lg={6}>
                                    <FormGroup>
                                        <div className="insurerName">
                                        Please Enter Last 5 digits of Chassis no.
                                        </div>
                                    </FormGroup>
                                </Col>
                                    
                                <Col sm={12} md={5} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                    <Field
                                                        type="text"
                                                        name='chasis_no_last_part' 
                                                        autoComplete="off"
                                                        className="premiumslid"       
                                                        value= {values.chasis_no_last_part}
                                                        maxLength="5"       
                                                        onChange = {(e) => {
                                                            setFieldValue('vahanVerify', false)

                                                            setFieldTouched('chasis_no_last_part')
                                                            setFieldValue('chasis_no_last_part', e.target.value)                       
                                                        }}                           
                                                        
                                                    />
                                                    {errors.chasis_no_last_part && touched.chasis_no_last_part ? (
                                                    <span className="errorMsg">{errors.chasis_no_last_part}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                </Col>

                                <Col sm={12} md={2} lg={2}>
                                    <FormGroup>
                                    
                                        <Button className="btn btn-primary vrifyBtn" onClick= {!errors.chasis_no_last_part ? this.getVahanDetails.bind(this,values, setFieldTouched, setFieldValue, errors) : null}>Verify</Button>
                                        {errors.vahanVerify ? (
                                                <span className="errorMsg">{errors.vahanVerify}</span>
                                            ) : null}
                                    </FormGroup>
                                </Col>
                                </Row>
                                    
                                {values.vahanVerify && !errors.chasis_no_last_part ?
                                <Row>
                                    <Col sm={12} md={6} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="engine_no"
                                                    type="text"
                                                    placeholder="Engine Number"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value= {values.engine_no.toUpperCase()}
                                                    maxLength="12"
                                                    onChange = {(e) => {
                                                        setFieldTouched('engine_no')
                                                        setFieldValue('engine_no', e.target.value)                       
                                                    }}  
                                                />
                                                {errors.engine_no && touched.engine_no ? (
                                                    <span className="errorMsg">{errors.engine_no}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={6} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="chasis_no"
                                                    type="text"
                                                    placeholder="Chasis Number"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value= {values.chasis_no.toUpperCase()}
                                                    maxLength="12"
                                                    onChange = {(e) => {
                                                        setFieldTouched('chasis_no')
                                                        setFieldValue('chasis_no', e.target.value)                       
                                                    }} 
                                                />
                                                {errors.chasis_no && touched.chasis_no ? (
                                                    <span className="errorMsg">{errors.chasis_no}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                : null}
                                <Row>
                                    <Col sm={12}>
                                        <FormGroup>
                                            <div className="carloan">
                                                <h4> </h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                {/* {localStorage.getItem('registration_number') != "NEW" ?  */}
                                <Fragment>
                                <Row>
                                    <Col sm={12}>
                                        <FormGroup>
                                            <div className="carloan">
                                                <h4> Previous Policy Details</h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={11} lg={4}>
                                        <FormGroup>

                                            <DatePicker
                                                name="previous_start_date"
                                                minDate={new Date(minDate)}
                                                maxDate={new Date(maxDate)}
                                                dateFormat="dd MMM yyyy"
                                                placeholderText="Previous policy start date"
                                                peekPreviousMonth
                                                peekPreviousYear
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                className="datePckr inputfs12"
                                                selected={values.previous_start_date}
                                                onChange={(val) => {
                                                    setFieldValue('previous_start_date', val);
                                                    setFieldValue("previous_end_date", addDays(new Date(val), 365));
                                                }}
                                            />
                                            {errors.previous_start_date && touched.previous_start_date ? (
                                                <span className="errorMsg">{errors.previous_start_date}</span>
                                            ) : null}
                                        </FormGroup>
                                    </Col>

                                    <Col sm={12} md={11} lg={4}>
                                        <FormGroup>
                                            <DatePicker
                                                name="previous_end_date"
                                                dateFormat="dd MMM yyyy"
                                                placeholderText="Previous policy end date"
                                                disabled = {true}
                                                dropdownMode="select"
                                                className="datePckr inputfs12"
                                                selected={values.previous_end_date}
                                                onChange={(val) => {
                                                    setFieldTouched('previous_end_date');
                                                    setFieldValue('previous_end_date', val);
                                                }}
                                            />
                                            {errors.previous_end_date && touched.previous_end_date ? (
                                                <span className="errorMsg">{errors.previous_end_date}</span>
                                            ) : null}
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={11} lg={3}>
                                        <FormGroup>
                                            <div className="formSection">
                                                <Field
                                                    name='previous_policy_name'
                                                    component="select"
                                                    autoComplete="off"
                                                    className="formGrp inputfs12"
                                                    value = {values.previous_policy_name}
                                                    // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.previous_policy_name}
                                                >
                                                    <option value="">Select Policy Type</option>
                                                    <option value="1">Package</option>
                                                    <option value="2">Liability Only</option>  
                                        
                                                </Field>
                                                {errors.previous_policy_name && touched.previous_policy_name ? (
                                                    <span className="errorMsg">{errors.previous_policy_name}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={6} lg={6}>
                                    <FormGroup>
                                        <div className="formSection">
                                        <Field
                                            name='insurance_company_id'
                                            component="select"
                                            autoComplete="off"                                                                        
                                            className="formGrp"
                                        >
                                            <option value="">Select Insurer Company</option>
                                            {insurerList.map((insurer, qIndex) => ( 
                                                <option value= {insurer.id}>{insurer.name}</option>
                                            ))}
                                        </Field>     
                                        {errors.insurance_company_id && touched.insurance_company_id ? (
                                        <span className="errorMsg">{errors.insurance_company_id}</span>
                                        ) : null}          
                                        </div>
                                    </FormGroup>
                                    </Col>

                                    <Col sm={12} md={5} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="previous_city"
                                                    type="text"
                                                    placeholder="Previous Insurer Address"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    
                                                />
                                                {errors.previous_city && touched.previous_city ? (
                                                    <span className="errorMsg">{errors.previous_city}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                <Col sm={12} md={5} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="previous_pol_nmbr"
                                                    type="text"
                                                    placeholder="Previous Policy Number"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    
                                                />
                                                {errors.previous_pol_nmbr && touched.previous_pol_nmbr ? (
                                                    <span className="errorMsg">{errors.previous_pol_nmbr}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>   
                                </Row>
                                <Row>
                                <Col sm={12}>
                                        <FormGroup>
                                            <div className="carloan">
                                                <h4> </h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                </Fragment> 
                                {/* : null} */}

                                    <div className="d-flex justify-content-left resmb">
                                        <Button className={`backBtn`} type="button"  onClick= {this.vehicleDetails.bind(this,productId)}>
                                            Back
                                        </Button> 
                                        <Button className={`proceedBtn`} type="submit"  >
                                            Continue
                                        </Button>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(TwoWheelerVerify));