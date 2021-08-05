import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { setData } from "../../store/actions/data";
import { connect } from "react-redux";
// import ReactTooltip from "react-tooltip";
import * as Yup from 'yup';
import { Formik, Field, Form, FieldArray } from "formik";
import axios from "../../shared/axios"
import moment from "moment";
import Encryption from '../../shared/payload-encryption';
import { PersonAge } from "../../shared/dateFunctions";
import Autosuggest from 'react-autosuggest';
import { addDays } from 'date-fns';
import {
    checkGreaterTimes,
    checkGreaterStartEndTimes
} from "../../shared/validationFunctions";
import { fourwheelerODEndDate, prevEndDate } from "../../shared/reUseFunctions";
import swal from 'sweetalert';

const year = new Date('Y')
const ageObj = new PersonAge();
// const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
//const minRegnDate = moment(startRegnDate).startOf('year').format('YYYY-MM-DD hh:mm');

const minRegnDate = moment(moment().subtract(1, 'years').calendar()).add(0, 'day').calendar();
let maxRegnDate = moment()
const activeMinDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
const activeMaxDate = moment(activeMinDate).endOf('month').format('YYYY-MM-DD hh:mm');
const minDatePyp = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
const maxDatePyp = moment(moment().subtract(1, 'years').calendar()).add(1, 'month').calendar();

