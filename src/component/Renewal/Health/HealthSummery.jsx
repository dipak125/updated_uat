import React, { Component } from "react";
import { Row, Col, Modal, Button, FormGroup } from "react-bootstrap";
import BaseComponent from "../../BaseComponent";
import SideNav from "../../common/side-nav/SideNav";
import Footer from "../../common/footer/Footer";
import axios from "../../../shared/axios";
import { withRouter, Link } from "react-router-dom";
import { loaderStart, loaderStop } from "../../../store/actions/loader";
import { connect } from "react-redux";
import swal from "sweetalert";
import Encryption from "../../../shared/payload-encryption";
import { Formik, Form, Field, ErrorMessage } from "formik";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.min.css";
import moment from "moment";
import Collapsible from "react-collapsible";
import queryString from 'query-string';


const initialValue = {
  gateway : ""
};

const genderArr = {
  m: "Male",
  f: "Female",
};

const static_relation_model = {
  2: 'Spouse',
  3: 'Son',
  4: 'Daughter',
  5: 'Father',
  6: 'Mother',
  7: 'Father In Law',
  8: 'Mother In Law'
};


const Coverage = {

  "IPA101": "Accidental Death",
  "IPA102": "Permanent Total Disability",
  "IPA103": "Permanent Pertial Disability",
  "IPA104": "Temporary Total Disability",
  "IPA105": "Adaptation allowance",
  "IPA106": "Education Benefit",
}

const arogyaSanjeevaniCoverage = () => {
  return(
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
  )
}

const arogyaTopupCoverage = () => {
  return(
    <div className="justify-content-left align-items-center list m-b-30">
      <p>Your Health Insurance covers you for following :</p>
      <ul>
          <li>Your hospital room rent,boarding expenses and doctor fees</li>
          <li>Nursing expenses.Operation theatre and ICU charges</li>
          <li>Medicines that you consume during the hospital stay</li>
          <li>Road Ambulance Charges</li>
          <li>Day Care expenses for 142 daycare procedures</li>
          <li>Pre and Post hospitalization expenses up to 60 and 90 days respectively</li>
      </ul>
    </div>
  )
}

const ksbCoverage = () => {
  return(
    <div className="justify-content-left align-items-center list m-b-30">
      <p>Your Health Insurance covers you for following :</p>
      <ul><b>Base</b>
          <li>24 Doctor consultation calls in a year</li>
          <li>1 lakh PA Cover to Primary Insured </li>
      </ul>
      <ul><b>Medium</b>
          <li>36 Doctor Consultation calls in a year</li>
          <li>Hospital Daily Cash Benefit of Rs 250/day up to 30 Days </li>
          <li>3 Lakhs PA Cover to Primary Insured  </li>
      </ul>
      <ul><b>Top</b>
          <li>60 Doctor Consultation calls in a year</li>
          <li>Hospital Daily Cash Benefit of Rs 250/day up to 60 Days </li>
          <li>5 Lakhs PA Cover to Primary Insured</li>
      </ul>
    </div>
  )
}


class HealthSummery extends Component {
  state = {
    occupationList: [],
    accessToken: "",
    policyHolder: [],
    familyMember: [],
    fulQuoteResp: [],
    error: [],
    purchaseData: [],
    error1: [],
    show: false,
    policyCoverage: [],
    paymentStatus: [],
    relationArr: {},
    request_data: [],
    policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 
                        queryString.parse(this.props.location.search).access_id : 
                        localStorage.getItem("policyHolder_refNo"),
    ipaInfo: []
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
  }
  

  // fetchRelationships=()=>{	
  //   this.props.loadingStart();	
  //   axios.get('relations')	
  //   .then(res=>{	
  //       let relation = res.data.data ? res.data.data : []                        	
  //       this.setState({	
  //           relation	
  //       });	
  //       this.fetchData()
  //   }).	
  //   catch(err=>{	
  //       this.props.loadingStop();	
  //       this.setState({	
  //           relation: []	
  //       });	
  //   })	
  
  // }
  
