import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import BackContinueButton from '../common/button/BackContinueButton';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import { Formik, Field, Form, FieldArray } from "formik";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios"
import Encryption from '../../shared/payload-encryption';
import * as Yup from "yup";
import swal from 'sweetalert';
import {  userTypes } from "../../shared/staticValues";

let encryption = new Encryption()
let translation = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null

let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
if (user_data.user) {
    user_data = JSON.parse(encryption.decrypt(user_data.user));
}

const insert = (arr, index, newItem) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted item
    newItem,
    // part of the array after the specified index
    ...arr.slice(index)
  ]


 let initialValue = {
    // add_more_coverage: "",
    // cng_kit: '0',
    // B00015: "B00015",
    // PA_flag: '0',
    // PA_Cover: ""

}
const ComprehensiveValidation = Yup.object().shape({
    // is_carloan: Yup.number().required('Please select one option')

    PA_Cover: Yup.string().when(['PA_flag'], {
        is: PA_flag => PA_flag == '1',
        then: Yup.string().required('PleasePACover'),
        otherwise: Yup.string()
    }),
    geographical_extension_length: Yup.string().when(['Geographical_flag'], {
        is: Geographical_flag => Geographical_flag == '1',
        then: Yup.string().test(
            "geoExtention",
            function() {
                return "Select any one country"
            },
            function (value) {
                if (value < 1 ) {   
                    return false;    
                }
                return true;
            }) ,
        otherwise: Yup.string()
    }),

});


