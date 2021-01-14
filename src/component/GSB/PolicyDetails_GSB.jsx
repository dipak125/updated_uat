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
import { Formik, Form, Field, ErrorMessage } from "formik";

const initialValue = {
  gateway : ""
};

const genderArr = {
  m: "Male",
  f: "Female",
};

const relationArr = {
1:"Self",
2:"Spouse",
3:"Son",
4:"Daughter",
5:"Father",
6:"Mother",
7:"Father In Law",
8:"Mother In Law",
9:"Brother",
10:"Sister",
11:"Grandfather",
12:"Grandmother",
13:"Husband",
14:"Wife",
15:"Brother In Law",
16:"Sister In Law",
17:"Uncle",
18:"Aunty",
19:"Ex-Wife",
20:"Ex-Husband",
21:"Employee",
22:"Niece",
23:"Nephew"
}

const insuredRelationArr = {
  self:"Self",
  spouse:"Spouse",
  child1:"Child",
  child2:"Child",
  child3:"Child",
  child4:"Child",
  father:"Father",
  mother:"Mother",
  fatherInLaw:"Father In Law",
  motherInLaw:"Mother In Law",
  }

// const date_UTC = moment().format();
const date_cstom = moment().format("D-MMMM-YYYY-h:mm:ss");
const date_DB = moment().format("YYYY-mm-D");

class PolicyDetails_GSB extends Component {
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
    paymentStatus: [],
    nomineedetails: []
  };

  handleClose = () => {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  };


  nomineeDetails = (productId) => {
    this.props.history.push(`/AdditionalDetails_GSB/${productId}`);
  };


  fetchPolicyDetails=()=>{
    const { productId } = this.props.match.params;
    let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
    let encryption = new Encryption();
    axios
      .get(`gsb/gsb-policy-details/${policyHolder_refNo}`)
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        let gsb_Details = decryptResp.data && decryptResp.data.policyHolder.gsbinfo ? decryptResp.data.policyHolder.gsbinfo : null;
        let requested_Data = decryptResp.data && decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data : null;
        let addressDetails = gsb_Details ? JSON.parse(gsb_Details.risk_address) : null
        let pincode_Details = gsb_Details ? JSON.parse(gsb_Details.pincode_response) : null
        console.log("---gsb_Details--->>", gsb_Details);
        this.setState({
          gsb_Details, requested_Data, 
          addressDetails, pincode_Details
        });
        this.fullQuote(decryptResp.data.policyHolder)
        this.props.loadingStop();
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });        
}

