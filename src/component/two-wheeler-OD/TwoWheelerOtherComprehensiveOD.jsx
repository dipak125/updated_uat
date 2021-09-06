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
import {
    compareStartEndYear
  } from "../../shared/validationFunctions";
import {  validRegistrationNumber } from "../../shared/validationFunctions";

let encryption = new Encryption()
let translation = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : []

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

    registration_no: Yup.string().when("newRegistrationNo", {
        is: "NEW",       
        then: Yup.string(),
        otherwise: Yup.string().required('PleaseProRegNum')
        .test(
            "last4digitcheck",
            function() {
                return "InvalidRegNumber"
            },
            function (value) {
                if (value && (value != "" || value != undefined)) {             
                    return validRegistrationNumber(value);
                }   
                return true;
            }
        ),
    }),
    B00003_value: Yup.string().when(['nonElectric_flag'], {
        is: nonElectric_flag => nonElectric_flag == '1',
        then: Yup.string().required('pleaseProvideNonElecIDV').matches(/^[0-9]*$/, 'PleaseProvideValidIDV')
        .test(
            "maxMinIDVCheck",
            function() {
                return "IDVShouldBe1000To1000000"
            },
            function (value) {
                if (parseInt(value) < 1000 || value > 1000000) {   
                    return false;    
                }
                return true;
            }
        ),
        otherwise: Yup.string()
    }),

    B00003_description: Yup.string().when(['nonElectric_flag'], {
        is: nonElectric_flag => nonElectric_flag == '1',
        then: Yup.string().required('pleaseProvideAccessory').matches(/^[a-zA-Z0-9]*$/, 'PleaseValidDescription'),
        otherwise: Yup.string()
    }),
    
    B00004_value: Yup.string().when(['electric_flag'], {
        is: electric_flag => electric_flag == '1',
        then: Yup.string().required('pleaseProvideElecIDV').matches(/^[0-9]*$/, 'PleaseProvideValidIDV')
        .test(
            "maxMinIDVCheck",
            function() {
                return "IDVShouldBe1000To1000000"
            },
            function (value) {
                if (parseInt(value) < 1000 || value > 1000000) {   
                    return false;    
                }
                return true;
            }
        ),
        otherwise: Yup.string()
    }),

    B00004_description: Yup.string().when(['electric_flag'], {
        is: electric_flag => electric_flag == '1',
        then: Yup.string().required('pleaseProvideAccessory').matches(/^[a-zA-Z0-9]*$/, 'PleaseValidDescription'),
        otherwise: Yup.string()
    }),

    B00005_value: Yup.string().when(['CNG_OD_flag'], {
        is: CNG_OD_flag => CNG_OD_flag == '1',
        then: Yup.string().required('PleaseProvideIDV').test(
                "isLoanChecking",
                function() {
                    return "Value1Kto10L"
                },
                function (value) {
                    if (parseInt(value) < 1000 || value > 1000000) {   
                        return false;    
                    }
                    return true;
                }
            ).matches(/^[0-9]*$/, function() {
                return "PleaseEnterIDV"
            }),
        otherwise: Yup.string()
    }),

    puc: Yup.string().required("Please verify pollution certificate to proceed"),

    chasis_no_last_part:Yup.string().required('RequiredField')
        .matches(/^([0-9]*)$/, function() {
            return "Invalid number"
        })
        .min(5, function() {
            return "ChasisLastDigit"
        })
        .max(5, function() {
            return "ChasisLastDigit"
        }),

    engine_no:Yup.string().required('EngineRequired')
        .matches(/^[a-zA-Z0-9]*$/, function() {
            return "InvalidEngineNumber"
        })
        .min(5, function() {
            return "EngineMin"
        })
        .max(17, function() {
            return "EngineMax"
        }),

    chasis_no:Yup.string().required('ChasisRequired')
        .matches(/^[a-zA-Z0-9]*$/, function() {
            return "InvalidChasisNumber"
        })
        .min(5, function() {
            return "ChasisMin"
        })
        .max(20, function() {
            return "ChasisMax"
        }),

    vahanVerify:Yup.boolean().notRequired('PleaseNumber')
    .test(
        "vahanVerifyChecking",
        function() {
            return "PleaseNumber"
        },
        function (value) {
            if (value == false && this.parent.chasis_no_last_part && this.parent.chasis_no_last_part.length == 5) {  
                return false;
            }
            return true;
        }
    ),

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
});


