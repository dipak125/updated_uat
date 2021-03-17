import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { setData } from "../../store/actions/data";
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
import swal from 'sweetalert';
import fuel from '../common/FuelTypes';
import {currentEndDate, prevEndDate} from "../../shared/reUseFunctions";
import {
    checkGreaterTimes,
    checkGreaterStartEndTimes, validRegistrationNumber
  } from "../../shared/validationFunctions";

const ageObj = new PersonAge();
let encryption = new Encryption();
// const maxRegnDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
const minRegnDate = moment().subtract(1, 'years').calendar();
const minDate = moment().subtract(1, 'years').calendar()
const maxDate = moment()

const ncbArr = {
    0:"0",
    20:"20",
    25:"25",
    35:"35",
    45:"45",
    50:"50"
}

const initialValue = {
    registration_date: "",
    location_id:"",
    previous_is_claim:'',
    address:"",
    insurance_company_id:"0",
    previous_policy_name:"1",
    previous_end_date: "",
    previous_start_date: "",
    previous_claim_bonus: "",
}
const vehicleRegistrationValidation = Yup.object().shape({
    registration_date: Yup.string().required('RegistrationRequired'), 

    location_id: Yup.string()
    .required(function() {
        return "CityRequired"
    })
    .matches(/^([0-9]*)$/, function() {
        return "No special Character allowed"
    }),

    previous_is_claim: Yup.string().when("policy_type_Id", {
        is: 1,       
        then: Yup.string(),
        otherwise: Yup.string()
            .test(
                "validRegistrationChecking",
                function() {
                    return "PleaseSPC"
                },
                function (value) {
                    if (this.parent.lapse_duration == '2' && this.parent.policy_type_Id == '3') {
                       return true
                    }
                    else if(value &&  value != '2') {
                        return true
                    }
                    else return false
            })
    }),

    previous_claim_bonus:Yup.string().when("previous_is_claim", {
        is: "0" ,       
        then: Yup.string().required('PleaseNCB'),
        othewise: Yup.string()
    }),

    previous_start_date:Yup.date().required('Previous Start date is required')
    .test(
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

    previous_end_date:Yup.date().required('Previous end date is required')
    .test( 
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

    insurance_company_id:Yup.number().required('Insurance company is required'),
    address:Yup.string().required('Previous city is required')
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,\s]*$/, 
            function() {
                return "Please enter valid address"
            }),

    previous_policy_no:Yup.string().required('Previous policy number is required')
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9\s-/]*$/, 
            function() {
                return "ValidPolicyNumber"
            }).min(6, function() {
                return "PolicyMinCharacter"
            })
            .max(28, function() {
                return "PolicyMaxCharacter"
            }),
   
});


