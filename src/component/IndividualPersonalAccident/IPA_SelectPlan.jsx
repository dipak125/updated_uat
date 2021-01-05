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
import moment from "moment";

const minDobAdult = moment(moment().subtract(65, 'years').calendar()).format("YYYY-MM-DD")
const maxDobAdult = moment().subtract(18, 'years').format("YYYY-MM-DD");

const initialValues = {
    titleList: []
};

const sum_insured_array = {
  1:100000,
  2:200000,
  3:300000,
  4:400000,
  5:500000
}

const vehicleRegistrationValidation = Yup.object().shape({  
  salutation_id: Yup.string().required('Title is required').nullable(),
  first_name: Yup.string().required('First Name is required').min(3, function() {return "First name must be 3 characters"}).max(40,function() {
      return "First name must be maximum 40 characters"
  }).matches(/^[A-Za-z]+$/, function() {return "Please enter valid first name"}).nullable(),
  last_name: Yup.string().required('Last Name is required').min(1, function() {return "Last name must be 1 characters"}).max(40, function() {return "Last name must be maximum 40 characters"})
  .matches(/^[A-Za-z]+$/, function() {
      return "Please enter valid last name"
  }).nullable(),
  // last_name: Yup.string().required('Name is required').nullable(),
  date_of_birth: Yup.date().required("Please enter date of birth").nullable(),
  email_id: Yup.string().email().min(8, function() {
      return "Email must be minimum 8 characters"
  })
  .max(75, function() {
      return "Email must be maximum 75 characters"
  }).matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9]+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,'Invalid Email Id').nullable(),
  mobile: Yup.string()
  .matches(/^[6-9][0-9]{9}$/,'Invalid Mobile number').required('Mobile No. is required').nullable(),
  // gender: Yup.string().required("Please select gender").nullable(),
  sumInsured: Yup.number().required("Please select sum insured").nullable()
});

class AccidentSelectPlan extends Component {
  state = {
    accidentDetails: []
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
    this.fetchSalutation();
    this.fetchData();
  }

  fetchSalutation=()=>{
      const formData = new FormData();
      let encryption = new Encryption();
      this.props.loadingStart();
      let post_data = {
        'policy_for_flag': '1',
    }
      formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
      axios.post('ipa/titles', formData)
      .then(res=>{
        let decryptResp = JSON.parse(encryption.decrypt(res.data))
        console.log("decrypt", decryptResp)
          let titleList = decryptResp.data.salutationlist
          console.log('titlelist----->>',titleList)                       
          this.setState({
              titleList
          });
          this.props.loadingStop();
      }).
      catch(err=>{
          this.props.loadingStop();
          this.setState({
              titleList: []
          });
      })  
  }

  handleSubmit = (values,actions) => {
    const {productId} = this.props.match.params;
    const formData = new FormData();
    let encryption = new Encryption();
    // const {} = this.state;
    let date_of_birth = moment(values.date_of_birth).format('yyyy-MM-DD');
    this.props.loadingStart();
    let post_data = {
          'menumaster_id': '9',
          'page_name': `Registration_SME/${productId}`,
          'vehicle_type_id': '13',
          'sum_insured' : values.sumInsured ? sum_insured_array[values.sumInsured] : null,
          'proposer_title_id' : values.salutation_id,
          'proposer_first_name' : values.first_name,
          'proposer_last_name' : values.last_name,
          'proposer_dob' : date_of_birth,
          'proposer_mobile' : values.mobile,
          'proposer_email' : values.email_id,
          // 'proposer_gender' : 'm'
      }
      let policyHolder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') :0

      if(sessionStorage.getItem('csc_id')) {
          post_data['bcmaster_id'] = '2'
          post_data['csc_id'] = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : ""
          post_data['agent_name']= sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : ""
          post_data['product_id'] = productId
      }else{
          let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
          if(bc_data) {
              bc_data = JSON.parse(encryption.decrypt(bc_data));
              post_data['bcmaster_id'] = bc_data ? bc_data.agent_id : ""
              post_data['bc_token'] = bc_data ? bc_data.token : ""
              post_data['bc_agent_id']= bc_data ? bc_data.user_info.data.user.username : ""
              post_data['product_id'] = productId
          }
      }
      console.log('Post data------>>',post_data)

      if(policyHolder_id > 0){
        post_data['policy_holder_id'] = policyHolder_id
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        axios.post('ipa/update-registration',
        formData
        ).then(res=>{
          let decryptResp = JSON.parse(encryption.decrypt(res.data))
          console.log("decrypt", decryptResp)

          if(decryptResp.error == false) {
              // this.props.history.push(`/AccidentAddDetails/${productId}`);
              this.quote(values)
          }
          else{
              swal(decryptResp.msg)
              actions.setSubmitting(false);
          }    
        }).
        catch(err=>{
            this.props.loadingStop();
            let decryptResp = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptErr-----', decryptResp)
            actions.setSubmitting(false);
        })
    }
    else{
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        axios.post('ipa/registration',
        formData
        ).then(res=>{     
          let decryptResp = JSON.parse(encryption.decrypt(res.data))
          console.log("decrypt", decryptResp)
          localStorage.setItem('policyHolder_refNo',decryptResp.data.policyHolder_refNo);
          localStorage.setItem('policyHolder_id',decryptResp.data.policyHolder_id);
          this.props.loadingStop();
          if(decryptResp.error == false) {
              // this.props.history.push(`/AccidentAddDetails/${productId}`);
              this.quote(values)
          }
          else{
              swal(decryptResp.msg)
              actions.setSubmitting(false);
          }   
          this.props.loadingStop();
          actions.setSubmitting(false);
        }).
        catch(err=>{
            let decryptResp = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptErr-----', decryptResp)
            this.props.loadingStop();
            actions.setSubmitting(false);
        })
    }
  };

