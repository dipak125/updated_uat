import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import BackContinueButton from '../common/button/BackContinueButton';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import { Formik, Field, Form, FieldArray } from "formik";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios"
import Encryption from '../../shared/payload-encryption';
import * as Yup from "yup";


const initialValue = {}
const ComprehensiveValidation = Yup.object().shape({
    // is_carloan: Yup.number().required('Please select one option')
    chasis_no_last_part:Yup.string().required('This field is required'),
    engine_no:Yup.string().required('Engine no is required'),
    chasis_no:Yup.string().required('Chasis no is required'),
    cng_kit:Yup.number().required('please checked an option'),
    // IDV:Yup.number().required('Declared value is required'),
    
   
    // eIA:Yup.number().required('Please select one option')
   
});

const moreCoverage = [
    {
        "id": "C101069",
        "name":"Basic Road Side Assistance",
        "description":"The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy"
    },
    {
        "id": "C101072",
        "name":"Depreciation Reimbursement",
        "description": "The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy"
    },
    {
        "id": "C101067",
        "name":"Return to Invoice",
        "description": "The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy"
    },
    {
        "id": "C101108",
        "name":"Engine Guard",
        "description": "The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy"
    },
    {
        "id": "C101111",
        "name":"Cover for consumables",
        "description": "The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy"
    }
]

const Coverage = {
        "C101064":"Own Damage",
        "C101065":"3rd party liability",
        "C101066":"Personal Accident cover",
        "C101069":"Basic Road Side Assistance",
        "C101072":"Depreciation Reimbursement",
        "C101067":"Return to Invoice",
        "C101108":"Engine Guard",
        "C101111":"Cover for consumables"
}

