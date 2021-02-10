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
import { faYelp } from "@fortawesome/free-brands-svg-icons";

const initialValue = {
  gateway : ""
};

const genderArr = {
  m: "Male",
  f: "Female",
};

// const relationArr = {
// 1:"Self",
// 2:"Spouse",
// 3:"Son",
// 4:"Daughter",
// 5:"Father",
// 6:"Mother",
// 7:"Father In Law",
// 8:"Mother In Law",
// 9:"Brother",
// 10:"Sister",
// 11:"Grandfather",
// 12:"Grandmother",
// 13:"Husband",
// 14:"Wife",
// 15:"Brother In Law",
// 16:"Sister In Law",
// 17:"Uncle",
// 18:"Aunty",
// 19:"Ex-Wife",
// 20:"Ex-Husband",
// 21:"Employee",
// 22:"Niece",
// 23:"Nephew"
// }

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
    refNumber: localStorage.getItem("policyHolder_refNo"),
    paymentStatus: [],
    nomineedetails: [],
    policyCoverage: [],
    NomineeRelationArr: {},
    AppointeeRelationArr: {},
    pincode: "",
    location: "",
    city: "",
    state: ""
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

  fetchNomineeRel = (policyHolder) => {
    const { productId } = this.props.match.params;
    let encryption = new Encryption();
    axios
      .get('gsb/gsb-relation-list')
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        console.log("decrypt--fetchSubVehicle------ ", decryptResp);
        if(decryptResp.error == false) {
          let nomineeRelation = decryptResp.data.relation_nominee_appointee.nominee_relations;
          let appointeeRelation = decryptResp.data.relation_nominee_appointee.appointee_relations;
          let NomineeRelationArr = []
          let AppointeeRelationArr = []
          for (const x in nomineeRelation) {
            NomineeRelationArr[nomineeRelation[x].id] = nomineeRelation[x].name
          }
          for (const y in appointeeRelation) {
            AppointeeRelationArr[appointeeRelation[y].id] = appointeeRelation[y].name
          }
          this.setState({
          nomineeRelation, NomineeRelationArr, AppointeeRelationArr
        });
        this.fullQuote(policyHolder)
        }      
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });
  };


  fetchPolicyDetails=()=>{
    const { productId } = this.props.match.params;
    let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
    let encryption = new Encryption();
    this.props.loadingStart();
    axios
      .get(`gsb/gsb-policy-details/${policyHolder_refNo}`)
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        let policyHolderDetails= decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [];
        let gsb_Details = decryptResp.data && decryptResp.data.policyHolder.gsbinfo ? decryptResp.data.policyHolder.gsbinfo : null;
        let requested_Data = decryptResp.data && decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data : null;
        let addressDetails = policyHolderDetails ? JSON.parse(policyHolderDetails.address) : null
        let pincode_Details = gsb_Details ? JSON.parse(gsb_Details.pincode_response) : null
        let bcMaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.bcmaster : {};
        let pincode = decryptResp.data.policyHolder.pincode
        let location = decryptResp.data.policyHolder.location
        let city = decryptResp.data.policyHolder.city
        let state = decryptResp.data.policyHolder.state      
        console.log("---gsb_Details--->>", decryptResp.data.policyHolder);
        this.setState({
          gsb_Details, requested_Data, bcMaster,
          addressDetails, pincode_Details, policyHolderDetails, pincode, location, city, state
        });
        this.fetchCoveragePlan(decryptResp.data.policyHolder, gsb_Details)
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });        
}

