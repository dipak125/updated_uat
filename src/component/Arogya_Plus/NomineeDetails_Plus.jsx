import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import moment from "moment";
import swal from 'sweetalert';

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";
import dateformat from "dateformat";
import Encryption from '../../shared/payload-encryption';


const minDobNominee = moment(moment().subtract(111, 'years').calendar()).add(1, 'day').calendar()
const maxDobNominee = moment().subtract(3, 'months').calendar();

const initialValues = {
    first_name: "",
    last_name: "",
    gender: "",
    dob: "",
    relation_with: "",
    // appointee_dob: "",
    appointee_relation_with: "",
    appointee_name: ""
}

const validateNominee = Yup.object().shape({
    last_name: Yup.string().required(function () {
        return "Please enter a last name"
    }).matches(/^[A-Za-z]*$/, function () {
        return "Please enter valid last name"
    }).min(1, function () {
        return "Name must be minimum 1 chracters"
    })
        .max(40, function () {
            return "Name must be maximum 40 chracters"
        }),
    first_name: Yup.string(function () {
        return "Please enter name"
    }).required(function () {
        return "Please enter name"
    }).matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)$/, function () {
        return "Please enter valid name"
    }).min(3, function () {
        return "Name must be minimum 3 chracters"
    })
        .max(40, function () {
            return "Name must be maximum 40 chracters"
        }),
    gender: Yup.string().required(function () {
        return "Please select gender"
    }).matches(/^[MmFf]$/, function () {
        return "Please select valid gender"
    }),
    dob: Yup
        .date()
        .required(function () {
            return "Please enter DOB"
        }).test(
            "3monthsChecking",
            function () {
                return "Age should be minium 3 months"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) < 111 && ageObj.whatIsMyAgeMonth(value) >= 3;
                }
                return true;
            }
        ),
    relation_with: Yup.string().required(function () {
        return "Please select relation"
    }),
    // appointee_dob:Yup.date().notRequired("Please enter DOB").max(maxDob, function() {
    //     return "Date should not be future date"
    //     }).test(
    //         "18YearsChecking",
    //         function() {
    //             return "Appointee age should be more than 18 years"
    //         },
    //         function (value) {
    //             const ageObj = new PersonAge();
    //             if (value) {
    //                 const age_Obj = new PersonAge();
    //                 return age_Obj.whatIsMyAge(value) >= 18;
    //             }
    //             return true;
    //         }
    //     ).test(
    //         "18YearsChecking",
    //         function() {
    //             return "Please enter Appointee date of birth"
    //         },
    //         function (value) {
    //             const ageObj = new PersonAge();
    //             if (ageObj.whatIsMyAge(this.parent.dob) < 18) {   
    //                 return ageObj.whatIsMyAge(value) >= 18;    
    //             }
    //             return true;
    //         }
    //     ),
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

class NomineeDetails_Plus extends Component {

    state = {
        NomineeDetails: [],
        appointeeFlag: false,
        is_appointee: 0
    };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

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

    addressInfo = (productId) => {
        this.props.history.push(`/Address_Plus/${productId}`);
    }

    handleSubmit = (values, actions) => {
        const { productId } = this.props.match.params
        const formData = new FormData();
        let formArr = []

        for (const key in values) {
            if (values.hasOwnProperty(key)) {
                if (key == "dob") {

                    //formData.append(key, moment(values[key]).format("YYYY-MM-DD"));
                    formArr[key] = moment(values[key]).format("YYYY-MM-DD")
                }
                else {
                    // formData.append(key, values[key]);
                    formArr[key] = values[key]
                }
            }
        }

        //formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));
        formArr['policy_holder_id'] = localStorage.getItem('policyHolder_id')
        // formData.append('is_appointee', this.state.is_appointee);
        formArr['is_appointee'] = this.state.is_appointee
        formArr['page_name'] = `NomineeDetails_Plus/${productId}`
        let formObj = {}
        Object.assign(formObj, formArr)
        console.log("PostData---", formObj)
        let encryption = new Encryption();
        formData.append('enc_data', encryption.encrypt(JSON.stringify(formObj)))

        this.props.loadingStart();
        axios
            .post(`/insert-nominee`, formData)
            .then(res => {
                this.props.loadingStop();
                this.props.history.push(`/PolicyDetails_Plus/${productId}`);
            })
            .catch(err => {
                if (err.status == 401) {
                    swal("Session out. Please login")
                }
                else swal("Something wrong happened. Please try after some")
                actions.setSubmitting(false);
                this.props.loadingStop();
            });


    }

