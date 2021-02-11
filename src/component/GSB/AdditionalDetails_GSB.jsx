import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { setSmeRiskData, setSmeData, setSmeUpdateData, setSmeOthersDetailsData, setSmeProposerDetailsData } from "../../store/actions/sme_fire";
import { connect } from "react-redux";
import moment from "moment";
import * as Yup from 'yup';
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";
import {  alphanumericCheck } from "../../shared/validationFunctions";

// alert(new Date(minDate));
const minConstructionDate = new Date(moment(moment().subtract(30, 'years').calendar()).add(0, 'day').calendar());
// const maxDate = moment().add(15, 'day').calendar();
const minDobAdult = new Date(moment(moment().subtract(65, 'years').calendar()))
const maxDobAdult = new Date(moment().subtract(18, 'years').calendar());

const minDobNominee = new Date(moment(moment().subtract(100, 'years').calendar()))
const maxDobNominee = new Date(moment().subtract(3, 'months').calendar());

const initialValues = {
    policy_type: '1',
    pinDataArr: [],
    proposer_title_id: "",
    proposer_first_name: "",
    proposer_last_name: "",
    proposer_dob: "",
    proposer_mobile: "",
    proposer_email: "",
    proposer_disability: "",
    construction_type: "",
    proposer_property_type: "",
    property_protected_type: "",
    year_of_construction: "",
    pedal_cycle_type: "",
    pedal_cycle_description: "",
    address_flag: "0",
    house_flat_no: "",
    city: "",
    house_building_name: "",
    street_name: "",
    state_name: "",
    pincode_id: "",
    area_name: "",
    nominee_first_name: "",
    nominee_dob: null,
    relation_with: "",
    appointee_relation_with: "",
    nominee_title_id: "",
    nominee_last_name: "",
    appointee_name: "",
    appointee_relation_with: "",
    is_appointee: "0"

}

