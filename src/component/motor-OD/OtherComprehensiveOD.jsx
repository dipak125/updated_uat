import React, { Component, Fragment } from 'react';
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
import {  validRegistrationNumber } from "../../shared/validationFunctions";


let translation = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : []

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

    registration_no: Yup.string().when("newRegistrationNo", {
        is: "NEW",       
        then: Yup.string(),
        otherwise: Yup.string()
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
    .max(17, function() {
        return "ChasisMax"
    }),

    B00004_value: Yup.string().when(['electric_flag'], {
        is: electric_flag => electric_flag == '1',
        then: Yup.string().required('pleaseProvideElecIDV').matches(/^[0-9]*$/, 'PleaseValidIDV')
        .test(
            "maxMinIDVCheck",
            function() {
                return "Idv1to5Lakh"
            },
            function (value) {
                if (parseInt(value) < 1000 || value > 500000) {   
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

    B00003_value: Yup.string().when(['nonElectric_flag'], {
        is: nonElectric_flag => nonElectric_flag == '1',
        then: Yup.string().required('pleaseProvideNonElecIDV').matches(/^[0-9]*$/, 'PleaseValidIDV')
        .test(
            "maxMinIDVCheck",
            function() {
                return "Idv1to5Lakh"
            },
            function (value) {
                if (parseInt(value) < 1000 || value > 500000) {   
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

    // cng_kit:Yup.string().required("Please select an option"),
    // // IDV:Yup.number().required('Declared value is required'),
    
    // cngKit_Cost: Yup.string().when(['cng_kit'], {
    //     is: cng_kit => cng_kit == '1',       
    //     then: Yup.string().required('Please provide CNG kit cost'),
    //     othewise: Yup.string()
    // }).matches(/^([0-9]*)$/, function() {
    //     return "Invalid number"
    // }),
   
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

    B00005_value: Yup.string().when(['CNG_OD_flag'], {
        is: CNG_OD_flag => CNG_OD_flag == '1',
        then: Yup.string().required('Please provide IDV').test(
                "isLoanChecking",
                function() {
                    return "Value should be 1K to 5L"
                },
                function (value) {
                    if (parseInt(value) < 1000 || value > 500000) {   
                        return false;    
                    }
                    return true;
                }
            ).matches(/^[0-9]*$/, function() {
                return "Please enter valid IDV"
            }),
        otherwise: Yup.string()
    }),

    B00013_value: Yup.string().when(['LL_PD_flag'], {
        is: LL_PD_flag => LL_PD_flag == '1',
        then: Yup.string().required('pleaseProvideDriver'),
        otherwise: Yup.string()
    }),
   
});


// const Coverage = {
//         "C101064":"Own Damage",
//         "C101065":"Legal Liability to Third Party",
//         "C101066":"PA Cover",
//         "C101069":"Basic Road Side Assistance",
//         "C101072":"Depreciation Reimbursement",
//         "C101067":"Return to Invoice",
//         "C101108":"Engine Guard",
//         "C101111":"Cover for consumables",
//         "B00002": "Own Damage Basic",
//         "B00008": "Third Party Bodily Injury",
//         "B00013": "Legal Liability to Paid Drivers",
//         "B00015": "PA -  Owner Driver",
//         "B00016": "PA for Unnamed Passenger",
//         "B00009": "Third Party Property Damage Limit",
//         "NCB": "NCB Discount",
//         "TOTALOD": "Total Own Damage"
// }

const Coverage = {
    "C101064":translation["C101064"],
    "C101065":translation["C101065"],
    "C101066":translation["C101066"],
    "C101069":translation["C101069"],
    "C101072":translation["C101072"],
    "C101067":translation["C101067"],
    "C101108":translation["C101108"],
    "C101111":translation["C101111"], 
    "NCB":translation["NCB"],
    "TOTALOD":translation["TOTALOD"],
    "GEOGRAPHYOD":translation["GEOGRAPHYOD"],
    "GEOGRAPHYTP":translation["GEOGRAPHYTP"],

    "B00016":translation["B00016"],
    "B00002":  translation["B00002"],
    "B00003":  translation["B00003"],
    "B00004":  translation["B00004"],
    "B00005":  translation["B00005"],
    "B00006":  translation["B00006"],
    "B00007":  translation["B00007"],
    "B00008":  translation["B00008"],
    "B00009":  translation["B00009"],
    "B00010":  translation["B00010"],
    "B00011":  translation["B00011"],
    "B00012":  translation["B00012"],
    "B00013":  translation["B00013"],
    "B00069":  translation["B00069"],
    "B00070":  translation["B00070"],
    "B00071":  translation["B00071"],
    "B00015":  translation["B00015"],
    "B00073":  translation["B00073"],
    "B00018":  translation["B00018"],
    "B00019":  translation["B00019"],
    "B00020":  translation["B00020"],
    "B00022":  translation["B00022"],  
    "B00025":  translation["B00025"] 
}

class OtherComprehensiveOD extends Component {

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
            regno:'',
            length:14,
            moreCoverage: [],
            engine_no: "",
            chasis_no: "",
            chasiNo:'',
            engineNo:'',
            selectFlag: '',
            initialValue: {
                registration_no: "",
                chasis_no: "",
                chasis_no_last_part: "",
                add_more_coverage: "",
                cng_kit: 0,
                // cngKit_Cost: 0,
                engine_no: "",
                vahanVerify: false,
                newRegistrationNo: "",
                puc: '1',
            },
            request_data: [],
            geographical_extension: [],
            add_more_coverage_request_array: [],
            ncbDiscount: 0
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
        this.props.history.push(`/VehicleDetailsOD/${productId}`);
    }


    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt--fetchData-- ", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {};
                let values = []
                let add_more_coverage = motorInsurance && motorInsurance.add_more_coverage != null ? motorInsurance.add_more_coverage.split(",") : ['B00015']
                add_more_coverage = add_more_coverage.flat()
                let sliderVal = motorInsurance && motorInsurance.idv_value ? motorInsurance.idv_value : 0

                let add_more_coverage_request_json = motorInsurance && motorInsurance.add_more_coverage_request_json != null ? motorInsurance.add_more_coverage_request_json : ""
                let add_more_coverage_request_array = add_more_coverage_request_json != "" ? JSON.parse(add_more_coverage_request_json) : []
                var geographical_extension = add_more_coverage_request_array && add_more_coverage_request_array.geographical_extension ? add_more_coverage_request_array.geographical_extension : []

                values.PA_flag = motorInsurance && motorInsurance.pa_cover != "" ? '1' : '0'
                values.PA_Cover = motorInsurance && motorInsurance.pa_cover != "" ? motorInsurance.pa_cover : '0'
                values.B00013_value = add_more_coverage_request_array.B00013 ? add_more_coverage_request_array.B00013.value : ""
                values.B00004_value = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.value : ""
                values.B00005_value = add_more_coverage_request_array.B00005 ? add_more_coverage_request_array.B00005.value : ""
                values.B00004_description = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.description : ""
                values.B00003_value = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.value : ""
                values.B00003_description = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.description : ""

                this.setState({
                    motorInsurance, add_more_coverage,request_data,geographical_extension,add_more_coverage_request_array,sliderVal,
                    showCNG: motorInsurance.cng_kit == 1 ? true : false,
                    vahanVerify: motorInsurance.chasis_no && motorInsurance.engine_no ? true : false,
                    selectFlag: motorInsurance && motorInsurance.add_more_coverage != null ? '0' : '1'
                })
                this.props.loadingStop();
                this.fullQuote(values)
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

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
        formData.append("policy_holder_id", this.state.request_data.policyholder_id);
        
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
                    // swal("Please provide correct Registration number and Chasis number")
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



    fullQuote = (values) => {
        const { PolicyArray, sliderVal, add_more_coverage, motorInsurance, geographical_extension } = this.state
        // let cng_kit_flag = 0;
        // let cngKit_Cost = 0;
        // if(values.toString()) {            
        //     cng_kit_flag = values.cng_kit
        //     cngKit_Cost = values.cngKit_Cost
        // }
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        let coverage_data = {}
        const formData = new FormData();

        let csc_data = localStorage.getItem('users') ? localStorage.getItem('users') : "";
        let csc_user_type = "";
        let total_idv=0
        let other_idv=0

        if(csc_data && sessionStorage.getItem('csc_id')) {
            let encryption = new Encryption();
            csc_data = JSON.parse(csc_data)        
            csc_data = csc_data.user
            csc_data = JSON.parse(encryption.decrypt(csc_data));           
            csc_user_type = csc_data.type
        }

        if(add_more_coverage) {
            coverage_data = {
                'B00004' : {'value': values.B00004_value, 'description': values.B00004_description},
                'B00003' : {'value': values.B00003_value, 'description': values.B00003_description},
                'B00005' : {'value': values.B00005_value},
                'B00013' : {'value': values.B00013_value},
                geographical_extension
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
            'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
            'policy_type': motorInsurance.policy_type,
            'add_more_coverage': add_more_coverage.toString(),
            'coverage_data': JSON.stringify(coverage_data),
            'PA_Cover': values.PA_flag ? values.PA_Cover : "0",
            // 'cng_kit': cng_kit_flag,
            // 'cngKit_Cost': cngKit_Cost
        }
        console.log('fullQuote_post_data', post_data)
        total_idv = parseInt(other_idv) + parseInt(post_data.idv_value)+parseInt(post_data.body_idv_value)

        if(( total_idv> 5000000) && csc_user_type == "POSP" ) {
            swal("Quote cannot proceed with IDV greater than 5000000")
            this.props.loadingStop();
            return false
        }

        let encryption = new Encryption();
        this.props.loadingStart();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        axios.post('four-wh-stal/fullQuoteStlM4W',formData)
            .then(res => {
                if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
                    let policyCoverage= res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : []
                    let ncbDiscount= res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].OD_NCBAmount : 0
                    let IsGeographicalExtension= res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].IsGeographicalExtension : 0
                    if(ncbDiscount != '0') {
                        let ncbArr = {}
                        ncbArr.PolicyBenefitList = [{
                            BeforeVatPremium : 0 - Math.round(ncbDiscount),
                            ProductElementCode : 'NCB'
                        }]
    
                        let totOD = {}
                        totOD.PolicyBenefitList = [{
                            BeforeVatPremium : Math.round(policyCoverage[0]['GrossPremium'] + policyCoverage[0]['LoadingAmount']) - Math.round(ncbDiscount),
                            ProductElementCode : 'TOTALOD'
                        }]
    
                        policyCoverage = ncbDiscount != '0' ?  insert(policyCoverage, 1, ncbArr) : ""
                        policyCoverage = ncbDiscount != '0' ?  insert(policyCoverage, 2, totOD) : ""
                    }

                    if(IsGeographicalExtension == '1') {
                        let geoArrOD = {}
                        let geoArrTP = {}
                        geoArrOD.PolicyBenefitList = [{
                            BeforeVatPremium : res.data.PolicyObject.PolicyLobList && res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList ? Math.round(res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList[0].LoadingAmount) : 0,
                            ProductElementCode : 'GEOGRAPHYOD'
                        }]

                        geoArrTP.PolicyBenefitList = [{
                            BeforeVatPremium : res.data.PolicyObject.PolicyLobList && res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList ? Math.round(res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList[1].LoadingAmount) : 0,
                            ProductElementCode : 'GEOGRAPHYTP'
                        }]
    
                        policyCoverage = IsGeographicalExtension == '1' ?  insert(policyCoverage, 1, geoArrOD) : ""
                        policyCoverage = IsGeographicalExtension == '1' ?  insert(policyCoverage, 2, geoArrTP) : ""
                    }

                    this.setState({
                      fulQuoteResp: res.data.PolicyObject,
                      PolicyArray: res.data.PolicyObject.PolicyLobList,
                      error: [],
                      serverResponse: res.data.PolicyObject,policyCoverage
                    //   policyCoverage: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : [],
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
        const { motorInsurance, PolicyArray, sliderVal, add_more_coverage, geographical_extension } = this.state
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        let coverage_data = {}
        let total_idv=0
        let other_idv=0

        let csc_data = localStorage.getItem('users') ? localStorage.getItem('users') : "";
        let csc_user_type = "";
        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";

        if(csc_data && sessionStorage.getItem('csc_id')) {
            let encryption = new Encryption();
            csc_data = JSON.parse(csc_data)        
            csc_data = csc_data.user
            csc_data = JSON.parse(encryption.decrypt(csc_data));           
            csc_user_type = csc_data.type
        }
        else {
            if(bc_data) {
                let encryption = new Encryption();
                bc_data = JSON.parse(encryption.decrypt(bc_data));
            }
        }

        if(add_more_coverage) {
            coverage_data = {
                'B00004' : {'value': values.B00004_value, 'description': values.B00004_description},
                'B00003' : {'value': values.B00003_value, 'description': values.B00003_description},
                'B00005' : {'value': values.B00005_value},
                'B00013' : {'value': values.B00013_value},
                geographical_extension
            }
            if(values.B00004_value){
                other_idv = other_idv + parseInt(values.B00004_value)
            }
            if(values.B00003_value){
                other_idv = other_idv + parseInt(values.B00003_value)
            }
            
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
                'coverage_data': JSON.stringify(coverage_data),
                'puc': values.puc,
                'pa_cover': values.PA_flag ? values.PA_Cover : "0",
                'pa_flag' : values.PA_cover_flag,
                'page_name': `OtherComprehensiveOD/${productId}`
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
                'puc': values.puc,
                'page_name': `OtherComprehensiveOD/${productId}`
            }
        }
        console.log('post_data',post_data)
        total_idv = parseInt(other_idv) + parseInt(post_data.idv_value)+parseInt(post_data.body_idv_value)

        if(((total_idv> 5000000) && csc_user_type == "POSP" ) || (total_idv> 5000000 && bc_data && bc_data.master_data.vendor_name == "PayPoint" )) {
            swal("Quote cannot proceed with IDV greater than 5000000")
            this.props.loadingStop();
            return false
        }

        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('/four-wh-stal/update-insured-value', formData).then(res => {
            this.props.loadingStop();
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt-----resp----- ", decryptResp)
            if (decryptResp.error == false) {
                this.props.history.push(`/Additional_detailsOD/${productId}`);
            }
        })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
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
            if(values == "B00003") {
                setFieldTouched("nonElectric_flag");
                setFieldValue("nonElectric_flag", '1');
                
            }
            if(values == "B00004") {
                setFieldTouched("electric_flag");
                setFieldValue("electric_flag", '1');
            }        
            if(values == "geographical_extension") {
                setFieldTouched("Geographical_flag");
                setFieldValue("Geographical_flag", '1');
            }   
            if(values == "B00005") {
                setFieldTouched("CNG_OD_flag");
                setFieldValue("CNG_OD_flag", '1');
            }
            if(values == "B00013") {
                setFieldTouched("LL_PD_flag");
                setFieldValue("LL_PD_flag", '1');
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
            if(values == "B00003") {
                setFieldTouched("nonElectric_flag");
                setFieldValue("nonElectric_flag", '0');
                
            }
            if(values == "B00004") {
                setFieldTouched("electric_flag");
                setFieldValue("electric_flag", '0');
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
            if(values == "B00005") {
                setFieldTouched("CNG_OD_flag");
                setFieldValue("CNG_OD_flag", '0');
            }
            if(values == "B00013") {
                setFieldTouched("LL_PD_flag");
                setFieldValue("LL_PD_flag", '0');
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

    regnoFormat = (e, setFieldTouched, setFieldValue) => {
    
        let regno = e.target.value        
        e.target.value = regno.toUpperCase()
    
    }


    componentDidMount() {
        this.getMoreCoverage()
    }


    render() {
        const {showCNG, vahanDetails,error, policyCoverage, vahanVerify, selectFlag, fulQuoteResp, PolicyArray, geographical_extension,ncbDiscount,
            moreCoverage, sliderVal, motorInsurance, serverResponse, engine_no, chasis_no, initialValue, add_more_coverage, add_more_coverage_request_array} = this.state
        const {productId} = this.props.match.params 
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        let sliderValue = sliderVal
        let minIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MinIDV_Suggested) : null
        let maxIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MaxIDV_Suggested) : null
        minIDV = minIDV + 1;
        maxIDV = maxIDV - 1;

        let covList = motorInsurance && motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage.split(",") : ""
        let newInnitialArray = {}
        let PA_flag = motorInsurance && (motorInsurance.pa_cover == null || motorInsurance.pa_cover == "") ? '0' : '1'
        let PA_Cover = motorInsurance &&  motorInsurance.pa_cover != null ? motorInsurance.pa_cover : ''
        let Geographical_flag = add_more_coverage && add_more_coverage[add_more_coverage.indexOf("geographical_extension")] ? '1' : '0'
        let CNG_OD_flag = add_more_coverage_request_array.B00005 && add_more_coverage_request_array.B00005.value ? '1' : '0'
        let electric_flag= add_more_coverage_request_array.B00004 && add_more_coverage_request_array.B00004.value ? '1' : '0'
        let nonElectric_flag= add_more_coverage_request_array.B00003 && add_more_coverage_request_array.B00003.value ? '1' : '0'
        let LL_PD_flag= add_more_coverage_request_array.B00013 && add_more_coverage_request_array.B00013.value ? '1' : '0'
        let newInitialValues = {}
        
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : []

        if(selectFlag == '1') {
             newInitialValues = Object.assign(initialValue, {
                registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
                chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : (chasis_no ? chasis_no : ""),
                chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
                add_more_coverage: motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage : "",
                engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : (engine_no ? engine_no : ""),
                vahanVerify: vahanVerify,
                newRegistrationNo: motorInsurance.registration_no ? motorInsurance.registration_no : "",
                B00015: "B00015",
                PA_Cover: "",
                PA_cover_flag: "1",
                PA_flag: '0',
                Geographical_flag: "0",
                CNG_OD_flag: "",
                electric_flag: '0',
                LL_PD_flag: '0',
                nonElectric_flag: '0',
                geographical_extension_length: geographical_extension && geographical_extension.length

            });
        }
        else {
                 newInitialValues = Object.assign(initialValue, {
                    registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
                    chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : (chasis_no ? chasis_no : ""),
                    chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
                    add_more_coverage: motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage : "",
                    engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : (engine_no ? engine_no : ""),
                    vahanVerify: vahanVerify,
                    newRegistrationNo: localStorage.getItem('registration_number') == "NEW" ? localStorage.getItem('registration_number') : "", 
                    PA_flag: '0',
                    PA_Cover: "",
                    PA_cover_flag: motorInsurance && motorInsurance.pa_flag ? motorInsurance.pa_flag : '0',
                    Geographical_flag: "0",
                    CNG_OD_flag: "",
                    electric_flag: '0',
                    nonElectric_flag: '0',
                    LL_PD_flag: '0',
                    geographical_extension_length: geographical_extension && geographical_extension.length
                });
        }

       

        for (var i = 0 ; i < covList.length; i++) {
            newInnitialArray[covList[i]] = covList[i];
        }    
        newInnitialArray.slider= defaultSliderValue
        newInnitialArray.PA_flag = PA_flag   
        newInnitialArray.PA_Cover = PA_Cover
        newInnitialArray.Geographical_flag = Geographical_flag
        newInnitialArray.CNG_OD_flag = CNG_OD_flag
        newInnitialArray.electric_flag = electric_flag
        newInnitialArray.nonElectric_flag = nonElectric_flag
        newInnitialArray.LL_PD_flag = LL_PD_flag

        newInnitialArray.B00013_value = add_more_coverage_request_array.B00013 ? add_more_coverage_request_array.B00013.value : ""
        newInnitialArray.B00004_value = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.value : ""
        newInnitialArray.B00004_description = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.description : ""
        newInnitialArray.B00003_value = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.value : ""
        newInnitialArray.B00003_description = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.description : ""
        newInnitialArray.B00005_value = add_more_coverage_request_array.B00005 ? add_more_coverage_request_array.B00005.value : ""
        newInnitialArray.GeoExtnBangladesh = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnBangladesh")] : ""
        newInnitialArray.GeoExtnBhutan = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnBhutan")] : ""
        newInnitialArray.GeoExtnNepal = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnNepal")] : ""
        newInnitialArray.GeoExtnMaldives = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnMaldives")] : ""
        newInnitialArray.GeoExtnPakistan = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnPakistan")] : ""
        newInnitialArray.GeoExtnSriLanka = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnSriLanka")] : ""

        newInitialValues = Object.assign(initialValue, newInnitialArray );


        let OD_TP_premium = serverResponse.PolicyLobList ? serverResponse.PolicyLobList[0].PolicyRiskList[0] : []

        console.log("policyCoverage--------------- ", policyCoverage)

        const policyCoverageList =  policyCoverage && policyCoverage.length > 0 ?
            policyCoverage.map((coverage, qIndex) => (
                coverage.PolicyBenefitList ? coverage.PolicyBenefitList.map((benefit, bIndex) => (
                    benefit.BeforeVatPremium != 0 ?
                    <div>
                        <Row>
                            <Col sm={12} md={6}>
                                <FormGroup>{Coverage[benefit.ProductElementCode]}</FormGroup>
                            </Col>
                            <Col sm={12} md={6}>
                                <FormGroup>₹ {Math.round(benefit.BeforeVatPremium)}</FormGroup>
                            </Col>
                        </Row>
                    </div> : null
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
                coverage.PolicyBenefitList ? coverage.PolicyBenefitList.map((benefit, bIndex) => (
                    benefit.BeforeVatPremium != 0 ?
                        <tr>
                            <td>{Coverage[benefit.ProductElementCode]}:</td>
                            <td>₹ {Math.round(benefit.BeforeVatPremium)}</td>
                        </tr>  : null
                )) : 
                    <tr>
                        <td>{Coverage[coverage.ProductElementCode]}</td>
                        <td>₹ {Math.round(coverage.BeforeVatPremium)}  </td>                      
                    </tr> 
            )) : null

        // const premiumBreakup = policyCoverage && policyCoverage.length > 0 ?
        //     policyCoverage.map((coverage, qIndex) => {
        //         return(
        //             <Fragment>
        //                 {coverage.ProductElementCode == "C101066" ? 
        //                     coverage.PolicyBenefitList.map((coverage1, qIndex) => {
        //                         return(
        //                                 <tr>
        //                                     <td>{Coverage[coverage1.ProductElementCode]}</td>
        //                                     <td>₹ {Math.round(coverage1.BeforeVatPremium)}  </td>                      

        //                                 </tr>)}) :
        //                     <tr>
        //                         <td>{Coverage[coverage.ProductElementCode]}:</td>
        //                         <td>₹ {Math.round(coverage.BeforeVatPremium)}</td>
        //                     </tr>}
        //             </Fragment>
        //         )   
        //     }) : null
        

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
                {phrases ? 
                <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                        <SideNav />
                    </div>
                <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                <section className="brand colpd m-b-25">
                    <div className="d-flex justify-content-left">
                        <div className="brandhead m-b-10">
                            <h4 className="m-b-30">{phrases['CoversM4WOD']}</h4>
                            <h5>{errMsg}</h5>
                        </div>
                    </div>
                    <Formik initialValues={newInitialValues} 
                    onSubmit={ serverResponse && serverResponse != "" ? (serverResponse.message ? this.fullQuote : this.handleSubmit ) : this.fullQuote} 
                    validationSchema={ComprehensiveValidation}>
                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                    return (
                        <Form>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                                <div className="rghtsideTrigr W-90 m-b-30">
                                    <Collapsible trigger={phrases['DefaultCovered']} >
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
                                    {phrases['RegNo']}
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
                                                disabled = {true}
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
                                                <span className="errorMsg">{phrases[errors.registration_no]}</span>
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
                                                {phrases['ChassisNo']}.
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
                                                        <span className="errorMsg">{phrases[errors.chasis_no_last_part]}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    </Col>

                                    <Col sm={12} md={2} lg={2}>
                                        <FormGroup>
                                        
                                            <Button className="btn btn-primary vrifyBtn" onClick= {!errors.chasis_no_last_part ? this.getVahanDetails.bind(this,values, setFieldTouched, setFieldValue, errors) : null}>{phrases['Verify']}</Button>
                                            {errors.vahanVerify ? (
                                                    <span className="errorMsg">{phrases[errors.vahanVerify]}</span>
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
                                                maxLength="17"
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
                                    name= 'slider'
                                    defaultValue= {defaultSliderValue}
                                    min= {minIDV}
                                    max= {maxIDV}
                                    step= '1'
                                    value={values.slider}
                                    onChange= {(e) =>{
                                    setFieldTouched("slider");
                                    setFieldValue("slider",e.target.value);
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
                                        <span className="fs-18"> {phrases['AddMoreCoverage']}.</span>
                                    </FormGroup>
                                </Col>
                            </Row>
  

                                {moreCoverage && moreCoverage.length > 0 ? moreCoverage.map((coverage, qIndex) => (
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
                                    {values.nonElectric_flag == '1' && values[coverage.code] == 'B00003' ?
                                     <Fragment>
                                        <Col sm={12} md={11} lg={2} key={qIndex+"b"}>
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
                                        <Col sm={12} md={11} lg={2} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="B00004_value"
                                                        type="text"
                                                        placeholder={phrases['ValueOfAccessory']}
                                                        autoComplete="off"
                                                        maxLength="8"
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
                                    {values.CNG_OD_flag == '1' && values[coverage.code] == 'B00005' ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={2} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="B00005_value"
                                                        type="text"
                                                        placeholder="IDV"
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
                                                        <span className="errorMsg">{errors.B00005_value}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        </Fragment> : null
                                    }
                                     {values.LL_PD_flag == '1' && values[coverage.code] == 'B00013' ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={3} key={qIndex+"c"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name='B00013_value'
                                                        component="select"
                                                        autoComplete="off"
                                                        className="formGrp inputfs12"
                                                        value = {values.B00013_value}
                                                        onChange={(e) => {
                                                            setFieldTouched('B00013_value')
                                                            setFieldValue('B00013_value', e.target.value);
                                                            this.handleChange()
                                                        }}
                                                    >
                                                        <option value="">{phrases['NoOfDrivers']}</option>
                                                        {coverage.covarage_value != null && JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                            <option value= {insurer}>{insurer}</option>
                                                        ))} 
                                            
                                                    </Field>
                                                    {errors.B00013_value ? (
                                                        <span className="errorMsg">{phrases[errors.B00013_value]}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        </Fragment> : null
                                    }
                                </Row>
                                )) : null}

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
                                    <Button className={`backBtn`} type="button"  onClick= {this.vehicleDetails.bind(this,productId)}>
                                        {phrases['Back']}
                                    </Button> 

                                        { serverResponse && serverResponse != "" ? (serverResponse.message ? 
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
                                        <div className="rupee"> ₹ {fulQuoteResp.DuePremium}</div>
                                        <div className="text-center">
                                            <Button className={`brkbtn`} type="button" onClick= {this.handleShow}>
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
                </section>
                <Footer />
                </div>
                </div>
                </div> : null }
                </BaseComponent>
                <Modal className="customModal" bsSize="md"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <Modal.Header closeButton className="custmModlHead modalhd">
                        <div className="cntrbody">
                            <h3>{phrases['PremiumBreakup']} </h3>                           
                        </div>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(OtherComprehensiveOD));