  sendPaymentLink = () => {
    let encryption = new Encryption();
    const formData = new FormData();
    let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
    formData.append('reference_no', policyHolder_refNo)

    this.props.loadingStart();
    axios
      .post("send-payment-link", formData)
      .then((res) => {
        swal(res.data.msg)
        this.props.loadingStop();
      })
      .catch((err) => {
        this.props.loadingStop();
      });
  };


  fetchData = () => {	
    const { productId } = this.props.match.params	
    let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'	
    let encryption = new Encryption();	
    this.props.loadingStart();
    axios.get(`renewal/policy-details/${policyHolder_id}`)	
        .then(res => {	
            // let decryptResp = JSON.parse(encryption.decrypt(res.data))
            let decryptResp = res.data
            console.log("decrypt", decryptResp)	
            let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [];	
            let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};	
            let request_data = decryptResp.data.policyHolder && decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data : {}	
            let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";	
            let bcMaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.bcmaster : {};	
            let menumaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.menumaster : {};
            let policyCoverage = decryptResp.data.policyHolder && decryptResp.data.policyHolder.renewalinfo && decryptResp.data.policyHolder.renewalinfo.renewalcoverage ? decryptResp.data.policyHolder.renewalinfo.renewalcoverage : []	
              
            this.setState({	
                policyHolder,vehicleDetails,request_data,menumaster,step_completed, bcMaster,	policyCoverage,
                paymentStatus: decryptResp.data.policyHolder.payment ? decryptResp.data.policyHolder.payment[0] : [],	
                nomineeDetails: request_data && request_data.nominee ? request_data.nominee[0]:[]	
            })	
            this.props.loadingStop();     	
        })	
        .catch(err => {	
            // handle error	
            this.props.loadingStop();	
        })	
}	



  handleSubmit = (values) => {
    // this.setState({ show: true, refNo: values.refNo, whatsapp: values.whatsapp });
    const policyHolder = this.state.policyHolder

    if(policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.slug && values.gateway == 1) {
        if(policyHolder.bcmaster.paymentgateway.slug == "csc_wallet") {
            this.payment()
        }
        if(policyHolder.bcmaster.paymentgateway.slug == "razorpay") {
            this.Razor_payment()
        }
        if(policyHolder.bcmaster.paymentgateway.slug == "PPINL") {
            this.paypoint_payment()
        }
    }
    else if (policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.slug && values.gateway == 2) {
        this.props.history.push(`/Vedvag_gateway/${this.props.match.params.productId}?access_id=${this.state.policyHolder_refNo}`);
    }
}

  payment = () => {
    const { policyHolder_refNo } = this.state;
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment_renewal.php?refrence_no=${policyHolder_refNo}`
  }

  Razor_payment = () => {
      const { policyHolder_refNo } = this.state;
      window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/renewal_pay.php?refrence_no=${policyHolder_refNo}`
  }

  paypoint_payment = () => {
      const { policyHolder_refNo } = this.state;
      window.location = `${process.env.REACT_APP_PAYMENT_URL}/ppinl/pay.php?refrence_no=${policyHolder_refNo}`
  }


  render() {
    const { productId } = this.props.match.params;
    const { fulQuoteResp, error, show, policyHolder, nomineeDetails, paymentStatus, policyCoverage, 
      request_data, bcMaster, menumaster, vehicleDetails } = this.state;

    const policyCoverageList =  policyCoverage && policyCoverage.length > 0 ?(
      <div><p>Your Health Insurance covers you for following :</p>
        <ul>
      {
        policyCoverage.map((coverage, qIndex) => (
            coverage.renewalsubcoverage && coverage.renewalsubcoverage.length > 0 ? coverage.renewalsubcoverage.map((benefit, bIndex) => (
                // parseInt(benefit.interest_premium) != 0 ?
                    <li>{benefit.interest_name}</li>                   
                // : null
        )) : 
            <li>{coverage.cover_name}</li>
        )) 
      }
      </ul></div>
    ): null 

      const memberDetails =
      vehicleDetails && vehicleDetails.vehicletype && vehicleDetails.vehicletype.is_helth == 1 &&
      request_data && request_data.family_members.length > 0 
        ? request_data.family_members.map((member, qIndex) => {
            return (
              <div>
              <Row>
                <Col sm={12} md={6}>
                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Name:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{member.first_name +" "+(member.last_name ? member.last_name : "")}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Date Of Birth:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{moment(member.dob).format("DD-MM-YYYY")}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Gender</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{genderArr[member.gender]}</FormGroup>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
              <p></p>
              </Row>
              </div>
            );
          })
        :  vehicleDetails && vehicleDetails.vehicletype && vehicleDetails.vehicletype.is_helth == 3 ? 
                <div>
                <Row>
                  <Col sm={12} md={6}>
                    <Row>
                      <Col sm={12} md={6}>
                        <FormGroup>Name:</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                        <FormGroup>{policyHolder.first_name}</FormGroup>
                      </Col>
                    </Row>
  
                    <Row>
                      <Col sm={12} md={6}>
                        <FormGroup>Date Of Birth:</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                        <FormGroup>{moment(policyHolder.dob).format("DD-MM-YYYY")}</FormGroup>
                      </Col>
                    </Row>
  
                    <Row>
                      <Col sm={12} md={6}>
                        <FormGroup>Gender</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                        <FormGroup>{genderArr[policyHolder.gender]}</FormGroup>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                <p></p>
                </Row>
                </div>
               : null 

        const nomineeData = 
        <div>
          <Row>
              <Col sm={12} md={6}>
                  <Row>
                      <Col sm={12} md={6}>
                          <FormGroup>Name:</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                          <FormGroup>{nomineeDetails ? nomineeDetails.first_name+" "+(nomineeDetails.last_name ? nomineeDetails.last_name : "") : null}</FormGroup>
                      </Col>
                  </Row>
  
                  <Row>
                      <Col sm={12} md={6}>
                          <FormGroup>Date Of Birth:</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                          <FormGroup>{ nomineeDetails ? moment(nomineeDetails.dob).format("DD-MM-YYYY") : null}</FormGroup>
                      </Col>
                  </Row>
  
                  <Row>
                      <Col sm={12} md={6}>
                          <FormGroup>Relation With Proposer:</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                          <FormGroup>
                             { vehicleDetails && vehicleDetails.vehicletype_id == '12' || vehicleDetails && vehicleDetails.vehicletype_id == '5' ? static_relation_model[nomineeDetails.relation_with] : 
                                (vehicleDetails && vehicleDetails.vehicletype_id == 13 && nomineeDetails && nomineeDetails.relation ? nomineeDetails.relation.ipa_relation_name  : 
                                (vehicleDetails && vehicleDetails.vehicletype_id == 14 && nomineeDetails && nomineeDetails.relation ? nomineeDetails.relation.gsb_appointee_relation  :
                                  vehicleDetails && vehicleDetails.vehicletype_id == 10 && nomineeDetails && nomineeDetails.relation ? nomineeDetails.relation.ksb_label : null) ) }
                          </FormGroup> 
                      </Col>
                  </Row>
  
              </Col>
          </Row>
          <Row>
              <p></p>
          </Row>
        </div>

        const apointeeData = 
        <div>
          <Row>
              <Col sm={12} md={6}>
                  <Row>
                      <Col sm={12} md={6}>
                          <FormGroup>Name:</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                          <FormGroup>{nomineeDetails && nomineeDetails.appointee_name ? nomineeDetails.appointee_name : null}</FormGroup>
                      </Col>
                  </Row>
    
                  <Row>
                      <Col sm={12} md={6}>
                          <FormGroup>Relation With Nominee:</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                      <FormGroup>{nomineeDetails ? static_relation_model[nomineeDetails.appointee_relation_with] : []}</FormGroup>
                      </Col>
                  </Row>
              </Col>
          </Row>
          <Row>
              <p></p>
          </Row>
        </div>
        

    const errMsg =
      error && error.message ? (
        <span className="errorMsg">
          <h6>
            <strong>
              Thank you for showing your interest for buying product.Due to some
              reasons, we are not able to issue the policy online.Please call
              1800 22 1111
            </strong>
          </h6>
        </span>
      ) : null;

    const paymentErrMsg =
    paymentStatus && paymentStatus.transaction_status == 103 ? (
        <span className="errorMsg">
          <h6>
            <strong>
              Payment failed. Please try again
            </strong>
          </h6>
        </span>
      ) : null;

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
                  <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox premium3">
                    <h4 className="text-center mt-3 mb-3">
                    SBI General Insurance Company Limited
                    </h4>
                      <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                        // validationSchema={validatePremium}
                        >
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                return (
                                    <Form>
                                      <section className="brand">
                                        <div className="boxpd">
                                          <div className="d-flex justify-content-left carloan">
                                            <h4> Details of your Policy Premium</h4>
                                          </div>
                                          <div className="brandhead m-b-30">
                                            <h5>{errMsg}</h5>
                                            <h5>{paymentErrMsg}</h5>
                                            <h4>
                                              Policy Reference Number {request_data.quote_id}	
                                            </h4>
                                          </div>

                                          <Row>
                                            <Col sm={12} md={9} lg={9}>   
                                              <div className="rghtsideTrigr">
                                                <Collapsible trigger="Policy Details" >
                                                  <div className="listrghtsideTrigr">
                                                    <Row>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>Policy Start Date:</FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>
                                                        {request_data && request_data.start_date ? moment(request_data.start_date).format('DD-MM-yyy') : null}
                                                        </FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>Policy End Date:</FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>
                                                        {request_data && request_data.end_date ? moment(request_data.end_date).format('DD-MM-yyy') : null}
                                                        </FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                          <FormGroup>Product Name:</FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={6} lg={3}>
                                                          <FormGroup>
                                                          {vehicleDetails && vehicleDetails.vehicletype ? vehicleDetails.vehicletype.description : null}
                                                          </FormGroup>
                                                        </Col>
                                                    </Row>
                                                  </div>
                                                </Collapsible>
                                              </div>
                                              {vehicleDetails && vehicleDetails.vehicletype_id == '5' ? 
                                              <div className="rghtsideTrigr">
                                                  <Collapsible trigger="Default Covered Coverages & Benefit" open= {true}>
                                                      <div className="listrghtsideTrigr">
                                                          {/* {policyCoverageList} */}
                                                          { vehicleDetails && vehicleDetails.vehicletype_id == '12' ? arogyaTopupCoverage() : 
                                                          vehicleDetails && vehicleDetails.vehicletype_id == '10' ?  ksbCoverage() : 
                                                          vehicleDetails && vehicleDetails.vehicletype_id == '5' ?  arogyaSanjeevaniCoverage() : policyCoverageList }
                                                      </div>
                                                  </Collapsible>
                                              </div> : null }
                                              
                                              <div className="rghtsideTrigr">
                                                <Collapsible trigger="Premium Summary" open={true}>
                                                  <div className="listrghtsideTrigr">
                                                    <Row> 
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>Sum Insured:</FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>
                                                          <strong>Rs:</strong>{" "}
                                                          {request_data.sum_insured}
                                                        </FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>Applicable Taxes:</FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>
                                                          <strong>Rs:</strong> {Math.round(request_data.service_tax)}
                                                        </FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>Gross Premium:</FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>
                                                          <strong>Rs:</strong>{" "}
                                                          {Math.round(request_data.gross_premium)}
                                                        </FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>Net Premium:</FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>
                                                          <strong>Rs:</strong>{" "}
                                                          {request_data.payable_premium}
                                                        </FormGroup>
                                                      </Col>
                                                    </Row>
                                                  </div>
                                                </Collapsible>
                                              </div>

                                              <div className="rghtsideTrigr custom_widthadd">
                                                <Collapsible trigger=" Member Details">
                                                <strong>Member Details :</strong>
                                                  <div className="listrghtsideTrigr">{memberDetails}</div>
                                                  <strong>Nominee Details :</strong>
                                                  <div className="listrghtsideTrigr">{nomineeData}</div>
                                                  {nomineeDetails && nomineeDetails.is_appointee == '1' ? <strong>Appointee Details :</strong> : null }
                                                  {nomineeDetails && nomineeDetails.is_appointee == '1' ? <div className="listrghtsideTrigr">{apointeeData}</div> : null }
                                                </Collapsible>
                                              </div>

                                              <div className="rghtsideTrigr m-b-40">
                                                <Collapsible trigger=" Contact information">
                                                  <div className="listrghtsideTrigr">
                                                    <Row>
                                                      <Col sm={12} md={12} lg={6}>
                                                        <Row>
                                                          <Col sm={12} md={6}>
                                                            Mobile number:
                                                          </Col>
                                                          <Col sm={12} md={6}>
                                                            {policyHolder.mobile}
                                                          </Col>
                                                        </Row>

                                                        <Row>
                                                          <Col sm={12} md={6}>
                                                            Email:
                                                          </Col>
                                                          <Col sm={12} md={6}>
                                                            {policyHolder.email_id}
                                                          </Col>
                                                        </Row>
                                                      </Col>
                                                    </Row>
                                                  </div>
                                                </Collapsible>
                                              </div>

                                              <Row>
                                                  <Col sm={12} md={6}>
                                                  </Col>
                                                    <Col sm={12} md={6}>
                                                        <FormGroup>
                                                        <div className="paymntgatway">
                                                              Select Payment Gateway
                                                              <div>
                                                              {/* <img src={require('../../assets/images/green-check.svg')} alt="" className="m-r-10" /> */}
                                                              <label className="customRadio3">
                                                              <Field
                                                                  type="radio"
                                                                  name='gateway'                                            
                                                                  value='1'
                                                                  key='1'  
                                                                  onChange={(e) => {
                                                                      setFieldValue(`gateway`, e.target.value);
                                                                  }}
                                                                  checked={values.gateway == '1' ? true : false}
                                                              />
                                                                  <span className="checkmark " /><span className="fs-14"> 
                                                              
                                                                      { policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.logo ? <img src={require('../../../assets/images/'+ policyHolder.bcmaster.paymentgateway.logo)} alt="" /> :
                                                                      null
                                                                      }
                                                                  </span>
                                                              </label>
                                                              </div>

                                                              {policyHolder.bcmaster && policyHolder.bcmaster.id === 2 ?
                                                              <div>
                                                              <label className="customRadio3">
                                                              <Field
                                                                  type="radio"
                                                                  name='gateway'                                            
                                                                  value='2'
                                                                  key='1'  
                                                                  onChange={(e) => {
                                                                      setFieldValue(`gateway`, e.target.value);
                                                                  }}
                                                                  checked={values.gateway == '2' ? true : false}
                                                              />
                                                                  <span className="checkmark " /><span className="fs-14"> 
                                                              
                                                                      { policyHolder.bcmaster && policyHolder.bcmaster.id === 2 ? <img src={require('../../../assets/images/vedavaag.png')} alt="" /> :
                                                                      null
                                                                      }
                                                                  </span>
                                                              </label>
                                                              </div> : null }
                                                        </div>
                                                      </FormGroup>
                                                  </Col>
                                              </Row>

                                              <div className="d-flex justify-content-left resmb">

                                                {bcMaster && bcMaster.eligible_for_payment_link == 1 ?
                                                  <div>
                                                  <Button type="button" className="proceedBtn" onClick = {this.sendPaymentLink.bind(this)}>  Send Payment Link  </Button>
                                                  &nbsp;&nbsp;&nbsp;&nbsp;
                                                  </div> : null }

                                              {request_data.quote_id && values.gateway != "" ? 
                                                <Button type="submit"
                                                  className="proceedBtn"
                                                >
                                                  Make Payment
                                                </Button> : null
                                              }                                     
                                              </div>
                                            </Col>

                                            <Col sm={12} md={3}>
                                              <div className="regisBox">
                                                <h3 className="medihead">
                                                  Assurance of Insurance. Everywhere in India, for
                                                  every Indian{" "}
                                                </h3>
                                              </div>
                                            </Col>
                                          </Row>
                                        </div>
                                      </section>
                                      
                                    </Form>
                                );
                            }}
                      </Formik>
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
  connect(mapStateToProps, mapDispatchToProps)(HealthSummery)
);
