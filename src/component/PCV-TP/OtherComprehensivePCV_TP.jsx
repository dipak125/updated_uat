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
import { validRegistrationNumber } from "../../shared/validationFunctions";
import {  userTypes } from "../../shared/staticValues";

const menumaster_id = 12
let encryption = new Encryption()
let translation = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : []


const ComprehensiveValidation = Yup.object().shape({
    // is_carloan: Yup.number().required('Please select one option')

    registration_no: Yup.string().when("newRegistrationNo", {
        is: "NEW",
        then: Yup.string(),
        otherwise: Yup.string().required('PleaseProRegNum')
            .test(
                "last4digitcheck",
                function () {
                    return "InvalidRegNumber"
                },
                function (value) {
                    if (value && (value != "" || value != undefined)) {
                        return validRegistrationNumber(value);
                    }
                    return true;
                }
            )
    }),

    puc: Yup.string().required("Please verify pollution certificate to proceed"),

    chasis_no_last_part: Yup.string().required('RequiredField')
        .matches(/^([0-9]*)$/, function () {
            return "InvalidNumber"
        })
        .min(5, function () {
            return "ChasisLastDigit"
        })
        .max(5, function () {
            return "ChasisLastDigit"
        }),

    engine_no: Yup.string().required('EngineRequired')
        .matches(/^[a-zA-Z0-9]*$/, function () {
            return "InvalidEngineNumber"
        })
        .min(5, function () {
            return "EngineMin"
        })
        .max(17, function () {
            return "EngineMax"
        }),

    chasis_no: Yup.string().required('ChasisRequired')
        .matches(/^[a-zA-Z0-9]*$/, function () {
            return "InvalidChasisNumber"
        })
        .min(5, function () {
            return "ChasisMin"
        })
        .max(25, function () {
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

    vahanVerify: Yup.boolean().notRequired('PleaseNumber')
        .test(
            "vahanVerifyChecking",
            function () {
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
        then: Yup.string().required('Please provide PA coverage'),
        otherwise: Yup.string()
    }),

    ATC_value: Yup.string().when(['ATC_flag'], {
        is: ATC_flag => ATC_flag == '1',
        then: Yup.string().required('Please select additional towing charges'),
        otherwise: Yup.string()
    }),

    B00070_value: Yup.string().when(['LL_workman_flag'], {
        is: LL_workman_flag => LL_workman_flag == '1',
        then: Yup.string().required('Please enter No. of workman').matches(/^[0-9]*$/, 'Please provide valid No.'),
        otherwise: Yup.string()
    }),

    B00018_value: Yup.string().when(['enhance_PA_OD_flag'], {
        is: enhance_PA_OD_flag => enhance_PA_OD_flag == '1',
        then: Yup.string().required('Please provide enhance PA coverage').test(
            "isLoanChecking",
            function () {
                return "Value should be 16L to 50L"
            },
            function (value) {
                if (parseInt(value) < 1600000 || value > 5000000) {
                    return false;
                }
                return true;
            }
        ).matches(/^[0-9]*$/, function () {
            return "Please enter valid IDV"
        }),
        otherwise: Yup.string()
    }),

    B00069_value: Yup.string().when(['LL_Coolie_flag'], {
        is: LL_Coolie_flag => LL_Coolie_flag == '1',
        then: Yup.string().required('pleaseProvidePerson').matches(/^[0-9]$/, 'Please provide valid No.'),
        otherwise: Yup.string()
    }),

    B00012_value: Yup.string().when(['LL_Emp_flag'], {
        is: LL_Emp_flag => LL_Emp_flag == '1',
        then: Yup.string().required('pleaseProvideEmployee').matches(/^[0-9]$/, 'Please provide valid No.'),
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
        then: Yup.string().required('pleaseProvideElecIDV').matches(/^[0-9]*$/, 'PleaseProvideValidIDV').max(8, function () {
            return "valueMax8Char"
        }),
        otherwise: Yup.string()
    }),

    B00004_description: Yup.string().when(['electric_flag'], {
        is: electric_flag => electric_flag == '1',
        then: Yup.string().required('pleaseProvideAccessory').matches(/^[a-zA-Z0-9]+[a-zA-Z0-9\s]*$/, 'PleaseValidDescription'),
        otherwise: Yup.string()
    }),

    B00003_value: Yup.string().when(['nonElectric_flag'], {
        is: nonElectric_flag => nonElectric_flag == '1',
        then: Yup.string().required('pleaseProvideNonElecIDV').matches(/^[0-9]*$/, 'PleaseProvideValidIDV').max(8, function () {
            return "valueMax8Char"
        }),
        otherwise: Yup.string()
    }),

    B00003_description: Yup.string().when(['nonElectric_flag'], {
        is: nonElectric_flag => nonElectric_flag == '1',
        then: Yup.string().required('pleaseProvideAccessory').matches(/^[a-zA-Z0-9]+[a-zA-Z0-9\s]*$/, 'PleaseValidDescription'),
        otherwise: Yup.string()
    }),

    B00073_value: Yup.string().when(['pa_coolie_flag'], {
        is: pa_coolie_flag => pa_coolie_flag == '1',
        then: Yup.string().required('Please provide PA value').matches(/^[0-9]*$/, 'Please provide valid PA value'),
        otherwise: Yup.string()
    }),

    B00073_description: Yup.string().when(['pa_coolie_flag'], {
        is: pa_coolie_flag => pa_coolie_flag == '1',
        then: Yup.string().required('Please provide No. of paid driver').matches(/^[0-9]$/, 'Please provide valid number'),
        otherwise: Yup.string()
    }),

    B00007_value: Yup.string().when(['trailer_flag'], {
        is: trailer_flag => trailer_flag == '1',
        then: Yup.string().required('pleaseProvideTrailer').matches(/^[0-9]$/, 'Please provide valid No.'),
        otherwise: Yup.string()
    }),

    B00007_description: Yup.string().when(['trailer_flag'], {
        is: trailer_flag => trailer_flag == '1',
        then: Yup.string().required('pleaseProvideTrailerIDV').matches(/^[0-9]*$/, 'PleaseProvideValidIDV'),
        otherwise: Yup.string()
    }),
    B00011_value: Yup.string().when(['trailer_flag_TP'], {
        is: trailer_flag_TP => trailer_flag_TP == '1',
        then: Yup.string().required('Please provide No. of trailer').matches(/^[0-9]$/, 'Please provide valid No.'),
        otherwise: Yup.string()
    }),

    // B00011_description: Yup.string().when(['trailer_flag_TP'], {
    //     is: trailer_flag_TP => trailer_flag_TP == '1',
    //     then: Yup.string().required('Please provide trailer IDV').matches(/^[0-9]*$/, 'PleaseProvideValidIDV'),
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
            }),
        otherwise: Yup.string()
    }),

    B00005_value: Yup.string().when(['CNG_OD_flag'], {
        is: CNG_OD_flag => CNG_OD_flag == '1',
        then: Yup.string().required('Please provide IDV').test(
            "isLoanChecking",
            function () {
                return "Value should be 1K to 5L"
            },
            function (value) {
                if (parseInt(value) < 1000 || value > 500000) {
                    return false;
                }
                return true;
            }
        ).matches(/^[0-9]*$/, function () {
            return "Please enter valid IDV"
        }),
        otherwise: Yup.string()
    }),

    fuel_type: Yup.string().required("Select fuel type"),

    trailer_array: Yup.array().of(
        Yup.object().shape({
            regNo: Yup.string().required('Please provide registration number')
                .test(
                    "last4digitcheck",
                    function () {
                        return "Invalid Registration number"
                    },
                    function (value) {
                        if (value && (value != "" || value != undefined)) {
                            return validRegistrationNumber(value);
                        }
                        return true;
                    }
                ),

            chassisNo: Yup.string().required('Chassis no is required')
                .matches(/^[0-9a-zA-Z]*$/, function () {
                    return "InvalidChasisNumber"
                }).min(5, function () {
                    return "ChasisMin"
                })
                .max(25, function () {
                    return "ChasisMax"
                })
        })
    ),


});


