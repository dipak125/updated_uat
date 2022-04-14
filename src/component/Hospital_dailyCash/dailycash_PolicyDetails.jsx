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
import moment from "moment";
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import queryString from 'query-string';
import { Formik, Form, Field, ErrorMessage } from "formik";
import { paymentGateways} from '../../shared/reUseFunctions';	
const Otp = React.lazy(() => import('../common/Otp/Otp'));

const initialValue = {
  gateway : ""
};

const genderArr = {
  m: "Male",
  f: "Female",
};

const cashLimit = {
  1: "500",
  2: "1000",
  3: "1500",
  4: "2000",
};

const coverDuration = {
  1: "30",
  2: "60"
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

class dailycash_PolicyDetails extends Component {
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
    nomineedetails: [],
     hide:0,
    request_data: [],
    serverResponse: false,
    paymentgateway: [],
    policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 
                        queryString.parse(this.props.location.search).access_id : 
                        localStorage.getItem("policyHolder_refNo")
  };

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
    this.setState({ show: true });
  };

  policySummery = (policyId) => {
    this.props.history.push(`/ThankYou/${policyId}`);
  };

  nomineeDetails = (productId) => {
    this.props.history.push(`/dailycash_NomineeDetails/${productId}`);
  };

  getPolicyHolderDetails = () => {
    let encryption = new Encryption();
    
    this.props.loadingStart();
    let policyHolder_refNo = localStorage.getItem("policyHolder_refNo");
    axios.get(`/daily-cash/policy-details/${policyHolder_refNo}`)
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data))
        let addressArray = JSON.parse(decryptResp.data.policyHolder.address)
        console.log("decrypt-----", decryptResp)
        let bcMaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.bcmaster : {};
        let menumaster = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.menumaster : {};
        let request_data = decryptResp.data.policyHolder && decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data : {};
        let paymentgateway = decryptResp.data.policyHolder && decryptResp.data.policyHolder.bcmaster && decryptResp.data.policyHolder.bcmaster.bcpayment

        this.setState({
          policyHolderDetails: decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [],
          addressArray: decryptResp.data.policyHolder && decryptResp.data.policyHolder.address ? addressArray : null,
          familyMember: decryptResp.data.policyHolder.request_data.family_members,
          refNumber: decryptResp.data.policyHolder.reference_no,
          paymentStatus: decryptResp.data.policyHolder.payment ? decryptResp.data.policyHolder.payment[0] : [],
          nomineedetails: decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.nominee[0]:[],
          bcMaster, menumaster, request_data,paymentgateway
          
        });
        this.fullQuote( decryptResp.data.policyHolder );
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


  fullQuote = ( policyHolderDetails) => {

    const formData = new FormData();
    let encryption = new Encryption();
    let policyDetails = policyHolderDetails && policyHolderDetails.request_data ? policyHolderDetails.request_data : []
    let sunInsured = policyHolderDetails && policyHolderDetails.dailycashtopupsuminsured ? policyHolderDetails.dailycashtopupsuminsured.insured_amount : 0 

   const post_data = {
    'policy_reference_no': policyDetails ? policyHolderDetails.reference_no : null,
    'start_date': policyDetails ? moment(policyDetails.start_date).format("YYYY-MM-DD") : null,
    'end_date': policyDetails ? moment(policyDetails.end_date).format("YYYY-MM-DD") : null,
    'sum_insured': sunInsured ? parseInt(sunInsured) : null,
    'deductible': policyDetails ? parseInt(policyDetails.deductible) : null,
    'tenure_year': policyDetails ? parseInt(policyDetails.tenure_year) : null,
    }
    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))    
    console.log('policyHolderDetails.dailycashtopupsuminsured', policyHolderDetails)
	console.log('post_data-----', post_data);

    axios
      .post(`/daily-cash/full-quote`, formData)
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data))
	 console.log("fullQuoteResponse====",res.data.ValidateResult)
                   if(decryptResp.ValidateResult)
                   {
                        this.setState({
                            ...this.state,
                            hide:1
                        })
                        this.props.loadingStop();
                   }
                   else{

        if (!decryptResp.error) {
          this.setState({
            fulQuoteResp: decryptResp.data,
            serverResponse: true,
            error: [],
          });
        } else if (decryptResp.error) {
          this.setState({
            fulQuoteResp: decryptResp.data,
            error: {"message": decryptResp.msg},
            serverResponse: false,
          });
        }
        else {
          this.setState({
            fulQuoteResp: [],
            error: decryptResp.data,
            serverResponse: false,
          });
        }
        this.props.loadingStop();
	}
      })
      .catch((err) => {
        this.setState({
          serverResponse: false,
        });
        this.props.loadingStop();
      });
  };

  handleSubmit = (values) => {    
    const { refNumber , policyHolderDetails} = this.state
    const { productId } = this.props.match.params
	console.log('handleSubmit_values', values, policyHolderDetails, refNumber, productId)
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
    const { fulQuoteResp, addressArray, error, serverResponse, policyHolderDetails, nomineedetails, paymentStatus,hide,
      paymentgateway, bcMaster, menumaster, request_data, paymentButton, smsButton, show, refNumber } = this.state;

    let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
    const AddressDetails = addressArray ? (
        <div>
          <Row>
            <Col sm={12} md={12}>
              <Row>
                <Col sm={12} md={12}>
                  <FormGroup>{addressArray.address1 +", "+addressArray.address2 +", "+addressArray.address3}</FormGroup>
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
                      <FormGroup>{member.first_name}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Date Of Birth:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{moment(member.dob).format("DD-MM-yyyy")}</FormGroup>
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
                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Daily Cash Limit</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{cashLimit[member.cash_limit]}</FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Cover Duration</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{coverDuration[member.cover_duration]} Days</FormGroup>
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
                  <FormGroup>{moment(member.dob).format('DD-MM-yyy')}</FormGroup>
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
                  { relationArr[member.appointee_relation_with] }
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

              <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox argDetail">
                <h4 className="text-center mt-3 mb-3">
                  Hospital Daily Cash Policy
                </h4>
                <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                    // validationSchema={validatePremium}
                    >
                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                          console.log("values",values)
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
                                                        {menumaster && menumaster.name ? menumaster.name : null}
                                                      </FormGroup>
                                                    </Col>
                                                  </Row>
                                                </div>
                                              </Collapsible>
                                            </div>
                                        
                                          <div className="rghtsideTrigr">
                                            <Collapsible trigger="Hospital Daily Cash, SBI General Insurance Company Limited"  open= {true}>
                                              <div className="listrghtsideTrigr">
                                                <Row>
                                                 <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>Sum Insured:</FormGroup>
                                                  </Col>
                                                 <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>
                                                      <strong>Rs:</strong>{" "}
                                                      {policyHolderDetails && policyHolderDetails.request_data ? Math.round(policyHolderDetails.request_data.sum_insured) : null}
                                                    </FormGroup>
                                                  </Col>
                                                <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>Applicable Taxes:</FormGroup>
                                                  </Col>
                                                 <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>
                                                      <strong>Rs:</strong>{" "}
                                                      {policyHolderDetails && policyHolderDetails.request_data ? Math.round(policyHolderDetails.request_data.service_tax) : null}
                                                    </FormGroup>
                                                  </Col>
                                                 <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>{phrases['GrossPremium']}:</FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>
                                                      <strong>Rs:</strong>{" "}
                                                      {policyHolderDetails && policyHolderDetails.request_data ? Math.round(policyHolderDetails.request_data.gross_premium) : null}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>{phrases['Premium']}:</FormGroup>
                                                  </Col>
                                                 <Col sm={12} md={6} lg={3}>
                                                    <FormGroup>
                                                      <strong>Rs:</strong>{" "}
                                                      {policyHolderDetails && policyHolderDetails.request_data ? Math.round(policyHolderDetails.request_data.net_premium) : null}
                                                    </FormGroup>
                                                  </Col>
                                                </Row>
                                              </div>
                                            </Collapsible>
                                          </div>

                                          <div className="rghtsideTrigr custom_widthadd">
                                            <Collapsible trigger=" Member Details">
                                              <div className="listrghtsideTrigr">{items}</div>
                                            </Collapsible>
                                          </div>

                                          <div className="rghtsideTrigr">
                                            <Collapsible trigger=" Contact information">
                                              <div className="listrghtsideTrigr">
                                                <div className="d-flex justify-content-end carloan">
                                                  <Link to ={`/dailycash_Address/${productId}`}> Edit</Link>
                                                </div>
                                                <Row>
                                                  <Col sm={12} md={12}>

                                                    <Row>
                                                      <Col sm={12} md={6} lg={3}>
                                                        Mobile number:
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        {policyHolderDetails.mobile}
                                                      </Col>
                                                    </Row>
                                                    <Row>
                                                       <Col sm={12} md={6} lg={3}>
                                                      &nbsp;
                                                      </Col>
                                                    </Row>
                                                    <Row>
                                                      <Col sm={12} md={6} lg={3}>
                                                        Email:
                                                      </Col>
                                                       <Col sm={12} md={6} lg={3}>
                                                        {policyHolderDetails.email_id}
                                                      </Col>
                                                    </Row>
                                                    <Row>
                                                      <Col sm={12} md={6} lg={3}>
                                                      &nbsp;
                                                      </Col>
                                                    </Row>
                                                    <Row >
                                                       <Col sm={12} md={6} lg={3}>
                                                        Address:
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        {AddressDetails} 
                                                      </Col>
                                                    </Row>
                                                    
                                                    <Row>
                                                       <Col sm={12} md={6} lg={3}>
                                                        Pincode:
                                                      </Col>
                                                       <Col sm={12} md={6} lg={3}>
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
                                          {serverResponse ?
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
                                          </Row> : null }
                                          <Row>&nbsp;</Row>

                                          <Row>
                                          <div className="d-flex justify-content-left resmb">
                                            <button
                                              className="backBtn"
                                              onClick={this.nomineeDetails.bind(this, productId)}
                                            >
                                              Back
                                            </button>
                                          {bcMaster && bcMaster.eligible_for_payment_link == 1 && hide == 0?
                                            <div>
                                              <Button type="button" className="proceedBtn" onClick = {this.sendPaymentLink.bind(this)}>  Send Payment Link  </Button>
                                              &nbsp;&nbsp;&nbsp;&nbsp;
                                            </div> : null }

                                          {values.gateway && hide == 0?
                                            <Button className="backBtn" type="submit" >{phrases['MakePayment']}</Button>
                                          : null}

                                          {fulQuoteResp.QuotationNo && values.gateway != "" && serverResponse && paymentButton === true && hide == 0? 
                                           <Button type="submit"
                                              className="proceedBtn"
                                            >
                                              Make Payment
                                            </Button> : null
                                          } 
                                          </div>
                                          </Row>
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
  connect(mapStateToProps, mapDispatchToProps)(dailycash_PolicyDetails)
);
