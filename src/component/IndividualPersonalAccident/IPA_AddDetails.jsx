import React, { Component } from "react";
import { Row, Col, Modal, Button, FormGroup } from "react-bootstrap";
import BaseComponent from "../BaseComponent";
import SideNav from "../common/side-nav/SideNav";
import Footer from "../common/footer/Footer";
import axios from "../../shared/axios";
import { withRouter } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from "yup";
import swal from "sweetalert";
import Encryption from "../../shared/payload-encryption";
import { Formik, Form, Field, ErrorMessage } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.min.css";
import { addDays } from "date-fns";
import moment from "moment";
import Select from 'react-select';

const initialValues = {
  pol_start_date: "",
  pol_end_date: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  insured: "1",
  occupation_id: "",
  gender: "",
  previous_policy_check: "",
  disability: ""
};

const vehicleRegistrationValidation = Yup.object().shape({
  // insured: Yup.string().required("Please select insured type").nullable(),
  occupation_id: Yup.string().required("Please select occupation type"),
  gender: Yup.string().required("Please select gender").nullable(),
  insured: Yup.string().required("Please select insured type")
});

class AccidentAddDetails extends Component {
  state = {
    occupationList: [],
    requestedData: [],
    fulQuoteResp: [],
    serverResponse: [],
    error: {},
    validation_error: [],
    declineStatus: ""
  };

  changePlaceHoldClassAdd(e) {
    let element = e.target.parentElement;
    element.classList.add("active");
  }

  changePlaceHoldClassRemove(e) {
    let element = e.target.parentElement;
    e.target.value.length === 0 && element.classList.remove("active");
  }

  componentDidMount() {
    this.fetchData();
    this.fetchInsurance();
  }