const Coverage = {
    "C101064":translation["C101064"],
    "C101065":translation["C101065"],
    "C101066":translation["C101066"],
    "C101069":translation["C101069"],
    "C101072":translation["C101072"],
    "C101067":translation["C101067"],
    "C101108":translation["C101108"],
    "C101111":translation["C101111"],
    "B00002": translation["B00002"],
    "B00008": translation["B00008"],
    "B00013": translation["B00013"],
    "B00015": translation["B00015"],
    "B00016": translation["B00016"],
    "B00009": translation["B00009"],
    "B00010": translation["B00010"],   
    "NCB": translation["NCB"],
    "TOTALOD": translation["TOTALOD"],
    "GEOGRAPHYOD":translation["GEOGRAPHYOD"],
    "GEOGRAPHYTP":translation["GEOGRAPHYTP"],
}
class TwoWheelerOtherComprehensive extends Component {

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
            add_more_coverage: ['B00015'],
            vahanDetails: [],
            vahanVerify: false,
            policyCoverage: [],
            step_completed: "0",
            vehicleDetails: [],
            selectFlag: '',
            moreCoverage: [],
            request_data: [],
            geographical_extension: []
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
        this.setState({ serverResponse: [], error: [] });
    }

    sliderValue = (value) => {
        this.setState({
            sliderVal: value,
            serverResponse: [],
            error: []
        })
    }

    vehicleDetails = (productId) => {
        this.props.history.push(`/four_wheeler_Vehicle_detailsTP/${productId}`);
    }


    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        this.props.loadingStart();
        axios.get(`four-wh-tp/details/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log("decryptResp----1", decryptResp)
                let values = []
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {};

                let add_more_coverage = motorInsurance && motorInsurance.policy_for == '2' ? (motorInsurance.add_more_coverage != null ? motorInsurance.add_more_coverage.split(",") : []) : (motorInsurance.add_more_coverage != null ? motorInsurance.add_more_coverage.split(",") : ['B00015']) 
                add_more_coverage = add_more_coverage.flat()

                let add_more_coverage_request_json = motorInsurance && motorInsurance.add_more_coverage_request_json != null ? motorInsurance.add_more_coverage_request_json : ""
                let add_more_coverage_request_array = add_more_coverage_request_json != "" ? JSON.parse(add_more_coverage_request_json) : []
                var geographical_extension = add_more_coverage_request_array && add_more_coverage_request_array.geographical_extension ? add_more_coverage_request_array.geographical_extension : []

                values.PA_flag = motorInsurance && motorInsurance.pa_cover != "" ? '1' : '0'
                values.PA_Cover = motorInsurance && motorInsurance.pa_cover != "" ? motorInsurance.pa_cover : '0'
                
                this.setState({
                    motorInsurance,vehicleDetails,step_completed,request_data,geographical_extension,
                    add_more_coverage: add_more_coverage, 
                    selectFlag: motorInsurance && motorInsurance.policy_for == '2' ? [] : (motorInsurance.add_more_coverage != null ? '0' : '1') 
                    
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


    fullQuote = (access_token, values) => {
        const { PolicyArray, sliderVal, add_more_coverage, motorInsurance, geographical_extension } = this.state
        const formData = new FormData();
        let coverage_data = {}

        if(add_more_coverage) {
            coverage_data = {
                'B00004' : {'value': values.B00004_value, 'description': values.B00004_description},
                'B00003' : {'value': values.B00003_value, 'description': values.B00003_description},
                geographical_extension
            }           
        }

        const post_data = {
            'ref_no':localStorage.getItem('policyHolder_refNo'),
            'access_token':access_token,
            'idv_value': "0",
            'add_more_coverage': add_more_coverage.toString(),
            'coverage_data': JSON.stringify(coverage_data),
            'policy_type': motorInsurance ? motorInsurance.policy_type : "",
            'policytype_id': motorInsurance ? motorInsurance.policytype_id : "",
            'PA_Cover': values.PA_flag ? values.PA_Cover : "0",
            'policy_for': motorInsurance ? motorInsurance.policy_for : ""
        }

        let encryption = new Encryption();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        console.log("fullquote-postdata--- ", post_data)

        axios.post('fullQuotePMCARTP', formData)
            .then(res => {
                if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
                    let policyCoverage= res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : []
                    let IsGeographicalExtension= res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].IsGeographicalExtension : 0
                    if(IsGeographicalExtension == '1') {
                        let geoArrTP = {}

                        geoArrTP.PolicyBenefitList = [{
                            BeforeVatPremium : res.data.PolicyObject.PolicyLobList && res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList ? Math.round(res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList[0].LoadingAmount) : 0,
                            ProductElementCode : 'GEOGRAPHYTP'
                        }]   
                        policyCoverage = IsGeographicalExtension == '1' ?  insert(policyCoverage, 1, geoArrTP) : ""
                    }

                    this.setState({
                        fulQuoteResp: res.data.PolicyObject,
                        PolicyArray: res.data.PolicyObject.PolicyLobList,
                        error: [],
                        serverResponse: res.data.PolicyObject,policyCoverage,
                        // policyCoverage: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : [],
                    });
                }
                else if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Fail") {
                    this.setState({
                        fulQuoteResp: res.data.PolicyObject,
                        error: {"message": 1},
                        serverResponse: [],
                        policyCoverage: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : [],
                    });
                }
                else {
                    this.setState({
                        fulQuoteResp: [], add_more_coverage,
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
        const { motorInsurance, PolicyArray, sliderVal, add_more_coverage, request_data, geographical_extension } = this.state
        let defaultSliderValue = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0

        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        let coverage_data = {}
        if(add_more_coverage) {
            coverage_data = {
                'B00004' : {'value': values.B00004_value, 'description': values.B00004_description},
                'B00003' : {'value': values.B00003_value, 'description': values.B00003_description},
                geographical_extension
            }           
        }

        if (add_more_coverage.length > 0) {
            post_data = {
                'policy_holder_id': request_data.policyholder_id,
                'menumaster_id': 1,
                'cng_kit': values.cng_kit,
                'registration_no': motorInsurance.registration_no,
                'idv_value': "0",
                'add_more_coverage': add_more_coverage,
                'coverage_data': JSON.stringify(coverage_data),
                'pa_cover': values.PA_flag ? values.PA_Cover : "0",
                'pa_flag' : values.PA_cover_flag,
                'page_name': `four_wheeler_OtherComprehensiveTP/${productId}`,
            }
        }
        else {
            post_data = {
                'policy_holder_id': request_data.policyholder_id,
                'menumaster_id': 1,
                'cng_kit': values.cng_kit,
                'registration_no': motorInsurance.registration_no,
                'idv_value': "0",
                'pa_flag' : values.PA_cover_flag,
                'page_name': `four_wheeler_OtherComprehensiveTP/${productId}`,
            }
        }
        console.log('post_data', post_data)
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        if(userTypes.includes(user_data.login_type) && add_more_coverage.indexOf('B00015') < 0){
            swal("This cover is mandated by IRDAI, it is compulsory for Owner-Driver to possess a PA cover of minimum Rs 15 Lacs, except in certain conditions. By not choosing this cover, you confirm that you hold an existing PA cover or you do not possess a valid driving license.")
            return false
        }
        else {
            this.props.loadingStart();
            axios.post('four-wh-tp/insured-value', formData).then(res => {
                this.props.loadingStop();
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log('decryptResp---', decryptResp)
                if (decryptResp.error == false) {
                    this.props.history.push(`/four_wheeler_verifyTP/${productId}`);
                }
    
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
                let decryptResp = JSON.parse(encryption.decrypt(err.data));
                console.log('decrypterr---', decryptResp)
            })
        }
    }

    onRowSelect = (values, isSelect, setFieldTouched, setFieldValue) => {

        const { add_more_coverage } = this.state;
        var drv = [];


        if (isSelect) {
            add_more_coverage.push(values);
            this.setState({
                add_more_coverage: add_more_coverage,
                serverResponse: [],
                error: []
            });
            if(values == "B00016") {
                setFieldTouched("PA_flag");
                setFieldValue("PA_flag", '1');
            }   
            if(values == "B00015") {
                setFieldTouched("PA_cover_flag");
                setFieldValue("PA_cover_flag", '1');
            }        
            if(values == "geographical_extension") {
                setFieldTouched("Geographical_flag");
                setFieldValue("Geographical_flag", '1');
            }     
        }
        else {
            const index = add_more_coverage.indexOf(values);
            if (index !== -1) {
                add_more_coverage.splice(index, 1);
                this.setState({
                    serverResponse: [],
                    error: []
                });
            }

            if(values == "B00016") {
                setFieldTouched("PA_flag");
                setFieldValue("PA_flag", '0');
                setFieldTouched("PA_Cover");
                setFieldValue("PA_Cover", '');
            }   
            if(values == "B00015") {
                setFieldTouched("PA_cover_flag");
                setFieldValue("PA_cover_flag", '0');
            }   
            if(values == "geographical_extension") {
                setFieldTouched("Geographical_flag");
                setFieldValue("Geographical_flag", '0');

                setFieldValue("GeoExtnBhutan", '');
                setFieldValue("GeoExtnNepal", '');
                setFieldValue("GeoExtnMaldives", '');
                setFieldValue("GeoExtnPakistan", '');
                setFieldValue("GeoExtnSriLanka", '');
                setFieldValue("GeoExtnBangladesh", '');
                this.setState({
                    geographical_extension: []
                })
            }
        }
        
    }

    onGeoAreaSelect = (value, values, isSelect, setFieldTouched, setFieldValue) => {

        const { add_more_coverage, geographical_extension } = this.state;
        let drv = []
        
        if (isSelect) {
            geographical_extension.push(value);
            this.setState({
                geographical_extension,
                serverResponse: [],
                error: []
            });
            setFieldTouched(value);
            setFieldValue(value, '1');
            setFieldTouched("geographical_extension_length");
            setFieldValue("geographical_extension_length", geographical_extension.length);
        }
        else {
            const index = geographical_extension.indexOf(value);
            if (index !== -1) {
                geographical_extension.splice(index, 1);
                this.setState({
                    serverResponse: [],
                    error: []
                });
            }
            setFieldTouched(value);
            setFieldValue(value, '');
            setFieldTouched("geographical_extension_length");
            setFieldValue("geographical_extension_length", geographical_extension.length);
            }        
    }


    getCoverage = () => {
        this.props.loadingStart();
        axios
            .get(`/coverage-list/${localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0}`)
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


    componentDidMount() {
        this.getCoverage()
    }


    render() {
        const { vahanDetails, error, policyCoverage, vahanVerify, fulQuoteResp, PolicyArray, motorInsurance, serverResponse, add_more_coverage,
            step_completed, vehicleDetails, selectFlag, moreCoverage, geographical_extension} = this.state
        const { productId } = this.props.match.params
        let covList = motorInsurance && motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage.split(",") : ""
        let newInnitialArray = {}
        let PA_flag = motorInsurance && (motorInsurance.pa_cover == null || motorInsurance.pa_cover == "") ? '0' : '1'
        let PA_Cover = motorInsurance &&  motorInsurance.pa_cover != null ? motorInsurance.pa_cover : '0'
        let Geographical_flag = add_more_coverage && add_more_coverage[add_more_coverage.indexOf("geographical_extension")] ? '1' : '0'
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null

        if(selectFlag == '1') {
            initialValue = {
                add_more_coverage: "",
                cng_kit: '0',
                B00015: "B00015",
                PA_flag: '0',
                PA_Cover: "",
                PA_cover_flag: "1",
                Geographical_flag: "0",
                geographical_extension_length: geographical_extension && geographical_extension.length
            
            }
           
        }else {
            initialValue = {
                add_more_coverage: "",
                cng_kit: '0',
                // B00015: "B00015",
                PA_flag: '0',
                PA_Cover: "",
                PA_cover_flag: motorInsurance && motorInsurance.pa_flag ? motorInsurance.pa_flag : '0',
                Geographical_flag: "0",
                geographical_extension_length: geographical_extension && geographical_extension.length
            
            }
        }
            
        for (var i = 0 ; i < covList.length; i++) {
            newInnitialArray[covList[i]] = covList[i];
        }    

        newInnitialArray.PA_flag = PA_flag   
        newInnitialArray.PA_Cover = PA_Cover
        newInnitialArray.Geographical_flag = Geographical_flag

        newInnitialArray.GeoExtnBangladesh = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnBangladesh")] : ""
        newInnitialArray.GeoExtnBhutan = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnBhutan")] : ""
        newInnitialArray.GeoExtnNepal = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnNepal")] : ""
        newInnitialArray.GeoExtnMaldives = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnMaldives")] : ""
        newInnitialArray.GeoExtnPakistan = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnPakistan")] : ""
        newInnitialArray.GeoExtnSriLanka = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnSriLanka")] : ""

        let newInitialValues = Object.assign(initialValue, newInnitialArray );

        // console.log("policyCoverage--------------- ", policyCoverage)

        const policyCoverageList =  policyCoverage && policyCoverage.length > 0 ?
            policyCoverage.map((coverage, qIndex) => (
                coverage.PolicyBenefitList ? coverage.PolicyBenefitList.map((benefit, bIndex) => (
                    <div>
                        <Row>
                            <Col sm={12} md={6}>
                                <FormGroup>{Coverage[benefit.ProductElementCode]}</FormGroup>
                            </Col>
                            <Col sm={12} md={6}>
                                <FormGroup>₹ {Math.round(benefit.BeforeVatPremium)}</FormGroup>
                            </Col>
                        </Row>
                    </div>     
            )) :
            <div>
                <Row>
                    <Col sm={12} md={6}>
                    <FormGroup>{Coverage[coverage.ProductElementCode]}</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                    <FormGroup>₹ {Math.round(coverage.AnnualPremium)}  </FormGroup>                      
                    </Col>
                </Row> 
            </div>
        )) : null 

        const premiumBreakup = policyCoverage && policyCoverage.length > 0 ?
            policyCoverage.map((coverage, qIndex) => (
                coverage.PolicyBenefitList && coverage.PolicyBenefitList.map((benefit, bIndex) => (
                        <tr>
                            <td>{Coverage[benefit.ProductElementCode]}:</td>
                            <td>₹ {Math.round(benefit.BeforeVatPremium)}</td>
                        </tr>  
                ))
            )) : null

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
				
				<div className="page-wrapper">
				
                    <div className="container-fluid">
                        <div className="row">
						
						<aside className="left-sidebar">
		 				 <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
						 <SideNav />
						</div>
						</aside>
								
								 {/*<div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">               
									<SideNav />
             					 </div>*/}
                           							
							
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox fwhTp">
                                <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                                { step_completed >= '2' && vehicleDetails.vehicletype_id == '6' ?
                                <section className="brand colpd m-b-25">
                                    <div className="d-flex justify-content-left">
                                        <div className="brandhead m-b-10">
                                            <h4 className="m-b-30">{phrases['ThirdPartyLiability']}</h4>
                                            <h5>{errMsg}</h5>
                                        </div>
                                    </div>
                                    <Formik initialValues={newInitialValues}
                                        onSubmit={serverResponse && serverResponse != "" ? (serverResponse.message ? this.getAccessToken : this.handleSubmit) : this.getAccessToken}
                                        validationSchema={ComprehensiveValidation}
                                        >
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                            return (
                                                <Form>
                                                    <Row>
                                                        <Col sm={12} md={9} lg={9}>
                                                            <div className="rghtsideTrigr W-90 m-b-30">
                                                                <Collapsible trigger={phrases['DefaultCovered']}  open= {true}>
                                                                    <div className="listrghtsideTrigr">
                                                                    {policyCoverageList}
                                                                    </div>
                                                                </Collapsible>
                                                            </div>
                                                            {motorInsurance && motorInsurance.policy_for == '1' ?
                                                            <Row>
                                                                <Col sm={12} md={12} lg={12}>
                                                                    <FormGroup>
                                                                        <span className="fs-18"> {phrases['AddCoveragePlan']}.</span>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row> : null }

                                                            {motorInsurance && motorInsurance.policy_for == '1' && moreCoverage.map((coverage, qIndex) => (
                                                            <Row key={qIndex}>   
                                                                <Col sm={12} md={11} lg={6} key={qIndex+"a"} >
                                                                    <label className="customCheckBox formGrp formGrp">{coverage.name}
                                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{coverage.description}</Tooltip>}>
                                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                                        </OverlayTrigger>
                                                                        <Field
                                                                            type="checkbox"
                                                                            // name={`moreCov_${qIndex}`}
                                                                            name={coverage.code}
                                                                            value={coverage.code}
                                                                            className="user-self"
                                                                            disabled={(userTypes.includes(user_data.login_type) && values[coverage.code] == 'B00015') ? true : false}
                                                                            onClick={(e) =>{
                                                                                if( e.target.checked == false && values[coverage.code] == 'B00015') {
                                                                                    swal(phrases.SwalIRDAI,
                                                                                        {button: phrases.OK})
                                                                                }
                                                                                this.onRowSelect(e.target.value, e.target.checked, setFieldTouched, setFieldValue)         
                                                                            }
                                                                            }
                                                                            checked = {values[coverage.code] == coverage.code ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </Col>
                                                                {values.PA_flag == '1' && values[coverage.code] == 'B00016' ?
                                                                    <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                                <Field
                                                                                    name='PA_Cover'
                                                                                    component="select"
                                                                                    autoComplete="off"
                                                                                    className="formGrp inputfs12"
                                                                                    value = {values.PA_Cover}
                                                                                    onChange={(e) => {
                                                                                        setFieldTouched('PA_Cover')
                                                                                        setFieldValue('PA_Cover', e.target.value);
                                                                                        this.handleChange()
                                                                                    }}
                                                                                >
                                                                                    <option value="">{phrases['SSI']}</option>
                                                                                    <option value="50000">50000</option>
                                                                                    <option value="100000">100000</option>  
                                                                        
                                                                                </Field>
                                                                                {errors.PA_Cover ? (
                                                                                    <span className="errorMsg">{phrases[errors.PA_Cover]}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col> : null
                                                                }
                                                                {values.Geographical_flag == '1' && values[coverage.code] == 'geographical_extension' ?
                                                                    <Fragment>
                                                                    <Col sm={12} md={11} lg={3} key={qIndex+"c"}>
                                                                    {coverage.covarage_value != null && JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                                        insurer.status == '1' ?
                                                                        <label className="customCheckBox formGrp formGrp">{insurer.name}                                         
                                                                            <Field
                                                                                type="checkbox"
                                                                                // name={`moreCov_${qIndex}`}
                                                                                name={insurer.id}
                                                                                value={insurer.id}
                                                                                className="user-self"
                                                                                checked = {values[insurer.id] == insurer.id ? true : false}
                                                                                onClick={(e) =>{
                                                                                    this.onGeoAreaSelect(e.target.value, values, e.target.checked, setFieldTouched, setFieldValue)         
                                                                                }}
                                                                            />
                                                                            <span className="checkmark mL-0"></span>
                                                                            <span className="error-message"></span>
                                                                        </label> : null))}
                                                                        {errors.geographical_extension_length ? (
                                                                                <span className="errorMsg">{errors.geographical_extension_length}</span>
                                                                        ) : null} 
                                                                    </Col>
                                                                    </Fragment> : null
                                                                }
                                                            </Row>
                                                            ))}

                                                            {motorInsurance && motorInsurance.policy_for == '2' && moreCoverage.map((coverage, qIndex) => (
                                                            <Row key={qIndex}>   
                                                            {/* {console.log("coverage.name-------> ", coverage)} */}
                                                            {coverage.code == "geographical_extension" || coverage.code == "B00010" || coverage.code == "B00013" ? 
                                                                <Col sm={12} md={11} lg={6} key={qIndex+"a"} >
                                                                    <label className="customCheckBox formGrp formGrp">{coverage.name}
                                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{coverage.description}</Tooltip>}>
                                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                                        </OverlayTrigger>
                                                                        <Field
                                                                            type="checkbox"
                                                                            // name={`moreCov_${qIndex}`}
                                                                            name={coverage.code}
                                                                            value={coverage.code}
                                                                            className="user-self"
                                                                            // checked={values.roadsideAssistance ? true : false}
                                                                            onClick={(e) =>{
                                                                                if( e.target.checked == false && values[coverage.code] == 'B00015') {
                                                                                    swal(phrases.SwalIRDAI)
                                                                                }
                                                                                this.onRowSelect(e.target.value, e.target.checked, setFieldTouched, setFieldValue)         
                                                                            }
                                                                            }
                                                                            checked = {values[coverage.code] == coverage.code ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </Col> : null}
                                                                
                                                                {values.Geographical_flag == '1' && values[coverage.code] == 'geographical_extension' ?
                                                                    <Fragment>
                                                                    <Col sm={12} md={11} lg={3} key={qIndex+"c"}>
                                                                    {coverage.covarage_value != null && JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                                        insurer.status == '1' ?
                                                                        <label className="customCheckBox formGrp formGrp">{insurer.name}                                         
                                                                            <Field
                                                                                type="checkbox"
                                                                                // name={`moreCov_${qIndex}`}
                                                                                name={insurer.id}
                                                                                value={insurer.id}
                                                                                className="user-self"
                                                                                checked = {values[insurer.id] == insurer.id ? true : false}
                                                                                onClick={(e) =>{
                                                                                    this.onGeoAreaSelect(e.target.value, values, e.target.checked, setFieldTouched, setFieldValue)         
                                                                                }}
                                                                            />
                                                                            <span className="checkmark mL-0"></span>
                                                                            <span className="error-message"></span>
                                                                        </label> : null))}
                                                                        {errors.geographical_extension_length ? (
                                                                                <span className="errorMsg">{errors.geographical_extension_length}</span>
                                                                        ) : null} 
                                                                    </Col>
                                                                    </Fragment> : null
                                                                }
                                                            </Row>
                                                            ))}
                                                            <Row>&nbsp;</Row>
                                                            
                                                            <div className="d-flex justify-content-left resmb">
                                                                <Button className={`backBtn`} type="button" onClick={this.vehicleDetails.bind(this, productId)}>
                                                                {phrases['Back']}
                                                                </Button>
                                                                {serverResponse && serverResponse != "" ? (serverResponse.message ?
                                                                    <Button className={`proceedBtn`} type="submit"  >
                                                                        {phrases['Recalculate']}
                                                                    </Button> : <Button className={`proceedBtn`} type="submit"  >
                                                                    {phrases['Continue']}
                                                                    </Button>) : <Button className={`proceedBtn`} type="submit"  >
                                                                    {phrases['Recalculate']}
                                                                    </Button>}
                                                            </div>
                                                        </Col>

                                                        <Col sm={12} md={3}>
                                                            <div className="justify-content-left regisBox">
                                                                <h3 className="premamnt"> {phrases['TPAmount']}</h3>
                                                                <div className="rupee"> ₹ {fulQuoteResp.DuePremium ? fulQuoteResp.DuePremium : 0}</div>
                                                                <div className="text-center">
                                                                    <Button className={`brkbtn`} type="button" onClick={this.handleShow}>
                                                                    {phrases['Breakup']}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Form>
                                            );
                                        }}
                                    </Formik>
                                </section> : step_completed == "" ? "Forbidden" : null }

                                <Footer />
                            </div>
                        </div>
                    </div>
					  </div>
                </BaseComponent>
        
                <Modal className="customModal" bsSize="md"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <Modal.Header closeButton className="custmModlHead modalhd">
                        <h3>{phrases['PremiumBreakup']}</h3>
                    </Modal.Header>
                    <Modal.Body>

                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>{phrases['Premium']}:</th>
                                    <th>₹ {fulQuoteResp.DuePremium}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {premiumBreakup}
                                <tr>
                                    <td>{phrases['GrossPremium']}:</td>
                                    <td>₹ {Math.round(fulQuoteResp.BeforeVatPremium)}</td>
                                </tr>
                                <tr>
                                    <td>{phrases['GST']}:</td>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TwoWheelerOtherComprehensive));