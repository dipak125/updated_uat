import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
// import ReactTooltip from "react-tooltip";
import * as Yup from 'yup';
import { Formik, Field, Form, FieldArray } from "formik";
import axios from "../../shared/axios"
import moment from "moment";
import Encryption from '../../shared/payload-encryption';
import {  PersonAge } from "../../shared/dateFunctions";
import Autosuggest from 'react-autosuggest';
import { addDays } from 'date-fns';
import {
    checkGreaterTimes,
    checkGreaterStartEndTimes
  } from "../../shared/validationFunctions";

const ageObj = new PersonAge();
const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
const minRegnDate = moment().subtract(18, 'years').calendar();

const initialValue = {
    registration_date: "",
    location_id:"",
    previous_is_claim:"",
    previous_city:"",
    insurance_company_id:"",
    previous_policy_name:"",
    previous_end_date: "",
    previous_start_date: "",
    previous_claim_bonus: "",
    previous_claim_for: ""
}
const vehicleRegistrationValidation = Yup.object().shape({
    registration_date: Yup.string().required('Registration date is required'),
    location_id:Yup.string().required('Registration city is required'),

    previous_start_date:Yup.date()
    .notRequired('Previous Start date is required')
    .test(
        "currentMonthChecking",
        function() {
            return "Please enter Start date"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {   
                return false;    
            }
            return true;
        }
    ).test(
        "checkGreaterTimes",
        "Start date must be less than end date",
        function (value) {
            if (value) {
                return checkGreaterStartEndTimes(value, this.parent.previous_end_date);
            }
            return true;
        }
    ).test(
      "checkStartDate",
      "Enter Start Date",
      function (value) {       
          if ( this.parent.previous_end_date != undefined && value == undefined) {
              return false;
          }
          return true;
      }
    ),
    previous_end_date:Yup.date()
    .notRequired('Previous end date is required')
    .test(
        "currentMonthChecking",
        function() {
            return "Please enter end date"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {   
                return false;    
            }
            return true;
        }
    ).test( 
        "checkGreaterTimes",
        "End date must be greater than start date",
        function (value) {
            if (value) {
                return checkGreaterTimes(value, this.parent.previous_start_date);
            }
            return true;
        }
        ).test(
        "checkEndDate",
        "Enter End Date",
        function (value) {     
            if ( this.parent.previous_start_date != undefined && value == undefined) {
                return false;
            }
            return true;
        }
    ),
    previous_policy_name:Yup.string()
    .notRequired('Policy name is required')
    .test(
        "currentMonthChecking",
        function() {
            return "Please enter previous policy type"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 6 && !value) {   
                return false;    
            }
            return true;
        }
    ),
    insurance_company_id:Yup.number()
    .notRequired('Insurance company is required')
    .test(
        "currentMonthChecking",
        function() {
            return "Please enter previous insurance company"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {   
                return false;    
            }
            return true;
        }
    ),
    previous_city:Yup.string()
    .notRequired('Previous city is required')
    .test(
        "currentMonthChecking",
        function() {
            return "Please enter previous insurance company city"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {   
                return false;    
            }
            return true;
        }
    ),
    previous_claim_bonus:Yup.mixed()
    .notRequired('No Claim bonus is required')
    .test(
        "currentMonthChecking",
        function() {
            return "Please enter previous claim bonus"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {   
                return false;    
            }
            return true;
        }
    ),
    previous_is_claim:Yup.mixed()
    .notRequired('Please select one option')
    .test(
        "currentMonthChecking",
        function() {
            return "Please select if you have previous claim"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {   
                return false;    
            }
            return true;
        }
    )
   
});

const fuel = {
    1: 'Petrol',
    2: 'Diesel'
}


class VehicleDetails extends Component {

    state = {
        insurerList: [],
        showClaim: false,
        previous_is_claim: "",
        motorInsurance:{},
        previousPolicy: {},
        CustomerID: '',  
        suggestions: [],
        customerDetails: [],
        selectedCustomerRecords: [],
        CustIdkeyword: "",
    };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    selectBrand = (productId) => {
        this.props.history.push(`/Select-brand/${productId}`);
    }

