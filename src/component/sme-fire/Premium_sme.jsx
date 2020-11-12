import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter, Link, Route } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { setSmeRiskData,setSmeData,setSmeOthersDetailsData,setSmeProposerDetailsData } from "../../store/actions/sme_fire";
import * as Yup from "yup";
import Encryption from '../../shared/payload-encryption';
import queryString from 'query-string';
import fuel from '../common/FuelTypes';
import swal from 'sweetalert';
import moment from "moment";

const initialValue = {}

const validatePremium = Yup.object().shape({
    refNo: Yup.string().notRequired('Reference number is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Please enter valid reference number"
    }),
    })

class Premium_sme extends Component {

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
            nomineedetails:[],
            relation: [],
            policyHolder: [],
            vehicleDetails: [],
            previousPolicy: [],
            request_data: [],
            breakin_flag: 0,
            policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 
                                queryString.parse(this.props.location.search).access_id : 
                                localStorage.getItem("policyHolder_refNo")
        };
    }


    handleClose(e) {
        this.setState({ show: false, });
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
        this.props.history.push(`/Summary_SME/${productId}`);
    }

    handleSubmit = (values) => {
        console.log("values-----",values)
        // this.setState({ show: true, refNo: values.refNo, whatsapp: values.whatsapp });
        const {policyHolder} = this.state
        if(policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.slug) {
            if(policyHolder.bcmaster.paymentgateway.slug == "csc_wallet") {
                this.payment()
            }
            if(policyHolder.bcmaster.paymentgateway.slug == "razorpay") {
                this.Razor_payment()
            }
            if(policyHolder.bcmaster.paymentgateway.slug == "PPINL") {
                this.paypoint_payment()
            }
        }
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
        let encryption = new Encryption();
        let dateDiff = 0
        const {previousPolicy, request_data, policyHolder} = this.state
        const post_data = {
            'ref_no':this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0',
            'access_token':access_token,
            'idv_value': motorInsurance.idv_value,
            'policy_type':  motorInsurance.policy_type,
            'add_more_coverage': motorInsurance.add_more_coverage,
            'cng_kit': motorInsurance.cng_kit,
            'cngKit_Cost': Math.floor(motorInsurance.cngkit_cost),
            'PA_Cover': motorInsurance && motorInsurance.pa_cover ? motorInsurance.pa_cover : '0',
        }

        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        console.log("post_data--fullQuotePMCAR- ", post_data)
        axios.post('fullQuotePMCAR', formData)
            .then(res => {
                if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
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
// http://14.140.119.44/sbig-csc/ConnectPG/payment_sme_fire.php?refrence_no=5919d14a1fe65f1b62437ce0221a4419
    payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment_sme_fire.php?refrence_no=${refNumber}`
    }
    // http://14.140.119.44/sbig-csc/razorpay/smefire_pay.php?refrence_no=b6682aa3f5bc9003623cdee5506dfb2d
    Razor_payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/smefire_pay.php?refrence_no=${refNumber}`
    }

    paypoint_payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/ppinl/pay.php?refrence_no=${refNumber}`
    }

    componentDidMount() {
        this.fetchPolicyDetails()
    }

    getGender = (gender) => {

        if(gender == 'm'){
            return 'Male';
        }else if(gender == 'f'){
            return 'Female';
        }

    }

    fetchPolicyDetails=()=>{
        let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no"):0;
        console.log('this.props.policy_holder_ref_no',this.props.policy_holder_ref_no);

            
            this.props.loadingStart();
            axios.get(`sme/details/${policy_holder_ref_no}`)
            .then(res=>{
                

                if(res.data.data.policyHolder.step_no > 0){

                    this.props.setData({
                        start_date:res.data.data.policyHolder.request_data.start_date,
                        end_date:res.data.data.policyHolder.request_data.end_date,
                        
                        policy_holder_id:res.data.data.policyHolder.id,
                        policy_holder_ref_no:policy_holder_ref_no,
                        request_data_id:res.data.data.policyHolder.request_data.id,
                        completed_step:res.data.data.policyHolder.step_no,
                        menumaster_id:res.data.data.policyHolder.menumaster_id
                    });

                    

                }

                if(res.data.data.policyHolder.step_no == 1 || res.data.data.policyHolder.step_no > 1){

                    let risk_arr = JSON.parse(res.data.data.policyHolder.smeinfo.risk_address);

                    this.props.setRiskData(
                        {
                            house_building_name:risk_arr.house_building_name,
                            block_no:risk_arr.block_no,
                            street_name:risk_arr.street_name,
                            plot_no:risk_arr.plot_no,
                            house_flat_no:risk_arr.house_flat_no,
                            pincode:res.data.data.policyHolder.smeinfo.pincode,
                            pincode_id:res.data.data.policyHolder.smeinfo.pincode_id,

                            buildings_sum_insured:res.data.data.policyHolder.smeinfo.buildings_sum_insured,
                            content_sum_insured:res.data.data.policyHolder.smeinfo.content_sum_insured,
                            stock_sum_insured:res.data.data.policyHolder.smeinfo.stock_sum_insured
                        }
                    );
                }

                if(res.data.data.policyHolder.step_no == 2 || res.data.data.policyHolder.step_no > 2){

                    this.props.setSmeOthersDetails({
                    
                        Commercial_consideration:res.data.data.policyHolder.previouspolicy.Commercial_consideration,
                        previous_start_date:res.data.data.policyHolder.previouspolicy.start_date,
                        previous_end_date:res.data.data.policyHolder.previouspolicy.end_date,
                        Previous_Policy_No:res.data.data.policyHolder.previouspolicy.policy_no,
                        insurance_company_id:res.data.data.policyHolder.previouspolicy.insurancecompany_id,
                        previous_city:res.data.data.policyHolder.previouspolicy.address
        
                    });

                }

                if(res.data.data.policyHolder.step_no == 3 || res.data.data.policyHolder.step_no > 3){

                    let address = JSON.parse(res.data.data.policyHolder.address);

                    this.props.setSmeProposerDetails(
                        {
                            first_name:res.data.data.policyHolder.first_name,
                            last_name:res.data.data.policyHolder.last_name,
                            salutation_id:res.data.data.policyHolder.salutation_id,
                            date_of_birth:res.data.data.policyHolder.dob,
                            email_id:res.data.data.policyHolder.email_id,
                            mobile:res.data.data.policyHolder.mobile,
                            gender:res.data.data.policyHolder.gender,
                            pan_no:res.data.data.policyHolder.pancard,
                            gstn_no:res.data.data.policyHolder.gstn_no,

                            com_street_name:address.street_name,
                            com_plot_no:address.plot_no,
                            com_building_name:address.house_building_name,
                            com_block_no:address.block_no,
                            com_house_flat_no:address.house_flat_no,
                            com_pincode:res.data.data.policyHolder.pincode,
                            com_pincode_id:res.data.data.policyHolder.pincode_id
                        }
                    );
                }

                let pincode_area_arr = JSON.parse(res.data.data.policyHolder.pincode_response);
                
                this.setState(
                    {
                        salutationName:res.data.data.policyHolder.salutation.displayvalue,
                        pincodeArea:pincode_area_arr.LCLTY_SUBRB_TALUK_TEHSL_NM,
                        quoteId:res.data.data.policyHolder.request_data.quote_id,
                        grossPremium:res.data.data.policyHolder.request_data.gross_premium,
                        payablePremium:res.data.data.policyHolder.request_data.payable_premium,
                        refNumber:res.data.data.policyHolder.reference_no,
                        logo:res.data.data.policyHolder.bcmaster.paymentgateway.logo,
                        policyHolder:res.data.data.policyHolder
                    }
                );

                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
            })
        
        
    }

    render() {
        const { policyHolder, show, fulQuoteResp, motorInsurance, error, error1, refNumber, paymentStatus, relation, memberdetails,nomineedetails, vehicleDetails, breakin_flag } = this.state
        const { productId } = this.props.match.params

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
                                <h4 className="text-center mt-3 mb-3">SME Pre UW</h4>
                                <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                                validationSchema={validatePremium}
                                >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                        return (
                                            <Form>
                                                <section className="brand m-t-11 m-b-25">
                                                    <div className="d-flex justify-content-left">
                                                        <div className="brandhead m-b-10">
                                                            <h4>SME FIRE </h4>
                                                        </div>
                                                    </div>
                                                    <div className="brandhead m-b-30">
                                                        <h5>{errMsg}</h5>
                                                        <h5>{paymentErrMsg}</h5>
                                                        <h4>
                                                            {/* Policy Reference Number {fulQuoteResp.QuotationNo} */}
                                                        </h4>
                                                    </div>

                                                    <Row>
                                                        <Col sm={12} md={9} lg={9}>
                                                            <div className="rghtsideTrigr">
                                                                <Collapsible trigger="Proposal Details" >
                                                                    <div className="listrghtsideTrigr">
                                                                        <Row>
                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Premium:
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {this.state.payablePremium}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Gross Premium:
                                                                                </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {this.state.grossPremium}
                                                                                </div>
                                                                            </Col>

                                                                            {/* <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    GST:
                                                                                </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {Math.round(fulQuoteResp.TGST)}
                                                                                </div>
                                                                            </Col> */}
                                                                        </Row>
                                                                    </div>

                                                                </Collapsible>
                                                            </div>

                                                            <div className="rghtsideTrigr m-b-30">
                                                                <Collapsible trigger="Member Details" >
                                                                    <div className="listrghtsideTrigr">
                                                                        

                                                                                <div>
                                                                                    {/* <strong>Owner Details :</strong>
                                                                                    <br/> */}
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Title:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{this.state.salutationName}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>First Name:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{this.props.first_name}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Last Name:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{this.props.last_name}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Email:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{this.props.email_id}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Date Of Birth:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{moment(new Date(this.props.date_of_birth)).format('LL')}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Mobile Number:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{this.props.mobile}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Gender:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{this.getGender(this.props.gender)}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>GSTN:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{this.props.gstn_no}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Pan No.:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{this.props.pan_no}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <p></p>
                                                                                    </Row>
                                                                                </div>
                                                                    </div>

                                                                </Collapsible>
                                                            </div>

                                                            <Row>
                                                            <Col sm={12} md={6}>
                                                            </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>
                                                                    <div className="paymntgatway">
                                                                        Select Payment Gateway
                                                                        <div>
                                                                        <img src={require('../../assets/images/green-check.svg')} alt="" className="m-r-10" />

                                                                        { this.state.quoteId && this.state.quoteId != '' ? <img src={require('../../assets/images/'+ this.state.logo)} alt="" /> :
                                                                        null
                                                                        }
                                                                        </div>
                                                                    </div>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>

                                                            <div className="d-flex justify-content-left resmb">
                                                                <Button className="backBtn" type="button" onClick={this.additionalDetails.bind(this, productId)}>Back</Button>
                                                                {this.state.quoteId && this.state.quoteId != '' ?
                                                                    <Button type="submit"
                                                                        className="proceedBtn"
                                                                    >
                                                                        Make Payment
                                                                </Button> 
                                                            : null}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </section>
                                            </Form>
                                        );
                                    }}
                                </Formik>

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

        policy_holder_ref_no:state.sme_fire.policy_holder_ref_no,
        menumaster_id:state.sme_fire.menumaster_id,
        policy_holder_id:state.sme_fire.policy_holder_id,

        start_date: state.sme_fire.start_date,
        end_date: state.sme_fire.end_date,


        house_building_name: state.sme_fire.house_building_name,
        block_no: state.sme_fire.block_no,
        street_name: state.sme_fire.street_name,
        content_sum_insured: state.sme_fire.content_sum_insured,
        house_flat_no: state.sme_fire.house_flat_no,
        pincode: state.sme_fire.pincode,
        pincode_id: state.sme_fire.pincode_id,
        buildings_sum_insured: state.sme_fire.buildings_sum_insured,
        content_sum_insured: state.sme_fire.content_sum_insured,
        stock_sum_insured: state.sme_fire.stock_sum_insured,

        first_name:state.sme_fire.first_name,
        last_name:state.sme_fire.last_name,
        salutation_id:state.sme_fire.salutation_id,
        date_of_birth:state.sme_fire.date_of_birth,
        email_id:state.sme_fire.email_id,
        mobile:state.sme_fire.mobile,
        gender:state.sme_fire.gender,
        pan_no:state.sme_fire.pan_no,
        gstn_no:state.sme_fire.gstn_no,

        com_street_name:state.sme_fire.com_street_name,
        com_plot_no:state.sme_fire.com_plot_no,
        com_building_name:state.sme_fire.com_building_name,
        com_block_no:state.sme_fire.com_block_no,
        com_house_flat_no:state.sme_fire.com_house_flat_no,
        com_pincode:state.sme_fire.com_pincode,
        com_pincode_id:state.sme_fire.com_pincode_id,

        
        previous_start_date:state.sme_fire.previous_start_date,
        previous_end_date:state.sme_fire.previous_end_date,
        Previous_Policy_No:state.sme_fire.Previous_Policy_No,
        insurance_company_id:state.sme_fire.insurance_company_id,
        previous_city:state.sme_fire.previous_city,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
        setData:(data) => dispatch(setSmeData(data)),
        setRiskData:(data) => dispatch(setSmeRiskData(data)),
        setSmeProposerDetails:(data) => dispatch(setSmeProposerDetailsData(data)),
        setSmeOthersDetails:(data) => dispatch(setSmeOthersDetailsData(data))
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Premium_sme)
);
