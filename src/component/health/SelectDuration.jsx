import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import moment from "moment";

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import {
    checkGreaterTimes,
    checkGreaterStartEndTimes
  } from "../../shared/validationFunctions";

const initialValues = {
polStartDate: "",
polEndDate: "",
insureValue: ""    
}

const validateDuration =  Yup.object().shape({
    polStartDate: Yup.date().required("Please enter start date").test(
        "checkGreaterTimes",
        "Start date must be less than end date",
        function (value) {
            if (value) {
                return checkGreaterStartEndTimes(value, this.parent.polEndDate);
            }
            return true;
        }
    ).test(
      "checkStartDate",
      "Enter Start Date",
      function (value) {       
          if ( this.parent.polEndDate != undefined && value == undefined) {
              return false;
          }
          return true;
      }
    ),
    polEndDate: Yup.date().required("Please enter end date").test( 
    "checkGreaterTimes",
    "End date must be greater than start date",
    function (value) {
        if (value) {
            return checkGreaterTimes(value, this.parent.polStartDate);
        }
        return true;
    }
    ).test(
    "checkEndDate",
    "Enter End Date",
    function (value) {     
        if ( this.parent.polStartDate != undefined && value == undefined) {
            return false;
        }
        return true;
    }
    ),
    insureValue: Yup.string().required(function() {
        return "Please enter sum insured"
    })
})

class SelectDuration extends Component {

