import React, { Component } from "react";
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


const genderArr = {
  M: "Male",
  F: "Female",
};

const relationArr = {
1:"Self",
2:"Spouse",
3:"Son",
4:"Daughter",
5:"Father",
6:"Mother",
7:"Father In Law",
8:"Mother In Law"
}

// const date_UTC = moment().format();
const date_cstom = moment().format("D-MMMM-YYYY-h:mm:ss");
const date_DB = moment().format("YYYY-mm-D");

class arogya_PolicyDetails extends Component {
  state = {
    accessToken: "",
    policyHolderDetails: [],
    familyMember: [],
    fulQuoteResp: [],
    error: [],
    purchaseData: [],
    error1: [],
    show: false,
    refNumber: "",
    paymentStatus: []
  };

  handleClose = () => {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  };

  policySummery = (policyId) => {
    this.props.history.push(`/ThankYou/${policyId}`);
  };

  nomineeDetails = (productId) => {
    this.props.history.push(`/arogya_NomineeDetails/${productId}`);
  };

  getPolicyHolderDetails = () => {
    
    this.props.loadingStart();
    let policyHolder_refNo = localStorage.getItem("policyHolder_refNo");
    axios.get(`arogya-topup/health-policy-details/${policyHolder_refNo}`)
      .then((res) => {

        this.setState({
          policyHolderDetails: res.data.data.policyHolder ? res.data.data.policyHolder : [],
          familyMember: res.data.data.policyHolder.request_data.family_members,
          refNumber: res.data.data.policyHolder.reference_no,
          paymentStatus: res.data.data.policyHolder.payment ? res.data.data.policyHolder.payment[0] : []
        });
        this.getAccessToken(
          res.data.data.policyHolder,
          res.data.data.policyHolder.request_data.family_members
        );
      })
      .catch((err) => {
        if(err.status == 401) {
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
          res.data.access_token,
          policyHolderDetails,
          familyMember
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

        this.setState({
          policyHolderDetails: res.data.data.policyHolder ? res.data.data.policyHolder : [],
          familyMember: res.data.data.policyHolder.request_data.family_members,
          refNumber: res.data.data.policyHolder.reference_no,
          paymentStatus: res.data.data.policyHolder.payment ? res.data.data.policyHolder.payment[0] : []
        });
        this.getAccessToken(
          res.data.data.policyHolder,
          res.data.data.policyHolder.request_data.family_members
        );
      })
      .catch((err) => {
        if(err.status == 401) {
          swal("Session out. Please login")
        }
        else swal("Something wrong happened. Please try after some")

        this.setState({
          policyHolderDetails: [],
        });
        this.props.loadingStop();
      });
  };


  fullQuote = (access_token, policyHolderDetails) => {
    let id = policyHolderDetails.id;
    let insureValue = Math.floor(policyHolderDetails.request_data.sum_insured);

    const formData = new FormData();
    let encryption = new Encryption();

    //formData.append("id", id);
    //formData.append("insureValue", insureValue);
    //formData.append("access_token", access_token);
   const post_data = {
      "id":id,
      "insureValue":insureValue,
      "access_token":access_token
    }
    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))    



    axios
      .post(`/fullQuoteServiceArogyaSeries`, formData)
      .then((res) => {
        if (res.data.PolicyObject) {
          this.setState({
            fulQuoteResp: res.data.PolicyObject,
            address: res.data.PolicyObject.PolicyCustomerList,
            error: [],
          });
        } else {
          this.setState({
            fulQuoteResp: [],
            address: [],
            error: res.data,
          });
        }
        this.props.loadingStop();
      })
      .catch((err) => {
        this.setState({
          serverResponse: [],
        });
        this.props.loadingStop();
      });
  };

  handleSubmit = () => {
    const {policyHolderDetails} = this.state
    if(policyHolderDetails && policyHolderDetails.bcmaster && policyHolderDetails.bcmaster.paymentgateway && policyHolderDetails.bcmaster.paymentgateway.slug) {
      if(policyHolderDetails.bcmaster.paymentgateway.slug == "csc_wallet") {
          this.payment()
      }
      if(policyHolderDetails.bcmaster.paymentgateway.slug == "razorpay") {
          this.Razor_payment()
      }
      if(policyHolderDetails.bcmaster.paymentgateway.slug == "PPINL") {
          this.paypoint_payment()
      }
  }
}


  payment = () => {
    const { refNumber } = this.state;
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment.php?refrence_no=${refNumber}`
  }

  Razor_payment = () => {
    const { refNumber } = this.state;
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/pay.php?refrence_no=${refNumber}`
}