const Coverage = {

    "B00002": translation["B00002"],
    "B00003": translation["B00003"],
    "B00004": translation["B00004"],
    "B00005": translation["B00005"],
    "B00006": translation["B00006"],
    "B00007": translation["B00007"],
    "B00008": translation["B00008"],
    "B00009": translation["B00009"],
    "B00010": translation["B00010"],
    "B00011": translation["B00011"],
    "B00012": translation["B00012"],
    "B00013": translation["B00013"],
    "B00069": translation["B00069"],
    "B00070": translation["B00070"],
    "B00071": translation["B00071"],
    "B00015": translation["B00015"],
    "B00073": translation["B00073"],

    "B00018": translation["B00018"],
    "B00019": translation["B00019"],
    "B00020": translation["B00020"],
    "B00022": translation["B00022"],
}

class OtherComprehensivePCV_TP extends Component {

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
            add_more_coverage: ['B00015'],
            vahanDetails: [],
            vahanVerify: false,
            policyCoverage: [],
            regno: '',
            length: 14,
            moreCoverage: [],
            engine_no: "",
            chasis_no: "",
            chasiNo: '',
            engineNo: '',
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
            trailer_array: [],
            ncbDiscount: 0,
            validation_error: [],
            vehicle_age: "",
            depreciationPercentage: "",
            bodyIdvStatus: 1,
            userIdvStatus: 1
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