  fetchData = () => {
    const { productId } = this.props.match.params;
    let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
    let encryption = new Encryption();
    axios
      .get(`ipa/details/${policyHolder_refNo}`)
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        // console.log("decrypt---accidentDetails--->>", decryptResp);
        let accidentDetails = decryptResp.data && decryptResp.data.policyHolder ? decryptResp.data.policyHolder : null;
        let requestedData = accidentDetails && accidentDetails.request_data ? accidentDetails.request_data : null;
        console.log("---accidentDetails--->>", accidentDetails);
        this.setState({
          accidentDetails, requestedData
        });
        this.props.loadingStop();
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });
  };


  select_Plan = (productId) => {
    // productId === 5
    this.props.history.push(`/AccidentSelectPlan/${productId}`);
  };

  handleChange = (e) => {
    const {occupationList} = this.state
    let declineStatus = ""
    if (occupationList) {
      {
        occupationList && occupationList.length > 0 && occupationList.map((insure, qIndex) => (
          insure.id == e.target.value ? insure.decline_status == "Decline" ? swal('Insurance Policy cannot be offered') : '' : '',
          insure.id == e.target.value && (declineStatus = insure.decline_status)     
        ))
      }
    }
    this.setState({
      serverResponse: [],
      error: [],
      declineStatus,
      selectedOption: []
    })
  }

  quote = (values, actions) => {
    const { accessToken, accidentDetails, declineStatus } = this.state
    if(declineStatus == "Decline") {
      swal('Insurance Policy cannot be offered')
      return false
    }
    const formData = new FormData();
    this.props.loadingStart();
    let date_of_birth = moment(accidentDetails.dob).format('yyyy-MM-DD');
    let ipaInfo = accidentDetails && accidentDetails.ipainfo ? accidentDetails.ipainfo : null
    const post_data = {
      'id': localStorage.getItem('policyHolder_id'),
      'proposer_dob': date_of_birth,
      'occupation_id': values.occupation_id,
    }
    let encryption = new Encryption();
    formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))

    axios
      .post(`/fullQuoteServiceIPA`, formData)
      .then(res => {
        if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
          this.setState({
            fulQuoteResp: res.data.PolicyObject,
            serverResponse: res.data.PolicyObject,
            error: [],
            validation_error: []
          })
          this.props.loadingStop();
        }
        else if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Fail") {
          this.setState({
            fulQuoteResp: res.data.PolicyObject,
            serverResponse: [],
            validation_error: [],
            error: { "message": 1 }
          })
          this.props.loadingStop();
        }
        else if (res.data.code && res.data.message && ((res.data.code == "validation failed" && res.data.message == "validation failed") || (res.data.code == "Policy Validation Error" && res.data.message == "Policy Validation Error"))) {
          var validationErrors = []
          for (const x in res.data.messages) {
            validationErrors.push(res.data.messages[x].message)
          }
          this.setState({
            fulQuoteResp: [],
            validation_error: validationErrors,
            error: [],
            serverResponse: []
          });
          // swal(res.data.data.messages[0].message)
          this.props.loadingStop();
        }
        else {
          this.setState({
            fulQuoteResp: [],
            error: res.data.ValidateResult,
            validation_error: [],
            serverResponse: []
          });
          this.props.loadingStop();
        }
        actions.setSubmitting(false)
      })
      .catch(err => {
        this.setState({
          serverResponse: []
        });
        this.props.loadingStop();
      });

  }


  handleSubmit = (values, actions) => {
    const { productId } = this.props.match.params
    const { accidentDetails, declineStatus } = this.state
    if(declineStatus == "Decline") {
      swal('Insurance Policy cannot be offered')
      return false
    }
    const formData = new FormData();
    let encryption = new Encryption();
    this.props.loadingStart();
    let policy_start_date = moment(values.pol_start_date).format('yyyy-MM-DD HH:mm:ss')
    let policy_end_date = moment(values.pol_end_date).format('yyyy-MM-DD HH:mm:ss')
    let post_data = {
      'policy_holder_id': accidentDetails.id,
      'menumaster_id': '9',
      'page_name': `AccidentAddDetails/${productId}`,
      'pol_start_date': policy_start_date,
      'pol_end_date': policy_end_date,
      'insured_type_id': values.insured,
      'claim_existing': values.previous_policy_check,
      'existing_physical_disability': values.disability,
      'occupation_id': values.occupation_id,
      'proposer_gender': values.gender
    }
    console.log('post_data', post_data);
    formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
    // this.props.loadingStart();
    if (values.previous_policy_check == 1) {
      swal('Insurance Policy cannot be offered')
    }
    else if (values.disability == 1) {
      swal('Insurance Policy cannot be offered')
    }
    axios
      .post(`ipa/policy-details`, formData)
      .then(res => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        console.log('decryptResp-----', decryptResp)
        this.props.loadingStop();
        if (decryptResp.error == false) {
          this.props.history.push(`/AccidentAdditionalDetails/${productId}`);
        } else {
          actions.setSubmitting(false)
          if (decryptResp.error == true) {
            swal(decryptResp.msg)
          }
        }
      })
      .catch(err => {
        this.props.loadingStop();
        actions.setSubmitting(false)
        let decryptErr = JSON.parse(encryption.decrypt(err.data));
        console.log('decryptErr-----', decryptErr)
      });

  }

  fetchInsurance = () => {
    let encryption = new Encryption();
    // this.props.loaderStart();
    axios
      .get("occupations")
      .then((res) => {
        let decryptErr = JSON.parse(encryption.decrypt(res.data));
        console.log('decrypOccupation-----', decryptErr)
        this.setState({ occupationList: decryptErr.data });
        this.props.loadingStop();
      })
      .catch((err) => {
        this.props.loadingStop();
      });
  };

  handleSelectedValChange = (selectedOption,setFieldValue,setFieldTouched)  => {
    setFieldValue('occupation_id', selectedOption.value)
    this.setState({ selectedOption });
    console.log(`Option selected:`, selectedOption);
  };

  render() {
    const { occupationList, accidentDetails, requestedData, serverResponse, validation_error, error, selectedOption } = this.state;
    const { productId } = this.props.match.params
    const newInitialValues = Object.assign(initialValues, {
      pol_start_date: requestedData && requestedData.start_date ? new Date(requestedData.start_date) : new Date(),
      pol_end_date: requestedData && requestedData.end_date ? new Date(requestedData.end_date) : new Date(moment().add(364, "day").calendar()),
      insured: accidentDetails && accidentDetails.ipainfo && accidentDetails.ipainfo.insured_type_id != 0 ? accidentDetails.ipainfo.insured_type_id : "1",
      previous_policy_check: 0,
      disability: 0,
      first_name: accidentDetails ? accidentDetails.first_name : "",
      last_name: accidentDetails ? accidentDetails.last_name : "",
      date_of_birth: accidentDetails && accidentDetails.dob ? new Date(accidentDetails.dob) : "",
      occupation_id: accidentDetails && accidentDetails.ipainfo && accidentDetails.ipainfo.occupation ? accidentDetails.ipainfo.occupation.id : "",
      gender: accidentDetails ? accidentDetails.gender : ""
    });
    
    const errMsg = error && error.message ? (
      <span className="errorMsg"><h6><strong>{error.message}</strong></h6></span>
      // <span className="errorMsg"><h6><strong>Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111</strong></h6></span>                                
    ) : null

    const validationErrors =
      validation_error ? (
        validation_error.map((errors, qIndex) => (
          <span className="errorMsg"><h6>Errors :
                  <strong>
              <ul>
                <li>
                  {errors}
                </li>
              </ul>
            </strong></h6>
          </span>
        ))
      ) : null;

      const options = 
        occupationList && occupationList.length > 0 ? occupationList.map((insurer, qIndex) => (
          { value: insurer.id, label: insurer.occupation }
        )) : []
        

      // const options = [
      //   { value: 'chocolate', label: 'Chocolate' },
      //   { value: 'strawberry', label: 'Strawberry' },
      //   { value: 'vanilla', label: 'Vanilla' },
      // ];

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
			  		  
              <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox add2">
                <h4 className="text-center mt-3 mb-3">
                  SBI General Insurance Company Limited
                </h4>
                <section className="brand">
                  <div className="boxpd">
                    <div>{errMsg}</div>
                    <h4>{validationErrors}</h4>
                    <Formik
                      initialValues={newInitialValues}
                      onSubmit={serverResponse && serverResponse != "" ? (serverResponse.message ? this.quote : this.handleSubmit) : this.quote}
                      validationSchema={vehicleRegistrationValidation}
                    >
                      {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                        console.log('values------------------',values)

                        return (
                          <Form>
                            <Row>
                              <Col sm={6} md={4} lg={4}>
                                <h6>Policy start date:</h6>
                              </Col>
                              <Col sm={6} md={4} lg={4}>
                                <FormGroup>
                                  <div className="formSection">
                                    <DatePicker
                                      name="pol_start_date"
                                      //   excludeOutOfBoundsTimes
                                      //   dropdownMode="select"
                                      dateFormat="yyyy-MM-dd"
                                      timeFormat="HH:mm:ss"
                                      className="datePckr inputfs12"
                                      disabled={true}
                                      selected={values.pol_start_date}
                                      onChange={(val) => {
                                        setFieldTouched("pol_start_date");
                                        setFieldValue("pol_start_date", val);
                                      }}
                                    />
                                    {errors.pol_start_date && touched.pol_start_date ? (
                                      <span className="errorMsg">
                                        {errors.pol_start_date}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col sm={6} md={4} lg={4}>
                                <h6>Policy end date</h6>
                              </Col>
                              <Col sm={6} md={4} lg={4}>
                                <FormGroup>
                                  <div className="formSection">
                                    <DatePicker
                                      name="pol_end_date"
                                      dateFormat="yyyy-MM-dd"
                                      timeFormat="HH:mm:ss"
                                      className="datePckr inputfs12"
                                      disabled={true}
                                      // minDate={new Date(values.pol_end_date)}
                                      selected={values.pol_end_date}
                                      onChange={(val) => {
                                        setFieldTouched('pol_end_date');
                                        setFieldValue('pol_end_date', val);
                                      }}
                                    />
                                    {errors.pol_end_date &&
                                      touched.pol_end_date ? (
                                        <span className="errorMsg">
                                          {errors.pol_end_date}
                                        </span>
                                      ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              {" "}
                              <h1> </h1>{" "}
                            </Row>
                            <div className="d-flex justify-content-left">
                              <div className="brandhead">
                                <h4>Insured details</h4>
                              </div>
                            </div>
                            <Row>
                              {" "}
                              <h1> </h1>{" "}
                            </Row>
                            <Row>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="insured"
                                      component="select"
                                      autoComplete="off"
                                      className="formGrp"
                                    >
                                      <option value="">Insured Type</option>
                                      <option value="1">Primary Insured</option>
                                    </Field>
                                    {errors.insured && touched.insured ? (
                                      <span className="errorMsg">
                                        {errors.insured}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="first_name"
                                      type="text"
                                      placeholder="First Name"
                                      autoComplete="off"
                                      disabled={true}
                                      // onFocus={(e) =>
                                      //   this.changePlaceHoldClassAdd(e)
                                      // }
                                      // onBlur={(e) =>
                                      //   this.changePlaceHoldClassRemove(e)
                                      // }
                                      value={values.first_name}
                                    />
                                    {errors.first_name && touched.first_name ? (
                                      <span className="errorMsg">
                                        {errors.first_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="last_name"
                                      type="text"
                                      placeholder="Last Name"
                                      autoComplete="off"
                                      disabled={true}
                                      // onFocus={(e) =>
                                      //   this.changePlaceHoldClassAdd(e)
                                      // }
                                      // onBlur={(e) =>
                                      //   this.changePlaceHoldClassRemove(e)
                                      // }
                                      value={values.last_name}
                                    />
                                    {errors.last_name && touched.last_name ? (
                                      <span className="errorMsg">
                                        {errors.last_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>

                            <Row>
                              <Col sm={6} md={4} lg={5}>
                                <FormGroup>
                                  <DatePicker
                                    name="date_of_birth"
                                    dateFormat="dd MMM yyyy"
                                    placeholderText="DOB"
                                    peekPreviousMonth
                                    peekPreviousYear
                                    showMonthDropdown
                                    showYearDropdown
                                    disabled={true}
                                    dropdownMode="select"
                                    // maxDate={new Date(maxDobAdult)}
                                    // minDate={new Date(minDobAdult)}
                                    className="datePckr"
                                    selected={values.date_of_birth}
                                    onChange={(val) => {
                                      setFieldTouched("date_of_birth");
                                      setFieldValue("date_of_birth", val);
                                    }}
                                  />
                                  {errors.date_of_birth &&
                                    touched.date_of_birth ? (
                                      <span className="errorMsg">
                                        {errors.date_of_birth}
                                      </span>
                                    ) : null}
                                </FormGroup>
                              </Col>
                              <Col sm={6} md={4} lg={4}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="gender"
                                      component="select"
                                      autoComplete="off"
                                      className="formGrp"
                                    >
                                      <option value="">Select Gender</option>
                                      <option value="m">Male</option>
                                      <option value="f">Female</option>
                                    </Field>
                                    {errors.gender && touched.gender ? (
                                      <span className="errorMsg">
                                        {errors.gender}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                            <Col sm={6} md={6} lg={9}>
                                <FormGroup>
                                  {/* <div className="formSection">
                                    <Field
                                      name="occupation_id"
                                      component="select"
                                      autoComplete="off"
                                      className="formGrp"
                                      onChange={(e) => {
                                        setFieldTouched("occupation_id");
                                        setFieldValue(
                                          "occupation_id",
                                          e.target.value
                                        );
                                        this.handleChange(e);
                                      }}
                                    >
                                      <option value="">Occupation Type</option>
                                      {occupationList && occupationList.length > 0 && occupationList.map((insurer, qIndex) => (
                                        <option key={qIndex} value={insurer.id} > {insurer.occupation} </option>
                                      ))}
                                    </Field>
                                    {errors.occupation_id && touched.occupation_id ? (
                                      <span className="errorMsg">
                                        {errors.occupation_id}
                                      </span>
                                    ) : null}
                                  </div> */}
                                  <div className="formSection">
                                  <Select
                                  placeholder = "Select Occupation"
                                  value={selectedOption ? selectedOption : options ? options.find(option => option.value === values.occupation_id ) : ''}
                                  name='occupation_id'
                                  onChange={(e)=>this.handleSelectedValChange(e,setFieldValue,setFieldTouched)}
                                  options={options}
                                  />
                                    {errors.occupation_id && touched.occupation_id ? (
                                      <span className="errorMsg">
                                        {errors.occupation_id}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col sm={12} md={9} lg={9}>
                                <FormGroup>
                                  <div className="d-flex justify-content-left">
                                    <div className="brandhead">
                                      <h4 className="fs-18 m-b-32">
                                        {" "}
                                        Have you made any claim in any existing
                                        or previous accident policy?{" "}
                                      </h4>
                                    </div>
                                  </div>
                                  <div className="d-inline-flex m-b-35">
                                    <div className="p-r-25">
                                      <label className="customRadio3">
                                        <Field
                                          type="radio"
                                          name="previous_policy_check"
                                          value="0"
                                          key="1"
                                          checked={
                                            values.previous_policy_check == "0" ? true : false}
                                          onChange={(e) => {
                                            setFieldTouched("previous_policy_check");
                                            setFieldValue("previous_policy_check", e.target.value);
                                            // this.handleChange(
                                            //   values,
                                            //   setFieldTouched,
                                            //   setFieldValue
                                            // );
                                          }}
                                        />
                                        <span className="checkmark " />
                                        <span className="fs-14"> No</span>
                                      </label>
                                    </div>
                                    <div className="p-r-25">
                                      <label className="customRadio3">
                                        <Field
                                          type="radio"
                                          name="previous_policy_check"
                                          value="1"
                                          key="1"
                                          checked={
                                            values.previous_policy_check == "1" ? true : false}
                                          onChange={(e) => {
                                            setFieldTouched("previous_policy_check");
                                            setFieldValue("previous_policy_check", e.target.value);
                                            // this.handleChange(
                                            //   values,
                                            //   setFieldTouched,
                                            //   setFieldValue
                                            // );
                                          }}
                                        />
                                        <span className="checkmark " />
                                        <span className="fs-14"> Yes</span>
                                      </label>
                                      {errors.previous_policy_check && touched.previous_policy_check ? (
                                        <span className="errorMsg">
                                          {errors.previous_policy_check}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <div className="d-flex justify-content-left">
                              <div className="brandhead">
                                <h4 className="fs-18 m-b-32">
                                  Do yo have any existing physical disability?
                                </h4>
                                <div className="d-inline-flex m-b-15">
                                  <div className="p-r-25">
                                    <label className="customRadio3">
                                      <Field
                                        type="radio"
                                        name="disability"
                                        value="0"
                                        key="1"
                                        checked={
                                          values.disability == "0" ? true : false}
                                        onChange={(e) => {
                                          setFieldTouched("disability");
                                          setFieldValue("disability", e.target.value);
                                          // this.handleChange(
                                          //   values,
                                          //   setFieldTouched,
                                          //   setFieldValue
                                          // );
                                        }}
                                      />
                                      <span className="checkmark " />
                                      <span className="fs-14"> No</span>
                                    </label>
                                  </div>
                                  <div className="p-r-25">
                                    <label className="customRadio3">
                                      <Field
                                        type="radio"
                                        name="disability"
                                        value="1"
                                        key="1"
                                        checked={
                                          values.disability == "1" ? true : false}
                                        onChange={(e) => {
                                          setFieldTouched("disability");
                                          setFieldValue("disability", e.target.value);
                                          // this.handleChange(
                                          //   values,
                                          //   setFieldTouched,
                                          //   setFieldValue
                                          // );
                                        }}
                                      />
                                      <span className="checkmark " />
                                      <span className="fs-14"> Yes</span>
                                    </label>
                                    {errors.disability && touched.disability ? (
                                      <span className="errorMsg">
                                        {errors.disability}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                            { serverResponse && serverResponse.QuotationNo ?
                              <Row className="d-flex justify-content-left carloan m-b-25">
                                <Col sm={4}>
                                  <div className="d-flex justify-content-between align-items-center premium m-b-25">
                                    <p>Quotation No:</p>
                                    <p><b> {serverResponse ? (serverResponse.message ? "---" : serverResponse.QuotationNo) : "---"}</b></p>
                                  </div>
                                </Col>
                                <Col sm={4}>
                                  <div className="d-flex justify-content-between align-items-center premium m-b-25">
                                    <p>Total Premium:</p>
                                    <p><strong>Rs: {serverResponse ? (serverResponse.message ? 0 : serverResponse.DuePremium) : 0}</strong></p>
                                  </div>
                                </Col>
                              </Row>
                              : null}

                            <div className="d-flex justify-content-left carloan">
                              <h4> </h4>
                            </div>
                            <div className="d-flex justify-content-left resmb">
                              <Button
                                className={`backBtn`}
                                type="button"
                                onClick={this.select_Plan.bind(this, productId)}
                              >
                                {isSubmitting ? "Wait.." : "Back"}
                              </Button>
                              {serverResponse && serverResponse != "" ? (serverResponse.message ?
                                <Button className={`proceedBtn`} type="submit"  >
                                  Quote
                                  </Button> : <Button className={`proceedBtn`} type="submit"  >
                                  Continue
                                  </Button>) : <Button className={`proceedBtn`} type="submit"  >
                                  Quote
                                  </Button>}
                            </div>
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

const mapStateToProps = (state) => {
  return {
    loading: state.loader.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadingStart: () => dispatch(loaderStart()),
    loadingStop: () => dispatch(loaderStop()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AccidentAddDetails)
);