    fetchPolicyRelations = (family_relations) => {
        let relations = family_relations.map(resource => resource.relation_with == 'self' ? 1 : 0)
        let self_selected = relations && relations.length > 0 && relations.includes(1)
        this.setState({
            self_selected
        })
        //return self_selected
    }

    getNomineeDetails = () => {
        this.props.loadingStart();
        axios
            .get(`/policy-holder/${localStorage.getItem('policyHolder_id')}`)
            .then(res => {
                let family_members = res.data.data.policyHolder.request_data ? res.data.data.policyHolder.request_data.family_members : []
                this.fetchPolicyRelations(family_members)
                // console.log("SELF SELECTED==============>",self_selected)
                this.setState({
                    NomineeDetails: res.data.data.policyHolder.request_data.nominee[0],
                    is_appointee: res.data.data.policyHolder.request_data.nominee[0].is_appointee
                })
                this.props.loadingStop();
            })
            .catch(err => {
                this.setState({
                    NomineeDetails: []
                });
                this.props.loadingStop();
            });
    }

    componentDidMount() {
        this.getNomineeDetails();
    }


    render() {
        const { productId } = this.props.match.params
        const { NomineeDetails, appointeeFlag, is_appointee, self_selected } = this.state
        //  console.log('SELF SELECTED============>',this.state.self_selected)
        moment.defaultFormat = "YYYY-MM-YY";

        const newInitialValues = Object.assign(initialValues, {
            first_name: NomineeDetails ? NomineeDetails.first_name : "",
            last_name: NomineeDetails ? NomineeDetails.last_name : "",
            gender: NomineeDetails ? NomineeDetails.gender : "",
            dob: NomineeDetails && NomineeDetails.dob ? new Date(NomineeDetails.dob) : "",
            relation_with: NomineeDetails ? NomineeDetails.relation_with : "",
            // appointee_dob: NomineeDetails && NomineeDetails.appointee_dob ? new Date(NomineeDetails.appointee_dob) : "",
            appointee_relation_with: NomineeDetails && NomineeDetails.appointee_relation_with ? NomineeDetails.appointee_relation_with : "",
            appointee_name: NomineeDetails && NomineeDetails.appointee_name ? NomineeDetails.appointee_name : "",

        })


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



                                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox argnominee3">
                                    <h4 className="text-center mt-3 mb-3">Arogya Plus Policy</h4>
                                    <section className="brand">
                                        <div className="boxpd">
                                            <div className="justify-content-left brandhead  m-b-20">
                                                <h4 className="fs-18">You are just one step away from geting your policy ready</h4>
                                            </div>
                                            <div className="d-flex justify-content-left carloan m-b-25">
                                                <h4> Nominee  Details</h4>
                                            </div>

                                            <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit}
                                                validationSchema={validateNominee}
                                            >
                                                {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                                    return (
                                                        <Form>
                                                            <Row>
                                                                <Col sm={12} md={12} lg={9}>

                                                                    <Row>
                                                                        <Col sm={12} md={4} lg={4}>
                                                                            <FormGroup>
                                                                                <div className="insurerName">
                                                                                    <Field
                                                                                        name="first_name"
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

                                                                        <Col sm={12} md={4} lg={4}>
                                                                            <FormGroup>
                                                                                <div className="insurerName">
                                                                                    <Field
                                                                                        name="last_name"
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


                                                                        <Col sm={12} md={4} lg={4}>
                                                                            <FormGroup>
                                                                                <div className="formSection">
                                                                                    <Field
                                                                                        name="gender"
                                                                                        component="select"
                                                                                        autoComplete="off"
                                                                                        value={values.gender}
                                                                                        className="formGrp"
                                                                                    >
                                                                                        <option value="">Select gender</option>
                                                                                        <option value="m">Male</option>
                                                                                        <option value="f">Female</option>
                                                                                    </Field>
                                                                                    {errors.gender && touched.gender ? (
                                                                                        <span className="errorMsg">{errors.gender}</span>
                                                                                    ) : null}
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>

                                                                    <Row className="m-b-45">
                                                                        <Col sm={12} md={4} lg={4}>
                                                                            <FormGroup>
                                                                                <DatePicker
                                                                                    name="dob"
                                                                                    dateFormat="dd MMM yyyy"
                                                                                    placeholderText="DOB"
                                                                                    peekPreviousMonth
                                                                                    peekPreviousYear
                                                                                    showMonthDropdown
                                                                                    showYearDropdown
                                                                                    dropdownMode="select"
                                                                                    maxDate={new Date(maxDobNominee)}
                                                                                    minDate={new Date(minDobNominee)}
                                                                                    className="datePckr"
                                                                                    onChange={(value) => {
                                                                                        setFieldTouched("dob");
                                                                                        setFieldValue("dob", value);
                                                                                        this.ageCheck(value)
                                                                                    }}
                                                                                    selected={values.dob}
                                                                                />
                                                                                {errors.dob && touched.dob ? (
                                                                                    <span className="errorMsg">{errors.dob}</span>
                                                                                ) : null}
                                                                            </FormGroup>
                                                                        </Col>


                                                                        <Col sm={12} md={8} lg={8}>
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
                                                                                        {self_selected ? '' : <option value="1">Self</option>}
                                                                                        <option value="2">Spouse</option>
                                                                                        <option value="3">Son</option>
                                                                                        <option value="4">Daughter</option>
                                                                                        <option value="5">Father</option>
                                                                                        <option value="6">Mother</option>
                                                                                        <option value="7">Father In Law</option>
                                                                                        <option value="8">Mother In Law</option>
                                                                                    </Field>
                                                                                    {errors.relation_with && touched.relation_with ? (
                                                                                        <span className="errorMsg">{errors.relation_with}</span>
                                                                                    ) : null}
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                    {appointeeFlag || is_appointee == '1' ?
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
                                                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                                value={values.appointee_name}
                                                                                            />
                                                                                            {errors.appointee_name && touched.appointee_name ? (
                                                                                                <span className="errorMsg">{errors.appointee_name}</span>
                                                                                            ) : null}

                                                                                        </div>
                                                                                        {/* <DatePicker
                                                                    name="appointee_dob"
                                                                    minDate={new Date()}
                                                                    dateFormat="dd MMM yyyy"
                                                                    placeholderText="DOB"
                                                                    peekPreviousMonth
                                                                    peekPreviousYear
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dropdownMode="select"
                                                                    maxDate={new Date()}
                                                                    minDate={new Date(1/1/1900)}
                                                                    className="datePckr"
                                                                    onChange={(value) => {
                                                                        setFieldTouched("appointee_dob");
                                                                        setFieldValue("appointee_dob", value);
                                                                        }}
                                                                    selected={values.appointee_dob}
                                                                />
                                                                {errors.appointee_dob ? (
                                                                    <span className="errorMsg">{errors.appointee_dob}</span>
                                                                ) : null} */}
                                                                                    </FormGroup>
                                                                                </Col>


                                                                                <Col sm={12} md={4} lg={6}>
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
                                                                                                {self_selected ? '' : <option value="1">Self</option>}
                                                                                                <option value="2">Spouse</option>
                                                                                                <option value="3">Son</option>
                                                                                                <option value="4">Daughter</option>
                                                                                                <option value="5">Father</option>
                                                                                                <option value="6">Mother</option>
                                                                                                <option value="7">Father In Law</option>
                                                                                                <option value="8">Mother In Law</option>
                                                                                            </Field>
                                                                                            {errors.appointee_relation_with && touched.appointee_relation_with ? (
                                                                                                <span className="errorMsg">{errors.appointee_relation_with}</span>
                                                                                            ) : null}
                                                                                        </div>
                                                                                    </FormGroup>
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                        : null
                                                                    }

                                                                    <div className="d-flex justify-content-left resmb">
                                                                        <Button className={`backBtn`} type="button" disabled={isSubmitting ? true : false} onClick={this.addressInfo.bind(this, productId)}>
                                                                            {isSubmitting ? 'Wait..' : 'Back'}
                                                                        </Button>
                                                                        <Button className={`proceedBtn`} type="submit" disabled={isSubmitting ? true : false}>
                                                                            {isSubmitting ? 'Wait..' : 'Next'}
                                                                        </Button>
                                                                    </div>
                                                                </Col>

                                                                <Col sm={12} md={12} lg={3}>
                                                                    <div className="regisBox">
                                                                        <h3 className="medihead">Assurance of Insurance Everywhere in India, for every Indian </h3>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NomineeDetails_Plus));