const Coverage = {
    "B00002":translation["B00002"],
    "B00003":  translation["B00003"],
    "B00004":  translation["B00004"],
    "B00005":  translation["B00005"],
    "B00006":  translation["B00006"],
    "B00008":translation["B00008"],
    "B00013":translation["B00013"],
    "B00015":translation["B00015"],
    "B00075":translation["B00075"],
    "B00009":translation["B00009"],
    "B00011":  translation["B00011"],
    "B00012":  translation["B00012"],
    "B00069":  translation["B00069"],
    "B00070":  translation["B00070"],
    "B00071":  translation["B00071"],
    "B00073":  translation["B00073"],
    "C101072":translation["C101072"],
    "C101108":translation["C101108"],
    "C101110":translation["C101110"],
    "C101064":translation["C101064"],
    "C101065":translation["C101065"],
    "C101066":translation["C101066"],
    "C101069":translation["C101069"],
    "C101067":translation["C101067"],
    "C101111":translation["C101111"], 
    "NCB":translation["NCB"],
    "TOTALOD":translation["TOTALOD"]
}


class TwoWheelerOtherComprehensiveOD extends Component {

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
            no_of_claim : 2,
            add_more_coverage_request_array: [],
            request_data: [],
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
        this.props.history.push(`/two_wheeler_Vehicle_detailsOD/${productId}`);
    }


    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        this.props.loadingStart();
        axios.get(`two-wh-stal/policy-holder/motor-saod/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log("decryptResp----", decryptResp)
                let values = []
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {};
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";
                let sliderVal = motorInsurance && motorInsurance.idv_value ? motorInsurance.idv_value : 0
                let vehicleRegDate = motorInsurance &&  motorInsurance.registration_date != null ? motorInsurance.registration_date : ''
                let tyre_rim_array = motorInsurance.tyre_rim_array && motorInsurance.tyre_rim_array!=null ? motorInsurance.tyre_rim_array : null
                tyre_rim_array = tyre_rim_array!=null ? JSON.parse(tyre_rim_array) : []

                let add_more_coverage = motorInsurance && motorInsurance.policy_for == '2' ? (motorInsurance.add_more_coverage != null ? motorInsurance.add_more_coverage.split(",") : [])
                    : (motorInsurance.add_more_coverage != null ? motorInsurance.add_more_coverage.split(",") : ['B00015']) 
                add_more_coverage = add_more_coverage.flat()

                let add_more_coverage_request_json = motorInsurance && motorInsurance.add_more_coverage_request_json != null ? motorInsurance.add_more_coverage_request_json : ""
                let add_more_coverage_request_array = add_more_coverage_request_json != "" ? JSON.parse(add_more_coverage_request_json) : []

                 values.PA_flag = motorInsurance && motorInsurance.pa_cover != "" ? '1' : '0'
                 values.PA_Cover = motorInsurance && motorInsurance.pa_cover != "" ? motorInsurance.pa_cover : '0'
                 values.B00004_value = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.value : ""
                 values.B00004_description = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.description : ""
                 values.B00003_value = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.value : ""
                 values.B00003_description = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.description : ""
                 values.B00005_value = add_more_coverage_request_array.B00005 ? add_more_coverage_request_array.B00005.value : ""
                 values.tyre_rim_array = tyre_rim_array
                
                this.setState({
                    motorInsurance,vehicleDetails,step_completed,tyre_rim_array, request_data,sliderVal,
                    add_more_coverage: add_more_coverage, add_more_coverage_request_array,vehicleRegDate,
                    selectFlag: motorInsurance && motorInsurance.policy_for == '2' ? [] : (motorInsurance.add_more_coverage != null ? '0' : '1') ,
                    vahanVerify: motorInsurance.chasis_no && motorInsurance.engine_no ? true : false,
                    
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

    getVahanDetails = async(values, setFieldTouched, setFieldValue, errors) => {

        const formData = new FormData();

        formData.append("regnNo", values.registration_no);
        formData.append("chasiNo", values.chasis_no_last_part);
        formData.append("policy_holder_id", this.state.request_data.policyholder_id);
        
        if(errors.registration_no || errors.chasis_no_last_part) {
            swal("Please provide correct Registration number and Chasis number")
        }
        else {
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
    };

    fullQuote = (access_token, values) => {
        const { PolicyArray, sliderVal, add_more_coverage, motorInsurance } = this.state
        let coverage_data = {}
        let total_idv=0
        let other_idv=0

        // let cng_kit_flag = 0;
        // let cngKit_Cost = 0;   
        // if (values.toString()) {
        //     cng_kit_flag = values.cng_kit
        //     cngKit_Cost = values.cngKit_Cost
        // }
        let defaultSliderValue = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].IDV_User) : 0
        const formData = new FormData();
        let encryption = new Encryption();

        if(add_more_coverage ) {
            coverage_data = {
                'B00004' : {'value': values.B00004_value, 'description': values.B00004_description},
                'B00003' : {'value': values.B00003_value, 'description': values.B00003_description},
                'B00005' : {'value': values.B00005_value},
            }
            if(values.B00004_value){
                other_idv = other_idv + parseInt(values.B00004_value)
            }
            if(values.B00003_value){
                other_idv = other_idv + parseInt(values.B00003_value)
            }
            
        }

        const post_data = {
            'reference_no':localStorage.getItem('policyHolder_refNo'),
            'access_token':access_token,
            'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
            'add_more_coverage': add_more_coverage.toString(),
            'policy_type': motorInsurance ? motorInsurance.policy_type : "",
            'policytype_id': motorInsurance ? motorInsurance.policytype_id : "",
            'PA_Cover': values.PA_flag ? values.PA_Cover : "0",
            'policy_for': motorInsurance ? motorInsurance.policy_for : "",
            'tyre_rim_array' : values.tyre_rim_array,
            'coverage_data': JSON.stringify(coverage_data),
        }
        console.log('fullQuote_post_data', post_data)
        total_idv = parseInt(other_idv) + parseInt(post_data.idv_value)

        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));

            if((total_idv> 500000) && user_data.user_type == "POSP"  ) {
                swal("Quote cannot proceed with IDV greater than 500000")
                this.props.loadingStop();
                return false
            }
        }

        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))

        axios.post('two-wh-stal/fullQuoteStlM2W', formData)
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
                            BeforeVatPremium : res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].OD_NCBAmount : 0,
                            // BeforeVatPremium : Math.round(policyCoverage[0]['PolicyBenefitList'][0]['BeforeVatPremium']) - Math.round(ncbDiscount),
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
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_User) : 0
        let total_idv = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].SumInsured) : 0
        let coverage_data = {}
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : []

        if(add_more_coverage) {
            coverage_data = {
                'B00004' : {'value': values.B00004_value, 'description': values.B00004_description},
                'B00003' : {'value': values.B00003_value, 'description': values.B00003_description},
                'B00005' : {'value': values.B00005_value},
            }         
        }

        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}

        post_data = {
            'policy_holder_id': localStorage.getItem('policyHolder_id'),
            'menumaster_id': 3,
            'cng_kit': values.cng_kit,
            'registration_no': values.registration_no,
            'chasis_no': values.chasis_no,
            'chasis_no_last_part': values.chasis_no_last_part,
            'engine_no': values.engine_no,
            'puc': values.puc,
            'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
            'add_more_coverage': add_more_coverage,
            'pa_cover': values.PA_flag ? values.PA_Cover : "0",
            'pa_flag' : values.PA_cover_flag,
            'page_name': `two_wheeler_OtherComprehensiveOD/${productId}`,
            'tyre_rim_array' : values.tyre_rim_array && values.tyre_rim_array.length > 0 ? values.tyre_rim_array : null ,
            'coverage_data': JSON.stringify(coverage_data),
        }

        console.log('post_data', post_data)

        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data && total_idv) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));

            if((total_idv> 500000) && user_data.user_type == "POSP"  ) {
                swal("Quote cannot proceed with IDV greater than 500000")
                this.props.loadingStop();
                return false
            }
        }
        else return false;

        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('two-wh-stal/insured-value', formData).then(res => {
            this.props.loadingStop();
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp---', decryptResp)
            if (decryptResp.error == false) {
                this.props.history.push(`/two_wheeler_additional_detailsOD/${productId}`);
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
            if(value == "B00003") {
                setFieldTouched("nonElectric_flag");
                setFieldValue("nonElectric_flag", '1');
                
            }
            if(value == "B00004") {
                setFieldTouched("electric_flag");
                setFieldValue("electric_flag", '1');
            }
            if(value == "B00005") {
                setFieldTouched("CNG_OD_flag");
                setFieldValue("CNG_OD_flag", '1');
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
            if(value == "B00003") {
                setFieldTouched("nonElectric_flag");
                setFieldValue("nonElectric_flag", '0');
                
            }
            if(value == "B00004") {
                setFieldTouched("electric_flag");
                setFieldValue("electric_flag", '0');
            }
            if(value == "B00005") {
                setFieldTouched("CNG_OD_flag");
                setFieldValue("CNG_OD_flag", '0');
            }
        }
        
    }

    regnoFormat = (e, setFieldTouched, setFieldValue) => {
    
        let regno = e.target.value    
        e.target.value = regno.toUpperCase()
    
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
            step_completed, vehicleDetails, selectFlag, sliderVal, moreCoverage, ncbDiscount, add_more_coverage_request_array} = this.state
        const { productId } = this.props.match.params
        let covList = motorInsurance && motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage.split(",") : ""
        console.log("covList--------------> ", covList)
        let newInnitialArray = {}
        // let PA_flag = motorInsurance && (motorInsurance.pa_cover == null || motorInsurance.pa_cover == "") ? '0' : '1'
        let PA_Cover = motorInsurance &&  motorInsurance.pa_cover != null ? motorInsurance.pa_cover : ''
        let electric_flag= add_more_coverage_request_array.B00004 && add_more_coverage_request_array.B00004.value ? '1' : '0'
        let nonElectric_flag= add_more_coverage_request_array.B00003 && add_more_coverage_request_array.B00003.value ? '1' : '0'
        let CNG_OD_flag = add_more_coverage_request_array.B00005 && add_more_coverage_request_array.B00005.value ? '1' : '0'
        let tyre_cover_flag=  '0'
        
        for(var i = 0; i<covList.length; i++) {
            if(covList.indexOf('C101110')) tyre_cover_flag = '1'
        }

        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_User) : 0
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
                registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
                chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : "",
                chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
                engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : "",
                add_more_coverage: "",
                cng_kit: '0',
                B00015: "B00015",
                PA_flag: '0',
                PA_Cover: "",
                PA_cover_flag: "1",
                electric_flag: '0',
                nonElectric_flag: '0',
                tyre_rim_array:  this.initClaimDetailsList(),
                vahanVerify: vahanVerify,
                puc: 1
            
            }
           
        }else {
            initialValue = {
                registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
                chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : "",
                chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
                engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : "",
                add_more_coverage: "",
                cng_kit: '0',
                // B00015: "B00015",
                PA_flag: '0',
                PA_Cover: "",
                electric_flag: '0',
                nonElectric_flag: '0',
                PA_cover_flag: motorInsurance && motorInsurance.pa_flag ? motorInsurance.pa_flag : '0',
                tyre_rim_array:  this.initClaimDetailsList(),
                vahanVerify: vahanVerify,
                puc: 1
            
            }
        }
            
        for (var i = 0 ; i < covList.length; i++) {
            newInnitialArray[covList[i]] = covList[i];
        }    

        // newInnitialArray.PA_flag = PA_flag   
        newInnitialArray.PA_Cover = PA_Cover
        newInnitialArray.electric_flag = electric_flag
        newInnitialArray.nonElectric_flag = nonElectric_flag
        newInnitialArray.tyre_cover_flag = tyre_cover_flag
        newInnitialArray.CNG_OD_flag = CNG_OD_flag

        newInnitialArray.B00004_value = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.value : ""
        newInnitialArray.B00004_description = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.description : ""
        newInnitialArray.B00003_value = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.value : ""
        newInnitialArray.B00003_description = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.description : ""
        newInnitialArray.B00005_value = add_more_coverage_request_array.B00005 ? add_more_coverage_request_array.B00005.value : ""

        let newInitialValues = Object.assign(initialValue, newInnitialArray );

        console.log('policyCoverage', policyCoverage)

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

            // console.log("step_completed---", step_completed)

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
                                { step_completed >= '2' && vehicleDetails.vehicletype_id == productId ?
                                <section className="brand colpd m-b-25">
                                    <div className="d-flex justify-content-left">
                                        <div className="brandhead m-b-10">
                                            <h4 className="m-b-30">{phrases['CoversM2WOD']}</h4>
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
                                                                <Collapsible trigger={phrases['DefaultCovered']} open={true}>
                                                                    <div className="listrghtsideTrigr">
                                                                    {policyCoverageList}
                                                                    {ncb_Discount}
                                                                    </div>
                                                                </Collapsible>
                                                            </div>

                                                            <Row>
                                                                <Col sm={12} md={12} lg={5}>
                                                                <Row>
                                                                <Col sm={12} md={5} lg={5}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
                                                                        {phrases['RegNo']}
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                    
                                                                <Col sm={12} md={5} lg={6}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
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
                                    
                                                                            /> 
                                                                            {errors.registration_no ? (
                                                                                <span className="errorMsg">{phrases[errors.registration_no]}</span>
                                                                            ) : null}
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                </Row>
                                                                </Col>

                                                                <Col sm={12} md={12} lg={5}>
                                                                    <Row>
                                                                        <Col sm={12} md={6} lg={6}>
                                                                            <FormGroup>
                                                                                <div className="insurerName">
                                                                                {phrases['ChassisNo']}.
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>
                                                                    
                                                                        <Col sm={12} md={6} lg={4}>
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
                                                                                        <span className="errorMsg">{phrases[errors.chasis_no_last_part]}</span>
                                                                                    ) : null}
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>
                                                                        <Col sm={12} md={1} lg={2}>
                                                                            <Button className="btn btn-primary vrifyBtn" onClick= {!errors.chasis_no_last_part ? this.getVahanDetails.bind(this,values, setFieldTouched, setFieldValue, errors) : null}>{phrases['Verify']}</Button>
                                                                            {errors.vahanVerify ? (
                                                                                    <span className="errorMsg">{phrases[errors.vahanVerify]}</span>
                                                                                ) : null}       
                                                                        </Col>
                                                                    </Row>
                                                                    
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
                                                                                placeholder={phrases["EngineNumber"]}
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
                                                                                <span className="errorMsg">{phrases[errors.engine_no]}</span>
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
                                                                                placeholder={phrases["ChasisNumber"]}
                                                                                autoComplete="off"
                                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                value= {values.chasis_no.toUpperCase()}
                                                                                maxLength="20"
                                                                                onChange = {(e) => {
                                                                                    setFieldTouched('chasis_no')
                                                                                    setFieldValue('chasis_no', e.target.value)                       
                                                                                }} 
                                                                            />
                                                                            {errors.chasis_no && touched.chasis_no ? (
                                                                                <span className="errorMsg">{phrases[errors.chasis_no]}</span>
                                                                            ) : null}
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>
                                                            : null}

                                                            <Row>
                                                                <Col sm={12} md={6} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
                                                                            <span className="fs-16">{phrases['IDValue']}</span>
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={6} lg={2}>
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
                                                            {moreCoverage && moreCoverage.length > 0 ? 
                                                            <Row>
                                                                <Col sm={12} md={12} lg={12}>
                                                                    <FormGroup>
                                                                        <span className="fs-18"> {phrases['AddMoreCoverage']}</span>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row> : null }

                                                            {motorInsurance && motorInsurance.policy_for == '1' && moreCoverage.map((coverage, qIndex) => (
                                                            <Row key={qIndex}>   
                                                                <Col sm={12} md={11} lg={5} key={qIndex+"a"} >
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
                                                                {values.nonElectric_flag == '1' && values[coverage.code] == 'B00003' ?
                                                                    <Fragment>
                                                                        <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                                                            <FormGroup>
                                                                                <div className="formSection">
                                                                                    <Field
                                                                                        name="B00003_value"
                                                                                        type="text"
                                                                                        placeholder={phrases['ValueOfAccessory']}
                                                                                        autoComplete="off"
                                                                                        maxLength="8"
                                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                        onChange={(e) => {
                                                                                            setFieldTouched('B00003_value')
                                                                                            setFieldValue('B00003_value', e.target.value);
                                                                                            this.handleChange()
                                                                                        }}
                                                                                    >                                     
                                                                                    </Field>
                                                                                    {errors.B00003_value ? (
                                                                                        <span className="errorMsg">{phrases[errors.B00003_value]}</span>
                                                                                    ) : null}
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>
                                                                        <Col sm={12} md={11} lg={3} key={qIndex+"c"}>
                                                                            <FormGroup>
                                                                                <div className="formSection">
                                                                                    <Field
                                                                                        name="B00003_description"
                                                                                        type="text"
                                                                                        placeholder={phrases['AccessoryDescription']}
                                                                                        autoComplete="off"
                                                                                        // maxLength="28"
                                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                        onChange={(e) => {
                                                                                            setFieldTouched('B00003_description')
                                                                                            setFieldValue('B00003_description', e.target.value);
                                                                                            this.handleChange()
                                                                                        }}
                                                                                    >                                     
                                                                                    </Field>
                                                                                    {errors.B00003_description ? (
                                                                                        <span className="errorMsg">{phrases[errors.B00003_description]}</span>
                                                                                    ) : null}
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col> </Fragment> : null
                                                                }
                                                                {values.electric_flag == '1' && values[coverage.code] == 'B00004' ?
                                                                    <Fragment>
                                                                    <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                                <Field
                                                                                    name="B00004_value"
                                                                                    type="text"
                                                                                    placeholder={phrases['ValueOfAccessory']}
                                                                                    autoComplete="off"
                                                                                    maxLength="7"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    onChange={(e) => {
                                                                                        setFieldTouched('B00004_value')
                                                                                        setFieldValue('B00004_value', e.target.value);
                                                                                        this.handleChange()
                                                                                    }}
                                                                                >                                     
                                                                                </Field>
                                                                                {errors.B00004_value ? (
                                                                                    <span className="errorMsg">{phrases[errors.B00004_value]}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={11} lg={3} key={qIndex+"c"}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                                <Field
                                                                                    name="B00004_description"
                                                                                    type="text"
                                                                                    placeholder={phrases['AccessoryDescription']}
                                                                                    autoComplete="off"
                                                                                    // maxLength="28"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    onChange={(e) => {
                                                                                        setFieldTouched('B00004_description')
                                                                                        setFieldValue('B00004_description', e.target.value);
                                                                                        this.handleChange()
                                                                                    }}
                                                                                >                                     
                                                                                </Field>
                                                                                {errors.B00004_description ? (
                                                                                    <span className="errorMsg">{phrases[errors.B00004_description]}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col> </Fragment> : null
                                                                }
                                                                {values.CNG_OD_flag == '1' && values[coverage.code] == 'B00005' ?
                                                                    <Fragment>
                                                                    <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                                <Field
                                                                                    name="B00005_value"
                                                                                    type="text"
                                                                                    placeholder="Sum insured"
                                                                                    autoComplete="off"
                                                                                    maxLength="7"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    onChange={(e) => {
                                                                                        setFieldTouched('B00005_value')
                                                                                        setFieldValue('B00005_value', e.target.value);
                                                                                        this.handleChange()
                                                                                    }}
                                                                                    >                                     
                                                                                </Field>
                                                                                {errors.B00005_value ? (
                                                                                    <span className="errorMsg">{phrases[errors.B00005_value]}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    </Fragment> : null
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
                                                            <Col sm={12} md={11} lg={5} key={qIndex+"a"} >
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
                                                            {values.nonElectric_flag == '1' && values[coverage.code] == 'B00003' ?
                                                                <Fragment>
                                                                    <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                                <Field
                                                                                    name="B00003_value"
                                                                                    type="text"
                                                                                    placeholder={phrases['ValueOfAccessory']}
                                                                                    autoComplete="off"
                                                                                    maxLength="8"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    onChange={(e) => {
                                                                                        setFieldTouched('B00003_value')
                                                                                        setFieldValue('B00003_value', e.target.value);
                                                                                        this.handleChange()
                                                                                    }}
                                                                                >                                     
                                                                                </Field>
                                                                                {errors.B00003_value ? (
                                                                                    <span className="errorMsg">{phrases[errors.B00003_value]}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={11} lg={3} key={qIndex+"c"}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                                <Field
                                                                                    name="B00003_description"
                                                                                    type="text"
                                                                                    placeholder={phrases['AccessoryDescription']}
                                                                                    autoComplete="off"
                                                                                    // maxLength="28"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    onChange={(e) => {
                                                                                        setFieldTouched('B00003_description')
                                                                                        setFieldValue('B00003_description', e.target.value);
                                                                                        this.handleChange()
                                                                                    }}
                                                                                >                                     
                                                                                </Field>
                                                                                {errors.B00003_description ? (
                                                                                    <span className="errorMsg">{phrases[errors.B00003_description]}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col> </Fragment> : null
                                                            }
                                                            {values.electric_flag == '1' && values[coverage.code] == 'B00004' ?
                                                                <Fragment>
                                                                <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                                                    <FormGroup>
                                                                        <div className="formSection">
                                                                            <Field
                                                                                name="B00004_value"
                                                                                type="text"
                                                                                placeholder={phrases['ValueOfAccessory']}
                                                                                autoComplete="off"
                                                                                maxLength="7"
                                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                onChange={(e) => {
                                                                                    setFieldTouched('B00004_value')
                                                                                    setFieldValue('B00004_value', e.target.value);
                                                                                    this.handleChange()
                                                                                }}
                                                                            >                                     
                                                                            </Field>
                                                                            {errors.B00004_value ? (
                                                                                <span className="errorMsg">{phrases[errors.B00004_value]}</span>
                                                                            ) : null}
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={11} lg={3} key={qIndex+"c"}>
                                                                    <FormGroup>
                                                                        <div className="formSection">
                                                                            <Field
                                                                                name="B00004_description"
                                                                                type="text"
                                                                                placeholder={phrases['AccessoryDescription']}
                                                                                autoComplete="off"
                                                                                // maxLength="28"
                                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                onChange={(e) => {
                                                                                    setFieldTouched('B00004_description')
                                                                                    setFieldValue('B00004_description', e.target.value);
                                                                                    this.handleChange()
                                                                                }}
                                                                            >                                     
                                                                            </Field>
                                                                            {errors.B00004_description ? (
                                                                                <span className="errorMsg">{phrases[errors.B00004_description]}</span>
                                                                            ) : null}
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col> </Fragment> : null
                                                            }
                                                            {values.CNG_OD_flag == '1' && values[coverage.code] == 'B00005' ?
                                                                <Fragment>
                                                                <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                                                    <FormGroup>
                                                                        <div className="formSection">
                                                                            <Field
                                                                                name="B00005_value"
                                                                                type="text"
                                                                                placeholder="Sum insured"
                                                                                autoComplete="off"
                                                                                maxLength="7"
                                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                onChange={(e) => {
                                                                                    setFieldTouched('B00005_value')
                                                                                    setFieldValue('B00005_value', e.target.value);
                                                                                    this.handleChange()
                                                                                }}
                                                                                >                                     
                                                                            </Field>
                                                                            {errors.B00005_value ? (
                                                                                <span className="errorMsg">{phrases[errors.B00005_value]}</span>
                                                                            ) : null}
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                </Fragment> : null
                                                            }

                                                            {values.tyre_cover_flag == '0' ? values.tyre_rim_array = [] : null }
                                                            {/* {values.tyre_cover_flag == '0' ? values.B00007_value = "" : null } */}

                                                            {values.tyre_cover_flag == '1' && values[coverage.code] == 'C101110' ?
                                                                this.handleClaims(values, errors, touched, setFieldTouched, setFieldValue) : null
                                                            }
                                                        </Row>
                                                        ))}

                                                            <Row>
                                                                <Col sm={12}>
                                                                    <FormGroup>
                                                                        <div className="carloan">
                                                                            <h4> </h4>
                                                                        </div>
                                                                        <div className="col-md-15">
                                                                            <div className="brandhead"> 
                                                                            {phrases['EffectivePUC']}
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
                                                                                                <span className="checkmark " /><span className="fs-14"> {phrases['Yes']}</span>
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
                                                                                                <span className="checkmark " /><span className="fs-14"> {phrases['No']}</span>
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
                                                                <Button className={`backBtn`} type="button" onClick={this.vehicleDetails.bind(this, productId)}>
                                                                {phrases['Back']}
                                                                </Button>
                                                                {serverResponse && serverResponse != "" ? (serverResponse.message ?
                                                                    <Button className={`proceedBtn`} type="submit"  >
                                                                    {phrases['Recalculate']}
                                                                    </Button> : (values.puc == '1' ?  <Button className={`proceedBtn`} type="submit"  >
                                                                        {phrases['Continue']}
                                                                    </Button>  : null)) : <Button className={`proceedBtn`} type="submit"  >
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TwoWheelerOtherComprehensiveOD));