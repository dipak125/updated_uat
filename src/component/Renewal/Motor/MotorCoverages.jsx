import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import { Formik, Field, Form, FieldArray } from "formik";
import BaseComponent from '../.././BaseComponent';
import SideNav from '../../common/side-nav/SideNav';
import Footer from '../../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../../shared/axios"
import Encryption from '../../../shared/payload-encryption';
import * as Yup from "yup";
import swal from 'sweetalert';
import moment from "moment";
import queryString from 'query-string';	
import {  validRegistrationNumber } from "../../../shared/validationFunctions";
// GCV Comprehensive copy-----------

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

    puc: Yup.string().required("Please verify pollution certificate to proceed"),

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

    ATC_value: Yup.string().when(['ATC_flag'], {
        is: ATC_flag => ATC_flag == '1',
        then: Yup.string().required('PleaseAdditionalTowingCharges'),
        otherwise: Yup.string()
    }), 
    
    // geographical_extension_value: Yup.string().when(['Geographical_flag'], {
    //     is: Geographical_flag => Geographical_flag == '1',
    //     then: Yup.string().required('Please select Geographical extension'),
    //     otherwise: Yup.string()
    // }),  

    B00070_value: Yup.string().when(['LL_workman_flag'], {
        is: LL_workman_flag => LL_workman_flag == '1',
        then: Yup.string().required('PleaseEnterNoWorkman').matches(/^[0-9]*$/, 'PleaseProvideValidNo'),
        otherwise: Yup.string()
    }),
   
    B00018_value: Yup.string().when(['enhance_PA_OD_flag'], {
        is: enhance_PA_OD_flag => enhance_PA_OD_flag == '1',
        then: Yup.string().required('PleaseProvidePACoverage').test(
                    "isLoanChecking",
                    function() {
                        return "Value16Lto50L"
                    },
                    function (value) {
                        if (parseInt(value) < 1600000 || value > 5000000) {   
                            return false;    
                        }
                        return true;
                    }
                ).matches(/^[0-9]*$/, function() {
                    return "PleaseEnterIDV"
                }),
        otherwise: Yup.string()
    }),
   
    B00069_value: Yup.string().when(['LL_Coolie_flag'], {
        is: LL_Coolie_flag => LL_Coolie_flag == '1',
        then: Yup.string().required('pleaseProvidePerson').matches(/^[0-9]$/, 'PleaseProvideValidNo'),
        otherwise: Yup.string()
    }),
   
    B00012_value: Yup.string().when(['LL_Emp_flag'], {
        is: LL_Emp_flag => LL_Emp_flag == '1',
        then: Yup.string().required('pleaseProvideEmployee').matches(/^[0-9]$/, 'PleaseProvideValidNo'),
        otherwise: Yup.string()
    }),
   
    B00013_value: Yup.string().when(['LL_PD_flag'], {
        is: LL_PD_flag => LL_PD_flag == '1',
        then: Yup.string().required('pleaseProvideDriver'),
        otherwise: Yup.string()
    }),

    B00022_value: Yup.string().when(['hospital_cash_PD_flag'], {
        is: hospital_cash_PD_flag => hospital_cash_PD_flag == '1',
        then: Yup.string().required('This field is required'),
        otherwise: Yup.string()
    }),

    B00020_value: Yup.string().when(['hospital_cash_OD_flag'], {
        is: hospital_cash_OD_flag => hospital_cash_OD_flag == '1',
        then: Yup.string().required('This field is required'),
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

    B00073_value: Yup.string().when(['pa_coolie_flag'], {
        is: pa_coolie_flag => pa_coolie_flag == '1',
        then: Yup.string().required('Please provide PA value').matches(/^[0-9]*$/, 'Please provide valid PA value'),
        otherwise: Yup.string()
    }),

    B00073_description: Yup.string().when(['pa_coolie_flag'], {
        is: pa_coolie_flag => pa_coolie_flag == '1',
        then: Yup.string().required('PleaseProvidePaidDriv').matches(/^[0-9]$/, 'PleaseProvideValidNumber'),
        otherwise: Yup.string()
    }),

    B00007_value: Yup.string().when(['trailer_flag'], {
        is: trailer_flag => trailer_flag == '1',
        then: Yup.string().required('pleaseProvideTrailer').matches(/^[0-9]$/, 'PleaseProvideValidNo'),
        otherwise: Yup.string()
    }),

    B00007_description: Yup.string().when(['trailer_flag'], {
        is: trailer_flag => trailer_flag == '1',
        then: Yup.string().required('pleaseProvideTrailerIDV').matches(/^[0-9]*$/, 'PleaseProvideValidIDV'),
        otherwise: Yup.string()
    }),
    // B00011_value: Yup.string().when(['trailer_flag_TP'], {
    //     is: trailer_flag_TP => trailer_flag_TP == '1',
    //     then: Yup.string().required('Please provide No. of trailer').matches(/^[0-9]$/, 'Please provide valid No.'),
    //     otherwise: Yup.string()
    // }),

    // B00011_description: Yup.string().when(['trailer_flag_TP'], {
    //     is: trailer_flag_TP => trailer_flag_TP == '1',
    //     then: Yup.string().required('Please provide trailer IDV').matches(/^[0-9]*$/, 'Please provide valid IDV'),
    //     otherwise: Yup.string()
    // }),

    // B00007: Yup.string().when(['trailer_flag_TP'], {
    //     is: trailer_flag_TP => trailer_flag_TP == '1',
    //     then: Yup.string().required('Please select Trailer OD'),
    //     otherwise: Yup.string()
    // }),
    // B00011: Yup.string().when(['trailer_flag'], {
    //     is: trailer_flag => trailer_flag == '1',
    //     then:Yup.string().required('Please select Trailer TP'),
    //     otherwise: Yup.string()
    // }),

    B00010: Yup.string().when(['fuel_type'], {
        is: fuel_type => fuel_type == '3' || fuel_type == '4',
        then: Yup.string().test(
            "isLoanChecking",
            function (value) {
                if (value == "" || value == null || value == undefined) {   
                    swal("If Fuel type is CNG/LPG ,then CNG/LPG Kit-Liability cover is mandatory.")
                    return false;    
                }
                return true;
            }) ,
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

    fuel_type: Yup.string().required("Select fuel type"),

    geographical_extension_length: Yup.string().when(['Geographical_flag'], {
        is: Geographical_flag => Geographical_flag == '1',
        then: Yup.string().test(
            "geoExtention",
            function() {
                return "SelectAnyOneCountry"
            },
            function (value) {
                if (value < 1 ) {   
                    return false;    
                }
                return true;
            }) ,
        otherwise: Yup.string()
    }),


    trailer_array: Yup.array().of(
        Yup.object().shape({
            regNo : Yup.string().required('RegistrationNoRequired')
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

            chassisNo : Yup.string().required('ChassisNoIsRequired')
            .matches(/^[a-zA-Z0-9]*$/, function() {
                return "InvalidChassisNo"
            }).min(5, function() {
                return "ChassisNoMin"
            })
            .max(17, function() {
                return "ChassisNoMax"
            })
        })
    ),
   
   
});


const Coverage = {

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
    "700000353":  translation["700000353"],
    "B00073":  translation["B00073"],

    "B00018":  translation["B00018"],
    "B00019":  translation["B00019"],
    "B00020":  translation["B00020"],
    "B00022":  translation["B00022"],   
    "GEOGRAPHYOD":translation["GEOGRAPHYOD"],
    "GEOGRAPHYTP":translation["GEOGRAPHYTP"],

}

class MotorCoverages extends Component {

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
            chasis_price: '',
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
                fuel_type: ""
            },
            request_data: [],
            add_more_coverage_request_array: [],
            bodySliderVal: '',
            fuelList: [],
            vehicleDetails: [],
            no_of_claim: [],
            no_of_Tyreclaim : 2,
            trailer_array: [],
            ncbDiscount:0,
            geographical_extension: [],
	        validation_error: [],
            vehicle_age: "",
            depreciationPercentage: "",
            bodyIdvStatus: 1,
            userIdvStatus:1,
            policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 	
                                queryString.parse(this.props.location.search).access_id : 	
                                localStorage.getItem("policyHolder_refNo")
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
            userIdvStatus: 1,
            bodyIdvStatus: 0,
            serverResponse: [],
            error: []
        })
    }

    bodySliderValue = (value) => {
        this.setState({
            bodySliderVal: value,
            bodyIdvStatus: 1,
            userIdvStatus: 0,
            serverResponse: [],
            error: []
        })
    }

    vehicleDetails = (productId) => {      
        this.props.history.push(`/VehicleDetails_GCV/${productId}`);
    }


    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'
        let encryption = new Encryption();
        axios.get(`renewal/policy-details/${policyHolder_id}`)	
            .then(res => {
                // let decryptResp = JSON.parse(encryption.decrypt(res.data))
                let decryptResp = res.data
                let add_more_coverage = []
                let add_more_coverage_request_array = []
                let temp_additional_coverage_extention = []
                let additional_coverage = []
                let geographical_extension = []
                let trailer_array = []
                let tyre_rim_array = []
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let vehicleRegDate = motorInsurance &&  motorInsurance.registration_date != null ? motorInsurance.registration_date : ''
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {};
                let sliderVal = request_data && request_data.sum_insured ? parseInt(request_data.sum_insured) : ""
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let policyCoverage = decryptResp.data.policyHolder && decryptResp.data.policyHolder.renewalinfo && decryptResp.data.policyHolder.renewalinfo.renewalcoverage ? decryptResp.data.policyHolder.renewalinfo.renewalcoverage : []
                policyCoverage.map((coverage,Index) => {
                    add_more_coverage.push(coverage.cover_type_id)
                    coverage.renewalsubcoverage && coverage.renewalsubcoverage.length > 0 && coverage.renewalsubcoverage.map((benefit, bIndex) => (
                        // benefit.interest_premium && parseInt(benefit.interest_premium) != 0 ? add_more_coverage.push(benefit.interest_id) : null
                        add_more_coverage.push(benefit.interest_id)
                        ))
                })

                add_more_coverage_request_array = decryptResp.data.policyHolder && decryptResp.data.policyHolder.renewalinfo && decryptResp.data.policyHolder.renewalinfo.quote_response ? JSON.parse(decryptResp.data.policyHolder.renewalinfo.quote_response) : []
                add_more_coverage_request_array = add_more_coverage_request_array && add_more_coverage_request_array.policySOABO.insuredSOABOList.policyCtSOABOList
                
                temp_additional_coverage_extention = decryptResp.data.policyHolder && decryptResp.data.policyHolder.renewalinfo && decryptResp.data.policyHolder.renewalinfo.quote_response ? JSON.parse(decryptResp.data.policyHolder.renewalinfo.quote_response) : []
                temp_additional_coverage_extention = temp_additional_coverage_extention && temp_additional_coverage_extention.policySOABO.insuredSOABOList.dynamicObjectList
                temp_additional_coverage_extention.map((geoCoverage,index)=> {
                    if(geoCoverage.bizTableName == "Extention_Country" && geoCoverage.dynamicAttributeVOList && geoCoverage.dynamicAttributeVOList.valueMap 
                    &&(geoCoverage.dynamicAttributeVOList.valueMap.Bangladesh == '1' || geoCoverage.dynamicAttributeVOList.valueMap.Bhutan == '1'
                    || geoCoverage.dynamicAttributeVOList.valueMap.Maldives == '1' || geoCoverage.dynamicAttributeVOList.valueMap.Nepal == '1'
                    || geoCoverage.dynamicAttributeVOList.valueMap.Pakistan == '1' || geoCoverage.dynamicAttributeVOList.valueMap.SriLanka == '1')) {
                        add_more_coverage.push("geographical_extension")
                        if(geoCoverage.dynamicAttributeVOList.valueMap.Bangladesh == '1'){
                            geographical_extension.push("GeoExtnBangladesh")
                        }
                        if(geoCoverage.dynamicAttributeVOList.valueMap.Bhutan == '1'){
                            geographical_extension.push("GeoExtnBhutan")
                        }
                        if(geoCoverage.dynamicAttributeVOList.valueMap.Maldives == '1'){
                            geographical_extension.push("GeoExtnMaldives")
                        }
                        if(geoCoverage.dynamicAttributeVOList.valueMap.Nepal == '1'){
                            geographical_extension.push("GeoExtnNepal")
                        }
                        if(geoCoverage.dynamicAttributeVOList.valueMap.Pakistan == '1'){
                            geographical_extension.push("GeoExtnPakistan")
                        }
                        if(geoCoverage.dynamicAttributeVOList.valueMap.SriLanka == '1'){
                            geographical_extension.push("GeoExtnSriLanka")
                        }
                    }
                })

                temp_additional_coverage_extention.map((moreCoverage,index)=> {
                    if(moreCoverage.bizTableName == "TrailerDetails" && moreCoverage.dynamicAttributeVOList && moreCoverage.dynamicAttributeVOList.valueMap ) {
                        var tempVal={B00007:{
                            value: moreCoverage.dynamicAttributeVOList.valueMap.NoOfTrailers,
                            description: moreCoverage.dynamicAttributeVOList.valueMap.NoOfTrailers
                        }}
                        this.setState({no_of_claim : moreCoverage.dynamicAttributeVOList.valueMap.NoOfTrailers})
                        additional_coverage.push(tempVal) 
                    }
                })

                add_more_coverage_request_array && add_more_coverage_request_array.length>0 && add_more_coverage_request_array.map((value,index) => {   
                    value && value.policyCtAcceSOABOList && value.policyCtAcceSOABOList.length>0 && value.policyCtAcceSOABOList.map((subValue,subIndex)=>{
                        // console.log("subValue-------------- ", subValue)
                        if(subValue.interestId == '700001865') {
                            var tempVal={
                                chassisNo :  subValue.fieldValueMap.TrailerChassisNumbers1_BT ,
                                regNo :  subValue.fieldValueMap.TrailerRegNo_BT
                            }
                            trailer_array.push(tempVal)
                        }
                        if(subValue.interestId == '900000005') {
                            var tempVal={
                                chassisNo :  subValue.fieldValueMap.TrailerChassisNumber_BT ,
                                regNo :  subValue.fieldValueMap.TrailerRegNo_BT
                            }
                            trailer_array.push(tempVal)
                        }
                    })
                }) 

                add_more_coverage_request_array && add_more_coverage_request_array.length>0 && add_more_coverage_request_array.map((value,index) => {   
                    // console.log("subValue-------------- ", subValue)
                    if(value.coverTypeId == '900009555') {
                        var dynamicObjectList = value.dynamicObjectList
                        dynamicObjectList.map((subValue,subIndex) => {
                            if(subValue.bizTableName == "Tyre_Rim_PM_Obj") {
                                subValue.dynamicAttributeVOList.length > 0 && subValue.dynamicAttributeVOList.map((miniSubValue,miniSubIndex) => {
                                    var tempVal={
                                        tyreSerialNo : miniSubValue.valueMap && miniSubValue.valueMap.Tyre_Serial_no_PM,
                                        tyreMfgYr : miniSubValue.valueMap && miniSubValue.valueMap.Tyre_MFG_Year_PM,
                                        vehicleRegDate: vehicleRegDate,
                                        policy_for: this.state.policy_for
                                    }
                                    tyre_rim_array.push(tempVal)
                                })
                            }   
                        })  
                    }
                }) 
                
                this.setState({
                    motorInsurance, request_data, vehicleDetails,policyCoverage,add_more_coverage,add_more_coverage_request_array,geographical_extension,
                    selectFlag: motorInsurance && motorInsurance.add_more_coverage != null ? '0' : '1',sliderVal,additional_coverage,vehicleRegDate,
                     trailer_array,tyre_rim_array

                })
                this.props.loadingStop();
                // this.getAccessToken(values)
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

  
      getFuelList = (values) => {
        this.props.loadingStart();
        axios
          .get(`/fuel-list`)
          .then((res) => {
            //   console.log("fuel list--------- ", res.data)
            this.setState({
              fuelList: res.data.data.fuellist,
            });
            this.fetchData()
          })
          .catch((err) => {
            this.setState({
                fuelList: [],
            });
            this.props.loadingStop();
          });
      };

    getMoreCoverage = () => {
        this.props.loadingStart();
        let encryption = new Encryption();
        axios
          .get(`gcv/coverage-list/${localStorage.getItem('policyHolder_id')}`)
          .then((res) => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            let moreCoverage = decryptResp.data
            console.log("decryptResp--getMoreCoverage-- ", moreCoverage)

            this.setState({
            moreCoverage: moreCoverage
            });
            this.getFuelList()
          })
          .catch((err) => {
            let decryptResp = JSON.parse(encryption.decrypt(err.data))
            console.log("decryptERR--getMoreCoverage-- ", decryptResp)
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

    handleSubmit = () => {
        this.props.history.push(`/MotorSummery`);     
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

    
    handleNoOfClaims = (values, value) => {
        var claimLnt = values.trailer_array.length
        if(values.trailer_array.length > value) {
            for(var i = claimLnt ; i >= value ; i--) {
                    values.trailer_array.splice(i,1)
            }
        }
        else if(values.trailer_array.length < value) {
            for(var i = values.trailer_array.length ; i < value ; i++) {
                values.trailer_array.push(
                        {
                        chassisNo : "",
                        regNo : ""
                    } )
            }
        }
    this.setState({no_of_claim : value, serverResponse: [], error: [] }) 

    }


    initClaimDetailsList = () => {
        let innicialClaimList = []
        const {trailer_array} = this.state
            for (var i = 0; i < this.state.no_of_claim ; i++) {
                innicialClaimList.push(
                    {
                        chassisNo :  trailer_array && trailer_array[i] && trailer_array[i].chassisNo ? trailer_array[i].chassisNo : "",
                        regNo :  trailer_array && trailer_array[i] && trailer_array[i].regNo ? trailer_array[i].regNo : ""
                    }
                )
            }   

    return innicialClaimList
    
    };

    initTyreClaimDetailsList = () => {
        let innicialClaimList = []
        const {tyre_rim_array,vehicleRegDate, policy_for} = this.state
        if(tyre_rim_array && tyre_rim_array.length > 0) {
            for (var i = 0; i < this.state.no_of_Tyreclaim ; i++) {
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
    }
            


    handleClaims = (values, errors, touched, setFieldTouched, setFieldValue) => {
        let field_array = []        
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : []
        
        for (var i = 0; i < values.B00007_value ; i++) {
            field_array.push(
                <Col sm={12} md={12} lg={12}>
                    <Row >
                        <Col sm={1} md={1} lg={1}><span className="indexing"> {i+1} </span></Col>
                        <Col sm={12} md={5} lg={4}>
                            <FormGroup>
                                <div className="formSection">
                                <Field
                                        name={`trailer_array[${i}].regNo`}
                                        type="text"
                                        placeholder="Registration No"
                                        autoComplete="off"
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        onInput={e=>{
                                            this.regnoFormat(e, setFieldTouched, setFieldValue)
                                        }} 
                                        // value = {values[`trailer_array[${i}].chassisNo`]}

                                    />
                                    {errors.trailer_array && errors.trailer_array[i] && errors.trailer_array[i].regNo ? (
                                    <span className="errorMsg">{errors.trailer_array[i].regNo}</span>
                                    ) : null}    
                                </div>
                            </FormGroup>
                        </Col>
                        <Col sm={12} md={5} lg={4}>
                            <FormGroup>
                                <div className="formSection">
                                    <Field
                                        name={`trailer_array[${i}].chassisNo`}
                                        type="text"
                                        placeholder="Chassis No"
                                        autoComplete="off"
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        // value = {values[`trailer_array[${i}].chassisNo`]}

                                    />
                                    {errors.trailer_array && errors.trailer_array[i] && errors.trailer_array[i].chassisNo ? (
                                    <span className="errorMsg">{phrases[errors.trailer_array[i].chassisNo]}</span>
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

    handleTyreClaims = (values, errors, touched, setFieldTouched, setFieldValue) => {
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
        this.getMoreCoverage()
    }


    render() {
        const {add_more_coverage, additional_coverage, request_data,error, policyCoverage, vahanVerify, selectFlag, fulQuoteResp, PolicyArray, fuelList, depreciationPercentage, vehicleDetails, geographical_extension,
            moreCoverage, sliderVal, bodySliderVal, motorInsurance, serverResponse, engine_no, chasis_no, initialValue, add_more_coverage_request_array,ncbDiscount} = this.state
        const {productId} = this.props.match.params 
        let vehicletype_id = vehicleDetails ? vehicleDetails.vehicletype_id : ""
        let defaultSliderValue = sliderVal
        let min_IDV_suggested = PolicyArray.length > 0 ? PolicyArray[0].PolicyRiskList[0].MinIDV_Suggested : 0
        let max_IDV_suggested = PolicyArray.length > 0 ? PolicyArray[0].PolicyRiskList[0].MaxIDV_Suggested : 0
        let minIDV = min_IDV_suggested
        let maxIDV = PolicyArray.length > 0 ? Math.floor(max_IDV_suggested) : null
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : []

        if(Number.isInteger(min_IDV_suggested) == false ) {
            minIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MinIDV_Suggested) : null           
            minIDV = minIDV + 1;
            // maxIDV = maxIDV - 1;
        }
        let maxBodyVal =  PolicyArray.length > 0 ? (PolicyArray[0].PolicyRiskList[0].MSP - (PolicyArray[0].PolicyRiskList[0].MSP * (depreciationPercentage/100))) : 0
        
        let minBodyIDV = 0
        let maxBodyIDV = PolicyArray.length > 0 ? Math.floor(maxBodyVal/2) : 0
        //let defaultBodySliderValue =  motorInsurance && motorInsurance.body_idv_value ? Math.round(motorInsurance.body_idv_value) : 0
        let defaultBodySliderValue = bodySliderVal

        let covList = add_more_coverage ? add_more_coverage.toString() : ""
        covList = covList ? covList.split(",") : ""
        
        let newInnitialArray = {}
        let fuel_type = vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fueltype  ? vehicleDetails.varientmodel.fueltype.id : ""

        let trailer_flag= add_more_coverage.indexOf("700001865") > 0 || add_more_coverage.indexOf("900000005") > 0 ? '1' : '0' 
        let tyre_cover_flag = add_more_coverage.indexOf("900009555") > 0 ? '1' : '0' 
        let pa_coolie_flag= add_more_coverage.indexOf("900001147") > 0 ? '1' : '0'
        let electric_flag= add_more_coverage.indexOf("700001865") > 0  || add_more_coverage.indexOf("700000342") > 0 || add_more_coverage.indexOf("900000002") > 0  ? '1' : '0'
        let nonElectric_flag= add_more_coverage.indexOf("700001862") > 0 || add_more_coverage.indexOf("700000341") > 0 || add_more_coverage.indexOf("900000001") > 0  ? '1' : '0'  
        let hospital_cash_OD_flag= add_more_coverage_request_array.B00020 && add_more_coverage_request_array.B00020.value ? '1' : '0'
        let hospital_cash_PD_flag= add_more_coverage_request_array.B00022 && add_more_coverage_request_array.B00022.value ? '1' : '0'
        let LL_PD_flag= add_more_coverage.indexOf("700000351") > 0 || add_more_coverage.indexOf("900000687") > 0 || add_more_coverage.indexOf("900000743") > 0 ? '1' : '0' 
        let LL_Emp_flag= add_more_coverage.indexOf("900000688") > 0 || add_more_coverage.indexOf("900000742") > 0 ? '1' : '0'
        let LL_Coolie_flag= add_more_coverage_request_array.B00069 && add_more_coverage_request_array.B00069.value ? '1' : '0'
        let enhance_PA_OD_flag= add_more_coverage_request_array.B00018 && add_more_coverage_request_array.B00018.value ? '1' : '0'
        let ATC_flag= add_more_coverage_request_array.ATC && add_more_coverage_request_array.ATC.value ? '1' : '0'
        let LL_workman_flag= add_more_coverage_request_array.B00070 && add_more_coverage_request_array.B00070.value ? '1' : '0'
        let trailer_flag_TP = add_more_coverage_request_array.B00011 && add_more_coverage_request_array.B00011.value ? '1' : '0'
        let CNG_OD_flag = add_more_coverage_request_array.B00005 && add_more_coverage_request_array.B00005.value ? '1' : '0'
        let Geographical_flag = add_more_coverage && add_more_coverage[add_more_coverage.indexOf("geographical_extension")] ? '1' : '0' 
   
        let newInitialValues = {}

        if(selectFlag == '1') {
             newInitialValues = Object.assign(initialValue, {
                registration_no: motorInsurance.registration_no ? motorInsurance.registration_no.replace(/ /g,'') : "",
                chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : (chasis_no ? chasis_no : ""),
                chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
                // add_more_coverage: motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage : "",
                add_more_coverage: add_more_coverage ? add_more_coverage : "",
                engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : (engine_no ? engine_no : ""),
                vahanVerify: vahanVerify,
                newRegistrationNo: localStorage.getItem('registration_number') == "NEW" ? localStorage.getItem('registration_number') : "",
                // 700000353: motorInsurance && motorInsurance.policy_for == '2' ? "" : "700000353",
                // B00005 : vehicleDetails && vehicleDetails.varientmodel && (vehicleDetails.varientmodel.fueltype.id == 8 || vehicleDetails.varientmodel.fueltype.id == 9) ? "B00005" : "",
                B00006 : vehicleDetails && vehicleDetails.varientmodel && (vehicleDetails.varientmodel.fueltype.id == 3 || vehicleDetails.varientmodel.fueltype.id == 4) ? "B00006" : "",
                B00010 : vehicleDetails && vehicleDetails.varientmodel && (vehicleDetails.varientmodel.fueltype.id == 3 || vehicleDetails.varientmodel.fueltype.id == 4) ? "B00010" : "",               
                PA_cover_flag: add_more_coverage.indexOf("700000452") > 0 || add_more_coverage.indexOf("700000353") > 0 || add_more_coverage.indexOf("900000695") > 0 || add_more_coverage.indexOf("900000750") > 0 ? '1' : '0',
                PA_flag: add_more_coverage.indexOf("700000453") > 0 || add_more_coverage.indexOf("700000354") > 0 || add_more_coverage.indexOf("700000941") > 0 ? '1' : '0',
                trailer_flag: '0',
                pa_coolie_flag: '0',
                electric_flag: '0',
                nonElectric_flag: '0',
                hospital_cash_OD_flag: '0',
                hospital_cash_PD_flag: '0',
                LL_PD_flag: '0',
                LL_Emp_flag: '0',
                LL_Coolie_flag: '0',
                enhance_PA_OD_flag: '0',
                ATC_flag: '0',
                LL_workman_flag: '0',
                fuel_type: fuel_type,
                trailer_flag_TP: '0',
                trailer_array:  this.initClaimDetailsList(),
                tyre_rim_array:  this.initTyreClaimDetailsList(),
                Geographical_flag: "0",
                geographical_extension_length: geographical_extension && geographical_extension.length

            });
        }
        else {
                 newInitialValues = Object.assign(initialValue, {
                    registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
                    chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : (chasis_no ? chasis_no : ""),
                    chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
                    // add_more_coverage: motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage : "",
                    add_more_coverage: add_more_coverage ? add_more_coverage : "",
                    engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : (engine_no ? engine_no : ""),
                    vahanVerify: vahanVerify,
                    newRegistrationNo: localStorage.getItem('registration_number') == "NEW" ? localStorage.getItem('registration_number') : "", 
                    PA_flag: add_more_coverage.indexOf("700000453") > 0 || add_more_coverage.indexOf("700000354") > 0 || add_more_coverage.indexOf("700000941") > 0 ? '1' : '0',
                    PA_cover_flag: add_more_coverage.indexOf("700000452") > 0 || add_more_coverage.indexOf("700000353") > 0 || add_more_coverage.indexOf("900000695") > 0 || add_more_coverage.indexOf("900000750") > 0 ? '1' : '0',
                    trailer_flag: '0',
                    pa_coolie_flag: '0',
                    electric_flag: '0',
                    nonElectric_flag: '0',
                    hospital_cash_OD_flag: '0',
                    hospital_cash_PD_flag: '0',
                    LL_PD_flag: '0',
                    LL_Emp_flag: '0',
                    LL_Coolie_flag: '0',
                    enhance_PA_OD_flag: '0',
                    ATC_flag: '0',
                    LL_workman_flag: '0',
                    fuel_type: fuel_type,
                    trailer_flag_TP: '0',
                    // 700000353 : "",
                    // B00005 : "",
                    B00010 : "",
                    trailer_array:  this.initClaimDetailsList(),
                    tyre_rim_array:  this.initTyreClaimDetailsList(),
                    Geographical_flag: "0",
                    geographical_extension_length: geographical_extension && geographical_extension.length
                }
            )}

       
// For setting up updated value from database----------

        for (var i = 0 ; i < covList.length; i++) {
            newInnitialArray[covList[i]] = covList[i];
        }    
        newInnitialArray.slider= defaultSliderValue 
        newInnitialArray.trailer_flag = trailer_flag
        newInnitialArray.tyre_cover_flag = tyre_cover_flag
        newInnitialArray.pa_coolie_flag = pa_coolie_flag
        newInnitialArray.electric_flag = electric_flag
        newInnitialArray.nonElectric_flag = nonElectric_flag
        newInnitialArray.hospital_cash_OD_flag = hospital_cash_OD_flag
        newInnitialArray.hospital_cash_PD_flag = hospital_cash_PD_flag
        newInnitialArray.LL_PD_flag = LL_PD_flag
        newInnitialArray.LL_Emp_flag = LL_Emp_flag
        newInnitialArray.LL_Coolie_flag = LL_Coolie_flag
        newInnitialArray.enhance_PA_OD_flag = enhance_PA_OD_flag
        newInnitialArray.ATC_flag = ATC_flag
        newInnitialArray.LL_workman_flag = LL_workman_flag   
        newInnitialArray.trailer_flag_TP = trailer_flag_TP
        newInnitialArray.CNG_OD_flag = CNG_OD_flag
        newInnitialArray.Geographical_flag = Geographical_flag

        newInnitialArray.ATC_value = add_more_coverage_request_array.ATC ? add_more_coverage_request_array.ATC.value : ""
        newInnitialArray.B00018_value = add_more_coverage_request_array.B00018 ? add_more_coverage_request_array.B00018.value : ""
        newInnitialArray.B00069_value = add_more_coverage_request_array.B00069 ? add_more_coverage_request_array.B00069.value : ""
        newInnitialArray.B00022_value = add_more_coverage_request_array.B00022 ? add_more_coverage_request_array.B00022.value : ""
        newInnitialArray.B00020_value = add_more_coverage_request_array.B00020 ? add_more_coverage_request_array.B00020.value : ""
        newInnitialArray.B00070_value = add_more_coverage_request_array.B00070 ? add_more_coverage_request_array.B00070.value : ""    
        newInnitialArray.B00005_value = add_more_coverage_request_array.B00005 ? add_more_coverage_request_array.B00005.value : ""

        newInnitialArray.GeoExtnBangladesh = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnBangladesh")] : ""
        newInnitialArray.GeoExtnBhutan = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnBhutan")] : ""
        newInnitialArray.GeoExtnNepal = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnNepal")] : ""
        newInnitialArray.GeoExtnMaldives = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnMaldives")] : ""
        newInnitialArray.GeoExtnPakistan = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnPakistan")] : ""
        newInnitialArray.GeoExtnSriLanka = geographical_extension ? geographical_extension[geographical_extension.indexOf("GeoExtnSriLanka")] : ""
        
        // built array of insuredSOABOList=>policyCtSOABOList
        add_more_coverage_request_array && add_more_coverage_request_array.length>0 && add_more_coverage_request_array.map((value,index) => {   
            if(value && value.policyCtAcceSOABOList && value.policyCtAcceSOABOList.length>0 ){ 
                value.policyCtAcceSOABOList.map((subValue,subIndex)=>{
                    // console.log("subValue-------------- ", subValue)
                    if(subValue.interestId == '700000351') {
                        newInnitialArray['B00013_value'] = subValue.fieldValueMap.NoofPaidDrivers_BT
                    }
                    if(subValue.interestId == '900000687' || subValue.interestId == '900000743' ) {
                        newInnitialArray['B00013_value'] = subValue.fieldValueMap.NoOfPersons
                    }
                    if(subValue.interestId == '900000688' || subValue.interestId == '900000742') {
                        newInnitialArray['B00012_value'] = subValue.fieldValueMap.NoOfPersons
                    }
                    if(subValue.interestId == '700001865' || subValue.interestId == '900000005') {
                        newInnitialArray['B00007_description'] = subValue.calTotoalSumInsured
                    }

                    if(subValue.interestId == '700001862') {
                        newInnitialArray['B00004_value'] = subValue.calTotoalSumInsured
                        newInnitialArray['B00004_description'] = subValue.fieldValueMap.AccessoryDescripton1_BT
                    }
                    if(subValue.interestId == '700000342') {
                        newInnitialArray['B00004_value'] = subValue.calTotoalSumInsured
                        newInnitialArray['B00004_description'] = subValue.fieldValueMap.AccessoryDescripton3_BT
                    }
                    if( subValue.interestId == '900000002') {
                        newInnitialArray['B00004_value'] = subValue.calTotoalSumInsured
                        newInnitialArray['B00004_description'] = subValue.fieldValueMap.AccessoryDescripton2_BT
                    }
                    
                    if(subValue.interestId == '700001861' ) {
                        newInnitialArray['B00003_value'] = subValue.calTotoalSumInsured
                        newInnitialArray['B00003_description'] = subValue.fieldValueMap.AccessoryDescripton1_BT
                    }
                    if( subValue.interestId == '900000001') {
                        newInnitialArray['B00003_value'] = subValue.calTotoalSumInsured
                        newInnitialArray['B00003_description'] = subValue.fieldValueMap.AccessoryDescripton2_BT
                    }
                    if(subValue.interestId == '700000341' ) {
                        newInnitialArray['B00003_value'] = subValue.calTotoalSumInsured
                        newInnitialArray['B00003_description'] = subValue.fieldValueMap.AccessoryDescripton3_BT
                    }        

                    if(subValue.interestId == '900001147') {
                        newInnitialArray['B00073_value'] = subValue.fieldValueMap.SumInsured_BT
                        newInnitialArray['B00073_description'] = subValue.fieldValueMap.No_of_Cleaner_conductor_coolie
                    }
                    if(subValue.interestId == '900000695' || subValue.interestId == '700000353' || subValue.interestId == '700000452' ) {
                        newInnitialArray['PA_Cover_OD'] = subValue.totoalSumInsured
                    }
                    if(subValue.interestId == '700000453' || subValue.interestId == '700000354' || subValue.interestId == '700000941' ) { 
                        newInnitialArray['PA_Cover'] = subValue.fieldValueMap.SumInsured_BT
                    }


                })     
            } 
            else if(value.hasOwnProperty("policyCtAcceSOABOList")) {
                if(value.policyCtAcceSOABOList.interestId == '700000452' || value.policyCtAcceSOABOList.interestId == '700000353' || value.policyCtAcceSOABOList.interestId == '900000750') {
                    newInnitialArray['PA_Cover_OD'] =  value.policyCtAcceSOABOList.calTotoalSumInsured
                }
            }
            else {
                
            }
        })   

        // built array of insuredSOABOList=>dynamicObjectList=>dynamicAttributeVOList
        additional_coverage && additional_coverage.length>0 && additional_coverage.map((value,index) => {   
            if(value.B00007) {
                newInnitialArray['B00007_value'] = value.B00007.value
            }
                   
        }) 

        newInitialValues = Object.assign(initialValue, newInnitialArray );

// -------------------------------------------------------
        let OD_TP_premium = serverResponse.PolicyLobList ? serverResponse.PolicyLobList[0].PolicyRiskList[0] : []
        let TRAILOR_OD_PREMIUM = 0

        let productCount = 1;
        let ncbCount = 1;

        const policyCoverageList =  policyCoverage && policyCoverage.length > 0 ?
            policyCoverage.map((coverage, qIndex) => (
                coverage.renewalsubcoverage && coverage.renewalsubcoverage.length > 0 ? coverage.renewalsubcoverage.map((benefit, bIndex) => (
                    // parseInt(benefit.interest_premium) != 0 ?
                    <div>
                        <Row>
                            <Col sm={12} md={6}>
                                <FormGroup>{benefit.interest_name}</FormGroup>
                            </Col>
                            <Col sm={12} md={6}>
                                <FormGroup>₹ {Math.round(benefit.interest_premium)}</FormGroup>
                            </Col>
                        </Row>
                    </div> 
                    // : null
            )) : 
            // parseInt(coverage.annual_premium) != 0 ?
            <div>
                <Row>
                    <Col sm={12} md={6}>
                    <FormGroup>{coverage.cover_name}</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                    <FormGroup>₹ {Math.round(coverage.annual_premium)}  </FormGroup>                      
                    </Col>
                </Row> 
            </div> 
            // : null
        )) : null  

        const premiumBreakup = policyCoverage && policyCoverage.length > 0 ?
        policyCoverage.map((coverage, qIndex) => (
            coverage.renewalsubcoverage && coverage.renewalsubcoverage.length > 0 ? coverage.renewalsubcoverage.map((benefit, bIndex) => (
                    (parseInt(benefit.interest_premium) != 0 ) ?
                    <tr>
                        <td>{benefit.interest_name}:</td>
                        <td>₹ {Math.round(benefit.interest_premium)}</td>
                    </tr> : null                 
            )) : 
                (parseInt(coverage.annual_premium) != 0 ) ?
                <tr>
                    <td>{coverage.cover_name}:</td>
                    <td>₹ {Math.round(coverage.annual_premium)}</td>
                </tr> : null   
        )) : null


        const ncbStr = (ncbDiscount && ncbDiscount!=0 && ncbCount==1) ? <Row><Col sm={12} md={6}>
        <FormGroup>{phrases["NCBDiscount"]}</FormGroup>
        </Col>
        <Col sm={12} md={6} data={ncbCount+=1}>
            <FormGroup>₹ - {Math.round(ncbDiscount)}</FormGroup>
        </Col></Row> : null

        const policyCoveragIMT =  fulQuoteResp && fulQuoteResp.PolicyLobList  && Math.round(fulQuoteResp.PolicyLobList[0].PolicyRiskList[0].imt23prem) > 0 ?
            <div>
                <Row>
                    <Col sm={12} md={6}>
                        <FormGroup>{phrases["IMT"]}</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                        <FormGroup>₹ {Math.round(fulQuoteResp.PolicyLobList[0].PolicyRiskList[0].imt23prem)}</FormGroup>
                    </Col>
                </Row>
            </div>     
         : null 

        productCount=1
        ncbCount=1
        
        const ncbBreakup = (ncbDiscount && ncbDiscount!=0 && ncbCount==1) ? <tr label={ncbCount+=1}>
        <td >{phrases["NCBDiscount"]}:</td>
        <td>₹ - {Math.round(ncbDiscount)}</td>
        </tr> : null

        const premiumBreakupIMT = fulQuoteResp && fulQuoteResp.PolicyLobList  && Math.round(fulQuoteResp.PolicyLobList[0].PolicyRiskList[0].imt23prem) > 0 ?
            <tr>
                <td>{phrases["IMT"]}:</td>
                <td>₹ {Math.round(fulQuoteResp.PolicyLobList[0].PolicyRiskList[0].imt23prem)}</td>
            </tr>  
             : null
        

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
								
                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox ocGcv">
                <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                <section className="brand colpd m-b-25">
                    <div className="d-flex justify-content-left">
                        <div className="brandhead m-b-10">
                            <h4 className="m-b-30">{phrases['GSBVehicleDamage']}</h4>
                            <h5>{errMsg}</h5>
                        </div>
                    </div>
                    <Formik initialValues={newInitialValues} 
                    // onSubmit={ serverResponse && serverResponse != "" ? (serverResponse.message ? this.getAccessToken : this.handleSubmit ) : this.getAccessToken} 
                    onSubmit= {this.handleSubmit}  
                    // validationSchema={ComprehensiveValidation}
                    >
                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                    return (
                        <Form>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                                <div className="rghtsideTrigr W-90 m-b-30">
                                    <Collapsible trigger={phrases['DefaultCovered']} open= {true}>
                                        <div className="listrghtsideTrigr">
                                            {policyCoverageList}
                                            {/* {ncbStr} */}
                                            {policyCoveragIMT}
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
                                                    disabled = {true}
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
                            </Row>

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
                                                disabled = {true}
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
                                                disabled = {true}
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
                            {/* : null} */}

                            <Row>
                                <Col sm={12} md={5} lg={4}>
                                    <FormGroup>
                                        <div className="insurerName">
                                            {phrases['IDV']}
                                        </div>
                                    </FormGroup>
                                </Col>
                                <Col sm={12} md={5} lg={2}>
                                    <FormGroup>
                                        <div className="insurerName">
                                        <Field
                                            name="IDV"
                                            type="text"
                                            placeholder=""
                                            autoComplete="off"
                                            className="premiumslid"
                                            disabled = {true}
                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            value={defaultSliderValue}  
                                        />
                                        {errors.IDV && touched.IDV ? (
                                            <span className="errorMsg">{errors.IDV}</span>
                                        ) : null}
                                        </div>
                                    </FormGroup>
                                </Col>
                                {defaultSliderValue && minIDV && minIDV ? 

                                <Col sm={12} md={12} lg={6}>
                                    <FormGroup>
                                    <input type="range" className="W-90" 
                                    name= 'slider'
                                    min= {minIDV}
                                    max= {maxIDV}
                                    step= '1'
                                    disabled = {(this.state.userIdvStatus == 0)? "disabled" : ""}
                                    value={defaultSliderValue}
                                    disabled = {true}
                                    onChange= {(e) =>{
                                    setFieldTouched("slider");
                                    setFieldValue("slider",e.target.value);
                                    this.sliderValue(e.target.value)
                                }}
                                    />
                                    </FormGroup>
                                </Col>
                                : null}
                            </Row>
                            {vehicletype_id == "11" || vehicletype_id == "8" ?
                                <Row>
                                    <Col sm={12} md={5} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                {phrases['BodyIDV']}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={5} lg={2}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name="body_idv_value"
                                                type="text"
                                                placeholder=""
                                                autoComplete="off"
                                                className="premiumslid"
                                                disabled = {true}
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value={defaultBodySliderValue}  
                                            />
                                            {errors.body_idv_value && touched.body_idv_value ? (
                                                <span className="errorMsg">{errors.body_idv_value}</span>
                                            ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    
                                {defaultBodySliderValue && minBodyIDV && maxBodyIDV ?
                                    <Col sm={12} md={12} lg={6}>
                                        <FormGroup>
                                        <input type="range" className="W-90" 
                                        name= 'slider1'
                                        min= {minBodyIDV}
                                        max= {maxBodyIDV}
                                        step= '1'
                                        disabled = {(this.state.bodyIdvStatus == 0)? "disabled" : ""}
                                        value={defaultBodySliderValue}
                                        disabled = {true}
                                        onChange= {(e) =>{
                                        setFieldTouched("slider1");
                                        setFieldValue("slider1",values.slider1);
                                        this.bodySliderValue(e.target.value)
                                    }}
                                        />
                                        </FormGroup>
                                    </Col>
                                : null }
                                </Row>
                                : null }

                            <Row>
                                <Col sm={12} md={12} lg={12}>
                                    <FormGroup>
                                        <span className="fs-18">{phrases['AddMoreCoverage']}</span>
                                    </FormGroup>
                                </Col>
                            </Row>
                                {errors.B00007 ||  errors.B00011? (
                                        <span className="errorMsg">{errors.B00007} &nbsp; &nbsp;{errors.B00011}</span>
                                    ) : null}

                                {moreCoverage && moreCoverage.length > 0 ? moreCoverage.map((coverage, qIndex) => (
                                <Row key={qIndex}>   
                                    <Col sm={12} md={11} lg={6} key={qIndex+"a"} >
                                        <label className="customCheckBox formGrp formGrp">{coverage.name}
                                            
                                            <Field
                                                type="checkbox"
                                                // name={`moreCov_${qIndex}`}
                                                name={coverage.ebao_code}
                                                value={coverage.ebao_code}
                                                className="user-self"
                                                disabled = {true}
                                                // checked={values.roadsideAssistance ? true : false}
                                                onClick={(e) =>{
                                                    // if( e.target.checked == false && values[coverage.ebao_code] == '700000353') {
                                                    //     swal(phrases.SwalIRDAI)
                                                    // }
                                                    this.onRowSelect(e.target.value, values, e.target.checked, setFieldTouched, setFieldValue)         
                                                }
                                                }
                                                checked = {values[coverage.ebao_code] == coverage.ebao_code && coverage.ebao_code != null? true : false}
                                            />
                                            <span className="checkmark mL-0"></span>
                                            <span className="error-message"></span>
                                        </label>
                                    </Col>
                                    {values.PA_cover_flag == '1' && (values[coverage.ebao_code] == '700000353' || values[coverage.ebao_code] == '900000695' || values[coverage.ebao_code] == '700000452' || values[coverage.ebao_code] == '900000750') ?
                                        <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name='PA_Cover_OD'
                                                        component="select"
                                                        autoComplete="off"
                                                        className="formGrp inputfs12"
                                                        value = {values.PA_Cover_OD}
                                                        disabled = {true}
                                                        onChange={(e) => {
                                                            setFieldTouched('PA_Cover_OD')
                                                            setFieldValue('PA_Cover_OD', e.target.value);
                                                            this.handleChange()
                                                        }}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="1000000">1000000</option>
                                                        <option value="1500000">1500000</option>
                                                       
                                            
                                                    </Field>
                                                    {errors.PA_Cover_OD ? (
                                                        <span className="errorMsg">{errors.PA_Cover_OD}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col> : null
                                    }
                                     {values.trailer_flag == '0' ?
                                        values.trailer_array = [] : null }
                                    {values.trailer_flag == '0' ?
                                        values.B00007_value = "" : null }
                                        
                                     {values.trailer_flag == '1' && (values[coverage.ebao_code] == '700001865' || values[coverage.ebao_code] == '900000005') ?
                                     <Fragment>
                                        <Col sm={12} md={11} lg={2} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name='B00007_value'
                                                        component="select"
                                                        autoComplete="off"
                                                        className="formGrp inputfs12"
                                                        value = {values.B00007_value}
                                                        disabled = {true}
                                                        onChange={(e) => {
                                                            setFieldTouched('B00007_value')
                                                            setFieldValue('B00007_value', e.target.value);
                                                            this.handleNoOfClaims(values, e.target.value)
                                                        }}
                                                    >
                                                        <option value="">{phrases['NoOfTrailer']}</option>
                                                        {JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                                <option key={qIndex} value= {insurer}>{insurer}</option>
                                                            ))}  
                                            
                                                    </Field>
                                                    {errors.B00007_value ? (
                                                        <span className="errorMsg">{phrases[errors.B00007_value]}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        <Col sm={12} md={11} lg={3} key={qIndex+"c"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="B00007_description"
                                                        type="text"
                                                        placeholder={phrases['TrailerIDV']}
                                                        autoComplete="off"
                                                        maxLength="8"
                                                        disabled = {true}
                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                        onChange={(e) => {
                                                            setFieldTouched('B00007_description')
                                                            setFieldValue('B00007_description', e.target.value);
                                                            this.handleChange()
                                                        }}
                                                    >                                     
                                                    </Field>
                                                    {errors.B00007_description ? (
                                                        <span className="errorMsg">{phrases[errors.B00007_description]}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        </Fragment> : null
                                    }

                                    {values.pa_coolie_flag == '1' && values[coverage.ebao_code] == '900001147' ?
                                     <Fragment>
                                        <Col sm={12} md={11} lg={2} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                <Field
                                                        name='B00073_value'
                                                        component="select"
                                                        autoComplete="off"
                                                        className="formGrp inputfs12"
                                                        value = {values.B00073_value}
                                                        disabled = {true}
                                                        onChange={(e) => {
                                                            setFieldTouched('B00073_value')
                                                            setFieldValue('B00073_value', e.target.value);
                                                            this.handleChange()
                                                        }}
                                                    >
                                                        <option value="">{phrases['Select']}</option>
                                                        {JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                                <option value= {insurer}>{insurer}</option>
                                                            ))} 
                                            
                                                    </Field>
                                                    {errors.B00073_value ? (
                                                        <span className="errorMsg">{errors.B00073_value}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        <Col sm={12} md={11} lg={3} key={qIndex+"c"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="B00073_description"
                                                        type="text"
                                                        placeholder={phrases['PaidDrivers']}
                                                        autoComplete="off"
                                                        maxLength="1"
                                                        disabled = {true}
                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                        onChange={(e) => {
                                                            setFieldTouched('B00073_description')
                                                            setFieldValue('B00073_description', e.target.value);
                                                            this.handleChange()
                                                        }}
                                                    >                                     
                                                    </Field>
                                                    {errors.B00073_description ? (
                                                        <span className="errorMsg">{phrases[errors.B00073_description]}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col> </Fragment> : null
                                    }
                                    {values.nonElectric_flag == '1' && (values[coverage.ebao_code] == '700001861' || values[coverage.ebao_code] == '700000341' || values[coverage.ebao_code] == '900000001') ?
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
                                                        disabled = {true}
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
                                                        disabled = {true}
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
                                    {values.electric_flag == '1' && (values[coverage.ebao_code] == '700001862' || values[coverage.ebao_code] == '700000342' || values[coverage.ebao_code] == '900000002') ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={2} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="B00004_value"
                                                        type="text"
                                                        placeholder={phrases['ValueOfAccessory']}
                                                        autoComplete="off"
                                                        maxLength="7"
                                                        disabled = {true}
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
                                                        disabled = {true}
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
                                    {values.CNG_OD_flag == '1' && values[coverage.ebao_code] == '700001863' ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={2} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="B00005_value"
                                                        type="text"
                                                        placeholder="Sum insured"
                                                        autoComplete="off"
                                                        maxLength="7"
                                                        disabled = {true}
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
                                    {values.hospital_cash_OD_flag == '1' && values[coverage.ebao_code] == 'B00020' ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={2} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name='B00020_value'
                                                        component="select"
                                                        autoComplete="off"
                                                        disabled = {true}
                                                        className="formGrp inputfs12"
                                                        value = {values.B00020_value}
                                                        onChange={(e) => {
                                                            setFieldTouched('B00020_value')
                                                            setFieldValue('B00020_value', e.target.value);
                                                            this.handleChange()
                                                        }}
                                                    >
                                                        <option value="">{phrases['Select']}</option>
                                                        {coverage.covarage_value != null && JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                            <option value= {insurer}>{insurer}</option>
                                                        ))} 
                                            
                                                    </Field>
                                                    {errors.B00020_value ? (
                                                        <span className="errorMsg">{errors.B00020_value}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        </Fragment> : null
                                    }
                                    {values.hospital_cash_PD_flag == '1' && values[coverage.ebao_code] == 'B00022' ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={2} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name='B00022_value'
                                                        component="select"
                                                        autoComplete="off"
                                                        disabled = {true}
                                                        className="formGrp inputfs12"
                                                        value = {values.B00022_value}
                                                        onChange={(e) => {
                                                            setFieldTouched('B00022_value')
                                                            setFieldValue('B00022_value', e.target.value);
                                                            this.handleChange()
                                                        }}
                                                    >
                                                        <option value="">{phrases['Select']}</option>
                                                        {coverage.covarage_value != null && JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                            <option value= {insurer}>{insurer}</option>
                                                        ))}  
                                            
                                                    </Field>
                                                    {errors.B00022_value ? (
                                                        <span className="errorMsg">{errors.B00022_value}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        </Fragment> : null
                                    }
                                    {values.LL_PD_flag == '1' && (values[coverage.ebao_code] == '700000351' || values[coverage.ebao_code] == '900000687' || values[coverage.ebao_code] == '900000743') ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={4} key={qIndex+"c"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name='B00013_value'
                                                        component="select"
                                                        autoComplete="off"
                                                        disabled = {true}
                                                        className="formGrp inputfs12"
                                                        value = {values['B00013_value']}
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
                                                    {errors['B00013_value'] ? (
                                                        <span className="errorMsg">{phrases[errors['B00013_value']]}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        </Fragment> : null
                                    }

                                    {values.LL_Emp_flag == '1' && (values[coverage.ebao_code] == '900000688' || values[coverage.ebao_code] == '900000742') ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={4} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                <Field
                                                    name="B00012_value"
                                                    type="text"
                                                    placeholder={phrases['NoOfEmployees']}
                                                    autoComplete="off"
                                                    maxLength="1"
                                                    disabled = {true}
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    onChange={(e) => {
                                                        setFieldTouched('B00012_value')
                                                        setFieldValue('B00012_value', e.target.value);
                                                        this.handleChange()
                                                    }}
                                                    >                                     
                                                    </Field>
                                                    {errors.B00012_value ? (
                                                        <span className="errorMsg">{phrases[errors.B00012_value]}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        </Fragment> : null
                                    }
                                    {values.LL_Coolie_flag == '1' && values[coverage.ebao_code] == 'B00069' ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={2} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                <Field
                                                    name="B00069_value"
                                                    type="text"
                                                    placeholder={phrases['NoOfPerson']}
                                                    autoComplete="off"
                                                    maxLength="1"
                                                    disabled = {true}
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    onChange={(e) => {
                                                        setFieldTouched('B00069_value')
                                                        setFieldValue('B00069_value', e.target.value);
                                                        this.handleChange()
                                                    }}
                                                    >                                     
                                                    </Field>
                                                    {errors.B00069_value ? (
                                                        <span className="errorMsg">{phrases[errors.B00069_value]}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        </Fragment> : null
                                    }
                                     {values.enhance_PA_OD_flag == '1' && values[coverage.ebao_code] == 'B00018' ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                <Field
                                                    name="B00018_value"
                                                    type="text"
                                                    placeholder={phrases['ValueShould']}
                                                    autoComplete="off"
                                                    maxLength="7"
                                                    disabled = {true}
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    onChange={(e) => {
                                                        setFieldTouched('B00018_value')
                                                        setFieldValue('B00018_value', e.target.value);
                                                        this.handleChange()
                                                    }}
                                                    >                                     
                                                    </Field>
                                                    {errors.B00018_value ? (
                                                        <span className="errorMsg">{phrases[errors.B00018_value]}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        </Fragment> : null
                                    }
                                     {values.PA_flag == '1' && (values[coverage.ebao_code] == '700000453' || values[coverage.ebao_code] == '700000354' || values[coverage.ebao_code] == '700000941' ) ?
                                        <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name='PA_Cover'
                                                        component="select"
                                                        autoComplete="off"
                                                        className="formGrp inputfs12"
                                                        value = {values.PA_Cover}
                                                        disabled = {true}
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
                                    {values.LL_workman_flag == '1' && values[coverage.ebao_code] == 'B00070' ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                <Field
                                                    name="B00070_value"
                                                    type="text"
                                                    placeholder={phrases['NoOfWorkman']}
                                                    autoComplete="off"
                                                    maxLength="1"
                                                    disabled = {true}
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    onChange={(e) => {
                                                        setFieldTouched('B00070_value')
                                                        setFieldValue('B00070_value', e.target.value);
                                                        this.handleChange()
                                                    }}
                                                    >                                     
                                                    </Field>
                                                    {errors.B00070_value ? (
                                                        <span className="errorMsg">{phrases[errors.B00070_value]}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        </Fragment> : null
                                    }

                                    {values.ATC_flag == '1' && values[coverage.ebao_code] == 'ATC' ?
                                        <Fragment>
                                        <Col sm={12} md={11} lg={2} key={qIndex+"c"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name='ATC_value'
                                                        component="select"
                                                        autoComplete="off"
                                                        className="formGrp inputfs12"
                                                        disabled = {true}
                                                        value = {values.ATC_value}
                                                        onChange={(e) => {
                                                            setFieldTouched('ATC_value')
                                                            setFieldValue('ATC_value', e.target.value);
                                                            this.handleChange()
                                                        }}
                                                    >
                                                        <option value="">{phrases['Select']}</option>
                                                        {coverage.covarage_value != null && JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                            <option value= {insurer}>{insurer}</option>
                                                        ))} 
                                            
                                                    </Field>
                                                    {errors.ATC_value ? (
                                                        <span className="errorMsg">{phrases[errors.ATC_value]}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                        </Fragment> : null
                                    }

                                     {values.Geographical_flag == '1' && values[coverage.ebao_code] == 'geographical_extension' ?
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
                                                    disabled = {true}
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
                                                    <span className="errorMsg">{phrases[errors.geographical_extension_length]}</span>
                                            ) : null} 
                                        </Col>
                                        </Fragment> : null
                                    }

                                    {values.trailer_flag == '1' && (values[coverage.ebao_code] == '700001865' || values[coverage.ebao_code] == '900000005') && values.B00007_value != "" ?
                                      this.handleClaims(values, errors, touched, setFieldTouched, setFieldValue) : null
                                    }
                                    {values.tyre_cover_flag == '1' && values[coverage.ebao_code] == '900009555' ?
                                        this.handleTyreClaims(values, errors, touched, setFieldTouched, setFieldValue) : null
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
                                                                        disabled = {true}
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
                                                                        disabled = {true}
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
                                        {/* { serverResponse && serverResponse != "" ? (serverResponse.message ? 
                                        <Button className={`proceedBtn`} type="submit"  >
                                            {phrases['Recalculate']}
                                        </Button> : (values.puc == '1' ?  <Button className={`proceedBtn`} type="submit"  >
                                            {phrases['Continue']}
                                        </Button>  : null)) : <Button className={`proceedBtn`} type="submit"  >
                                            {phrases['Recalculate']}
                                        </Button>} */}
                                            <Button className={`proceedBtn`} type="submit"  >
                                            {phrases['Continue']}
                                        </Button>
                                    </div>
                                </Col>

                                <Col sm={12} md={3}>
                                    <div className="justify-content-left regisBox">
                                        <h3 className="premamnt"> {phrases['TPAmount']}</h3>
                                        <div className="rupee"> ₹ {request_data.payable_premium ? parseInt(request_data.payable_premium) : ""}</div>
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
                </div>
				</div>
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
                                    <th>₹ {Math.round(request_data.payable_premium)}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {premiumBreakup}
                            {/* {ncbBreakup} */}
                            {premiumBreakupIMT}
                            
                                <tr>
                                    <td>{phrases["GrossPremium"]}:</td>
                                    <td>₹ {Math.round(request_data.gross_premium)}</td>
                                </tr>
                                <tr>
                                    <td>{phrases["GST"]}:</td>
                                    <td>₹ {Math.round(request_data.service_tax)}</td>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(MotorCoverages));