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
import { paymentGateways} from '../../../shared/reUseFunctions';	
 


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
    paymentgateway: [],
    policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 
                        queryString.parse(this.props.location.search).access_id : 
                        localStorage.getItem("policyHolder_refNo"),
    ipaInfo: [],
    nomineeDetails: [],
    nomineeLength: 0,
    shop_building_name:"",
    block_no:"",
    street_name:"",
    plot_no:"",
    house_flat_no:"",
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
    this.getPolicyHolderDetails()
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

  getPolicyHolderDetails = () => {
    let policyHolder_id = 0
    
    this.props.loadingStart();
    axios
      .get(`/policy-holder/${localStorage.getItem("policyHolder_id")}`)
      .then((res) => {
        // let bcMaster = res.data.data.policyHolder ? res.data.data.policyHolder.bcmaster : {};
        // let menumaster = res.data.data.policyHolder ? res.data.data.policyHolder.menumaster : {};
        // let vehicleDetails = res.data.data.policyHolder ? res.data.data.policyHolder.vehiclebrandmodel : {};
        // let request_data = res.data.data.policyHolder && res.data.data.policyHolder.request_data ? res.data.data.policyHolder.request_data : {};
        let paymentgateway = res.data.data.policyHolder && res.data.data.policyHolder.bcmaster && res.data.data.policyHolder.bcmaster.bcpayment
        console.log("pay1",paymentgateway)
         this.setState({
           paymentgateway:paymentgateway
        //   policyHolderDetails: res.data.data.policyHolder ? res.data.data.policyHolder : [],
        //   familyMember: res.data.data.policyHolder.request_data.family_members,
        //   refNumber: res.data.data.policyHolder.reference_no,
        //   paymentStatus: res.data.data.policyHolder.payment ? res.data.data.policyHolder.payment[0] : [],
        //   nomineeDetails: res.data.data.policyHolder ? res.data.data.policyHolder.request_data.nominee[0]:[],
        //   bcMaster,  menumaster, request_data,paymentgateway, vehicleDetails

         });
        // this.getAccessToken(
        //   res.data.data.policyHolder,
        //   res.data.data.policyHolder.request_data.family_members
        // );
      })
      .catch((err) => {
        if(err.status == 401) {
          swal("Session out. Please login")
        }
        else swal("Something wrong happened. Please try after some")

        // this.setState({
        //   policyHolderDetails: [],
        // });
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
            let paymentgateway = decryptResp.data.policyHolder && decryptResp.data.policyHolder.bcmaster && decryptResp.data.policyHolder.bcmaster.paymentgateway
            let communication_address= decryptResp.data.policyHolder && decryptResp.data.policyHolder.address &&  decryptResp.data.policyHolder.address ? decryptResp.data.policyHolder.address : [];
            let shop_building_name=""
            let pincode_area=""
            let street_name=""
            let plot_no=""
            let  pincode=""
            if(communication_address)
            {
              console.log("string",communication_address)
             let arr_address=communication_address.split(",")
              console.log("array",arr_address)
              
              if(arr_address.length==8)
              {
                 shop_building_name=arr_address[1]
                 street_name=arr_address[2]
                 plot_no=arr_address[0]
                 pincode_area=arr_address[3]
                 console.log("hi1",shop_building_name,street_name,plot_no,pincode_area)
                
                 console.log("hi2",shop_building_name,street_name,plot_no,pincode_area)
              }
            }
           console.log("hi",shop_building_name,street_name,plot_no,pincode_area,pincode)
            this.setState({	
                policyHolder,vehicleDetails,request_data,menumaster,step_completed, bcMaster,	policyCoverage,shop_building_name,street_name,plot_no,pincode_area,
                paymentStatus: decryptResp.data.policyHolder.payment ? decryptResp.data.policyHolder.payment[0] : [],	
                nomineeDetails: request_data && request_data.nominee ? request_data.nominee[0]:[]	,
                nomineeLength: request_data && request_data.nominee ? request_data.nominee.length : 0	

            })	
            console.log("ok")
            this.props.loadingStop();   
            //this.getSukshmaAddress();  	
        })	
        .catch(err => {	
            // handle error	
            this.props.loadingStop();	
        })	
}	

getSukshmaAddress =()=>{
  let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'	
  let encryption = new Encryption();	
  this.props.loadingStart();
  axios.get(`sookshama/details/${policyHolder_id}`).then(res=>{
    let decryptResp = JSON.parse(encryption.decrypt(res.data));
    console.log("sukshma1",decryptResp);
    let risk_arr =decryptResp && decryptResp.data && decryptResp.data.policyHolder && 
    decryptResp.data.policyHolder.sookshamainfo && decryptResp.data.policyHolder.sookshamainfo.risk_address 
    && JSON.parse(decryptResp.data.policyHolder.sookshamainfo.risk_address);
    console.log("sukshma",risk_arr)
    this.setState({
      shop_building_name:risk_arr.shop_building_name,
       block_no:risk_arr.block_no,
        street_name:risk_arr.street_name,
       plot_no:risk_arr.plot_no,
      house_flat_no:risk_arr.house_flat_no,
    })
    this.props.loadingStop();
  }).catch(err=>{
    this.props.loadingStop();
  })


}

