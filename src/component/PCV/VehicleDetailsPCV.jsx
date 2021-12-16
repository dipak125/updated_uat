import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
// import ReactTooltip from "react-tooltip";
import * as Yup from 'yup';
import { Formik, Field, Form, FieldArray } from "formik";
import axios from "../../shared/axios"
import moment from "moment";
import Encryption from '../../shared/payload-encryption';
import {  PersonAge } from "../../shared/dateFunctions";
import Autosuggest from 'react-autosuggest';
import fuel from "../common/FuelTypes";
import {
    checkGreaterTimes,
    checkGreaterStartEndTimes
  } from "../../shared/validationFunctions";
import swal from 'sweetalert';


const menumaster_id = 4

const year = new Date('Y')
const ageObj = new PersonAge();
const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
// const maxDate = moment(minDate).add(30, 'day').calendar();
// const minDate = moment(moment().subtract(20, 'years').calendar()).add(1, 'day').calendar();
const minDatePypLapsed = moment(moment().subtract(1, 'years').calendar()).subtract(89, 'day').calendar();
const maxDate = moment(moment().subtract(1, 'years').calendar()).add(0, 'day').calendar();
const maxDatePYPST = moment(moment().subtract(1, 'month').calendar()).add(1, 'day').calendar();
const maxDatePYP = moment(moment().subtract(1, 'years').calendar()).add(30, 'day').calendar();
const maxDatePYPLapsed = moment().subtract(1, 'years').calendar();
const startRegnDate = moment().subtract(20, 'years').calendar();
const minRegnDate = startRegnDate;
// const minRegnDate = moment(startRegnDate).startOf('year').format('YYYY-MM-DD hh:mm');
const minRegnDateNew = moment(moment().subtract(9, 'months').calendar()).add(1, 'day').calendar();
const maxDateForValidtion = moment(moment().subtract(1, 'years').calendar()).add(31, 'day').calendar();

const initialValue = {
    registration_date: "",
    location_id:"",
    previous_is_claim:"",
    previous_city:"",
    insurance_company_id:"",
    previous_policy_name:"",
    previous_end_date: "",
    previous_start_date: "",
    previous_claim_bonus: 1,
    no_of_claim: "",
    previous_policy_no: "",
    proposed_used_id: "",
    averagemonthlyusages_id: "",
    permittypes_id: "",
    valid_previous_policy: "",
    claim_array: [],
    duration: "",
}

