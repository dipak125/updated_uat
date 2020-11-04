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
import swal from 'sweetalert';
import moment from "moment";


const initialValue = {
    registration_no: "",
    chasis_no: "",
    chasis_no_last_part: "",
    add_more_coverage: "",
    cng_kit: 0,
    // cngKit_Cost: 0,
    engine_no: "",
    vahanVerify: false,
    newRegistrationNo: "",
    puc: '1'
}
const ComprehensiveValidation = Yup.object().shape({
    // is_carloan: Yup.number().required('Please select one option')

    // registration_no: Yup.string().required('Please enter valid registration number')
    // .matches(/^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{4}$/, 'Invalid Registration number'),

    registration_no: Yup.string().when("newRegistrationNo", {
        is: "NEW",       
        then: Yup.string(),
        otherwise: Yup.string().required('Please provide registration number').matches(/^[A-Z]{2}[ -][0-9]{1,2}[ -][A-Z]{1,3}[ -][0-9]{4}$/, 'Invalid Registration number'),
    }),

    puc: Yup.string().required("Please verify pollution certificate to proceed"),

    chasis_no_last_part:Yup.string().required('This field is required')
    .matches(/^([0-9]*)$/, function() {
        return "Invalid number"
    })
    .min(5, function() {
        return "Chasis no. should be last 5 digit"
    })
    .max(5, function() {
        return "Chasis no. should be last 5 digit"
    }),

    engine_no:Yup.string().required('Engine no is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Invalid engine number"
    })
    .min(5, function() {
        return "Engine no. should be minimum 5 characters"
    })
    .max(17, function() {
        return "Engine no. should be maximum 17 characters"
    }),

    chasis_no:Yup.string().required('Chasis no is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Invalid chasis number"
    })
    .min(5, function() {
        return "Chasis no. should be minimum 5 characters"
    })
    .max(17, function() {
        return "Chasis no. should be maximum 17 characters"
    }),

    // cng_kit:Yup.string().required("Please select an option"),
    // // IDV:Yup.number().required('Declared value is required'),
    
    // cngKit_Cost: Yup.string().when(['cng_kit'], {
    //     is: cng_kit => cng_kit == '1',       
    //     then: Yup.string().required('Please provide CNG kit cost'),
    //     othewise: Yup.string()
    // }).matches(/^([0-9]*)$/, function() {
    //     return "Invalid number"
    // }),
   
    vahanVerify:Yup.boolean().notRequired('Please verify chasis number')
    .test(
        "vahanVerifyChecking",
        function() {
            return "Please verify chasis number"
        },
        function (value) {
            if (value == false && this.parent.chasis_no_last_part && this.parent.chasis_no_last_part.length == 5) {  
                return false;
            }
            return true;
        }
    )
   
});