    state = {
        accessToken: "",
        policyHolderDetails: [],
        polStartDate: "",
        polEndDate: "",
        insureValue: "" 
      };


    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }


    medicalQuestions = (productId) => {
        this.props.history.push(`/MedicalDetails/${productId}`);
    }

    handleSubmit = (values) => {
        const {productId} = this.props.match.params
        const formData = new FormData(); 
        for (const key in values) {
            if (values.hasOwnProperty(key)) {
                formData.append(key, values[key]);
            }
        }
        this.props.history.push(`/Address/${productId}`);
        this.props.loadingStart();      

    }

    getAccessToken = () => {
        this.props.loadingStart();
        axios
          .post(`/callTokenService`)
          .then(res => { 
            this.setState({
                accessToken: res.data.access_token
            }) 
          })
          .catch(err => {
            this.setState({
                accessToken: []
            });
            this.props.loadingStop();
          });
      }

      getPolicyHolderDetails = () => {
        this.props.loadingStart();
        axios
          .get(`/policy-holder/${localStorage.getItem('policyHolder_id')}`)
          .then(res => { 
            this.setState({
                policyHolderDetails: res.data.data.policyHolder
            }) 
          })
          .catch(err => {
            this.setState({
                policyHolderDetails: []
            });
            this.props.loadingStop();
          });
      }

      quote = (value) => {
          console.log(value)
        const {accessToken, policyHolderDetails} = this.state
        let data = {
            "RequestHeader":{
               "requestID":"123456",
               "action":"quickQuote",
               "channel":"SBIG",
               "transactionTimestamp":"27-May-2020-17:47:51"
            },
            "RequestBody":{
               "ProductCode":"ASAN001",
               "ProductVersion":"1.0",
               "ArogyaPolicyType":"1",
               "SanjeevaniFFCategory":1,
               "EffectiveDate":moment(value.polStartDate).format("YYYY-MM-DD"),
               "ExpiryDate":moment(value.polEndDate).format("YYYY-MM-DD"),
               "PremiumFrequency":"1",
               "NonFloaterDiscount":"",
               "ProbableMaxLoss":value.insureValue,
               "GSTType":"SGST",
               "AgreementCode":"2963",
               "SBIGBranchCode":"HO",
               "SBIGBranchStateCode":"MH",
               "TPACode":"",
               "IMDCODE":"",
               "PolicyType":"1",
               "PolicyCustomerList":[
                  {
                     "State":"MH",
                     "Mobile":"9814254758",
                     "Email":"test@mailinator.com"
                  }
               ],
               "PolicyLobList":[
                  {
                     "ProductCode":"ASAN001",
                     "PolicyRiskList":[
                        {
                           "ProductElementCode":"R10007",
                           "DateOfBirth":"1984-05-10",
                           "ArgInsuredRelToProposer":2,
                           "ArogyaOccupation":"1",
                           "Height":163.3,
                           "Weight":58,
                           "Questionnaire2b":"0",
                           "IsSmoker":"0",
                           "AlcoholStatus":"0",
                           "TobaccoLoading":"0",
                           "AlcoholQuantity":"1",
                           "PolicyCoverageList":[
                              {
                                 "ProductElementCode":"HVSC01",
                                 "SanjeevaniSumInsured":5
                              }
                           ]
                        }
                     ]
                  }
               ]
            }
         }
        

      const formData = new FormData(); 
      this.props.loadingStart();
      formData.append('data', JSON.stringify(data));
      formData.append('access_token', accessToken);
      axios
        .post(`/quickQuoteService`, formData)
        .then(res => { 
          this.setState({
              serverResponse: res.data
          }) 
        })
        .catch(err => {
          this.setState({
            serverResponse: []
          });
          this.props.loadingStop();
        });
    }

    handleChange =() => {

    }



    componentDidMount() {
        this.getPolicyHolderDetails();
        this.getAccessToken();
      }

    render() {
        const {productId} = this.props.match.params
        const {policyHolderDetails, serverResponse} = this.state

        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10">
                                <h4 className="text-center mt-3 mb-3">Arogya Sanjeevani Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Select the duration for your Health Insurance</h4>
                                        </div>
                                        <Formik initialValues={initialValues} 
                                        onSubmit={ serverResponse ? (serverResponse.message ? this.quote : this.handleSubmit ) : this.quote}
                                        validationSchema={validateDuration}
                                        >
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                        return (
                                        <Form>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

                                                <Row className="m-b-25">
                                                    <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                Policy Start Date
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                        <DatePicker
                                                            name="polStartDate"
                                                            minDate={new Date()}
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="Start Date"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            className="datePckr"
                                                            onChange={(value) => {
                                                                setFieldTouched("polStartDate");
                                                                setFieldValue("polStartDate", value);
                                                                // this.setState({ polStartDate: value });
                                                            }}
                                                            selected={values.polStartDate}
                                                        />
                                                        {errors.polStartDate && touched.polStartDate ? (
                                                        <span className="errorMsg">{errors.polStartDate}</span>
                                                        ) : null}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                            Policy End Date
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                        <DatePicker
                                                            name="polEndDate"
                                                            minDate={new Date()}
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="End Date"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            dropdownMode="select"
                                                            className="datePckr"
                                                            onChange={(value) => {
                                                                setFieldTouched("polEndDate");
                                                                setFieldValue("polEndDate", value);
                                                                // this.setState({ polEndDate: value });
                                                                }}
                                                            selected={values.polEndDate}
                                                        />
                                                        {errors.polEndDate && touched.polEndDate ? (
                                                        <span className="errorMsg">{errors.polEndDate}</span>
                                                        ) : null}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                            Select Sum Insured
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={8} lg={8}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name="insureValue"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.insureValue}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Select sum insured</option>
                                                                    <option value="100000">100 000</option>
                                                                    <option value="200000">200 000</option>
                                                                    <option value="300000">300 000</option>
                                                                    <option value="400000">400 000</option>
                                                                    <option value="500000">500 000</option>
                                                                    <option value="600000">600 000</option>
                                                                    <option value="700000">700 000</option>
                                                                    <option value="800000">800 000</option>
                                                                    <option value="900000">900 000</option>
                                                                    <option value="1000000">10 00 000</option>
                                                                    <option value="1100000">11 00 000</option>
                                                                    <option value="1200000">12 00 000</option>
                                                                </Field>    
                                                                {errors.insureValue && touched.insureValue ? (
                                                                <span className="errorMsg">{errors.insureValue}</span>
                                                                ) : null} 
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                <div className="d-flex justify-content-left carloan m-b-25">
                                                    <h4> Premium</h4>
                                                </div>
                                                <Row>
                                                    <Col sm={12}>
                                                        <div className="d-flex justify-content-between align-items-center premium m-b-25">
                                                            <p>Your Total Premium for One Year :</p>
                                                            <p><strong>Rs:</strong> { serverResponse ? (serverResponse.message ? 0 : serverResponse.PolicyLobList[0].GrossPremium ) : 0}</p>
                                                        </div>
                                                    </Col>

                                                    <Col sm={12}>
                                                        <div className="justify-content-left align-items-center list m-b-30">
                                                        <p>Your Health Insurance covers you for following :</p>
                                                        <ul>
                                                            <li>Your hospital room rent,boarding expenses and doctor fees</li>
                                                            <li>Nursing expenses.Operation theatre and ICU charges</li>
                                                            <li>Medicines that you consume during the hospital stay</li>
                                                            <li>Road Ambulance Charges</li>
                                                            <li>Pre and Post hospitalization expenses up to 30 and 60 days respectively</li>
                                                        </ul>
                                                        </div>
                                                    </Col>
                                                    <div className="d-flex justify-content-left resmb">
                                                    <Button className={`backBtn`} type="button" onClick= {this.medicalQuestions.bind(this, productId )} >
                                                        Back
                                                    </Button>
                                                    { serverResponse ? (serverResponse.message ? 
                                                         <Button className={`proceedBtn`} type="submit"  >
                                                         Quote
                                                     </Button> : <Button className={`proceedBtn`} type="submit"  >
                                                        Continue
                                                    </Button> ) : <Button className={`proceedBtn`} type="submit"  >
                                                    Quote
                                                    </Button>}
                                                    
                                                    </div>
                                                </Row>
                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="regisBox">
                                                    <h3 className="medihead">6000+ Network Hospitals for you to avail cashless facility</h3>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(SelectDuration));