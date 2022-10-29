import React, { Component ,Fragment} from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import moment from "moment";
import swal from 'sweetalert';

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";
import dateformat from "dateformat";
import Encryption from '../../shared/payload-encryption';


const minDobNominee = moment(moment().subtract(100, 'years').calendar()).calendar()
const maxDobNominee = moment().subtract(90, 'days').calendar();
const year = new Date('Y')
const ageObj = new PersonAge();
// const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
// const maxDate = moment(minDate).add(30, 'day').calendar();
const minDate = moment(moment().subtract(20, 'years').calendar()).add(1, 'day').calendar();
const minDatePypLapsed = moment(moment().subtract(1, 'years').calendar()).subtract(89, 'day').calendar();
const maxDate = moment(moment().subtract(1, 'years').calendar()).add(0, 'day').calendar();
const maxDatePYPST = moment(moment().subtract(1, 'month').calendar()).add(1, 'day').calendar();
const maxDatePYP = moment(moment().subtract(1, 'years').calendar()).add(30, 'day').calendar();
const maxDatePYPLapsed = moment().subtract(1, 'years').calendar();
const startRegnDate = moment().subtract(20, 'years').calendar();
const minRegnDate = startRegnDate;
// const minRegnDate = moment(startRegnDate).startOf('year').format('YYYY-MM-DD hh:mm');
const minRegnDateNew = moment(moment().subtract(1, 'months').calendar()).add(1, 'day').calendar();
const maxDateForValidtion = moment(moment().subtract(1, 'years').calendar()).add(31, 'day').calendar();

const initialValues = {
    first_name: "",
    last_name: "",
    gender: "",
    dob: "",
    relation_with: "",
    appointee_relation_with: "",
    appointee_name: "",
    previous_is_claim:"",
    previous_city:"",
    insurance_company_id:"",
    previous_policy_name:"",
    previous_end_date: "",
    previous_start_date: "",
    previous_claim_bonus: 1,
    no_of_claim: "",
    previous_policy_no: "",
    previous_sum_insured: "",
    goodscarriedtypes_id: "",
    averagemonthlyusages_id: "",
    permittypes_id: "",
    valid_previous_policy: "",
}

const validateNominee = Yup.object().shape({
    last_name: Yup.string().required(function() {
        return "Please enter a last name"
        }).matches(/^[A-Za-z]*$/, function() {
            return "Please enter valid last name"
        }).min(1, function() {
            return "Name must be minimum 1 chracters"
        })
        .max(40, function() {
            return "Name must be maximum 40 chracters"
    }),
    first_name: Yup.string(function() {
        return "Please enter name"
        }).required(function() {
            return "Please enter name"
        }).matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)$/, function() {
                return "Please enter valid name"
        }).min(3, function() {
            return "Name must be minimum 3 chracters"
        })
        .max(40, function() {
            return "Name must be maximum 40 chracters"
    }),
    gender: Yup.string().required(function() {
                return "Please select gender"
        }).matches(/^[MmFf]$/, function() {
            return "Please select valid gender"
    }),
    dob: Yup
        .date()
        .required( function() {
            return "Please enter DOB"
    }).test(
        "3monthsChecking",
        function() {
            return "Age should be minium 3 months"
        },
        function (value) {
            if (value) {
                const ageObj = new PersonAge();
                return ageObj.whatIsMyAge(value) < 111 && ageObj.whatIsMyAgeMonth(value) >=3;
            }
            return true;
        }
    ),
    relation_with: Yup.string().required(function() {
        return "Please select relation"
    }),
    // appointee_dob:Yup.date().notRequired("Please enter DOB").max(maxDob, function() {
    //     return "Date should not be future date"
    //     }).test(
    //         "18YearsChecking",
    //         function() {
    //             return "Appointee age should be more than 18 years"
    //         },
    //         function (value) {
    //             const ageObj = new PersonAge();
    //             if (value) {
    //                 const age_Obj = new PersonAge();
    //                 return age_Obj.whatIsMyAge(value) >= 18;
    //             }
    //             return true;
    //         }
    //     ).test(
    //         "18YearsChecking",
    //         function() {
    //             return "Please enter Appointee date of birth"
    //         },
    //         function (value) {
    //             const ageObj = new PersonAge();
    //             if (ageObj.whatIsMyAge(this.parent.dob) < 18) {   
    //                 return ageObj.whatIsMyAge(value) >= 18;    
    //             }
    //             return true;
    //         }
    //     ),
    appointee_name:Yup.string(function() {
            return "Please enter appointee name"
        }).notRequired(function() {
            return "Please enter appointee name"
        })        
        .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)$/, function() {
            return "Please enter valid name"
    }).test(
        "18YearsChecking",
        function() {
            return "Please enter appointee name"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsMyAge(this.parent.dob) < 18 && !value) {   
                return false;    
            }
            return true;
        }
    ).min(3, function() {
        return "Name must be minimum 3 chracters"
    })
    .max(40, function() {
        return "Name must be maximum 40 chracters"
    }),
    appointee_relation_with: Yup.string().notRequired(function() {
        return "Please select relation"
    }).test(
        "18YearsChecking",
        function() {
            return "Please enter Appointee relation"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsMyAge(this.parent.dob) < 18 && !value) {   
                return false;    
            }
            return true;
        }
    )
})

