import React, { Component } from 'react';
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
import {
    compareStartEndYear
  } from "../../shared/validationFunctions";

let encryption = new Encryption()

 let initialValue = {
    // add_more_coverage: "",
    // cng_kit: '0',
    // B00015: "B00015",
    // PA_flag: '0',
    // PA_Cover: ""

}

const insert = (arr, index, newItem) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted item
    newItem,
    // part of the array after the specified index
    ...arr.slice(index)
  ]

const ComprehensiveValidation = Yup.object().shape({
    // is_carloan: Yup.number().required('Please select one option')

    PA_Cover: Yup.string().when(['PA_flag'], {
        is: PA_flag => PA_flag == '1',
        then: Yup.string().required('PleasePACover'),
        otherwise: Yup.string()
    }),

    tyre_rim_array: Yup.array().of(
        Yup.object().shape({
            tyreMfgYr : Yup.string().when(['policy_for'], {
                is: policy_for => [policy_for == '1', policy_for == '2'],
                then: Yup.string().required('MFG year required')
                    .test(
                        "checkGreaterTimes",
                        "Mfg date must be greater than registration date",
                        function (value) {
                            if (value) { 
                                return compareStartEndYear(new Date(this.parent.vehicleRegDate), value);
                            }
                            return true;
                        }
                    )
                    .test(
                        "checkGreaterTimes",
                        "Mfg date must be less than today",
                        function (value) {
                            if (value) {
                                return compareStartEndYear(value, new Date());
                            }
                            return true;
                        }
                    ),
                otherwise: Yup.string()
            }),

            tyreSerialNo : Yup.string().when(['policy_for'], {
                is: policy_for => [policy_for == '1', policy_for == '2'],
                then: Yup.string().required('Serial No Required')
                    .matches(/^[a-zA-Z0-9]*$/, function() {
                        return "Invalid Serial No"
                    }),
                otherwise: Yup.string()
            })
           
        }),
    )
})


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
            ncbDiscount: 0,
            tyre_rim_array: [],
            no_of_claim : 2
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
        this.props.history.push(`/two_wheeler_Vehicle_details/${productId}`);
    }


    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        this.props.loadingStart();
        axios.get(`two-wh/details/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log("decryptResp----", decryptResp)
                let values = []
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";
                let vehicleRegDate = motorInsurance &&  motorInsurance.registration_date != null ? motorInsurance.registration_date : ''
                let policy_for = motorInsurance && motorInsurance.policy_for 
                let tyre_rim_array = motorInsurance.tyre_rim_array && motorInsurance.tyre_rim_array!=null ? motorInsurance.tyre_rim_array : null
                tyre_rim_array = tyre_rim_array!=null ? JSON.parse(tyre_rim_array) : []

                // let add_more_coverage = motorInsurance && motorInsurance.policy_for == '2' ? [] : (motorInsurance.add_more_coverage != null ? motorInsurance.add_more_coverage.split(",") : ['B00015']) 
                let add_more_coverage = motorInsurance && motorInsurance.policy_for == '2' ? (motorInsurance.add_more_coverage != null ? motorInsurance.add_more_coverage.split(",") : [])
                    : (motorInsurance.add_more_coverage != null ? motorInsurance.add_more_coverage.split(",") : ['B00015']) 
                add_more_coverage = add_more_coverage.flat()

                 values.PA_flag = motorInsurance && motorInsurance.pa_cover != "" ? '1' : '0'
                 values.PA_Cover = motorInsurance && motorInsurance.pa_cover != "" ? motorInsurance.pa_cover : '0'
                 values.tyre_rim_array = tyre_rim_array
                
                this.setState({
                    motorInsurance,vehicleDetails,step_completed,tyre_rim_array,vehicleRegDate,policy_for,
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

    getCoverage = () => {
        this.props.loadingStart();
        axios
            .get(`/coverage-list/${localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0}`)
            .then((res) => {
                this.setState({
                    moreCoverage: res.data.data,
                });
            })
            .catch((err) => {
                this.setState({
                    moreCoverage: [],
                });
                this.props.loadingStop();
            });
    };

    getVahanDetails = (chasiNo, regnNo, setFieldTouched, setFieldValue) => {

        const formData = new FormData();
        formData.append("chasiNo", chasiNo);
        formData.append("regnNo", regnNo);

        this.props.loadingStart();
        axios
            .post(`/getVahanDetails`, formData)
            .then((res) => {
                this.setState({
                    vahanDetails: res.data,
                    vahanVerify: res.data.length > 0 ? true : false
                });

                setFieldTouched('vahanVerify')
                res.data.length > 0 ?
                    setFieldValue('vahanVerify', true)
                    : setFieldValue('vahanVerify', false)

                this.props.loadingStop();
            })
            .catch((err) => {
                this.setState({
                    vahanDetails: [],
                });
                this.props.loadingStop();
            });
    };

    fullQuote = (access_token, values) => {
        const { PolicyArray, sliderVal, add_more_coverage, motorInsurance } = this.state
        let cng_kit_flag = 0;
        let cngKit_Cost = 0;
        if (values.toString()) {
            cng_kit_flag = values.cng_kit
            cngKit_Cost = values.cngKit_Cost
        }
        let defaultSliderValue = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        const formData = new FormData();
        let encryption = new Encryption()

        const post_data = {
            'id':localStorage.getItem('policyHolder_refNo'),
            'access_token':access_token,
            'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
            'add_more_coverage': add_more_coverage.toString(),
            'policy_type': motorInsurance ? motorInsurance.policy_type : "",
            'policytype_id': motorInsurance ? motorInsurance.policytype_id : "",
            'PA_Cover': values.PA_flag ? values.PA_Cover : "0",
            'policy_for': motorInsurance ? motorInsurance.policy_for : "",
            'tyre_rim_array' : values.tyre_rim_array,
        }
        console.log('fullQuote_post_data', post_data)

        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));

            if((post_data.idv_value> 500000) && user_data.user_type == "POSP"  ) {
                swal("Quote cannot proceed with IDV greater than 500000")
                this.props.loadingStop();
                return false
            }
        }

        // formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        formData.append('id',localStorage.getItem('policyHolder_refNo'))
        formData.append('access_token',access_token)
        formData.append('idv_value',sliderVal ? sliderVal : defaultSliderValue.toString())
        formData.append('policy_type',motorInsurance ? motorInsurance.policy_type : "")
        formData.append('add_more_coverage',JSON.stringify(add_more_coverage))
        formData.append('policytype_id',motorInsurance ? motorInsurance.policytype_id : "")
        formData.append('PA_Cover',values.PA_flag ? values.PA_Cover : "0")
        formData.append('policy_for',motorInsurance ? motorInsurance.policy_for : "")
        formData.append('tyre_rim_array',values.tyre_rim_array ? JSON.stringify(values.tyre_rim_array) : "")

        axios.post('fullQuotePM2W', formData)
            .then(res => {
                if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
                    let policyCoverage= res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : []
                    let ncbDiscount= res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].NCBDiscountAmt : 0
                    if(ncbDiscount != '0') {
                        let ncbArr = {}
                        ncbArr.PolicyBenefitList = [{
                            BeforeVatPremium : 0 - Math.round(ncbDiscount),
                            ProductElementCode : 'NCB'
                        }]
    
                        let totOD = {}
                        totOD.PolicyBenefitList = [{
                            BeforeVatPremium : Math.round(policyCoverage[0]['PolicyBenefitList'][0]['BeforeVatPremium']) - Math.round(ncbDiscount),
                            ProductElementCode : 'TOTALOD'
                        }]
    
                        policyCoverage = ncbDiscount != '0' ?  insert(policyCoverage, 1, ncbArr) : ""
                        policyCoverage = ncbDiscount != '0' ?  insert(policyCoverage, 2, totOD) : ""
                    }
                    

                    this.setState({
                        fulQuoteResp: res.data.PolicyObject,
                        PolicyArray: res.data.PolicyObject.PolicyLobList,
                        error: [],
                        serverResponse: res.data.PolicyObject,
                        policyCoverage
                        // policyCoverage: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : [],
                        // ncbDiscount: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].NCBDiscountAmt : 0,
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
        const { motorInsurance, PolicyArray, sliderVal, add_more_coverage } = this.state
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0

        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : []

        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        if (add_more_coverage.length > 0) {
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 3,
                'cng_kit': values.cng_kit,
                'registration_no': motorInsurance.registration_no,
                'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
                'add_more_coverage': add_more_coverage,
                'pa_cover': values.PA_flag ? values.PA_Cover : "0",
                'pa_flag' : values.PA_cover_flag,
                'page_name': `two_wheeler_OtherComprehensive/${productId}`,
                'tyre_rim_array' : values.tyre_rim_array && values.tyre_rim_array.length > 0 ? values.tyre_rim_array : null ,
            }
        }
        else {
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 3,
                'cng_kit': values.cng_kit,
                'registration_no': motorInsurance.registration_no,
                'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
                'pa_flag' : values.PA_cover_flag,
                'page_name': `two_wheeler_OtherComprehensive/${productId}`,
            }
        }
        console.log('post_data', post_data)
        
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));

            if((post_data.idv_value> 500000) && user_data.user_type == "POSP"  ) {
                swal("Quote cannot proceed with IDV greater than 500000")
                this.props.loadingStop();
                return false
            }
        }

        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('two-wh/insured-value', formData).then(res => {
            this.props.loadingStop();
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp---', decryptResp)
            if (decryptResp.error == false) {
                this.props.history.push(`/two_wheeler_verify/${productId}`);
            }

        })
            .catch(err => {
                // handle error
                this.props.loadingStop();
                let decryptResp = JSON.parse(encryption.decrypt(err.data));
            console.log('decrypterr---', decryptResp)
            })
    }

    onRowSelect = (value, isSelect, setFieldTouched, setFieldValue,values) => {

        const { add_more_coverage } = this.state;
        var drv = [];


        if (isSelect) {
            add_more_coverage.push(value);
            if(value == 'C101110') {
                var array_length = 2
                var newTyreMfgYr = new Date(this.state.vehicleRegDate)
                 if(values.tyre_rim_array && values.tyre_rim_array.length < array_length) {
                    for(var i = values.tyre_rim_array.length ; i < array_length ; i++) {
                        values.tyre_rim_array.push(
                                {
                                    tyreSerialNo : "",
                                    tyreMfgYr : newTyreMfgYr.getFullYear(),
                                    vehicleRegDate: this.state.vehicleRegDate,
                                    policy_for: this.state.policy_for
                            } )
                    }
                }
            }
            this.setState({
                add_more_coverage: add_more_coverage,
                serverResponse: [],
                error: [], no_of_claim : array_length
            });
            if(value == "B00075") {
                setFieldTouched("PA_flag");
                setFieldValue("PA_flag", '1');
            }  
            if(value == "B00015") {
                setFieldTouched("PA_cover_flag");
                setFieldValue("PA_cover_flag", '1');
            }         
            if(value == "C101110") {
                setFieldTouched("tyre_cover_flag");
                setFieldValue("tyre_cover_flag", '1');
            }    
        }
        else {
            const index = add_more_coverage.indexOf(value);
            if (index !== -1) {
                add_more_coverage.splice(index, 1);
                this.setState({
                    serverResponse: [],
                    error: []
                });
            }

            if(value == "B00075") {
                setFieldTouched("PA_flag");
                setFieldValue("PA_flag", '0');
                setFieldTouched("PA_Cover");
                setFieldValue("PA_Cover", '');
            } 
            if(value == "B00015") {
                setFieldTouched("PA_cover_flag");
                setFieldValue("PA_cover_flag", '0');
            }       
            if(value == "C101110") {
                setFieldTouched("tyre_cover_flag");
                setFieldValue("tyre_cover_flag", '0');
            }  
        }
        
    }

    initClaimDetailsList = () => {
        let innicialClaimList = []
        const {tyre_rim_array,vehicleRegDate, policy_for} = this.state
        if(tyre_rim_array && tyre_rim_array.length > 0) {
            for (var i = 0; i < this.state.no_of_claim ; i++) {
                innicialClaimList.push(
                    {
                        tyreSerialNo :  tyre_rim_array && tyre_rim_array[i] && tyre_rim_array[i].tyreSerialNo ? tyre_rim_array[i].tyreSerialNo : "",
                        tyreMfgYr :  tyre_rim_array && tyre_rim_array[i] && tyre_rim_array[i].tyreMfgYr ? tyre_rim_array[i].tyreMfgYr : "",
                        vehicleRegDate : vehicleRegDate ,
                        policy_for : policy_for
                    }
                )
            }   
        }
            

    return innicialClaimList
    
    };

    handleClaims = (values, errors, touched, setFieldTouched, setFieldValue) => {
        let field_array = []        
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : []
        
        for (var i = 0; i < 2 ; i++) {
            field_array.push(
                <Col sm={12} md={12} lg={12}>
                    <Row >
                        <Col sm={1} md={1} lg={2}><span className="indexing"> Tyre{i+1} </span></Col>
                        <Col sm={12} md={5} lg={3}>
                            <FormGroup>
                                <div className="formSection">
                                <Field
                                        name={`tyre_rim_array[${i}].tyreMfgYr`}
                                        type="text"
                                        placeholder="MFG Year"
                                        autoComplete="off"
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        // value = {values[`tyre_rim_array[${i}].chassisNo`]}

                                    />
                                    {errors.tyre_rim_array && errors.tyre_rim_array[i] && errors.tyre_rim_array[i].tyreMfgYr ? (
                                    <span className="errorMsg">{errors.tyre_rim_array[i].tyreMfgYr}</span>
                                    ) : null}    
                                </div>
                            </FormGroup>
                        </Col>
                        <Col sm={12} md={5} lg={4}>
                            <FormGroup>
                                <div className="formSection">
                                    <Field
                                        name={`tyre_rim_array[${i}].tyreSerialNo`}
                                        type="text"
                                        placeholder="Serial No"
                                        autoComplete="off"
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        // value = {values[`tyre_rim_array[${i}].tyreSerialNo`]}

                                    />
                                    {errors.tyre_rim_array && errors.tyre_rim_array[i] && errors.tyre_rim_array[i].tyreSerialNo ? (
                                    <span className="errorMsg">{errors.tyre_rim_array[i].tyreSerialNo}</span>
                                    ) : null}   
                                </div>
                            </FormGroup>
                        </Col>
                    </Row>
                </Col>
            )
            } 
        return field_array

    }


    componentDidMount() {
        this.fetchData()
        this.getCoverage()
    }


    render() {
        const { vahanDetails, error, policyCoverage, vahanVerify, fulQuoteResp, PolicyArray, motorInsurance, serverResponse, add_more_coverage,
            step_completed, vehicleDetails, selectFlag, sliderVal, moreCoverage, ncbDiscount} = this.state
        const { productId } = this.props.match.params
        let translation = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : []
        let covList = motorInsurance && motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage.split(",") : ""
        let newInnitialArray = {}
        let PA_flag = motorInsurance && (motorInsurance.pa_cover == null || motorInsurance.pa_cover == "") ? '0' : '1'
        let PA_Cover = motorInsurance &&  motorInsurance.pa_cover != null ? motorInsurance.pa_cover : ''
        let tyre_cover_flag=  '0'
        
        const Coverage = {
            "B00002":translation["B00002"],
            "B00008":translation["B00008"],
            "B00013":translation["B00013"],
            "B00015":translation["B00015"],
            "B00075":translation["B00075"],
            "B00009":translation["B00009"],
            "C101072":translation["C101072"],
            "C101108":translation["C101108"],
            "C101110":translation["C101110"],
            "NCB":translation["NCB"],
            "TOTALOD":translation["TOTALOD"]
        }

        for(var i = 0; i<covList.length; i++) {
            if(covList.indexOf('C101110')) tyre_cover_flag = '1'
        }

        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        let sliderValue = sliderVal
        let min_IDV_suggested = PolicyArray.length > 0 ? PolicyArray[0].PolicyRiskList[0].MinIDV_Suggested : 0
        let max_IDV_suggested = PolicyArray.length > 0 ? PolicyArray[0].PolicyRiskList[0].MaxIDV_Suggested : 0
        let minIDV = min_IDV_suggested
        let maxIDV = PolicyArray.length > 0 ? Math.floor(max_IDV_suggested) : null
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null

        if(Number.isInteger(min_IDV_suggested) == false ) {
            minIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MinIDV_Suggested) : null           
            minIDV = minIDV + 1;
            // maxIDV = maxIDV - 1;
        }
         

        if(selectFlag == '1') {
            initialValue = {
                add_more_coverage: "",
                cng_kit: '0',
                B00015: "B00015",
                PA_flag: '0',
                PA_Cover: "",
                PA_cover_flag: "1",
                tyre_rim_array:  this.initClaimDetailsList(),
            
            }
           
        }else {
            initialValue = {
                add_more_coverage: "",
                cng_kit: '0',
                // B00015: "B00015",
                PA_flag: '0',
                PA_Cover: "",
                PA_cover_flag: motorInsurance && motorInsurance.pa_flag ? motorInsurance.pa_flag : '0',
                tyre_rim_array:  this.initClaimDetailsList(),
            
            }
        }
            
        for (var i = 0 ; i < covList.length; i++) {
            newInnitialArray[covList[i]] = covList[i];
        }    

        newInnitialArray.PA_flag = PA_flag   
        newInnitialArray.PA_Cover = PA_Cover
        newInnitialArray.tyre_cover_flag = tyre_cover_flag
        let newInitialValues = Object.assign(initialValue, newInnitialArray );

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

        const ncb_Discount = ncbDiscount && ncbDiscount != 0 ? (
            <div>
                <Row>
                    <Col sm={12} md={6}>
                        <FormGroup>NCB Discount</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                        <FormGroup>₹ -{Math.round(PolicyArray[0].PolicyRiskList[0].NCBDiscountAmt)}</FormGroup>
                    </Col>
                </Row>
            </div>    
        ) : ""
        

        const premiumBreakup = policyCoverage && policyCoverage.length > 0 ?
            policyCoverage.map((coverage, qIndex) => (
                coverage.PolicyBenefitList ? coverage.PolicyBenefitList.map((benefit, bIndex) => (
                        <tr>
                            <td>{Coverage[benefit.ProductElementCode]}:</td>
                            <td>₹ {Math.round(benefit.BeforeVatPremium)}</td>
                        </tr>  
                )) : 
                    <tr>
                        <td>{Coverage[coverage.ProductElementCode]}</td>
                        <td>₹ {Math.round(coverage.BeforeVatPremium)}  </td>                      
                    </tr> 
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
		
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox twoOCdetail">
                                <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                                { step_completed >= '2' && vehicleDetails.vehicletype_id == '4' ?
                                <section className="brand colpd m-b-25">
                                    <div className="d-flex justify-content-left">
                                        <div className="brandhead m-b-10">
                                            <h4 className="m-b-30">{phrases['CoversComprehensive']}</h4>
                                            <h5>{errMsg}</h5>
                                        </div>
                                    </div>
                                    <Formik initialValues={newInitialValues}
                                        onSubmit={serverResponse && serverResponse != "" ? (serverResponse.message ? this.getAccessToken : this.handleSubmit) : this.getAccessToken}
                                        validationSchema={ComprehensiveValidation}
                                        >
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
console.log("values--------------------> ", values)
console.log("errors--------------------> ", errors)

                                            return (
                                                <Form>
                                                    <Row>
                                                        <Col sm={12} md={9} lg={9}>
                                                            <div className="rghtsideTrigr W-90 m-b-30">
                                                                <Collapsible trigger={phrases['DefaultCovered']} open={true}>
                                                                    <div className="listrghtsideTrigr">
                                                                    {policyCoverageList}
                                                                    {ncb_Discount}
                                                                    </div>
                                                                </Collapsible>
                                                            </div>
                                                            <Row>
                                                                <Col sm={12} md={4} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
                                                                            <span className="fs-16">{phrases['IDValue']}</span>
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
                                                                            name='slider'
                                                                            defaultValue={defaultSliderValue}
                                                                            min={minIDV}
                                                                            max={maxIDV}
                                                                            step='1'
                                                                            value={values.slider}
                                                                            onChange={(e) => {
                                                                                setFieldTouched("slider");
                                                                                setFieldValue("slider", values.slider);
                                                                                this.sliderValue(e.target.value)
                                                                            }}
                                                                        />
                                                                        
                                                                    </FormGroup>
                                                                </Col> : null }
                                                            </Row>

                                                            {motorInsurance && motorInsurance.policy_for == '1' ?
                                                            <Row>
                                                                <Col sm={12} md={12} lg={12}>
                                                                    <FormGroup>
                                                                        <span className="fs-18"> {phrases['AddMoreCoverage']}</span>
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
                                                                            // checked={values.roadsideAssistance ? true : false}
                                                                            onClick={(e) =>{
                                                                                if( e.target.checked == false && values[coverage.code] == 'B00015') {
                                                                                    swal(phrases.SwalIRDAI)
                                                                                }
                                                                                this.onRowSelect(e.target.value, e.target.checked, setFieldTouched, setFieldValue,values)         
                                                                            }
                                                                            }
                                                                            checked = {values[coverage.code] == coverage.code ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </Col>
                                                                {values.PA_flag == '1' && values[coverage.code] == 'B00075' ?
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

                                                                {values.tyre_cover_flag == '0' ? values.tyre_rim_array = [] : null }
                                                                {/* {values.tyre_cover_flag == '0' ? values.B00007_value = "" : null } */}

                                                                {values.tyre_cover_flag == '1' && values[coverage.code] == 'C101110' ?
                                                                    this.handleClaims(values, errors, touched, setFieldTouched, setFieldValue) : null
                                                                }
                                                            </Row>
                                                            ))}

                                                            {motorInsurance && motorInsurance.policy_for == '2' && moreCoverage.map((coverage, qIndex) => (                                                            
                                                            <Row key={qIndex}>   
                                                            {/* {coverage.code == "C101072" || coverage.code == "C101108" || coverage.code == "C101110" ? */}
                                                            {coverage.code != "B00015" ?
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
                                                                                this.onRowSelect(e.target.value, e.target.checked, setFieldTouched, setFieldValue,values)         
                                                                            }
                                                                            }
                                                                            checked = {values[coverage.code] == coverage.code ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </Col> : null }
                                                        
                                                                {values.tyre_cover_flag == '0' ? values.tyre_rim_array = [] : null }
                                                                {values.tyre_cover_flag == '1' && values[coverage.code] == 'C101110' ?
                                                                    this.handleClaims(values, errors, touched, setFieldTouched, setFieldValue) : null
                                                                }
                                                                {values.PA_flag == '1' && values[coverage.code] == 'B00075' ?
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
                                                            </Row>
                                                            ))}
                                                            
                                                            <Row> &nbsp;</Row>
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
                        <h3>{phrases['PremiumBreakup']} </h3>
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
                                {ncbDiscount != 0 ? (
                                <tr>
                                    <td>{phrases['NCBDiscount']}:</td>
                                    <td>₹ -{Math.round(ncbDiscount)}</td>
                                </tr>
                                ) : ""}
                                
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