import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import BackContinueButton from '../common/button/BackContinueButton';
import Collapsible from 'react-collapsible';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik'
import moment from "moment";

const genderArr = {
m: "M",
f: "F"
}

// const date_UTC = moment().format();
const date_cstom = moment().format("D-MMMM-YYYY-h:mm:ss");
const date_DB = moment().format("YYYY-mm-D");

class PolicyDetails extends Component {

    state = {
        accessToken: "",
        policyHolderDetails: [],
        familyMember: [],
        fulQuoteResp: [],
        error: [],
        purchaseData: [],
        error1: []
      };

    policySummery = (policyId) => {
        this.props.history.push(`/ThankYou/${policyId}`);
    }

    nomineeDetails = (productId) => {
        this.props.history.push(`/NomineeDetails/${productId}`);
    }

    getPolicyHolderDetails = () => {
        this.props.loadingStart();
        axios
          .get(`/policy-holder/${localStorage.getItem('policyHolder_id')}`)
          .then(res => { 
            this.setState({
                policyHolderDetails: res.data.data.policyHolder,
                familyMember: res.data.data.policyHolder.request_data.family_members
            }) 
            this.getAccessToken(res.data.data.policyHolder, res.data.data.policyHolder.request_data.family_members);
          })
          .catch(err => {
            this.setState({
                policyHolderDetails: []
            });
            this.props.loadingStop();
          });
      }

    getAccessToken = (policyHolderDetails, familyMember) => {
        axios
          .post(`/callTokenService`)
          .then(res => { 
            this.setState({
                accessToken: res.data.access_token
            }) 
            this.fullQuote(res.data.access_token, policyHolderDetails, familyMember)
          })
          .catch(err => {
            this.setState({
                accessToken: []
            });
            this.props.loadingStop();
          });
      }
    
    getAccessTokenForInception = () => {
        this.props.loadingStart();
        axios
          .post(`/callTokenService`)
          .then(res => { 
            this.setState({
                accessToken: res.data.access_token
            }) 
            this.policyInception(res.data.access_token)
          })
          .catch(err => {
            this.setState({
                accessToken: []
            });
            this.props.loadingStop();
          });
      }