const initialValue = {
    registration_date: "",
    location_id: "",
    previous_is_claim: "",
    previous_city: "",
    insurance_company_id: "",
    previous_policy_name: "1",
    previous_end_date: "",
    previous_start_date: "",
    previous_claim_bonus: 1,
    previous_claim_for: "",
    previous_policy_no: "",
    valid_previous_policy: "",
    no_of_claim: ""
}
const vehicleRegistrationValidation = Yup.object().shape({
    registration_date: Yup.string().required('RegistrationRequired')
        .test(
            "checkGreaterTimes",
            "RegistrationLessPrevious",
            function (value) {
                if (value) {
                    return checkGreaterStartEndTimes(value, this.parent.previous_start_date);
                }
                return true;
            }
        )
        .test(
            "checkGreaterTimes",
            "RegistrationLessActive",
            function (value) {
                if (value) {
                    return checkGreaterStartEndTimes(value, this.parent.active_start_date);
                }
                return true;
            }
        ),
    // location_id:Yup.string().matches(/^[A-Za-z0-9 ]+$/,'No special Character allowed').required('Registration city is required'),

    location_id: Yup.string()
        .required(function () {
            return "CityRequired"
        })
        .matches(/^([0-9]*)$/, function () {
            return "No special Character allowed"
        }),

    previous_start_date: Yup.date()
        .when(['policy_type_id','lapse_duration'], {
            is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
        then: Yup.date(),
        otherwise: Yup.date().test(
            "currentMonthChecking",
            function () {
                return "PleaseESD"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && this.parent.valid_previous_policy == '1' && !value) {
                    return false;
                }
                return true;
            }
        )
        .test(
            "checkGreaterEqualTimes",
            "PrevStartDateInActivDate",
            function (value) {
                if (value) {
                    if (Math.floor(moment(value).diff(this.parent.active_start_date, 'days', true)) < 0 && this.parent.valid_previous_policy == '1') {
                        return false;
                    }

                }
                return true;
            }
        )
        .test(
            "checkGreaterEqualTimes",
            "PrevStartDateInActivDate",
            function (value) {
                if (value) {
                    if (Math.floor(moment(this.parent.active_end_date).diff(value, 'days', true)) < 0 && this.parent.valid_previous_policy == '1') {
                        return false;
                    }
                }
                return true;
            }
        )
        .test(
            "checkGreaterTimes",
            "StartDateLessEnd",
            function (value) {
                if (value && this.parent.valid_previous_policy == '1') {
                    return checkGreaterStartEndTimes(value, this.parent.previous_end_date) && this.parent.valid_previous_policy == '1';
                }
                return true;
            }
        ).test(
            "checkStartDate",
            "Enter Start Date",
            function (value) {
                if (this.parent.previous_end_date != undefined && value == undefined && this.parent.valid_previous_policy == '1') {
                    return false;
                }
                return true;
            }
        )
    }),
    previous_end_date: Yup.date()
        .when(['policy_type_id','lapse_duration'], {
            is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
        then: Yup.date(),
        otherwise: Yup.date().test(
            "currentMonthChecking",
            function () {
                return "PleaseEED"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && this.parent.valid_previous_policy == '1' && !value) {
                    return false;
                }
                return true;
            }
        )
        .test(
            "checkGreaterEqualTimes",
            "PrevEndDateInActivDate ",
            function (value) {

                if (value) {
                    if (Math.floor(moment(value).diff(this.parent.active_start_date, 'days', true)) < 0 && this.parent.valid_previous_policy == '1') {
                        return false;
                    }
                }
                return true;
            }
        )
        .test(
            "checkGreaterEqualTimes",
            "PrevEndDateInActivDate ",
            function (value) {
                if (value) {
                    if (Math.floor(moment(this.parent.active_end_date).diff(value, 'days', true)) < 0 && this.parent.valid_previous_policy == '1') {
                        return false;
                    }
                }
                return true;
            }
        ).test(
            "checkGreaterTimes",
            "EndDateGreaterStart",
            function (value) {
                if (value && this.parent.valid_previous_policy == '1') {
                    return checkGreaterTimes(value, this.parent.previous_start_date) && this.parent.valid_previous_policy == '1';
                }
                return true;
            }
        ).test(
            "checkEndDate",
            "Enter End Date",
            function (value) {
                if (this.parent.previous_start_date != undefined && value == undefined && this.parent.valid_previous_policy == '1') {
                    return false;
                }
                return true;
            }
        )
    }),

    insurance_company_id: Yup.number()
        .when(['policy_type_id','lapse_duration'], {
            is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
        then: Yup.number(),
        otherwise: Yup.number().test(
            "currentMonthChecking",
            function () {
                return "PleaseEPIC"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && this.parent.valid_previous_policy == '1' && !value) {
                    return false;
                }
                return true;
            }
        )
    }),
    previous_city: Yup.string()
        .when(['policy_type_id','lapse_duration'], {
            is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
        then: Yup.string(),
        otherwise: Yup.string().test(
            "currentMonthChecking",
            function () {
                return "PleaseEPICC"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && this.parent.valid_previous_policy == '1' && !value) {
                    return false;
                }
                return true;
            }
        )
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,\s]*$/,
            function () {
                return "PleaseValidAddress"
            })
    }),

    previous_policy_no: Yup.string()
        .when(['policy_type_id','lapse_duration'], {
            is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
        then: Yup.string(),
        otherwise: Yup.string().test(
            "currentMonthChecking",
            function () {
                return "PleaseEPPN"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && this.parent.valid_previous_policy == '1' && !value) {
                    return false;
                }
                return true;
            }
        )
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9\s-/]*$/,
            function () {
                return "PleasePolicyNumber"
            }).min(6, function () {
                return "PolicyMinCharacter"
            })
        .max(28, function () {
            return "PolicyNo18Char "
        })
    }),

    previous_claim_bonus: Yup.string()
        .when(['policy_type_id','lapse_duration'], {
            is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
        then: Yup.string(),
        otherwise: Yup.string().test(
            "currentMonthChecking",
            function () {
                return "PleaseEPCB"
            },
            function (value) {
                if (this.parent.previous_is_claim == '0' && this.parent.previous_policy_name == '1' && (!value || value == '1')) {
                    return false;
                }
                return true;
            }
        )
        .test(
            "previousClaimChecking",
            function () {
                return "PleaseEPCB"
            },
            function (value) {
                if (this.parent.previous_is_claim == '1' && !value) {
                    return false;
                }
                return true;
            }
        )
    }),
    previous_is_claim: Yup.string()
        .when(['policy_type_id','lapse_duration'], {
            is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
        then: Yup.string(),
        otherwise: Yup.string().test(
            "currentMonthChecking",
            function () {
                return "PleaseSPC"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && this.parent.previous_policy_name == '1' &&
                    Math.floor(moment().diff(this.parent.previous_end_date, 'days', true)) <= 90 && this.parent.valid_previous_policy == '1' && !value) {
                    return false;
                }
                return true;
            }
        )
    }),
    no_of_claim: Yup.string().when(['previous_is_claim'], {
        is: previous_is_claim => previous_is_claim == '1',
        then: Yup.string().required('PleasePNOC'),
        otherwise: Yup.string()
    }),
    // previous_claim_for:Yup.string().when(['previous_is_claim'], {
    //     is: previous_is_claim => previous_is_claim == '1',       
    //     then: Yup.string().required('PleasePPCF'),
    //     otherwise: Yup.string()
    // }),

    previous_policy_name: Yup.string()
        .when(['policy_type_id','lapse_duration'], {
            is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
        then: Yup.string(),
        otherwise: Yup.string().test(
            "currentMonthChecking",
            function () {
                return "PreviousPolicyLiabilityPolicy"
            },
            function (value) {
                if (value == '2') {
                    return false;
                }
                return true;
            }
        )
    }),


    active_policy_name: Yup.string()
        .required("PleaseSPT")
        .test(
            "currentMonthChecking",
            function () {
                return "ActivePolLiability"
            },
            function (value) {
                if (value == '1') {
                    return false;
                }
                return true;
            }
        ),
    active_start_date: Yup.date()
        .notRequired()
        .test(
            "currentMonthChecking",
            function () {
                return "PleaseESD"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {
                    return false;
                }
                return true;
            }
        ).test(
            "checkGreaterTimes",
            "StartDateLessEnd",
            function (value) {
                if (value) {
                    return checkGreaterStartEndTimes(value, this.parent.active_end_date);
                }
                return true;
            }
        ).test(
            "checkStartDate",
            "PleaseESD",
            function (value) {
                if (this.parent.active_end_date != undefined && value == undefined) {
                    return false;
                }
                return true;
            }
        ),
    active_end_date: Yup.date()
        .notRequired('Previous end date is required')
        .test(
            "currentMonthChecking",
            function () {
                return "PleaseEED"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {
                    return false;
                }
                return true;
            }
        ).test(
            "checkGreaterTimes",
            function () {
                return "EndDateGreaterStart"
            },
            function (value) {
                if (value) {
                    return checkGreaterTimes(value, this.parent.active_start_date);
                }
                return true;
            }
        ).test(
            "checkEndDate",
            "PleaseEED",
            function (value) {
                if (this.parent.active_start_date != undefined && value == undefined) {
                    return false;
                }
                return true;
            }
        ),

    active_insurance_company_id: Yup.number()
        .notRequired('Insurance company is required')
        .test(
            "currentMonthChecking",
            function () {
                return "PleaseEAIC"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {
                    return false;
                }
                return true;
            }
        ),
    // active_policy_address:Yup.string()
    // .notRequired('Previous city is required')
    // .test(
    //     "currentMonthChecking",
    //     function() {
    //         return "PleaseEAICC"
    //     },
    //     function (value) {
    //         const ageObj = new PersonAge();
    //         if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {   
    //             return false;    
    //         }
    //         return true;
    //     }
    // )
    // .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,\s]*$/, 
    //     function() {
    //         return "PleaseValidAddress"
    //     }),

    active_policy_no: Yup.string()
        .notRequired('Previous policy number is required')
        .test(
            "currentMonthChecking",
            function () {
                return "PleaseEAPN"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsCurrentMonth(this.parent.registration_date) > 0 && !value) {
                    return false;
                }
                return true;
            }
        )
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9\s-/]*$/,
            function () {
                return "PleasePolicyNumber"
            }).min(6, function () {
                return "PolicyMinCharacter"
            })
        .max(28, function () {
            return "PolicyNo18Char"
        }),

    valid_previous_policy: Yup.string()
        .when(['policy_type_id','lapse_duration'], {
            is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
        then: Yup.string(),
        otherwise: Yup.string()
        .required(function () {
            return "RequiredField"
        })
    }),

    claim_array: Yup.array().of(
        Yup.object().shape({
            claim_year: Yup.string(function () {
                return "PleaseEnterClaimYear"
            }).required(function () {
                return "PleaseEnterClaimYear"
            }).matches(/^[0-9]*$/, function () {
                return "InvalidYear"
            }),

            claim_amount: Yup.string(function () {
                return "PleaseEnterClaiAmmount"
            }).required(function () {
                return "PleaseEnterClaiAmmount"
            }).matches(/^[0-9]*$/, function () {
                return "InvalidAmout"
            }),

            type_of_claim: Yup.string(function () {
                return "PleaseEnterTypeClaim"
            }).required(function () {
                return "PleaseEnterTypeClaim"
            }).matches(/^[a-zA-Z\s]*$/, function () {
                return "InvalidValue"
            })

        })
    ),

});

const fuel = {
    1: 'Petrol',
    2: 'Diesel',
    3: 'CNG'
}


class VehicleDetailsOD extends Component {

