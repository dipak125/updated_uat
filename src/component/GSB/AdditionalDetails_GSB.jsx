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
    salutation_id: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    mobile: "",
    email_id: "",
    disability_for: "",
    construction_for: "",
    basement_for: "",
    protection_for: "",
    construction_year: "",
    type_condition: "",
    description: "",
    check_box: "",
    flat_no: "",
    city: "",
    building_name: "",
    street_name: "",
    state_name: "",
    pincode: "",
    pincode_id: "",
    nominee_salutation_id: "",
    nominee_name: "",
    nominee_dob: null,
    relation_with: "",
    appointee_relation_with: ""

}

const vehicleRegistrationValidation = Yup.object().shape({
    salutation_id: Yup.string().required('Title is required').nullable(),
    first_name: Yup.string().required('First Name is required').min(3, function () { return "First name must be 3 characters" }).max(40, function () {
        return "Full name must be maximum 40 characters"
    }).matches(/^[A-Za-z]+$/, function () { return "Please enter valid first name" }).nullable(),
    last_name: Yup.string().required('Last Name is required').min(1, function () { return "Last name must be 1 characters" }).max(40, function () { return "Full name must be maximum 40 characters" })
        .matches(/^[A-Za-z]+$/, function () {
            return "Please enter valid last name"
        }).nullable(),
    // last_name: Yup.string().required('Name is required').nullable(),
    date_of_birth: Yup.date().required("Please enter date of birth").nullable(),
    email_id: Yup.string().email().required('Email is required').min(8, function () {
        return "Email must be minimum 8 characters"
    })
        .max(75, function () {
            return "Email must be maximum 75 characters"
        }).matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9]+)*@\w+([-]?\w+)*(\.\w{2,3})+$/, 'Invalid Email Id').nullable(),
    mobile: Yup.string()
        .matches(/^[6-9][0-9]{9}$/, 'Invalid Mobile number').required('Mobile No. is required').nullable(),
    building_name: Yup.string()
        .required("Please enter building name")
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
            return "Please enter valid building name";
        })
        .nullable(),
    // block_no: Yup.string().required("Please enter Plot number").nullable(),
    flat_no: Yup.string()
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
    pincode: Yup.string()
        .required("Pincode is required")
        .matches(/^[0-9]{6}$/, function () {
            return "Please enter valid 6 digit pin code";
        })
        .nullable(),
    pincode_id: Yup.string().required("Please select locality").nullable(),
    disability_for: Yup.string().required("Please select optioin for disability").nullable(),
    construction_for: Yup.string().required("Please select type of construction").nullable(),
    basement_for: Yup.string().required("Please select option for proposed property").nullable(),
    protection_for: Yup.string().required("Please select option for protected with doors/windows/grill").nullable(),
    construction_year: Yup.string().required("Please enter construction year").nullable(),
    type_condition: Yup.string().required("Please select option for type & construction").nullable(),
    description: Yup.string().required("Please enter description").nullable(),
    // NOMINEE--------
    nominee_salutation_id: Yup.string().required("Title is required").nullable(),
    nominee_name: Yup.string()
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
    appointee_name: Yup.string(function () {
        return "Please enter appointee name"
    }).notRequired(function () {
        return "Please enter appointee name"
    })
        .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)$/, function () {
            return "Please enter valid name"
        }).test(
            "18YearsChecking",
            function () {
                return "Please enter appointee name"
            },
            function (value) {
                const ageObj = new PersonAge();
                if (ageObj.whatIsMyAge(this.parent.dob) < 18 && !value) {
                    return false;
                }
                return true;
            }
        ).min(3, function () {
            return "Name must be minimum 3 chracters"
        })
        .max(40, function () {
            return "Name must be maximum 40 chracters"
        }),
    appointee_relation_with: Yup.string().notRequired(function () {
        return "Please select relation"
    }).test(
        "18YearsChecking",
        function () {
            return "Please enter Appointee relation"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsMyAge(this.parent.dob) < 18 && !value) {
                return false;
            }
            return true;
        }
    )
})