class dailycash_NomineeDetails extends Component {

    state = {
        insurerList: [],
        showClaim: false,
        NomineeDetails: [],
        previousPolicy:[], 
        appointeeFlag: false,
        is_appointee:0,
        previous_is_claim:''
      };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

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

    
    showClaimText = (value,values) =>{
        if(value == 1){
            this.setState({
                showClaim:true,
                previous_is_claim:1
            })
        }
        else{
            this.setState({
                showClaim:false,
                previous_is_claim:0,          
            })
            values.claim_array = []
        }
    }

    getInsurerList = () => {
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        this.props.loadingStart();
        axios
          .get(`/company/1/${policyHolder_id}`)
          .then(res => {
            this.setState({
                insurerList: res.data.data
            });
            
          })
          .catch(err => {
            this.setState({
                insurerList: []
            });
            this.props.loadingStop();
          });
    }

    fullQuoteDetails = (productId) => {
        this.props.history.push(`/dailycash_FullQuote/${productId}`);
    }

    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params
        const formData = new FormData(); 
        let formArr = []

        for (const key in values) {
            if (values.hasOwnProperty(key)) {
              if(key == "dob" ){
                formArr[key] = moment(values[key]).format("YYYY-MM-DD")
              }
              else {
                if(key == "relation_with") {
                    formArr[key] = (values[key]).toString()
                  }
                  else {
                    formArr[key] = values[key]
                  } 
              }          
            }
          }
        formArr['valid_previous_policy'] = values.valid_previous_policy
        formArr['previous_start_date'] = values.previous_start_date
        formArr['previous_end_date'] = values.previous_end_date
        formArr['insurance_company_id'] = values.insurance_company_id
        formArr['previous_city'] = values.previous_city
        formArr['previous_policy_no'] = values.previous_policy_no
        formArr['previous_sum_insured'] = values.previous_sum_insured
        formArr['previous_is_claim'] = values.previous_is_claim
        formArr['policy_holder_id'] = localStorage.getItem('policyHolder_id')
        formArr['is_appointee'] = this.state.is_appointee
        formArr['page_name'] = '/dailycash_NomineeDetails/12'
        let formObj = {}
        Object.assign(formObj,formArr)
        console.log("PostData---", formObj)
        let encryption = new Encryption();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(formObj)))

        this.props.loadingStart();
        axios
        .post(`/daily-cash/insert-nominee`, formData)
        .then(res => { 
            this.props.loadingStop();
            this.props.history.push(`/dailycash_PolicyDetails/${productId}`);
        })
        .catch(err => {
            let decryptResp = JSON.parse(encryption.decrypt(err.data))
            console.log("decryptErr----", decryptResp)
            if(err.status == 401) {
                swal("Session out. Please login")
            }
            else swal("Something wrong happened. Please try after some")
            actions.setSubmitting(false);
            this.props.loadingStop();
        });

        
    }

    fetchPolicyRelations = (family_relations)=>{        
        let relations = family_relations.map(resource=>resource.relation_with=='self'?1:0)
        let self_selected = relations && relations.length>0 && relations.includes(1)
        this.setState({
            self_selected
        })
        //return self_selected
    }

    getNomineeDetails = () => {
        this.props.loadingStart();
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo");
        let encryption = new Encryption();
        axios.get(`daily-cash/policy-details/${policyHolder_refNo}`)
          .then(res => { 
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)
           let family_members = decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data.family_members:[]
            this.fetchPolicyRelations(family_members)
            this.setState({
                NomineeDetails: decryptResp.data.policyHolder.request_data.nominee[0],
                previousPolicy: decryptResp.data.policyHolder.previouspolicy,
                is_appointee: decryptResp.data.policyHolder.request_data.nominee[0].is_appointee
            }) 
            this.props.loadingStop();
          })
          .catch(err => {
            this.setState({
                NomineeDetails: []
            });
            this.props.loadingStop();
          });
      }

      componentDidMount() {
        this.getNomineeDetails();
        this.getInsurerList();
      }


    render() {
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        const {productId} = this.props.match.params
        const {insurerList,previousPolicy,NomineeDetails,appointeeFlag, is_appointee,previous_is_claim} = this.state
         console.log('insurerList',insurerList)
        moment.defaultFormat = "YYYY-MM-YY";

        const newInitialValues = Object.assign(initialValues, {
            first_name: NomineeDetails ? NomineeDetails.first_name : "",
            last_name: NomineeDetails ? NomineeDetails.last_name : "",
            gender: NomineeDetails ? NomineeDetails.gender : "",
            dob: NomineeDetails && NomineeDetails.dob ? new Date(NomineeDetails.dob) : "",
            relation_with: NomineeDetails ? NomineeDetails.relation_with : "",
            // appointee_dob: NomineeDetails && NomineeDetails.appointee_dob ? new Date(NomineeDetails.appointee_dob) : "",
            appointee_relation_with: NomineeDetails && NomineeDetails.appointee_relation_with ? NomineeDetails.appointee_relation_with : "",
            appointee_name: NomineeDetails && NomineeDetails.appointee_name ? NomineeDetails.appointee_name : "",
            previous_start_date: previousPolicy ? new Date(previousPolicy.start_date): "",
            previous_end_date: previousPolicy ? new Date(previousPolicy.end_date): "",
            valid_previous_policy : previousPolicy ? previousPolicy.claim_for: 0,
            insurance_company_id : previousPolicy ? previousPolicy.insurancecompany_id: 0,
            previous_policy_no : previousPolicy ? previousPolicy.policy_no: 0,
            previous_city : previousPolicy ? previousPolicy.address: 0,
            previous_sum_insured : previousPolicy ? previousPolicy.sum_insured: 0,
            previous_is_claim : previousPolicy ? previousPolicy.is_claim: 0,
        })
        

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
							
							
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox argNominee">
                                <h4 className="text-center mt-3 mb-3">Hospital Daily Cash Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <div className="justify-content-left brandhead  m-b-20">
                                            <h4 className="fs-18">You are just one step away from geting your policy ready</h4>
                                        </div>
                                        
                                    <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} 
                                    validationSchema={validateNominee}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                    return (
                                    <Form>
                                        <Row>
                                        {/* <Col sm={12} md={9} lg={9}>    
                                            <Fragment>
                                                        <Row>
                                                            <Col sm={12}>
                                                                <FormGroup>
                                                                    <div className="carloan">
                                                                        <h4> Have you had other hospital cash ? </h4>
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
                                                                                name='valid_previous_policy'                                            
                                                                                value='0'
                                                                                key='1'  
                                                                                onChange={(e) => {
                                                                                    setFieldTouched('valid_previous_policy')
                                                                                    setFieldValue(`valid_previous_policy`, e.target.value);
                                                                                    
                                                                                }}
                                                                                checked={values.valid_previous_policy == '0' ? true : false}
                                                                            />
                                                                                <span className="checkmark " /><span className="fs-14"> {phrases['No']}</span>
                                                                            </label>
                                                                        </div>

                                                                        <div className="">
                                                                            <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='valid_previous_policy'                                            
                                                                                value='1'
                                                                                key='1'  
                                                                                onChange={(e) => {
                                                                                    setFieldTouched('valid_previous_policy')
                                                                                    setFieldValue(`valid_previous_policy`, e.target.value);
                                                                                }}
                                                                                checked={values.valid_previous_policy == '1' ? true : false}
                                                                            />
                                                                                <span className="checkmark" />
                                                                                <span className="fs-14">{phrases['Yes']}</span>
                                                                            </label>
                                                                            {errors.valid_previous_policy && touched.valid_previous_policy ? (
                                                                            <span className="errorMsg">{phrases[errors.valid_previous_policy]}</span>
                                                                        ) : null}
                                                                        </div>
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                            </Fragment>
                                           
                                        </Col> */}
                                        
                                        {/* {values.valid_previous_policy == '1' ?
                                         <Col sm={12} md={9} lg={9}>
                                             <Fragment>
                                             <Row>
                                                <Col sm={12}>
                                                    <FormGroup>
                                                        <div className="carloan">
                                                            <h4> </h4>
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                              </Row>
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
                                                    <Col sm={12} md={11} lg={6}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="previous_start_date"
                                                                // minDate={new Date(minDate)} 
                                                                minDate={values.policy_type_id == '3' ? new Date(minDatePypLapsed) : new Date(minDate)}
                                                                maxDate={values.previous_policy_name == '3' ? new Date(maxDatePYPST) : values.policy_type_id == '3' ? new Date(maxDatePYPLapsed) : new Date(maxDatePYP)}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText={phrases['PPSD']}
                                                                peekPreviousMonth
                                                                autoComplete="off"
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.previous_start_date}
                                                                onChange={(val) => {
                                                                    var date = new Date(val)
                                                                    var date2 = new Date(val)
                                                                    var tempDate = new Date(val)
                                                                    var tempEndDate = ""
                                                                    date = date.setFullYear(date.getFullYear() + 1);
                                                                    var date2 = new Date(date)
                                                                    date2 = date2.setDate(date2.getDate() - 1);         
            
                                                                    setFieldTouched('previous_start_date')
                                                                    setFieldValue("previous_end_date", new Date(date2));   
                                                                    setFieldValue('previous_start_date', val);
                                                                }}
                                                            />
                                                            {errors.previous_start_date && touched.previous_start_date ? (
                                                                <span className="errorMsg">{phrases[errors.previous_start_date]}</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={11} lg={6}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="previous_end_date"
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText={phrases['PPED']}
                                                                disabled = {true}
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.previous_end_date}
                                                                // onChange={(val) => {
                                                                //     setFieldTouched('previous_end_date');
                                                                //     setFieldValue('previous_end_date', val);
                                                                // }}
                                                            />
                                                            {errors.previous_end_date && touched.previous_end_date ? (
                                                                <span className="errorMsg">{phrases[errors.previous_end_date]}</span>
                                                            ) : null}
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
                                                                <option key={qIndex} value= {insurer.Id}>{insurer.name}</option>
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
                                                    <Col sm={12} md={5} lg={6}>
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
                                                     
                                                    <Col sm={12} md={5} lg={5}>
                                                      <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="previous_sum_insured"
                                                                    type="text"
                                                                    placeholder='Sum Insured'
                                                                    autoComplete="off"
                                                                    maxLength="28"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    
                                                                />
                                                                {errors.sum_insured && touched.sum_insured ? (
                                                                    <span className="errorMsg">{phrases[errors.sum_insured]}</span>
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
                                                    <Row>
                                                        <Col sm={12}>
                                                            <FormGroup>
                                                                <div className="carloan">
                                                                    <h4>Have you made any claim in your existing Policy</h4>
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
                                                                                setFieldValue('no_of_claim', "")
                                                                                this.showClaimText(0, values);
                                                                            }}
                                                                            checked={values.previous_is_claim == '0' ? true : false}
                                                                        />
                                                                            <span className="checkmark " /><span className="fs-14"> {phrases['NoIHavent']}</span>
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
                                                                                setFieldValue('no_of_claim', "")
                                                                                this.showClaimText(1, values);
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
                                             </Fragment>
                                         </Col>
                                        : null } */}
                                        <Col sm={12} md={9} lg={9}>
                                            <Row>
                                                <Col sm={12}>
                                                    <FormGroup>
                                                        <div className="carloan">
                                                            <h4> Nominee  Details </h4>
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                            </Row>                                
                                            <Row>
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="first_name"
                                                                type="text"
                                                                placeholder="First Name"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.first_name}
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
                                                                name="last_name"
                                                                type="text"
                                                                placeholder="Last Name"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.last_name}
                                                            />
                                                            {errors.last_name && touched.last_name ? (
                                                            <span className="errorMsg">{errors.last_name}</span>
                                                            ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col>


                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                            <Field
                                                                name="gender"
                                                                component="select"
                                                                autoComplete="off"
                                                                value={values.gender}
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
                                            </Row>

                                            <Row className="m-b-45">
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
                                                            maxDate={new Date(maxDobNominee)}
                                                            minDate={new Date(minDobNominee)}
                                                            className="datePckr"
                                                            onChange={(value) => {
                                                                setFieldTouched("dob");
                                                                setFieldValue("dob", value);
                                                                this.ageCheck(value)
                                                                }}
                                                            selected={values.dob}
                                                        />
                                                        {errors.dob && touched.dob ? (
                                                            <span className="errorMsg">{errors.dob}</span>
                                                        ) : null}
                                                    </FormGroup>
                                                </Col>


                                                <Col sm={12} md={8} lg={8}>
                                                    <FormGroup>
                                                        <div className="formSection">                                                           
                                                            <Field
                                                                name="relation_with"
                                                                component="select"
                                                                autoComplete="off"
                                                                value={values.relation_with}
                                                                className="formGrp"
                                                            >
                                                            <option value="">Relation with Primary Insured</option>
                                                            {/* {self_selected ? '': <option value="1">Self</option>} */}
                                                            <option value="1">Self</option>
                                                            <option value="2">Spouse</option>
                                                            <option value="3">Son</option>
                                                            <option value="4">Daughter</option>
                                                            <option value="5">Father</option>
                                                            <option value="6">Mother</option>
                                                            <option value="7">Father In Law</option>
                                                            <option value="8">Mother In Law</option>
                                                            <option value="9">Brother</option>
                                                            <option value="10">Sister</option>
                                                            <option value="11">Grand Father</option>
                                                            <option value="12">Grand Mother</option>
                                                            <option value="13">Husband</option>
                                                            <option value="14">Wife</option>
                                                            <option value="15">Child</option>
                                                            <option value="16">Brother in Law</option>
                                                            <option value="17">Sister in Law</option>
                                                            <option value="18">Uncle</option>
                                                            <option value="19">Aunty</option>
                                                            <option value="20">Ex-Wife</option>
                                                            <option value="21">Ex-Husband</option>
                                                            <option value="22">Employee</option>
                                                            <option value="23">Niece</option>
                                                            <option value="24">Nephew</option>
                                                            </Field>     
                                                            {errors.relation_with && touched.relation_with ? (
                                                                <span className="errorMsg">{errors.relation_with}</span>
                                                            ) : null}        
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                            {appointeeFlag || is_appointee == '1' ? 
                                                <div>
                                                <div className="d-flex justify-content-left carloan m-b-25">
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
                                                            {/* <DatePicker
                                                                name="appointee_dob"
                                                                minDate={new Date()}
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
                                                                onChange={(value) => {
                                                                    setFieldTouched("appointee_dob");
                                                                    setFieldValue("appointee_dob", value);
                                                                    }}
                                                                selected={values.appointee_dob}
                                                            />
                                                            {errors.appointee_dob ? (
                                                                <span className="errorMsg">{errors.appointee_dob}</span>
                                                            ) : null} */}
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
                                                                {/* {self_selected ? '':<option value="1">Self</option>} */}
                                                                <option value="1">Self</option>
                                                                <option value="2">Spouse</option>
                                                                <option value="3">Son</option>
                                                                <option value="4">Daughter</option>
                                                                <option value="5">Father</option>
                                                                <option value="6">Mother</option>
                                                                <option value="7">Father In Law</option>
                                                                <option value="8">Mother In Law</option>
                                                                <option value="9">Brother</option>
                                                                <option value="10">Sister</option>
                                                                <option value="11">Grand Father</option>
                                                                <option value="12">Grand Mother</option>
                                                                <option value="13">Husband</option>
                                                                <option value="14">Wife</option>
                                                                <option value="15">Child</option>
                                                                <option value="16">Brother in Law</option>
                                                                <option value="17">Sister in Law</option>
                                                                <option value="18">Uncle</option>
                                                                <option value="19">Aunty</option>
                                                                <option value="20">Ex-Wife</option>
                                                                <option value="21">Ex-Husband</option>
                                                                <option value="22">Employee</option>
                                                                <option value="23">Niece</option>
                                                                <option value="24">Nephew</option>
                                                                
                                                                </Field>     
                                                                {errors.appointee_relation_with && touched.appointee_relation_with ? (
                                                                    <span className="errorMsg">{errors.appointee_relation_with}</span>
                                                                ) : null}        
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                </div> 
                                                    : null
                                            } 

                                            <div className="d-flex justify-content-left resmb">
                                            <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.fullQuoteDetails.bind(this, productId )}>
                                                {isSubmitting ? 'Wait..' : 'Back'}
                                            </Button> 
                                            <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                {isSubmitting ? 'Wait..' : 'Next'}
                                            </Button> 
                                            </div>
                                        </Col>

                                            <Col sm={12} md={3}>
                                                <div className="regisBox">
                                                    <h3 className="medihead">Assurance of Insurance Everywhere in India, for every Indian </h3>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(dailycash_NomineeDetails));