class OtherComprehensive extends Component {

    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            showCNG: false,
            is_CNG_account: '',
            accessToken: '',
            serverResponse: [],
            fulQuoteResp: [],
            PolicyArray: [],
            show: false,
            sliderVal: '',
            motorInsurance: [],
            add_more_coverage: [],
            vahanDetails: [],
            vahanVerify: false,
            policyCoverage: []
        };
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }

    showCNGText = (value) =>{
        if(value == 1){
            this.setState({
                showCNG:true,
                is_CNG_account:1
            })
        }
        else{
            this.setState({
                showCNG:false,
                is_CNG_account:0
            })
        }
    }

    sliderValue = (value) => {
        this.setState({
            sliderVal: value,
            serverResponse: [],
            error: []
        })
    }

    vehicleDetails = (productId) => {      
        this.props.history.push(`/VehicleDetails/${productId}`);
    }


    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        this.props.loadingStart();
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                let motorInsurance = res.data.data.policyHolder ? res.data.data.policyHolder.motorinsurance : {}
                
                this.setState({
                    motorInsurance,
                    vahanVerify: motorInsurance.chasis_no && motorInsurance.engine_no ? true : false
                })
                this.props.loadingStop();
                this.getAccessToken()
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    getAccessToken = () => {
        this.props.loadingStart();
        axios
          .post(`/callTokenService`)
          .then((res) => {
            this.setState({
              accessToken: res.data.access_token,
            });
            this.fullQuote(res.data.access_token)
          })
          .catch((err) => {
            this.setState({
              accessToken: '',
            });
            this.props.loadingStop();
          });
      };

    getVahanDetails = (chasiNo, regnNo) => {
        const formData = new FormData();
        formData.append("chasiNo", chasiNo);
        formData.append("regnNo", regnNo);

        this.props.loadingStart();
        axios
          .post(`/getVahanDetails`,formData)
          .then((res) => {
            this.setState({
              vahanDetails: res.data,
              vahanVerify: res.data.length > 0 ? true : false
            });
            this.props.loadingStop();
          })
          .catch((err) => {
            this.setState({
                vahanDetails: [],
            });
            this.props.loadingStop();
          });
    };

    fullQuote = (access_token) => {
        const { PolicyArray, sliderVal, add_more_coverage } = this.state
        let defaultSliderValue = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        const formData = new FormData();
        formData.append("access_token", access_token);
        formData.append("id", localStorage.getItem("policyHolder_id"));

        formData.append("idv_value", sliderVal ? sliderVal : defaultSliderValue.toString());
        formData.append("policy_type", localStorage.getItem('policy_type'));
        formData.append("add_more_coverage", add_more_coverage);

        // const post_data = {
        //     'id':localStorage.getItem('policyHolder_id'),
        //     'access_token':access_token
        // }
        // let encryption = new Encryption();
            // formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        axios.post('fullQuotePMCAR',formData)
            .then(res => {
                if (res.data.PolicyObject) {
                    this.setState({
                      fulQuoteResp: res.data.PolicyObject,
                      PolicyArray: res.data.PolicyObject.PolicyLobList,
                      error: [],
                      serverResponse: res.data.PolicyObject,
                      policyCoverage: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : [],
                    });
                  } else {
                    this.setState({
                      fulQuoteResp: [],
                      error: res.data,
                      serverResponse: []
                    });
                  }
                this.props.loadingStop();
            })
            .catch(err => {
                this.setState({
                    serverResponse: [],
                });
                this.props.loadingStop();
            })
    }


    handleSubmit = (values) => {
        const { productId } = this.props.match.params
        const { motorInsurance, PolicyArray, sliderVal, add_more_coverage } = this.state
        let defaultSliderValue = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        if(add_more_coverage.length > 0){
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'registration_no': motorInsurance.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'cng_kit': values.cng_kit,
                'cngKit_Cost': values.cngKit_Cost,
                'engine_no': values.engine_no,
                'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
                'add_more_coverage': add_more_coverage
            }
        }
        else {
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'registration_no': motorInsurance.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'cng_kit': values.cng_kit,
                'cngKit_Cost': values.cngKit_Cost,
                'engine_no': values.engine_no,
                'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
            }
        }
        console.log('post_data',post_data)
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('update-insured-value', formData).then(res => {
            this.props.loadingStop();
            if (res.data.error == false) {
                this.props.history.push(`/Additional_details/${productId}`);
            }

        })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    onRowSelect = (values,isSelect) =>{

        const { add_more_coverage} = this.state;
         var drv = [];
         if(isSelect) {          
            add_more_coverage.push(values);
            this.setState({
                add_more_coverage: add_more_coverage,
                serverResponse: [],
                error: []
            });                               
        }
        else {                
            const index = add_more_coverage.indexOf(values);    
            if (index !== -1) {  
                add_more_coverage.splice(index,1);
                this.setState({
                    serverResponse: [],
                    error: []
                });      
                }                  
        }
    }

    componentDidMount() {
        this.fetchData()
    }


    render() {
        const {showCNG, vahanDetails, policyCoverage, vahanVerify, is_CNG_account, fulQuoteResp, PolicyArray, sliderVal, motorInsurance, serverResponse, add_more_coverage} = this.state
        const {productId} = this.props.match.params 
        let defaultSliderValue = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        let sliderValue = sliderVal
        let minIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MinIDV_Suggested) : null
        let maxIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MaxIDV_Suggested) : null
        
        let newInitialValues = Object.assign(initialValue, {
            registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
            chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : "",
            chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
            add_more_coverage: motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage : "",
            cng_kit: motorInsurance.cng_kit ? motorInsurance.cng_kit : 0,
            cngKit_Cost: motorInsurance.cngkit_cost ? motorInsurance.cngkit_cost : "",
            engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : "",

        });
        const policyCoverageList = policyCoverage && policyCoverage.length > 0 ?
        policyCoverage.map((coverage, qIndex) => {
            return(
                <div>
                    <Row>
                        <Col sm={12} md={6}>
                        <FormGroup>{Coverage[coverage.ProductElementCode]}</FormGroup>
                        </Col>
                        <Col sm={12} md={6}>
                        <FormGroup>₹ {coverage.AnnualPremium}</FormGroup>
                        </Col>
                    </Row>
                </div>
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
                <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                <section className="brand colpd m-b-25">
                    <div className="d-flex justify-content-left">
                        <div className="brandhead m-b-10">
                            <h4 className="m-b-30">Covers your Car + Damage to Others (Comprehensive)</h4>
                        </div>
                    </div>
                    <Formik initialValues={newInitialValues} 
                    onSubmit={ serverResponse && serverResponse != "" ? (serverResponse.message ? this.getAccessToken : this.handleSubmit ) : this.getAccessToken} 
                    validationSchema={ComprehensiveValidation}>
                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                    return (
                        <Form>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                                <div className="rghtsideTrigr W-90 m-b-30">
                                    <Collapsible trigger="Default Covered Coverages & Benefit" >
                                        <div className="listrghtsideTrigr">
                                            {policyCoverageList}
                                        </div>
                                    </Collapsible>
                                </div>

                            <Row>
                            <Col sm={12} md={6} lg={4}>
                            <Row>
                            <Col sm={12} md={5} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            Registration No:
                                            </div>
                                        </FormGroup>
                                        </Col>
                                
                                <Col sm={12} md={5} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                    <Field
                                                        type="text"
                                                        name='registration_no' 
                                                        autoComplete="off"
                                                        className="premiumslid"   
                                                        value= {values.registration_no}                                        
                                                        
                                                    />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    </Row>
                                    </Col>

                                    <Col sm={12} md={6} lg={5}>
                                    <Row>
                                <Col sm={12} md={5} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            Please Enter Last 5 digits of Chassis no.
                                            </div>
                                        </FormGroup>
                                    </Col>
                                
                                <Col sm={12} md={5} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                    <Field
                                                        type="text"
                                                        name='chasis_no_last_part' 
                                                        autoComplete="off"
                                                        className="premiumslid"       
                                                        value= {values.chasis_no_last_part}                                    
                                                        
                                                    />
                                                     {errors.chasis_no_last_part && touched.chasis_no_last_part ? (
                                                    <span className="errorMsg">{errors.chasis_no_last_part}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    </Row>
                                    </Col>

                                    <Col sm={12} md={2} lg={2}>
                                        <FormGroup>
                                            
                                            <Button className="btn btn-primary vrifyBtn" onClick= {this.getVahanDetails.bind(this,values.chasis_no_last_part, values.registration_no)}>Verify</Button>
                                            
                                        </FormGroup>
                                    </Col>
                                    </Row>
                                {vahanVerify ?
                                <Row>
                                    <Col sm={12} md={6} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="engine_no"
                                                    type="text"
                                                    placeholder="Engine Number"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value= {values.engine_no}
                                                />
                                                {errors.engine_no && touched.engine_no ? (
                                                    <span className="errorMsg">{errors.engine_no}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={6} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="chasis_no"
                                                    type="text"
                                                    placeholder="Chasis Number"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value= {values.chasis_no}
                                                />
                                                {errors.chasis_no && touched.chasis_no ? (
                                                    <span className="errorMsg">{errors.chasis_no}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                : null}

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <span className="fs-16">Insured Declared Value</span>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={3} lg={2}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name="IDV"
                                                type="text"
                                                placeholder=""
                                                autoComplete="off"
                                                className="premiumslid"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value={sliderValue ? sliderValue : defaultSliderValue}  
                                            />
                                            {errors.IDV && touched.IDV ? (
                                                <span className="errorMsg">{errors.IDV}</span>
                                            ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={12} lg={6}>
                                        <FormGroup>
                                        <input type="range" className="W-90" 
                                        name= 'slider'
                                        defaultValue= {defaultSliderValue}
                                        min= {minIDV}
                                        max= {maxIDV}
                                        step= '1'
                                        value={values.slider}
                                        onChange= {(e) =>{
                                        setFieldTouched("slider");
                                        setFieldValue("slider",values.slider);
                                        this.sliderValue(e.target.value)
                                    }}
                                        />
                                            {/* <img src={require('../../assets/images/slide.svg')} alt="" className="W-90" /> */}
                                        </FormGroup>
                                    </Col>
                                </Row>

                                                               

                                <Row>
                                    <Col sm={12} md={5} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <span className="fs-16"> Have you fitted external CNG Kit</span>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={3} lg={3}>
                                        <FormGroup>
                                            <div className="d-inline-flex m-b-35">
                                                <div className="p-r-25">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='cng_kit'                                            
                                                        value='1'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`cng_kit`, e.target.value);
                                                            this.showCNGText(1);
                                                        }}
                                                        checked={values.cng_kit == '1' ? true : false}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='cng_kit'                                            
                                                        value='0'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`cng_kit`, e.target.value);
                                                            this.showCNGText(0);
                                                        }}
                                                        checked={values.cng_kit == '0' ? true : false}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">No</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    {showCNG || is_CNG_account == 1 ?
                                    <Col sm={12} md={12} lg={4}>
                                        <FormGroup>
                                        <div className="insurerName">   
                                            <Field
                                                name="cngKit_Cost"
                                                type="text"
                                                placeholder="Cost of Kit"
                                                autoComplete="off"
                                                className="W-80"
                                                value = {values.cngKit_Cost}
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            />
                                            {errors.cngKit_Cost && touched.cngKit_Cost ? (
                                            <span className="errorMsg">{errors.cngKit_Cost}</span>
                                            ) : null}                                             
                                            </div>
                                        </FormGroup>
                                    </Col> : ''}
                                </Row>

                                <Row>
                                    <Col sm={12} md={12} lg={12}>
                                        <FormGroup>
                                            <span className="fs-18"> Add  more coverage to your plan.</span>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row className="m-b-40">
                                {moreCoverage.map((coverage, qIndex) => ( 
                                                                                         
                                    <Col sm={12} md={6} lg={6}  key= {qIndex} > 
                                        <label className="customCheckBox formGrp formGrp">{coverage.name}
                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{coverage.description}</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool"/></a>
                                            </OverlayTrigger>
                                            <Field
                                                type="checkbox"
                                                name={`moreCov_${qIndex}`}                                 
                                                value={coverage.id}
                                                className="user-self"
                                                // checked={values.roadsideAssistance ? true : false}
                                                onClick={(e) =>
                                                    this.onRowSelect(e.target.value, e.target.checked )
                                                }
                                            />
                                            <span className="checkmark mL-0"></span>
                                            <span className="error-message"></span>
                                        </label>
                                    </Col>
                                ))}
                                    </Row>    
                                    <div className="d-flex justify-content-left resmb">
                                        <Button className={`backBtn`} type="button"  onClick= {this.vehicleDetails.bind(this,productId)}>
                                            Back
                                        </Button> 
                                        { serverResponse && serverResponse != "" ? (serverResponse.message ? 
                                        <Button className={`proceedBtn`} type="submit"  >
                                            Quote
                                        </Button> : <Button className={`proceedBtn`} type="submit"  >
                                            Continue
                                        </Button> ) : <Button className={`proceedBtn`} type="submit"  >
                                            Quote
                                        </Button>}
                                        </div>
                                    </Col>

                                    <Col sm={12} md={3}>
                                        <div className="justify-content-left regisBox">
                                            <h3 className="premamnt"> Total Premium Amount</h3>
                                            <div className="rupee"> ₹ {fulQuoteResp.DuePremium}</div>
                                            <div className="text-center">
                                                <Button className={`brkbtn`} type="button" onClick= {this.handleShow}>
                                                Breakup
                                                </Button> 
                                             </div>
                                        </div>
                                    </Col>
                                </Row>
                                </Form>
                                );
                            }}
                        </Formik>
                    </section>
                    <Footer />
                    </div>
                    </div>
                    </div>
                </BaseComponent>
                <Modal className="customModal" bsSize="md"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <Modal.Header closeButton className="custmModlHead">
                        <div className="cntrbody">
                            <h3>Premium breakup </h3>                           
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                    <h5> Net Premium Amount  ₹ {fulQuoteResp.DuePremium}</h5>
                    <h5> Gross Premium Amount  ₹ {fulQuoteResp.BeforeVatPremium}</h5>
                    <h5> Service Tax  ₹ {fulQuoteResp.TGST}</h5>
                    
                    </Modal.Body>
                </Modal>

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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(OtherComprehensive));