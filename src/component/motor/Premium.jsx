import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import Otp from "./Otp"
import axios from "../../shared/axios";
import { withRouter, Link, Route } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from "yup";

const initialValue = {}

const validatePremium = Yup.object().shape({
    refNo: Yup.string().notRequired('Reference number is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Please enter valid reference number"
    }),
    })

class Premium extends Component {

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            refNo: "",
            whatsapp: "",
            fulQuoteResp: [],
            motorInsurance: [],
            error: [],
            purchaseData: [],
            error1: [],
            refNumber: "",
            paymentStatus: [],
            accessToken: "",
            PolicyArray: [],
            memberdetails: [],
            nomineedetails:[]
        };
    }


    handleClose(e) {
        this.setState({ show: false, });
    }

    handleOtp(e) {
        console.log("otp", e)
        this.setState({ show: false, });
        this.props.history.push(`/ThankYou_motor`)
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    additionalDetails = (productId) => {
        this.props.history.push(`/Additional_details/${productId}`);
    }

    handleSubmit = (values) => {
        this.setState({ show: true, refNo: values.refNo, whatsapp: values.whatsapp });
    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        this.props.loadingStart();
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
               
                    let motorInsurance = res.data.data.policyHolder ? res.data.data.policyHolder.motorinsurance : {}
                    
                 this.setState({
                        motorInsurance,
                        refNumber: res.data.data.policyHolder.reference_no,
                        paymentStatus: res.data.data.policyHolder.payment ? res.data.data.policyHolder.payment[0] : [],
                        memberdetails : res.data.data.policyHolder ? res.data.data.policyHolder : [],
                        nomineedetails: res.data.data.policyHolder ? res.data.data.policyHolder.request_data.nominee:[]
                       
                    })
                    
                    console.log(this.state.memberdetails.length);
                    //this.props.loadingStop();

                    this.getAccessToken(motorInsurance)
               
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    getAccessToken = (motorInsurance) => {
        axios
            .post(`/callTokenService`)
            .then((res) => {
                this.setState({
                    accessToken: res.data.access_token,
                });
                this.fullQuote(res.data.access_token, motorInsurance)
            })
            .catch((err) => {
                this.setState({
                    accessToken: '',
                });
                this.props.loadingStop();
            });
    };

    fullQuote = (access_token, motorInsurance) => {
        const formData = new FormData();
        formData.append("access_token", access_token);
        formData.append("id", localStorage.getItem("policyHolder_id"));

        formData.append("idv_value", motorInsurance.idv_value);
        formData.append("policy_type", localStorage.getItem('policy_type'));
        formData.append("add_more_coverage", motorInsurance.add_more_coverage);
        formData.append("cng_kit", motorInsurance.cng_kit);
        formData.append("cngKit_Cost", Math.floor(motorInsurance.cngkit_cost));

        axios.post('fullQuotePMCAR', formData)
            .then(res => {
                if (res.data.PolicyObject) {
                    this.setState({
                        fulQuoteResp: res.data.PolicyObject,
                        PolicyArray: res.data.PolicyObject.PolicyLobList,
                        error: [],
                    });
                } else {
                    this.setState({
                        fulQuoteResp: [],
                        error: res.data,
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

    payment = () => {
        const { refNumber } = this.state;
        // window.location = `http://14.140.119.44/sbig-csc/ConnectPG/payment.php?refrence_no=${refNumber}`
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/sbig-csc/ConnectPG/payment_motor.php?refrence_no=${refNumber}`
    }


    componentDidMount() {
        this.fetchData()
    }

    render() {
        const { refNo, whatsapp, show, fulQuoteResp, motorInsurance, error, error1, refNumber, paymentStatus, PolicyArray, memberdetails,nomineedetails } = this.state
        const { productId } = this.props.match.params

        const errMsg =
            error && error.message ? (
                <span className="errorMsg">
                    <h6>
                        <strong>
                            Thank you for showing your interest for buying product.Due to some
                            reasons, we are not able to issue the policy online.Please call
                            180 22 1111
                    </strong>
                    </h6>
                </span>
            ) : null;

        const paymentErrMsg =
            paymentStatus && paymentStatus.transaction_status == 103 ? (
                <span className="errorMsg">
                    <h6>
                        <strong>
                            Payment failed. Please try again
                    </strong>
                    </h6>
                </span>
            ) : null;

        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>

                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                                <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                                validationSchema={validatePremium}
                                >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                        return (
                                            <Form>
                                                <section className="brand m-t-11 m-b-25">
                                                    <div className="d-flex justify-content-left">
                                                        <div className="brandhead m-b-10">
                                                            <h4>The Summary of your Policy Premium Details is as below </h4>
                                                        </div>
                                                    </div>
                                                    <div className="brandhead m-b-30">
                                                        <h5>{errMsg}</h5>
                                                        <h5>{paymentErrMsg}</h5>
                                                        <h4>
                                                            Policy Reference Number {fulQuoteResp.QuotationNo}
                                                        </h4>
                                                    </div>

                                                    <Row>
                                                        <Col sm={12} md={9} lg={9}>
                                                            <div className="rghtsideTrigr">
                                                                <Collapsible trigger="Retail Motor Policy" >
                                                                    <div className="listrghtsideTrigr">
                                                                        <Row>
                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Premium:
                                                                                </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {fulQuoteResp.DuePremium}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Gross Premium:
                                                                    </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {fulQuoteResp.BeforeVatPremium}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Service Tax:
                                                                    </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {fulQuoteResp.TGST}
                                                                                </div>
                                                                            </Col>
                                                                        </Row>
                                                                    </div>

                                                                </Collapsible>
                                                            </div>

                                                            <div className="rghtsideTrigr m-b-30">
                                                                <Collapsible trigger="Member Details" >
                                                                    <div className="listrghtsideTrigr">
                                                                        {memberdetails ?


                                                                            
                                                                                <div>
                                                                                    Owner Details :
                                                                                    <br/>
                                                                                       <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Name:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{memberdetails.first_name + " " + memberdetails.last_name}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Date Of Birth:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{memberdetails.dob}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Mobile No</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{memberdetails.mobile}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Email Id</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{memberdetails.email_id}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Gender</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{memberdetails.gender == "m" ? "Male" : "Female"}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <p></p>
                                                                                    </Row>
                                                                                </div>
                                                                            : (<p></p>)}


                                                                        {nomineedetails ?

                                                                        (
                                                                            nomineedetails.length  > 0 && nomineedetails.map((nominee, nomineeIndex) => (


                                                                                                                                                    
                                                                        <div>
                                                                            Nominee Details :
                                                                            <br/>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Name:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{nominee.first_name}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Date Of Birth:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{nominee.dob}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Relation With Proposer:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{nominee.relation_with}
                                                                                        </FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Gender</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{nominee.gender == "m" ? "Male" : "Female"}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <p></p>
                                                                            </Row>
                                                                        </div>
                                                                             ))) : (<p></p>)}
                                                                    </div>

                                                                </Collapsible>
                                                            </div>

                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <div className="carloan">
                                                                        <h4>Make Payment</h4>
                                                                    </div>
                                                                </Col>
                                                                <Col sm={12} md={6}>
                                                                    <div className="carloan">
                                                                        <h4>Select Payment Gateway</h4>
                                                                    </div>
                                                                </Col>
                                                            </Row>


                                                            <Row>
                                                                <Col sm={12} md={6}>
                                                                    <Row>
                                                                        <Col sm={6}>
                                                                            <FormGroup>
                                                                                <div className="refno">
                                                                                    My reference no is
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>
                                                                        <Col sm={6}>
                                                                            <FormGroup>
                                                                                <div className="insurerName">
                                                                                    <Field
                                                                                        name="refNo"
                                                                                        type="text"
                                                                                        placeholder="Type No"
                                                                                        autoComplete="off"
                                                                                        className="hght30"
                                                                                        value={values.refNo}
                                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    />
                                                                                    {errors.refNo && touched.refNo ? (
                                                                                        <span className="errorMsg">{errors.refNo}</span>
                                                                                    ) : null}
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>

                                                                </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>
                                                                        <img src={require('../../assets/images/green-check.svg')} alt="" className="m-r-10" />
                                                                        <img src={require('../../assets/images/CSC.svg')} alt="" />
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>

                                                            <Row>
                                                                <Col sm={12}>
                                                                    <label className="customCheckBox formGrp formGrp fscheck">I want to receive my Quote & Policy Details on Whatsapp
                                                                        <Field
                                                                            type="checkbox"
                                                                            name='whatsapp'
                                                                            value='1'
                                                                            className="user-self"
                                                                        // checked={values.consumables ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </Col>
                                                            </Row>
                                                            <div className="d-flex justify-content-left resmb">
                                                                <Button className="backBtn" type="button" onClick={this.additionalDetails.bind(this, productId)}>Back</Button>
                                                                {fulQuoteResp.QuotationNo ?
                                                                    <Button type="submit"
                                                                        className="proceedBtn"
                                                                    >
                                                                        Make Payment
                                                                </Button> 
                                                            : null}
                                                            </div>
                                                        </Col>


                                                        <Col sm={12} md={3} lg={3}>
                                                            <div className="motrcar"><img src={require('../../assets/images/motor-car.svg')} alt="" /></div>
                                                        </Col>
                                                    </Row>
                                                </section>
                                            </Form>
                                        );
                                    }}
                                </Formik>
                                <Modal className="" bsSize="md"
                                    show={show}
                                    onHide={this.handleClose}>
                                    <div className="otpmodal">
                                        <Modal.Body>
                                            <Otp
                                                quoteNo={fulQuoteResp.QuotationNo}
                                                duePremium={fulQuoteResp.DuePremium}
                                                refNumber={refNumber}
                                                whatsapp={whatsapp}
                                                reloadPage={(e) => this.payment(e)}
                                            />
                                        </Modal.Body>
                                    </div>
                                </Modal>

                            </div>
                            <Footer />
                        </div>
                    </div>
                </BaseComponent>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loading: state.loader.loading,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Premium)
);
