import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import moment from "moment";

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";
import dateformat from "dateformat";

const maxDob = dateformat(new Date(), 'mm/dd/yyyy');
const initialValues = {
    first_name: "",
    last_name: "",
    gender: "",
    dob: "",
    relation_with: "",
    appointee_dob: "",
    appointee_relation_with: ""
}

const validateNominee = Yup.object().shape({
    last_name: Yup.string().required(function() {
        return "Please enter a last name"
    }).min(3, function() {
        return "Last name must be minimum 3 chracters"
    }).max(40, function() {
        return "Last name must be maximum 40 chracters"
    }).matches(/^[A-Za-z][A-Za-záéíñóúüÁÉÍÑÓÚÜ\s\-']*[A-Za-z\s]$/, function() {
        return "Please enter valid last name"
}),
    first_name: Yup.string(function() {
        return "Please enter name"
    }).required(function() {
        return "Please enter name"
    })
        .min(3, function() {
            return "Name must be minimum 3 chracters"
        })
        .max(40, function() {
            return "Name must be maximum 40 chracters"
        })
        .matches(/^[A-Za-z][A-Za-záéíñóúüÁÉÍÑÓÚÜ\s\-']*[A-Za-z\s]$/, function() {
            return "Please enter valid name"
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
    }),
    relation_with: Yup.string().required(function() {
        return "Please select relation"
    }),
    appointee_dob:Yup.date().notRequired("Please enter DOB").max(maxDob, function() {
        return "Date should not be future date"
        }).test(
            "18YearsChecking",
            function() {
                return "Appointee age should be more than 18 years"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (value) {
                    const age_Obj = new PersonAge();
                    return age_Obj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ).test(
            "18YearsChecking",
            function() {
                return "Please enter Appointee date of birth"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsMyAge(this.parent.dob) < 18) {   
                    return ageObj.whatIsMyAge(value) >= 18;    
                }
                return true;
            }
        ),
    appointee_relation_with: Yup.string().required(function() {
        return "Please select relation"
    })
})

class NomineeDetails extends Component {

    state = {
        NomineeDetails: [], 
        appointeeFlag: false,
        is_appointee:0
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

    addressInfo = (productId) => {
        this.props.history.push(`/Address/${productId}`);
    }

    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params
        const formData = new FormData(); 

        for (const key in values) {
            if (values.hasOwnProperty(key)) {
              if(key == "dob" || key == "appointee_dob"){
                formData.append(key, moment(values[key]).format("YYYY-MM-DD"));
              }
              else {
                 formData.append(key, values[key]);
              }          
            }
          }
        formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));
        formData.append('is_appointee', this.state.is_appointee);
        this.props.loadingStart();
        axios
        .post(`/insert-nominee`, formData)
        .then(res => { 
            this.props.loadingStop();
            this.props.history.push(`/PolicyDetails/${productId}`);
        })
        .catch(err => {
    
          this.props.loadingStop();
        });

        
    }

    getNomineeDetails = () => {
        this.props.loadingStart();
        axios
          .get(`/policy-holder/${localStorage.getItem('policyHolder_id')}`)
          .then(res => { 
            this.setState({
                NomineeDetails: res.data.data.policyHolder.request_data.nominee[0]
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
      }


    render() {
        const {productId} = this.props.match.params
        const {NomineeDetails,appointeeFlag} = this.state
        moment.defaultFormat = "YYYY-MM-YY";

        const newInitialValues = Object.assign(initialValues, {
            first_name: NomineeDetails ? NomineeDetails.first_name : "",
            last_name: NomineeDetails ? NomineeDetails.last_name : "",
            gender: NomineeDetails ? NomineeDetails.gender : "",
            dob: NomineeDetails && NomineeDetails.dob ? new Date(NomineeDetails.dob) : "",
            relation_with: NomineeDetails ? NomineeDetails.relation_with : "",
            appointee_dob: NomineeDetails && NomineeDetails.appointee_dob ? new Date(NomineeDetails.appointee_dob) : "",
            appointee_relation_with: NomineeDetails ? NomineeDetails.appointee_relation_with : ""
        })
        
        
        // console.log("newInitialValues", moment(NomineeDetails.dob, moment.defaultFormat).toDate())
        // console.log("newInitialValues", moment(NomineeDetails.dob).utc())

        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">Arogya Sanjeevani Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <div className="justify-content-left brandhead  m-b-20">
                                            <h4 className="fs-18">You are just one step away from geting your policy ready</h4>
                                        </div>
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Nominee  Details</h4>
                                        </div>

                                    <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} 
                                    validationSchema={validateNominee}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                    return (
                                    <Form>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

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


                                                    <Col sm={12} md={4} lg={6}>
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
                                                                <option value="father">father</option>
                                                                <option value="mother">Mother</option>
                                                                <option value="spouse">Spouse</option>
                                                                </Field>     
                                                                {errors.relation_with && touched.relation_with ? (
                                                                    <span className="errorMsg">{errors.relation_with}</span>
                                                                ) : null}        
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                {appointeeFlag || NomineeDetails.is_appointee == '1' ? 
                                                    <div>
                                                    <div className="d-flex justify-content-left carloan m-b-25">
                                                        <h4> Appointee  Details</h4>
                                                    </div>
                                                    <Row className="m-b-45">
                                                        <Col sm={12} md={4} lg={4}>
                                                            <FormGroup>
                                                                <DatePicker
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
                                                                {errors.appointappointee_dobeeDob ? (
                                                                    <span className="errorMsg">{errors.appointee_dob}</span>
                                                                ) : null}
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
                                                                    <option value="">Relation with Primary Insured</option>
                                                                    <option value="father">father</option>
                                                                    <option value="mother">Mother</option>
                                                                    <option value="spouse">Spouse</option>
                                                                    </Field>     
                                                                    {errors.appointee_relation_with && touched.appointee_relation_with ? (
                                                                        <span className="errorMsg">{errors.appointee_relation_with}</span>
                                                                    ) : null}        
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    </div> : null
                                                }

                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.addressInfo.bind(this, productId )}>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(NomineeDetails));