class AdditionalDetails_GSB extends Component {
    state = {
        motorInsurance: '',
        regno: '',
        length: 14,
        fastlanelog: [],
        appointeeFlag: false,
        is_appointee: 0
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
        this.fetchPolicyDetails();
        console.log("product_id", this.props.match.params)

        // let encryption = new Encryption();
        // let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        // console.log('bc_data',JSON.parse(encryption.decrypt(bc_data)));

    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`sme/details/${policyHolder_id}`)
            .then(res => {
                // let decryptResp = JSON.parse(encryption.decrypt(res.data))
                // console.log("decrypt", decryptResp)

                // let policyHolder = decryptResp.data.policyHolder.motorinsurance           
                // // let fastlanelog = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.fastlanelog : {};
                // this.setState({ 
                //     policyHolder
                // })
                this.props.loadingStop();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    fetchPolicyDetails = () => {
        const { productId } = this.props.match.params;
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        axios
            .get(`/${policyHolder_refNo}`)
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
        let post_data = {
            'menumaster_id': '5',
            'page_name': `AdditionalDetails_GSB/${productId}`,
            'vehicle_type_id': productId
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

        let pol_start_date = moment(values.pol_start_date).format('YYYY-MM-DD HH:mm:ss')
        let pol_end_date = moment(values.pol_end_date).format('YYYY-MM-DD hh:mm:ss')

        post_data['pol_start_date'] = pol_start_date
        post_data['pol_end_date'] = pol_end_date

        this.props.loadingStart();

        if (this.props.policy_holder_id != null) {
            post_data['policy_holder_id'] = this.props.policy_holder_id
            formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))

            axios.post('',
                formData
            ).then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                // console.log('decryptResp-----', decryptResp)
                if (decryptResp.error === false) {
                    this.props.loadingStop();
                    this.props.setDataUpdate({
                        start_date: values.pol_start_date,
                        end_date: values.pol_end_date
                    });
                    this.props.history.push(`/RiskDetails/${productId}`);
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
        } else {
            formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
            axios.post('',
                formData
            ).then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                localStorage.setItem('policy_holder_ref_no', decryptResp.data.policyHolder_refNo);
                this.props.loadingStop();
                this.props.setData({
                    start_date: values.pol_start_date,
                    end_date: values.pol_end_date,

                    policy_holder_id: decryptResp.data.policyHolder_id,
                    policy_holder_ref_no: decryptResp.data.policyHolder_refNo,
                    request_data_id: decryptResp.data.request_data_id,
                    completed_step: decryptResp.data.completedStep,
                    menumaster_id: decryptResp.data.menumaster_id
                });
                this.props.history.push(`/RiskDetails/${productId}`);
            }).
                catch(err => {
                    this.props.loadingStop();
                    actions.setSubmitting(false);
                })
        }
    }
    fetchAreadetails = (e) => {
        let pinCode = e.target.value;

        if (pinCode.length == 6) {
            const formData = new FormData();
            this.props.loadingStart();
            // let encryption = new Encryption();
            const post_data_obj = {
                pincode: pinCode,
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
                        this.setState({
                            pinDataArr: res.data.data,
                            stateName,
                        });
                        this.props.loadingStop();
                    } else {
                        this.props.loadingStop();
                        swal("Plese enter a valid pincode");
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
                pincode: pinCode,
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
        const { pinDataArr, appointeeFlag, is_appointee, productId } = this.state
        const newInitialValues = Object.assign(initialValues, {
            pol_start_date: this.props.start_date != null ? new Date(this.props.start_date) : null,
            pol_end_date: this.props.end_date != null ? new Date(this.props.end_date) : null,
            salutation_id: "",
            first_name: "",
            last_name: "",
            date_of_birth: "",
            mobile: "",
            email_id: "",
            disability_for: "",
            construction_for: "",
            basement_for: "",
            protection_for: "",
            construction_year: "",
            type_condition: "",
            description: "",
            check_box: "",
            flat_no: "",
            city: "",
            building_name: "",
            street_name: "",
            state_name: "",
            pincode: "",
            pincode_id: "",
            nominee_salutation_id: "",
            nominee_name: "",
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
                                            validationSchema={vehicleRegistrationValidation}
                                        >
                                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                                // console.log('values',values)

                                                return (
                                                    <Form>
                                                        <div className="brandhead">
                                                            <h4 className="fs-18 m-b-30">Please share a few more details.</h4>
                                                        </div>
                                                        {/* {console.log('pol_start_date',values.pol_start_date)}                                                                                
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead">
                                                </div>
                                            </div> */}
                                                        <div className="brandhead">
                                                            <h4 className="fs-18 m-b-30">PROPOSER DETAILS</h4>
                                                        </div>
                                                        <Row>
                                                            <Col sm={12} md={3} lg={2}>
                                                                <FormGroup>
                                                                    <div className="formSection">
                                                                        <Field
                                                                            name='salutation_id'
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            className="formGrp"
                                                                        >
                                                                            <option value="">Title</option>
                                                                            {/* {titleList.map((title, qIndex) => ( 
                                                            <option value={title.id}>{title.displayvalue}</option>
                                                            ))} */}
                                                                        </Field>
                                                                        {errors.salutation_id && touched.salutation_id ? (
                                                                            <span className="errorMsg">{errors.salutation_id}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>

                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name='first_name'
                                                                            type="text"
                                                                            placeholder="First Name"
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value={values.first_name}
                                                                        />
                                                                        {errors.first_name && touched.first_name ? (
                                                                            <span className="errorMsg">{errors.first_name}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>

                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name='last_name'
                                                                            type="text"
                                                                            placeholder="Last Name"
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value={values.last_name}
                                                                        />
                                                                        {errors.last_name && touched.last_name ? (
                                                                            <span className="errorMsg">{errors.last_name}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>

                                                        <Row>
                                                            <Col sm={12} md={3} lg={2}>
                                                                <FormGroup>
                                                                    <DatePicker
                                                                        name="date_of_birth"
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
                                                                        selected={values.date_of_birth}
                                                                        onChange={(val) => {
                                                                            setFieldTouched('date_of_birth');
                                                                            setFieldValue('date_of_birth', val);
                                                                        }}
                                                                    />
                                                                    {errors.date_of_birth && touched.date_of_birth ? (
                                                                        <span className="errorMsg">{errors.date_of_birth}</span>
                                                                    ) : null}
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup className="m-b-25">
                                                                    <div className="insurerName nmbract">
                                                                        <span>+91</span>
                                                                        <Field
                                                                            name='mobile'
                                                                            type="text"
                                                                            placeholder="Mobile No. "
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value={values.mobile}
                                                                            maxLength="10"
                                                                            className="phoneinput pd-l-25"
                                                                        />
                                                                        {errors.mobile && touched.mobile ? (
                                                                            <span className="errorMsg msgpositn">{errors.mobile}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name='email_id'
                                                                            type="email"
                                                                            placeholder="Email "
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value={values.email_id}
                                                                        />
                                                                        {errors.email_id && touched.email_id ? (
                                                                            <span className="errorMsg">{errors.email_id}</span>
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
                                                                                name='disability_for'
                                                                                value='1'
                                                                                key='1'
                                                                                checked={values.disability_for == '1' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('disability_for')
                                                                                    setFieldValue('disability_for', '1');
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
                                                                                name='disability_for'
                                                                                value='2'
                                                                                key='1'
                                                                                checked={values.disability_for == '2' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('disability_for')
                                                                                    setFieldValue('disability_for', '2');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> No</h7></span>
                                                                        </label>
                                                                        {errors.disability_for && touched.disability_for ? (
                                                                            <span className="errorMsg">{errors.disability_for}</span>
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
                                                                                name='construction_for'
                                                                                value='1'
                                                                                key='1'
                                                                                checked={values.construction_for == '1' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('construction_for')
                                                                                    setFieldValue('construction_for', '1');
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
                                                                                name='construction_for'
                                                                                value='2'
                                                                                key='1'
                                                                                checked={values.construction_for == '2' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('construction_for')
                                                                                    setFieldValue('construction_for', '2');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> Kuchha Construction</h7></span>
                                                                        </label>
                                                                        {errors.construction_for && touched.construction_for ? (
                                                                            <span className="errorMsg">{errors.construction_for}</span>
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
                                                                                name='basement_for'
                                                                                value='1'
                                                                                key='1'
                                                                                checked={values.basement_for == '1' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('basement_for')
                                                                                    setFieldValue('basement_for', '1');
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
                                                                                name='basement_for'
                                                                                value='2'
                                                                                key='1'
                                                                                checked={values.basement_for == '2' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('basement_for')
                                                                                    setFieldValue('basement_for', '2');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> No</h7></span>
                                                                        </label>
                                                                        {errors.basement_for && touched.basement_for ? (
                                                                            <span className="errorMsg">{errors.basement_for}</span>
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
                                                                                name='protection_for'
                                                                                value='1'
                                                                                key='1'
                                                                                checked={values.protection_for == '1' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('protection_for')
                                                                                    setFieldValue('protection_for', '1');
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
                                                                                name='protection_for'
                                                                                value='2'
                                                                                key='1'
                                                                                checked={values.protection_for == '2' ? true : false}
                                                                                onChange={() => {
                                                                                    setFieldTouched('protection_for')
                                                                                    setFieldValue('protection_for', '2');
                                                                                    this.handleChange(values, setFieldTouched, setFieldValue)
                                                                                }
                                                                                }
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"><h7> No</h7></span>
                                                                        </label>
                                                                        {errors.protection_for && touched.protection_for ? (
                                                                            <span className="errorMsg">{errors.protection_for}</span>
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
                                                                                    name='construction_year'
                                                                                    type="text"
                                                                                    placeholder="Year of construction"
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value={values.construction_year}
                                                                                />
                                                                                {errors.construction_year && touched.construction_year ? (
                                                                                    <span className="errorMsg">{errors.construction_year}</span>
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
                                                                                    name="type_condition"
                                                                                    component="select"
                                                                                    autoComplete="off"
                                                                                    className="formGrp"
                                                                                >
                                                                                    <option value="">Type & Condition</option>
                                                                                    <option value="1">Gent's Cycle-Brand New</option>
                                                                                    <option value="2">Gent's Cycle-Moderately Used</option>
                                                                                    <option value="3">Gent's Cycle-Heavily Used</option>
                                                                                    <option value="4">Lady's Cycle-Brand New</option>
                                                                                    <option value="5">Lady's Cycle-Moderately Used</option>
                                                                                    <option value="6">Lady's Cycle-Heavily Used</option>
                                                                                    <option value="7">Not applicable</option>
                                                                                </Field>
                                                                                {errors.type_condition && touched.type_condition ? (
                                                                                    <span className="errorMsg">
                                                                                        {errors.type_condition}
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
                                                                            name="flat_no"
                                                                            type="text"
                                                                            placeholder="House/Flat No."
                                                                            autoComplete="off"
                                                                            onFocus={(e) =>
                                                                                this.changePlaceHoldClassAdd(e)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                this.changePlaceHoldClassRemove(e)
                                                                            }
                                                                            value={values.flat_no}
                                                                        />
                                                                        {errors.flat_no && touched.flat_no ? (
                                                                            <span className="errorMsg">
                                                                                {errors.flat_no}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={6} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name="building_name"
                                                                            type="text"
                                                                            placeholder="House/Building Name"
                                                                            autoComplete="off"
                                                                            // onFocus={(e) =>
                                                                            //   this.changePlaceHoldClassAdd(e)
                                                                            // }
                                                                            // onBlur={(e) =>
                                                                            //   this.changePlaceHoldClassRemove(e)
                                                                            // }
                                                                            value={values.building_name}
                                                                        />
                                                                        {errors.building_name &&
                                                                            touched.building_name ? (
                                                                                <span className="errorMsg">
                                                                                    {errors.building_name}
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
                                                                            name="pincode"
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
                                                                            value={values.pincode}
                                                                            maxLength="6"
                                                                            onInput={(e) => { }}
                                                                        />
                                                                        {errors.pincode && touched.pincode ? (
                                                                            <span className="errorMsg">
                                                                                {errors.pincode}
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={6} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="formSection">
                                                                        <Field
                                                                            name="pincode_id"
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            value={values.pincode_id}
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
                                                                            value={values.city}
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
                                                                            value={values.state_name}
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
                                                        {/* <Row>
                                                            <Col sm={12} md={3} lg={2}>
                                                                <FormGroup>
                                                                    <div className="formSection">
                                                                        <Field
                                                                            name="nominee_salutation_id"
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            className="formGrp"
                                                                        >
                                                                            <option value="">Title</option> */}
                                                        {/* {titleList.map((title, qIndex) => ( 
                                            <option value={title.id}>{title.displayvalue}</option>
                                            ))} */}
                                                        {/* </Field>
                                                                        {errors.salutation_id && touched.salutation_id ? (
                                                                            <span className="errorMsg">{errors.salutation_id}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>

                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name="nominee_name"
                                                                            type="text"
                                                                            placeholder="First Name"
                                                                            autoComplete="off"
                                                                            onFocus={(e) =>
                                                                                this.changePlaceHoldClassAdd(e)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                this.changePlaceHoldClassRemove(e)
                                                                            }
                                                                            value={values.nominee_name}
                                                                        />
                                                                        {errors.nominee_name &&
                                                                            touched.nominee_name ? (
                                                                                <span className="errorMsg">
                                                                                    {errors.nominee_name}
                                                                                </span>
                                                                            ) : null}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row> */}
                                                        <Row className="m-b-45">
                                                            <Col sm={12} md={3} lg={3}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <Field
                                                                            name="nominee_name"
                                                                            type="text"
                                                                            placeholder="Nominee Name"
                                                                            autoComplete="off"
                                                                            onFocus={(e) =>
                                                                                this.changePlaceHoldClassAdd(e)
                                                                            }
                                                                            onBlur={(e) =>
                                                                                this.changePlaceHoldClassRemove(e)
                                                                            }
                                                                            value={values.nominee_name}
                                                                        />
                                                                        {errors.nominee_name &&
                                                                            touched.nominee_name ? (
                                                                                <span className="errorMsg">
                                                                                    {errors.nominee_name}
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
                                                            <Button className={`proceedBtn`} type="submit" disabled={isSubmitting ? true : false}>
                                                                {isSubmitting ? 'Wait..' : 'Convert to policy'}
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