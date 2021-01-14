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

const minDate = moment().format();
// alert(new Date(minDate));
const maxDate = moment().add(14, 'day');
const maxDateEnd = moment().add(15, 'day').calendar();
const minDobAdult = moment(moment().subtract(100, 'years').calendar())
const maxDobAdult = moment().subtract(18, 'years').calendar();

const initialValues = {
    policy_type: '1',
    pol_start_date: null,
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
    description: "",
    check_box: "",
    house_flat_no: "",
    city: "",
    house_building_name: "",
    street_name: "",
    state_name: "",
    pincode_id: "",
    area_name: "",
    nominee_salutation_id: "",
    nominee_first_name: "",
    nominee_dob: null,
    relation_with: "",
    appointee_relation_with: ""

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
    house_building_name: Yup.string()
        .required("Please enter building name")
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
            return "Please enter valid building name";
        })
        .nullable(),
    // block_no: Yup.string().required("Please enter Plot number").nullable(),
    house_flat_no: Yup.string()
        .required("Please enter flat number")
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
            return "Please enter valid flat number";
        })
        .nullable(),
    city: Yup.string()
        .required("Please enter city")
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
            return "Please enter valid city";
        })
        .nullable(),
    street_name: Yup.string()
        .required("Please enter area name")
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
            return "Please enter valid area name";
        })
        .nullable(),
    state_name: Yup.string()
        .required("Please enter state")
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
            return "Please enter valid state";
        })
        .nullable(),
    pincode_id: Yup.string()
        .required("Pincode is required")
        .matches(/^[0-9]{6}$/, function () {
            return "Please enter valid 6 digit pin code";
        })
        .nullable(),
    area_name: Yup.string().required("Please select locality").nullable(),
    proposer_disability: Yup.string().required("Please select optioin for disability").nullable(),
    construction_type: Yup.string().required("Please select type of construction").nullable(),
    proposer_property_type: Yup.string().required("Please select option for proposed property").nullable(),
    property_protected_type: Yup.string().required("Please select option for protected with doors/windows/grill").nullable(),
    year_of_construction: Yup.string().required("Please enter construction year").nullable(),
    pedal_cycle_type: Yup.string().required("Please select option for type & construction").nullable(),
    description: Yup.string().required("Please enter description").nullable(),
    // NOMINEE--------
    // nominee_salutation_id: Yup.string().required("Title is required").nullable(),
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
    nominee_dob: Yup.date().required("Please enter date of birth").nullable(),
    relation_with: Yup.string().required(function () {
        return "Please select relation";
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
        serverResponse: []
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
            console.log("titles-list------ ",decryptResp)
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
            console.log("pedal-cycle-list------ ",decryptResp)
            let cycleList = decryptResp.data.gsb_cycle_list
            this.setState({
                cycleList
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
                console.log("---gsb_Details--->>", gsb_Details);
                this.setState({
                    gsb_Details
                });
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
            'pincode_id': values.area_name

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
            console.log('decryptResp-----', decryptResp)
            if (decryptResp.error === false) {
                this.props.loadingStop();
                // this.props.history.push(`/RiskDetails/${productId}`);
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

    handleChange = (e) => {
        const {occupationList} = this.state
        this.setState({
          serverResponse: [],
          error: []
        })
      }

    fetchAreadetails = (e) => {
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

    fetchAreadetailsBack = (pincode_input) => {
        let pinCode = pincode_input.toString();

        if (pinCode != null && pinCode != "" && pinCode.length == 6) {
            console.log("fetchAreadetailsBack pinCode", pinCode);
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
                    this.setState({
                        pinDataArr: res.data.data,
                        stateName,
                    });
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
        const { pinDataArr, appointeeFlag, is_appointee, titleList, cycleList, stateName, cityName } = this.state
        const {productId } = this.props.match.params
        const newInitialValues = Object.assign(initialValues, {
            pol_start_date: this.props.start_date != null ? new Date(this.props.start_date) : null,
            pol_end_date: this.props.end_date != null ? new Date(this.props.end_date) : null,
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
            description: "",
            check_box: "",
            house_flat_no: "",
            city: "",
            house_building_name: "",
            street_name: "",
            state_name: "",
            pincode_id: "",
            area_name: "",
            nominee_salutation_id: "",
            nominee_first_name: "",
            nominee_dob: "",
            relation_with: "",
            appointee_relation_with: ""
        })

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
                                            // validationSchema={vehicleRegistrationValidation}
                                        >
                                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                                console.log('errors-------- ',errors)

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
                                                                        maxDate={new Date(maxDobAdult)}
                                                                        minDate={new Date(minDobAdult)}
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
                                                                                value='2'
                                                                                key='1'
                                                                                checked={values.proposer_disability == '2' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('proposer_disability')
                                                                                    setFieldValue('proposer_disability', '2');
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
                                                                                value='2'
                                                                                key='1'
                                                                                checked={values.construction_type == '2' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('construction_type')
                                                                                    setFieldValue('construction_type', '2');
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
                                                                                value='2'
                                                                                key='1'
                                                                                checked={values.proposer_property_type == '2' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('proposer_property_type')
                                                                                    setFieldValue('proposer_property_type', '2');
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
                                                                <h6>All the openings protected with doors/windows/grill?</h6>
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
                                                                                value='2'
                                                                                key='1'
                                                                                checked={values.property_protected_type == '2' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('property_protected_type')
                                                                                    setFieldValue('property_protected_type', '2');
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
                                                                            <div className="insurerName">
                                                                                <Field
                                                                                    name='year_of_construction'
                                                                                    type="text"
                                                                                    placeholder="Year of construction"
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value={values.year_of_construction}
                                                                                />
                                                                                {errors.year_of_construction && touched.year_of_construction ? (
                                                                                    <span className="errorMsg">{errors.year_of_construction}</span>
                                                                                ) : null}
                                                                            </div>
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
                                                                                    name='description'
                                                                                    type="text"
                                                                                    placeholder="Description"
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value={values.description}
                                                                                />
                                                                                {errors.description && touched.description ? (
                                                                                    <span className="errorMsg">{errors.description}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="brandhead">
                                                            <h4 className="fs-18 m-b-30">COMMUNICATION ADDRESS</h4>
                                                        </div>
                                                        <label className="customCheckBox formGrp formGrp">{`is communication address same as risk location address`}
                                                            <Field
                                                                type="checkbox"
                                                                name="check_box"
                                                                className="user-self"
                                                                onClick={(e) => {
                                                                }}
                                                                checked={values.check_box}
                                                                value={values.check_box}
                                                            />
                                                            {errors.check_box && touched.check_box ? (
                                                                <span className="errorMsg">
                                                                    {errors.check_box}
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
                                                                            placeholder="House/Flat No."
                                                                            autoComplete="off"
                                                                            onFocus={(e) =>
                                                                                this.changePlaceHoldClassAdd(e)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                this.changePlaceHoldClassRemove(e)
                                                                            }
                                                                            value={values.house_flat_no}
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
                                                                            // onFocus={(e) =>
                                                                            //   this.changePlaceHoldClassAdd(e)
                                                                            // }
                                                                            // onBlur={(e) =>
                                                                            //   this.changePlaceHoldClassRemove(e)
                                                                            // }
                                                                            value={values.house_building_name}
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
                                                                            value={values.street_name}
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
                                                                            onKeyUp={(e) => this.fetchAreadetails(e)}
                                                                            value={values.pincode_id}
                                                                            maxLength="6"
                                                                            onInput={(e) => { }}
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
                                                                            value={values.area_name}
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
                                                                            value={cityName}
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
                                                                            value={stateName}
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

                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h4 className="fs-18 m-b-30">NOMINEE DETAILS</h4>
                                                            </div>
                                                        </div>
                                                        <Row className="m-b-45">
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
                                                                            placeholder="Nominee Name"
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
                                                                        maxDate={new Date(maxDobAdult)}
                                                                        minDate={new Date(minDobAdult)}
                                                                        className="datePckr"
                                                                        selected={values.nominee_dob}
                                                                        onChange={(val) => {
                                                                            setFieldTouched('nominee_dob');
                                                                            setFieldValue('nominee_dob', val);
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
                                                                            <option value="1">Self</option>
                                                                            <option value="2">Spouse</option>
                                                                            <option value="3">Son</option>
                                                                            <option value="4">Daughter</option>
                                                                            <option value="5">Father</option>
                                                                            <option value="6">Mother</option>
                                                                            <option value="7">Father In Law</option>
                                                                            <option value="8">Mother In Law</option>
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
                                                                                    {/* {self_selected ? ( */}
                                                                                    {/* "" */}
                                                                                    {/* ) : ( */}
                                                                                    <option value="1">Self</option>
                                                                                    {/* )} */}
                                                                                    <option value="2">Spouse</option>
                                                                                    <option value="3">Son</option>
                                                                                    <option value="4">Daughter</option>
                                                                                    <option value="5">Father</option>
                                                                                    <option value="6">Mother</option>
                                                                                    <option value="7">Father In Law</option>
                                                                                    <option value="8">Mother In Law</option>
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