fetchCoveragePlan=(policyHolder, gsb_Details)=>{
  const { productId } = this.props.match.params;
  let encryption = new Encryption();
  
  axios
    .get(`gsb/get-plan-with-coverage`)
    .then((res) => {
      let decryptResp = JSON.parse(encryption.decrypt(res.data));
      let coverPlanA = decryptResp.data && decryptResp.data.plan_with_coverages ? decryptResp.data.plan_with_coverages[2].coveragebenefit : null;
      let coverPlanB = decryptResp.data && decryptResp.data.plan_with_coverages ? decryptResp.data.plan_with_coverages[1].coveragebenefit : null;
      let coverPlanC = decryptResp.data && decryptResp.data.plan_with_coverages ? decryptResp.data.plan_with_coverages[0].coveragebenefit : null;
      console.log("---gsb_Details--->>", decryptResp);
      let policyCoverage = gsb_Details && gsb_Details.plan_id == 1 ? coverPlanA : gsb_Details && gsb_Details.plan_id == 2 ? coverPlanB : coverPlanC 
      this.setState({
        policyCoverage
      });
      this.fetchNomineeRel(policyHolder);
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
    const { fulQuoteResp, addressDetails, error, show, policyHolderDetails, nomineedetails, paymentStatus, policyCoverage, 
        bcMaster, NomineeRelationArr, AppointeeRelationArr, location, city, state, gsb_Details } = this.state;
    const Is_appo = policyHolderDetails.request_data ? policyHolderDetails.request_data.nominee[0].is_appointee : null
    const risk_address = gsb_Details && gsb_Details.risk_address ? JSON.parse(gsb_Details.risk_address) : {}

    const riskDetails = risk_address ? (
      <div>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>House/Flat No:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{risk_address.house_flat_no}</FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>House/Building Name:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{risk_address.house_building_name}</FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>Area Name:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{risk_address.area_name}</FormGroup>
          </Col>
        </Row>

        <Row>
          <Col sm={12} md={6}>
            <FormGroup>Pincode:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{risk_address.pincode}</FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>Locality:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{risk_address.locality}</FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>City:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{risk_address.city}</FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>State:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{risk_address.state}</FormGroup>
          </Col>
        </Row>
      </div>
  ) :null

    const communicationDetails = addressDetails ? (
      <div>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>Plot No:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{addressDetails.plot_number}</FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>House/Flat No:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{addressDetails.house_flat_no}</FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>House/Building Name:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{addressDetails.house_building_name}</FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup> Street Name:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{addressDetails.street_name}</FormGroup>
          </Col>
        </Row>

        <Row>
          <Col sm={12} md={6}>
            <FormGroup>Pincode:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{policyHolderDetails.pincode}</FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>Locality:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{location}</FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>City:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{city}</FormGroup>
          </Col>
        </Row>
        <Row>
          <Col sm={12} md={6}>
            <FormGroup>State:</FormGroup>
          </Col>
          <Col sm={12} md={6}>
            <FormGroup>{state}</FormGroup>
          </Col>
        </Row>
      </div>
  ) :null
 
      const nominee = policyHolderDetails.request_data ? policyHolderDetails.request_data.nominee.map((member, qIndex) => {
        return (
          <div>
          <Row>
            <Col sm={12} md={12}>
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
                  <FormGroup>{ member ? moment(member.dob).format("DD-MM-YYYY") : null}</FormGroup>
                </Col>
              </Row>

              <Row>
                <Col sm={12} md={6}>
                  <FormGroup>Relation With Proposer:</FormGroup>
                </Col>
                <Col sm={12} md={6}>
                  <FormGroup>
                  { NomineeRelationArr[member.relation_with] }
                  </FormGroup>
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
            <Col sm={12} md={12}>
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
                  { AppointeeRelationArr[member.appointee_relation_with] }
                  </FormGroup>
                </Col>
              </Row>

              {/* <Row>
                <Col sm={12} md={6}>
                  <FormGroup>Gender</FormGroup>
                </Col>
                <Col sm={12} md={6}>
                  <FormGroup>{genderArr[member.gender]}</FormGroup>
                </Col>
              </Row> */}
            </Col>
          </Row>
          <Row>
          <p></p>
          </Row>
          </div>
        );
      })
      :null

    const proposerDetails = policyHolderDetails ? 
        <div>
        <Row>
          <Col sm={12} md={12}>
            <Row>
              <Col sm={12} md={6}>
                <FormGroup>Proposer Name:</FormGroup>
              </Col>
              <Col sm={12} md={6}>
                <FormGroup>{policyHolderDetails.salutation && policyHolderDetails.salutation.displayvalue+" "+policyHolderDetails.first_name+" "+policyHolderDetails.last_name}</FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={12} md={6}>
                <FormGroup>Date of Birth:</FormGroup>
              </Col>
              <Col sm={12} md={6}>
                <FormGroup>
                { policyHolderDetails ? moment(policyHolderDetails.dob).format("DD-MM-YYYY") : null}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={12} md={6}>
                Mobile number:
              </Col>
              <Col sm={12} md={6}>
                {policyHolderDetails.mobile}
              </Col>
            </Row>
          <Row>
            <Col sm={12} md={3}>
            &nbsp;
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
        <Row>
        <p></p>
        </Row>
        </div>
      :null

    const policy_Coverage =
      <table width={500}>
          <tr>
          <th><Col sm={12} md={18}>Section</Col></th>
          <th><Col sm={12} md={18}>Sum Insured</Col></th>
        </tr>
        { policyCoverage && policyCoverage.length > 0 ?
            policyCoverage.map((coverage, qIndex) => (
                <tr>
                     <td><Col sm={12} md={18}>{coverage.benefit_name}:</Col></td>
                     <td><Col sm={12} md={18}>₹ {Math.round(coverage.benefit_suminsured)}</Col></td>
                </tr>                    

        )) : null}
      </table > 

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
                                            <Collapsible trigger=" GSB Policy Plan Details"  open= {true}>
                                              <div className="listrghtsideTrigr">
                                                {policy_Coverage ? policy_Coverage : null}
                                              </div>
                                            </Collapsible>
                                            <Collapsible trigger=" Premium Details"  open= {true}>
                                              <div className="listrghtsideTrigr">
                                                <Row>
                                                    <Col sm={12} md={3}>
                                                        <div className="motopremium">
                                                        Net Premium:
                                                        </div>
                                                    </Col>
                                                    <Col sm={12} md={3}>
                                                        <div className="premamount">
                                                            ₹ {fulQuoteResp.DuePremium ? fulQuoteResp.DuePremium : 0}
                                                        </div>
                                                    </Col>
                                                    <Col sm={12} md={3}>
                                                        <div className="motopremium">
                                                        Gross Premium:
                                                        </div>
                                                    </Col>
                                                    <Col sm={12} md={3}>
                                                        <div className="premamount">
                                                            ₹ {fulQuoteResp.BeforeVatPremium ? Math.round(fulQuoteResp.BeforeVatPremium) : 0}
                                                        </div>
                                                    </Col>
                                                    <Col sm={12} md={3}>
                                                        <div className="motopremium">
                                                        Applicable Taxes:
                                                        </div>
                                                    </Col>
                                                    <Col sm={12} md={3}>
                                                        <div className="premamount">
                                                            ₹ {fulQuoteResp.TGST ? Math.round(fulQuoteResp.TGST) : 0}
                                                        </div>
                                                    </Col>
                                                </Row>
                                              </div>
                                             </Collapsible>
                                          </div>

                                          <div className="rghtsideTrigr">
                                            <Collapsible trigger=" Proposer Details">
                                              <div className="listrghtsideTrigr">{proposerDetails}</div>
                                            </Collapsible>
                                          </div>
                                          <div className="rghtsideTrigr">
                                            <Collapsible trigger=" Risk Details">
                                              <div className="listrghtsideTrigr">         
                                              <Col sm={12} md={12}>                       
                                                {riskDetails}
                                              </Col>  
                                              </div>
                                            </Collapsible>
                                          </div>

                                          <div className="rghtsideTrigr">
                                            <Collapsible trigger=" Communication Address">
                                              <div className="listrghtsideTrigr">
                                                <Col sm={12} md={12}> 
                                                  {communicationDetails}
                                                </Col>
                                              </div>
                                            </Collapsible>
                                          </div>

                                          <div className="rghtsideTrigr m-b-40">
                                            <Collapsible trigger=" Nominee Details">
                                              <div className="listrghtsideTrigr">{nominee}</div>
                                              {Is_appo == '1'  ? 
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
                                            <Button
                                              className="backBtn"
                                              onClick={this.nomineeDetails.bind(this, productId)}
                                            >
                                              Back
                                            </Button>

                                            {bcMaster && bcMaster.eligible_for_payment_link == 1 ?
                                              <div>
                                              <Button type="button" className="proceedBtn" onClick = {this.sendPaymentLink.bind(this)}>  Send Payment Link  </Button>
                                              &nbsp;&nbsp;&nbsp;&nbsp;
                                              </div> : null }

                                          {fulQuoteResp.QuotationNo ? 
                                            <Button
                                              className="proceedBtn"
                                              type="button"
                                              onClick= {this.handleSubmit }
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