    showClaimText = (value) =>{
        if(value == 1){
            this.setState({
                showClaim:true,
                previous_is_claim:1
            })
        }
        else{
            this.setState({
                showClaim:false,
                previous_is_claim:0
            })
        }
    }

      // ----------------AddressId------------
    onSuggestionsClearRequested = () => {
    this.setState({
        suggestions: []   
    });
    };

    escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    

    onChangeCustomerID = (event, { newValue, method }) => {
        this.setState({
        CustomerID: newValue
        });
    };
  
   getCustomerIDSuggestions(value) {
    const escapedValue = this.escapeRegexCharacters(value.trim());   
    if (escapedValue === '') {
      return [];
    }  
    const regex = new RegExp('^' + escapedValue, 'i');
    if(this.state.customerDetails) {
      return this.state.customerDetails.filter(language => regex.test(language.RTO_LOCATION));
    }
    else return 0;
    
  }
  
  onSuggestionsFetchCustomerID = ({ value }) => {
    this.setState({
      suggestions: this.getCustomerIDSuggestions(value)
    });
  };

   getCustomerIDSuggestionValue = (suggestion) => {
    this.setState({
      selectedCustomerRecords: suggestion
    });
    return suggestion.RTO_LOCATION;
  }
  
   renderCustomerIDSuggestion(suggestion) {
    return (
      <span>{suggestion.RTO_LOCATION}</span>
    );
  }
  //--------------------------------------------------------

    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params 
        values.previous_policy_name ? localStorage.setItem('policy_type', values.previous_policy_name) 
        : localStorage.setItem('policy_type', 6)
        const formData = new FormData(); 
        let encryption = new Encryption();
        let post_data = {}
        if(ageObj.whatIsCurrentMonth(values.registration_date) > 0) {
            post_data = {
                'policy_holder_id':localStorage.getItem('policyHolder_id'),
                'menumaster_id':1,
                'registration_date':moment(values.registration_date).format("YYYY-MM-DD"),
                'location_id':values.location_id,
                'previous_start_date':moment(values.previous_start_date).format("YYYY-MM-DD"),
                'previous_end_date':moment(values.previous_end_date).format("YYYY-MM-DD"),
                'previous_policy_name':localStorage.getItem('policy_type'),
                'insurance_company_id':values.insurance_company_id,
                'previous_city':'11',
                'previous_is_claim':values.previous_is_claim,
                'previous_claim_bonus': values.previous_claim_bonus,
                'previous_claim_for': values.previous_claim_for,             
                
            } 
        }
        else if(ageObj.whatIsCurrentMonth(values.registration_date) == 0)  {
            post_data = {
                'policy_holder_id':localStorage.getItem('policyHolder_id'),
                'menumaster_id':1,
                'registration_date':moment(values.registration_date).format("YYYY-MM-DD"),
                'location_id':values.location_id,    
                'previous_is_claim':'0', 
            } 
        }
        console.log('post_data', post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios
        .post(`/insert-vehicle-details`, formData)
        .then(res => { 
            this.props.loadingStop();
            if(res.data.error == false){
                this.props.history.push(`/OtherComprehensive/${productId}`);
            }
            else{
                actions.setSubmitting(false)
            }
            
        })
        .catch(err => {
          this.props.loadingStop();
          actions.setSubmitting(false)
        });
    }

    getInsurerList = () => {
        this.props.loadingStart();
        axios
          .get(`/company`)
          .then(res => {
            this.setState({
                insurerList: res.data.data
            });
            this.getAllAddress()
          })
          .catch(err => {
            this.setState({
                insurerList: []
            });
            this.props.loadingStop();
          });
    }