const Coverage = {
        "C101064":"Own Damage",
        "C101065":"Legal Liability to Third Party",
        "C101066":"PA Cover",
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
            policyCoverage: [],
            regno:'',
            length:14,
            moreCoverage: [],
            engine_no: "",
            chasis_no: "",
            chasiNo:'',
            engineNo:''
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

    handleChange = () => {
        this.setState({serverResponse: [], error: [] });
    }

    showCNGText = (value) =>{
        if(value == 1){
            this.setState({
                showCNG:true,
                is_CNG_account:1,
                serverResponse: [],
                error: []
            })
        }
        else{
            this.setState({
                showCNG:false,
                is_CNG_account:0,
                serverResponse: [],
                error: []
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
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let values = []
                this.setState({
                    motorInsurance,
                    showCNG: motorInsurance.cng_kit == 1 ? true : false,
                    vahanVerify: motorInsurance.chasis_no && motorInsurance.engine_no ? true : false
                })
                this.props.loadingStop();
                this.getAccessToken(values)
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    getAccessToken = (values) => {
        this.props.loadingStart();
        axios
          .post(`/callTokenService`)
          .then((res) => {
            this.setState({
              accessToken: res.data.access_token,
            });
            this.fullQuote(res.data.access_token, values)
          })
          .catch((err) => {
            this.setState({
              accessToken: '',
            });
            this.props.loadingStop();
          });
      };

    getMoreCoverage = () => {
        this.props.loadingStart();
        axios
          .get(`/coverage-list/${localStorage.getItem('policyHolder_id')}`)
          .then((res) => {
            this.setState({
            moreCoverage: res.data.data,
            });
            this.fetchData()
          })
          .catch((err) => {
            this.setState({
                moreCoverage: [],
            });
            this.props.loadingStop();
          });
      };

    getVahanDetails = async(values, setFieldTouched, setFieldValue, errors) => {

        const formData = new FormData();
        if(values.newRegistrationNo == "NEW") {
            formData.append("regnNo", values.newRegistrationNo);
            setFieldTouched('registration_no');
            setFieldValue('registration_no', values.newRegistrationNo);
        }
        else {
            formData.append("regnNo", values.registration_no);
        }

        formData.append("chasiNo", values.chasis_no_last_part);
        
        if(errors.registration_no || errors.chasis_no_last_part) {
            swal("Please provide correct Registration number and Chasis number")
        }
        else {
            if(values.newRegistrationNo != "NEW") {
                this.props.loadingStart()
                await axios
                .post(`/getVahanDetails`,formData)
                .then((res) => {
                    this.setState({
                    vahanDetails: res.data,
                    vahanVerify:  true 
                });
                if(this.state.vahanDetails.data[0].chasiNo){
                    this.setState({chasiNo: this.state.vahanDetails.data[0].chasiNo})
                }

                if(this.state.vahanDetails.data[0].engineNo){
                    this.setState({engineNo: this.state.vahanDetails.data[0].engineNo})
                }

                setFieldTouched('vahanVerify')
                setFieldValue('vahanVerify', true)
                console.log('chasiNo', this.state.chasiNo)
                console.log('engineNo', this.state.engineNo)
                setFieldTouched('engine_no')
                setFieldValue('engine_no', this.state.engineNo)
                setFieldTouched('chasis_no')
                setFieldValue('chasis_no', this.state.chasiNo)

                this.props.loadingStop();
                })
                .catch((err) => {
                    this.setState({
                        vahanDetails: [],
                        vahanVerify:  true
                    });
                    setFieldTouched('vahanVerify')
                    setFieldValue('vahanVerify', true) 
                    this.props.loadingStop();
                });
            }
            else {
                this.props.loadingStart()
                    this.setState({
                    vahanDetails: [],
                    vahanVerify:  true 
                    });
    
                    setFieldTouched('vahanVerify')
                    setFieldValue('vahanVerify', true) 
    
                    this.props.loadingStop();
            }

        }
    };

    // getVahanDetails = (values, setFieldTouched, setFieldValue, errors) => {

    //     const formData = new FormData();
    //     if(values.newRegistrationNo == "NEW") {
    //         formData.append("regnNo", values.newRegistrationNo);
    //         setFieldTouched('registration_no');
    //         setFieldValue('registration_no', values.newRegistrationNo);
    //     }
    //     else {
    //         formData.append("regnNo", values.registration_no);
    //     }

    //     formData.append("chasiNo", values.chasis_no_last_part);
        
    //     if(errors.registration_no || errors.chasis_no_last_part) {
    //         swal("Please provide correct Registration number and Chasis number")
    //     }
    //     else {
    //         this.props.loadingStart()
    //             this.setState({
    //             vahanDetails: [],
    //             vahanVerify:  true 
    //             });

    //             setFieldTouched('vahanVerify')
    //             setFieldValue('vahanVerify', true) 

    //             this.props.loadingStop();
    //     }
    // };

    fullQuote = (access_token, values) => {
        const { PolicyArray, sliderVal, add_more_coverage } = this.state
        // let cng_kit_flag = 0;
        // let cngKit_Cost = 0;
        // if(values.toString()) {            
        //     cng_kit_flag = values.cng_kit
        //     cngKit_Cost = values.cngKit_Cost
        // }
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        const formData = new FormData();

        let csc_data = localStorage.getItem('users') ? localStorage.getItem('users') : "";
        let csc_user_type = "";

        if(csc_data && sessionStorage.getItem('csc_id')) {
            let encryption = new Encryption();
            csc_data = JSON.parse(csc_data)        
            csc_data = csc_data.user
            csc_data = JSON.parse(encryption.decrypt(csc_data));           
            csc_user_type = csc_data.type
        }
       

        const post_data = {
            'ref_no':localStorage.getItem('policyHolder_refNo'),
            'access_token':access_token,
            'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
            'policy_type': localStorage.getItem('policy_type'),
            'add_more_coverage': add_more_coverage.toString(),
            // 'cng_kit': cng_kit_flag,
            // 'cngKit_Cost': cngKit_Cost
        }

        if(post_data.idv_value > 5000000 && csc_user_type == "POSP") {
            swal("Quote cannot proceed with IDV greater than 5000000")
            this.props.loadingStop();
            return false
        }

        console.log('fullQuote_post_data', post_data)
        let encryption = new Encryption();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
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
                      fulQuoteResp: [],add_more_coverage,
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
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0

        let csc_data = localStorage.getItem('users') ? localStorage.getItem('users') : "";
        let csc_user_type = "";

        if(csc_data && sessionStorage.getItem('csc_id')) {
            let encryption = new Encryption();
            csc_data = JSON.parse(csc_data)        
            csc_data = csc_data.user
            csc_data = JSON.parse(encryption.decrypt(csc_data));           
            csc_user_type = csc_data.type
        }

        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        if(add_more_coverage.length > 0){
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'registration_no': motorInsurance.registration_no ? motorInsurance.registration_no : values.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'cng_kit': values.cng_kit,
                // 'cngkit_cost': values.cngKit_Cost,
                'engine_no': values.engine_no,
                'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
                'add_more_coverage': add_more_coverage,
                'puc': values.puc
            }
        }
        else {
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'registration_no':motorInsurance.registration_no ? motorInsurance.registration_no : values.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'cng_kit': values.cng_kit,
                // 'cngkit_cost': values.cngKit_Cost,
                'engine_no': values.engine_no,
                'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
                'puc': values.puc
            }
        }
        console.log('post_data',post_data)
        if(post_data.idv_value > 5000000 && csc_user_type == "POSP") {
            swal("Quote cannot proceed with IDV greater than 5000000")
            this.props.loadingStop();
            return false
        }
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

    regnoFormat = (e, setFieldTouched, setFieldValue) => {
        
        let regno = e.target.value
        let formatVal = ""
        let regnoLength = regno.length
        var letter = /^[a-zA-Z]+$/;
        var number = /^[0-9]+$/;
        let subString = regno.substring(regnoLength-1, regnoLength)
        let preSubString = regno.substring(regnoLength-2, regnoLength-1)

        if(subString.match(letter) && preSubString.match(letter)) {
            formatVal = regno
        }
        else if(subString.match(number) && preSubString.match(number)) {
            formatVal = regno
        } 
        else if(subString.match(number) && preSubString.match(letter)) {        
            formatVal = regno.substring(0, regnoLength-1) + " " +subString      
        } 
        else if(subString.match(letter) && preSubString.match(number)) {
            formatVal = regno.substring(0, regnoLength-1) + " " +subString   
        } 

        else formatVal = regno.toUpperCase()
        
        e.target.value = formatVal.toUpperCase()

    }


    componentDidMount() {
        this.getMoreCoverage()
    }


    render() {
        const {showCNG, vahanDetails,error, policyCoverage, vahanVerify, is_CNG_account, fulQuoteResp, PolicyArray, 
            moreCoverage, sliderVal, motorInsurance, serverResponse, engine_no, chasis_no} = this.state
        const {productId} = this.props.match.params 
        
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        let sliderValue = sliderVal
        let minIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MinIDV_Suggested) : null
        let maxIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MaxIDV_Suggested) : null
        minIDV = minIDV + 1;
        maxIDV = maxIDV - 1;

        let newInitialValues = Object.assign(initialValue, {
            registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
            chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : (chasis_no ? chasis_no : ""),
            chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
            add_more_coverage: motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage : "",
            // cng_kit: motorInsurance.cng_kit ? motorInsurance.cng_kit : "",
            // cng_kit: motorInsurance.cng_kit == 0 || motorInsurance.cng_kit == 1 ? motorInsurance.cng_kit : is_CNG_account,
            // cngKit_Cost: motorInsurance.cngkit_cost ? Math.round(motorInsurance.cngkit_cost) : 0,
            engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : (engine_no ? engine_no : ""),
            vahanVerify: vahanVerify,
            newRegistrationNo: localStorage.getItem('registration_number') == "NEW" ? localStorage.getItem('registration_number') : ""

        });

        console.log("engine_no -------chasis_no--- ", engine_no+"-------"+chasis_no)

        let OD_TP_premium = serverResponse.PolicyLobList ? serverResponse.PolicyLobList[0].PolicyRiskList[0] : []

        const policyCoverageList = policyCoverage && policyCoverage.length > 0 ?
        policyCoverage.map((coverage, qIndex) => {
            // let coverSpan = Math.floor(moment(coverage.ExpiryDate).diff(coverage.EffectiveDate, 'years', true)) + 1;
            return(
                <div>
                    <Row>
                        <Col sm={12} md={6}>
                        <FormGroup>{Coverage[coverage.ProductElementCode]}</FormGroup>
                        </Col>
                        <Col sm={12} md={6}>
                        <FormGroup>₹ {Math.round(coverage.BeforeVatPremium)}  </FormGroup>                      
                        </Col>
                    </Row>
                </div>
            )
        }) : null

        const premiumBreakup = policyCoverage && policyCoverage.length > 0 ?
            policyCoverage.map((coverage, qIndex) => {
                return(
                    <tr>
                        <td>{Coverage[coverage.ProductElementCode]}:</td>
                        <td>₹ {Math.round(coverage.BeforeVatPremium)}</td>
                    </tr>
                )   
            }) : null
        

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
                            <h5>{errMsg}</h5>
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
                                            {values.newRegistrationNo != "NEW" ?
                                                <Field
                                                    name="registration_no"
                                                    type="text"
                                                    placeholder=""
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value= {values.registration_no}   
                                                    maxLength={this.state.length}
                                                    onInput={e=>{
                                                        this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                    }}        
        
                                                /> : 
                                                <Field
                                                        type="text"
                                                        name='registration_no' 
                                                        autoComplete="off"
                                                        className="premiumslid"   
                                                        value= {values.newRegistrationNo}    
                                                        disabled = {true}                                                 
                                                    />}

                                                {errors.registration_no ? (
                                                    <span className="errorMsg">{errors.registration_no}</span>
                                                ) : null}
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
                                                            maxLength="5"       
                                                            onChange = {(e) => {
                                                                setFieldValue('vahanVerify', false)

                                                                setFieldTouched('chasis_no_last_part')
                                                                setFieldValue('chasis_no_last_part', e.target.value)                       
                                                            }}                           
                                                            
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
                                        
                                            <Button className="btn btn-primary vrifyBtn" onClick= {!errors.chasis_no_last_part ? this.getVahanDetails.bind(this,values, setFieldTouched, setFieldValue, errors) : null}>Verify</Button>
                                            {errors.vahanVerify ? (
                                                    <span className="errorMsg">{errors.vahanVerify}</span>
                                                ) : null}
                                        </FormGroup>
                                    </Col>
                            </Row>
                            {values.vahanVerify && !errors.chasis_no_last_part ?
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
                                                value= {values.engine_no.toUpperCase()}
                                                maxLength="17"
                                                onChange = {(e) => {
                                                    setFieldTouched('engine_no')
                                                    setFieldValue('engine_no', e.target.value)                       
                                                }}  
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
                                                value= {values.chasis_no.toUpperCase()}
                                                maxLength="17"
                                                onChange = {(e) => {
                                                    setFieldTouched('chasis_no')
                                                    setFieldValue('chasis_no', e.target.value)                       
                                                }} 
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
                                {defaultSliderValue ? 

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
                                : null}
                            </Row>

                                                            

                            {/* <Row>
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
                                                {errors.cng_kit && touched.cng_kit ? (
                                                <span className="errorMsg">{errors.cng_kit}</span>
                                                ) : null}
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
                                            onChange={e => {
                                                setFieldTouched('cngKit_Cost');
                                                setFieldValue('cngKit_Cost', e.target.value);
                                                this.handleChange()

                                            }}
                                        />
                                        {errors.cngKit_Cost && touched.cngKit_Cost ? (
                                        <span className="errorMsg">{errors.cngKit_Cost}</span>
                                        ) : null}                                             
                                        </div>
                                    </FormGroup>
                                </Col> : ''}
                            </Row>
                                */}

                            <Row>
                                <Col sm={12} md={12} lg={12}>
                                    <FormGroup>
                                        <span className="fs-18"> Add  more coverage to your plan.</span>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row className="m-b-40">
                            {moreCoverage && moreCoverage.length > 0 ? moreCoverage.map((coverage, qIndex) => ( 
                            
                                <Col sm={12} md={6} lg={6}  key= {qIndex} > 
                                    <label className="customCheckBox formGrp formGrp">{coverage.name}
                                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{coverage.description}</Tooltip>}>
                                        <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool"/></a>
                                        </OverlayTrigger>
                                        <Field
                                            type="checkbox"
                                            name={`moreCov_${coverage.id}`}                                 
                                            value={coverage.code}
                                            className="user-self"
                                            // checked={values.roadsideAssistance ? true : false}
                                            onClick={(e) =>{
                                                this.onRowSelect(e.target.value, e.target.checked )
                                            }}
                                        />
                                        <span className="checkmark mL-0"></span>
                                        <span className="error-message"></span>
                                    </label>
                                </Col>
                            )) : null}
                                </Row>    
                                
                                <Row>
                                    <Col sm={12}>
                                        <FormGroup>
                                            <div className="carloan">
                                                <h4> </h4>
                                            </div>
                                            <div className="col-md-15">
                                                <div className="brandhead"> 
                                                    I/we hold a valid and effective PUC and/or fitness certificate, as applicable, for the vehicle mentioned herein and undertake to renew the same during the policy period
                                                    <div className="carloan">
                                                        <h4> </h4>
                                                    </div>
                                                        <div className="d-inline-flex m-b-15">
                                                            <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='puc'
                                                                        value='1'
                                                                        key='1'
                                                                        checked = {values.puc == '1' ? true : false}
                                                                        onChange = {() =>{
                                                                            setFieldTouched('puc')
                                                                            setFieldValue('puc', '1');
                                                                        }  
                                                                        }
                                                                    />
                                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                                </label>
                                                            </div>
                                                            <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='puc'
                                                                        value='2'
                                                                        key='1'
                                                                        checked = {values.puc == '2' ? true : false}
                                                                        onChange = {() =>{
                                                                            setFieldTouched('puc')
                                                                            setFieldValue('puc', '2');
                                                                        }  
                                                                        }
                                                                    />
                                                                    <span className="checkmark " /><span className="fs-14"> No</span>
                                                                </label>
                                                                {errors.puc && touched.puc ? (
                                                                    <span className="errorMsg">{errors.puc}</span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                </div>
                                            </div> 
                                            
                                        </FormGroup>
                                    </Col>
                                </Row>
                                
                                <div className="d-flex justify-content-left resmb">
                                    <Button className={`backBtn`} type="button"  onClick= {this.vehicleDetails.bind(this,productId)}>
                                        Back
                                    </Button> 

                                        { serverResponse && serverResponse != "" ? (serverResponse.message ? 
                                        <Button className={`proceedBtn`} type="submit"  >
                                            Recalculate
                                        </Button> : (values.puc == '1' ?  <Button className={`proceedBtn`} type="submit"  >
                                            Continue
                                        </Button>  : null)) : <Button className={`proceedBtn`} type="submit"  >
                                            Recalculate
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
                    <Modal.Header closeButton className="custmModlHead modalhd">
                        <div className="cntrbody">
                            <h3>Premium breakup </h3>                           
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                    <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Premium:</th>
                                    <th>₹ {fulQuoteResp.DuePremium}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {premiumBreakup}
                                <tr>
                                    <td>Gross Premium:</td>
                                    <td>₹ {Math.round(fulQuoteResp.BeforeVatPremium)}</td>
                                </tr>
                                <tr>
                                    <td>GST:</td>
                                    <td>₹ {Math.round(fulQuoteResp.TGST)}</td>
                                </tr>
                            </tbody>
                        </table>
                    
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