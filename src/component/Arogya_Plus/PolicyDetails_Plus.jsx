import React, { Component, Suspense } from "react";
import {
  Row,
  Col,
  Modal,
  Button,
  FormGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

import BaseComponent from "../BaseComponent";
import SideNav from "../common/side-nav/SideNav";
import Footer from "../common/footer/Footer";
import Collapsible from "react-collapsible";
import axios from "../../shared/axios";
import { withRouter, Link, Route } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
// import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik'
import moment from "moment";
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import queryString from 'query-string';
import { Formik, Field, Form } from "formik";
import { paymentGateways } from '../../shared/reUseFunctions';
const Otp = React.lazy(() => import('../common/Otp/Otp'));


const genderArr = {
  M: "Male",
  F: "Female",
};

const relationArr = {
  1: "Self",
  2: "Spouse",
  3: "Son",
  4: "Daughter",
  5: "Father",
  6: "Mother",
  7: "Father In Law",
  8: "Mother In Law"
}

const initialValue = {
  gateway: ""
}


// const date_UTC = moment().format();
const date_cstom = moment().format("D-MMMM-YYYY-h:mm:ss");
const date_DB = moment().format("YYYY-mm-D");

class PolicyDetails_Plus extends Component {
  state = {
    accessToken: "",
    policyHolderDetails: [],
    paymentButton: false,
    smsButton: true,
    familyMember: [],
    fulQuoteResp: [],
    error: [],
    purchaseData: [],
    error1: [],
    show: false,
    refNumber: "",
    paymentStatus: [],
    serverResponse: false,
    paymentgateway: [],
    policyHolder_refNo: queryString.parse(this.props.location.search).access_id ?
                        queryString.parse(this.props.location.search).access_id :
                        localStorage.getItem("policyHolder_refNo")
  };

  handleClose = () => {
    this.setState({ show: false });
  }

  handleModal = () => {
    this.setState({ show: true });
  };

  handleOtp = (e) => {
    if(e === true) {
        this.setState({ show: false, paymentButton: true, smsButton: false});
    }
    else {
        this.setState({ show: false, paymentButton: false, smsButton: true});
    }
  }

  policySummery = (policyId) => {
    this.props.history.push(`/ThankYou/${policyId}`);
  };

  nomineeDetails = (productId) => {
    this.props.history.push(`/NomineeDetails_Plus/${productId}`);
  };

  getPolicyHolderDetails = () => {
    let encryption = new Encryption();

    this.props.loadingStart();
    let policyHolder_refNo = localStorage.getItem("policyHolder_refNo");
    axios
      .get(`/arogya-topup/health-policy-details/${policyHolder_refNo}`)
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data))
        let bcMaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.bcmaster : {};
        let menumaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.menumaster : {};
        let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
        let request_data = decryptResp.data.policyHolder && decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data : {};
        let paymentgateway = decryptResp.data.policyHolder && decryptResp.data.policyHolder.bcmaster && decryptResp.data.policyHolder.bcmaster.bcpayment

        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        let paymentButton = false
        let smsButton = false

        if (user_data) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));

            if( user_data.user_type == "RAP" && user_data.bc_master_id == "5" && user_data.login_type == "4" ) {
                paymentButton =  true
                smsButton = false
            }
            else if(user_data.login_type == "4") {
                paymentButton = bcMaster && bcMaster.eligible_for_otp_screen == 1 ? false : true
                smsButton = bcMaster && bcMaster.eligible_for_otp_screen == 1 ? true : false
            }
            else {
                paymentButton = true
                smsButton = false
            }
        }

        this.setState({
          policyHolderDetails: decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [],
          familyMember: decryptResp.data.policyHolder.request_data.family_members,
          refNumber: decryptResp.data.policyHolder.reference_no,paymentButton,smsButton,
          paymentStatus: decryptResp.data.policyHolder.payment ? decryptResp.data.policyHolder.payment[0] : [],
          nomineeDetails: decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.nominee[0] : [],
          bcMaster, menumaster, request_data, paymentgateway, vehicleDetails

        });
        this.getAccessToken(
          decryptResp.data.policyHolder,
          decryptResp.data.policyHolder.request_data.family_members
        );
      })
      .catch((err) => {
        if (err.status == 401) {
          swal("Session out. Please login")
        }
        else swal("Something wrong happened. Please try after some")

        this.setState({
          policyHolderDetails: [],
        });
        this.props.loadingStop();
      });
  };

  getAccessToken = (policyHolderDetails, familyMember) => {
    axios
      .post(`/callTokenService`)
      .then((res) => {
        this.setState({
          accessToken: res.data.access_token,
        });
        this.fullQuote(
          policyHolderDetails
        );
      })
      .catch((err) => {
        this.setState({
          accessToken: [],
        });
        this.props.loadingStop();
      });
  };


  getPolicyHolderId = (ref_no) => {
    let policyHolder_id = 0

    this.props.loadingStart();
    axios
      .get(`/health-policy/${ref_no}`)
      .then((res) => {
        let bcMaster = res.data.data.policyHolder ? res.data.data.policyHolder.bcmaster : {};
        let request_data = res.data.data.policyHolder && res.data.data.policyHolder.request_data ? res.data.data.policyHolder.request_data : {};
        let menumaster = res.data.data.policyHolder ? res.data.data.policyHolder.menumaster : {};
        let vehicleDetails = res.data.data.policyHolder ? res.data.data.policyHolder.vehiclebrandmodel : {};
        let paymentgateway = res.data.data.policyHolder && res.data.data.policyHolder.bcmaster && res.data.data.policyHolder.bcmaster.bcpayment
        this.setState({
          policyHolderDetails: res.data.data.policyHolder ? res.data.data.policyHolder : [],
          familyMember: res.data.data.policyHolder.request_data.family_members,
          refNumber: res.data.data.policyHolder.reference_no,
          paymentStatus: res.data.data.policyHolder.payment ? res.data.data.policyHolder.payment[0] : [],
          nomineeDetails: res.data.data.policyHolder ? res.data.data.policyHolder.request_data.nominee[0] : [],
          bcMaster, request_data, menumaster, paymentgateway, vehicleDetails
        });
        this.getAccessToken(
          res.data.data.policyHolder,
          res.data.data.policyHolder.request_data.family_members
        );
      })
      .catch((err) => {
        if (err.status == 401) {
          swal("Session out. Please login")
        }
        else swal("Something wrong happened. Please try after some")

        this.setState({
          policyHolderDetails: [],
        });
        this.props.loadingStop();
      });
  };


  fullQuote = (policyHolderDetails) => {

    const formData = new FormData();
    let encryption = new Encryption();
    let policyDetails = policyHolderDetails && policyHolderDetails.request_data ? policyHolderDetails.request_data : []
    let sunInsured = policyHolderDetails && policyHolderDetails.arogyatopupsuminsured ? policyHolderDetails.arogyatopupsuminsured.insured_amount : 0

    const post_data = {
      'policy_reference_no': policyDetails ? policyHolderDetails.reference_no : null,
      'start_date': policyDetails ? moment(policyDetails.start_date).format("YYYY-MM-DD") : null,
      'end_date': policyDetails ? moment(policyDetails.end_date).format("YYYY-MM-DD") : null,
      'sum_insured': sunInsured ? parseInt(sunInsured) : null,
      'deductible': policyDetails ? parseInt(policyDetails.deductible) : null,
      'tenure_year': policyDetails ? parseInt(policyDetails.tenure_year) : null,
      'opd_premium_amount_id': policyDetails && policyDetails.opd_premium_amount_id ? policyDetails.opd_premium_amount_id : 1,
    }
    formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))

    axios
      .post(`/arogya-plus/fullQuoteServiceArogyaPlus`, formData)
      .then((res) => {
        if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
          this.setState({
            fulQuoteResp: res.data.PolicyObject,
            serverResponse: true,
            error: [],
          });
        } else if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Fail") {
          this.setState({
            fulQuoteResp: res.data.PolicyObject,
            error: { "message": 1 },
            serverResponse: false,
          });
        }
        else {
          this.setState({
            fulQuoteResp: [],
            error: res.data,
            serverResponse: false,
          });
        }
        this.props.loadingStop();
      })
      .catch((err) => {
        this.setState({
          serverResponse: false,
        });
        this.props.loadingStop();
      });
  };


  handleSubmit = (values) => {
    const { refNumber, policyHolderDetails } = this.state
    const { productId } = this.props.match.params
    paymentGateways(values, policyHolderDetails, refNumber, productId)
  }


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


  componentDidMount() {
    this.getPolicyHolderDetails();
  }

  render() {
    const { productId } = this.props.match.params;
    const { fulQuoteResp, error, serverResponse, policyHolderDetails, refNumber, paymentStatus, bcMaster,
      paymentgateway, nomineeDetails, request_data, vehicleDetails, paymentButton, smsButton, show } = this.state;
      
    let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
    const items =
      fulQuoteResp &&
        fulQuoteResp.PolicyLobList && fulQuoteResp.PolicyLobList.length > 0 &&
        fulQuoteResp.PolicyLobList[0].PolicyRiskList
        ? fulQuoteResp.PolicyLobList[0].PolicyRiskList.map((member, qIndex) => {
          return (
            <div>
              <Row>
                <Col sm={12} md={12}>
                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Name:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{member.FirstName + " " + member.LastName}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Date Of Birth:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{member.DateOfBirth ? moment(member.DateOfBirth).format("DD-MM-YYYY") : null}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Relation With Proposer:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{
                        member.GenderCode == 'F' && member.ArgInsuredRelToProposer > 2 ?
                          (member.ArgInsuredRelToProposer == 3 || member.ArgInsuredRelToProposer == 5 || member.ArgInsuredRelToProposer == 7) ?
                            relationArr[parseInt(member.ArgInsuredRelToProposer) + 1] : relationArr[member.ArgInsuredRelToProposer] : relationArr[member.ArgInsuredRelToProposer]}</FormGroup>
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
          <Col sm={12} md={12}>
            <Row>
              <Col sm={12} md={6}>
                <FormGroup>Name:</FormGroup>
              </Col>
              <Col sm={12} md={6}>
                <FormGroup>{nomineeDetails ? nomineeDetails.first_name + " " + nomineeDetails.last_name : null}</FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={12} md={6}>
                <FormGroup>Date Of Birth:</FormGroup>
              </Col>
              <Col sm={12} md={6}>
                <FormGroup>{nomineeDetails ? moment(nomineeDetails.dob).format("DD-MM-YYYY") : null}</FormGroup>
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

            <Row>
              <Col sm={12} md={6}>
                <FormGroup>Gender</FormGroup>
              </Col>
              <Col sm={12} md={6}>
                <FormGroup>{nomineeDetails && nomineeDetails.gender == "m" ? "Male" : "Female"}</FormGroup>
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
          <Col sm={12} md={12}>
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

                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox helpolicy">
                  <h4 className="text-center mt-3 mb-3">
                    Arogya Plus Policy
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
                                    <Collapsible trigger="Policy Details">
                                      <div className="listrghtsideTrigr">
                                        <Row>
                                          <Col sm={12} md={6} lg={3}>
                                            <FormGroup>Policy Start date:</FormGroup>
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
                                  <div className="rghtsideTrigr">
                                    <Collapsible trigger="Arogya Plus Policy, SBI General Insurance Company Limited" open={true}>
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
                                            <FormGroup>Net Premium:</FormGroup>
                                          </Col>
                                          <Col sm={12} md={6} lg={3}>
                                            <FormGroup>
                                              <strong>Rs:</strong>{" "}
                                              {fulQuoteResp.GrossPremium ? Math.round(fulQuoteResp.GrossPremium + fulQuoteResp.AlcoholLoadingAmount + fulQuoteResp.SmokerLoadingAmount + fulQuoteResp.TobaccoLoadingAmount) : ""}
                                            </FormGroup>
                                          </Col>
                                          <Col sm={12} md={6} lg={3}>
                                            <FormGroup>Gross Premium:</FormGroup>
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

                                  <div className="rghtsideTrigr">
                                    <Collapsible trigger=" Member Details">
                                      <div className="listrghtsideTrigr">{items}</div>
                                      <strong>Nominee Details :</strong>
                                      <div className="listrghtsideTrigr">{nomineeData}</div>
                                      {nomineeDetails && nomineeDetails.is_appointee == '1' ? <strong>Appointee Details :</strong> : null}
                                      {nomineeDetails && nomineeDetails.is_appointee == '1' ? <div className="listrghtsideTrigr">{apointeeData}</div> : null}
                                    </Collapsible>
                                  </div>

                                  <div className="rghtsideTrigr m-b-40">
                                    <Collapsible trigger=" Contact information">
                                      <div className="listrghtsideTrigr">
                                        <div className="d-flex justify-content-end carloan">
                                          <Link to={`/Address_Plus/${productId}`}> Edit</Link>
                                        </div>
                                        <Row>
                                          <Col sm={12} md={12}>
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
                                  {serverResponse ?
                                    <Row>
                                      <Col sm={12} md={6}>
                                      </Col>
                                      <Col sm={12} md={6}>
                                        <FormGroup>
                                          <div className="paymntgatway">
                                            Select Payment Gateway

                                            {paymentgateway && paymentgateway.length > 0 ? paymentgateway.map((gateways, index) =>
                                              gateways.hasOwnProperty('paymentgateway') && gateways.paymentgateway ?
                                                <div>
                                                  <label className="customRadio3">
                                                    <Field
                                                      type="radio"
                                                      name='gateway'
                                                      value={index + 1}
                                                      key={index}
                                                      onChange={(e) => {
                                                        setFieldValue(`gateway`, e.target.value);
                                                        setFieldValue(`slug`, gateways.paymentgateway.slug);
                                                      }}
                                                      checked={values.gateway == `${index + 1}` ? true : false}
                                                    />
                                                    <span className="checkmark " /><span className="fs-14">

                                                      {gateways.paymentgateway.logo ? <img src={require('../../assets/images/' + gateways.paymentgateway.logo)} alt="" /> :
                                                        null
                                                      }
                                                    </span>
                                                  </label>
                                                </div> : null
                                            ) : null}

                                          </div>
                                        </FormGroup>
                                      </Col>
                                    </Row> : null}
                                  <Row>&nbsp;</Row>
                                  <div className="d-flex justify-content-left resmb">
                                    <Button
                                      className="backBtn"
                                      onClick={this.nomineeDetails.bind(this, productId)}
                                    >
                                      Back
                                    </Button>

                                    {bcMaster && bcMaster.eligible_for_payment_link == 1 ?
                                      <div>
                                        <Button type="button" className="proceedBtn" onClick={this.sendPaymentLink.bind(this)}>  Send Payment Link  </Button>
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                      </div> : null}

                                      {smsButton === true ?
                                          <Button className="backBtn" type="button" onClick={this.handleModal.bind(this)}>{phrases['SendSMS']}</Button>
                                      : null}

                                    {fulQuoteResp.QuotationNo && values.gateway != "" && serverResponse && paymentButton === true ?
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
                  { smsButton === true  && fulQuoteResp.QuotationNo ? 
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
                        :null}
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
  connect(mapStateToProps, mapDispatchToProps)(PolicyDetails_Plus)
);