const vehicleRegistrationValidation = Yup.object().shape({
    proposer_title_id: Yup.string().required('Title is required').nullable(),
    proposer_first_name: Yup.string().required('First Name is required').min(3, function () { return "First name must be 3 characters" }).max(40, function () {
        return "Full name must be maximum 40 characters"
    }).matches(/^[A-Za-z]+$/, function () { return "Please enter valid first name" }).nullable(),
    proposer_last_name: Yup.string().required('Last Name is required').min(1, function () { return "Last name must be 1 characters" }).max(40, function () { return "Full name must be maximum 40 characters" })
        .matches(/^[A-Za-z]+$/, function () {
            return "Please enter valid last name"
        }).nullable(),
    // proposer_last_name: Yup.string().required('Name is required').nullable(),
    proposer_dob: Yup.date().required("Please enter date of birth").nullable(),
    proposer_email: Yup.string().email().required('Email is required').min(8, function () {
        return "Email must be minimum 8 characters"
    })
        .max(75, function () {
            return "Email must be maximum 75 characters"
        }).matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9]+)*@\w+([-]?\w+)*(\.\w{2,3})+$/, 'Invalid Email Id').nullable(),
    proposer_mobile: Yup.string()
        .matches(/^[6-9][0-9]{9}$/, 'Invalid Mobile number').required('Mobile No. is required').nullable(),
        
    house_building_name:  Yup.string().when(["address_flag"], {
        is: address_flag => address_flag == '0',          
        then:Yup.string()
        .test(
            "buildingNameCheck",
            function() {
                return "Please enter building name"
            },
            function (value) {
                if (this.parent.house_flat_no || value) {
                   
                    return true
                }
                return false;
        }) .matches(/^(?![0-9]*$)+([\s]?[\/a-zA-Z0-9.,-])+$/, 'Please enter a valid building name only')
            .matches(/^([a-zA-Z0-9.,-\/]+\s)*[\/a-zA-Z0-9.,-]+$/, 'The field should have only one space in between words').nullable(),
        otherwise: Yup.string()
    }),

    // block_no: Yup.string().required("Please enter Plot number").nullable(),
    house_flat_no: Yup.string().when(["address_flag"], {
        is: address_flag => address_flag == '0', 
        then: Yup.string()
        .test(
            "buildingNameCheck",
            function() {
                return "Please enter Plot No"
            },
            function (value) {
                if (value) {               
                    return true
                }
                return false;
        }).matches(/^[\/a-zA-Z0-9.,-]*$/, 'Please enter a valid plot number only').nullable(),
        otherwise: Yup.string()
        .test(
            "buildingNameCheck",
            function() {
                return "Please enter Plot No"
            },
            function (value) {
                if (value) {
                    return true
                }
                return false;
        }).matches(/^[\/a-zA-Z0-9.,-]*$/, 'Please enter a valid plot number only').nullable()
    }),
    city: Yup.string().when(["address_flag"], {
        is: address_flag => address_flag == '0', 
        then: Yup.string()
        .required("Please enter city")
        .matches(/^[a-zA-Z]*$/, function () {
            return "Please enter valid city";
        })
        .nullable(),
        otherwise: Yup.string()
    }),
    street_name: Yup.string().when(["address_flag"], {
        is: address_flag => address_flag == '0', 
        then: Yup.string()
        .required("Please enter street name").matches(/^(?![0-9]*$)+([\s]?[\/a-zA-Z0-9.,-])+$/, 'Please enter a valid street name only')
        .matches(/^([a-zA-Z0-9.,-\/]+\s)*[\/a-zA-Z0-9.,-]+$/, 'The field should have only one space in between words').nullable(),
        otherwise: Yup.string()
    }),
    state_name: Yup.string().when(["address_flag"], {
        is: address_flag => address_flag == '0', 
        then: Yup.string()
        .required("Please enter state")
        .matches(/^[a-zA-Z]+([\s]?[a-zA-Z])*$/, function () {
            return "Please enter valid state";
        })
        .nullable(),
        otherwise: Yup.string()
    }),
    pincode_id: Yup.string().when(["address_flag"], {
        is: address_flag => address_flag == '0', 
        then: Yup.string()
        .required("Pincode is required")
        .matches(/^[0-9]{6}$/, function () {
            return "Please enter valid 6 digit pin code";
        })
        .nullable(),
        otherwise: Yup.string()
    }),
    area_name: Yup.string().when(["address_flag"], {
        is: address_flag => address_flag == '0', 
        then: Yup.string().required("Please select locality")
        .nullable(),
        otherwise: Yup.string()
    }),

    proposer_disability: Yup.string().required("Please select optioin for disability")
    .test(
        "policyIssueChecking",
        function() {
            return "Policy cannot be issued"
        },
        function (value) {
            if (value == '1' ) {   
                return false;    
            }
            return true;
        }
    ),
    construction_type: Yup.string().required("Please select type of construction")
    .test(
        "policyIssueChecking",
        function() {
            return "Policy cannot be issued"
        },
        function (value) {
            if (value == '0' ) {   
                return false;    
            }
            return true;
        }
    ),
    proposer_property_type: Yup.string().required("Please select option for proposed property")
    .test(
        "policyIssueChecking",
        function() {
            return "Policy cannot be issued"
        },
        function (value) {
            if (value == '1' ) {   
                return false;    
            }
            return true;
        }
    ),
    property_protected_type: Yup.string().required("Please select option for protected with doors/windows/grill")
    .test(
        "policyIssueChecking",
        function() {
            return "Policy cannot be issued"
        },
        function (value) {
            if (value == '0' ) {   
                return false;    
            }
            return true;
        }
    ),
    year_of_construction: Yup.string().required("Please enter construction year").nullable(),
    pedal_cycle_type: Yup.string().required("Please select cycle list").nullable(),
    pedal_cycle_description: Yup.string().notRequired("Please enter description")
    .matches(/^[a-zA-Z]+([\s]?[a-zA-Z])*$/, function () {
        return "Invalid description entered";
      })
      .nullable(),
    // NOMINEE--------
    nominee_title_id: Yup.string().required('Title is required').nullable(),
    nominee_first_name: Yup.string()
        .required("Nominee Name is required")
        .min(3, function () {
            return "Nominee Name must be 3 characters";
        })
        .max(40, function () {
            return "Nominee Name must be maximum 40 characters";
        })
        .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)$/, function () {
            return "Please enter valid nominee name";
        })
        .nullable(),
    nominee_last_name:  Yup.string()
        .required("Nominee last name is required")
        .min(1, function () {
            return "Nominee last name must be 3 characters";
        })
        .max(40, function () {
            return "Nominee last name must be maximum 40 characters";
        })
        .matches(/^[a-zA-Z]*$/, function () {
            return "Please enter valid nominee last name";
        })
    .nullable(),
    nominee_dob: Yup.date().required("Please enter date of birth").nullable(),
    relation_with: Yup.string().required(function () {
        return "Please select relation";
    }),
    appointee_name: Yup.string().when(['is_appointee'], {
        is: is_appointee => is_appointee == '1',       
        then: Yup.string().required("Please enter appointee name")
                .min(3, function() {
                    return "Name must be minimum 3 characters"
                })
                .max(40, function() {
                    return "Name must be maximum 40 characters"
                })        
                .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)([\s]?[a-zA-Z]+)$/, function() {
                    return "Please enter valid name"
                }).test(
                    "18YearsChecking",
                    function() {
                        return "Please enter appointee name"
                    },
                    function (value) {
                        const ageObj = new PersonAge();
                        if (ageObj.whatIsMyAge(this.parent.nominee_dob) < 18 && !value) {   
                            return false  
                        }
                        return true;
                    }
                ),
        otherwise: Yup.string().notRequired("Please enter appointee name")
                .min(3, function() {
                    return "Name must be minimum 3 characters"
                })
                .max(40, function() {
                    return "Name must be maximum 40 characters"
                })        
                .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)([\s]?[a-zA-Z]+)$/, function() {
                    return "Please enter valid name"
                }).test(
                    "18YearsChecking",
                    function() {
                        return "Please enter appointee name"
                    },
                    function (value) {
                        const ageObj = new PersonAge();
                        if (ageObj.whatIsMyAge(this.parent.nominee_dob) < 18 && !value) {   
                            return false  
                        }
                        return true;
                    }
                )
    }),

    appointee_relation_with: Yup.string().when(['is_appointee'], {
        is: is_appointee => is_appointee == '1',       
        then: Yup.string().required("Please select relation")
                .test(
                    "18YearsChecking",
                    function() {
                        return 'Apppointee relation is required'
                    },
                    function (value) {
                        const ageObj = new PersonAge();
                        if (ageObj.whatIsMyAge(this.parent.nominee_dob) < 18 && !value) {   
                            return false;    
                        }
                        return true;
                    }
                ),
        otherwise: Yup.string().notRequired("Please select relation")
                .test(
                    "18YearsChecking",
                    function() {
                        return 'Apppointee relation is required'
                    },
                    function (value) {
                        const ageObj = new PersonAge();
                        if (ageObj.whatIsMyAge(this.parent.nominee_dob) < 18 && !value) {   
                            return false;    
                        }
                        return true;
                    }
                )
    }),
})


class AdditionalDetails_GSB extends Component {
    state = {
        motorInsurance: '',
        regno: '',
        length: 14,
        fastlanelog: [],
        appointeeFlag: false,
        is_appointee: 0,
        titleList: [],
        cycleList: [],
        cityName:"",
        stateName: "",
        serverResponse: [],
        riskAddressDetails: [],
        commAddressDetails: [],
        address_flag: "0"
    }

    handleChange = date => {
        // this.setState({ startDate: date });  
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }


    componentDidMount() {
        this.fetchSalutation();

    }