handleSubmit = (values) => {  
  const { policyHolder_refNo , policyHolder} = this.state
  const { productId } = this.props.match.params
  
  paymentGateways(values, policyHolder, policyHolder_refNo, policyHolder.product_id)
}


  render() {
    const { productId } = this.props.match.params;
    const { fulQuoteResp, error, show, policyHolder, nomineeDetails, paymentStatus, policyCoverage, 
      request_data, bcMaster, menumaster, vehicleDetails, paymentgateway, nomineeLength } = this.state;

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
                      <FormGroup>Relation With Proposer</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{member.relation_with}</FormGroup>
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
                                  vehicleDetails && vehicleDetails.vehicletype_id == 10 && nomineeDetails && nomineeDetails.relation ? nomineeDetails.relation.ksb_label : 
                                  vehicleDetails && vehicleDetails.vehicletype_id == 21 && nomineeDetails && nomineeDetails.relation ? nomineeDetails.relation.gsb_nominee_relation :
                                  vehicleDetails && vehicleDetails.vehicletype_id == 22 && nomineeDetails && nomineeDetails.relation ? nomineeDetails.relation.gsb_nominee_relation :
                                  vehicleDetails && vehicleDetails.vehicletype_id == 20 && nomineeDetails && nomineeDetails.relation ? nomineeDetails.relation.gsb_nominee_relation :null) ) }
                          </FormGroup> 
                      </Col>
                  </Row>
                  <Row>
                      <Col sm={12} md={6}>
                          <FormGroup>Gender:</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                          <FormGroup>{ nomineeDetails ?  nomineeDetails.gender && nomineeDetails.gender == 'm'? "Male":"Female" : null}</FormGroup>
                      </Col>
                  </Row>
  
              </Col>
          </Row>
          <Row>
              <p></p>
          </Row>
        </div>
    //console.log("check1",nomineeDetails.appointee_name,nomineeDetails.length);
        const apointeeData = 
        <div>
          <Row>
              <Col sm={12} md={6}>
                  <Row>
                      <Col sm={12} md={6}>
                          <FormGroup>Name:</FormGroup>
                      </Col>
                      <Col sm={12} md={6}>
                          <FormGroup>{nomineeDetails  ? typeof(nomineeDetails.appointee_name)!= "undefined" ? nomineeDetails.appointee_name : null:null}</FormGroup>
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
                                                          {Math.round(request_data.sum_insured)}
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
                                                        <FormGroup>Net Premium:</FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>
                                                          <strong>Rs:</strong>{" "}
                                                          {Math.round(request_data.gross_premium)}
                                                        </FormGroup>
                                                      </Col>
                                                      <Col sm={12} md={6} lg={3}>
                                                        <FormGroup>Gross Premium:</FormGroup>
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
                                      {vehicleDetails && vehicleDetails.vehicletype_id == '19' ?
                                        <div className="rghtsideTrigr">
                                        <Collapsible trigger="Proposer Details" >
                                            <div className="listrghtsideTrigr">
                                                <div>
                                                    {/* <strong>Proposer Details:</strong>
                                                    <br/> */}
                                                    {/* <Row>
                                                        <Col sm={12} md={6}>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>Title:</FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>{}</FormGroup>
                                                                </Col>
                                                            </Row>

                                                        </Col>
                                                    </Row> */}
                                                    <Row>
                                                        <Col sm={12} md={6}>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup> Name:</FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>{policyHolder.first_name}</FormGroup>
                                                                </Col>
                                                            </Row>

                                                        </Col>
                                                    </Row>
                                                    {/* <Row>
                                                        <Col sm={12} md={6}>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>Last Name:</FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup></FormGroup>
                                                                </Col>
                                                            </Row>

                                                        </Col>
                                                    </Row> */}
                                                    <Row>
                                                        <Col sm={12} md={6}>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>Email:</FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>{policyHolder.email_id}</FormGroup>
                                                                </Col>
                                                            </Row>

                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col sm={12} md={6}>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>Date Of Birth:</FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>{moment(policyHolder.dob).format('DD-MM-yyy')}</FormGroup>
                                                                </Col>
                                                            </Row>

                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col sm={12} md={6}>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>Mobile Number:</FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>{policyHolder.mobile}</FormGroup>
                                                                </Col>
                                                            </Row>

                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col sm={12} md={6}>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>Gender:</FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>{policyHolder.gender == 'm' ? "male" : "female"}</FormGroup>
                                                                </Col>
                                                            </Row>

                                                        </Col>
                                                    </Row>
                                                    {/* <Row>
                                                        <Col sm={12} md={6}>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>GSTIN:</FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup></FormGroup>
                                                                </Col>
                                                            </Row>

                                                        </Col>
                                                    </Row> */}
                                                    {/* <Row>
                                                        <Col sm={12} md={6}>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>Pan No:</FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup></FormGroup>
                                                                </Col>
                                                            </Row>

                                                        </Col>
                                                    </Row> */}
                                                    <Row>
                                                        <p></p>
                                                    </Row>
                                                </div>
                                            </div>
                                        </Collapsible>
                                    </div>

                                      :
                                              <div className="rghtsideTrigr custom_widthadd">
                                                <Collapsible trigger=" Member Details">
                                                <strong>Member Details :</strong>
                                                  <div className="listrghtsideTrigr">{memberDetails}</div>
                                                  <strong>Nominee Details :</strong>
                                                  <div className="listrghtsideTrigr">{nomineeData}</div>
                                                  {/* {console.log("nomineeDetails.appointee_name ---------- ", nomineeDetails.appointee_name)} */}
                                                  {nomineeDetails  && nomineeLength > 0 && nomineeDetails.is_appointee == 1 && nomineeDetails.appointee_name != 'null' ? <strong>Appointee Details :</strong> : null }
                                                  {nomineeDetails && nomineeLength > 0 &&  nomineeDetails.is_appointee == 1 && nomineeDetails.appointee_name != 'null' ? <div className="listrghtsideTrigr">{apointeeData}</div> : null }
                                                </Collapsible>
                                              </div>

                                       }

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

                                              {vehicleDetails && vehicleDetails.vehicletype_id == '19' ?
                                                <div className="rghtsideTrigr m-b-30">
                                                <Collapsible trigger="Communication Details" >
                                                    <div className="listrghtsideTrigr">
                                                        <div>
                                                            {/* <strong>Communication Details:</strong>
                                                            shop_building_name:"",
                                                                block_no:"",
                                                                street_name:"",
                                                                plot_no:"",
                                                                house_flat_no:"",
                                                            <br/> */}
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <Row>
                                                                        <Col sm={12} md={6}>
                                                                            <FormGroup>House/Building Name:</FormGroup>
                                                                        </Col>
                                                                        <Col sm={12} md={6}>
                                                                            <FormGroup>{this.state.shop_building_name}</FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                            
                                                                <Col sm={12} md={6}>
                                                                    <Row>
                                                                        <Col sm={12} md={6}>
                                                                            <FormGroup>Street Name:</FormGroup>
                                                                        </Col>
                                                                        <Col sm={12} md={6}>
                                                                            <FormGroup>{this.state.street_name}</FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <Row>
                                                                        <Col sm={12} md={6}>
                                                                            <FormGroup>Plot No:</FormGroup>
                                                                        </Col>
                                                                        <Col sm={12} md={6}>
                                                                            <FormGroup>{this.state.plot_no}</FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <Row>
                                                                        <Col sm={12} md={6}>
                                                                            <FormGroup>Pincode:</FormGroup>
                                                                        </Col>
                                                                        <Col sm={12} md={6}>
                                                                            <FormGroup>{this.state.policyHolder.pincode}</FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <Row>
                                                                        <Col sm={12} md={6}>
                                                                            <FormGroup>Pincode Area:</FormGroup>
                                                                        </Col>
                                                                        <Col sm={12} md={6}>
                                                                            <FormGroup>{this.state.pincode_area}</FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <p></p>
                                                            </Row>
                                                        </div>
                                                    </div>
                                                </Collapsible>    
                                            </div>
                                              
                                              :null
                                            }

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
                                                                      
                                                                              { gateways.paymentgateway.logo ? <img src={require('../../../assets/images/'+ gateways.paymentgateway.logo)} alt="" /> :
                                                                              null
                                                                              }
                                                                          </span>
                                                                      </label>
                                                                  </div> 
                                                                 : null
                                                                ) : null}	


                                                        </div>
                                                      </FormGroup>
                                                  </Col>
                                              </Row>

                                              <div className="d-flex justify-content-left resmb">

                                                {/* {bcMaster && bcMaster.eligible_for_payment_link == 1 ?
                                                  <div>
                                                  <Button type="button" className="proceedBtn" onClick = {this.sendPaymentLink.bind(this)}>  Send Payment Link  </Button>
                                                  &nbsp;&nbsp;&nbsp;&nbsp;
                                                  </div> : null } */}

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