    getAllAddress() {
        axios.get('location-list ')
          .then(res => {
            this.setState({
              customerDetails: res.data.data
            });
            this.props.loadingStop();
          })
          .catch(err => {
            this.props.loadingStop();
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
                this.setState({
                    motorInsurance, previousPolicy, vehicleDetails
                })
                this.props.loadingStop();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    handleChange =(value) => {
        let endDate = moment(value).add(1, 'years').format("YYYY-MM-DD")
        this.setState({
            EndDate: endDate,
            endDateFlag: true,
            serverResponse: [],
            error: []
        }) 
    }

    componentDidMount() {
        this.getInsurerList();
        this.fetchData();
        
    }

    render() {
        const {productId} = this.props.match.params  
        const {insurerList, showClaim, previous_is_claim, motorInsurance, previousPolicy,
            CustomerID,suggestions, vehicleDetails} = this.state

        let newInitialValues = Object.assign(initialValue, {
            registration_date: motorInsurance && motorInsurance.registration_date ? new Date(motorInsurance.registration_date) : "",
            location_id:  motorInsurance && motorInsurance.location_id ? motorInsurance.location_id : "",
            previous_start_date: previousPolicy && previousPolicy.start_date ? new Date(previousPolicy.start_date) : "",
            previous_end_date: previousPolicy && previousPolicy.end_date ? new Date(previousPolicy.end_date) : "",
            // previous_policy_name: previousPolicy && previousPolicy.insurancecompany.ty ? previousPolicy.insurancecompany.ty : "",
            // insurance_company_id: previousPolicy && previousPolicy.insurancecompany.id ? previousPolicy.insurancecompany.id : "",
            previous_city: previousPolicy && previousPolicy.city ? previousPolicy.city : "",
            previous_is_claim: previousPolicy && previousPolicy.is_claim ? previousPolicy.is_claim : "",
            previous_claim_bonus: previousPolicy && previousPolicy.claim_bonus ? previousPolicy.claim_bonus : "",
            previous_claim_for: previousPolicy && previousPolicy.claim_for ? previousPolicy.claim_for : "",

        });

        const inputCustomerID = {
            placeholder: "Search City",
            value: CustomerID,
            onChange: this.onChangeCustomerID
          };
          
console.log("newInitialValues", newInitialValues)

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
                        </div>
                    </div>
                    <div className="brand-bg">
                        <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} validationSchema={vehicleRegistrationValidation}>
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                return (
                                    <Form>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

                                                <Row>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                                First Purchase/Registration Date
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                   
                                                    <Col sm={12} md={11} lg={4}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="registration_date"
                                                                minDate={new Date(minRegnDate)}
                                                                maxDate={new Date()}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Registration Date"
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.registration_date}
                                                                onChange={(val) => {
                                                                    setFieldTouched('previous_policy_name');
                                                                    setFieldValue('registration_date', val); 
                                                                }}
                                                                
                                                            />
                                                            {errors.registration_date && touched.registration_date ? (
                                                                <span className="errorMsg">{errors.registration_date}</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                                Registration City
                                                         </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Autosuggest 
                                                                suggestions={suggestions}
                                                                onSuggestionsFetchRequested={this.onSuggestionsFetchCustomerID}
                                                                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                                                getSuggestionValue={this.getCustomerIDSuggestionValue }
                                                                shouldRenderSuggestions={this.customerIDRender}
                                                                renderSuggestion={this.renderCustomerIDSuggestion}
                                                                inputProps={inputCustomerID} 
                                                                onSuggestionSelected={(e, {suggestion,suggestionValue}) => {
                                                                    setFieldTouched('location_id')
                                                                    setFieldValue("location_id", suggestion.id)    
                                                                    }}
                                                                />
                                                                {errors.location_id && touched.location_id ? (
                                                                    <span className="errorMsg">{errors.location_id}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            {ageObj.whatIsCurrentMonth(values.registration_date) > 0 ?
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
                                                                maxDate={new Date()}
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
                                                                    value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.previous_policy_name}
                                                                    disabled = {ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? true : false}
                                                                >
                                                                    <option value="">Select Policy Type</option>
                                                                    <option value="1">Package</option>
                                                                    <option value="2">Liability Only</option>  
                                                                    <option value="6" > Bundled Product</option>
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
                                                    <Col sm={12}>
                                                        <FormGroup>
                                                            <div className="carloan">
                                                                <h4>Have you made a claim in your existing Policy</h4>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={4}>
                                                        <FormGroup>
                                                            <div className="d-inline-flex m-b-35">
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='previous_is_claim'                                            
                                                                        value='0'
                                                                        key='1'  
                                                                        onChange={(e) => {
                                                                            setFieldValue(`previous_is_claim`, e.target.value);
                                                                            this.showClaimText(0);
                                                                        }}
                                                                        checked={values.previous_is_claim == '0' ? true : false}
                                                                    />
                                                                        <span className="checkmark " /><span className="fs-14"> No, I haven't</span>
                                                                    </label>
                                                                </div>

                                                                <div className="">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='previous_is_claim'                                            
                                                                        value='1'
                                                                        key='1'  
                                                                        onChange={(e) => {
                                                                            setFieldValue(`previous_is_claim`, e.target.value);
                                                                            this.showClaimText(1);
                                                                        }}
                                                                        checked={values.previous_is_claim == '1' ? true : false}
                                                                    />
                                                                        <span className="checkmark" />
                                                                        <span className="fs-14">Yes I have</span>
                                                                    </label>
                                                                    {errors.previous_is_claim && touched.previous_is_claim ? (
                                                                    <span className="errorMsg">{errors.previous_is_claim}</span>
                                                                ) : null}
                                                                </div>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            {showClaim || previous_is_claim == 1 ?
                                                <Row className="m-b-30">
                                                    <Col sm={12} md={5} lg={5}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                            You have claimed for
                                                       </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name='previous_claim_for'
                                                                    component="select"
                                                                    autoComplete="off"                                                                        
                                                                    className="formGrp"
                                                                    value = {values.previous_claim_for}
                                                                >
                                                                    <option value="">--Select--</option>
                                                                    <option value="1">Own Damage</option>
                                                                    <option value="2">Liability</option>
                                                                </Field>     
                                                                {errors.previous_claim_for && touched.previous_claim_for ? (
                                                                <span className="errorMsg">{errors.previous_claim_for}</span>
                                                                ) : null}       
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            : null }
                                                <Row className="m-b-30">
                                                    <Col sm={12} md={5} lg={5}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                                Current No Claim Bonus
                                                       </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name='previous_claim_bonus'
                                                                    component="select"
                                                                    autoComplete="off"                                                                        
                                                                    className="formGrp"
                                                                    value = {values.previous_claim_bonus}
                                                                >
                                                                    <option value="">--Select--</option>
                                                                    <option value="0">0</option>
                                                                    <option value="20">20</option>
                                                                    <option value="25">25</option>
                                                                    <option value="35">35</option>
                                                                    <option value="45">45</option>
                                                                    <option value="50">50</option>
                                                                </Field>     
                                                                {errors.previous_claim_bonus && touched.previous_claim_bonus ? (
                                                                <span className="errorMsg">{errors.previous_claim_bonus}</span>
                                                                ) : null}       
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                </Fragment> : null }
                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.selectBrand.bind(this,productId)}>
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </Button> 
                                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                    {isSubmitting ? 'Wait..' : 'Next'}
                                                </Button> 
                                                </div>

                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="vehbox">
                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">Registration No.<br />
                                                            {motorInsurance && motorInsurance.registration_no}</div>
                                                        </Col>

                                                        <Col sm={12} md={5} className="text-right">
                                                            <button className="rgistrBtn">Edit</button>
                                                        </Col>
                                                    </Row>

                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">Car Brand<br/>
                                                                <strong>{vehicleDetails && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : ""}</strong></div>
                                                        </Col>

                                                        <Col sm={12} md={5} className="text-right">
                                                            <button className="rgistrBtn">Edit</button>
                                                        </Col>
                                                    </Row>

                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">Car Model<br/>
                                                                <strong>{vehicleDetails && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : ""}</strong></div>
                                                        </Col>

                                                        <Col sm={12} md={5} className="text-right">
                                                            <button className="rgistrBtn">Edit</button>
                                                        </Col>
                                                    </Row>

                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">Fuel Type<br/>
                                                                <strong>{vehicleDetails && fuel[vehicleDetails.varientmodel.fuel_type]} </strong></div>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Form>
                                );
                            }}
                        </Formik>
                    </div>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(VehicleDetails));