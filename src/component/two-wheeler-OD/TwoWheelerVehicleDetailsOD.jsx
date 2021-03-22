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
let maxRegnDate=  moment(moment().subtract(1, 'years').calendar()).add(3, 'months').calendar() 
const activeMinDate =  moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
const minRegnDate = moment(moment().subtract(1, 'years').calendar()).add(0, 'day').calendar();
const minDate =  moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
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
    previous_city:"",
    insurance_company_id:"0",
    previous_policy_name:"1",
    previous_end_date: "",
    previous_start_date: "",
    previous_claim_bonus: "",
}
const vehicleRegistrationValidation = Yup.object().shape({
    registration_date: Yup.string().required('RegistrationRequired')
    .test(
        "checkGreaterTimes",
        "RegistrationLessPrevious",
        function (value) {
            if (value) {
                return checkGreaterStartEndTimes(value, this.parent.previous_start_date);
            }
            return true;
        }
    )
    .test(
        "checkGreaterTimes",
        "RegistrationLessActive",
        function (value) {
            if (value) {
                return checkGreaterStartEndTimes(value, this.parent.active_start_date);
            }
            return true;
        }
    ),

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
                    if(value &&  value != '2') {
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

    previous_start_date:Yup.date().required('PleaseESD')
    .test(
        "checkGreaterTimes",
        "StartDateLessEnd",
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

    previous_end_date:Yup.date().required('PleaseEED')
    .test( 
        "checkGreaterTimes",
        "EndDateGreaterStart",
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

    insurance_company_id:Yup.number().required('PleaseEPIC'),
    previous_city:Yup.string().required('PleaseEPICC')
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,\s]*$/, 
            function() {
                return "PleaseValidAddress"
            }),

    previous_policy_no:Yup.string().required('PleaseEPPN')
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9\s-/]*$/, 
            function() {
                return "ValidPolicyNumber"
            }).min(6, function() {
                return "PolicyMinCharacter"
            })
            .max(28, function() {
                return "PolicyMaxCharacter"
            }),

    active_policy_name:Yup.string()
    .required("PleaseSPT")
    .test(
        "currentMonthChecking",
        function() {
            return "ActivePolLiability"
        },
        function (value) {
            if (value == '1' ) {   
                return false;    
            }
            return true;
        }
    ),
    active_start_date:Yup.date()
    .notRequired()
    .test(
        "currentMonthChecking",
        function() {
            return "PleaseESD"
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
        "StartDateLessEnd",
        function (value) {
            if (value) {
                return checkGreaterStartEndTimes(value, this.parent.active_end_date);
            }
            return true;
        }
    ).test(
        "checkStartDate",
        "PleaseESD",
        function (value) {       
            if ( this.parent.active_end_date != undefined && value == undefined) {
                return false;
            }
            return true;
        }
    ),
    active_end_date:Yup.date()
    .notRequired('Previous end date is required')
    .test(
        "currentMonthChecking",
        function() {
            return "PleaseEED"
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
        function() {
            return "EndDateGreaterStart"
        },
        function (value) {
            if (value) {
                return checkGreaterTimes(value, this.parent.active_start_date);
            }
            return true;
        }
        ).test(
        "checkEndDate",
        "PleaseEED",
        function (value) {     
            if ( this.parent.active_start_date != undefined && value == undefined) {
                return false;
            }
            return true;
        }
    ),

    active_insurance_company_id:Yup.number()
    .notRequired('Insurance company is required')
    .test(
        "currentMonthChecking",
        function() {
            return "PleaseEAIC"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {   
                return false;    
            }
            return true;
        }
    ),
    active_policy_address:Yup.string()
    .notRequired('Previous city is required')
    .test(
        "currentMonthChecking",
        function() {
            return "PleaseEAICC"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {   
                return false;    
            }
            return true;
        }
    )
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,\s]*$/, 
        function() {
            return "PleaseValidAddress"
        }),

    active_policy_no:Yup.string()
    .notRequired('Previous policy number is required')
    .test(
        "currentMonthChecking",
        function() {
            return "PleaseEAPN"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {   
                return false;    
            }
            return true;
        }
    )
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9\s-/]*$/, 
        function() {
            return "PleasePolicyNumber"
        }).min(6, function() {
            return "PolicyMinCharacter"
        })
        .max(28, function() {
            return "PolicyNo18Char"
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
        maxRegnDate: "",
        location_reset_flag: 0,
        changeFlag: 0,
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
            let location_reset_flag = this.state.motorInsurance && this.state.motorInsurance.location_id ? 1 : 0
                this.setState({
                    CustomerID: newValue,
                    RTO_location: "",
                    location_reset_flag,
                    changeFlag: 1
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
      
    SuggestionSelected = (setFieldTouched,setFieldValue,suggestion) => {
        this.setState({
            changeFlag: 0, 
        });
        setFieldTouched('location_id')
        setFieldValue("location_id", suggestion.id)
    }
  
    onSuggestionsFetchCustomerID = ({ value }) => {
        this.setState({
        suggestions: this.getCustomerIDSuggestions(value)
        });
    };

   getCustomerIDSuggestionValue = (suggestion) => {
    this.setState({
      selectedCustomerRecords: suggestion, changeFlag: 0,
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
        const {motorInsurance,changeFlag} = this.state
        let newPolStartDate = prevEndDate(values.previous_start_date) 
        newPolStartDate = addDays(new Date(newPolStartDate), 1)        
        let newPolEndDate = prevEndDate(newPolStartDate)
        let vehicleAge = Math.floor(moment(newPolStartDate).diff(values.registration_date, 'months', true))
        let policy_type = 9
        const formData = new FormData(); 
        let post_data = {}

        // if(changeFlag == 1) {
        //     swal("Registration city is required")
        //     return false
        // }

            post_data = {
                'policy_holder_id':localStorage.getItem("policyHolder_id"),
                'menumaster_id':3,
                'registration_date':moment(values.registration_date).format("YYYY-MM-DD"),
                'location_id':values.location_id,
                'previous_start_date':moment(values.previous_start_date).format("YYYY-MM-DD"),
                'previous_end_date':moment(values.previous_end_date).format("YYYY-MM-DD"),
                'previous_policy_name':values.previous_policy_name,
                'insurance_company_id':values.insurance_company_id,
                'previous_city':values.previous_city,
                'previous_policy_no': values.previous_policy_no,
                'previous_is_claim':values.previous_is_claim ? values.previous_is_claim : '0' ,
                'previous_claim_bonus': values.previous_claim_bonus == "" ? "2" : values.previous_claim_bonus,
                'previous_claim_for': values.previous_claim_for,        
                'vehicleAge': vehicleAge,
                'pol_start_date': moment(newPolStartDate).format('YYYY-MM-DD'),
                'pol_end_date': moment(newPolEndDate).format('YYYY-MM-DD'),
                'policy_type': policy_type,
                'prev_policy_flag': 1,
                'active_start_date': moment(values.active_start_date).format("YYYY-MM-DD"),
                'active_end_date': moment(values.active_end_date).format("YYYY-MM-DD"),
                'active_policy_name': values.active_policy_name,
                'active_insurance_company_id': values.active_insurance_company_id,
                'active_policy_address': values.active_policy_address,
                'active_policy_no': values.active_policy_no,
                'page_name': `two_wheeler_Vehicle_detailsOD/${productId}`,
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
        axios.get(`two-wh-stal/policy-holder/motor-saod/${localStorage.getItem("policyHolder_refNo")}`)
            .then(res => {
                 let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log('decryptResp_fetchData', decryptResp)
                 let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {};
                 let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicyforsaod : {};
                 let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                 let RTO_location = motorInsurance && motorInsurance.location && motorInsurance.location.RTO_LOCATION ? motorInsurance.location.RTO_LOCATION+" - "+motorInsurance.location.NameCode : ""

                this.setState({
                    motorInsurance, previousPolicy, vehicleDetails,RTO_location
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
            CustomerID,suggestions, vehicleDetails, RTO_location, location_reset_flag} = this.state

        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        let newInitialValues = Object.assign(initialValue, {
            registration_date: motorInsurance && motorInsurance.registration_date ? new Date(motorInsurance.registration_date) : "",
            location_id:  motorInsurance && motorInsurance.location_id && location_reset_flag == 0 ? motorInsurance.location_id : "",
            previous_start_date: previousPolicy && previousPolicy[0] && previousPolicy[0].start_date ? new Date(previousPolicy[0].start_date) : "",
            previous_end_date: previousPolicy && previousPolicy[0] && previousPolicy[0].end_date ? new Date(previousPolicy[0].end_date) : "",
            previous_policy_name: "1",
            insurance_company_id: previousPolicy && previousPolicy[0] && previousPolicy[0].insurancecompany && previousPolicy[0].insurancecompany.Id ? previousPolicy[0].insurancecompany.Id : "",
            
            previous_city: previousPolicy && previousPolicy[0] && previousPolicy[0].address ? previousPolicy[0].address : "",
            previous_is_claim: previousPolicy && previousPolicy[0] && (previousPolicy[0].is_claim == 0 || previousPolicy[0].is_claim == 1) ? previousPolicy[0].is_claim : "",
            previous_claim_bonus: previousPolicy && previousPolicy[0] && ncbArr[previousPolicy[0].claim_bonus]  && previousPolicy[0].claim_bonus != 2 ? Math.floor(previousPolicy[0].claim_bonus) : "",
            previous_policy_no : previousPolicy && previousPolicy[0] && previousPolicy[0].policy_no ? previousPolicy[0].policy_no : "",

            active_start_date: previousPolicy && previousPolicy[1] && previousPolicy[1].start_date ? new Date(previousPolicy[1].start_date) : "",
            active_end_date: previousPolicy && previousPolicy[1] && previousPolicy[1].end_date ? new Date(previousPolicy[1].end_date) : "",
            active_policy_name: '2',
            active_insurance_company_id: previousPolicy && previousPolicy[1] && previousPolicy[1].insurancecompany && previousPolicy[1].insurancecompany.Id ? previousPolicy[1].insurancecompany.Id : "",
            active_policy_address: previousPolicy && previousPolicy[1] && previousPolicy[1].address ? previousPolicy[1].address : "test",
            active_policy_no: previousPolicy && previousPolicy[1] && previousPolicy[1].policy_no ? previousPolicy[1].policy_no : "",
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
                                            
                                            {(motorInsurance && motorInsurance.policytype_id && motorInsurance.policytype_id == '2') ?
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
                                                <Col sm={12} md={11} lg={4}>
                                                    <FormGroup>

                                                        <DatePicker
                                                            name={phrases['active_start_date']}
                                                            minDate={new Date(activeMinDate)}
                                                            maxDate={new Date(maxDate)}
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText={phrases['APSD']}
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            className="datePckr inputfs12"
                                                            selected={values.active_start_date}
                                                            onChange={(val) => {
                                                                setFieldTouched('active_start_date')
                                                                setFieldValue("active_end_date", currentEndDate(val));
                                                                setFieldValue('active_start_date', val);
                                                            }}
                                                        />
                                                        {errors.active_start_date && touched.active_start_date ? (
                                                            <span className="errorMsg">{phrases[errors.active_start_date]}</span>
                                                        ) : null}
                                                    </FormGroup>
                                                </Col>

                                                <Col sm={12} md={11} lg={4}>
                                                    <FormGroup>
                                                        <DatePicker
                                                            name="active_end_date"
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText={phrases['APED']}
                                                            disabled = {true}
                                                            dropdownMode="select"
                                                            className="datePckr inputfs12"
                                                            selected={values.active_end_date}
                                                            onChange={(val) => {
                                                                setFieldTouched('active_end_date');
                                                                setFieldValue('active_end_date', val);
                                                            }}
                                                        />
                                                        {errors.active_end_date && touched.active_end_date ? (
                                                            <span className="errorMsg">{phrases[errors.active_end_date]}</span>
                                                        ) : null}
                                                    </FormGroup>
                                                </Col>
                                                {/* <Col sm={12} md={11} lg={3}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                            <Field
                                                                name="active_policy_name"
                                                                component="select"
                                                                autoComplete="off"
                                                                className="formGrp inputfs12"
                                                                value = {values.active_policy_name}
                                                                disabled={true}
                                                                // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.active_policy_name}
                                                            >
                                                                <option value="">{phrases['SPT']}</option>
                                                                <option value="1" disabled={true}>{phrases['Package']}</option>
                                                                <option value="2">{phrases['LiabilityOnly']}</option>  
                                                    
                                                            </Field>
                                                            {errors.active_policy_name && touched.active_policy_name ? (
                                                                <span className="errorMsg">{phrases[errors.active_policy_name]}</span>
                                                            ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col> */}
                                            </Row>

                                            <Row>
                                                <Col sm={12} md={6} lg={6}>
                                                <FormGroup>
                                                    <div className="formSection">
                                                    <Field
                                                        name="active_insurance_company_id"
                                                        component="select"
                                                        autoComplete="off"                                                                        
                                                        className="formGrp"
                                                    >
                                                        <option value="">{phrases['SelectActiveInsurer']}</option>
                                                        {insurerList.map((insurer, qIndex) => ( 
                                                            <option value= {insurer.Id}>{insurer.name}</option>
                                                        ))}
                                                    </Field>     
                                                    {errors.active_insurance_company_id && touched.active_insurance_company_id ? (
                                                    <span className="errorMsg">{phrases[errors.active_insurance_company_id]}</span>
                                                    ) : null}          
                                                    </div>
                                                </FormGroup>
                                                </Col>
                                                <Col sm={12} md={5} lg={5}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="active_policy_no"
                                                                type="text"
                                                                placeholder={phrases['APolicyNumber']}
                                                                autoComplete="off"
                                                                maxLength="28"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                
                                                            />
                                                            {errors.active_policy_no && touched.active_policy_no ? (
                                                                <span className="errorMsg">{phrases[errors.active_policy_no]}</span>
                                                            ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col>

                                                {/* <Col sm={12} md={5} lg={5}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="active_policy_address"
                                                                type="text"
                                                                placeholder={phrases['AInsurerAddress']}
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                
                                                            />
                                                            {errors.active_policy_address && touched.active_policy_address ? (
                                                                <span className="errorMsg">{phrases[errors.active_policy_address]}</span>
                                                            ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col> */}
                                            </Row>        
                                            
                                            <Row>&nbsp;</Row>   

                                            <Row>
                                                <Col sm={12}>
                                                    <FormGroup>
                                                        <div className="carloan">
                                                            <h4> {phrases['PPD']}</h4>
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col sm={12} md={11} lg={4}>
                                                    <FormGroup>

                                                        <DatePicker
                                                            name={phrases['previous_start_date']}
                                                            minDate={new Date(minDate)}
                                                            maxDate={new Date(maxDate)}
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText={phrases['PPSD']}
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            className="datePckr inputfs12"
                                                            selected={values.previous_start_date}
                                                            onChange={(val) => {
                                                                setFieldTouched('previous_start_date')
                                                                setFieldValue("previous_end_date", prevEndDate(val));
                                                                setFieldValue('previous_start_date', val);
                                                            }}
                                                        />
                                                        {errors.previous_start_date && touched.previous_start_date ? (
                                                            <span className="errorMsg">{phrases[errors.previous_start_date]}</span>
                                                        ) : null}
                                                    </FormGroup>
                                                </Col>

                                                <Col sm={12} md={11} lg={4}>
                                                    <FormGroup>
                                                        <DatePicker
                                                            name="previous_end_date"
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText={phrases['PPED']}
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
                                                {/* <Col sm={12} md={11} lg={3}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                            <Field
                                                                name="previous_policy_name"
                                                                component="select"
                                                                autoComplete="off"
                                                                className="formGrp inputfs12"
                                                                value = {values.previous_policy_name}
                                                                disabled = {true}
                                                                // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.previous_policy_name}
                                                            >
                                                                <option value="">{phrases['SPT']}</option>
                                                                <option value="1">{phrases['Package']}</option>
                                                                <option value="2" disabled = {true}>{phrases['LiabilityOnly']}</option>  
                                                    
                                                            </Field>
                                                            {errors.previous_policy_name && touched.previous_policy_name ? (
                                                                <span className="errorMsg">{phrases[errors.previous_policy_name]}</span>
                                                            ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col> */}
                                            </Row>

                                            <Row>
                                                <Col sm={12} md={6} lg={6}>
                                                <FormGroup>
                                                    <div className="formSection">
                                                    <Field
                                                        name="insurance_company_id"
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
                                                                name="previous_city"
                                                                type="text"
                                                                placeholder={phrases['PInsurerAddress']}
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                
                                                            />
                                                            {errors.previous_city && touched.previous_city ? (
                                                                <span className="errorMsg">{phrases[errors.previous_city]}</span>
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
                                                                name="previous_policy_no"
                                                                type="text"
                                                                placeholder={phrases['PPolicyNumber']}
                                                                autoComplete="off"
                                                                maxLength="28"
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

                                            {(motorInsurance && motorInsurance.policytype_id && motorInsurance.policytype_id == '2') ?
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