const vehicleRegistrationValidation = Yup.object().shape({
    registration_date: Yup.string().required('RegistrationRequired')
    .test(
        "checkMaxDateRollover",
        "RegistrationDateOld",
        function (value) {
            if (value && this.parent.policy_type_id == '2') {
                return checkGreaterStartEndTimes(value, maxDateForValidtion);
            }
            return true;
        }
    )
    .test(
        "checkMinDate_MaxDate_NewPolicy",
        "RegistrationDateOneMonth",
        function (value) {
            if (value && this.parent.policy_type_id == '1') {
                // return checkGreaterStartEndTimes(value, new Date()) && checkGreaterStartEndTimes(minRegnDateNew, value);
                return checkGreaterStartEndTimes(value, new Date()) && Math.floor(moment(minRegnDateNew).diff(value, 'days', true)<=0);       
            }
            return true;
        }
    )
    .test(
        "checkGreaterTimes",
        "RegistrationLessPrevious",
        function (value) {
            if (value) {
                return checkGreaterStartEndTimes(value, this.parent.previous_start_date);
            }
            return true;
        }
    ),
    // location_id:Yup.string().matches(/^[A-Za-z0-9 ]+$/,'No special Character allowed').required('Registration city is required'),

    location_id: Yup.string()
    .required(function() {
        return "CityRequired"
    })
    .matches(/^([0-9]*)$/, function() {
        return "NoCharacterAllowed"
    }),

    previous_start_date:Yup.date()
    .when(['policy_type_id','lapse_duration'], {
        is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
    then: Yup.date(),
    otherwise: Yup.date().test(
        "currentMonthChecking",
        function() {
            return "PleaseESD"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (!value && this.parent.policy_type_id == '2' && this.parent.valid_previous_policy == '1'  && this.parent.valid_previous_policy == '1') {   
                return false;    
            }
            return true;
        }
    ).test(
        "checkGreaterTimes",
        "StartDateLessEnd",
        function (value) {
            if (value && this.parent.policy_type_id == '2'  && this.parent.valid_previous_policy == '1'  && this.parent.valid_previous_policy == '1') {
                return checkGreaterStartEndTimes(value, this.parent.previous_end_date);
            }
            return true;
        }
    ).test(
      "checkStartDate",
      "PleaseESD",
      function (value) {       
          if ( this.parent.previous_end_date != undefined && value == undefined && this.parent.policy_type_id == '2'  && this.parent.valid_previous_policy == '1') {
              return false;
          }
          return true;
      }
    )
    }),
    previous_end_date:Yup.date()
    .when(['policy_type_id','lapse_duration'], {
        is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
    then: Yup.date(),
    otherwise: Yup.date().test(
        "currentMonthChecking",
        function() {
            return "PleaseEED"
        },
        function (value) {
            const ageObj = new PersonAge();
            if ( !value && this.parent.policy_type_id == '2'  && this.parent.valid_previous_policy == '1') {   
                return false;    
            }
            return true;
        }
    ).test( 
        "checkGreaterTimes",
        "EndDateGreaterStart",
        function (value) {
            if (value && this.parent.policy_type_id == '2'  && this.parent.valid_previous_policy == '1') {
                return checkGreaterTimes(value, this.parent.previous_start_date);
            }
            return true;
        }
        ).test(
        "checkEndDate",
        "PleaseEED",
        function (value) {     
            if ( this.parent.previous_start_date != undefined && value == undefined && this.parent.policy_type_id == '2'  && this.parent.valid_previous_policy == '1') {
                return false;
            }
            return true;
        }
    )
    }),
    previous_policy_name:Yup.string()
    .when(['policy_type_id','lapse_duration'], {
        is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
    then: Yup.string(),
    otherwise: Yup.string().test(
        "currentMonthChecking",
        function() {
            return "PleaseSPT"
        },
        function (value) {
            if (this.parent.policy_type_id == '2'  && !value  && this.parent.valid_previous_policy == '1') {   
                return false;    
            }
            return true;
        }
    )
    .test(
        "currentMonthChecking",
        function() {
            return "PreviousPolicyLiabilityPolicy"
        },
        function (value) {
            // if (value == '2' ) {   
            //     return false;    
            // }
            return true;
        }
    )
    }),
    insurance_company_id:Yup.number()
    .when(['policy_type_id','lapse_duration'], {
        is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
    then: Yup.number(),
    otherwise: Yup.number().test(
        "currentMonthChecking",
        function() {
            return "PleaseEPIC"
        },
        function (value) {
            if (this.parent.policy_type_id == '2' && !value  && this.parent.valid_previous_policy == '1') {   
                return false;    
            }
            return true;
        }
    )
    }),

    previous_city:Yup.string()
    .when(['policy_type_id','lapse_duration'], {
        is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
    then: Yup.string(),
    otherwise: Yup.string().test(
        "currentMonthChecking",
        function() {
            return "PleaseEPICC"
        },
        function (value) {
            if (this.parent.policy_type_id == '2' && !value  && this.parent.valid_previous_policy == '1') {   
                return false;    
            }
            return true;
        }
    )
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/\\.,\s]*$/, 
        function() {
            return "PleaseValidAddress"
    })
    .max(100, function() {
        return "AddressMustBeMaximum100Chracters"
    })
    }),

    previous_policy_no:Yup.string()
    .when(['policy_type_id','lapse_duration'], {
        is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
    then: Yup.string(),
    otherwise: Yup.string().test(
        "currentMonthChecking",
        function() {
            return "PleaseEPPN"
        },
        function (value) {
            if (this.parent.policy_type_id == '2'&& !value  && this.parent.valid_previous_policy == '1') {   
                return false;    
            }
            return true;
        }
    )
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9\s-/]*$/, 
        function() {
            return "ValidPolicyNumber"
        }).min(6, function() {
            return "PolicyMinCharacter"
        })
        .max(28, function() {
            return "PolicyMaxCharacter"
        })
    }),

    previous_claim_bonus:Yup.string()
    .when(['policy_type_id','lapse_duration'], {
        is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
    then: Yup.string(),
    otherwise: Yup.string().test(
        "currentMonthChecking",
        function() {
            return "PleaseEPCB"
        },
        function (value) {
            if (this.parent.previous_is_claim == '0' && this.parent.previous_policy_name == '1' && (!value || value == '1') &&
            Math.floor(moment().diff(this.parent.previous_end_date, 'days', true)) <= 90) {   
                return false;    
            }
            return true;
        }
    )
    .test(
        "previousClaimChecking",
        function() {
            return "PleaseEPCB"
        },
        function (value) {
            if (this.parent.previous_is_claim == '1' && !value && this.parent.no_of_claim == '2' &&
            Math.floor(moment().diff(this.parent.previous_end_date, 'days', true)) <= 90) {   
                return false;    
            }
            return true;
        }
    )
    }),
    previous_is_claim:Yup.string()
    .when(['policy_type_id','lapse_duration'], {
        is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
    then: Yup.string(),
    otherwise: Yup.string().test(
        "currentMonthChecking",
        function() {
            return "PleaseSPC"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (this.parent.policy_type_id == '2'  && this.parent.valid_previous_policy == '1' && this.parent.previous_policy_name == '1' &&
            Math.floor(moment().diff(this.parent.previous_end_date, 'days', true)) <= 90 && !value) {   
                return false;    
            }
            return true;
        }
    ) 
    }),
    no_of_claim:Yup.string().when(['previous_is_claim'], {
        is: previous_is_claim => previous_is_claim == '1',       
        then: Yup.string().required('PleasePNOC'),
        otherwise: Yup.string()
    }),

    valid_previous_policy: Yup.string()
    .when(['policy_type_id','lapse_duration'], {
        is: (policy_type_id, lapse_duration) => (policy_type_id == '3' && lapse_duration == '2'),       
    then: Yup.string(),
    otherwise: Yup.string()
        .required(function() {
            return "RequiredField"
        })
    }),
    proposed_used_id: Yup.string().required("PleaseSPUID"),
    averagemonthlyusages_id: Yup.string().required("PleaseSAM"),
    permittypes_id: Yup.string().required("PleaseSTOP"),


    claim_array: Yup.array().of(
        Yup.object().shape({
            claim_year : Yup.string(function() {
                return "Please enter claim year"
            }).required(function() {
                return "Please enter claim year"
            }).matches(/^[0-9]*$/, function() {
                return "Invalid Year"
            }),

            claim_amount : Yup.string(function() {
                return "Please enter claim amount"
            }).required(function() {
                return "Please enter claim amount"
            }).matches(/^[0-9]*$/, function() {
                return "Invalid Amout"
            }),

            type_of_claim : Yup.string(function() {
                return "Please enter type of claim"
            }).required(function() {
                return "Please enter type of claim"
            }).matches(/^[a-zA-Z\s]*$/, function() {
                return "Invalid Value"
            })

        })
    ),

    duration: Yup.string().when(['previous_policy_name','valid_previous_policy'], {
        is: (previous_policy_name,valid_previous_policy) => (previous_policy_name=='3') && (valid_previous_policy == '1'), 
        then: Yup.string().required("Previous policy duration required"),
        otherwise: Yup.string()
    }) 
    
});