    fullQuote = (access_token, policyHolderDetails, familyMember) => {
        // const {accessToken, policyHolderDetails} = this.state
        let data = {
            "RequestHeader": {
                "requestID": "123456",
                "action": "fullQuote",
                "channel": "SBIG",
                "transactionTimestamp": "27-May-2020-17:47:56"
              },
              "RequestBody": {
                "ProductCode": "ASAN001",
                "ProductVersion": "1.0",
                "EffectiveDate": policyHolderDetails.request_data.start_date,
                "ExpiryDate": policyHolderDetails.request_data.end_date,
                "PremiumFrequency": "1",
                "FirstPolicyInceptionDate": "2020-05-27",
                "SanjeevaniFFCategory": 1,
                "AdditionalChildren": "0",
                "NonFloaterDiscount": "",
                "ProbableMaxLoss": "100",
                "KYCPhysicalFormat": "1",
                "KYCEformat": "0",
                "KYCRepository": "1",
                "KYCeInsuranceAccountNo": "",
                "KYCCKYCNo": "",
                "SACCODE": "",
                "SPCode": "",
                "SPEOAPartyID": "",
                "SPEOAUserID": "",
                "CommercialConsideration": "",
                "IMDCODE": "",
                "SimFlowId": "",
                "CustomerSegment": "",
                "NewBizClassification": "1",
                "BusinessType": "1",
                "BusinessSubType": "",
                "CustomerGSTINNo": "",
                "TransactionInitiatedBy": "",
                "IssuingBranchCode": "",
                "IssuingBranchGSTN": "",
                "SecondarySalesMgr": "",
                "AlternatePolicyNo": "",
                "AgreementCode": "2963",
                "SBIGBranchCode": "HO",
                "SBIGBranchStateCode": "MH",
                "GSTType": "SGST",
                "SiCurrencyCode": "INR",
                "PremiumCurrencyCode": "INR",
                "PremiumLocalExchangeRate": "",
                "PolicyType": "1",
                "AllocatedTPAName": "",
                "Address": "Address",
                "OSPTollFreeNo": "",
                "TPAName": "",
                "ContactNo": "9814254758",
                "ContactEmail": "test@mailinator.com",
                "ChannelType": "1",
                "TransactionDate": "2020-05-27",
                "TransactionId": "1234577",
                "ArogyaPolicyType": "1",
                "PlanClassification": "1",
                "MasterPolicyNo": "",
                "PlanName": "Plan A",
                "PolicyDuration": 1,
                "ArogyaPolicyTenure": "1",
                "AccountNo": "",
                "IFSCCode": "",
                "ReceiptNo": "",
                "Autorenewal": "0",
                "UINNumber": "",
                "PolicyCustomerList": 
                familyMember.map((member, qIndex) => ( 
                    {
                    "Title": "9000000003",
                    "CustomerName": "Test Test",
                    "FirstName": member.first_name,
                    "MiddleName": "",
                    "LastName": member.last_name,
                    "GenderCode": genderArr[member.gender],
                    "DateOfBirth": member.dob,
                    "BuildingHouseName": policyHolderDetails.address,
                    "StreetName": "StreetName",
                    "PostCode": "411057",
                    "District": "4000000185",
                    "City": policyHolderDetails.city,
                    "State": "MH",
                    "Mobile": "9814254758",
                    "Email": "test@mailinator.com",
                    "IsInsured": "1",
                    "GroupCompanyId": "",
                    "GroupEmployeeId": "",
                    "CampaignCode": "",
                    "ContactPersonTel": "9814254758",
                    "IdType": "1",
                    "IdNo": "",
                    "PlotNo": "PlotNo",
                    "RegistrationName": "",
                    "DateOfIncorporation": policyHolderDetails.request_data.start_date,
                    "PartyStatus": "1",
                    "AadharNumUHID": "",
                    "EIANumber": "",
                    "GSTRegistrationNum": "",
                    "ISDNum": "",
                    "GSTInputState": "",
                    "MaritalStatus": "M",
                    "PAN": "",
                    "IsOrgParty": "0",
                    "IsPolicyHolder": "1",
                    "Locality": "1",
                    "ContactEmail": "test@mailinator.com",
                    "STDCode": "",
                    "OccupationCode": "11",
                    "NationalityCode": "IND",
                    "PreferredContactMode": "",
                    "CountryCode": "1000000108"
                  }
                )),
                "PolicyLobList": [
                  {
                    "ProductCode": "ASAN001",
                    "PolicyRiskList": [
                      {
                        "ProductElementCode": "R10007",
                        "FirstName": policyHolderDetails.first_name,
                        "MiddleName": "",
                        "LastName": policyHolderDetails.last_name,
                        "GenderCode": genderArr[policyHolderDetails.gender],
                        "DateOfBirth": policyHolderDetails.dob,
                        "ArgInsuredRelToProposer": 2,
                        "ArogyaEdQualification": "1",
                        "ArogyaMaritalStatus": 1,
                        "ArogyaOccupation": "1",
                        "Height": 163.3,
                        "Weight": 58,
                        "PortabilityFlag": "0",
                        "InsuredDateofFirstPolicy": "2020-05-27",
                        "PreExistingSIForPortedPolicy": "300000",
                        "Questionnaire2b": "0",
                        "IsSmoker": "0",
                        "AlcoholStatus": "0",
                        "AlcoholQuantity": "1",
                        "PreExistingDisease": "0",
                        "Details": "Details",
                        "Years": 1,
                        "QueHealthInsDenied": "0",
                        "DetailsOfInsDenial": "",
                        "NomineeName": policyHolderDetails.request_data.nominee[0].first_name+" "+policyHolderDetails.request_data.nominee[0].last_name,
                        "NomineeGender": genderArr[policyHolderDetails.request_data.nominee[0].gender],
                        "NomineeDOB": policyHolderDetails.request_data.nominee[0].dob,
                        "NomineeRelToProposer": "3",
                        "ExclMetaCategory": "",
                        "ExclusionCategory": "",
                        "ExclusionSubCategory": "",
                        "ExclusionCode": "",
                        "ExclusionRemarks": "",
                        "HasConcurPolicy": "0",
                        "ConcurrentInsuranceCompany": "15",
                        "ConcurrentPolicyNo": "",
                        "ConcurrentInsuredSince": "",
                        "ConcurrentInsuranceFrom": "",
                        "ConcurrentSumInsured": "",
                        "ConcurrentInsuranceTo": "",
                        "ConcurSpecialCondition": "",
                        "ConcurrentClaimIifAny": "0",
                        "ConcurrentClaimDescription": "",
                        "ConcurrentClaimsReceived": "",
                        "HasPrePolicy": "0",
                        "PrevInsuranceCompany": "15",
                        "PrevPolicyNo": "",
                        "PrevInsuredSince": "",
                        "PrevInsuranceFrom": "",
                        "PrevInsuranceTo": "",
                        "PrevSumInsured": "",
                        "PrevSpecialCondition": "",
                        "PrevClaimIfAny": "0",
                        "PrevClaimsReceived": "",
                        "PrevPolicyCBPercent": "",
                        "PolicyCoverageList": [
                          { "ProductElementCode": "HVSC01", "SanjeevaniSumInsured": Math.floor(policyHolderDetails.request_data.sum_insured) }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
        
        

      const formData = new FormData(); 
      formData.append('data', JSON.stringify(data));
      formData.append('access_token', access_token);
      axios
        .post(`/fullQuoteServiceArogyaSeries`, formData)
        .then(res => { 
            if(res.data.PolicyObject){
                this.setState({
                    fulQuoteResp: res.data.PolicyObject,
                    error: []
                }) 
            }       
            else {
                this.setState({
                    fulQuoteResp: [],
                    error: res.data
                }) 
            }
            this.props.loadingStop();
        })
        .catch(err => {
          this.setState({
            serverResponse: []
          });
          this.props.loadingStop();
        });
    }

    policyInception = (access_token) => {
        const {fulQuoteResp, error} = this.state

        let data = 
            {
            "RequestHeader": {
                "requestID": "123234",
                "action": "getIssurance",
                "channel": "SBIGIC",
                "transactionTimestamp": "27-May-2020-17:49:35"
            },
            "RequestBody": {
                "QuotationNo": fulQuoteResp.QuotationNo,
                "Amount": fulQuoteResp.DuePremium,
                "CurrencyId": 1,
                "PayMode": 212,
                "FeeType": 11,
                "Payer": "payer",
                "TransactionDate": "2020-05-27T23:59:59",
                "PaymentReferNo": "PG357842",
                "InstrumentNumber": "PG357842",
                "InstrumentDate": date_DB,
                "BankCode": "2",
                "BankName": "STATE BANK OF INDIA",
                "BankBranchName": "",
                "BankBranchCode": "",
                "LocationType": "2",
                "RemitBankAccount": "30",
                "ReceiptCreatedBy": "ReceiptCreatedBy",
                "PickupDate": date_DB,
                "IFSCCode": "IFSCCode",
                "MICRNumber": "MICRNumber",
                "PANNumber": "PANNumber",
                "ReceiptBranch": "ReceiptBranch",
                "ReceiptTransactionDate": date_DB,
                "ReceiptDate": date_DB,
                "EscalationDepartment": "EscalationDepartment",
                "Comment": "Comment",
                "AccountNumber": "AccountNumber",
                "AccountName": "AccountName"
            }
            }
            
            const formData = new FormData(); 
            this.props.loadingStart();
            formData.append('data', JSON.stringify(data));
            formData.append('access_token', access_token);
            axios
                .post(`/callIssueQuoteMod`, formData)
                .then(res => { 
                    if(res.data){
                        this.setState({
                            purchaseData: res.data,
                            error1: []
                        }) 
                        localStorage.removeItem('policyHolder_id');
                        localStorage.removeItem('policyHolder_refNo');
                        this.policySummery(res.data.PolicyNo)
                    }       
                    else {
                        this.setState({
                            purchaseData: [],
                            error1: res.data
                        }) 
                    }
                })
                .catch(err => {
                this.setState({
                    serverResponse: []
                });
                this.props.loadingStop();
                });

    }


    componentDidMount() {
        this.getPolicyHolderDetails();
        
      }

    render() {
        const {productId} = this.props.match.params
        const {fulQuoteResp, error} = this.state
        const items = fulQuoteResp && fulQuoteResp.PolicyCustomerList && fulQuoteResp.PolicyCustomerList.length > 0 ? fulQuoteResp.PolicyCustomerList.map((member, qIndex)=>{
            return(
            <Row>
                    <Col sm={12} md={6}>
                        <Row>
                            <Col sm={12} md={6}><FormGroup>Name:</FormGroup></Col>
                            <Col sm={12} md={6}><FormGroup>{member.FirstName}</FormGroup></Col>
                        </Row>

                        <Row>
                            <Col sm={12} md={6}><FormGroup>Date Of Birth:</FormGroup></Col>
                            <Col sm={12} md={6}><FormGroup>{member.DateOfBirth}</FormGroup></Col>
                        </Row>

                        <Row>
                            <Col sm={12} md={6}><FormGroup>Relation With Proposer:</FormGroup></Col>
                            <Col sm={12} md={6}><FormGroup>self</FormGroup></Col>
                        </Row>

                        <Row>
                            <Col sm={12} md={6}><FormGroup>Gender</FormGroup></Col>
                            <Col sm={12} md={6}><FormGroup>{member.GenderCode}</FormGroup></Col>
                        </Row>

                    </Col>

                </Row>
          ) }) : null ;

        const errMsg =  error && error.messages && error.messages.length > 0 ? error.messages.map((msg, qIndex)=>{  
                return(
                    <h5> {msg.message}</h5>                   
                )                                                
            }) : null
                

        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10">
                                <h4 className="text-center mt-3 mb-3">Arogya Sanjeevani Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <div className="d-flex justify-content-left carloan">
                                            <h4> Details of your Policy Premium</h4>
                                        </div>
                                        <div className="brandhead m-b-30">
                                        <h5>{errMsg}</h5>
                                            <h4>Policy Reference Number {fulQuoteResp.QuotationNo}</h4>
                                            
                                        </div>

                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

                                                <div className="rghtsideTrigr">
                                                    <Collapsible trigger="Arogya Sanjeevani Policy, SBI General Insurance Company Limited" >
                                                        <div className="listrghtsideTrigr">
                                                            <Row>
                                                                <Col sm={12} md={3}><FormGroup>Sum Insured:</FormGroup></Col>
                                                                <Col sm={12} md={3}><FormGroup><strong>Rs:</strong> {fulQuoteResp.SumInsured}</FormGroup></Col>
                                                                <Col sm={12} md={3}><FormGroup>Applicable Taxes:</FormGroup></Col>
                                                                <Col sm={12} md={3}><FormGroup><strong>Rs:</strong> {fulQuoteResp.TGST}</FormGroup></Col>
                                                                <Col sm={12} md={3}><FormGroup>Gross Premium:</FormGroup></Col>
                                                                <Col sm={12} md={3}><FormGroup><strong>Rs:</strong> {fulQuoteResp.GrossPremium}</FormGroup></Col>
                                                                <Col sm={12} md={3}><FormGroup>Net Premium;</FormGroup></Col>
                                                                <Col sm={12} md={3}><FormGroup><strong>Rs:</strong> {fulQuoteResp.DuePremium}</FormGroup></Col>
                                                            </Row>
                                                        </div>

                                                    </Collapsible>
                                                </div>

                                                <div className="rghtsideTrigr">
                                                    <Collapsible trigger=" Member Details" >
                                                        <div className="listrghtsideTrigr">
                                                        
                                                        {items}

                                                        </div>

                                                    </Collapsible>
                                                </div>

                                                <div className="rghtsideTrigr m-b-40">
                                                    <Collapsible trigger=" Contact information" >
                                                        <div className="listrghtsideTrigr">
                                                            <div className="d-flex justify-content-end carloan">
                                                                <a href="#"> Edit</a>
                                                            </div>
                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <Row>
                                                                        <Col sm={12} md={6}>Mobile number:</Col>
                                                                        <Col sm={12} md={6}>{fulQuoteResp.ContactNo}</Col>
                                                                    </Row>

                                                                    <Row>
                                                                        <Col sm={12} md={6}>Email:</Col>
                                                                        <Col sm={12} md={6}>{fulQuoteResp.ContactEmail}</Col>
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                        </div>

                                                    </Collapsible>
                                                </div>

                                                <Row>
                                                    <Col sm={12} md={6}>
                                                        <FormGroup>
                                                        <div className="paymntgatway">
                                                        <img src={require('../../assets/images/down-arrow-blue.svg')} alt="" />
                                                        </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6}>
                                                    <FormGroup>
                                                        <div className="paymntgatway">
                                                        Select Payment Gateway
                                                        <div>
                                                        <img src={require('../../assets/images/radio-checked.svg')} alt="" className="m-t-10"/>
                                                        <img src={require('../../assets/images/CSC.svg')} alt="" className="m-l-5" /></div>
                                                        </div>
                                                        </FormGroup>
                                                    </Col>
                                                    </Row>

                                                    <div className="d-flex justify-content-left resmb">
                                                        <button className="backBtn" onClick= {this.nomineeDetails.bind(this, productId )}>Back</button>
                                                        <button className="proceedBtn" onClick= {this.getAccessTokenForInception}>Make Payment</button>
                                                    </div>

                                            </Col>

                                                <Col sm={12} md={3}>
                                                    <div className="regisBox">
                                                        <h3 className="medihead">Assurance of Insurance. Everywhere in India, for every Indian </h3>
                                                    </div>
                                                </Col>
                                        </Row>
                                    </div> 

                                </section>
                            </div>
                            </div>
                        </div>
                </BaseComponent>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
      loading: state.loader.loading
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop())
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(PolicyDetails));