class TwoWheelerVehicleDetailsOD extends Component {

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
        RTO_location: "",
        maxRegnDate: ""
    };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }
    onChange = (e, setFieldValue) => {
        setFieldValue('location_id', "")
      };

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    selectVehicleBrand = (productId) => {
        if(localStorage.getItem('brandEdit') == '1') {
            localStorage.setItem('newBrandEdit', 1)
        }
        else if(localStorage.getItem('brandEdit') == '2') {
            localStorage.setItem('newBrandEdit', '2')
        }
        this.props.history.push(`/two_wheeler_Select-brandOD/${productId}`);
    }

    selectBrand = (productId) => {
        this.props.history.push(`/two_wheeler_Select-brandOD/${productId}`);
    }

    editBrand = (productId) => {
        let brandEdit = {'brandEdit' : 1}
            this.props.setData(brandEdit)
            this.props.history.push(`/two_wheeler_Select-brandOD/${productId}`);     
    }

    showClaimText = (value) =>{
        if(value == 1){
            this.setState({
                showClaim:false,
                previous_is_claim:2
            })
        }
        else{
            this.setState({
                showClaim:true,
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
        //const input = newValue;
           // if (/^[a-zA-Z]+$/.test(input) || input === "") {
                this.setState({
                    CustomerID: newValue,
                    RTO_location: ""
                    });
            //}
        
    };
  
    getCustomerIDSuggestions(value) {
        const escapedValue = this.escapeRegexCharacters(value.trim());   
        if (escapedValue === '') {
            return [];
        }  
        const regex = new RegExp( escapedValue, 'i');
        if(this.state.customerDetails && escapedValue.length >1) {
            return this.state.customerDetails.filter(language => regex.test(language.RTO_LOCATION+" - "+language.NameCode));
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
    return suggestion.RTO_LOCATION+" - "+suggestion.NameCode;
  }
  
   renderCustomerIDSuggestion(suggestion) {
    return (
      <span>{suggestion.RTO_LOCATION+" - "+suggestion.NameCode}</span>
    );
  }
  //--------------------------------------------------------

    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params 
        const {motorInsurance} = this.state
        let newPolStartDate = prevEndDate(values.previous_start_date) 
        newPolStartDate = addDays(new Date(newPolStartDate), 1)        
        let newPolEndDate = prevEndDate(newPolStartDate)
        let vehicleAge = Math.floor(moment(newPolStartDate).diff(values.registration_date, 'months', true))
        let vehicleAgeDays = Math.floor(moment(newPolStartDate).diff(values.registration_date, 'days', true))
        let policy_type = 9
        // console.log("vehicleAge===", vehicleAgeDays)
        const formData = new FormData(); 
        let post_data = {}

            post_data = {
                'policy_holder_id':localStorage.getItem("policyHolder_id"),
                'menumaster_id':3,
                'registration_date':moment(values.registration_date).format("YYYY-MM-DD"),
                'location_id':values.location_id,
                'previous_is_claim':values.lapse_duration == '2' ? '2' : (values.previous_is_claim == 0 || values.previous_is_claim == 1 ? values.previous_is_claim : '2'),
                'previous_claim_bonus': values.previous_claim_bonus == "" ? "2" : values.previous_claim_bonus,      
                'prev_policy_flag': 1,
                'vehicleAge': vehicleAge,
                'pol_start_date': moment(newPolStartDate).format('YYYY-MM-DD'),
                'pol_end_date': moment(newPolEndDate).format('YYYY-MM-DD'),
                'policy_type':  policy_type,
                'page_name': `two_wheeler_Vehicle_detailsOD/${productId}`,
                'previous_start_date':moment(values.previous_start_date).format("YYYY-MM-DD"),
                'previous_end_date':moment(values.previous_end_date).format("YYYY-MM-DD"),
                'policy_no': values.previous_policy_no,
                'previous_policy_name':values.previous_policy_name,
                'insurance_company_id':values.insurance_company_id,
                'address':values.address,
            }
        
        console.log('post_data', post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios
        .post(`/two-wh-stal/vehicle-details`, formData)
        .then(res => { 
            this.props.loadingStop();
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp-----', decryptResp)
            if(decryptResp.error == false){
                this.props.history.push(`/two_wheeler_OtherComprehensiveOD/${productId}`);
            }
            else{
                actions.setSubmitting(false)
                swal(decryptResp.msg)
            }
            
        })
        .catch(err => {
          this.props.loadingStop();
          actions.setSubmitting(false)
          let decryptResp = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptResp-----', decryptResp)
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
        axios.get(`location-list/${localStorage.getItem("policyHolder_id")}`)
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
        this.props.loadingStart();
        axios.get(`two-wh-stal/details/${localStorage.getItem("policyHolder_refNo")}`)
            .then(res => {
                 let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log('decryptResp_fetchData', decryptResp)
                 let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {};
                 let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                 let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                 let RTO_location = motorInsurance && motorInsurance.location && motorInsurance.location.RTO_LOCATION ? motorInsurance.location.RTO_LOCATION+" - "+motorInsurance.location.NameCode : ""
                //  let maxRegnDate= motorInsurance && motorInsurance.policytype_id == '1' ? moment() 
                //         : (motorInsurance && motorInsurance.policytype_id == '2' ? moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar() 
                //         : (motorInsurance && motorInsurance.policytype_id == '3' && motorInsurance.lapse_duration == '1' ? previousPolicy && previousPolicy.start_date ? moment(previousPolicy.start_date) : moment(moment().subtract(1, 'years')).subtract(1, 'day').calendar() : moment(moment().subtract(1, 'years')).subtract(2, 'day').calendar())) 
                
                let maxRegnDate= motorInsurance && motorInsurance.policytype_id == '1' ? moment() 
                :  moment(moment().subtract(1, 'years').calendar()).add(3, 'months').calendar() 
                
                this.setState({
                    motorInsurance, previousPolicy, vehicleDetails,RTO_location, maxRegnDate
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
            CustomerID,suggestions, vehicleDetails, RTO_location, maxRegnDate} = this.state

        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        let newInitialValues = Object.assign(initialValue, {
            registration_date: motorInsurance && motorInsurance.registration_date ? new Date(motorInsurance.registration_date) : "",
            location_id:  motorInsurance && motorInsurance.location_id ? motorInsurance.location_id : "",
            previous_start_date: previousPolicy && previousPolicy.start_date ? new Date(previousPolicy.start_date) : "",
            previous_end_date: previousPolicy && previousPolicy.end_date ? new Date(previousPolicy.end_date) : "",
            // insurance_company_id: previousPolicy && previousPolicy.insurancecompany && previousPolicy.insurancecompany.id ? previousPolicy.insurancecompany.id : "",
            address: previousPolicy && previousPolicy.address ? previousPolicy.address : "",
            previous_is_claim: previousPolicy && (previousPolicy.is_claim == 0 || previousPolicy.is_claim == 1) ? previousPolicy.is_claim : "",
            previous_claim_bonus: previousPolicy && ncbArr[previousPolicy.claim_bonus]  && previousPolicy.claim_bonus != 2 ? Math.floor(previousPolicy.claim_bonus) : "",
            policy_type_Id : motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : "0",
            lapse_duration: motorInsurance && motorInsurance.lapse_duration ? motorInsurance.lapse_duration : "",
            previous_policy_no : previousPolicy && previousPolicy.policy_no ? previousPolicy.policy_no : "",
            insurance_company_id: previousPolicy && previousPolicy.insurancecompany_id ? previousPolicy.insurancecompany_id : "",
        });


        const inputCustomerID = {
            placeholder: phrases['SearchCity'],
            value: CustomerID ? CustomerID : RTO_location,
            onChange: this.onChangeCustomerID
          };
          

        return (
            <>
                <BaseComponent>
                <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                        <SideNav />
                    </div>
                <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                <section className="brand m-b-25">
                    <div className="d-flex justify-content-left">
                        <div className="brandhead">
                            <h4 className="fs-18 m-b-30">{phrases['PleaseVehicleDetails']}</h4>
                        </div>
                    </div>
                    <div className="brand-bg">
                        <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} 
                        validationSchema={vehicleRegistrationValidation}
                        >
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                return (
                                    <Form>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

                                                <Row>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                            {phrases['FirstRegDate']}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                   
                                                    <Col sm={12} md={11} lg={4}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="registration_date"
                                                                minDate={new Date(minRegnDate)}
                                                                maxDate={new Date(maxRegnDate)}
                                                                autoComplete="off"
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText={phrases['RegDate']}
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.registration_date}
                                                                onChange={(val) => {
                                                                    setFieldTouched('registration_date');
                                                                    setFieldValue('registration_date', val); 
                                                                }}
                                                                
                                                            />
                                                            {errors.registration_date && touched.registration_date ? (
                                                                <span className="errorMsg">{phrases[errors.registration_date]}</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                            {phrases['RegCity']}
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
                                                                onChange={e=>this.onChange(e,setFieldValue)}
                                                                onSuggestionSelected={(e, {suggestion,suggestionValue}) => {
                                                                    setFieldTouched('location_id')
                                                                    setFieldValue("location_id", suggestion.id)    
                                                                    }}
                                                                />
                                                                {errors.location_id && touched.location_id ? (
                                                                    <span className="errorMsg">{phrases[errors.location_id]}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                
                                            <Row>&nbsp;</Row>
                                            
                                            {(motorInsurance && motorInsurance.policytype_id && motorInsurance.policytype_id == '2') || 
                                            (motorInsurance && motorInsurance.policytype_id && motorInsurance.policytype_id == '3' && 
                                            motorInsurance && motorInsurance.lapse_duration == '1' ) ?
                                                <Fragment>
                                                <Row>
                                                    <Col sm={12}>
                                                        <FormGroup>
                                                            <div className="carloan">
                                                                <h4> {phrases['APD']}</h4>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={12} md={11} lg={3}>
                                                        <FormGroup>

                                                            <DatePicker
                                                                name="previous_start_date"
                                                                minDate={new Date(minDate)}
                                                                maxDate={new Date(maxDate)}
                                                                autoComplete="off"
                                                                dateFormat="dd MMM yyyy"
                                                                disabledKeyboardNavigation
                                                                openToDate={new Date(minDate)}
                                                                placeholderText={phrases['APSD']}
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.previous_start_date}
                                                                onChange={(val) => {
                                                                    setFieldValue('previous_start_date', val);
                                                                    setFieldValue("previous_end_date", currentEndDate(val));
                                                                    
                                                                    // setFieldValue("previous_end_date", addDays(new Date(val), 364));
                                                                }}
                                                            />
                                                            {errors.previous_start_date && touched.previous_start_date ? (
                                                                <span className="errorMsg">{phrases[errors.previous_start_date]}</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={11} lg={3}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="previous_end_date"
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText={phrases['APED']}
                                                                autoComplete="off"
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
                                                                <span className="errorMsg">{phrases[errors.previous_end_date]}</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={5} lg={5}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="previous_policy_no"
                                                                    type="text"
                                                                    maxLength="28"
                                                                    placeholder={phrases['APolicyNumber']}
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    
                                                                />
                                                                {errors.previous_policy_no && touched.previous_policy_no ? (
                                                                    <span className="errorMsg">{phrases[errors.previous_policy_no]}</span>
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
                                                            <option value="">{phrases['SelectInsurer']}</option>
                                                            {insurerList.map((insurer, qIndex) => ( 
                                                                <option value= {insurer.Id}>{insurer.name}</option>
                                                            ))}
                                                        </Field>     
                                                        {errors.insurance_company_id && touched.insurance_company_id ? (
                                                        <span className="errorMsg">{phrases[errors.insurance_company_id]}</span>
                                                        ) : null}          
                                                        </div>
                                                    </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={5} lg={5}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="address"
                                                                    type="text"
                                                                    placeholder={phrases['AInsurerAddress']}
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    
                                                                />
                                                                {errors.address && touched.address ? (
                                                                    <span className="errorMsg">{phrases[errors.address]}</span>
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
                                            : null}

                                            {(motorInsurance && motorInsurance.policytype_id && motorInsurance.policytype_id == '2') || 
                                            (motorInsurance && motorInsurance.policytype_id && motorInsurance.policytype_id == '3' && 
                                             motorInsurance && motorInsurance.lapse_duration == '1' ) ?
                                                <Fragment>
                                                <Row>
                                                    <Col sm={12}>
                                                        <FormGroup>
                                                            <div className="carloan">
                                                                <h4>{phrases['CurrentPolicyClaim']}</h4>
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
                                                                            setFieldTouched('previous_is_claim')
                                                                            setFieldValue(`previous_is_claim`, e.target.value);
                                                                            this.showClaimText(0);
                                                                        }}
                                                                        checked={values.previous_is_claim == '0' ? true : false}
                                                                    />
                                                                        <span className="checkmark " /><span className="fs-14">{phrases['NoIHavent']}</span>
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
                                                                            setFieldTouched('previous_is_claim')
                                                                            setFieldValue(`previous_is_claim`, e.target.value);
                                                                            setFieldTouched('previous_claim_bonus')
                                                                            setFieldValue(`previous_claim_bonus`, "");
                                                                            this.showClaimText(1);
                                                                        }}
                                                                        checked={values.previous_is_claim == '1' ? true : false}
                                                                    />
                                                                        <span className="checkmark" />
                                                                        <span className="fs-14">{phrases['YesIHave']}</span>
                                                                    </label>
                                                                    {errors.previous_is_claim && touched.previous_is_claim ? (
                                                                    <span className="errorMsg">{phrases[errors.previous_is_claim]}</span>
                                                                ) : null}
                                                                </div>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            {showClaim || values.previous_is_claim == "0" ? 
                                            <Fragment>
                                                <Row>
                                                    <Col sm={12}>
                                                        <FormGroup>
                                                            <div className="carloan">
                                                            {phrases['NCBCurrentPolicy']}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row className="m-b-40">
                                                    <Col sm={12} md={6} lg={6}>
                                                    <FormGroup>
                                                            <div className="d-inline-flex m-b-35">
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='previous_claim_bonus'                                            
                                                                        value='0'
                                                                        key='1'  
                                                                        checked = {values.previous_claim_bonus == '0' ? true : false}
                                                                    />
                                                                        <span className="checkmark " /><span className="fs-14"> 0</span>
                                                                    </label>
                                                                </div>
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='previous_claim_bonus'                                            
                                                                        value='20'
                                                                        key='1'  
                                                                        checked = {values.previous_claim_bonus == '20' ? true : false}
                                                                    />
                                                                        <span className="checkmark " /><span className="fs-14"> 20</span>
                                                                    </label>
                                                                </div>
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='previous_claim_bonus'                                            
                                                                        value='25'
                                                                        key='1'  
                                                                        checked = {values.previous_claim_bonus == '25' ? true : false}
                                                                    />
                                                                        <span className="checkmark " /><span className="fs-14"> 25</span>
                                                                    </label>
                                                                </div>
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='previous_claim_bonus'                                            
                                                                        value='35'
                                                                        key='1'  
                                                                        checked = {values.previous_claim_bonus == '35' ? true : false}
                                                                    />
                                                                        <span className="checkmark " /><span className="fs-14"> 35</span>
                                                                    </label>
                                                                </div>
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='previous_claim_bonus'                                            
                                                                        value='45'
                                                                        key='1'  
                                                                        checked = {values.previous_claim_bonus == '45' ? true : false}
                                                                    />
                                                                        <span className="checkmark " /><span className="fs-14"> 45</span>
                                                                    </label>
                                                                </div>

                                                                <div className="">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='previous_claim_bonus'                                            
                                                                        value='50'
                                                                        key='1'  
                                                                        checked = {values.previous_claim_bonus == '50' ? true : false}
                                                                    />
                                                                        <span className="checkmark" />
                                                                        <span className="fs-14">50</span>
                                                                    </label>                                      
                                                                </div>     
                                                            </div>
                                                            {errors.previous_claim_bonus && touched.previous_claim_bonus ? (
                                                                    <span className="errorMsg">{phrases[errors.previous_claim_bonus]}</span>
                                                                ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            </Fragment>
                                            : null} 
                                            </Fragment> : null }
                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.selectBrand.bind(this,productId)}>
                                                    {isSubmitting ? phrases['Wait..'] : phrases['Back']}
                                                </Button> 
                                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                    {isSubmitting ? phrases['Wait..'] : phrases['Next']}
                                                </Button> 
                                                </div>

                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="vehbox">
                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">{phrases['RegNo']}.<br />
                                                            {motorInsurance && motorInsurance.registration_no}</div>
                                                        </Col>

                                                        <Col sm={12} md={5} className="text-right">
                                                            <button className="rgistrBtn" type="button" onClick={this.selectBrand.bind(this, productId)}>{phrases['Edit']}</button>
                                                        </Col>
                                                    </Row>

                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">{phrases['TwoWheelBrand']}<br/>
                                                                <strong>{vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : ""}</strong></div>
                                                        </Col>

                                                        <Col sm={12} md={5} className="text-right">
                                                            <button className="rgistrBtn" type="button" onClick= {this.editBrand.bind(this,productId)}>{phrases['Edit']}</button>
                                                        </Col>
                                                    </Row>

                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">{phrases['TwoWheelModel']}<br/>
                                                                <strong>{vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : ""}</strong></div>
                                                        </Col>

                                                        <Col sm={12} md={5} className="text-right">
                                                            <button className="rgistrBtn" type="button" onClick= {this.selectVehicleBrand.bind(this,productId)}>{phrases['Edit']}</button>
                                                        </Col>
                                                    </Row>

                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">{phrases['Fuel']}<br/>
                                                                <strong>{vehicleDetails && vehicleDetails.varientmodel && fuel[Math.floor(vehicleDetails.varientmodel.fuel_type)]} </strong></div>
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
      loading: state.loader.loading,
      data: state.processData.data
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop()),
      setData: (data) => dispatch(setData(data))
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(TwoWheelerVehicleDetailsOD));