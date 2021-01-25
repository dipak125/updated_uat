import React, { Component } from "react";
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

        let ipaInfo = decryptResp.data && decryptResp.data.policyHolder && decryptResp.data.policyHolder.ipainfo ? decryptResp.data.policyHolder.ipainfo : null;
        let policyHolderDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [];
        console.log("---ipaInfo--->>", ipaInfo);
        this.setState({
          ipaInfo, policyHolderDetails,
          nomineeDetails: policyHolderDetails.request_data && policyHolderDetails.request_data.nominee && policyHolderDetails.request_data.nominee[0],
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
    // this.setState({ show: true, refNo: values.refNo, whatsapp: values.whatsapp });
    const policyHolder = this.state.policyHolderDetails
    console.log("hello------------")
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
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment.php?refrence_no=${policyHolder_refNo}`
  }

  Razor_payment = () => {
      const { policyHolder_refNo } = this.state;
      window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/pay.php?refrence_no=${policyHolder_refNo}`
  }

  paypoint_payment = () => {
      const { policyHolder_refNo } = this.state;
      window.location = `${process.env.REACT_APP_PAYMENT_URL}/ppinl/pay.php?refrence_no=${policyHolder_refNo}`
  }


  render() {
    const { productId } = this.props.match.params;
    const { fulQuoteResp, error, show, policyHolderDetails, nomineeDetails, paymentStatus, policyCoverage, relationArr, ipaInfo } = this.state;

    console.log("policyHolderDetails ", policyHolderDetails)

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
  
                  {/* <Row>
                      <Col sm={12} md={6}>
                          <FormGroup>Gender</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                          <FormGroup>{nomineeDetails && nomineeDetails.gender == "m" ? "Male" : "Female"}</FormGroup>
                      </Col>
                  </Row> */}
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
                                          Policy Reference Number {fulQuoteResp.QuotationNo}
                                        </h4>
                                      </div>

                                      <Row>
                                        <Col sm={12} md={9} lg={9}>
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
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>Policy Start Date:</FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>
                                                      {policyHolderDetails && policyHolderDetails.request_data ? moment(policyHolderDetails.request_data.start_date).format('DD-MM-yyyy') : null}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>Policy End Date:</FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>
                                                      {policyHolderDetails && policyHolderDetails.request_data ? moment(policyHolderDetails.request_data.end_date).format('DD-MM-yyyy') : null}
                                                    </FormGroup>
                                                  </Col>
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
                                                      {Math.round(fulQuoteResp.GrossPremium)}
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
                                              onClick={this.CommunicationDetails.bind(this, productId)}
                                            >
                                              Back
                                            </Button>

                                            <Button type="button"
                                              className="proceedBtn"
                                              onClick = {this.sendPaymentLink.bind(this)}
                                            > 
                                              Send Payment Link 
                                            </Button>
                                            &nbsp;&nbsp;&nbsp;&nbsp;

                                          {fulQuoteResp.QuotationNo && values.gateway != "" ? 
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