fullQuote = (values, actions) => {
  const { accessToken, accidentDetails, declineStatus } = this.state
  if(declineStatus == "Decline") {
    swal('Insurance Policy cannot be offered')
    return false
  }
  const formData = new FormData();
  this.props.loadingStart();
  // const post_data = {
  //   'id': localStorage.getItem('policyHolder_id'),
  //   'proposer_dob': date_of_birth,
  //   'sum_insured': ipaInfo ? ipaInfo.sum_insured : null
  // }
  let encryption = new Encryption();
  // formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
  formData.append('policy_reference_no',localStorage.getItem("policyHolder_refNo"))
  axios
    .post(`/gsb/fullQuoteGSB`, formData)
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
  this.fetchPolicyDetails();
  }

  render() {
    const { productId } = this.props.match.params;
    const { fulQuoteResp, addressArray, error, show, policyHolderDetails, nomineedetails, paymentStatus } = this.state;

    const AddressDetails = addressArray ? (
        <div>
          <Row>
            <Col sm={12} md={6}>
              <Row>
                <Col sm={12} md={6}>
                  <FormGroup>{addressArray.address1 +", "+addressArray.address2 +", "+ addressArray.address3}</FormGroup>
                  {/* <FormGroup>{ addressArray.address3}</FormGroup> */}
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
    ) :null

    const PincodeDetails = addressArray ? (
      <div>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>{addressArray.pincode}</FormGroup>
          </Col>
        </Row>
      </div>
  ) :null

    const items =
    policyHolderDetails.request_data ? policyHolderDetails.request_data.family_members.map((member, qIndex) => {
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
                      <FormGroup>{member.first_name +" "+member.last_name}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Date Of Birth:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{member.dob}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Relation With Proposer:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>
                      { insuredRelationArr[member.relation_with] }
                      </FormGroup>
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
          :null

      const nominee = policyHolderDetails.request_data ? policyHolderDetails.request_data.nominee.map((member, qIndex) => {
        return (
          <div>
          <Row>
            <Col sm={12} md={6}>
              <h6><strong>Nominee</strong></h6>
              <Row>
                <Col sm={12} md={6}>
                  <FormGroup>Name:</FormGroup>
                </Col>
                <Col sm={12} md={6}>
                  <FormGroup>{member.first_name +" "+member.last_name}</FormGroup>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={6}>
                  <FormGroup>Date Of Birth:</FormGroup>
                </Col>
                <Col sm={12} md={6}>
                  <FormGroup>{member.dob}</FormGroup>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={6}>
                  <FormGroup>Relation With Proposer:</FormGroup>
                </Col>
                <Col sm={12} md={6}>
                  <FormGroup>
                  { relationArr[member.relation_with] }
                  </FormGroup>
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
      :null

      const appointee = policyHolderDetails.request_data ? policyHolderDetails.request_data.nominee.map((member, qIndex) => {
        return (
          <div>
          <Row>
            <Col sm={12} md={6}>
              <h6><strong>Appointee </strong></h6>
              <Row>
                <Col sm={12} md={6}>
                  <FormGroup>Name:</FormGroup>
                </Col>
                <Col sm={12} md={6}>
                  <FormGroup>{member.appointee_name}</FormGroup>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={6}>
                  <FormGroup>Relation With Nominee:</FormGroup>
                </Col>
                <Col sm={12} md={6}>
                  <FormGroup>
                  { relationArr[member.appointee_relation_with] }
                  </FormGroup>
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
      :null

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
                                          Policy Reference Number {policyHolderDetails && policyHolderDetails.request_data ? policyHolderDetails.request_data.quote_id : null}
                                        </h4>
                                      </div>

                                      <Row>
                                        <Col sm={12} md={9} lg={18}>
                                          <div className="rghtsideTrigr">
                                            <Collapsible trigger=" SBI General Insurance Company Limited"  open= {true}>
                                              <div className="listrghtsideTrigr">
                                                <Row>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>Sum Insured:</FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>
                                                      <strong>Rs:</strong>{" "}
                                                      {policyHolderDetails && policyHolderDetails.request_data ? Math.round(policyHolderDetails.request_data.sum_insured) : null}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>Applicable Taxes:</FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>
                                                      <strong>Rs:</strong>{" "}
                                                      {policyHolderDetails && policyHolderDetails.request_data ? Math.round(policyHolderDetails.request_data.service_tax) : null}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>Gross Premium:</FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>
                                                      <strong>Rs:</strong>{" "}
                                                      {policyHolderDetails && policyHolderDetails.request_data ? Math.round(policyHolderDetails.request_data.gross_premium) : null}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>Net Premium:</FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>
                                                      <strong>Rs:</strong>{" "}
                                                      {policyHolderDetails && policyHolderDetails.request_data ? Math.round(policyHolderDetails.request_data.net_premium) : null}
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

                                          <div className="rghtsideTrigr">
                                            <Collapsible trigger=" Contact information">
                                              <div className="listrghtsideTrigr">
                                                <div className="d-flex justify-content-end carloan">
                                                  <Link to ={`/arogya_Address/${productId}`}> Edit</Link>
                                                </div>
                                                <Row>
                                                  <Col sm={12} md={18}>

                                                    <Row>
                                                      <Col sm={12} md={3}>
                                                        Mobile number:
                                                      </Col>
                                                      <Col sm={12} md={9}>
                                                        {policyHolderDetails.mobile}
                                                      </Col>
                                                    </Row>
                                                    <Row>
                                                      <Col sm={12} md={3}>
                                                      &nbsp;
                                                      </Col>
                                                    </Row>
                                                    <Row>
                                                      <Col sm={12} md={3}>
                                                        Email:
                                                      </Col>
                                                      <Col sm={12} md={6}>
                                                        {policyHolderDetails.email_id}
                                                      </Col>
                                                    </Row>
                                                    <Row>
                                                      <Col sm={12} md={3}>
                                                      &nbsp;
                                                      </Col>
                                                    </Row>
                                                    <Row >
                                                      <Col sm={12} md={3}>
                                                        Address:
                                                      </Col>
                                                      <Col sm={12} md={6}>
                                                        {AddressDetails} 
                                                      </Col>
                                                    </Row>
                                                    
                                                    <Row>
                                                      <Col sm={12} md={3}>
                                                        Pincode:
                                                      </Col>
                                                      <Col sm={12} md={9}>
                                                        {PincodeDetails}
                                                      </Col>
                                                    </Row>

                                                  </Col>
                                                </Row>
                                              </div>
                                            </Collapsible>
                                          </div>

                                          <div className="rghtsideTrigr m-b-40">
                                            <Collapsible trigger=" Nominee Details">
                                              <div className="listrghtsideTrigr">{nominee}</div>
                                              {nomineedetails && nomineedetails.is_appointee == '1'  ? 
                                              <div className="listrghtsideTrigr">{appointee}</div> 
                                              : null}
                                              
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
                                                          
                                                                  { policyHolderDetails && policyHolderDetails.bcmaster && policyHolderDetails.bcmaster.paymentgateway && policyHolderDetails.bcmaster.paymentgateway.logo ? <img src={require('../../assets/images/'+ policyHolderDetails.bcmaster.paymentgateway.logo)} alt="" /> :
                                                                  null
                                                                  }
                                                              </span>
                                                          </label>
                                                          </div>

                                                          {policyHolderDetails.bcmaster && policyHolderDetails.bcmaster.id === 2 ?
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
                                                          
                                                                  { policyHolderDetails.bcmaster && policyHolderDetails.bcmaster.id === 2 ? <img src={require('../../assets/images/vedavaag.png')} alt="" /> :
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
                                </Form> 
                            );
                          }}
                  </Formik>
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
  connect(mapStateToProps, mapDispatchToProps)(PolicyDetails_GSB)
);
