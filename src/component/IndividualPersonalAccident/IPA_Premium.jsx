import React, { Component, Suspense } from "react";
import { Row, Col, Modal, Button, FormGroup } from "react-bootstrap";
import BaseComponent from "../BaseComponent";
import SideNav from "../common/side-nav/SideNav";
import Footer from "../common/footer/Footer";
import axios from "../../shared/axios";
import { withRouter, Link } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import swal from "sweetalert";
import Encryption from "../../shared/payload-encryption";
import { Formik, Form, Field, ErrorMessage } from "formik";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.min.css";
import moment from "moment";
import Collapsible from "react-collapsible";
import queryString from 'query-string';
import { paymentGateways} from '../../shared/reUseFunctions';	
const Otp = React.lazy(() => import('../common/Otp/Otp'));

const initialValue = {
  gateway : ""
};

const genderArr = {
  M: "Male",
  F: "Female",
};


const Coverage = {

  "IPA101": "Accidental Death",
  "IPA102": "Permanent Total Disability",
  "IPA103": "Permanent Pertial Disability",
  "IPA104": "Temporary Total Disability",
  "IPA105": "Adaptation allowance",
  "IPA106": "Education Benefit",
}

class IPA_Premium extends Component {
  state = {
    occupationList: [],
    accessToken: "",
    paymentButton: false,
    smsButton: true,
    policyHolderDetails: [],
    familyMember: [],
    fulQuoteResp: [],
    error: [],
    purchaseData: [],
    error1: [],
    show: false,
    refNumber: "",
    policyCoverage: [],
    paymentStatus: [],
    relationArr: {},
    paymentgateway: [],
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

  handleClose = () => {
    this.setState({ show: false });
  }

  handleOtp = (e) => {
    if(e === true) {
        this.setState({ show: false, paymentButton: true, smsButton: false});
    }
    else {
        this.setState({ show: false, paymentButton: false, smsButton: true});
    }
  }

  handleModal = () => {
    this.setState({ show: true});
  }


  componentDidMount() {
    this.fetchNomineeRel();
    // createHistory.replace("/Dashboard")
    // this.fetchInsurance();
  }
  

  fetchNomineeRel = () => {
    const { productId } = this.props.match.params;
    let encryption = new Encryption();
    this.props.loadingStart();
    axios
      .get(`ipa/ipa-relation-list`)
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        console.log("decrypt--fetchSubVehicle------ ", decryptResp);
        if(decryptResp.error == false) {
          let nomineeRelation = decryptResp.data.iparelationList;
          let relationArr = []
          for (const x in nomineeRelation) {
            relationArr[nomineeRelation[x].id] = nomineeRelation[x].ipa_relation_name
           }
          this.setState({
          nomineeRelation, relationArr
        });
        this.fetchData();
        }      
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });
  };

  
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
    const { productId } = this.props.match.params;
    let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
    let encryption = new Encryption();
    this.props.loadingStart();
    axios
      .get(`ipa/details/${policyHolder_refNo}`)
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        console.log("decryptResp ----------- ", decryptResp)
        let menumaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.menumaster : {};
        let bcMaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.bcmaster : {};
        let ipaInfo = decryptResp.data && decryptResp.data.policyHolder && decryptResp.data.policyHolder.ipainfo ? decryptResp.data.policyHolder.ipainfo : null;
        let policyHolderDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [];
        let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
        let paymentgateway = decryptResp.data.policyHolder && decryptResp.data.policyHolder.bcmaster && decryptResp.data.policyHolder.bcmaster.bcpayment
        // console.log("---policyHolderDetails--->> ", policyHolderDetails);
        this.setState({
          ipaInfo, policyHolderDetails, bcMaster,menumaster,vehicleDetails,paymentgateway,
          nomineeDetails: policyHolderDetails.request_data && policyHolderDetails.request_data.nominee && policyHolderDetails.request_data.nominee[0],
          refNumber: policyHolderDetails && policyHolderDetails.reference_no,
        });
        this.quote() 
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });
  };

  quote = () => {
    //console.log('value', value)
    const {accessToken, ipaInfo} = this.state 
    const formData = new FormData(); 
    this.props.loadingStart();
    const post_data = {
        'id':localStorage.getItem('policyHolder_id'),
        'occupation_id': ipaInfo ? ipaInfo.occupation_id : ""
        // 'proposer_dob': date_of_birth ,
        // 'sum_insured': values.sumInsured ? sum_insured_array[values.sumInsured] : null
    }
    let encryption = new Encryption();
    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
    console.log("post_data---quote--- ", post_data)
    axios
      .post(`/fullQuoteServiceIPA`, formData)
      .then(res => { 
        if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
          this.setState({
              fulQuoteResp: res.data.PolicyObject,
              serverResponse: res.data.PolicyObject,
              error: [],
              validation_error: [],
              policyCoverage: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : [],
          }) 
          this.props.loadingStop();
      }
      else if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Fail") {
          this.setState({
              fulQuoteResp: res.data.PolicyObject,
              serverResponse: [],
              validation_error: [],
              error: {"message": 1},
              policyCoverage: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : [],
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


  CommunicationDetails = (productId) => {
    // productId === 5
    this.props.history.push(`/AccidentAdditionalDetails/${productId}`);
  };

  fetchInsurance = () => {
    let encryption = new Encryption();
    // this.props.loaderStart();
    axios
      .get("occupations")
      .then((res) => {
        let decryptErr = JSON.parse(encryption.decrypt(res.data));
        console.log('decryptErr-----', decryptErr)
        this.setState({ occupationList: decryptErr.data });
        this.props.loadingStop();
      })
      .catch((err) => {
        this.props.loadingStop();
      });
  };

  handleSubmit = (values) => {    
    const { policyHolderDetails} = this.state
    const { productId } = this.props.match.params
    paymentGateways(values, policyHolderDetails, this.state.policyHolderDetails.reference_no, productId)
}


  render() {
    const { productId } = this.props.match.params;
    const { fulQuoteResp, error, show, policyHolderDetails, nomineeDetails, paymentStatus, policyCoverage, relationArr, 
      ipaInfo, bcMaster, paymentgateway, vehicleDetails, paymentButton, smsButton, refNumber } = this.state;

    let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null

    const policyCoverageList =  policyCoverage && policyCoverage.length > 0 ?
    policyCoverage.map((coverage, qIndex) => (
        coverage.PolicyBenefitList && coverage.PolicyBenefitList.map((benefit, bIndex) => (
            <div key= {bIndex}>
                    <Row>
                      <Col sm={12} md={6}>
                        <FormGroup>{Coverage[benefit.ProductElementCode]}</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                        <FormGroup>₹ {Math.round(benefit.SumInsured)}</FormGroup>
                      </Col>
                    </Row> 
           </div>
        ))
    )) : null

      const memberDetails =
      fulQuoteResp &&
      fulQuoteResp.PolicyCustomerList && fulQuoteResp.PolicyCustomerList.length > 0 
        ? fulQuoteResp.PolicyCustomerList.map((member, qIndex) => {
            return (
              <div>
              <Row>
                <Col sm={12} md={6}>
                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Name:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{member.FirstName+" "+member.LastName}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Date Of Birth:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{moment(member.DateOfBirth).format("DD-MM-YYYY")}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Gender</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{genderArr[member.GenderCode]}</FormGroup>
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
        : null;

        const nomineeData = 
        <div>
          <Row>
              <Col sm={12} md={6}>
                  <Row>
                      <Col sm={12} md={6}>
                          <FormGroup>Name:</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                          <FormGroup>{nomineeDetails ? nomineeDetails.first_name+" "+nomineeDetails.last_name : null}</FormGroup>
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
                          <FormGroup>{nomineeDetails ? relationArr[nomineeDetails.relation_with] : []}</FormGroup> 
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
                      <FormGroup>{nomineeDetails ? relationArr[nomineeDetails.appointee_relation_with] : []}</FormGroup>
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
                                          Policy Reference Number {fulQuoteResp.QuotationNo}
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
                                                      {policyHolderDetails && policyHolderDetails.request_data ? moment(policyHolderDetails.request_data.start_date).format('DD-MM-yyyy') : null}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>Policy End Date:</FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>
                                                      {policyHolderDetails && policyHolderDetails.request_data ? moment(policyHolderDetails.request_data.end_date).format('DD-MM-yyyy') : null}
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
                                     
                                          <div className="rghtsideTrigr">
                                              <Collapsible trigger="Default Covered Coverages & Benefit" open= {true}>
                                                  <div className="listrghtsideTrigr">
                                                      {policyCoverageList}
                                                  </div>
                                              </Collapsible>
                                          </div>
                                          
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
                                                      {fulQuoteResp.SumInsured}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>Applicable Taxes:</FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>
                                                      <strong>Rs:</strong> {fulQuoteResp.TGST}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>{phrases['GrossPremium']}::</FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>
                                                      <strong>Rs:</strong>{" "}
                                                      {Math.round(fulQuoteResp.BeforeVatPremium)}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>{phrases['Premium']}:</FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>
                                                      <strong>Rs:</strong>{" "}
                                                      {fulQuoteResp.DuePremium}
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
                                                <div className="d-flex justify-content-end carloan">
                                                  <Link to ={`/AccidentSelectPlan/${productId}`}> Edit</Link>
                                                </div>
                                                <Row>
                                                  <Col sm={12} md={12} lg={6}>
                                                    <Row>
                                                      <Col sm={12} md={6}>
                                                        Mobile number:
                                                      </Col>
                                                      <Col sm={12} md={6}>
                                                        {policyHolderDetails.mobile}
                                                      </Col>
                                                    </Row>

                                                    <Row>
                                                      <Col sm={12} md={6}>
                                                        Email:
                                                      </Col>
                                                      <Col sm={12} md={6}>
                                                        {policyHolderDetails.email_id}
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
                                                         
                                                          { paymentgateway && paymentgateway.length > 0 ? paymentgateway.map((gateways,index) =>
                                                              gateways.hasOwnProperty('paymentgateway') && gateways.paymentgateway ? 
                                                              <div>
                                                                  <label className="customRadio3">
                                                                  <Field
                                                                      type="radio"
                                                                      name='gateway'                                            
                                                                      value={index+1}
                                                                      key= {index} 
                                                                      onChange={(e) => {
                                                                          setFieldValue(`gateway`, e.target.value);
                                                                          setFieldValue(`slug`, gateways.paymentgateway.slug);
                                                                      }}
                                                                      checked={values.gateway == `${index+1}` ? true : false}
                                                                  />
                                                                      <span className="checkmark " /><span className="fs-14"> 
                                                                  
                                                                          { gateways.paymentgateway.logo ? <img src={require('../../assets/images/'+ gateways.paymentgateway.logo)} alt="" /> :
                                                                          null
                                                                          }
                                                                      </span>
                                                                  </label>
                                                              </div> : null
                                                            ) : null}

                                                    </div>
                                                  </FormGroup>
                                              </Col>
                                          </Row>

                                          <div className="d-flex justify-content-left resmb">
                                            <Button
                                              className="backBtn"
                                              onClick={this.CommunicationDetails.bind(this, productId)}
                                            >
                                              Back
                                            </Button>

                                            {bcMaster && bcMaster.eligible_for_payment_link == 1 ?
                                              <div>
                                                <Button type="button" className="proceedBtn" onClick = {this.sendPaymentLink.bind(this)}>  Send Payment Link  </Button>
                                                &nbsp;&nbsp;&nbsp;&nbsp;
                                              </div> : null }

                                            {smsButton === true ?
                                              <Button className="backBtn" type="button" onClick={this.handleModal.bind(this)}>{phrases['SendSMS']}</Button>
                                            : null}

                                          {fulQuoteResp.QuotationNo && values.gateway != "" && paymentButton === true? 
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
                  <Modal className="" bsSize="md"
                      show={show}
                      onHide={this.handleClose}>
                      <div className="otpmodal">
                      <Modal.Header closeButton />
                          <Modal.Body>
                              <Suspense fallback={<div>Loading...</div>}>
                              <Otp
                                  quoteNo={fulQuoteResp.QuotationNo}
                                  duePremium={fulQuoteResp.DuePremium}
                                  refNumber={refNumber}
                                  // whatsapp={whatsapp}
                                  reloadPage={(e) => this.handleOtp(e)}
                              />
                              </Suspense>
                          </Modal.Body>
                      </div>
                  </Modal>
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
  connect(mapStateToProps, mapDispatchToProps)(IPA_Premium)
);