    showCNGText = (value) => {
        if (value == 1) {
            this.setState({
                showCNG: true,
                is_CNG_account: 1,
                serverResponse: [],
                error: []
            })
        }
        else {
            this.setState({
                showCNG: false,
                is_CNG_account: 0,
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
            error: [],
        })
    }


    vehicleDetails = (productId) => {
        this.props.history.push(`/VehicleDetails_PCV_TP/${productId}`);
    }


    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        axios.get(`pcv-tp/policy-holder/details/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt--fetchData-- ", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let previouspolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {}
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {};
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let trailer_array = motorInsurance.trailers && motorInsurance.trailers != null ? motorInsurance.trailers : null
                let registration_date = motorInsurance && motorInsurance.registration_date ? motorInsurance.registration_date : ""
                let previous_end_date = previouspolicy && previouspolicy.end_date ? previouspolicy.end_date : ""
                let valid_previous_policy = motorInsurance ? motorInsurance.valid_previous_policy : "0"
                let policytype_id = motorInsurance ? motorInsurance.policytype_id : ""
                let vehicle_age = 0
                let bodySliderVal = motorInsurance && motorInsurance.body_idv_value ? motorInsurance.body_idv_value : 0
                let sliderVal = motorInsurance && motorInsurance.idv_value ? motorInsurance.idv_value : 0


                if (Math.floor(moment().diff(previous_end_date, 'months', true)) > 1 || valid_previous_policy == "0" || policytype_id == "1") {
                    let val = moment().format("YYYY-MM-DD")
                    vehicle_age = moment(val).diff(registration_date, 'days', true)
                }
                else {
                    vehicle_age = moment(previous_end_date).add(1, 'day').diff(registration_date, 'days', true)
                }
                console.log("vehicle_age---------- ", vehicle_age)

                trailer_array = trailer_array != null ? JSON.parse(trailer_array) : []
                let values = []
                let add_more_coverage = []
                if (vehicleDetails && vehicleDetails.varientmodel && (vehicleDetails.varientmodel.fueltype.id == 8 || vehicleDetails.varientmodel.fueltype.id == 9)) {
                    if (motorInsurance && motorInsurance.policy_for == '1' && motorInsurance.add_more_coverage == null) {
                        // var cov_val = ['B00015', 'B00005']
                        var cov_val = ['B00015']
                        add_more_coverage.push(cov_val);
                    }
                    else if (motorInsurance && motorInsurance.policy_for == '2' && motorInsurance.add_more_coverage == null) {
                        // var cov_val = ['B00005']
                        var cov_val = []
                        add_more_coverage.push(cov_val);
                    }
                    else {
                        var cov_val = motorInsurance.add_more_coverage.split(",")
                        add_more_coverage.push(cov_val);
                    }
                }
                else if (vehicleDetails && vehicleDetails.varientmodel && (vehicleDetails.varientmodel.fueltype.id == 3 || vehicleDetails.varientmodel.fueltype.id == 4)) {
                    if (motorInsurance && motorInsurance.policy_for == '1' && motorInsurance.add_more_coverage == null) {
                        var cov_val = ['B00015', 'B00006', 'B00010']
                        add_more_coverage.push(cov_val);
                    }
                    else if (motorInsurance && motorInsurance.policy_for == '2' && motorInsurance.add_more_coverage == null) {
                        var cov_val = ['B00006', 'B00010']
                        add_more_coverage.push(cov_val);
                    }
                    else {
                        var cov_val = motorInsurance.add_more_coverage.split(",")
                        add_more_coverage.push(cov_val);
                    }
                }
                else {
                    if (motorInsurance && motorInsurance.policy_for == '1' && motorInsurance.add_more_coverage == null) {
                        var cov_val = ['B00015']
                        add_more_coverage.push(cov_val);
                    }
                    else if (motorInsurance && motorInsurance.policy_for == '2' && motorInsurance.add_more_coverage == null) {
                        var cov_val = []
                        add_more_coverage.push(cov_val);
                    }
                    else {
                        var cov_val = motorInsurance.add_more_coverage.split(",")
                        add_more_coverage.push(cov_val);
                    }
                }
                add_more_coverage = add_more_coverage.flat()
                values.PA_flag = motorInsurance && motorInsurance.pa_cover != "" ? '1' : '0'
                values.PA_Cover = motorInsurance && motorInsurance.pa_cover != "" ? motorInsurance.pa_cover : '0'
                let add_more_coverage_request_json = motorInsurance && motorInsurance.add_more_coverage_request_json != null ? motorInsurance.add_more_coverage_request_json : ""

                let add_more_coverage_request_array = add_more_coverage_request_json != "" ? JSON.parse(add_more_coverage_request_json) : []

                values.ATC_value = add_more_coverage_request_array.ATC ? add_more_coverage_request_array.ATC.value : ""
                values.B00018_value = add_more_coverage_request_array.B00018 ? add_more_coverage_request_array.B00018.value : ""
                values.B00069_value = add_more_coverage_request_array.B00069 ? add_more_coverage_request_array.B00069.value : ""
                values.B00012_value = add_more_coverage_request_array.B00012 ? add_more_coverage_request_array.B00012.value : ""
                values.B00013_value = add_more_coverage_request_array.B00013 ? add_more_coverage_request_array.B00013.value : ""
                values.B00022_value = add_more_coverage_request_array.B00022 ? add_more_coverage_request_array.B00022.value : ""
                values.B00020_value = add_more_coverage_request_array.B00020 ? add_more_coverage_request_array.B00020.value : ""
                values.B00004_value = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.value : ""
                values.B00004_description = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.description : ""
                values.B00003_value = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.value : ""
                values.B00003_description = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.description : ""
                values.B00073_value = add_more_coverage_request_array.B00073 ? add_more_coverage_request_array.B00073.value : ""
                values.B00073_description = add_more_coverage_request_array.B00073 ? add_more_coverage_request_array.B00073.description : ""
                values.B00007_value = add_more_coverage_request_array.B00007 ? add_more_coverage_request_array.B00007.value : ""
                values.B00007_description = add_more_coverage_request_array.B00007 ? add_more_coverage_request_array.B00007.description : ""
                values.B00070_value = add_more_coverage_request_array.B00070 ? add_more_coverage_request_array.B00070.value : ""
                values.B00011_value = add_more_coverage_request_array.B00011 ? add_more_coverage_request_array.B00011.value : ""
                // values.B00011_description = add_more_coverage_request_array.B00011 ? add_more_coverage_request_array.B00011.description : ""
                values.trailer_array = trailer_array


                this.setState({
                    motorInsurance, add_more_coverage, request_data, vehicleDetails, bodySliderVal, sliderVal,
                    showCNG: motorInsurance.cng_kit == 1 ? true : false,
                    vahanVerify: motorInsurance.chasis_no && motorInsurance.engine_no ? true : false,
                    selectFlag: motorInsurance && motorInsurance.add_more_coverage != null ? '0' : '1',
                    no_of_claim: add_more_coverage_request_array.B00007 ? add_more_coverage_request_array.B00007.value : "",
                    add_more_coverage_request_array, trailer_array, vehicle_age
                })
                this.props.loadingStop();
                this.fullQuote(values)

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
                let Coverage = []
                let drv = []

                this.setState({
                    moreCoverage: decryptResp.data,
                });
                this.getFuelList()
            })
            .catch((err) => {
                let decryptResp = JSON.parse(encryption.decrypt(err.data))
                this.setState({
                    moreCoverage: [],
                });
                this.props.loadingStop();
            });
    };

    getVahanDetails = async (values, setFieldTouched, setFieldValue, errors) => {

        const formData = new FormData();
        if (values.newRegistrationNo == "NEW") {
            formData.append("regnNo", values.newRegistrationNo);
            setFieldTouched('registration_no');
            setFieldValue('registration_no', values.newRegistrationNo);
        }
        else {
            formData.append("regnNo", values.registration_no);
        }

        formData.append("chasiNo", values.chasis_no_last_part);
        formData.append("policy_holder_id", this.state.request_data.policyholder_id);

        if (errors.registration_no || errors.chasis_no_last_part) {
            swal("Please provide correct Registration number and Chasis number")
        }
        else {
            if (values.newRegistrationNo != "NEW") {
                this.props.loadingStart()
                await axios
                    .post(`/getVahanDetails`, formData)
                    .then((res) => {
                        this.setState({
                            vahanDetails: res.data,
                            vahanVerify: true
                        });
                        if (this.state.vahanDetails.data[0].chasiNo) {
                            this.setState({ chasiNo: this.state.vahanDetails.data[0].chasiNo })
                        }

                        if (this.state.vahanDetails.data[0].engineNo) {
                            this.setState({ engineNo: this.state.vahanDetails.data[0].engineNo })
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
                            vahanVerify: true
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
                    vahanVerify: true
                });

                setFieldTouched('vahanVerify')
                setFieldValue('vahanVerify', true)

                this.props.loadingStop();
            }

        }
    };



    fullQuote = ( values) => {
        const { PolicyArray, sliderVal, add_more_coverage, motorInsurance, bodySliderVal, vehicleDetails, chasis_price, userIdvStatus, bodyIdvStatus } = this.state

        // let cng_kit_flag = 0;
        // let cngKit_Cost = 0;
        // if(values.toString()) {            
        //     cng_kit_flag = values.cng_kit
        //     cngKit_Cost = values.cngKit_Cost
        // }
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_User) : 0
        let defaultBodySliderValue = 0
        let coverage_data = {}
        const formData = new FormData();
        let encryption = new Encryption();

        let total_idv = 0
        let other_idv = 0

        if (add_more_coverage) {
            coverage_data = {
                'B00018': { 'value': values.B00018_value },
                'B00069': { 'value': values.B00069_value },
                'B00012': { 'value': values.B00012_value },
                'B00013': { 'value': values.B00013_value },
                'B00022': { 'value': values.B00022_value },
                'B00020': { 'value': values.B00020_value },
                'ATC': { 'value': values.ATC_value },
                'B00004': { 'value': values.B00004_value, 'description': values.B00004_description },
                'B00003': { 'value': values.B00003_value, 'description': values.B00003_description },
                'B00073': { 'value': values.B00073_value, 'description': values.B00073_description },
                'B00007': { 'value': values.B00007_value, 'description': values.B00007_description },
                'B00011' : {'value': values.B00011_value},
                'B00070': { 'value': values.B00070_value },
                'B00005': { 'value': values.B00005_value }
            }
            if (values.B00004_value) {
                other_idv = other_idv + parseInt(values.B00004_value)
            }
            if (values.B00003_value) {
                other_idv = other_idv + parseInt(values.B00003_value)
            }
        }

        const post_data = {
            'ref_no': localStorage.getItem('policyHolder_refNo'),
            'id': localStorage.getItem('policyHolder_id'),
            'policy_type': motorInsurance.policy_type,
            'add_more_coverage': add_more_coverage.toString(),
            'PA_Cover': values.PA_flag ? values.PA_Cover : "0",
            'coverage_data': JSON.stringify(coverage_data),
            'trailer_array': values.trailer_array,
            'fuel_type': values.fuel_type ? values.fuel_type : (vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fueltype ? vehicleDetails.varientmodel.fueltype.id : ""),
            'idv_value': sliderVal ? sliderVal : 0,          
        }
        console.log('fullQuote_post_data', post_data)
        total_idv = parseInt(other_idv) + parseInt(post_data.idv_value) + parseInt(post_data.body_idv_value)
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));

            if ((total_idv > 5000000) && user_data.user_type == "POSP") {
                swal("Quote cannot proceed with IDV greater than 5000000")
                this.props.loadingStop();
                return false
            }
        }

        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('pcv-tp/full-quote', formData)
            .then(res => {

                if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
                    let PolicyArray = res.data.PolicyObject.PolicyLobList
                    let ncbDiscount = (res.data.PolicyObject.PolicyLobList && res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].IsNCB) ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].OD_NCBAmount : 0
                    this.setState({
                        fulQuoteResp: res.data.PolicyObject,
                        PolicyArray: PolicyArray,
                        chasis_price: res.data.chasis_price,
                        error: [],
                        validation_error: [],
                        userIdvStatus: 1,
                        bodyIdvStatus: 1,
                        sliderVal: res.data.PolicyObject.PolicyLobList ? Math.round(res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].IDV_User) : 0,
                        ncbDiscount,
                        serverResponse: res.data.PolicyObject,
                        policyCoverage: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : [],
                    });
                }
                else if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Fail") {
                    var validationErrors = []
                    for (const x in res.data.UnderwritingResult.MessageList) {
                        validationErrors.push(res.data.UnderwritingResult.MessageList[x].Message)
                    }
                    this.setState({
                        fulQuoteResp: res.data.PolicyObject,
                        error: { "message": 0 },
                        validation_error: validationErrors,
                        serverResponse: [],
                        userIdvStatus: 1,
                        bodyIdvStatus: 1,
                        policyCoverage: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : [],
                    });

                }
                else if (res.data.code && res.data.message && res.data.code == "validation failed" && res.data.message == "validation failed") {
                    var validationErrors = []
                    for (const x in res.data.messages) {
                        validationErrors.push(res.data.messages[x].message)
                    }
                    this.setState({
                        fulQuoteResp: [], add_more_coverage,
                        validation_error: validationErrors,
                        userIdvStatus: 1,
                        bodyIdvStatus: 1,
                        serverResponse: []
                    });
                }
                else {
                    this.setState({
                        fulQuoteResp: [], add_more_coverage,
                        error: res.data,
                        serverResponse: [],
                        userIdvStatus: 1,
                        bodyIdvStatus: 1,
                        validation_error: []
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
        const { motorInsurance, PolicyArray, sliderVal, add_more_coverage, bodySliderVal } = this.state
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_User) : 0
        let defaultBodySliderValue = 0
        let coverage_data = {}


        if (add_more_coverage) {
            coverage_data = {
                'B00018': { 'value': values.B00018_value },
                'B00069': { 'value': values.B00069_value },
                'B00012': { 'value': values.B00012_value },
                'B00013': { 'value': values.B00013_value },
                'B00022': { 'value': values.B00022_value },
                'B00020': { 'value': values.B00020_value },
                'ATC': { 'value': values.ATC_value },
                'B00004': { 'value': values.B00004_value, 'description': values.B00004_description },
                'B00003': { 'value': values.B00003_value, 'description': values.B00003_description },
                'B00073': { 'value': values.B00073_value, 'description': values.B00073_description },
                'B00007': { 'value': values.B00007_value, 'description': values.B00007_description },
                'B00011' : {'value': values.B00011_value},
                'B00070': { 'value': values.B00070_value },
                'B00005': { 'value': values.B00005_value }
            }
        }

        const formData = new FormData();
        let encryption = new Encryption();
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data.user) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));
        }
        let total_idv = 0
        let other_idv = 0
        let post_data = {}
        if (add_more_coverage.length > 0) {
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': menumaster_id,
                'registration_no': values.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'cng_kit': values.cng_kit,
                // 'cngkit_cost': values.cngKit_Cost,
                'engine_no': values.engine_no,
                'idv_value': sliderVal ? sliderVal.toString() : defaultSliderValue.toString(),
                'add_more_coverage': add_more_coverage,
                'puc': values.puc,
                'pa_cover': values.PA_flag ? values.PA_Cover : "0",
                'pa_flag': values.PA_cover_flag,
                'coverage_data': JSON.stringify(coverage_data),
                'body_idv_value': bodySliderVal ? bodySliderVal : defaultBodySliderValue,
                'fuel_type': values.fuel_type,
                'trailer_array': values.trailer_array,
                'page_name': `OtherComprehensive_PCV_TP/${productId}`,
            }
            if (values.B00004_value) {
                other_idv = other_idv + parseInt(values.B00004_value)
            }
            if (values.B00003_value) {
                other_idv = other_idv + parseInt(values.B00003_value)
            }
            total_idv = parseInt(post_data.idv_value) + parseInt(post_data.body_idv_value) + other_idv
        }
        else {
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': menumaster_id,
                'registration_no': values.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'cng_kit': values.cng_kit,
                // 'cngkit_cost': values.cngKit_Cost,
                'engine_no': values.engine_no,
                'idv_value': sliderVal ? sliderVal.toString() : defaultSliderValue.toString(),
                'puc': values.puc,
                'body_idv_value': bodySliderVal ? bodySliderVal : defaultBodySliderValue,
                'fuel_type': values.fuel_type,
                'page_name': `OtherComprehensive_PCV_TP/${productId}`,
            }
            total_idv = parseInt(post_data.idv_value) + parseInt(post_data.body_idv_value)
        }

        console.log('post_data', post_data)

        if (user_data) {
            if(userTypes.includes(user_data.login_type) && add_more_coverage.indexOf('B00015') < 0){
                swal("This cover is mandated by IRDAI, it is compulsory for Owner-Driver to possess a PA cover of minimum Rs 15 Lacs, except in certain conditions. By not choosing this cover, you confirm that you hold an existing PA cover or you do not possess a valid driving license.")
                return false
            }
            else {
                if ((total_idv > 5000000) && user_data.user_type == "POSP") {
                    swal("Quote cannot proceed with IDV greater than 5000000")
                    this.props.loadingStop();
                    return false
                }
                else {
                    formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
                    this.props.loadingStart();
                    axios.post('pcv-tp/update-insured-value', formData).then(res => {
                        this.props.loadingStop();
                        let decryptResp = JSON.parse(encryption.decrypt(res.data))
                        console.log("decrypt--fetchData-- ", decryptResp)
                        if (decryptResp.error == false) {
                            this.props.history.push(`/AdditionalDetails_PCV_TP/${productId}`);
                        }
                        else {
                            swal(decryptResp.msg)
                        }
            
                    })
                    .catch(err => {
                        // handle error
                        let decryptResp = JSON.parse(encryption.decrypt(err.data))
                        console.log("decryptErr--fetchData-- ", decryptResp)
                        this.props.loadingStop();
                    })
                }
            }      
        }      
    }

    onRowSelect = (value, values, isSelect, setFieldTouched, setFieldValue) => {

        const { add_more_coverage } = this.state;
        var drv = [];


        if (isSelect) {
            add_more_coverage.push(value);
            this.setState({
                add_more_coverage: add_more_coverage,
                serverResponse: [],
                error: []
            });
            if (value == "B00016") {
                setFieldTouched("PA_flag");
                setFieldValue("PA_flag", '1');
            }
            if (value == "B00015") {
                setFieldTouched("PA_cover_flag");
                setFieldValue("PA_cover_flag", '1');
            }
            if (value == "B00007") {
                setFieldTouched("trailer_flag");
                setFieldValue("trailer_flag", '1');
            }
            if (value == "B00073") {
                setFieldTouched("pa_coolie_flag");
                setFieldValue("pa_coolie_flag", '1');
            }
            if (value == "B00003") {
                setFieldTouched("nonElectric_flag");
                setFieldValue("nonElectric_flag", '1');

            }
            if (value == "B00004") {
                setFieldTouched("electric_flag");
                setFieldValue("electric_flag", '1');
            }
            if (value == "B00020") {
                setFieldTouched("hospital_cash_OD_flag");
                setFieldValue("hospital_cash_OD_flag", '1');
            }
            if (value == "B00022") {
                setFieldTouched("hospital_cash_PD_flag");
                setFieldValue("hospital_cash_PD_flag", '1');
            }
            if (value == "B00013") {
                setFieldTouched("LL_PD_flag");
                setFieldValue("LL_PD_flag", '1');
            }
            if (value == "B00012") {
                setFieldTouched("LL_Emp_flag");
                setFieldValue("LL_Emp_flag", '1');
            }
            if (value == "B00069") {
                setFieldTouched("LL_Coolie_flag");
                setFieldValue("LL_Coolie_flag", '1');
            }
            if (value == "B00018") {
                setFieldTouched("enhance_PA_OD_flag");
                setFieldValue("enhance_PA_OD_flag", '1');
            }
            if (value == "B00070") {
                setFieldTouched("LL_workman_flag");
                setFieldValue("LL_workman_flag", '1');
            }
            if (value == "ATC") {
                setFieldTouched("ATC_flag");
                setFieldValue("ATC_flag", '1');
            }
            if (value == "B00011") {
                setFieldTouched("trailer_flag_TP");
                setFieldValue("trailer_flag_TP", '1');
            }
            if (value == "B00005") {
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

            if (value == "B00016") {
                setFieldTouched("PA_flag");
                setFieldValue("PA_flag", '0');
                setFieldTouched("PA_Cover");
                setFieldValue("PA_Cover", '');
            }
            if (value == "B00015") {
                setFieldTouched("PA_cover_flag");
                setFieldValue("PA_cover_flag", '0');
            }
            if (value == "B00007") {
                setFieldTouched("trailer_flag");
                setFieldValue("trailer_flag", '0');
            }
            if (value == "B00073") {
                setFieldTouched("pa_coolie_flag");
                setFieldValue("pa_coolie_flag", '0');
            }
            if (value == "B00003") {
                setFieldTouched("nonElectric_flag");
                setFieldValue("nonElectric_flag", '0');

            }
            if (value == "B00004") {
                setFieldTouched("electric_flag");
                setFieldValue("electric_flag", '0');
            }
            if (value == "B00020") {
                setFieldTouched("hospital_cash_OD_flag");
                setFieldValue("hospital_cash_OD_flag", '0');
            }
            if (value == "B00022") {
                setFieldTouched("hospital_cash_PD_flag");
                setFieldValue("hospital_cash_PD_flag", '0');
            }
            if (value == "B00013") {
                setFieldTouched("LL_PD_flag");
                setFieldValue("LL_PD_flag", '0');
            }
            if (value == "B00012") {
                setFieldTouched("LL_Emp_flag");
                setFieldValue("LL_Emp_flag", '0');
            }
            if (value == "B00069") {
                setFieldTouched("LL_Coolie_flag");
                setFieldValue("LL_Coolie_flag", '0');
            }
            if (value == "B00018") {
                setFieldTouched("enhance_PA_OD_flag");
                setFieldValue("enhance_PA_OD_flag", '0');
            }
            if (value == "B00070") {
                setFieldTouched("LL_workman_flag");
                setFieldValue("LL_workman_flag", '0');
            }
            if (value == "ATC") {
                setFieldTouched("ATC_flag");
                setFieldValue("ATC_flag", '0');
            }
            if (value == "B00011") {
                setFieldTouched("trailer_flag_TP");
                setFieldValue("trailer_flag_TP", '0');
            }
            if (value == "B00005") {
                setFieldTouched("CNG_OD_flag");
                setFieldValue("CNG_OD_flag", '0');
            }
        }

    }

    regnoFormat = (e, setFieldTouched, setFieldValue) => {

        let regno = e.target.value
        e.target.value = regno.toUpperCase()
    }


    handleNoOfClaims = (values, value) => {
        var claimLnt = values.trailer_array.length
        if (values.trailer_array.length > value) {
            for (var i = claimLnt; i >= value; i--) {
                values.trailer_array.splice(i, 1)
            }
        }
        else if (values.trailer_array.length < value) {
            for (var i = values.trailer_array.length; i < value; i++) {
                values.trailer_array.push(
                    {
                        chassisNo: "",
                        regNo: ""
                    })
            }
        }
        this.setState({ no_of_claim: value, serverResponse: [], error: [] })

    }


    initClaimDetailsList = () => {
        let innicialClaimList = []
        const { trailer_array } = this.state
        for (var i = 0; i < this.state.no_of_claim; i++) {
            innicialClaimList.push(
                {
                    chassisNo: trailer_array && trailer_array[i] && trailer_array[i].chassisNo ? trailer_array[i].chassisNo : "",
                    regNo: trailer_array && trailer_array[i] && trailer_array[i].regNo ? trailer_array[i].regNo : ""
                }
            )
        }

        return innicialClaimList

    };


    handleClaims = (values, errors, touched, setFieldTouched, setFieldValue, phrases) => {
        let field_array = []

        for (var i = 0; i < values.B00007_value; i++) {
            field_array.push(
                <Col sm={12} md={12} lg={12}>
                    <Row >
                        <Col sm={1} md={1} lg={1}><span className="indexing"> {i + 1} </span></Col>
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
                                        onInput={e => {
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

    componentDidMount() {
        this.getMoreCoverage()
    }


    render() {
        const { showCNG, is_CNG_account, vahanDetails, error, policyCoverage, vahanVerify, selectFlag, fulQuoteResp, PolicyArray, fuelList, depreciationPercentage, vehicleDetails, validation_error,
            moreCoverage, sliderVal, bodySliderVal, motorInsurance, serverResponse, engine_no, chasis_no, initialValue, add_more_coverage_request_array, ncbDiscount } = this.state
        const { productId } = this.props.match.params
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data.user) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));
        }

        //let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_User) : 0
        let defaultSliderValue = sliderVal
        let min_IDV_suggested = PolicyArray.length > 0 ? PolicyArray[0].PolicyRiskList[0].MinIDV_Suggested : 0
        let max_IDV_suggested = PolicyArray.length > 0 ? PolicyArray[0].PolicyRiskList[0].MaxIDV_Suggested : 0
        let minIDV = min_IDV_suggested
        let maxIDV = PolicyArray.length > 0 ? Math.floor(max_IDV_suggested) : null

        if (Number.isInteger(min_IDV_suggested) == false) {
            minIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MinIDV_Suggested) : null
            minIDV = minIDV + 1;
            // maxIDV = maxIDV - 1;
        }
        let maxBodyVal = PolicyArray.length > 0 ? (PolicyArray[0].PolicyRiskList[0].MSP - (PolicyArray[0].PolicyRiskList[0].MSP * (depreciationPercentage / 100))) : 0

        let minBodyIDV = 0
        let maxBodyIDV = PolicyArray.length > 0 ? Math.floor(maxBodyVal / 2) : 0

        //let defaultBodySliderValue =  motorInsurance && motorInsurance.body_idv_value ? Math.round(motorInsurance.body_idv_value) : 0
        let defaultBodySliderValue = bodySliderVal

        let covList = motorInsurance && motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage.split(",") : ""
        let newInnitialArray = {}
        let PA_flag = motorInsurance && (motorInsurance.pa_cover == null || motorInsurance.pa_cover == "") ? '0' : '1'
        let PA_Cover = motorInsurance && motorInsurance.pa_cover != null ? motorInsurance.pa_cover : ''
        let fuel_type = vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fueltype ? vehicleDetails.varientmodel.fueltype.id : ""

        let trailer_flag = add_more_coverage_request_array.B00007 && add_more_coverage_request_array.B00007.value ? '1' : '0'
        let pa_coolie_flag = add_more_coverage_request_array.B00073 && add_more_coverage_request_array.B00073.value ? '1' : '0'
        let electric_flag = add_more_coverage_request_array.B00004 && add_more_coverage_request_array.B00004.value ? '1' : '0'
        let nonElectric_flag = add_more_coverage_request_array.B00003 && add_more_coverage_request_array.B00003.value ? '1' : '0'
        let hospital_cash_OD_flag = add_more_coverage_request_array.B00020 && add_more_coverage_request_array.B00020.value ? '1' : '0'
        let hospital_cash_PD_flag = add_more_coverage_request_array.B00022 && add_more_coverage_request_array.B00022.value ? '1' : '0'
        let LL_PD_flag = add_more_coverage_request_array.B00013 && add_more_coverage_request_array.B00013.value ? '1' : '0'
        let LL_Emp_flag = add_more_coverage_request_array.B00012 && add_more_coverage_request_array.B00012.value ? '1' : '0'
        let LL_Coolie_flag = add_more_coverage_request_array.B00069 && add_more_coverage_request_array.B00069.value ? '1' : '0'
        let enhance_PA_OD_flag = add_more_coverage_request_array.B00018 && add_more_coverage_request_array.B00018.value ? '1' : '0'
        let ATC_flag = add_more_coverage_request_array.ATC && add_more_coverage_request_array.ATC.value ? '1' : '0'
        let LL_workman_flag = add_more_coverage_request_array.B00070 && add_more_coverage_request_array.B00070.value ? '1' : '0'
        let trailer_flag_TP = add_more_coverage_request_array.B00011 && add_more_coverage_request_array.B00011.value ? '1' : '0'
        let CNG_OD_flag = add_more_coverage_request_array.B00005 && add_more_coverage_request_array.B00005.value ? '1' : '0'

        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : []

        let newInitialValues = {}

        if (selectFlag == '1') {
            newInitialValues = Object.assign(initialValue, {
                registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
                chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : (chasis_no ? chasis_no : ""),
                chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
                add_more_coverage: motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage : "",
                engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : (engine_no ? engine_no : ""),
                vahanVerify: vahanVerify,
                newRegistrationNo: localStorage.getItem('registration_number') == "NEW" ? localStorage.getItem('registration_number') : "",
                B00015: motorInsurance && motorInsurance.policy_for == '2' ? "" : "B00015",
                // B00005 : vehicleDetails && vehicleDetails.varientmodel && (vehicleDetails.varientmodel.fueltype.id == 8 || vehicleDetails.varientmodel.fueltype.id == 9) ? "B00005" : "",
                B00006: vehicleDetails && vehicleDetails.varientmodel && (vehicleDetails.varientmodel.fueltype.id == 3 || vehicleDetails.varientmodel.fueltype.id == 4) ? "B00006" : "",
                B00010: vehicleDetails && vehicleDetails.varientmodel && (vehicleDetails.varientmodel.fueltype.id == 3 || vehicleDetails.varientmodel.fueltype.id == 4) ? "B00010" : "",
                PA_Cover: "",
                PA_cover_flag: motorInsurance && motorInsurance.policy_for == '2' ? '0' : '1',
                PA_flag: '0',
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
                trailer_array: this.initClaimDetailsList()

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
                B00015: "",
                // B00005 : "",
                B00010: "",
                trailer_array: this.initClaimDetailsList()
            }
            )
        }


        // For setting up updated value from database----------

        for (var i = 0; i < covList.length; i++) {
            newInnitialArray[covList[i]] = covList[i];
        }
        newInnitialArray.slider = defaultSliderValue
        newInnitialArray.PA_flag = PA_flag
        newInnitialArray.trailer_flag = trailer_flag
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
        newInnitialArray.PA_Cover = PA_Cover
        newInnitialArray.trailer_flag_TP = trailer_flag_TP
        newInnitialArray.CNG_OD_flag = CNG_OD_flag

        newInnitialArray.ATC_value = add_more_coverage_request_array.ATC ? add_more_coverage_request_array.ATC.value : ""
        newInnitialArray.B00018_value = add_more_coverage_request_array.B00018 ? add_more_coverage_request_array.B00018.value : ""
        newInnitialArray.B00069_value = add_more_coverage_request_array.B00069 ? add_more_coverage_request_array.B00069.value : ""
        newInnitialArray.B00012_value = add_more_coverage_request_array.B00012 ? add_more_coverage_request_array.B00012.value : ""
        newInnitialArray.B00013_value = add_more_coverage_request_array.B00013 ? add_more_coverage_request_array.B00013.value : ""
        newInnitialArray.B00022_value = add_more_coverage_request_array.B00022 ? add_more_coverage_request_array.B00022.value : ""
        newInnitialArray.B00020_value = add_more_coverage_request_array.B00020 ? add_more_coverage_request_array.B00020.value : ""
        newInnitialArray.B00004_value = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.value : ""
        newInnitialArray.B00004_description = add_more_coverage_request_array.B00004 ? add_more_coverage_request_array.B00004.description : ""
        newInnitialArray.B00003_value = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.value : ""
        newInnitialArray.B00003_description = add_more_coverage_request_array.B00003 ? add_more_coverage_request_array.B00003.description : ""
        newInnitialArray.B00073_value = add_more_coverage_request_array.B00073 ? add_more_coverage_request_array.B00073.value : ""
        newInnitialArray.B00073_description = add_more_coverage_request_array.B00073 ? add_more_coverage_request_array.B00073.description : ""
        newInnitialArray.B00007_value = add_more_coverage_request_array.B00007 ? add_more_coverage_request_array.B00007.value : ""
        newInnitialArray.B00007_description = add_more_coverage_request_array.B00007 ? add_more_coverage_request_array.B00007.description : ""
        newInnitialArray.B00011_value = add_more_coverage_request_array.B00011 ? add_more_coverage_request_array.B00011.value : ""
        // newInnitialArray.B00011_description = add_more_coverage_request_array.B00011 ? add_more_coverage_request_array.B00011.description : ""
        newInnitialArray.B00070_value = add_more_coverage_request_array.B00070 ? add_more_coverage_request_array.B00070.value : ""
        newInnitialArray.B00005_value = add_more_coverage_request_array.B00005 ? add_more_coverage_request_array.B00005.value : ""
        newInitialValues = Object.assign(initialValue, newInnitialArray);

        // -------------------------------------------------------
        let OD_TP_premium = serverResponse.PolicyLobList ? serverResponse.PolicyLobList[0].PolicyRiskList[0] : []
        let TRAILOR_OD_PREMIUM = 0
        policyCoverage.map((coverage, qIndex) => (
            coverage.PolicyBenefitList && coverage.PolicyBenefitList.map((benefit, bIndex) => (
                benefit.ProductElementCode == 'B00007' ? TRAILOR_OD_PREMIUM += benefit.AnnualPremium : 0
            ))
        ))
        let productCount = 1;
        let ncbCount = 1;
        const policyCoverageList = policyCoverage && policyCoverage.length > 0 ?
            policyCoverage.map((coverage, qIndex) => (
                coverage.PolicyBenefitList && coverage.PolicyBenefitList.map((benefit, bIndex) => (
                    <div key={bIndex}>
                        {(benefit.ProductElementCode != 'B00007') ?
                            <Row><Col sm={12} md={6}>
                                <FormGroup>{Coverage[benefit.ProductElementCode]}</FormGroup>
                            </Col>
                                <Col sm={12} md={6}>
                                    <FormGroup>₹ {Math.round(benefit.AnnualPremium)}</FormGroup>
                                </Col></Row> : (benefit.ProductElementCode == 'B00007' && productCount == 1) ? <Row><Col sm={12} md={6}>
                                    <FormGroup>{Coverage[benefit.ProductElementCode]}</FormGroup>
                                </Col>
                                    <Col sm={12} md={6} data={productCount += 1}>
                                        <FormGroup>₹ {Math.round(TRAILOR_OD_PREMIUM)}</FormGroup>
                                    </Col></Row> : null}
                    </div>
                ))
            )) : null

        const ncbStr = (ncbDiscount && ncbDiscount != 0 && ncbCount == 1) ? <Row><Col sm={12} md={6}>
            <FormGroup>{phrases["NCBDiscount"]}</FormGroup>
        </Col>
            <Col sm={12} md={6} data={ncbCount += 1}>
                <FormGroup>₹ - {Math.round(ncbDiscount)}</FormGroup>
            </Col></Row> : null

        const policyCoveragIMT = fulQuoteResp && fulQuoteResp.PolicyLobList && Math.round(fulQuoteResp.PolicyLobList[0].PolicyRiskList[0].imt23prem) > 0 ?
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

        productCount = 1
        ncbCount = 1

        const premiumBreakup = policyCoverage && policyCoverage.length > 0 ?
            policyCoverage.map((coverage, qIndex) => (
                coverage.PolicyBenefitList && coverage.PolicyBenefitList.map((benefit, bIndex) => (
                    (benefit.ProductElementCode != 'B00007') ?
                        <tr>
                            <td>{Coverage[benefit.ProductElementCode]}:</td>
                            <td>₹ {Math.round(benefit.AnnualPremium)}</td>
                        </tr> : (benefit.ProductElementCode == 'B00007' && productCount == 1) ? <tr label={productCount += 1}>
                            <td >{Coverage[benefit.ProductElementCode]}:</td>
                            <td>₹ {Math.round(TRAILOR_OD_PREMIUM)}</td>
                        </tr> : null
                ))
            )) : null

        const ncbBreakup = (ncbDiscount && ncbDiscount != 0 && ncbCount == 1) ? <tr label={ncbCount += 1}>
            <td >{phrases["NCBDiscount"]}:</td>
            <td>₹ - {Math.round(ncbDiscount)}</td>
        </tr> : null

        const premiumBreakupIMT = fulQuoteResp && fulQuoteResp.PolicyLobList && Math.round(fulQuoteResp.PolicyLobList[0].PolicyRiskList[0].imt23prem) > 0 ?
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

        const validationErrors =
            validation_error ? (
                validation_error.map((errors, qIndex) => (
                    <span className="errorMsg" key={qIndex}>
                        <li>
                            <strong>
                                {errors}
                            </strong>
                        </li>
                    </span>
                ))
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

                                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox otherComprehens">
                                    <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                                    <section className="brand colpd m-b-25">
                                        <div className="d-flex justify-content-left">
                                            <div className="brandhead m-b-10">
                                                <h4 className="m-b-30">{phrases['GCVDamage']}</h4>
                                                <h5>{errMsg}</h5>
                                                <h5>{validationErrors}</h5>
                                            </div>
                                        </div>
                                        <Formik initialValues={newInitialValues}
                                            onSubmit={serverResponse && serverResponse != "" ? (serverResponse.message ? this.fullQuote : this.handleSubmit) : this.fullQuote}
                                            validationSchema={ComprehensiveValidation}>
                                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                                // console.log("values----------------- ", values)
                                                return (
                                                    <Form>
                                                        <Row>
                                                            <Col sm={12} md={9} lg={9}>
                                                                <div className="rghtsideTrigr W-90 m-b-30">
                                                                    <Collapsible trigger={phrases['DefaultCovered']} open={true}>
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
                                                                                        {values.newRegistrationNo != "NEW" ?
                                                                                            <Field
                                                                                                name="registration_no"
                                                                                                type="text"
                                                                                                placeholder=""
                                                                                                autoComplete="off"
                                                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                                value={values.registration_no}
                                                                                                maxLength={this.state.length}
                                                                                                onInput={e => {
                                                                                                    this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                                                                }}

                                                                                            /> :
                                                                                            <Field
                                                                                                type="text"
                                                                                                name='registration_no'
                                                                                                autoComplete="off"
                                                                                                className="premiumslid"
                                                                                                value={values.newRegistrationNo}
                                                                                                disabled={true}
                                                                                            />}

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
                                                                            <Col sm={12} md={5} lg={6}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        {phrases['ChassisNo']}
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>

                                                                            <Col sm={12} md={5} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <Field
                                                                                            type="text"
                                                                                            name='chasis_no_last_part'
                                                                                            autoComplete="off"
                                                                                            className="premiumslid"
                                                                                            value={values.chasis_no_last_part}
                                                                                            maxLength="5"
                                                                                            onChange={(e) => {
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
                                                                            <Col sm={12} md={5} lg={2}>
                                                                                <Button className="btn btn-primary vrifyBtn" onClick={!errors.chasis_no_last_part ? this.getVahanDetails.bind(this, values, setFieldTouched, setFieldValue, errors) : null}>{phrases['Verify']}</Button>
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
                                                                                        value={values.engine_no.toUpperCase()}
                                                                                        maxLength="17"
                                                                                        onChange={(e) => {
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
                                                                                        value={values.chasis_no.toUpperCase()}
                                                                                        maxLength="25"
                                                                                        onChange={(e) => {
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
                                                                    <Col sm={12} md={12} lg={12}>
                                                                        <FormGroup>
                                                                            <span className="fs-18">{phrases['AddMoreCoverage']}</span>
                                                                        </FormGroup>
                                                                    </Col>
                                                                </Row>
                                                                {errors.B00007 || errors.B00011 ? (
                                                                    <span className="errorMsg">{errors.B00007} &nbsp; &nbsp;{errors.B00011}</span>
                                                                ) : null}

                                                                {moreCoverage && moreCoverage.length > 0 ? moreCoverage.map((coverage, qIndex) => (
                                                                    <Row key={qIndex}>
                                                                        {motorInsurance && motorInsurance.policy_for == '2' && coverage.code != 'B00015' && coverage.code != 'B00018' || motorInsurance && motorInsurance.policy_for == '1' ?
                                                                            <Col sm={12} md={11} lg={5} key={qIndex + "a"} >
                                                                                <label className="customCheckBox formGrp formGrp">{coverage.name}

                                                                                    <Field
                                                                                        type="checkbox"
                                                                                        // name={`moreCov_${qIndex}`}
                                                                                        name={coverage.code}
                                                                                        value={coverage.code}
                                                                                        className="user-self"
                                                                                        disabled={(userTypes.includes(user_data.login_type) && values[coverage.code] == 'B00015') ? true : false}
                                                                                        onClick={(e) => {
                                                                                            if (e.target.checked == false && values[coverage.code] == 'B00015') {
                                                                                                swal(phrases.SwalIRDAI,
                                                                                                    {button: phrases.OK})
                                                                                            }
                                                                                            this.onRowSelect(e.target.value, values, e.target.checked, setFieldTouched, setFieldValue)
                                                                                        }
                                                                                        }
                                                                                        checked={values[coverage.code] == coverage.code ? true : false}
                                                                                    />
                                                                                    <span className="checkmark mL-0"></span>
                                                                                    <span className="error-message"></span>
                                                                                </label>
                                                                            </Col> : null}
                                                                        {values.PA_cover_flag == '1' && values[coverage.code] == 'B00015' ?
                                                                            <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
                                                                                <FormGroup>
                                                                                    <div className="formSection">
                                                                                        <Field
                                                                                            name='PA_Cover_OD'
                                                                                            component="select"
                                                                                            autoComplete="off"
                                                                                            className="formGrp inputfs12"
                                                                                            value={values.PA_Cover_OD}
                                                                                            onChange={(e) => {
                                                                                                setFieldTouched('PA_Cover_OD')
                                                                                                setFieldValue('PA_Cover_OD', e.target.value);
                                                                                                this.handleChange()
                                                                                            }}
                                                                                        >
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
                                                                            values.trailer_array = [] : null}
                                                                        {values.trailer_flag == '0' ?
                                                                            values.B00007_value = "" : null}

                                                                        {values.trailer_flag == '1' && values[coverage.code] == 'B00007' ?
                                                                            <Fragment>
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name='B00007_value'
                                                                                                component="select"
                                                                                                autoComplete="off"
                                                                                                className="formGrp inputfs12"
                                                                                                value={values.B00007_value}
                                                                                                onChange={(e) => {
                                                                                                    setFieldTouched('B00007_value')
                                                                                                    setFieldValue('B00007_value', e.target.value);
                                                                                                    this.handleNoOfClaims(values, e.target.value)
                                                                                                }}
                                                                                            >
                                                                                                <option value="">{phrases['NoOfTrailer']}</option>
                                                                                                {JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                                                                    <option key={qIndex} value={insurer}>{insurer}</option>
                                                                                                ))}

                                                                                            </Field>
                                                                                            {errors.B00007_value ? (
                                                                                                <span className="errorMsg">{phrases[errors.B00007_value]}</span>
                                                                                            ) : null}
                                                                                        </div>
                                                                                    </FormGroup>
                                                                                </Col>
                                                                                <Col sm={12} md={11} lg={3} key={qIndex + "c"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name="B00007_description"
                                                                                                type="text"
                                                                                                placeholder={phrases['TrailerIDV']}
                                                                                                autoComplete="off"
                                                                                                maxLength="8"
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

                                                                        {values.trailer_flag_TP == '1' && values[coverage.code] == 'B00011' ?
                                                                        <Fragment>
                                                                            <Col sm={12} md={11} lg={4} key={qIndex+"b"}>
                                                                                <FormGroup>
                                                                                    <div className="formSection">
                                                                                        <Field
                                                                                            name='B00011_value'
                                                                                            component="select"
                                                                                            autoComplete="off"
                                                                                            className="formGrp inputfs12"
                                                                                            value = {values.B00011_value}
                                                                                            onChange={(e) => {
                                                                                                setFieldTouched('B00011_value')
                                                                                                setFieldValue('B00011_value', e.target.value);
                                                                                                this.handleChange()
                                                                                            }}
                                                                                        >
                                                                                            <option value="">No of Trailer</option>
                                                                                            {JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                                                                    <option value= {insurer}>{insurer}</option>
                                                                                                ))}  
                                                                                
                                                                                        </Field>
                                                                                        {errors.B00011_value ? (
                                                                                            <span className="errorMsg">{errors.B00011_value}</span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            {/* <Col sm={12} md={11} lg={3} key={qIndex+"c"}>
                                                                                <FormGroup>
                                                                                    <div className="formSection">
                                                                                        <Field
                                                                                            name="B00011_description"
                                                                                            type="text"
                                                                                            placeholder="Trailer IDV"
                                                                                            autoComplete="off"
                                                                                            maxLength="8"
                                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                            onChange={(e) => {
                                                                                                setFieldTouched('B00011_description')
                                                                                                setFieldValue('B00011_description', e.target.value);
                                                                                                this.handleChange()
                                                                                            }}
                                                                                        >                                     
                                                                                        </Field>
                                                                                        {errors.B00011_description   ? (
                                                                                            <span className="errorMsg">{errors.B00011_description   }</span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col> */}
                                                                            </Fragment> : null }
                                    
                                                                        {values.pa_coolie_flag == '1' && values[coverage.code] == 'B00073' ?
                                                                            <Fragment>
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name='B00073_value'
                                                                                                component="select"
                                                                                                autoComplete="off"
                                                                                                className="formGrp inputfs12"
                                                                                                value={values.B00073_value}
                                                                                                onChange={(e) => {
                                                                                                    setFieldTouched('B00073_value')
                                                                                                    setFieldValue('B00073_value', e.target.value);
                                                                                                    this.handleChange()
                                                                                                }}
                                                                                            >
                                                                                                <option value="">{phrases['Select']}</option>
                                                                                                {JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                                                                    <option value={insurer}>{insurer}</option>
                                                                                                ))}

                                                                                            </Field>
                                                                                            {errors.B00073_value ? (
                                                                                                <span className="errorMsg">{errors.B00073_value}</span>
                                                                                            ) : null}
                                                                                        </div>
                                                                                    </FormGroup>
                                                                                </Col>
                                                                                <Col sm={12} md={11} lg={3} key={qIndex + "c"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name="B00073_description"
                                                                                                type="text"
                                                                                                placeholder={phrases['PaidDrivers']}
                                                                                                autoComplete="off"
                                                                                                maxLength="1"
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
                                                                                                <span className="errorMsg">{errors.B00073_description}</span>
                                                                                            ) : null}
                                                                                        </div>
                                                                                    </FormGroup>
                                                                                </Col> </Fragment> : null
                                                                        }
                                                                        {values.nonElectric_flag == '1' && values[coverage.code] == 'B00003' ?
                                                                            <Fragment>
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
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
                                                                                <Col sm={12} md={11} lg={3} key={qIndex + "c"}>
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
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
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
                                                                                <Col sm={12} md={11} lg={3} key={qIndex + "c"}>
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
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name="B00005_value"
                                                                                                type="text"
                                                                                                placeholder="IDV"
                                                                                                autoComplete="off"
                                                                                                maxLength="6"
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
                                                                        {values.hospital_cash_OD_flag == '1' && values[coverage.code] == 'B00020' ?
                                                                            <Fragment>
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name='B00020_value'
                                                                                                component="select"
                                                                                                autoComplete="off"
                                                                                                className="formGrp inputfs12"
                                                                                                value={values.B00020_value}
                                                                                                onChange={(e) => {
                                                                                                    setFieldTouched('B00020_value')
                                                                                                    setFieldValue('B00020_value', e.target.value);
                                                                                                    this.handleChange()
                                                                                                }}
                                                                                            >
                                                                                                <option value="">{phrases['Select']}</option>
                                                                                                {coverage.covarage_value != null && JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                                                                    <option value={insurer}>{insurer}</option>
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
                                                                        {values.hospital_cash_PD_flag == '1' && values[coverage.code] == 'B00022' ?
                                                                            <Fragment>
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name='B00022_value'
                                                                                                component="select"
                                                                                                autoComplete="off"
                                                                                                className="formGrp inputfs12"
                                                                                                value={values.B00022_value}
                                                                                                onChange={(e) => {
                                                                                                    setFieldTouched('B00022_value')
                                                                                                    setFieldValue('B00022_value', e.target.value);
                                                                                                    this.handleChange()
                                                                                                }}
                                                                                            >
                                                                                                <option value="">{phrases['Select']}</option>
                                                                                                {coverage.covarage_value != null && JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                                                                    <option value={insurer}>{insurer}</option>
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
                                                                        {values.LL_PD_flag == '1' && values[coverage.code] == 'B00013' ?
                                                                            <Fragment>
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "c"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name='B00013_value'
                                                                                                component="select"
                                                                                                autoComplete="off"
                                                                                                className="formGrp inputfs12"
                                                                                                value={values.B00013_value}
                                                                                                onChange={(e) => {
                                                                                                    setFieldTouched('B00013_value')
                                                                                                    setFieldValue('B00013_value', e.target.value);
                                                                                                    this.handleChange()
                                                                                                }}
                                                                                            >
                                                                                                <option value="">{phrases['NoOfDrivers']}</option>
                                                                                                {coverage.covarage_value != null && JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                                                                    <option value={insurer}>{insurer}</option>
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

                                                                        {values.LL_Emp_flag == '1' && values[coverage.code] == 'B00012' ?
                                                                            <Fragment>
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name="B00012_value"
                                                                                                type="text"
                                                                                                placeholder={phrases['NoOfEmployees']}
                                                                                                autoComplete="off"
                                                                                                maxLength="1"
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
                                                                        {values.LL_Coolie_flag == '1' && values[coverage.code] == 'B00069' ?
                                                                            <Fragment>
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name="B00069_value"
                                                                                                type="text"
                                                                                                placeholder={phrases['NoOfPerson']}
                                                                                                autoComplete="off"
                                                                                                maxLength="1"
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
                                                                        {values.enhance_PA_OD_flag == '1' && values[coverage.code] == 'B00018' ?
                                                                            <Fragment>
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name="B00018_value"
                                                                                                type="text"
                                                                                                placeholder={phrases['ValueShould']}
                                                                                                autoComplete="off"
                                                                                                maxLength="7"
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
                                                                                                <span className="errorMsg">{errors.B00018_value}</span>
                                                                                            ) : null}
                                                                                        </div>
                                                                                    </FormGroup>
                                                                                </Col>
                                                                            </Fragment> : null
                                                                        }
                                                                        {values.LL_workman_flag == '1' && values[coverage.code] == 'B00070' ?
                                                                            <Fragment>
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "b"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name="B00070_value"
                                                                                                type="text"
                                                                                                placeholder={phrases['NoOfWorkman']}
                                                                                                autoComplete="off"
                                                                                                maxLength="1"
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
                                                                                                <span className="errorMsg">{errors.B00070_value}</span>
                                                                                            ) : null}
                                                                                        </div>
                                                                                    </FormGroup>
                                                                                </Col>
                                                                            </Fragment> : null
                                                                        }

                                                                        {values.ATC_flag == '1' && values[coverage.code] == 'ATC' ?
                                                                            <Fragment>
                                                                                <Col sm={12} md={11} lg={4} key={qIndex + "c"}>
                                                                                    <FormGroup>
                                                                                        <div className="formSection">
                                                                                            <Field
                                                                                                name='ATC_value'
                                                                                                component="select"
                                                                                                autoComplete="off"
                                                                                                className="formGrp inputfs12"
                                                                                                value={values.ATC_value}
                                                                                                onChange={(e) => {
                                                                                                    setFieldTouched('ATC_value')
                                                                                                    setFieldValue('ATC_value', e.target.value);
                                                                                                    this.handleChange()
                                                                                                }}
                                                                                            >
                                                                                                <option value="">{phrases['Select']}</option>
                                                                                                {coverage.covarage_value != null && JSON.parse(coverage.covarage_value).value.length > 0 && JSON.parse(coverage.covarage_value).value.map((insurer, qIndex) => (
                                                                                                    <option value={insurer}>{insurer}</option>
                                                                                                ))}

                                                                                            </Field>
                                                                                            {errors.ATC_value ? (
                                                                                                <span className="errorMsg">{errors.ATC_value}</span>
                                                                                            ) : null}
                                                                                        </div>
                                                                                    </FormGroup>
                                                                                </Col>
                                                                            </Fragment> : null
                                                                        }
                                                                        {values.trailer_flag == '1' && values[coverage.code] == 'B00007' && values.B00007_value != "" ?
                                                                            this.handleClaims(values, errors, touched, setFieldTouched, setFieldValue, phrases) : null
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
                                                                                                    checked={values.puc == '1' ? true : false}
                                                                                                    onChange={() => {
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
                                                                                                    checked={values.puc == '2' ? true : false}
                                                                                                    onChange={() => {
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
                                                                        </Button> : (values.puc == '1' ? <Button className={`proceedBtn`} type="submit"  >
                                                                            {phrases['Continue']}
                                                                        </Button> : null)) : <Button className={`proceedBtn`} type="submit"  >
                                                                            {phrases['Recalculate']}
                                                                        </Button>}

                                                                </div>
                                                            </Col>

                                                            <Col sm={12} md={3}>
                                                                <div className="justify-content-left regisBox">
                                                                    <h3 className="premamnt"> {phrases['TPAmount']}</h3>
                                                                    <div className="rupee"> ₹ {fulQuoteResp.DuePremium}</div>
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
                                    <th>₹ {fulQuoteResp.DuePremium}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {premiumBreakup}
                                {/* {ncbBreakup} */}
                                {premiumBreakupIMT}

                                <tr>
                                    <td>{phrases["GrossPremium"]}:</td>
                                    <td>₹ {Math.round(fulQuoteResp.BeforeVatPremium)}</td>
                                </tr>
                                <tr>
                                    <td>{phrases["GST"]}:</td>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OtherComprehensivePCV_TP));