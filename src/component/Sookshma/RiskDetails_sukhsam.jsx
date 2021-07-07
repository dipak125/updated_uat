import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '../BaseComponent';
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
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import {  PersonAge } from "../../shared/dateFunctions";
import { setSmeRiskData,setSmeData,setSmeOthersDetailsData,setSmeProposerDetailsData } from '../../store/actions/sukhsam';


const ageObj = new PersonAge();
// const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
// const maxDate = moment(minDate).add(30, 'day').calendar();
const minDate = moment(moment().subtract(20, 'years').calendar()).add(1, 'day').calendar();
const maxDate = moment(moment().subtract(1, 'years').calendar()).add(30, 'day').calendar();
const startRegnDate = moment().subtract(20, 'years').calendar();
const minRegnDate = moment(startRegnDate).startOf('year').format('YYYY-MM-DD hh:mm');
const maxRegnDate = new Date();

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
    previous_claim_for: "",
    previous_policy_no: "",
    stateName: "",
    pinDataArr: [],
    fire_sum_insured: 0
}


class RiskDetails_sukhsam extends Component {

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
        previous_is_claim: ""
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

    fetchAreadetails=(e)=>{
        let pinCode = e.target.value;      

        if(pinCode.length==6){
            const formData = new FormData();
            this.props.loadingStart();
            // let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
        //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
           formData.append('pincode',pinCode)
           axios.post('pincode-details',
            formData
            ).then(res=>{
                if( res.data.error === false)
                {       
                let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
                this.setState({
                    pinDataArr: res.data.data,
                    stateName,
                });
                this.props.loadingStop();
            } else {
                swal("Plese enter a valid pincode")
                this.props.loadingStop();
            }
            }).
            catch(err=>{
                this.props.loadingStop();
            })  
        }       
    }

    fetchAreadetailsBack=(pincode_input=null)=>{

        let pinCode = '';

        if(this.props.pincode != null && this.props.pincode != '' && this.props.pincode.length==6){
            pinCode = this.props.pincode;
        }else if(pincode_input != ''){
            pinCode = pincode_input;
        }

        if(pinCode != null && pinCode != '' && pinCode.length==6){
            const formData = new FormData();
            this.props.loadingStart();
            // let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
            // formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
            formData.append('pincode',pinCode)
            axios.post('pincode-details',
            formData
            ).then(res=>{       
                let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
                this.setState({
                    pinDataArr: res.data.data,
                    stateName,
                });
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
            })          
        }     
    }
    
    handleSubmit=(values, actions)=>{
        const {productId} = this.props.match.params 
        const formData = new FormData();
        let encryption = new Encryption();

        let post_data = {
            'policy_holder_id': this.props.policy_holder_id,
            'menumaster_id': this.props.menumaster_id,
            'page_name': `RiskDetails_Sookshma/${productId}`,
            'shop_building_name': values.shop_building_name,
            'block_no': values.block_no,
            'house_flat_no': values.house_flat_no,
            'pincode': values.pincode,
            'pincode_id': values.pincode_id,
            'buildings_si': values.buildings_si,
            'plant_machinary_si': values.plant_machinary_si,
            'furniture_fixture_si': values.furniture_fixture_si,
            'stock_raw_mat' : values.stock_raw_mat,
            'finish_goods' : values.finish_goods,
            'stock_wip' : values.stock_wip,
        }

        
        var Fire_sum_insured = parseInt(values.buildings_si) + 
        parseInt(values.plant_machinary_si) + 
        parseInt(values.furniture_fixture_si) + 
        parseInt(values.stock_raw_mat) + 
        parseInt(values.finish_goods) + 
        parseInt(values.stock_wip);

        console.log('Sookshama....post_data..--- ',post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))