class VehicleDetailsPCV extends Component {

    state = {
        insurerList: [],
        showClaim: false,
        previous_is_claim: "",
        motorInsurance:{},
        previousPolicy: {},
        CustomerID: '',  
        suggestions: [],
        customerDetails: [],
        selectedCustomerRecords: [],
        CustIdkeyword: "",
        RTO_location: "",
        previous_is_claim: "",
        vehicleDetails: [],
        averagemonthlyusages: [],
        proposedUse: [],
        permittypes: [],
        location_reset_flag: 0,
        changeFlag: 0,
        no_of_claim: [],

    };

    dateRange = () => {
        return "2008"
    }

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
        if(localStorage.getItem('brandEdit') == '1') {
            localStorage.setItem('newBrandEdit', 1)
        }
        else if(localStorage.getItem('brandEdit') == '2') {
            localStorage.setItem('newBrandEdit', '2')
        }
        this.props.history.push(`/SelectBrand_PCV/${productId}`);
    }

    selectBrand = (productId) => {
        this.props.history.push(`/SelectBrand_PCV/${productId}`);
    }


    showClaimText = (value,values) =>{
        if(value == 1){
            this.setState({
                showClaim:true,
                previous_is_claim:1
            })
        }
        else{
            this.setState({
                showClaim:false,
                previous_is_claim:0,          
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
            let location_reset_flag = this.state.motorInsurance && this.state.motorInsurance.location_id ? 1 : 0
                this.setState({
                    CustomerID: newValue,
                    RTO_location: "",
                    location_reset_flag,
                    changeFlag: 1
                    });
            //}
        
    };
  
   getCustomerIDSuggestions(value) {
    const escapedValue = this.escapeRegexCharacters(value.trim());   
    if (escapedValue === '') {
      return [];
    }  
    // const regex = new RegExp('^' + escapedValue, 'i');
    const regex = new RegExp( escapedValue, 'i');
    if(this.state.customerDetails && escapedValue.length >1) {
      return this.state.customerDetails.filter(language => regex.test(language.RTO_LOCATION));
    }
    else return 0;
    
  }

  SuggestionSelected = (setFieldTouched,setFieldValue,suggestion) => {
    this.setState({
      changeFlag: 0, 
    });
  setFieldTouched('location_id')
  setFieldValue("location_id", suggestion.id)
}
  
  onSuggestionsFetchCustomerID = ({ value }) => {
    this.setState({
      suggestions: this.getCustomerIDSuggestions(value)
    });
  };

   getCustomerIDSuggestionValue = (suggestion) => {
    this.setState({
      selectedCustomerRecords: suggestion, changeFlag: 0, 
    });
    return suggestion.RTO_LOCATION+" - "+suggestion.RTO_Cluster;
  }
  
   renderCustomerIDSuggestion(suggestion) {
    return (
        <span>{suggestion.RTO_LOCATION+" - "+suggestion.RTO_Cluster}</span>
    );
  }
  //--------------------------------------------------------

    handleSubmit = (values, actions) => {
        
        const {productId} = this.props.match.params 
        const {motorInsurance, changeFlag} = this.state
        let policy_type = 1
        let vehicleAge = Math.floor(moment().diff(values.registration_date, 'months', true))

        if(changeFlag == 1) {
            swal("Registration city is required")
            return false
        }

        if(values.no_of_claim != values.claim_array.length && values.previous_is_claim == 1) {
            swal("Please fill all claim details")
            return false
        }

        // if((values.valid_previous_policy == "0" || values.previous_policy_name == "2" || Math.floor(moment().diff(values.previous_end_date, 'days', true)) >0 ) && values.policy_type_id == "2") {
        //     swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111")
        //     return false
        // }

        // if(values.valid_previous_policy == "0" && (motorInsurance.policytype_id == 2 || (values.policy_type_id == '3' && values.lapse_duration == '1') )) {
        //     swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111")
        //     return false
        // }

        if(Math.floor(moment().diff(values.previous_end_date, 'days', true)) > 90 || (values.policy_type_id == '3' && values.lapse_duration == '2')) {
            values.previous_claim_bonus = 1
        }


        const formData = new FormData(); 
        let encryption = new Encryption();
        let post_data = {}
        if(values.policy_type_id == '2' || (values.policy_type_id == '3' && values.lapse_duration == '1') ) {
            post_data = {
                'policy_holder_id':localStorage.getItem('policyHolder_id'),
                'menumaster_id':menumaster_id,
                'registration_date':moment(values.registration_date).format("YYYY-MM-DD"),
                'location_id':values.location_id,
                'previous_start_date': values.previous_start_date ? moment(values.previous_start_date).format("YYYY-MM-DD") : "",
                'previous_end_date':values.previous_end_date ? moment(values.previous_end_date).format("YYYY-MM-DD") : "",
                'previous_policy_name':values.previous_policy_name,
                'insurance_company_id':values.insurance_company_id,
                'previous_city':values.previous_city,
                'previous_policy_no': values.previous_policy_no,
                'previous_is_claim':values.previous_is_claim ? values.previous_is_claim : '0' ,
                'previous_claim_bonus': values.previous_claim_bonus ? values.previous_claim_bonus : 1,
                'no_of_claim': values.no_of_claim,        
                'vehicleAge': vehicleAge,
                'policy_type': policy_type,
                'prev_policy_flag': 1,
                'valid_previous_policy': values.valid_previous_policy,
                'page_name': `VehicleDetails/${productId}`,
                'claim_array': JSON.stringify(values.claim_array),
                'no_of_claim': values.no_of_claim,
                'page_name': `VehicleDetails_PCV/${productId}`,
                'duration': values.duration,
                'proposed_used_id' : values.proposed_used_id,
                'averagemonthlyusage_id': values.averagemonthlyusages_id,
                'permittype_id': values.permittypes_id,
                'is_new_policy' : 0
            } 
        }
        else if(values.policy_type_id == '1' || (values.policy_type_id == '3' && values.lapse_duration == '2') )  {
            post_data = {
                'policy_holder_id':localStorage.getItem('policyHolder_id'),
                'menumaster_id':menumaster_id,
                'registration_date':moment(values.registration_date).format("YYYY-MM-DD"),
                'location_id':values.location_id,    
                'previous_is_claim':'0', 
                'previous_claim_bonus': 1,
                'vehicleAge': vehicleAge ,
                'policy_type': policy_type,
                'prev_policy_flag': 0,
                'valid_previous_policy': 0,
                'page_name': `VehicleDetails/${productId}`,
                'claim_array': JSON.stringify(values.claim_array),
                'no_of_claim': values.no_of_claim,
                'page_name': `VehicleDetails_PCV/${productId}`,
                'duration': values.duration,
                'proposed_used_id' : values.proposed_used_id,
                'averagemonthlyusage_id': values.averagemonthlyusages_id,
                'permittype_id': values.permittypes_id,
                'is_new_policy' : 0
            } 
        }

        if(motorInsurance && motorInsurance.policytype_id == '1' && motorInsurance && motorInsurance.registration_no == "") {
            localStorage.setItem('registration_number', "NEW");
        }
        else {
            localStorage.removeItem('registration_number');
        }
        console.log("post_data", post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios
        .post(`pcv/insert-vehicle-details`, formData)
        .then(res => { 
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)

            this.props.loadingStop();
            if(decryptResp.error == false){
                this.props.history.push(`/OtherComprehensive_PCV/${productId}`);
            }
            else{
                actions.setSubmitting(false)
            }
            
        })
        .catch(err => {
          this.props.loadingStop();
          let decryptResp = JSON.parse(encryption.decrypt(err.data))
            console.log("decrypt", decryptResp)
          actions.setSubmitting(false)
        });
    }

    getInsurerList = () => {
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        this.props.loadingStart();
        axios
          .get(`/company/1/${policyHolder_id}`)
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
        let encryption = new Encryption();
        axios.get(`gcv/location-list/${policyHolder_id}`)
          .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            this.setState({
              customerDetails: decryptResp.data
            });
            this.props.loadingStop();
          })
          .catch(err => {
            this.props.loadingStop();
          });
      }

    fetchProposedUse=()=>{
        const {productId } = this.props.match.params
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.post(`pcv/proposed-use`)
            .then(res=>{
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt--fetchProposedUse------ ", decryptResp)
    
                let proposedUse = decryptResp.data        
                this.setState({ 
                    proposedUse
                })
                this.fetchData()
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    fetchVehicleCarryingList=()=>{
        const {productId } = this.props.match.params
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`gcv/carrying-capacity-list/12 `)
            .then(res=>{
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
    
                let averagemonthlyusages =  decryptResp.data ? decryptResp.data.averagemonthlyusages : []
                let permittypes =  decryptResp.data ? decryptResp.data.permittypes : []

                console.log("decrypt--fetchSubVehicle------ ", averagemonthlyusages[0].averagemonthlyusage_id)

                this.setState({ 
                    averagemonthlyusages, permittypes
                })
                this.fetchProposedUse()
            })
            .catch(err => {
                // let decryptResp = JSON.parse(encryption.decrypt(err.data))
                // console.log("decrypterr--fetchSubVehicle------ ", decryptResp)
                // handle error
                this.props.loadingStop();
            })
    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        axios.get(`pcv/policy-holder/details/${policyHolder_id}`)
            .then(res => {
                 let decryptResp = JSON.parse(encryption.decrypt(res.data))
                 console.log("decrypt", decryptResp)
                 console.log("lapseduration===", decryptResp.data.policyHolder.motorinsurance)
                 let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {};
                 motorInsurance.valid_previous_policy = motorInsurance.policytype_id && motorInsurance.policytype_id == '1' ? '0' : motorInsurance.valid_previous_policy;
                 let previousPolicy = decryptResp.data.policyHolder && decryptResp.data.policyHolder.previouspolicy ? decryptResp.data.policyHolder.previouspolicy : {};
                 let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                 let no_of_claim = previousPolicy && previousPolicy.previouspoliciesclaims ? previousPolicy.previouspoliciesclaims.length : ""
                 let RTO_location = motorInsurance && motorInsurance.rtolocation && motorInsurance.rtolocation.RTO_LOCATION ? motorInsurance.rtolocation.RTO_LOCATION : ""
                 let previous_is_claim= previousPolicy && (previousPolicy.is_claim == 0 || previousPolicy.is_claim == 1) ? previousPolicy.is_claim : ""
                this.setState({
                    motorInsurance, previousPolicy, vehicleDetails,RTO_location, previous_is_claim, no_of_claim
                })
                this.props.loadingStop();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }


    handleChange =(value) => {
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
        if(values.claim_array.length > value) {
            for(var i = claimLnt ; i >= value ; i--) {
                    values.claim_array.splice(i,1)
            }
        }
        else if(values.claim_array.length < value) {
            for(var i = values.claim_array.length ; i < value ; i++) {
                values.claim_array.push(
                        {
                        claim_amount :  "",
                        claim_year : "",
                        type_of_claim : "OwnDamage"
                    } )
            }
        }
    this.setState({no_of_claim : value}) 

    }


    initClaimDetailsList = () => {
        const {previousPolicy} = this.state
        let previous_claims = previousPolicy && previousPolicy.previouspoliciesclaims ? previousPolicy.previouspoliciesclaims : []
        let innicialClaimList = []
            for (var i = 0; i < this.state.no_of_claim ; i++) {
                innicialClaimList.push(
                    {
                    claim_amount :  previous_claims && previous_claims[i] && previous_claims[i].claim_amount ? previous_claims[i].claim_amount : "",
                    claim_year : previous_claims && previous_claims[i] && previous_claims[i].claim_year ? previous_claims[i].claim_year : "",
                    type_of_claim : "Own Damage"
                    }
                )
            }   

    return innicialClaimList
    
    };

    handleClaims = (values, errors, touched, setFieldTouched, setFieldValue) => {
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        let field_array = []
        var pol_start_date = new Date(values.previous_start_date).getFullYear()
        var pol_end_date =  pol_start_date == new Date(values.previous_end_date).getFullYear() ? pol_start_date : new Date(values.previous_end_date).getFullYear()


        for (var i = 0; i < values.no_of_claim ; i++) {
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
                                <option value= {pol_start_date}>{pol_start_date}</option>
                                <option value= {pol_end_date}>{pol_end_date}</option>
                            </Field>

                            {errors.claim_array && errors.claim_array[i] && errors.claim_array[i].claim_year ? (
                            <span className="errorMsg">{errors.claim_array[i].claim_year}</span>
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
                            <span className="errorMsg">{errors.claim_array[i].claim_amount}</span>
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
                                value = {phrases["OwnDamage"]}
                                disabled = {true}
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
        this.fetchVehicleCarryingList();
        
    }
    registration = (productId) => {
        this.props.history.push(`/Registration_PCV/${productId}`);
    }

    render() {
        const {productId} = this.props.match.params  
        const {insurerList, showClaim, previous_is_claim, motorInsurance, previousPolicy,CustomerID,suggestions, 
              vehicleDetails, RTO_location, averagemonthlyusages, proposedUse,permittypes, location_reset_flag} = this.state
              
        var defaultDate = new Date()
        var date = previousPolicy && previousPolicy.start_date ? new Date(previousPolicy.start_date) : ""

        var day = previousPolicy && previousPolicy.start_date ? date.getDate() : defaultDate.getDate()
        var month = previousPolicy && previousPolicy.start_date ? date.getMonth() : defaultDate.getMonth()      
        var year =  previousPolicy && previousPolicy.start_date ? date.getFullYear() : defaultDate.getFullYear()-1

        var pypDateToOpen = new Date(year,month,day)

        let newInitialValues = Object.assign(initialValue, {
            registration_date: motorInsurance && motorInsurance.registration_date ? new Date(motorInsurance.registration_date) : "",
            location_id:  motorInsurance && motorInsurance.location_id && location_reset_flag == 0 ? motorInsurance.location_id : "",
            previous_start_date: previousPolicy && previousPolicy.start_date ? new Date(previousPolicy.start_date) : "",
            previous_end_date: previousPolicy && previousPolicy.end_date ? new Date(previousPolicy.end_date) : "",
            previous_policy_name: previousPolicy && previousPolicy.name ? previousPolicy.name : "",
            insurance_company_id: previousPolicy && previousPolicy.insurancecompany && previousPolicy.insurancecompany.Id ? previousPolicy.insurancecompany.Id : "",
            previous_city: previousPolicy && previousPolicy.city ? previousPolicy.city : "",
            previous_policy_no: previousPolicy && previousPolicy.policy_no ? previousPolicy.policy_no : "",
            previous_is_claim: previous_is_claim,
            previous_claim_bonus: previousPolicy && (previousPolicy.claim_bonus || previousPolicy.claim_bonus == 0) ? previousPolicy.claim_bonus.toString() : "1",
            no_of_claim: previousPolicy && previousPolicy.previouspoliciesclaims ? previousPolicy.previouspoliciesclaims.length : "",
            policy_type_id: motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : "",
            valid_previous_policy: motorInsurance && (motorInsurance.valid_previous_policy == 0 || motorInsurance.valid_previous_policy == 1) ? motorInsurance.valid_previous_policy : "",           
            duration: previousPolicy && previousPolicy.duration ? previousPolicy.duration : "",
            lapse_duration: motorInsurance && motorInsurance.lapse_duration ? motorInsurance.lapse_duration : "",
            averagemonthlyusages_id: motorInsurance && motorInsurance.averagemonthlyusage_id ? motorInsurance.averagemonthlyusage_id : "",
            proposed_used_id : vehicleDetails && vehicleDetails.proposed_used_id ? vehicleDetails.proposed_used_id : "",
            permittypes_id: motorInsurance && motorInsurance.permittype_id ? motorInsurance.permittype_id : "",
            claim_array:  this.initClaimDetailsList()
        });
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        

        const inputCustomerID = {
            placeholder: phrases['SearchCity'],
            value: CustomerID ? CustomerID : RTO_location,
            onChange: this.onChangeCustomerID
          };
          

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
					
					
                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox sbbrand2">
                <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                <section className="brand m-b-25">
                    <div className="d-flex justify-content-left">
                        <div className="brandhead">
                            <h4 className="fs-18 m-b-30">{phrases['PleaseVehicleDetails']}.</h4>
                        </div>
                    </div>
                    <div className="brand-bg">
                        <Formik 
                        initialValues={newInitialValues} 
                            enableReinitialize={true} 
                            onSubmit={this.handleSubmit} 
                            validationSchema={vehicleRegistrationValidation}>
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
console.log("errors-------------- ", errors)
console.log("values======",values)
console.log("lapse duration=========",this.state. motorInsurance.lapse_duration)
                                return (
                                    <Form enableReinitialize = {true}>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>
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
                                                                minDate={values.policy_type_id == '1' ? new Date(minRegnDateNew) : new Date(minRegnDate)}
                                                                maxDate={values.policy_type_id == '1' ? new Date() : new Date(maxDate)}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText={phrases['RegDate']}
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.registration_date}
                                                                onChange={async(val) => {
                                                                    setFieldTouched('registration_date');
                                                                    await setFieldValue('registration_date', val); 

                                                                    setFieldValue('previous_end_date', ""); 
                                                                    setFieldValue('previous_start_date', "");                                                                    
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
                                                                getSuggestionValue={this.getCustomerIDSuggestionValue }
                                                                shouldRenderSuggestions={this.customerIDRender}
                                                                renderSuggestion={this.renderCustomerIDSuggestion}
                                                                inputProps={inputCustomerID} 
                                                                onChange={e=>this.onChange(e,setFieldValue)}
                                                                onSuggestionSelected={(e, {suggestion,suggestionValue}) => {
                                                                    this.SuggestionSelected(setFieldTouched,setFieldValue,suggestion)
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
                                                    <Col sm={12} md={11} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name='proposed_used_id'
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    className="formGrp inputfs12"
                                                                    value = {values.proposed_used_id}
                                                                    // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.previous_policy_name}
                                                                >
                                                                    <option value="">{phrases['SelectProposedUsage']}</option>
                                                                    {proposedUse.map((subVehicle, qIndex) => ( 
                                                                        <option value= {subVehicle.id}>{subVehicle.description}</option>
                                                                    ))}
                                                        
                                                                </Field>
                                                                {errors.proposed_used_id && touched.proposed_used_id ? (
                                                                    <span className="errorMsg">{phrases[errors.proposed_used_id]}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={11} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name='averagemonthlyusages_id'
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    className="formGrp inputfs12"
                                                                    value = {values.averagemonthlyusages_id}
                                                                    // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.previous_policy_name}
                                                                >
                                                                    <option value="">{phrases['GCVMonthlyUse']}</option>
                                                                    {averagemonthlyusages.map((monthlyusages, qIndex) => ( 
                                                                        <option value= {monthlyusages.averagemonthlyusage_id}>{monthlyusages.usage_description}</option>
                                                                    ))}
                                                        
                                                                </Field>
                                                                {errors.averagemonthlyusages_id && touched.averagemonthlyusages_id ? (
                                                                    <span className="errorMsg">{phrases[errors.averagemonthlyusages_id]}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={11} lg={3}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name='permittypes_id'
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    className="formGrp inputfs12"
                                                                    value = {values.permittypes_id}
                                                                    // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.previous_policy_name}
                                                                >
                                                                    <option value="">{phrases['GCVPermit']}</option>
                                                                    {permittypes.map((permittype, qIndex) => ( 
                                                                        <option value= {permittype.id}>{permittype.permittype}</option>
                                                                    ))}
                                                        
                                                                </Field>
                                                                {errors.permittypes_id && touched.permittypes_id ? (
                                                                    <span className="errorMsg">{phrases[errors.permittypes_id]}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                
                                                <Row>
                                                    <Col sm={12}>
                                                        <FormGroup>
                                                            <div className="carloan">
                                                                <h4>&nbsp; </h4>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            {(values.policy_type_id == '2') || (values.policy_type_id == '3' && values.lapse_duration == '1' )  ?
                                                <Fragment>
                                                    <Row>
                                                        <Col sm={12}>
                                                            <FormGroup>
                                                                <div className="carloan">
                                                                    <h4> {phrases['GCVValidPolicy']}  ? </h4>
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
                                                                            name='valid_previous_policy'                                            
                                                                            value='0'
                                                                            key='1'  
                                                                            onChange={(e) => {
                                                                                setFieldTouched('valid_previous_policy')
                                                                                setFieldValue(`valid_previous_policy`, e.target.value);
                                                                                
                                                                            }}
                                                                            checked={values.valid_previous_policy == '0' ? true : false}
                                                                        />
                                                                            <span className="checkmark " /><span className="fs-14"> {phrases['No']}</span>
                                                                        </label>
                                                                    </div>

                                                                    <div className="">
                                                                        <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='valid_previous_policy'                                            
                                                                            value='1'
                                                                            key='1'  
                                                                            onChange={(e) => {
                                                                                setFieldTouched('valid_previous_policy')
                                                                                setFieldValue(`valid_previous_policy`, e.target.value);
                                                                            }}
                                                                            checked={values.valid_previous_policy == '1' ? true : false}
                                                                        />
                                                                            <span className="checkmark" />
                                                                            <span className="fs-14">{phrases['Yes']}</span>
                                                                        </label>
                                                                        {errors.valid_previous_policy && touched.valid_previous_policy ? (
                                                                        <span className="errorMsg">{phrases[errors.valid_previous_policy]}</span>
                                                                    ) : null}
                                                                    </div>
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </Fragment> : null }

                                            {(values.policy_type_id == '2' || (values.policy_type_id == '3' && values.lapse_duration == '1' ) ) && values.valid_previous_policy == '1' ?
                                                <Fragment>
                                                <Row>
                                                    <Col sm={12}>
                                                        <FormGroup>
                                                            <div className="carloan">
                                                                <h4> </h4>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
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
                                                <Col sm={12} md={11} lg={3}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name='previous_policy_name'
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    className="formGrp inputfs12"
                                                                    value = {values.previous_policy_name}
                                                                    onChange = {(e)=> {
                                                                        if(e.target.value == '3' ) {
                                                                            if(values.duration && values.previous_start_date) {
                                                                                let date1 = ""
                                                                                date1 = moment(moment(values.previous_start_date).add(values.duration,'month')).subtract(1, 'day').format('YYYY-MM-DD')
                                                                                setFieldValue("previous_end_date", new Date(date1)); 
                                                                            }
                                                                            else setFieldValue("previous_end_date", "");
                                                                                               
                                                                        }
                                                                        else if( values.previous_start_date){
                                                                            var date = new Date(values.previous_start_date)
                                                                            date = date.setFullYear(date.getFullYear() + 1);
                                                                            var date2 = new Date(date)
                                                                            date2 = date2.setDate(date2.getDate() - 1);
                                                                            setFieldValue("previous_policy_name", e.target.value);
                                                                            setFieldValue("previous_end_date", new Date(date2))
                                                                        }
                                                                        setFieldValue("previous_policy_name", e.target.value);
                                                                    }}
                                                                    // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.previous_policy_name}
                                                                >
                                                                <option value="">{phrases['SPT']}</option>
                                                                <option value="1">{phrases['Package']}</option>
                                                                <option value="2">{phrases['LiabilityOnly']}</option> 
                                                                {/* <option value="3">{phrases['shortTerm']}</option> */}
                                                        
                                                                </Field>
                                                                {errors.previous_policy_name && touched.previous_policy_name ? (
                                                                    <span className="errorMsg">{phrases[errors.previous_policy_name]}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    { values.previous_policy_name == '3' ?
                                                    <Col sm={12} md={5} lg={3}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name='duration'
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    className="formGrp inputfs12"
                                                                    value = {values.duration}
                                                                    onChange = {(e)=> {        
                                                                        let date2 = new Date()
                                                                        var tempDate = ""
                                                                        var tempEndDate = ""
                                                                        if(values.previous_start_date) {
                                                                            date2 = moment(moment(values.previous_start_date).add(e.target.value,'month')).subtract(1, 'day').format('YYYY-MM-DD') 
                                                                            setFieldValue("previous_end_date", new Date(date2));      
                                                                        } 
                                                                        setFieldValue("duration", e.target.value);                                                                                    
                                                                    }}
                                                                    // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.previous_policy_name}
                                                                >
                                                                    <option value="">Select Duration</option>
                                                                    <option value= '1'> One Month</option>
                                                                    <option value= '2'> Two Month</option>
                                                                    <option value= '3'> Three Month</option>
                                                                    <option value= '4'> Four Month</option>
                                                                    <option value= '5'> Five Month</option>
                                                                    <option value= '6'> Six Month</option>
                                                                    <option value= '7'> Seven Month</option>
                                                                    <option value= '8'> Eight Month</option>
                                                                   
                                                                </Field>
                                                                {errors.duration && touched.duration ? (
                                                                    <span className="errorMsg">{errors.duration}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col> : null
                                                    }
                                                    <Col sm={12} md={11} lg={values.previous_policy_name == '3'? 3 : 4}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="previous_start_date"
                                                                minDate={values.policy_type_id == '3' ? new Date(minDatePypLapsed) : new Date(minDate)}
                                                                maxDate={values.previous_policy_name == '3' ? new Date(maxDatePYPST) : values.policy_type_id == '3' ? new Date(maxDatePYPLapsed) : new Date(maxDatePYP)}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText={phrases['PPSD']}
                                                                peekPreviousMonth
                                                                autoComplete="off"
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.previous_start_date}
                                                                onChange={(val) => {
                                                                    var date = new Date(val)
                                                                    var date2 = new Date(val)
                                                                    var tempDate = new Date(val)
                                                                    var tempEndDate = ""
                                                                    if(values.previous_policy_name == '3') {
                                                                        if(values.duration) {
                                                                            date2 = moment(moment(val).add(values.duration,'month')).subtract(1, 'day').format('YYYY-MM-DD')                       
                                                                        }                   
                                                                    }
                                                                    else if(values.previous_policy_name == '1' || values.previous_policy_name == '2'){
                                                                        date = date.setFullYear(date.getFullYear() + 1);
                                                                        var date2 = new Date(date)
                                                                        date2 = date2.setDate(date2.getDate() - 1);
                                                                    }          
               
                                                                    setFieldTouched('previous_start_date')
                                                                    setFieldValue("previous_end_date", new Date(date2));   
                                                                    setFieldValue('previous_start_date', val);
                                                                }}
                                                            />
                                                            {errors.previous_start_date && touched.previous_start_date ? (
                                                                <span className="errorMsg">{phrases[errors.previous_start_date]}</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={11} lg={values.previous_policy_name == '3'? 3 : 4}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="previous_end_date"
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText={phrases['PPED']}
                                                                disabled = {true}
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.previous_end_date}
                                                                // onChange={(val) => {
                                                                //     setFieldTouched('previous_end_date');
                                                                //     setFieldValue('previous_end_date', val);
                                                                // }}
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
                                                            name='insurance_company_id'
                                                            component="select"
                                                            autoComplete="off"                                                                        
                                                            className="formGrp"
                                                        >
                                                            <option value="">{phrases['SelectInsurer']}</option>
                                                            {insurerList.map((insurer, qIndex) => ( 
                                                                <option key={qIndex} value= {insurer.Id}>{insurer.name}</option>
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
                                                <Col sm={12} md={5} lg={6}>
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
                                                
                                                { (values.previous_policy_name == '1' || values.previous_policy_name == '3') && Math.floor(moment().diff(values.previous_end_date, 'days', true)) <= 90 ?
                                                    <Fragment>
                                                    <Row>
                                                        <Col sm={12}>
                                                            <FormGroup>
                                                                <div className="carloan">
                                                                    <h4> </h4>
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col sm={12}>
                                                            <FormGroup>
                                                                <div className="carloan">
                                                                    <h4>{phrases['ClaimODPolicy']}</h4>
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
                                                                                setFieldValue('no_of_claim', "")
                                                                                this.showClaimText(0, values);
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
                                                                                setFieldValue('no_of_claim', "")
                                                                                this.showClaimText(1, values);
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
                                                    { values.previous_claim_for == "2" || previous_is_claim == "0" ?
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
                                                                        value = {values.previous_claim_bonus}
                                                                        
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
                                                {showClaim || previous_is_claim == 1 ?
                                                    <Row className="m-b-30"> 
                                                        <Col sm={12} md={6} lg={6}>
                                                            <FormGroup>
                                                                <div className="formSection">
                                                                    <Field
                                                                        name='no_of_claim'
                                                                        component="select"
                                                                        autoComplete="off"                                                                        
                                                                        className="formGrp"
                                                                        value = {values.no_of_claim}
                                                                        onChange = {(e) => {
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
                                                : null }
                                                { values.no_of_claim != "" || previous_is_claim == "0" ?
                                                this.handleClaims(values, errors, touched, setFieldTouched, setFieldValue)  
                                                : null} 
                                                </Fragment> 
                                                : null}
                                                
                                            </Fragment> 
                                             : null } 

                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.selectBrand.bind(this,productId)}>
                                                    {isSubmitting ? phrases['Wait'] : phrases['Back']}
                                                </Button> 
                                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                    {isSubmitting ? phrases['Wait'] : phrases['Next']}
                                                </Button> 
                                                </div>

                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="regisBox">
                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">

                                                        <div className="txtRegistr resmb-15">{phrases['RegNo']}.<br />
                                                            {motorInsurance && motorInsurance.registration_no}</div>

                                                        <div> <button type="button" className="rgistrBtn" onClick={this.registration.bind(this, productId)}>{phrases['Edit']}</button></div>
                                                    </div>



                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                        <div className="txtRegistr resmb-15">{phrases['PCVBrand']}
                                                            - <strong>{vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : ""}</strong>
                                                        </div>

                                                        <div> <button type="button" className="rgistrBtn" onClick={this.selectBrand.bind(this, productId)}>{phrases['Edit']}</button></div>
                                                    </div>

                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                        <div className="txtRegistr">{phrases['PCVModel']}<br />
                                                        <strong>{vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : ""}</strong></div>

                                                        <div> <button type="button" className="rgistrBtn" onClick={this.selectVehicleBrand.bind(this, productId)}>{phrases['Edit']}</button></div>
                                                    </div>

                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                        <div className="txtRegistr">{phrases['BodyStyle']}<br />
                                                            <strong>{ vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.bodystyle ? vehicleDetails.varientmodel.bodystyle.DESCRIPTION: ""}</strong></div>
                                                    </div>

                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                        <div className="txtRegistr">{phrases['Power']}<br />
                                                            <strong>{ vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.horse_power ? vehicleDetails.varientmodel.horse_power+" BHP" : ""}</strong></div>
                                                    </div>

                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                        <div className="txtRegistr">{phrases['carryingCapacity']}<br />
                                                            <strong>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.carrying ? vehicleDetails.varientmodel.carrying : ""} </strong></div>
                                                    </div>

                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                        <div className="txtRegistr">{phrases['Fuel']}<br />
                                                        <strong>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fueltype ? fuel[vehicleDetails.varientmodel.fueltype.id] : null} </strong></div>

                                                    </div>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(VehicleDetailsPCV));