  handleSubmitNxtPage = (values,actions) => {
    this.props.history.push(`/AccidentAddDetails/${this.props.match.params.productId}`);
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
        console.log("---accidentDetails--->>", accidentDetails);
        this.setState({
          accidentDetails
        });
        this.props.loadingStop();
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });
  };

  quote = (values) => {
    //console.log('value', value)
    const {accessToken} = this.state 
    const formData = new FormData(); 
    this.props.loadingStart();
    let date_of_birth = moment(values.date_of_birth).format('yyyy-MM-DD');
    const post_data = {
        'id':localStorage.getItem('policyHolder_id'),
        'proposer_dob': date_of_birth ,
        'sum_insured': values.sumInsured ? sum_insured_array[values.sumInsured] : null
    }
    let encryption = new Encryption();
    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))

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
              error: {"message": 1}
          }) 
          this.props.loadingStop();
      }
      else if (res.data.code && res.data.message && res.data.code == "validation failed" && res.data.message == "validation failed") {
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
      })
      .catch(err => {
        this.setState({
          serverResponse: []
        });
        this.props.loadingStop();
      });
  
}

handleChange =(e) => {
  this.setState({
      serverResponse: [],
      error: []
  }) 
}


  render() {
    const {titleList, accidentDetails, serverResponse, validation_error, error} = this.state;
    const newInitialValues = Object.assign(initialValues, {
      sumInsured: accidentDetails && accidentDetails.ipainfo ? accidentDetails.ipainfo.sum_insured == 100000 ? 1 : accidentDetails.ipainfo.sum_insured == 200000 ? 2 : accidentDetails.ipainfo.sum_insured == 300000 ? 3 : accidentDetails.ipainfo.sum_insured == 400000 ? 4 : accidentDetails.ipainfo.sum_insured == 500000 ? 5 : 0 : null,
      salutation_id: accidentDetails && accidentDetails.ipainfo ? accidentDetails.ipainfo.ipatitle.id : "",
      first_name: accidentDetails ? accidentDetails.first_name : "",
      last_name: accidentDetails ? accidentDetails.last_name : "",
      date_of_birth: accidentDetails && accidentDetails.dob ? new Date(accidentDetails.dob) : null,
      mobile: accidentDetails ? accidentDetails.mobile : "",
      email_id: accidentDetails ? accidentDetails.email_id : "",
      proposer_gender: accidentDetails ? accidentDetails.gender : ""
    });

    const errMsg =  error && error.message ? (            
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
    ): null;

    return (
      <>
        <BaseComponent>
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                <SideNav />
              </div>
              <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                <h4 className="text-center mt-3 mb-3">
                  SBI General Insurance Company Limited
                </h4>
                <section className="brand">
                  <div className="boxpd">
                    <div>{errMsg}</div>
                    <h4>{validationErrors}</h4>
                    <Formik initialValues={newInitialValues} 
                    onSubmit={ serverResponse && serverResponse != "" ? (serverResponse.message ? this.handleSubmit : this.handleSubmitNxtPage ) : this.handleSubmit}
                    validationSchema={vehicleRegistrationValidation}>
                      {({
                        values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched, }) => {
                        // console.log('values',values)
                        return (
                          <Form>
                            <div className="brandhead">
                                <h4>Select the Sum Insured for individual personal accident</h4>
                            </div>
                            <Row> <h1> </h1> </Row>
                            <Row>
                                <Col sm={12} md={3} lg={3}>
                                  <FormGroup>Sum Insured</FormGroup>
                                </Col>
                                <Col sm={12} md={4} lg={4}>
                                  <FormGroup>
                                    <div className="formSection">
                                      <Field
                                        name="sumInsured"
                                        // type="text"
                                        component="select"
                                        autoComplete="off"
                                        value={values.sumInsured}
                                        className="formGrp"
                                        onChange={(e) => {
                                          setFieldTouched("sumInsured");
                                          setFieldValue(
                                            "sumInsured",
                                            e.target.value
                                          );
                                          this.handleChange(e);
                                        }}
                                      >
                                        <option value="">
                                          Select sum insured
                                        </option>
                                        <option value="1">100 000</option>
                                        <option value="2">200 000</option>
                                        <option value="3">300 000</option>
                                        <option value="4">400 000</option>
                                        <option value="5">500 000</option>
                                      </Field>
                                      {errors.sumInsured && touched.sumInsured ? (<span className="errorMsg"> {errors.sumInsured} </span>
                                      ) : null}
                                    </div>
                                  </FormGroup>
                                </Col>
                            </Row>
                            <Row><h4>&nbsp;</h4></Row>
                            { serverResponse && serverResponse.QuotationNo ?
                            <Row className="d-flex justify-content-left carloan m-b-25"> 
                            <Col sm={4}>
                                <div className="d-flex justify-content-between align-items-center premium m-b-25">
                                    <p>Quotation No:</p>
                                    <p><b> { serverResponse ? (serverResponse.message ? "---" : serverResponse.QuotationNo ) :"---"}</b></p>
                                </div>
                            </Col>
                            <Col sm={4}>
                                <div className="d-flex justify-content-between align-items-center premium m-b-25">
                                    <p>Total Premium:</p>
                                    <p><strong>Rs: { serverResponse ? (serverResponse.message ? 0 : serverResponse.DuePremium ) : 0}</strong></p>
                                </div>
                            </Col>
                            </Row>
                            : null }
                                <div className="d-flex justify-content-left">
                                <div className="brandhead">
                                    <h4>Enter proposer details</h4>
                                </div>
                                </div>
                            <Row> <h1> </h1> </Row>
                            <Row>
                                    <Col sm={12} md={2} lg={2}>
                                        <FormGroup>
                                            <div className="formSection">
                                            <Field
                                                name='salutation_id'
                                                component="select"
                                                autoComplete="off"                                                                        
                                                className="formGrp"
                                            >
                                                <option value="">Title</option>
                                                {titleList && titleList.length >0 && titleList.map((title, qIndex) => ( 
                                                <option value={title.id}>{title.displayvalue}</option>
                                                ))}
                                            </Field>     
                                            {errors.salutation_id && touched.salutation_id ? (
                                            <span className="errorMsg">{errors.salutation_id}</span>
                                            ) : null}               
                                            </div>
                                        </FormGroup>
                                    </Col>

                                    <Col sm={6} md={3} lg={3}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='first_name'
                                                type="text"
                                                placeholder= "First Name"
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

                                    <Col sm={6} md={3} lg={3}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='last_name'
                                                type="text"
                                                placeholder= "Last Name"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.last_name}                                                                            
                                            />
                                                {errors.last_name && touched.last_name ? (
                                            <span className="errorMsg">{errors.last_name}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={2} lg={2}>
                                            <FormGroup>
                                            <DatePicker
                                                name="date_of_birth"
                                                dateFormat="yyyy-MM-dd"
                                                placeholderText="DOB"
                                                peekPreviousMonth
                                                peekPreviousYear
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                maxDate={new Date(maxDobAdult)}
                                                minDate={new Date(minDobAdult)}
                                                className="datePckr"
                                                selected={values.date_of_birth}
                                                onChange={(val) => {
                                                    setFieldTouched('date_of_birth');
                                                    setFieldValue('date_of_birth', val);
                                                    this.handleChange()
                                                    }}
                                            />
                                            {errors.date_of_birth && touched.date_of_birth ? (
                                                <span className="errorMsg">{errors.date_of_birth}</span>
                                            ) : null}  
                                            </FormGroup>
                                        </Col>
                                        <Col sm={6} md={3} lg={3}>
                                            <FormGroup className="m-b-25">
                                                <div className="insurerName nmbract">
                                                    <span>+91</span>
                                                <Field
                                                    name='mobile'
                                                    type="text"
                                                    placeholder="Mobile No. "
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value = {values.mobile}
                                                    maxLength="10" 
                                                    className="phoneinput pd-l-25"                                                                          
                                                />
                                                {errors.mobile && touched.mobile ? (
                                                <span className="errorMsg msgpositn">{errors.mobile}</span>
                                                ) : null}  
                                                </div>
                                            </FormGroup>
                                        </Col>   
                                        <Col sm={6} md={3} lg={3}>
                                            <FormGroup>
                                                <div className="insurerName">
                                                <Field
                                                    name='email_id'
                                                    type="email"
                                                    placeholder="Email "
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value = {values.email_id}                                                                            
                                                />
                                                {errors.email_id && touched.email_id ? (
                                                <span className="errorMsg">{errors.email_id}</span>
                                                ) : null}  
                                                </div>
                                            </FormGroup>
                                        </Col>                        
                                </Row>
                                <Row>
                                </Row>

                                <div className="d-flex justify-content-left carloan">
                                    <h4> </h4>
                                </div>
                                <div className="d-flex justify-content-left resmb">
                                { serverResponse && serverResponse != "" ? (serverResponse.message ? 
                                  <Button className={`proceedBtn`} type="submit"  >
                                      Quote
                                  </Button> : <Button className={`proceedBtn`} type="submit"  >
                                      Continue
                                  </Button> ) : <Button className={`proceedBtn`} type="submit"  >
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
  connect(mapStateToProps, mapDispatchToProps)(AccidentSelectPlan)
);