        if (Fire_sum_insured < 500000) {
            this.props.loadingStop();
            swal("Sum total of fire buildings sum insured, fire contents sum insured and stock sum insured should be equal to or more than 5 Lakhs")
            return false;
        } else if(Fire_sum_insured > 10000000) {
             this.props.loadingStop();
            swal("Sum total of fire buildings sum insured, fire contents sum insured and stock sum insured should be less than 1 crore")
            return false;
        } else {
        this.props.loadingStart();
        axios.post('sookshama/policy-details',
        formData
        ).then(res=>{     
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            if (decryptResp.error === false )  {
            this.props.loadingStop();
            this.props.setRiskData(
                {

                    shop_building_name:values.shop_building_name,
                    block_no:values.block_no,
                    house_flat_no:values.house_flat_no,
                    pincode:values.pincode,
                    pincode_id:values.pincode_id,
                    buildings_si:values.buildings_si,
                    plant_machinary_si:values.plant_machinary_si,
                    furniture_fixture_si:values.furniture_fixture_si,
                    stock_raw_mat:values.stock_raw_mat,
                    finish_goods:values.finish_goods,
                    stock_wip:values.stock_wip,
                    content_sum_insured: Fire_sum_insured,
                    stock_sum_insured : parseInt(values.stock_raw_mat) + parseInt(values.finish_goods) + parseInt(values.stock_wip)
                }
            );
            const {productId} = this.props.match.params;
            this.props.loadingStop()
            this.setState({ Fire_sum_insured : Fire_sum_insured })
            
            this.props.history.push(`/OtherDetails_Sookshma/${productId}`);
        } else {
            this.props.loadingStop();
            swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111");
            actions.setSubmitting(false);
        }
        }).
        catch(err=>{
            this.props.loadingStop();
            let decryptResp = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptErr-----', decryptResp)
            actions.setSubmitting(false);
        })
    }
    }

    fetchPolicyDetails=()=>{
        let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no"):0;
        let encryption = new Encryption();
        if(this.props.policy_holder_ref_no == null && policy_holder_ref_no != ''){
            this.props.loadingStart();
            axios.get(`sookshama/details/${policy_holder_ref_no}`)
            .then(res=>{
                let decryptResp = JSON.parse(encryption.decrypt(res.data));

                if(decryptResp.data.policyHolder.step_no > 0){
                    this.props.setData({
                        start_date:decryptResp.data.policyHolder.request_data.start_date,
                        end_date:decryptResp.data.policyHolder.request_data.end_date,
                        
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
                            shop_building_name:risk_arr.shop_building_name,
                            block_no:risk_arr.block_no,
                            house_flat_no:risk_arr.house_flat_no,
                            pincode:decryptResp.data.policyHolder.sookshamainfo.pincode,
                            pincode_id:decryptResp.data.policyHolder.sookshamainfo.pincode_id,

                            buildings_si:decryptResp.data.policyHolder.sookshamainfo.buildings_si,
                            plant_machinary_si:decryptResp.data.policyHolder.sookshamainfo.plant_machinary_si,
                            furniture_fixture_si:decryptResp.data.policyHolder.sookshamainfo.furniture_fixture_si,
                            stock_raw_mat:decryptResp.data.policyHolder.sookshamainfo.stock_raw_mat,
                            finish_goods:decryptResp.data.policyHolder.sookshamainfo.finish_goods,
                            stock_wip:decryptResp.data.policyHolder.sookshamainfo.stock_wip,
                            content_sum_insured: decryptResp.data.policyHolder.sookshamainfo.fire_content_si,
                            stock_sum_insured : decryptResp.data.policyHolder.sookshamainfo.fire_stock_si
                        }
                    );
                }

                if(decryptResp.data.policyHolder.step_no == 2 || decryptResp.data.policyHolder.step_no > 2){

                    this.props.setSmeOthersDetails({
                    
                        // Commercial_consideration:decryptResp.data.policyHolder.previouspolicy.Commercial_consideration,
                        // previous_start_date:decryptResp.data.policyHolder.previouspolicy.start_date,
                        // previous_end_date:decryptResp.data.policyHolder.previouspolicy.end_date,
                        // Previous_Policy_No:decryptResp.data.policyHolder.previouspolicy.policy_no,
                        // insurance_company_id:decryptResp.data.policyHolder.previouspolicy.insurancecompany_id,
                        // address:decryptResp.data.policyHolder.previouspolicy.address,
                        // is_claim: decryptResp.data.policyHolder.sookshamainfo.is_claim,
                        // previous_policy_check: decryptResp.data.policyHolder.previouspolicy.policy_no ? 1 : 0,

                        financial_party: decryptResp.data.policyHolder.sookshamainfo.financial_party ? decryptResp.data.policyHolder.sookshamainfo.financial_party : "",
                        financial_modgaged : decryptResp.data.policyHolder.sookshamainfo.financial_modgaged ? decryptResp.data.policyHolder.sookshamainfo.financial_modgaged : "",
                        financer_name: decryptResp.data.policyHolder.sookshamainfo.financer_name ? decryptResp.data.policyHolder.sookshamainfo.financer_name : ""
        
                    });

                    this.fetchAreadetailsBack(decryptResp.data.policyHolder.sookshamainfo.pincode);
                
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
                                com_building_name:address.shop_building_name,
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
            })
        }
        
    }

    fireSumCalculate (){
        const fire_Sum = this.state.Fire_sum_insured
    }

    componentDidMount() {
        // this.getInsurerList();
        //this.fetchData();
        this.fetchPolicyDetails();
        this.fetchAreadetailsBack();
        this.fireSumCalculate();
        
    }
    Registration_SME = (productId) => {
        this.props.history.push(`/Registration_Sookshma/${productId}`);
    }

    render() {
        const Fire_contents_sum_insured = parseInt(this.props.plant_machinary_si) + parseInt(this.props.furniture_fixture_si);
        const Fire_stock_sum_insured = parseInt(this.props.stock_raw_mat) + parseInt(this.props.stock_wip) + parseInt(this.props.finish_goods);
        const {productId} = this.props.match.params  
        const {insurerList, showClaim, previous_is_claim, motorInsurance, previousPolicy,
            stateName,pinDataArr,CustomerID,suggestions, vehicleDetails, RTO_location} = this.state
            // console.log('Sookshama...',this.props)
        let newInitialValues = Object.assign(initialValue,{
            shop_building_name:this.props.shop_building_name,
            block_no:this.props.block_no,
            house_flat_no:this.props.house_flat_no,
            pincode:this.props.pincode,
            pincode_id:this.props.pincode_id,
            buildings_si:this.props.buildings_si && Math.round(this.props.buildings_si),
            plant_machinary_si:this.props.plant_machinary_si && Math.round(this.props.plant_machinary_si),
            furniture_fixture_si:this.props.furniture_fixture_si && Math.round(this.props.furniture_fixture_si),
            stock_raw_mat:this.props.stock_raw_mat && Math.round(this.props.stock_raw_mat),
            stock_wip:this.props.stock_wip && Math.round(this.props.stock_wip),
            finish_goods:this.props.finish_goods && Math.round(this.props.finish_goods),
            fire_contents_sum_insured:Fire_contents_sum_insured && Math.round(Fire_contents_sum_insured),
            fire_stock_sum_insured:Fire_stock_sum_insured && Math.round(Fire_stock_sum_insured)
        });

        // VALIDATION :----------------------------------------///////////////////////////
        const vehicleRegistrationValidation = Yup.object().shape({
            shop_building_name: Yup.string().required("Please enter building name").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                function() {
                    return "Please enter valid building name"
                }).nullable(),
            block_no: Yup.string().required("Please enter block no.").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                function() {
                    return "Please enter valid block no."
                }).nullable(),
            house_flat_no: Yup.string().required("Please enter house/flat no.").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                function() {
                    return "Please enter valid house/flat no,"
                }).nullable(),
            pincode: Yup.string().required('Pincode is required')
            .matches(/^[0-9]{6}$/, function() {
                return "Please enter valid 6 digit pin code"
            }).nullable(),
            pincode_id: Yup.string().required("Please select area").nullable(),
            buildings_si: Yup.string().required("Please enter building sum insured").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
            plant_machinary_si: Yup.string().required("Please enter plant and machinery sum insured").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
            furniture_fixture_si: Yup.string().required("Please enter furniture & fixture sum insured").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
            stock_raw_mat: Yup.string().required("Please enter stock of raw material").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
            finish_goods: Yup.string().required("Please enter stock of finished goods").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
            stock_wip: Yup.string().required("Please enter stock of work in progress").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
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

                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox riskdetail">
                <h4 className="text-center mt-3 mb-3">SME Package Insurance</h4>
                <section className="brand m-b-25">
                    <div className="brand-bg">
                        <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} validationSchema={vehicleRegistrationValidation}>
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                return (
                                    <Form>
                                        <Row>
                                            <Col sm={12} md={12} lg={9}>

                                                <div className="d-flex justify-content-left">
                                                <div className="brandhead">
                                                    <h4 className="fs-18 m-b-30">RISK DETAILS</h4>
                                                </div>
                                                </div> 
                                                <div className="d-flex justify-content-left">
                                                    <h4 className="fs-18 m-b-30">Type of occupancy at risk location : Shop Risk</h4>
                                                </div> 
                                                <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='shop_building_name'
                                                                type="text"
                                                                placeholder="Shop/Building Name"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.shop_building_name}                                                                            
                                                            />
                                                            {errors.shop_building_name && touched.shop_building_name ? (
                                                            <span className="errorMsg">{errors.shop_building_name}</span>
                                                            ) : null}              
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='block_no'
                                                                type="text"
                                                                placeholder="Block No."
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.block_no}                                                                            
                                                            />
                                                            {errors.block_no && touched.block_no ? (
                                                            <span className="errorMsg">{errors.block_no}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='house_flat_no'
                                                                type="text"
                                                                placeholder="House/Flat No"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.house_flat_no}                                                                            
                                                            />
                                                            {errors.house_flat_no && touched.house_flat_no ? (
                                                            <span className="errorMsg">{errors.house_flat_no}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    </Row>

                                                    <Row>

                                                    <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="pincode"
                                                                type="test"
                                                                placeholder="Pincode"
                                                                autoComplete="off"
                                                                maxLength = "6"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                onKeyUp={e=> this.fetchAreadetails(e)}
                                                                value={values.pincode}
                                                                maxLength="6"
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("state");
                                                                    setFieldTouched("pincode");
                                                                    setFieldValue("pincode", e.target.value);
                                                                    // setFieldValue("state", stateName ? stateName[0] : values.state);
                                                                    setFieldValue("pincode_id", "");
                                                                }}
                                                            />
                                                            {errors.pincode && touched.pincode ? (
                                                            <span className="errorMsg">{errors.pincode}</span>
                                                            ) : null}                                                   
                                                        </div>
                                                    </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name="pincode_id"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.pincode_id}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Select Location</option>
                                                                {pinDataArr && pinDataArr.length > 0 && pinDataArr.map((resource,rindex)=>
                                                                    <option value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                                )}
                                                                    
                                                                </Field>     
                                                                {errors.pincode_id && touched.pincode_id ? (
                                                                    <span className="errorMsg">{errors.pincode_id}</span>
                                                                ) : null}     
                                                            </div>
                                                        </FormGroup>
                                                        
                                                    </Col>
                                                </Row>

                                                <div className="brandhead"> 
                                                    <p>&nbsp;</p>
                                                </div>

                                                <div className="d-flex justify-content-left">
                                                    <div className="brandhead">
                                                        <h4 className="fs-18 m-b-30">COVERAGE DETAILS: &nbsp;&nbsp;&nbsp; SECTION 1 - FIRE</h4>
                                                    </div>
                                                </div>                                                   
                                                <div className="d-flex justify-content-left">
                                                    <h4 className="fs-18 m-b-30">Please enter Sum Insured below :</h4>
                                                </div>  
                                                <Row> 
                                                    <Col sm={6} md={6} lg={6}>
                                                    <label>
                                                    Fire-Building-Sum Insured:
                                                    </label>
                                                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Building Structure including Plinth and Foundation"}</Tooltip>}>
                                                        <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                    </OverlayTrigger>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                        <Field
                                                            name='buildings_si'
                                                            type="text"
                                                            placeholder="Fire-Building-Sum Insured"
                                                            maxLength='7'
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value = {values.buildings_si} 
                                                            onInput= {(e)=> {
                                                                setFieldTouched("buildings_si");
                                                                setFieldValue("buildings_si", e.target.value);  
                                                            }}   
                                                                    
                                                        />
                                                        {errors.buildings_si && touched.buildings_si ? (
                                                        <span className="errorMsg">{errors.buildings_si}</span>
                                                        ) : null}  
                                                        </div>
                                                    </FormGroup>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col sm={6} md={6} lg={6}>
                                                        <label>
                                                        Plant & Machinery Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Plant & Machinery Sum Insured."}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="plant_machinary_si"
                                                                type="text"
                                                                placeholder="Plant & Machinery Sum Insured"
                                                                autoComplete="off"
                                                                maxLength = '7'
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.plant_machinary_si}
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("plant_machinary_si");
                                                                    setFieldValue("plant_machinary_si", e.target.value);  
                                                                }}
                                                            />
                                                            {errors.plant_machinary_si && touched.plant_machinary_si ? (
                                                            <span className="errorMsg">{errors.plant_machinary_si}</span>
                                                            ) : null}                                                   
                                                        </div>
                                                    </FormGroup>
                                                    </Col>
                                                </Row>
                                                
                                                <Row>
                                                    <Col sm={6} md={6} lg={6}>
                                                        <label>
                                                        Furniture, Fixture & Fittings Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Furniture, Fixtures, Fittings and Electrical Installations."}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='furniture_fixture_si'
                                                                type="text"
                                                                placeholder="Furniture, Fixture & Fittings Sum Insured"
                                                                maxLength='7'
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.furniture_fixture_si} 
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("furniture_fixture_si");
                                                                    setFieldValue("furniture_fixture_si", e.target.value);  
                                                                }}                                                                           
                                                            />
                                                            {errors.furniture_fixture_si && touched.furniture_fixture_si ? (
                                                            <span className="errorMsg">{errors.furniture_fixture_si}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                         
                                                </Row>

                                                <Row>
                                                    <Col sm={6} md={6} lg={6}>
                                                        <label>
                                                        Fire-Contents Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Commodity stored inside shops for sale."}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='fire_contents_sum_insured'
                                                                type="text"
                                                                placeholder="Fire-Contents Sum Insured"
                                                                maxLength='7'
                                                                autoComplete="off"
                                                                disabled={true}
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.plant_machinary_si && values.furniture_fixture_si && parseInt(values.plant_machinary_si) + 
                                                                    parseInt(values.furniture_fixture_si)}  
                                                                                                                                
                                                            />
                                                            {errors.fire_contents_sum_insured && touched.fire_contents_sum_insured ? (
                                                            <span className="errorMsg">{errors.fire_contents_sum_insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                         
                                                </Row>

                                                <Row>
                                                    <Col sm={6} md={6} lg={6}>
                                                        <label>
                                                        Stocks of Raw Material :
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Commodity stored inside shops for sale."}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='stock_raw_mat'
                                                                type="text"
                                                                placeholder="Stocks of Raw Material"
                                                                maxLength='7'
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.stock_raw_mat} 
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("stock_raw_mat");
                                                                    setFieldValue("stock_raw_mat", e.target.value);  
                                                                }}                                                                           
                                                            />
                                                            {errors.stock_raw_mat && touched.stock_raw_mat ? (
                                                            <span className="errorMsg">{errors.stock_raw_mat}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                         
                                                </Row>
                                                <Row>
                                                    <Col sm={6} md={6} lg={6}>
                                                        <label>
                                                        Stock of Finished Goods :
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Commodity stored inside shops for sale."}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='finish_goods'
                                                                type="text"
                                                                placeholder="Stock of Finished Goods"
                                                                maxLength='7'
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.finish_goods} 
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("finish_goods");
                                                                    setFieldValue("finish_goods", e.target.value);  
                                                                }}                                                                           
                                                            />
                                                            {errors.finish_goods && touched.finish_goods ? (
                                                            <span className="errorMsg">{errors.finish_goods}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                         
                                                </Row>
                                                <Row>
                                                    <Col sm={6} md={6} lg={6}>
                                                        <label>
                                                        Stocks of Work in Progress :
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Commodity stored inside shops for sale."}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='stock_wip'
                                                                type="text"
                                                                placeholder="Stocks of Work in Progress"
                                                                maxLength='7'
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.stock_wip} 
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("stock_wip");
                                                                    setFieldValue("stock_wip", e.target.value);  
                                                                }}                                                                           
                                                            />
                                                            {errors.stock_wip && touched.stock_wip ? (
                                                            <span className="errorMsg">{errors.stock_wip}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                         
                                                </Row>
                                                <Row>
                                                    <Col sm={6} md={6} lg={6}>
                                                        <label>
                                                        Fire-Stock Sum Insured
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Commodity stored inside shops for sale."}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='fire_stock_sum_insured'
                                                                type="text"
                                                                placeholder="Fire-Stock Sum Insured"
                                                                maxLength='7'
                                                                autoComplete="off"
                                                                disabled={true}
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.stock_raw_mat && values.finish_goods && values.stock_wip && 
                                                                    parseInt(values.stock_raw_mat) + 
                                                                    parseInt(values.finish_goods) + 
                                                                    parseInt(values.stock_wip)}                                                                       
                                                            />
                                                            {errors.fire_stock_sum_insured && touched.fire_stock_sum_insured ? (
                                                            <span className="errorMsg">{errors.fire_stock_sum_insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                         
                                                </Row>
                                                <Row>
                                                    <Col sm={6} md={6} lg={6}>
                                                        <label>
                                                        Fire-Total Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Sum total of fire buildings sum insured, fire content sum insured and fire stock sum insured"}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='fire_sum_insured'
                                                                type="number"
                                                                placeholder="Fire-Total Sum Insured"
                                                                maxLength='10'
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {parseInt(values.buildings_si) + 
                                                                    parseInt(values.plant_machinary_si) + 
                                                                    parseInt(values.furniture_fixture_si) + 
                                                                    parseInt(values.stock_raw_mat) + 
                                                                    parseInt(values.finish_goods) + 
                                                                    parseInt(values.stock_wip)} 
                                                                disabled={true}
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("Fire_sum_insured");
                                                                    setFieldValue("Fire_sum_insured", e.target.value);  
                                                                }}                                                                           
                                                            />
                                                            {errors.Fire_sum_insured && touched.Fire_sum_insured ? (
                                                            <span className="errorMsg">{errors.Fire_sum_insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                         
                                                </Row>

                                                <div className="brandhead"> 
                                                    <p>&nbsp;</p>
                                                </div>
                                            
                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.Registration_SME.bind(this,productId)}>
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </Button> 
                                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                    {isSubmitting ? 'Wait..' : 'Next'}
                                                </Button> 
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
      loading: state.loader.loading,

      start_date: state.sukhsam.start_date,
      end_date: state.sukhsam.end_date,
      policy_holder_id: state.sukhsam.policy_holder_id,
      policy_holder_ref_no:state.sukhsam.policy_holder_ref_no,
      request_data_id:state.sukhsam.request_data_id,
      completed_step:state.sukhsam.completed_step,
      menumaster_id:state.sukhsam.menumaster_id,

      shop_building_name: state.sukhsam.shop_building_name,
      block_no: state.sukhsam.block_no,
      house_flat_no: state.sukhsam.house_flat_no,
      pincode: state.sukhsam.pincode,
      pincode_id: state.sukhsam.pincode_id,
      buildings_si: state.sukhsam.buildings_si,
      plant_machinary_si: state.sukhsam.plant_machinary_si,
      furniture_fixture_si: state.sukhsam.furniture_fixture_si,
      policy_holder_id:state.sukhsam.policy_holder_id,
      menumaster_id:state.sukhsam.menumaster_id,

      stock_raw_mat:state.sukhsam.stock_raw_mat,
      stock_wip:state.sukhsam.stock_wip,
      finish_goods:state.sukhsam.finish_goods,
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop()),
      setData:(data) => dispatch(setSmeData(data)),
      setRiskData:(data) => dispatch(setSmeRiskData(data)),
      setSmeProposerDetails:(data) => dispatch(setSmeProposerDetailsData(data)),
      setSmeOthersDetails:(data) => dispatch(setSmeOthersDetailsData(data))
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(RiskDetails_sukhsam));