paypoint_payment = () => {
  const { refNumber } = this.state;
  window.location = `${process.env.REACT_APP_PAYMENT_URL}/ppinl/pay.php?refrence_no=${refNumber}`
}

  componentDidMount() {
    if(queryString.parse(this.props.location.search).access_id) {
       this.getPolicyHolderId(queryString.parse(this.props.location.search).access_id)
    }
    else this.getPolicyHolderDetails();
  }

  render() {
    const { productId } = this.props.match.params;
    const { fulQuoteResp, address,error, show, policyHolderDetails, refNumber, paymentStatus } = this.state;

    console.log("policyHolderDetails ", policyHolderDetails)
    console.log("fulQuoteResp------ ", fulQuoteResp)
    // console.log("address---------- ", address.BuildingHouseName)
    const items =
      fulQuoteResp &&
      fulQuoteResp.PolicyLobList && fulQuoteResp.PolicyLobList.length > 0 && 
      fulQuoteResp.PolicyLobList[0].PolicyRiskList
        ? fulQuoteResp.PolicyLobList[0].PolicyRiskList.map((member, qIndex) => {
            return (
              <div>
              <Row>
                <Col sm={12} md={6}>
                  <h6><strong>Member {qIndex + 1}</strong></h6>
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
                      <FormGroup>{member.DateOfBirth}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Relation With Proposer:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{
                      member.GenderCode == 'F' && member.ArgInsuredRelToProposer > 2?
                      (member.ArgInsuredRelToProposer==3 || member.ArgInsuredRelToProposer==5 || member.ArgInsuredRelToProposer==7)?
                      relationArr[parseInt(member.ArgInsuredRelToProposer)+1]:relationArr[member.ArgInsuredRelToProposer]:relationArr[member.ArgInsuredRelToProposer]}</FormGroup>
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
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                <SideNav />
              </div>
              <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                <h4 className="text-center mt-3 mb-3">
                  Arogya Sanjeevani Policy
                </h4>
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
                          <Collapsible trigger="Arogya Sanjeevani Policy, SBI General Insurance Company Limited"  open= {true}>
                            <div className="listrghtsideTrigr">
                              <Row>
                                <Col sm={12} md={3}>
                                  <FormGroup>Sum Insured:</FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>
                                    <strong>Rs:</strong>{" "}
                                    {fulQuoteResp.SumInsured}
                                  </FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>Applicable Taxes:</FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>
                                    <strong>Rs:</strong> {fulQuoteResp.TGST}
                                  </FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>Gross Premium:</FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>
                                    <strong>Rs:</strong>{" "}
                                    {Math.round(fulQuoteResp.GrossPremium+fulQuoteResp.AlcoholLoadingAmount+fulQuoteResp.SmokerLoadingAmount+fulQuoteResp.TobaccoLoadingAmount)}
                                  </FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>Net Premium:</FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
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
                          </Collapsible>
                        </div>

                        <div className="rghtsideTrigr m-b-40">
                          <Collapsible trigger=" Contact information">
                            <div className="listrghtsideTrigr">
                              <div className="d-flex justify-content-end carloan">
                                <Link to ={`/arogya_Address/${productId}`}> Edit</Link>
                              </div>
                              <Row>
                                <Col sm={12} md={6}>

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

                                  <Row>
                                    <Col sm={12} md={6}>
                                      Address:
                                    </Col>
                                    <Col sm={12} md={6}>
                                      {/* {address} */}
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
                                      <img src={require('../../assets/images/green-check.svg')} alt="" className="m-r-10" />
                                      { policyHolderDetails && policyHolderDetails.bcmaster && policyHolderDetails.bcmaster.paymentgateway && policyHolderDetails.bcmaster.paymentgateway.logo ? <img src={require('../../assets/images/'+ policyHolderDetails.bcmaster.paymentgateway.logo)} alt="" /> :
                                      null
                                      }
                                      </div>
                                  </div>
                                  </FormGroup>
                              </Col>
                        </Row>

                        <div className="d-flex justify-content-left resmb">
                          <button
                            className="backBtn"
                            onClick={this.nomineeDetails.bind(this, productId)}
                          >
                            Back
                          </button>
                        {fulQuoteResp.QuotationNo ? 
                          <button
                            className="proceedBtn"
                            type="button"
                            onClick= {this.handleSubmit }
                          >
                            Make Payment
                          </button> : null
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
                {/* <Modal
                  className=""
                  bsSize="md"
                  show={show}
                  onHide={this.handleClose}
                >
                  <div className="otpmodal">
                    <Modal.Body>
                      <Otp
                        quoteNo = {fulQuoteResp.QuotationNo}
                        duePremium = {fulQuoteResp.DuePremium}
                        refNumber = {refNumber}
                        // reloadPage={(e) => this.getAccessTokenForInception(e)}
                        reloadPage={(e) => this.payment(e)}
                      />
                    </Modal.Body>
                  </div>
                </Modal> */}
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
  connect(mapStateToProps, mapDispatchToProps)(arogya_PolicyDetails)
);
