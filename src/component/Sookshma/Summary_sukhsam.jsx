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

import { setSmeRiskData, setSmeData, setSmeOthersDetailsData, setSmeProposerDetailsData } from "../../store/actions/sukhsam";
import { connect } from "react-redux";
import * as Yup from "yup";
import Encryption from '../../shared/payload-encryption';
import queryString from 'query-string';
import fuel from '../common/FuelTypes';
import swal from 'sweetalert';
import moment from "moment";
import Blink from 'react-blink-text';

const initialValue = {}

const validatePremium = Yup.object().shape({
    refNo: Yup.string().notRequired('Reference number is required')
        .matches(/^[a-zA-Z0-9]*$/, function () {
            return "Please enter valid reference number"
        }),
})

class Summary_sukhsam extends Component {

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
            nomineedetails: [],
            relation: [],
            policyHolder: [],
            vehicleDetails: [],
            previousPolicy: [],
            request_data: [],
            breakin_flag: 0,
            salutationName: '',
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

    handleSubmit = (values) => {

        const { productId } = this.props.match.params;
        this.props.loadingStop();
        this.props.history.push(`/AdditionalDetails_Sookshma/${productId}`);

    }

    fetchPolicyDetails = () => {
        let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no") : 0;
        let encryption = new Encryption();

        this.props.loadingStart();
        axios.get(`sookshama/details/${policy_holder_ref_no}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log("decryptResp -------->",decryptResp)
                let rawData = decryptResp.data

                let pincode_area_arr = JSON.parse(decryptResp.data.policyHolder.pincode_response);

                this.setState(
                    {
                        // salutationName:decryptResp.data.policyHolder.salutation.displayvalue ,
                        // pincodeArea:pincode_area_arr.LCLTY_SUBRB_TALUK_TEHSL_NM != null ? pincode_area_arr.LCLTY_SUBRB_TALUK_TEHSL_NM : 0,
                        quoteId: decryptResp.data.policyHolder.request_data.quote_id != null ? decryptResp.data.policyHolder.request_data.quote_id : 0,
                        gst: decryptResp.data.policyHolder.request_data.service_tax != null ? decryptResp.data.policyHolder.request_data.service_tax : 0,
                        netPremium: decryptResp.data.policyHolder.request_data.net_premium != null ? decryptResp.data.policyHolder.request_data.net_premium : 0,
                        finalPremium: decryptResp.data.policyHolder.request_data.net_premium != null ? decryptResp.data.policyHolder.request_data.net_premium : 0,
                        rawData: rawData.policyHolder.sookshamainfo.sookshama_coverages != null ? rawData.policyHolder.sookshamainfo.sookshama_coverages : 0,
                    }
                );
                if(decryptResp.data.policyHolder.step_no > 0){

                    this.props.setData({
                        start_date:decryptResp.data.policyHolder.request_data.start_date,
                        end_date:decryptResp.data.policyHolder.request_data.end_date,
                        registration_type : decryptResp.data.policyHolder.sookshamainfo.policy_type,
                        
                        policy_holder_id:decryptResp.data.policyHolder.id,
                        policy_holder_ref_no:policy_holder_ref_no,
                        request_data_id:decryptResp.data.policyHolder.request_data.id,
                        completed_step:decryptResp.data.policyHolder.step_no,
                        menumaster_id:decryptResp.data.policyHolder.menumaster_id,
                        payment_link_status: decryptResp.data.policyHolder && decryptResp.data.policyHolder.bcmaster ? decryptResp.data.policyHolder.bcmaster.eligible_for_payment_link : 0
                    });
                
                }

                if(decryptResp.data.policyHolder.step_no == 1 || decryptResp.data.policyHolder.step_no > 1){

                    let risk_arr = JSON.parse(decryptResp.data.policyHolder.sookshamainfo.risk_address);

                    this.props.setRiskData(
                        {
                            policy_type : decryptResp.data.policyHolder.sookshamainfo.risk_location_type,
                            shop_building_name:risk_arr.shop_building_name,
                            block_no:risk_arr.block_no,
                            street_name:risk_arr.street_name,
                            plot_no:risk_arr.plot_no,
                            house_flat_no:risk_arr.house_flat_no,
                            pincode:decryptResp.data.policyHolder.sookshamainfo.pincode,
                            pincode_id:decryptResp.data.policyHolder.sookshamainfo.pincode_id,
                            multipleAddress : risk_arr.multipleAddress.length > 0 ? risk_arr.multipleAddress : [],
                            multiple_fire_sum_insured : risk_arr.multiple_fire_sum_insured.length > 0 ? risk_arr.multiple_fire_sum_insured : [],

                            buildings_si:decryptResp.data.policyHolder.sookshamainfo.buildings_si,
                            plant_machinary_si:decryptResp.data.policyHolder.sookshamainfo.plant_machinary_si,
                            furniture_fixture_si:decryptResp.data.policyHolder.sookshamainfo.furniture_fixture_si,
                            stock_raw_mat:decryptResp.data.policyHolder.sookshamainfo.stock_raw_mat,
                            finish_goods:decryptResp.data.policyHolder.sookshamainfo.finish_goods,
                            stock_wip:decryptResp.data.policyHolder.sookshamainfo.stock_wip,
                            content_sum_insured: decryptResp.data.policyHolder.sookshamainfo.total_sum_insured,
                            stock_sum_insured : decryptResp.data.policyHolder.sookshamainfo.fire_stock_si
                        }
                    );

                }

                if(decryptResp.data.policyHolder.step_no == 2 || decryptResp.data.policyHolder.step_no > 2){

                    this.props.setSmeOthersDetails({
                    
                        // previous_start_date:decryptResp.data.policyHolder.previouspolicy.start_date,
                        // previous_end_date:decryptResp.data.policyHolder.previouspolicy.end_date,
                        // Commercial_consideration:decryptResp.data.policyHolder.previouspolicy.Commercial_consideration,
                        // Previous_Policy_No:decryptResp.data.policyHolder.previouspolicy.policy_no,
                        // insurance_company_id:decryptResp.data.policyHolder.previouspolicy.insurancecompany_id,
                        // address:decryptResp.data.policyHolder.previouspolicy.address,
                        // is_claim: decryptResp.data.policyHolder.sookshamainfo.is_claim,
                        // previous_policy_check: decryptResp.data.policyHolder.previouspolicy.policy_no ? 1 : 0,

                        financial_party: decryptResp.data.policyHolder.sookshamainfo.financial_party ? decryptResp.data.policyHolder.sookshamainfo.financial_party : "",
                        financial_modgaged : decryptResp.data.policyHolder.sookshamainfo.financial_modgaged ? decryptResp.data.policyHolder.sookshamainfo.financial_modgaged : "",
                        financer_name: decryptResp.data.policyHolder.sookshamainfo.financer_name ? decryptResp.data.policyHolder.sookshamainfo.financer_name : ""
        
                    });

                }

                if(decryptResp.data.policyHolder.step_no == 3 || decryptResp.data.policyHolder.step_no > 3){
                    
                    let address = '';
                    if(decryptResp.data.policyHolder.address == null){
                        
                    }else{
                        address = JSON.parse(decryptResp.data.policyHolder.address);

                        this.props.setSmeProposerDetails(
                            {
                                first_name:decryptResp.data.policyHolder.first_name,
                                last_name:decryptResp.data.policyHolder.last_name,
                                salutation_id:decryptResp.data.policyHolder.salutation_id,
                                date_of_birth:decryptResp.data.policyHolder.dob,
                                email_id:decryptResp.data.policyHolder.email_id,
                                mobile:decryptResp.data.policyHolder.mobile,
                                gender:decryptResp.data.policyHolder.gender,
                                pan_no:decryptResp.data.policyHolder.pancard,
                                gstn_no:decryptResp.data.policyHolder.gstn_no,

                                com_street_name:address.street_name,
                                com_plot_no:address.plot_no,
                                com_building_name:address.house_building_name,
                                com_block_no:address.block_no,
                                com_house_flat_no:address.house_flat_no,
                                com_pincode:decryptResp.data.policyHolder.pincode,
                                com_pincode_id:decryptResp.data.policyHolder.pincode_id
                            }
                        );
                    }
                }
                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
                swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111")
                return false;
            })


    }

    componentDidMount() {
        this.fetchPolicyDetails()
    }

    getGender = (gender) => {

        if (gender == 'm') {
            return 'Male';
        } else if (gender == 'f') {
            return 'Female';
        }

    }

    otherDetails = (productId) => {
        // productId === 5
        this.props.history.push(`/OtherDetails_Sookshma/${productId}`);
    }

    getPostcodeArea = (com_pincode_id) => {

    }

    render() {
        const { policyHolder, show, fulQuoteResp, motorInsurance, error, error1, refNumber, paymentStatus, relation, memberdetails, nomineedetails, vehicleDetails, breakin_flag, rawData } = this.state
        const { productId } = this.props.match.params
        // console.log("data------",rawData.policyHolder.smeinfo)
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
        
        var sl = 1
        var loc = 1
        const sme_Coverages =
            rawData && rawData.length > 0
                ? rawData.map((listing, qIndex) => (
                    <>
                    {sl == 1 && listing.coverage.description == "Terrorism Premium for Section I" ? (<tr><th colSpan={2} style={{backgroundColor : "#eaeef1"}}>Location {loc} :-</th></tr>) : ''}
                    <tr style={{borderBottom: sl == 2 ? "1px solid #d2d2d2" : ''}}>
                        <td style={({ width: "400px" })}>{listing.coverage.description} :</td>   
                        <td>{listing.premium == null ? 0 : Math.round(listing.premium)}</td>
                    </tr>
                    <div style={{display: 'none'}}>{sl == 2 ? sl=1 : sl++}{sl==1 ? loc++ : loc}</div>
                    </>
                ))
                :  null;

        console.log("rawData", rawData);

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

                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <div className="text">
                                <h4 className="text-center mt-3 mb-0">SME Package Insurance</h4>
                                </div>
                                <h1 className="text-center mt-3 mb-4"> {" "} </h1>
                                <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                                    validationSchema={validatePremium}
                                >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                        return (
                                            <Form>
                                                <section className="brand m-t-11 m-b-25">
                                                    <div className="d-flex justify-content-left">
                                                        <div className="brandhead m-b-10">
                                                            <h4>SME Package Insurance </h4>
                                                            <p>You are just one steps away in getting your policy ready.</p> <p>Your Quotation Number is: <span><strong>{this.state.quoteId}</strong></span></p>
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
                                                            <div className="rghtsideTrigr m-b-30">
                                                                <Collapsible trigger="Policy Summary" open={true}>
                                                                    <div className="listrghtsideTrigr">
                                                                        <div>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>
                                                                                                <strong>Policy Start Date :</strong></FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{moment(new Date(this.props.start_date)).format('DD MMM yyyy')}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup><strong>Policy End Date :</strong></FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{moment(new Date(this.props.end_date)).format('DD MMM yyyy')}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={12}>
                                                                                    <table style={({ width: "45rem" })}>
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th>Cover Type</th>
                                                                                                <th>Premium(???)</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                           
                                                                                            {sme_Coverages}
                                                                                            <tr>
                                                                                                <td style={({ width: "400px" })}>Other Cover Premium :</td>   
                                                                                                <td>0</td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style={({ width: "400px" })}>Discount/Loading if any :</td>   
                                                                                                <td>0</td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style={({ width: "400px" })}>Taxes as applicable :</td>   
                                                                                                <td>{this.state.gst ? Math.round(this.state.gst) : 0}</td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style={({ width: "400px" })}>Kerala Cess :</td>   
                                                                                                <td>0</td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style={({ width: "400px" })}><strong>Final Premium(???) :</strong></td>   
                                                                                                <td><strong>{this.state.netPremium ? Math.round(this.state.netPremium) : 0}</strong></td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <p>&nbsp;</p>
                                                                            </Row>

                                                                            {/* <Row>
                                                                                <Col sm={12} md={12}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup><strong>Net Premium(???) :</strong></FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.state.netPremium}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={12}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup><strong>GST(???) :</strong></FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.state.gst}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={12}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup><strong>Final Premium(???) :</strong></FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.state.finalPremium}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <p></p>
                                                                            </Row> */}
                                                                        </div>
                                                                    </div>

                                                                </Collapsible>
                                                            </div>

                                                            <div className="d-flex justify-content-left resmb">

                                                                <Button className={`backBtn`} type="button" onClick={this.otherDetails.bind(this, productId)}>
                                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                                </Button>
                                                                <Button className={`proceedBtn`} type="submit" disabled={isSubmitting ? true : false}>
                                                                    Next
                                                                </Button>

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
                </div>
                </BaseComponent>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loading: state.loader.loading,

        policy_holder_ref_no: state.sukhsam.policy_holder_ref_no,
        menumaster_id: state.sukhsam.menumaster_id,
        policy_holder_id: state.sukhsam.policy_holder_id,

        start_date: state.sukhsam.start_date,
        end_date: state.sukhsam.end_date,


        house_building_name: state.sukhsam.house_building_name,
        block_no: state.sukhsam.block_no,
        street_name: state.sukhsam.street_name,
        content_sum_insured: state.sukhsam.content_sum_insured,
        house_flat_no: state.sukhsam.house_flat_no,
        pincode: state.sukhsam.pincode,
        pincode_id: state.sukhsam.pincode_id,
        multipleAddress : state.sukhsam.multipleAddress,
        multiple_fire_sum_insured: state.sukhsam.multiple_fire_sum_insured,
        buildings_sum_insured: state.sukhsam.buildings_sum_insured,
        content_sum_insured: state.sukhsam.content_sum_insured,
        stock_sum_insured: state.sukhsam.stock_sum_insured,

        first_name: state.sukhsam.first_name,
        last_name: state.sukhsam.last_name,
        salutation_id: state.sukhsam.salutation_id,
        date_of_birth: state.sukhsam.date_of_birth,
        email_id: state.sukhsam.email_id,
        mobile: state.sukhsam.mobile,
        gender: state.sukhsam.gender,
        pan_no: state.sukhsam.pan_no,
        gstn_no: state.sukhsam.gstn_no,

        com_street_name: state.sukhsam.com_street_name,
        com_plot_no: state.sukhsam.com_plot_no,
        com_building_name: state.sukhsam.com_building_name,
        com_block_no: state.sukhsam.com_block_no,
        com_house_flat_no: state.sukhsam.com_house_flat_no,
        com_pincode: state.sukhsam.com_pincode,
        com_pincode_id: state.sukhsam.com_pincode_id,


        previous_start_date: state.sukhsam.previous_start_date,
        previous_end_date: state.sukhsam.previous_end_date,
        Previous_Policy_No: state.sukhsam.Previous_Policy_No,
        insurance_company_id: state.sukhsam.insurance_company_id,
        previous_city: state.sukhsam.previous_city,



    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
        setData: (data) => dispatch(setSmeData(data)),
        setRiskData: (data) => dispatch(setSmeRiskData(data)),
        setSmeProposerDetails: (data) => dispatch(setSmeProposerDetailsData(data)),
        setSmeOthersDetails: (data) => dispatch(setSmeOthersDetailsData(data))
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Summary_sukhsam)
);