    fetchSalutation = () => {
        const formData = new FormData();
        let encryption = new Encryption();
        this.props.loadingStart();
        let post_data = {
          'policy_for_flag': '1',
        }
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        axios.post('ipa/titles', formData)
          .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            // console.log("titles-list------ ",decryptResp)
            let titleList = decryptResp.data.salutationlist
            this.setState({
              titleList
            });
            this.fetchPedalCycleList();
          }).
          catch(err => {
            this.props.loadingStop();
            this.setState({
              titleList: []
            });
          })
      }

    fetchPedalCycleList = () => {
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get('gsb/gsb-pedal-cycle-list')
          .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            // console.log("pedal-cycle-list------ ",decryptResp)
            let cycleList = decryptResp.data.gsb_cycle_list
            this.setState({
                cycleList
            });
            this.fetchRelationshipList();
          }).
          catch(err => {
            this.props.loadingStop();
            this.setState({
                cycleList: []
            });
          })
      }

      fetchRelationshipList = () => {
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get('gsb/gsb-relation-list')
          .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("relation ---------- ", decryptResp)
            let nomineeRelation = decryptResp.data.relation_nominee_appointee ? decryptResp.data.relation_nominee_appointee.nominee_relations : []
            let appointeeRelation = decryptResp.data.relation_nominee_appointee ? decryptResp.data.relation_nominee_appointee.appointee_relations : []
            this.setState({
                nomineeRelation , appointeeRelation
            });
            this.fetchPolicyDetails();
          }).
          catch(err => {
            this.props.loadingStop();
            this.setState({
                cycleList: []
            });
          })
      }

    fetchPolicyDetails = () => {
        const { productId } = this.props.match.params;
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        axios
            .get(`gsb/gsb-policy-details/${policyHolder_refNo}`)
            .then((res) => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                let gsb_Details = decryptResp.data && decryptResp.data.policyHolder ? decryptResp.data.policyHolder : null;
                let riskAddressDetails = gsb_Details && gsb_Details.gsbinfo ? JSON.parse(gsb_Details.gsbinfo.risk_address) : null
                let commAddressDetails = gsb_Details ? JSON.parse(gsb_Details.address) : null
                let nomineeDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.nominee[0] : {}
                console.log("---GSB info--->>", decryptResp);
                this.setState({
                    gsb_Details, riskAddressDetails, commAddressDetails,
                    address_flag :  gsb_Details && gsb_Details.gsbinfo ? gsb_Details.gsbinfo.address_flag : "0",
                    is_appointee: nomineeDetails ? nomineeDetails.is_appointee : "0"
                });
                let pincode = gsb_Details && gsb_Details.gsbinfo && gsb_Details.gsbinfo.address_flag == '1' ? gsb_Details.gsbinfo.pincode : gsb_Details ? gsb_Details.pincode : ""
                this.fetchAreadetailsBack(pincode)
                this.props.loadingStop();
            })
            .catch((err) => {
                // handle error
                this.props.loadingStop();
            });
    }
    planInfo = (productId) => {
        this.props.history.push(`/SelectPlan_GSB/${productId}`);
    }

    handleSubmit = (values, actions) => {
        const { productId } = this.props.match.params;
        const formData = new FormData();
        let encryption = new Encryption();
        let policyHolder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') :0
        let post_data = {
            'menumaster_id': '5',
            'page_name': `AdditionalDetails_GSB/${productId}`,
            'policy_holder_id': policyHolder_id,
            'construction_type':values.construction_type,
            'house_building_name': values.house_building_name,
            'house_flat_no': values.house_flat_no,
            'nominee_dob': values.nominee_dob ? moment(values.nominee_dob).format("YYYY-MM-DD") : "" ,
            'nominee_first_name': values.nominee_first_name,
            'nominee_last_name': values.nominee_last_name,
            'nominee_title_id': values.nominee_title_id,
            'pedal_cycle_type': values.pedal_cycle_type,
            'area_name': values.area_name,
            'property_protected_type': values.property_protected_type,
            'proposer_disability': values.proposer_disability,
            'proposer_dob': values.proposer_dob ? moment(values.proposer_dob).format("YYYY-MM-DD") : "" ,
            'proposer_email': values.proposer_email,
            'proposer_first_name': values.proposer_first_name,
            'proposer_last_name': values.proposer_last_name,
            'proposer_mobile': values.proposer_mobile,
            'proposer_property_type': values.proposer_property_type,
            'proposer_title_id': values.proposer_title_id,
            'street_name': values.street_name,
            'year_of_construction': values.year_of_construction ? moment(values.year_of_construction).format("YYYY-MM-DD") : "",
            'pincode_id': values.area_name,
            'relation_with': values.relation_with,
            'address_flag': values.address_flag,
            'appointee_name': values.appointee_name,
            'appointee_relation_with': values.appointee_relation_with,
            'is_appointee': this.state.is_appointee,
            'pedal_cycle_description': values.pedal_cycle_description,

        }

        if (sessionStorage.getItem('csc_id')) {
            post_data['bcmaster_id'] = '5'
            post_data['csc_id'] = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : ""
            post_data['agent_name'] = sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : ""
            post_data['product_id'] = productId
        } else {
            let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
            if (bc_data) {
                bc_data = JSON.parse(encryption.decrypt(bc_data));
                post_data['bcmaster_id'] = bc_data ? bc_data.agent_id : ""
                post_data['bc_token'] = bc_data ? bc_data.token : ""
                post_data['bc_agent_id'] = bc_data ? bc_data.user_info.data.user.username : ""
                post_data['product_id'] = productId
            }
        }

        this.props.loadingStart();
        console.log('Post Data-----', post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        axios
        .post('gsb/set-proposer-with-aditional-info', formData)
        .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp--/set-proposer-with-aditional-info------', decryptResp)
            if (decryptResp.error === false) {
                this.props.loadingStop();
                this.props.history.push(`/PolicyDetails_GSB/${productId}`);
            } else {
                this.props.loadingStop();
                swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111");
                actions.setSubmitting(false);
            }
        }).
            catch(err => {
                this.props.loadingStop();
                let decryptResp = JSON.parse(encryption.decrypt(err.data));
                console.log('decryptErr-----', decryptResp)
                actions.setSubmitting(false);
            })
    }


    fetchAreadetails = (e, setFieldValue, setFieldTouched) => {
        let pinCode = e.target.value;
    
        if (pinCode.length == 6) {
          const formData = new FormData();
          this.props.loadingStart();
          // let encryption = new Encryption();
          const post_data_obj = {
            pincode_id: pinCode,
          };
          //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
          formData.append("pincode", pinCode);
          axios
            .post("pincode-details", formData)
            .then((res) => {
              if (res.data.error === false) {
                let stateName =
                  res.data.data &&
                  res.data.data[0] &&
                  res.data.data[0].pinstate.STATE_NM
                    ? res.data.data[0].pinstate.STATE_NM
                    : "";

                let cityName =
                    res.data.data &&
                    res.data.data[0] &&
                    res.data.data[0].pincity.CITY_NM
                      ? res.data.data[0].pincity.CITY_NM
                      : "";
                this.setState({
                  pinDataArr: res.data.data,
                  stateName, cityName
                });
                setFieldValue("state_name", stateName);
                setFieldTouched("state_name");
                setFieldValue("city", cityName);
                setFieldTouched("city");

                this.props.loadingStop();
              } else {
                this.props.loadingStop();
                swal("Plese enter a valid pincode_id");
              }
            })
            .catch((err) => {
              this.props.loadingStop();
            });
        }
    };

    fetchAreadetailsBack = (pincode_input,setFieldValue, setFieldTouched) => {
        let pinCode = pincode_input ? pincode_input.toString() : "";

        if (pinCode != null && pinCode != "" && pinCode.length == 6) {
            
            const formData = new FormData();
            this.props.loadingStart();
            // let encryption = new Encryption();
            const post_data_obj = {
                pincode_id: pinCode,
            };
            // formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
            formData.append("pincode", pinCode);
            axios
                .post("pincode-details", formData)
                .then((res) => {
                    let stateName =
                        res.data.data &&
                            res.data.data[0] &&
                            res.data.data[0].pinstate.STATE_NM
                            ? res.data.data[0].pinstate.STATE_NM
                            : "";
                    let cityName =
                        res.data.data &&
                            res.data.data[0] &&
                            res.data.data[0].pincity.CITY_NM
                              ? res.data.data[0].pincity.CITY_NM
                              : "";

                    this.setState({
                        pinDataArr: res.data.data,
                        stateName, cityName
                    });

                    if(setFieldValue) {
                        setFieldTouched("state_name")
                        setFieldTouched("pincode_id")
                        setFieldValue(`state_name`,stateName);
                        setFieldValue(`pincode_id`,pincode_input);
                    }       

                    this.props.loadingStop();
                })
                .catch((err) => {
                    this.props.loadingStop();
                });
                      
        }
    };
    ageCheck = (value) => {
        const ageObj = new PersonAge();
        let age = ageObj.whatIsMyAge(value)
        if (age < 18) {
            this.setState({
                appointeeFlag: true,
                is_appointee: 1
            })
        }
        else {
            this.setState({
                appointeeFlag: false,
                is_appointee: 0
            })
        }
    }


    render() {
        const { pinDataArr, appointeeFlag, is_appointee, titleList, cycleList, stateName, cityName, gsb_Details, 
                riskAddressDetails, commAddressDetails, address_flag, nomineeRelation , appointeeRelation } = this.state
        const {productId } = this.props.match.params
        const newInitialValues = Object.assign(initialValues, {
            proposer_title_id: gsb_Details && gsb_Details.salutation_id != '0'? gsb_Details.salutation_id : "",
            proposer_first_name: gsb_Details ? gsb_Details.first_name : "",
            proposer_last_name: gsb_Details ? gsb_Details.last_name : "",
            proposer_dob: gsb_Details && gsb_Details.dob ? new Date(gsb_Details.dob) : "",
            proposer_mobile: gsb_Details ? gsb_Details.mobile : "",
            proposer_email: gsb_Details ? gsb_Details.email_id : "",
            proposer_disability: gsb_Details && gsb_Details.gsbinfo ? gsb_Details.gsbinfo.proposer_disability : "",
            construction_type: gsb_Details && gsb_Details.gsbinfo ? gsb_Details.gsbinfo.construction_type : "",
            proposer_property_type: gsb_Details && gsb_Details.gsbinfo ? gsb_Details.gsbinfo.proposer_property_type : "",
            property_protected_type: gsb_Details && gsb_Details.gsbinfo ? gsb_Details.gsbinfo.property_protected_type : "",
            year_of_construction: gsb_Details && gsb_Details.gsbinfo && gsb_Details.gsbinfo.year_of_construction ? new Date(moment(gsb_Details.gsbinfo.year_of_construction).format("YYYY-MM-DD")) : "",
            pedal_cycle_type: gsb_Details && gsb_Details.gsbinfo ? gsb_Details.gsbinfo.pedal_cycle_type : "",
            pedal_cycle_description: gsb_Details && gsb_Details.gsbinfo ? gsb_Details.gsbinfo.pedal_cycle_description : "",
            check_box: "0",
            house_flat_no: address_flag == '1' && riskAddressDetails.house_flat_no ? riskAddressDetails.house_flat_no : commAddressDetails ? commAddressDetails.house_flat_no : "" ,
            city: address_flag == '1' ? riskAddressDetails.city : gsb_Details ? gsb_Details.city : "" ,
            house_building_name: address_flag == '1' ? riskAddressDetails.house_building_name : commAddressDetails ? commAddressDetails.house_building_name : "" ,
            street_name: address_flag == '1' ? riskAddressDetails.area_name : commAddressDetails ? commAddressDetails.street_name : "" ,
            state_name: address_flag == '1' ? riskAddressDetails.state : gsb_Details ? gsb_Details.state : "" ,
            pincode_id: address_flag == '1' ? riskAddressDetails.pincode : gsb_Details ? gsb_Details.pincode : "" ,
            area_name: address_flag == '1' ? gsb_Details && gsb_Details.gsbinfo &&  gsb_Details.gsbinfo.pincode_id != '0' ?  gsb_Details.gsbinfo.pincode_id : "" : gsb_Details && gsb_Details.pincode_id != '0' ? gsb_Details.pincode_id : ""  ,
            nominee_title_id: gsb_Details && gsb_Details.request_data && gsb_Details.request_data.nominee && gsb_Details.request_data.nominee.length>0 ? gsb_Details.request_data.nominee[0].title_id : "",
            nominee_first_name: gsb_Details && gsb_Details.request_data && gsb_Details.request_data.nominee && gsb_Details.request_data.nominee.length>0 ? gsb_Details.request_data.nominee[0].first_name : "",
            nominee_dob: gsb_Details && gsb_Details.request_data && gsb_Details.request_data.nominee && gsb_Details.request_data.nominee.length>0 && gsb_Details.request_data.nominee[0].dob ? new Date(moment(gsb_Details.request_data.nominee[0].dob).format("YYYY-MM-DD")) : "",
            relation_with: gsb_Details && gsb_Details.request_data && gsb_Details.request_data.nominee && gsb_Details.request_data.nominee.length>0 ? gsb_Details.request_data.nominee[0].relation_with : "",
            nominee_last_name: gsb_Details && gsb_Details.request_data && gsb_Details.request_data.nominee && gsb_Details.request_data.nominee.length>0 ? gsb_Details.request_data.nominee[0].last_name : "",
            address_flag: gsb_Details && gsb_Details.gsbinfo ? gsb_Details.gsbinfo.address_flag : "",
            appointee_name: gsb_Details && gsb_Details.request_data && gsb_Details.request_data.nominee && gsb_Details.request_data.nominee.length>0 ? gsb_Details.request_data.nominee[0].appointee_name : "",
            appointee_relation_with: gsb_Details && gsb_Details.request_data && gsb_Details.request_data.nominee && gsb_Details.request_data.nominee.length>0 ? gsb_Details.request_data.nominee[0].appointee_relation_with : "",
            is_appointee: this.state.is_appointee,
            plot_number: commAddressDetails ? commAddressDetails.plot_number : ""
        })
// console.log("newInitialValues------- ", newInitialValues)
        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited </h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <Formik initialValues={newInitialValues}
                                             onSubmit={this.handleSubmit}
                                            validationSchema={vehicleRegistrationValidation}
                                        >
                                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                                // console.log('errors-------- ',errors)

                                                return (
                                                    <Form>
                                                        <div className="brandhead">
                                                            <h4 className="fs-18 m-b-30">Please share a few more details.</h4>
                                                        </div>
                                                        <div className="brandhead">
                                                            <h4 className="fs-18 m-b-30">PROPOSER DETAILS</h4>
                                                        </div>
                                                        <Row>
                                                            <Col sm={12} md={3} lg={2}>
                                                                <FormGroup>
                                                                    <div className="formSection">
                                                                        <Field
                                                                            name='proposer_title_id'
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            className="formGrp"
                                                                        >
                                                                            <option value="">Title</option>
                                                                            {titleList.map((title, qIndex) => ( 
                                                                            <option value={title.id}>{title.displayvalue}</option>
                                                                            ))}
                                                                        </Field>
                                                                        {errors.proposer_title_id && touched.proposer_title_id ? (
                                                                            <span className="errorMsg">{errors.proposer_title_id}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>

                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name='proposer_first_name'
                                                                            type="text"
                                                                            placeholder="First Name"
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value={values.proposer_first_name}
                                                                        />
                                                                        {errors.proposer_first_name && touched.proposer_first_name ? (
                                                                            <span className="errorMsg">{errors.proposer_first_name}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>

                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name='proposer_last_name'
                                                                            type="text"
                                                                            placeholder="Last Name"
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value={values.proposer_last_name}
                                                                        />
                                                                        {errors.proposer_last_name && touched.proposer_last_name ? (
                                                                            <span className="errorMsg">{errors.proposer_last_name}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>

                                                        <Row>
                                                            <Col sm={12} md={3} lg={2}>
                                                                <FormGroup>
                                                                    <DatePicker
                                                                        name="proposer_dob"
                                                                        dateFormat="dd MMM yyyy"
                                                                        placeholderText="DOB"
                                                                        peekPreviousMonth
                                                                        peekPreviousYear
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        maxDate={maxDobAdult}
                                                                        minDate={minDobAdult}
                                                                        className="datePckr"
                                                                        selected={values.proposer_dob}
                                                                        onChange={(val) => {
                                                                            setFieldTouched('proposer_dob');
                                                                            setFieldValue('proposer_dob', val);
                                                                        }}
                                                                    />
                                                                    {errors.proposer_dob && touched.proposer_dob ? (
                                                                        <span className="errorMsg">{errors.proposer_dob}</span>
                                                                    ) : null}
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup className="m-b-25">
                                                                    <div className="insurerName nmbract">
                                                                        <span>+91</span>
                                                                        <Field
                                                                            name='proposer_mobile'
                                                                            type="text"
                                                                            placeholder="Mobile No. "
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value={values.proposer_mobile}
                                                                            maxLength="10"
                                                                            className="phoneinput pd-l-25"
                                                                        />
                                                                        {errors.proposer_mobile && touched.proposer_mobile ? (
                                                                            <span className="errorMsg msgpositn">{errors.proposer_mobile}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name='proposer_email'
                                                                            type="email"
                                                                            placeholder="Email "
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value={values.proposer_email}
                                                                        />
                                                                        {errors.proposer_email && touched.proposer_email ? (
                                                                            <span className="errorMsg">{errors.proposer_email}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h7>Do you have any existing imfimity/disability?</h7>
                                                                <div className="d-inline-flex m-b-15 m-l-20">
                                                                    <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='proposer_disability'
                                                                                value='1'
                                                                                key='1'
                                                                                checked={values.proposer_disability == '1' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('proposer_disability')
                                                                                    setFieldValue('proposer_disability', '1');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> Yes</h7></span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='proposer_disability'
                                                                                value='0'
                                                                                key='1'
                                                                                checked={values.proposer_disability == '0' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('proposer_disability')
                                                                                    setFieldValue('proposer_disability', '0');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> No</h7></span>
                                                                        </label>
                                                                        {errors.proposer_disability && touched.proposer_disability ? (
                                                                            <span className="errorMsg">{errors.proposer_disability}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="brandhead">
                                                            <h4 className="fs-18 m-b-30">ADDITIONAL RISK DETAILS</h4>
                                                        </div>
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h6>Type of construction</h6>
                                                                <div className="d-inline-flex m-b-15">
                                                                    <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='construction_type'
                                                                                value='1'
                                                                                key='1'
                                                                                checked={values.construction_type == '1' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('construction_type')
                                                                                    setFieldValue('construction_type', '1');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> Pukka Construction</h7></span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='construction_type'
                                                                                value='0'
                                                                                key='1'
                                                                                checked={values.construction_type == '0' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('construction_type')
                                                                                    setFieldValue('construction_type', '0');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> Kuchha Construction</h7></span>
                                                                        </label>
                                                                        {errors.construction_type && touched.construction_type ? (
                                                                            <span className="errorMsg">{errors.construction_type}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h6>Is the proposed property in Basement?</h6>
                                                                <div className="d-inline-flex m-b-15">
                                                                    <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='proposer_property_type'
                                                                                value='1'
                                                                                key='1'
                                                                                checked={values.proposer_property_type == '1' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('proposer_property_type')
                                                                                    setFieldValue('proposer_property_type', '1');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> Yes</h7></span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='proposer_property_type'
                                                                                value='0'
                                                                                key='1'
                                                                                checked={values.proposer_property_type == '0' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('proposer_property_type')
                                                                                    setFieldValue('proposer_property_type', '0');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> No</h7></span>
                                                                        </label>
                                                                        {errors.proposer_property_type && touched.proposer_property_type ? (
                                                                            <span className="errorMsg">{errors.proposer_property_type}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h6>All the openings protected with doors/windows/grills?</h6>
                                                                <div className="d-inline-flex m-b-15">
                                                                    <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='property_protected_type'
                                                                                value='1'
                                                                                key='1'
                                                                                checked={values.property_protected_type == '1' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('property_protected_type')
                                                                                    setFieldValue('property_protected_type', '1');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> Yes</h7></span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='property_protected_type'
                                                                                value='0'
                                                                                key='1'
                                                                                checked={values.property_protected_type == '0' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('property_protected_type')
                                                                                    setFieldValue('property_protected_type', '0');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> No</h7></span>
                                                                        </label>
                                                                        {errors.property_protected_type && touched.property_protected_type ? (
                                                                            <span className="errorMsg">{errors.property_protected_type}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h7>Year of construction</h7>
                                                                <div className="d-inline-flex m-b-16 m-l-20">
                                                                    <div className="p-r-25">
                                                                    <FormGroup>
                                                                        <DatePicker
                                                                            name="year_of_construction"
                                                                            dateFormat="dd MMM yyyy"
                                                                            placeholderText="Year of construction"
                                                                            minDate={minConstructionDate}
                                                                            maxDate={new Date()}
                                                                            peekPreviousMonth
                                                                            peekPreviousYear
                                                                            showMonthDropdown
                                                                            showYearDropdown
                                                                            dropdownMode="select"
                                                                            className="datePckr inputfs12"
                                                                            selected={values.year_of_construction}
                                                                            onChange={(val) => {
                                                                                setFieldTouched('year_of_construction');
                                                                                setFieldValue('year_of_construction', val);
                                                                                }}
                                                                        />
                                                                        {errors.year_of_construction && touched.year_of_construction ? (
                                                                            <span className="errorMsg">{errors.year_of_construction}</span>
                                                                        ) : null}  
                                                                    </FormGroup>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h7>Pedal Cylce Description</h7>
                                                                <div className="d-inline-flex m-b-16 m-l-20">
                                                                    <div className="p-r-25">
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                                <Field
                                                                                    name="pedal_cycle_type"
                                                                                    component="select"
                                                                                    autoComplete="off"
                                                                                    className="formGrp"
                                                                                >
                                                                                    <option value="">Cycle List</option>
                                                                                     {cycleList.map((cycleList, qIndex) => ( 
                                                                                        <option value={cycleList.id}>{cycleList.type_name}</option>
                                                                                        ))}
                                                                                </Field>
                                                                                {errors.pedal_cycle_type && touched.pedal_cycle_type ? (
                                                                                    <span className="errorMsg">
                                                                                        {errors.pedal_cycle_type}
                                                                                    </span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </div>
                                                                </div>
                                                                <div className="d-inline-flex m-b-16 m-l-20">
                                                                    <div className="p-r-25">
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                <Field
                                                                                    name='pedal_cycle_description'
                                                                                    type="text"
                                                                                    placeholder="Description"
                                                                                    autoComplete="off"
                                                                                    maxLength = {50}
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value={values.pedal_cycle_description}
                                                                                />
                                                                                {errors.pedal_cycle_description && touched.pedal_cycle_description ? (
                                                                                    <span className="errorMsg">{errors.pedal_cycle_description}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Row >
                                                            <Col sm={12} md={3} lg={2}> &nbsp;
                                                            </Col>
                                                        </Row>
                                                        <div className="brandhead">
                                                            <h4 className="fs-18 m-b-30">COMMUNICATION ADDRESS</h4>
                                                        </div>
                                                        <label className="customCheckBox">Is communication address same as risk location address
                                                            <Field
                                                                type="checkbox"
                                                                name="address_flag"
                                                                value="1"
                                                                className="user-self"
                                                                // value={values.address_flag}
                                                                onChange={(e) => {
                                                                    if (e.target.checked === true) {
                                                                        setFieldValue('address_flag', e.target.value); 
                                                                        setFieldValue(`house_flat_no`, riskAddressDetails.house_flat_no);
                                                                        setFieldValue(`city`, riskAddressDetails.city);
                                                                        setFieldValue(`house_building_name`, riskAddressDetails.house_building_name);
                                                                        setFieldValue(`street_name`, riskAddressDetails.area_name);
                                                                        setFieldValue(`state_name`, riskAddressDetails.state_name);
                                                                        setFieldValue(`pincode_id`, riskAddressDetails.pincode_id);
                                                                        setFieldValue(`area_name`,  gsb_Details && gsb_Details.gsbinfo && gsb_Details.gsbinfo.pincode_id);
                                                                        this.setState({
                                                                            address_flag: e.target.value
                                                                        })
                                                                        this.fetchAreadetailsBack(riskAddressDetails.pincode)
                                                                        
                                                                    } else {
                                                                        setFieldValue('address_flag', '0'); 
                                                                        this.setState({
                                                                            address_flag: 0
                                                                        })       
                                                                        setFieldTouched("house_flat_no")
                                                                        setFieldTouched("city")
                                                                        setFieldTouched("house_building_name")
                                                                        setFieldTouched("street_name")
                                                                        setFieldTouched("state_name")
                                                                        setFieldTouched("pincode_id")
                                                                        setFieldTouched("area_name")
 
                                                                        setFieldValue(`house_flat_no`,"");
                                                                        setFieldValue(`city`, "");
                                                                        setFieldValue(`house_building_name`,"");
                                                                        setFieldValue(`street_name`,"");
                                                                        setFieldValue(`state_name`,"");
                                                                        setFieldValue(`pincode_id`,"");
                                                                        setFieldValue(`area_name`,"");
                                                                        //this.fetchAreadetailsBack(gsb_Details && gsb_Details.pincode, setFieldValue, setFieldTouched)                                                  
                                                                    }  
                                                                }}
                                                                checked={values.address_flag == '1' ? true : false}
                                                            />
                                                            {errors.address_flag && touched.address_flag ? (
                                                                <span className="errorMsg">
                                                                    {errors.address_flag}
                                                                </span>
                                                            ) : null}
                                                            <span className="checkmark mL-0"></span>
                                                            <span className="error-message"></span></label>
                                                        <Row></Row>
                                                        <Row>
                                                            <Col sm={6} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name="house_flat_no"
                                                                            type="text"
                                                                            placeholder="Plot No."
                                                                            autoComplete="off"
                                                                            onFocus={(e) =>
                                                                                this.changePlaceHoldClassAdd(e)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                this.changePlaceHoldClassRemove(e)
                                                                            }
                                                                            value={address_flag == '1' && riskAddressDetails.house_flat_no != "" ? riskAddressDetails.house_flat_no : values.house_flat_no}
                                                                        />
                                                                        {errors.house_flat_no && touched.house_flat_no ? (
                                                                            <span className="errorMsg">
                                                                                {errors.house_flat_no}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={6} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name="house_building_name"
                                                                            type="text"
                                                                            placeholder="House/Building Name"
                                                                            autoComplete="off"
                                                                            value={address_flag == '1' ? riskAddressDetails.house_building_name : values.house_building_name}
                                                                        />
                                                                        {errors.house_building_name &&
                                                                            touched.house_building_name ? (
                                                                                <span className="errorMsg">
                                                                                    {errors.house_building_name}
                                                                                </span>
                                                                            ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>    
                                                            <Col sm={6} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name="street_name"
                                                                            type="text"
                                                                            placeholder="Street Name"
                                                                            autoComplete="off"
                                                                            onFocus={(e) =>
                                                                                this.changePlaceHoldClassAdd(e)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                this.changePlaceHoldClassRemove(e)
                                                                            }
                                                                            value={address_flag == '1' ? riskAddressDetails.area_name : values.street_name}
                                                                        />
                                                                        {errors.street_name &&
                                                                            touched.street_name ? (
                                                                                <span className="errorMsg">
                                                                                    {errors.street_name}
                                                                                </span>
                                                                            ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col sm={6} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name="pincode_id"
                                                                            type="test"
                                                                            placeholder="Pincode"
                                                                            autoComplete="off"
                                                                            maxLength="6"
                                                                            onFocus={(e) =>
                                                                                this.changePlaceHoldClassAdd(e)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                this.changePlaceHoldClassRemove(e)
                                                                            }
                                                                            onKeyUp={(e) => this.fetchAreadetails(e, setFieldValue, setFieldTouched)}
                                                                            value={address_flag == '1' ? riskAddressDetails.pincode : values.pincode_id}
                                                                            maxLength="6"
                                                                        />
                                                                        {errors.pincode_id && touched.pincode_id ? (
                                                                            <span className="errorMsg">
                                                                                {errors.pincode_id}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={6} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="formSection">
                                                                        <Field
                                                                            name="area_name"
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            value={address_flag == '1' ? gsb_Details && gsb_Details.gsbinfo ?  gsb_Details.gsbinfo.pincode_id: "" : values.area_name}
                                                                            className="formGrp"
                                                                        >
                                                                            <option value="">Locality</option>
                                                                            {pinDataArr &&
                                                                                pinDataArr.length > 0 &&
                                                                                pinDataArr.map((resource, rindex) => (
                                                                                    <option key={rindex} value={resource.id}>
                                                                                        {
                                                                                            resource.LCLTY_SUBRB_TALUK_TEHSL_NM
                                                                                        }
                                                                                    </option>
                                                                                ))}

                                                                            {/*<option value="area2">Area 2</option>*/}
                                                                        </Field>
                                                                        {errors.area_name && touched.area_name ? (
                                                                            <span className="errorMsg">
                                                                                {errors.area_name}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={6} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name="city"
                                                                            type="text"
                                                                            placeholder="City"
                                                                            autoComplete="off"
                                                                            onFocus={(e) =>
                                                                                this.changePlaceHoldClassAdd(e)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                this.changePlaceHoldClassRemove(e)
                                                                            }
                                                                            value={address_flag == '1' ? riskAddressDetails.city : values.city}
                                                                        />
                                                                        {errors.city && touched.city ? (
                                                                            <span className="errorMsg">
                                                                                {errors.city}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>

                                                        <Row>    
                                                            <Col sm={6} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name="state_name"
                                                                            type="text"
                                                                            placeholder="State"
                                                                            autoComplete="off"
                                                                            onFocus={(e) =>
                                                                                this.changePlaceHoldClassAdd(e)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                this.changePlaceHoldClassRemove(e)
                                                                            }
                                                                            value={address_flag == '1' ? riskAddressDetails.state : values.state_name}
                                                                        />
                                                                        {errors.state_name &&
                                                                            touched.state_name ? (
                                                                                <span className="errorMsg">
                                                                                    {errors.state_name}
                                                                                </span>
                                                                            ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        <Row >
                                                            <Col sm={12} md={3} lg={2}> &nbsp;
                                                            </Col>
                                                        </Row>
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h4 className="fs-18 m-b-30">NOMINEE DETAILS</h4>
                                                            </div>
                                                        </div>
                                                        <Row >
                                                            <Col sm={12} md={3} lg={2}>
                                                                <FormGroup>
                                                                    <div className="formSection">
                                                                        <Field
                                                                            name='nominee_title_id'
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            className="formGrp"
                                                                        >
                                                                            <option value="">Title</option>
                                                                            {titleList.map((title, qIndex) => ( 
                                                                            <option value={title.id}>{title.displayvalue}</option>
                                                                            ))}
                                                                        </Field>
                                                                        {errors.nominee_title_id && touched.nominee_title_id ? (
                                                                            <span className="errorMsg">{errors.nominee_title_id}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name="nominee_first_name"
                                                                            type="text"
                                                                            placeholder="Nominee Name"
                                                                            autoComplete="off"
                                                                            onFocus={(e) =>
                                                                                this.changePlaceHoldClassAdd(e)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                this.changePlaceHoldClassRemove(e)
                                                                            }
                                                                            value={values.nominee_first_name}
                                                                        />
                                                                        {errors.nominee_first_name &&
                                                                            touched.nominee_first_name ? (
                                                                                <span className="errorMsg">
                                                                                    {errors.nominee_first_name}
                                                                                </span>
                                                                            ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name="nominee_last_name"
                                                                            type="text"
                                                                            placeholder="Nominee Last Name"
                                                                            autoComplete="off"
                                                                            onFocus={(e) =>
                                                                                this.changePlaceHoldClassAdd(e)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                this.changePlaceHoldClassRemove(e)
                                                                            }
                                                                            value={values.nominee_last_name}
                                                                        />
                                                                        {errors.nominee_last_name &&
                                                                            touched.nominee_last_name ? (
                                                                                <span className="errorMsg">
                                                                                    {errors.nominee_last_name}
                                                                                </span>
                                                                            ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            </Row>
                                                            <Row>
                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <DatePicker
                                                                        name="nominee_dob"
                                                                        dateFormat="dd MMM yyyy"
                                                                        placeholderText="DOB"
                                                                        peekPreviousMonth
                                                                        peekPreviousYear
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        maxDate={maxDobNominee}
                                                                        minDate={minDobNominee}
                                                                        className="datePckr"
                                                                        selected={values.nominee_dob}
                                                                        onChange={(val) => {
                                                                            setFieldTouched('nominee_dob');
                                                                            setFieldValue('nominee_dob', val);
                                                                            this.ageCheck(val)
                                                                        }}
                                                                    />
                                                                    {errors.nominee_dob && touched.nominee_dob ? (
                                                                        <span className="errorMsg">{errors.nominee_dob}</span>
                                                                    ) : null}
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="formSection">
                                                                        <Field
                                                                            name="relation_with"
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            value={values.relation_with}
                                                                            className="formGrp"
                                                                        >
                                                                            <option value="">Relation with Primary Insured</option>
                                                                            {nomineeRelation && nomineeRelation.map((title, qIndex) => ( 
                                                                            <option value={title.id}>{title.name}</option>
                                                                            ))}
                                                                        </Field>
                                                                        {errors.relation_with &&
                                                                            touched.relation_with ? (
                                                                                <span className="errorMsg">
                                                                                    {errors.relation_with}
                                                                                </span>
                                                                            ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        {appointeeFlag || is_appointee == "1" ? (
                                                            <div>
                                                                <div className="d-flex justify-content-left carloan m-b-25">
                                                                    <h4> Appointee Details</h4>
                                                                </div>
                                                                <Row className="m-b-45">
                                                                    <Col sm={12} md={4} lg={4}>
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                <Field
                                                                                    name="appointee_name"
                                                                                    type="text"
                                                                                    placeholder="Appointee Name"
                                                                                    autoComplete="off"
                                                                                    onFocus={(e) =>
                                                                                        this.changePlaceHoldClassAdd(e)
                                                                                    }
                                                                                    onBlur={(e) =>
                                                                                        this.changePlaceHoldClassRemove(e)
                                                                                    }
                                                                                    value={values.appointee_name}
                                                                                />
                                                                                {errors.appointee_name &&
                                                                                    touched.appointee_name ? (
                                                                                        <span className="errorMsg">
                                                                                            {errors.appointee_name}
                                                                                        </span>
                                                                                    ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>

                                                                    <Col sm={12} md={4} lg={4}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                                <Field
                                                                                    name="appointee_relation_with"
                                                                                    component="select"
                                                                                    autoComplete="off"
                                                                                    value={values.appointee_relation_with}
                                                                                    className="formGrp"
                                                                                >
                                                                                    <option value="">Relation with Nominee</option>
                                                                                    {appointeeRelation && appointeeRelation.map((title, qIndex) => ( 
                                                                                    <option value={title.id}>{title.name}</option>
                                                                                    ))}
                                                                                </Field>
                                                                                {errors.appointee_relation_with &&
                                                                                    touched.appointee_relation_with ? (
                                                                                        <span className="errorMsg">
                                                                                            {errors.appointee_relation_with}
                                                                                        </span>
                                                                                    ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        ) : null}
                                                        <div className="d-flex justify-content-left resmb">
                                                            <Button className={`backBtn`} type="button" disabled={isSubmitting ? true : false} onClick={this.planInfo.bind(this,productId)}>
                                                                {isSubmitting ? 'Wait..' : 'Back'}
                                                            </Button>
                                                            <Button className={`proceedBtn`} type="submit"  >
                                                                Convert to policy
                                                            </Button>
                                                        </div>
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
                </BaseComponent>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        loading: state.loader.loading,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AdditionalDetails_GSB));