    state = {
        insurerList: [],
        showClaim: false,
        previous_is_claim: "",
        motorInsurance: {},
        previousPolicy: {},
        CustomerID: '',
        suggestions: [],
        customerDetails: [],
        selectedCustomerRecords: [],
        CustIdkeyword: "",
        RTO_location: "",
        previous_is_claim: "",
        no_of_claim: []
    };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }
    onChange = (e, setFieldValue) => {
        setFieldValue('location_id', "")
    };

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    selectVehicleBrand = (productId) => {
        if (localStorage.getItem('brandEdit') == '1') {
            localStorage.setItem('newBrandEdit', 1)
        }
        else if (localStorage.getItem('brandEdit') == '2') {
            localStorage.setItem('newBrandEdit', '2')
        }

        let brandEdit = { 'brandEdit': 1 }
        this.props.setData(brandEdit)
        this.props.history.push(`/Select-brandOD/${productId}`);
    }

    selectBrand = (productId) => {
        if (this.props.data && this.props.data.fastLaneData) {
            this.props.history.push(`/RegistrationOD/${productId}`);
        }
        else {
            let brandEdit = { 'brandEdit': 1 }
            this.props.setData(brandEdit)
            this.props.history.push(`/Select-brandOD/${productId}`);
        }

    }

    editBrand = (productId) => {
        let brandEdit = { 'brandEdit': 1 }
        this.props.setData(brandEdit)
        this.props.history.push(`/Select-brandOD/${productId}`);
    }


    showClaimText = (value, values) => {
        if (value == 1) {
            this.setState({
                showClaim: true,
                previous_is_claim: 1
            })
        }
        else {
            this.setState({
                showClaim: false,
                previous_is_claim: 0
            })
            values.claim_array = []
        }
    }

    // ----------------AddressId------------
    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    escapeRegexCharacters(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }


    onChangeCustomerID = (event, { newValue, method }) => {
        //const input = newValue;
        // if (/^[a-zA-Z]+$/.test(input) || input === "") {
        this.setState({
            CustomerID: newValue,
            RTO_location: ""
        });
        //}

    };

    getCustomerIDSuggestions(value) {
        const escapedValue = this.escapeRegexCharacters(value.trim());
        if (escapedValue === '') {
            return [];
        }
        // const regex = new RegExp('^' + escapedValue, 'i');
        const regex = new RegExp(escapedValue, 'i');

        if (this.state.customerDetails && escapedValue.length > 1) {
            return this.state.customerDetails.filter(language => regex.test(language.RTO_LOCATION));
        }
        else return 0;

    }

    onSuggestionsFetchCustomerID = ({ value }) => {
        this.setState({
            suggestions: this.getCustomerIDSuggestions(value)
        });
    };

    getCustomerIDSuggestionValue = (suggestion) => {
        this.setState({
            selectedCustomerRecords: suggestion
        });
        return suggestion.RTO_LOCATION;
    }

    renderCustomerIDSuggestion(suggestion) {
        return (
            <span>{suggestion.RTO_LOCATION}</span>
        );
    }
    //--------------------------------------------------------

    handleSubmit = (values, actions) => {
        const { productId } = this.props.match.params
        const { motorInsurance } = this.state
        let policy_type = 15

        if (values.valid_previous_policy == "0" && (motorInsurance.policytype_id == 2 || (values.policy_type_id == '3' && values.lapse_duration == '1')) ) {
            swal({
                text: "Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111",
                icon: "error",
            });
            actions.setSubmitting(false)
            return false;
        }


        let newPolStartDate = values.previous_start_date ? prevEndDate(values.previous_start_date) : ""
        newPolStartDate = newPolStartDate ? addDays(new Date(newPolStartDate), 1) : addDays(new Date(), 1)
        let newPolEndDate = newPolStartDate ? prevEndDate(newPolStartDate) : ""
        let vehicleAge = Math.floor(moment(newPolStartDate).diff(values.registration_date, 'months', true))
        if (vehicleAge < 6 || vehicleAge > 36) {
            swal({
                text: "Vehicle age should be between 6 months to 3 years !",
                icon: "error",
            });
            actions.setSubmitting(false)
            return false;
        }
        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        if(values.policy_type_id == '2' || (values.policy_type_id == '3' && values.lapse_duration == '1') ) {
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'registration_date': moment(values.registration_date).format("YYYY-MM-DD"),
                'location_id': values.location_id,
                'previous_start_date': moment(values.previous_start_date).format("YYYY-MM-DD"),
                'previous_end_date': moment(values.previous_end_date).format("YYYY-MM-DD"),
                'previous_policy_name': values.previous_policy_name,
                'insurance_company_id': values.insurance_company_id,
                'previous_city': values.previous_city,
                'previous_policy_no': values.previous_policy_no,
                'previous_is_claim': values.previous_is_claim ? values.previous_is_claim : '0',
                'previous_claim_bonus': values.previous_claim_bonus ? values.previous_claim_bonus : 1,
                'previous_claim_for': 1,
                'vehicleAge': vehicleAge,
                'pol_start_date': moment(newPolStartDate).format('YYYY-MM-DD'),
                'pol_end_date': moment(newPolEndDate).format('YYYY-MM-DD'),
                'policy_type': policy_type,
                'prev_policy_flag': 1,
                'valid_previous_policy': values.valid_previous_policy,
                'claim_array':  values.previous_is_claim == '1' ?  JSON.stringify(values.claim_array) : "",
                'no_of_claim': values.no_of_claim,
    
                'active_start_date': moment(values.active_start_date).format("YYYY-MM-DD"),
                'active_end_date': moment(values.active_end_date).format("YYYY-MM-DD"),
                'active_policy_name': values.active_policy_name,
                'active_insurance_company_id': values.active_insurance_company_id,
                'active_policy_address': values.active_policy_address,
                'active_policy_no': values.active_policy_no,
                'page_name': `VehicleDetailsOD/${productId}`
            }
        }
        else {
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'registration_date': moment(values.registration_date).format("YYYY-MM-DD"),
                'location_id': values.location_id,
                'vehicleAge': vehicleAge,
                'pol_start_date': moment(newPolStartDate).format('YYYY-MM-DD'),
                'pol_end_date': moment(newPolEndDate).format('YYYY-MM-DD'),
                'active_start_date': moment(values.active_start_date).format("YYYY-MM-DD"),
                'active_end_date': moment(values.active_end_date).format("YYYY-MM-DD"),
                'active_policy_name': values.active_policy_name,
                'active_insurance_company_id': values.active_insurance_company_id,
                'active_policy_address': values.active_policy_address,
                'active_policy_no': values.active_policy_no,
                'policy_type': policy_type,
                'prev_policy_flag': 1,
                'previous_is_claim': 0,
                'page_name': `VehicleDetailsOD/${productId}`
            }
        }
       

        console.log("post_data", post_data)
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios
            .post(`/four-wh-stal/insert-vehicle-details`, formData)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt-----resp----- ", decryptResp)
                this.props.loadingStop();
                if (decryptResp.error == false) {
                    this.props.history.push(`/OtherComprehensiveOD/${productId}`);
                }
                else {
                    actions.setSubmitting(false)
                }

            })
            .catch(err => {
                let decryptResp = JSON.parse(encryption.decrypt(err.data))
                console.log("decrypt-----errrr----- ", decryptResp)
                this.props.loadingStop();
                actions.setSubmitting(false)
            });
    }

    getInsurerList = () => {
        this.props.loadingStart();
        axios
            .get(`/company/1`)
            .then(res => {
                this.setState({
                    insurerList: res.data.data
                });
                this.getAllAddress()
            })
            .catch(err => {
                this.setState({
                    insurerList: []
                });
                this.props.loadingStop();
            });
    }

    getAllAddress() {
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        axios.get(`location-list/${policyHolder_id}`)
            .then(res => {
                this.setState({
                    customerDetails: res.data.data
                });
                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
            });
    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`four-wh-stal/policy-holder/motor-saod/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {};
                let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicyforsaod : {};
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let RTO_location = motorInsurance && motorInsurance.location && motorInsurance.location.RTO_LOCATION ? motorInsurance.location.RTO_LOCATION : ""
                let previous_is_claim = previousPolicy && previousPolicy[0] && (previousPolicy[0].is_claim == 0 || previousPolicy[0].is_claim == 1) ? previousPolicy[0].is_claim : ""
                let no_of_claim = previousPolicy && previousPolicy[0] && previousPolicy[0].previouspoliciesclaims ? previousPolicy[0].previouspoliciesclaims.length : ""
                this.setState({
                    motorInsurance, previousPolicy, vehicleDetails, RTO_location, previous_is_claim, no_of_claim
                })
                this.props.loadingStop();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    handleChange = (value) => {
        let endDate = moment(value).add(1, 'years').format("YYYY-MM-DD")
        this.setState({
            EndDate: endDate,
            endDateFlag: true,
            serverResponse: [],
            error: []
        })
    }

    handleNoOfClaims = (values, value) => {

        var claimLnt = values.claim_array.length
        if (values.claim_array.length > value) {
            for (var i = claimLnt; i >= value; i--) {
                values.claim_array.splice(i, 1)
            }
        }
        else if (values.claim_array.length < value) {
            for (var i = values.claim_array.length; i < value; i++) {
                values.claim_array.push(
                    {
                        claim_amount: "",
                        claim_year: "",
                        type_of_claim: "Own Damage"
                    })
            }
        }
        this.setState({ no_of_claim: value })

    }

    initClaimDetailsList = () => {
        const { previousPolicy } = this.state
        let previous_claims = previousPolicy && previousPolicy[0] && previousPolicy[0].previouspoliciesclaims ? previousPolicy[0].previouspoliciesclaims : []
        let innicialClaimList = []
        for (var i = 0; i < this.state.no_of_claim; i++) {
            innicialClaimList.push(
                {
                    claim_amount: previous_claims && previous_claims[i] && previous_claims[i].claim_amount ? previous_claims[i].claim_amount : "",
                    claim_year: previous_claims && previous_claims[i] && previous_claims[i].claim_year ? previous_claims[i].claim_year : "",
                    type_of_claim: "Own Damage"
                }
            )
        }

        return innicialClaimList

    };

    handleClaims = (values, errors, touched, setFieldTouched, setFieldValue) => {
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        let field_array = []
        var pol_start_date = new Date(values.previous_start_date).getFullYear()
        var pol_end_date = pol_start_date == new Date(values.previous_end_date).getFullYear() ? pol_start_date : new Date(values.previous_end_date).getFullYear()


        for (var i = 0; i < values.no_of_claim; i++) {
            field_array.push(
                <Row className="m-b-30">
                    <Col sm={12} md={6} lg={3}>
                        <FormGroup>
                            <div className="formSection">

                                <Field
                                    name={`claim_array[${i}].claim_year`}
                                    component="select"
                                    autoComplete="off"
                                    className="formGrp inputfs12"
                                // value = {values[`claim_array[${i}].claim_year`]}
                                >
                                    <option value="">{phrases['SelectYear']}</option>
                                    <option value={pol_start_date}>{pol_start_date}</option>
                                    <option value={pol_end_date}>{pol_end_date}</option>
                                </Field>

                                {errors.claim_array && errors.claim_array[i] && errors.claim_array[i].claim_year ? (
                                    <span className="errorMsg">{phrases[errors.claim_array[i].claim_year]}</span>
                                ) : null}
                            </div>
                        </FormGroup>
                    </Col>
                    <Col sm={12} md={6} lg={3}>
                        <FormGroup>
                            <div className="formSection">
                                <Field
                                    name={`claim_array[${i}].claim_amount`}
                                    type="text"
                                    placeholder={phrases["ClaimAmount"]}
                                    autoComplete="off"
                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                // value = {values[`claim_array[${i}].claim_amount`]} 

                                />
                                {errors.claim_array && errors.claim_array[i] && errors.claim_array[i].claim_amount ? (
                                    <span className="errorMsg">{phrases[errors.claim_array[i].claim_amount]}</span>
                                ) : null}
                            </div>
                        </FormGroup>
                    </Col>
                    <Col sm={12} md={6} lg={3}>
                        <FormGroup>
                            <div className="formSection">
                                <Field
                                    name={`claim_array[${i}].type_of_claim`}
                                    type="text"
                                    placeholder="Type of claim"
                                    autoComplete="off"
                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                    // value = {values[`claim_array[${i}].type_of_claim`]}
                                    value={phrases["OwnDamage"]}
                                    disabled={true}
                                />
                                {errors.claim_array && errors.claim_array[i] && errors.claim_array[i].type_of_claim ? (
                                    <span className="errorMsg">{errors.claim_array[i].type_of_claim}</span>
                                ) : null}
                            </div>
                        </FormGroup>
                    </Col>
                </Row>
            )
        }
        return field_array

    }

    componentDidMount() {
        this.getInsurerList();
        this.fetchData();

    }
    registration = (productId) => {
        this.props.history.push(`/RegistrationOD/${productId}`);
    }

    render() {
        const { productId } = this.props.match.params
        const { insurerList, showClaim, previous_is_claim, motorInsurance, previousPolicy,
            CustomerID, suggestions, vehicleDetails, RTO_location } = this.state

        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        let newInitialValues = {}
        if(( motorInsurance && motorInsurance.policytype_id && motorInsurance.policytype_id == '3' && motorInsurance.lapse_duration == '1') ||
                motorInsurance && motorInsurance.policytype_id && motorInsurance.policytype_id == '2' ) {
            newInitialValues = Object.assign(initialValue, {
                registration_date: motorInsurance && motorInsurance.registration_date ? new Date(motorInsurance.registration_date) : "",
                location_id: motorInsurance && motorInsurance.location_id ? motorInsurance.location_id : "",
                previous_start_date: previousPolicy && previousPolicy[0] && previousPolicy[0].start_date ? new Date(previousPolicy[0].start_date) : "",
                previous_end_date: previousPolicy && previousPolicy[0] && previousPolicy[0].end_date ? new Date(previousPolicy[0].end_date) : "",
                previous_policy_name: "1",
                insurance_company_id: previousPolicy && previousPolicy[0] && previousPolicy[0].insurancecompany && previousPolicy[0].insurancecompany.Id ? previousPolicy[0].insurancecompany.Id : "",
                previous_city: previousPolicy && previousPolicy[0] && previousPolicy[0].city ? previousPolicy[0].city : "",
                previous_policy_no: previousPolicy && previousPolicy[0] && previousPolicy[0].policy_no ? previousPolicy[0].policy_no : "",
                previous_is_claim: previous_is_claim,
                previous_claim_bonus: previousPolicy && previousPolicy[0] && (previousPolicy[0].claim_bonus || previousPolicy[0].claim_bonus == 0) ? previousPolicy[0].claim_bonus.toString() : "1",
                // previous_claim_for: previousPolicy && previousPolicy[0] && previousPolicy[0].claim_for ? previousPolicy[0].claim_for : "",
                valid_previous_policy: motorInsurance && (motorInsurance.valid_previous_policy == 0 || motorInsurance.valid_previous_policy == 1) ? motorInsurance.valid_previous_policy : "1",
    
                active_start_date: previousPolicy && previousPolicy[1] && previousPolicy[1].start_date ? new Date(previousPolicy[1].start_date) : "",
                active_end_date: previousPolicy && previousPolicy[1] && previousPolicy[1].end_date ? new Date(previousPolicy[1].end_date) : "",
                active_policy_name: '2',
                active_insurance_company_id: previousPolicy && previousPolicy[1] && previousPolicy[1].insurancecompany && previousPolicy[1].insurancecompany.Id ? previousPolicy[1].insurancecompany.Id : "",
                active_policy_address: previousPolicy && previousPolicy[1] && previousPolicy[1].address ? previousPolicy[1].address : "test",
                active_policy_no: previousPolicy && previousPolicy[1] && previousPolicy[1].policy_no ? previousPolicy[1].policy_no : "",
                no_of_claim: previousPolicy && previousPolicy[0] && previousPolicy[0].previouspoliciesclaims ? previousPolicy[0].previouspoliciesclaims.length : "",
                lapse_duration: motorInsurance && motorInsurance.lapse_duration ? motorInsurance.lapse_duration : "",
                policy_type_id: motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : "",
                claim_array: this.initClaimDetailsList()
    
            });
        }
        else{
            newInitialValues = Object.assign(initialValue, {
                registration_date: motorInsurance && motorInsurance.registration_date ? new Date(motorInsurance.registration_date) : "",
                location_id: motorInsurance && motorInsurance.location_id ? motorInsurance.location_id : "",
                previous_policy_name: "1",            
                valid_previous_policy: motorInsurance && (motorInsurance.valid_previous_policy == 0 || motorInsurance.valid_previous_policy == 1) ? motorInsurance.valid_previous_policy : "0",
                active_start_date: previousPolicy && previousPolicy[0] && previousPolicy[0].start_date ? new Date(previousPolicy[0].start_date) : "",
                active_end_date: previousPolicy && previousPolicy[0] && previousPolicy[0].end_date ? new Date(previousPolicy[0].end_date) : "",
                active_policy_name: '2',
                active_insurance_company_id: previousPolicy && previousPolicy[0] && previousPolicy[0].insurancecompany && previousPolicy[0].insurancecompany.Id ? previousPolicy[0].insurancecompany.Id : "",
                active_policy_address: previousPolicy && previousPolicy[0] && previousPolicy[0].address ? previousPolicy[0].address : "test",
                active_policy_no: previousPolicy && previousPolicy[0] && previousPolicy[0].policy_no ? previousPolicy[0].policy_no : "",
                lapse_duration: motorInsurance && motorInsurance.lapse_duration ? motorInsurance.lapse_duration : "",
                policy_type_id: motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : "",
                claim_array: this.initClaimDetailsList()
    
            });
        }
            

        const inputCustomerID = {
            placeholder: phrases['SearchCity'],
            value: CustomerID ? CustomerID : RTO_location,
            onChange: this.onChangeCustomerID
        };


        return (
            <>
                <BaseComponent>
                    {phrases ?
                        <div className="page-wrapper">
                            <div className="container-fluid">
                                <div className="row">
                                    <aside className="left-sidebar">
                                        <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
                                            <SideNav />
                                        </div>
                                    </aside>

                                    <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox">
                                        <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                                        <section className="brand m-b-25">
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead">
                                                    <h4 className="fs-18 m-b-30">{phrases['PleaseVehicleDetails']}.</h4>
                                                </div>
                                            </div>
                                            <div className="brand-bg">
                                                <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} validationSchema={vehicleRegistrationValidation}>
                                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
console.log("errors ------------- ", errors)
                                                        return (
                                                            <Form>
                                                                <Row>
                                                                    <Col sm={12} md={12} lg={9}>

                                                                        <Row>
                                                                            <Col sm={12} md={6} lg={6}>
                                                                                <FormGroup>
                                                                                    <div className="fs-18">
                                                                                        {phrases['FirstRegDate']}
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>

                                                                            <Col sm={12} md={11} lg={4}>
                                                                                <FormGroup>
                                                                                    <DatePicker
                                                                                        name="registration_date"
                                                                                        // minDate={new Date(minRegnDate)}
                                                                                        maxDate={new Date()}
                                                                                        dateFormat="dd MMM yyyy"
                                                                                        placeholderText={phrases['RegDate']}
                                                                                        peekPreviousMonth
                                                                                        peekPreviousYear
                                                                                        showMonthDropdown
                                                                                        showYearDropdown
                                                                                        // openToDate = {values.registration_date ? values.registration_date : new Date(minRegnDate)}
                                                                                        dropdownMode="select"
                                                                                        className="datePckr inputfs12"
                                                                                        selected={values.registration_date}
                                                                                        onChange={(val) => {
                                                                                            setFieldTouched('registration_date');
                                                                                            setFieldValue('registration_date', val);

                                                                                            setFieldValue('previous_end_date', "");
                                                                                            setFieldValue('previous_start_date', "");
                                                                                            setFieldValue('active_end_date', "");
                                                                                            setFieldValue('active_start_date', "");

                                                                                        }}

                                                                                    />
                                                                                    {errors.registration_date && touched.registration_date ? (
                                                                                        <span className="errorMsg">{phrases[errors.registration_date]}</span>
                                                                                    ) : null}
                                                                                </FormGroup>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col sm={12} md={4} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="fs-18">
                                                                                        {phrases['RegCity']}
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={6} lg={6}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <Autosuggest
                                                                                            suggestions={suggestions}
                                                                                            onSuggestionsFetchRequested={this.onSuggestionsFetchCustomerID}
                                                                                            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                                                                            getSuggestionValue={this.getCustomerIDSuggestionValue}
                                                                                            shouldRenderSuggestions={this.customerIDRender}
                                                                                            renderSuggestion={this.renderCustomerIDSuggestion}
                                                                                            inputProps={inputCustomerID}
                                                                                            onChange={e => this.onChange(e, setFieldValue)}
                                                                                            onSuggestionSelected={(e, { suggestion, suggestionValue }) => {
                                                                                                setFieldTouched('location_id')
                                                                                                setFieldValue("location_id", suggestion.id)
                                                                                            }}
                                                                                        />
                                                                                        {errors.location_id && touched.location_id ? (
                                                                                            <span className="errorMsg">{phrases[errors.location_id]}</span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col sm={12}>
                                                                                <FormGroup>
                                                                                    <div className="carloan">
                                                                                        <h4> {phrases['APD']}</h4>
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                        </Row>

                                                                        <Row>
                                                                            <Col sm={12} md={11} lg={4}>
                                                                                <FormGroup>

                                                                                    <DatePicker
                                                                                        name={phrases['active_start_date']}
                                                                                        // minDate={new Date(activeMinDate)}
                                                                                        maxDate={new Date()}
                                                                                        dateFormat="dd MMM yyyy"
                                                                                        placeholderText={phrases['APSD']}
                                                                                        peekPreviousMonth
                                                                                        peekPreviousYear
                                                                                        showMonthDropdown
                                                                                        showYearDropdown
                                                                                        dropdownMode="select"
                                                                                        className="datePckr inputfs12"
                                                                                        selected={values.active_start_date}
                                                                                        onChange={(val) => {
                                                                                            setFieldTouched('active_start_date')
                                                                                            setFieldValue("active_end_date", fourwheelerODEndDate(val));
                                                                                            setFieldValue('active_start_date', val);
                                                                                        }}
                                                                                    />
                                                                                    {errors.active_start_date && touched.active_start_date ? (
                                                                                        <span className="errorMsg">{phrases[errors.active_start_date]}</span>
                                                                                    ) : null}
                                                                                </FormGroup>
                                                                            </Col>

                                                                            <Col sm={12} md={11} lg={4}>
                                                                                <FormGroup>
                                                                                    <DatePicker
                                                                                        name="active_end_date"
                                                                                        dateFormat="dd MMM yyyy"
                                                                                        placeholderText={phrases['APED']}
                                                                                        disabled={true}
                                                                                        dropdownMode="select"
                                                                                        className="datePckr inputfs12"
                                                                                        selected={values.active_end_date}
                                                                                        onChange={(val) => {
                                                                                            setFieldTouched('active_end_date');
                                                                                            setFieldValue('active_end_date', val);
                                                                                        }}
                                                                                    />
                                                                                    {errors.active_end_date && touched.active_end_date ? (
                                                                                        <span className="errorMsg">{phrases[errors.active_end_date]}</span>
                                                                                    ) : null}
                                                                                </FormGroup>
                                                                            </Col>
                                                                            {/* <Col sm={12} md={11} lg={3}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                                <Field
                                                                                    name="active_policy_name"
                                                                                    component="select"
                                                                                    autoComplete="off"
                                                                                    className="formGrp inputfs12"
                                                                                    value = {values.active_policy_name}
                                                                                    disabled={true}
                                                                                    // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.active_policy_name}
                                                                                >
                                                                                    <option value="">{phrases['SPT']}</option>
                                                                                    <option value="1" disabled={true}>{phrases['Package']}</option>
                                                                                    <option value="2">{phrases['LiabilityOnly']}</option>  
                                                                        
                                                                                </Field>
                                                                                {errors.active_policy_name && touched.active_policy_name ? (
                                                                                    <span className="errorMsg">{phrases[errors.active_policy_name]}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col> */}
                                                                        </Row>

                                                                        <Row>
                                                                            <Col sm={12} md={6} lg={6}>
                                                                                <FormGroup>
                                                                                    <div className="formSection">
                                                                                        <Field
                                                                                            name="active_insurance_company_id"
                                                                                            component="select"
                                                                                            autoComplete="off"
                                                                                            className="formGrp"
                                                                                        >
                                                                                            <option value="">{phrases['SelectActiveInsurer']}</option>
                                                                                            {insurerList.map((insurer, qIndex) => (
                                                                                                <option value={insurer.Id}>{insurer.name}</option>
                                                                                            ))}
                                                                                        </Field>
                                                                                        {errors.active_insurance_company_id && touched.active_insurance_company_id ? (
                                                                                            <span className="errorMsg">{phrases[errors.active_insurance_company_id]}</span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={5} lg={5}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <Field
                                                                                            name="active_policy_no"
                                                                                            type="text"
                                                                                            placeholder={phrases['APolicyNumber']}
                                                                                            autoComplete="off"
                                                                                            maxLength="28"
                                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}

                                                                                        />
                                                                                        {errors.active_policy_no && touched.active_policy_no ? (
                                                                                            <span className="errorMsg">{phrases[errors.active_policy_no]}</span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>&nbsp;</Row>

                                                                        {(values.policy_type_id == '2' || (values.policy_type_id == '3' && values.lapse_duration == '1' ) ) ?
                                                                            <Fragment>
                                                                                <Row>
                                                                                    <Col sm={12}>
                                                                                        <FormGroup>
                                                                                            <div className="carloan">
                                                                                                <h4> {phrases['PPD']}</h4>
                                                                                            </div>
                                                                                        </FormGroup>
                                                                                    </Col>
                                                                                </Row>

                                                                                <Row>
                                                                                    <Col sm={12} md={11} lg={4}>
                                                                                        <FormGroup>

                                                                                            <DatePicker
                                                                                                name={phrases['previous_start_date']}
                                                                                                // minDate={new Date(minDatePyp)}
                                                                                                maxDate={new Date()}
                                                                                                dateFormat="dd MMM yyyy"
                                                                                                placeholderText={phrases['PPSD']}
                                                                                                peekPreviousMonth
                                                                                                peekPreviousYear
                                                                                                showMonthDropdown
                                                                                                showYearDropdown
                                                                                                openToDate={values.previous_start_date ? values.previous_start_date : new Date(minDatePyp)}
                                                                                                dropdownMode="select"
                                                                                                className="datePckr inputfs12"
                                                                                                selected={values.previous_start_date}
                                                                                                onChange={(val) => {
                                                                                                    setFieldTouched('previous_start_date')
                                                                                                    setFieldValue("previous_end_date", prevEndDate(val));
                                                                                                    setFieldValue('previous_start_date', val);
                                                                                                }}
                                                                                            />
                                                                                            {errors.previous_start_date && touched.previous_start_date ? (
                                                                                                <span className="errorMsg">{phrases[errors.previous_start_date]}</span>
                                                                                            ) : null}
                                                                                        </FormGroup>
                                                                                    </Col>

                                                                                    <Col sm={12} md={11} lg={4}>
                                                                                        <FormGroup>
                                                                                            <DatePicker
                                                                                                name="previous_end_date"
                                                                                                dateFormat="dd MMM yyyy"
                                                                                                placeholderText={phrases['PPED']}
                                                                                                disabled={true}
                                                                                                dropdownMode="select"
                                                                                                className="datePckr inputfs12"
                                                                                                selected={values.previous_end_date}
                                                                                                onChange={(val) => {
                                                                                                    setFieldTouched('previous_end_date');
                                                                                                    setFieldValue('previous_end_date', val);
                                                                                                }}
                                                                                            />
                                                                                            {errors.previous_end_date && touched.previous_end_date ? (
                                                                                                <span className="errorMsg">{phrases[errors.previous_end_date]}</span>
                                                                                            ) : null}
                                                                                        </FormGroup>
                                                                                    </Col>
                                                                                </Row>

                                                                                <Row>
                                                                                    <Col sm={12} md={6} lg={6}>
                                                                                        <FormGroup>
                                                                                            <div className="formSection">
                                                                                                <Field
                                                                                                    name="insurance_company_id"
                                                                                                    component="select"
                                                                                                    autoComplete="off"
                                                                                                    className="formGrp"
                                                                                                >
                                                                                                    <option value="">{phrases['SelectInsurer']}</option>
                                                                                                    {insurerList.map((insurer, qIndex) => (
                                                                                                        <option value={insurer.Id}>{insurer.name}</option>
                                                                                                    ))}
                                                                                                </Field>
                                                                                                {errors.insurance_company_id && touched.insurance_company_id ? (
                                                                                                    <span className="errorMsg">{phrases[errors.insurance_company_id]}</span>
                                                                                                ) : null}
                                                                                            </div>
                                                                                        </FormGroup>
                                                                                    </Col>

                                                                                    <Col sm={12} md={5} lg={5}>
                                                                                        <FormGroup>
                                                                                            <div className="insurerName">
                                                                                                <Field
                                                                                                    name="previous_city"
                                                                                                    type="text"
                                                                                                    placeholder={phrases['PInsurerAddress']}
                                                                                                    autoComplete="off"
                                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}

                                                                                                />
                                                                                                {errors.previous_city && touched.previous_city ? (
                                                                                                    <span className="errorMsg">{phrases[errors.previous_city]}</span>
                                                                                                ) : null}
                                                                                            </div>
                                                                                        </FormGroup>
                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={5} lg={5}>
                                                                                        <FormGroup>
                                                                                            <div className="insurerName">
                                                                                                <Field
                                                                                                    name="previous_policy_no"
                                                                                                    type="text"
                                                                                                    placeholder={phrases['PPolicyNumber']}
                                                                                                    autoComplete="off"
                                                                                                    maxLength="28"
                                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}

                                                                                                />
                                                                                                {errors.previous_policy_no && touched.previous_policy_no ? (
                                                                                                    <span className="errorMsg">{phrases[errors.previous_policy_no]}</span>
                                                                                                ) : null}
                                                                                            </div>
                                                                                        </FormGroup>
                                                                                    </Col>
                                                                                </Row>

                                                                                <Row>&nbsp;</Row>
                                                                                {values.previous_policy_name == '1' && Math.floor(moment().diff(values.previous_end_date, 'days', true)) <= 90 ?
                                                                                    <Fragment>
                                                                                        <Row>
                                                                                            <Col sm={12}>
                                                                                                <FormGroup>
                                                                                                    <div className="carloan">
                                                                                                        <h4>{phrases['ClaimPolicy']}</h4>
                                                                                                    </div>
                                                                                                </FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                        <Row>
                                                                                            <Col sm={4}>
                                                                                                <FormGroup>
                                                                                                    <div className="d-inline-flex m-b-35">
                                                                                                        <div className="p-r-25">
                                                                                                            <label className="customRadio3">
                                                                                                                <Field
                                                                                                                    type="radio"
                                                                                                                    name='previous_is_claim'
                                                                                                                    value='0'
                                                                                                                    key='1'
                                                                                                                    onChange={(e) => {
                                                                                                                        setFieldTouched('previous_is_claim')
                                                                                                                        setFieldValue(`previous_is_claim`, e.target.value);
                                                                                                                        this.showClaimText(0, values);
                                                                                                                        if(e.target.checked == true) {
                                                                                                                            setFieldValue('no_of_claim', "")
                                                                                                                        }
                                                                                                                    }}
                                                                                                                    checked={values.previous_is_claim == '0' ? true : false}
                                                                                                                />
                                                                                                                <span className="checkmark " /><span className="fs-14"> {phrases['NoIHavent']}</span>
                                                                                                            </label>
                                                                                                        </div>

                                                                                                        <div className="">
                                                                                                            <label className="customRadio3">
                                                                                                                <Field
                                                                                                                    type="radio"
                                                                                                                    name='previous_is_claim'
                                                                                                                    value='1'
                                                                                                                    key='1'
                                                                                                                    onChange={(e) => {
                                                                                                                        setFieldTouched('previous_is_claim')
                                                                                                                        setFieldValue(`previous_is_claim`, e.target.value);
                                                                                                                        this.showClaimText(1, values);
                                                                                                                        if(e.target.checked == true) {
                                                                                                                            setFieldValue('previous_claim_bonus', "1")
                                                                                                                        }
                                                                                                                    }}
                                                                                                                    checked={values.previous_is_claim == '1' ? true : false}
                                                                                                                />
                                                                                                                <span className="checkmark" />
                                                                                                                <span className="fs-14">{phrases['YesIHave']}</span>
                                                                                                            </label>
                                                                                                            {errors.previous_is_claim && touched.previous_is_claim ? (
                                                                                                                <span className="errorMsg">{phrases[errors.previous_is_claim]}</span>
                                                                                                            ) : null}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                        {previous_is_claim == "0" ?
                                                                                            <Row className="m-b-30">
                                                                                                <Col sm={12} md={5} lg={5}>
                                                                                                    <FormGroup>
                                                                                                        <div className="fs-18">
                                                                                                            {phrases['SelectNCB']}
                                                                                                        </div>
                                                                                                    </FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6} lg={6}>
                                                                                                    <FormGroup>
                                                                                                        <div className="formSection">
                                                                                                            <Field
                                                                                                                name='previous_claim_bonus'
                                                                                                                component="select"
                                                                                                                autoComplete="off"
                                                                                                                className="formGrp"
                                                                                                                value={values.previous_claim_bonus}

                                                                                                            >
                                                                                                                <option value="">--{phrases['Select']}--</option>
                                                                                                                <option value="0">0</option>
                                                                                                                <option value="20">20</option>
                                                                                                                <option value="25">25</option>
                                                                                                                <option value="35">35</option>
                                                                                                                <option value="45">45</option>
                                                                                                                <option value="50">50</option>
                                                                                                            </Field>
                                                                                                            {errors.previous_claim_bonus && touched.previous_claim_bonus ? (
                                                                                                                <span className="errorMsg">{phrases[errors.previous_claim_bonus]}</span>
                                                                                                            ) : null}
                                                                                                        </div>
                                                                                                    </FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            : null}

                                                                                        {showClaim || previous_is_claim == '1' ?
                                                                                            <Row className="m-b-30">
                                                                                                <Col sm={12} md={5} lg={5}>
                                                                                                    <FormGroup>
                                                                                                        <div className="fs-18">
                                                                                                            Select No. of claims
                                                                                                        </div>
                                                                                                    </FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6} lg={6}>
                                                                                                    <FormGroup>
                                                                                                        <div className="formSection">
                                                                                                            <Field
                                                                                                                name='no_of_claim'
                                                                                                                component="select"
                                                                                                                autoComplete="off"
                                                                                                                className="formGrp"
                                                                                                                value={values.no_of_claim}
                                                                                                                onChange={(e) => {
                                                                                                                    setFieldTouched('no_of_claim')
                                                                                                                    setFieldValue('no_of_claim', e.target.value)
                                                                                                                    this.handleNoOfClaims(values, e.target.value)
                                                                                                                }}
                                                                                                            >
                                                                                                                <option value="">{phrases['NoOfClaims']}</option>
                                                                                                                <option value="1">1</option>
                                                                                                                <option value="2">2</option>
                                                                                                                <option value="3">3</option>
                                                                                                                <option value="4">4</option>
                                                                                                                <option value="5">5</option>
                                                                                                                <option value="6">6</option>
                                                                                                                <option value="7">7</option>
                                                                                                                <option value="8">8</option>
                                                                                                                <option value="9">9</option>
                                                                                                                <option value="10">10</option>
                                                                                                            </Field>
                                                                                                            {errors.no_of_claim && touched.no_of_claim ? (
                                                                                                                <span className="errorMsg">{phrases[errors.no_of_claim]}</span>
                                                                                                            ) : null}
                                                                                                        </div>
                                                                                                    </FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            : null}
                                                                                        {values.no_of_claim != "" || previous_is_claim == "0" ?
                                                                                            this.handleClaims(values, errors, touched, setFieldTouched, setFieldValue)
                                                                                            : null}
                                                                                    </Fragment> : null}

                                                                            </Fragment> : null}

                                                                        <div className="d-flex justify-content-left resmb">
                                                                            <Button className={`backBtn`} type="button" disabled={isSubmitting ? true : false} onClick={this.selectBrand.bind(this, productId)}>
                                                                                {isSubmitting ? phrases['Wait'] : phrases['Back']}
                                                                            </Button>
                                                                            <Button className={`proceedBtn`} type="submit" disabled={isSubmitting ? true : false}>
                                                                                {isSubmitting ? phrases['Wait'] : phrases['Next']}
                                                                            </Button>
                                                                        </div>

                                                                    </Col>

                                                                    <Col sm={12} md={3} className="mdsize">
                                                                        <div className="vehbox">
                                                                            <Row className="m-b-25">
                                                                                <Col sm={12} md={7}>
                                                                                    <div className="txtRegistr">{phrases['RegNo']}.<br />
                                                                                        {motorInsurance && motorInsurance.registration_no}</div>
                                                                                </Col>

                                                                                <Col sm={12} md={5} className="text-right">
                                                                                    <button className="rgistrBtn" onClick={this.registration.bind(this, productId)}>{phrases['Edit']}</button>
                                                                                </Col>
                                                                            </Row>

                                                                            <Row className="m-b-25">
                                                                                <Col sm={12} md={7}>
                                                                                    <div className="txtRegistr">{phrases['Brand']}<br />
                                                                                        <strong>{vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : ""}</strong></div>
                                                                                </Col>

                                                                                <Col sm={12} md={5} className="text-right">
                                                                                    <button className="rgistrBtn" onClick={this.editBrand.bind(this, productId)}>{phrases['Edit']}</button>
                                                                                </Col>
                                                                            </Row>

                                                                            <Row className="m-b-25">
                                                                                <Col sm={12} md={7}>
                                                                                    <div className="txtRegistr">{phrases['Model']}<br />
                                                                                        <strong>{vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description + " " + vehicleDetails.varientmodel.varient : ""}</strong></div>
                                                                                </Col>

                                                                                <Col sm={12} md={5} className="text-right">
                                                                                    <button className="rgistrBtn" onClick={this.selectVehicleBrand.bind(this, productId)}>{phrases['Edit']}</button>
                                                                                </Col>
                                                                            </Row>

                                                                            <Row className="m-b-25">
                                                                                <Col sm={12} md={7}>
                                                                                    <div className="txtRegistr">{phrases['Fuel']}<br />
                                                                                        <strong>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fuel_type ? fuel[vehicleDetails.varientmodel.fuel_type] : null} </strong></div>
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            </Form>
                                                        );
                                                    }}
                                                </Formik>
                                            </div>
                                        </section>
                                        <Footer />
                                    </div>
                                </div>
                            </div>
                        </div> : null}
                </BaseComponent>
            </>
        );
    }
}


const mapStateToProps = state => {
    return {
        loading: state.loader.loading,
        data: state.processData.data
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
        setData: (data) => dispatch(setData(data))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(VehicleDetailsOD));