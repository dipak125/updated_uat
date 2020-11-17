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
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import {  PersonAge } from "../../shared/dateFunctions";
import { setSmeRiskData,setSmeData,setSmeOthersDetailsData,setSmeProposerDetailsData } from '../../store/actions/sme_fire';


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
}





class RiskDetails extends Component {

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


    // handleSubmit = (values, actions) => {
    //     const {productId} = this.props.match.params 
    //     const {motorInsurance} = this.state
    //     this.props.history.push(`/OtherDetails/${productId}`);
      
    // }


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
        axios.get(`sme/details/${policyHolder_id}`)
            .then(res => {
                let data = res
                console.log("responce-----",data)
                 let decryptResp = JSON.parse(encryption.decrypt(res.data))
                 console.log("decrypt", decryptResp)
                 let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {};
                 let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                 let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                 let RTO_location = motorInsurance && motorInsurance.location && motorInsurance.location.RTO_LOCATION ? motorInsurance.location.RTO_LOCATION : ""
                 let previous_is_claim= previousPolicy && (previousPolicy.is_claim == 0 || previousPolicy.is_claim == 1) ? previousPolicy.is_claim : ""
                this.setState({
                    motorInsurance, previousPolicy, vehicleDetails,RTO_location, previous_is_claim
                })
                this.props.loadingStop();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    fetchAreadetails=(e)=>{
        let pinCode = e.target.value;      

        if(pinCode.length==6){
            const formData = new FormData();
            this.props.loadingStart();
            let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
           formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
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
            let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
            formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
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
    
    handleSubmit=(values, )=>{
        console.log('handleSubmit', values);
        // console.log("policyHolder_id-------->",policyHolder_id)
        const formData = new FormData();
        
        formData.append('policy_holder_id',this.props.policy_holder_id)
        formData.append('menumaster_id',this.props.menumaster_id)
        // formData.append('street_name','g6')
        // formData.append('plot_no','g6')
        // formData.append('bcmaster_id','1')house_flat_no salutation
        // let pol_start_date = moment(values.start_date).format('YYYY-MM-DD HH:MM:SS')
        // let pol_end_date = moment(values.end_date).format('YYYY-MM-DD HH:MM:SS')
        formData.append('house_building_name', values.house_building_name)
        formData.append('block_no',values.block_no)
        formData.append('house_flat_no',values.house_flat_no)
        formData.append('pincode',values.pincode)
        formData.append('pincode_id',values.pincode_id)
        formData.append('buildings_sum_insured',values.buildings_sum_insured)
        formData.append('content_sum_insured',values.content_sum_insured)
        formData.append('stock_sum_insured',values.stock_sum_insured)
        console.log("formdata---",values.formData)
        console.log("formData---",formData)
        const Fire_sum_insured = parseInt(values.buildings_sum_insured) + parseInt(values.content_sum_insured) + parseInt(values.stock_sum_insured) ;
        if (Fire_sum_insured < 500000) {
            this.props.loadingStop();
            swal("Sum total of fire buildings sum insured,contents sum insured and stock sum insured should be more than 5 Lakhs")
            return false;
        } else if(Fire_sum_insured > 10000000) {
             this.props.loadingStop();
            swal("Sum total of fire buildings sum insured,contents sum insured and stock sum insured should be less than 1 crore")
            return false;
        } else {
        this.props.loadingStart();
        axios.post('sme/policy-details',
        formData
        ).then(res=>{       
            console.log('res', res)
            this.props.loadingStop();
            this.props.setRiskData(
                {

                    house_building_name:values.house_building_name,
                    block_no:values.block_no,
                    // street_name:values.street_name,
                    // plot_no:values.plot_no,
                    // content_sum_insured:values.content_sum_insured,
                    house_flat_no:values.house_flat_no,
                    pincode:values.pincode,
                    pincode_id:values.pincode_id,
                    buildings_sum_insured:values.buildings_sum_insured,
                    content_sum_insured:values.content_sum_insured,
                    stock_sum_insured:values.stock_sum_insured
                }
            );
            const {productId} = this.props.match.params;
            console.log("Fire_sum_insured-------",Fire_sum_insured)
            this.props.loadingStop()
            this.setState({ Fire_sum_insured : Fire_sum_insured })
            
            this.props.history.push(`/OtherDetails/${productId}`);
        }).
        catch(err=>{
            this.props.loadingStop();
        })
    }
    }

    fetchPolicyDetails=()=>{
        let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no"):0;
        console.log('this.props.policy_holder_ref_no',this.props.policy_holder_ref_no);

        if(this.props.policy_holder_ref_no == null && policy_holder_ref_no != ''){
            
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
                            // street_name:risk_arr.street_name,
                            // plot_no:risk_arr.plot_no,
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

                    this.fetchAreadetailsBack(res.data.data.policyHolder.smeinfo.pincode);
                
                }

                if(res.data.data.policyHolder.step_no == 3 || res.data.data.policyHolder.step_no > 3){

                    let address = '';
                    if(res.data.data.policyHolder.address == null){
                        
                    }else{
                        address = JSON.parse(res.data.data.policyHolder.address);

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
        console.log('Product-----id',productId)
        this.props.history.push(`/Registration_SME/${productId}`);
    }

    render() {
        const {productId} = this.props.match.params  
        const {insurerList, showClaim, previous_is_claim, motorInsurance, previousPolicy,
            stateName,pinDataArr,CustomerID,suggestions, vehicleDetails, RTO_location} = this.state

        let newInitialValues = Object.assign(initialValue,{
            house_building_name:this.props.house_building_name,
            block_no:this.props.block_no,
            // street_name:this.props.street_name,
            // plot_no:this.props.plot_no,
            // content_sum_insured:this.props.content_sum_insured,
            house_flat_no:this.props.house_flat_no,
            pincode:this.props.pincode,
            pincode_id:this.props.pincode_id,
            buildings_sum_insured:this.props.buildings_sum_insured,
            content_sum_insured:this.props.content_sum_insured,
            stock_sum_insured:this.props.stock_sum_insured
        });

        // VALIDATION :----------------------------------------///////////////////////////
        const vehicleRegistrationValidation = Yup.object().shape({
            house_building_name: Yup.string().required("Please enter building name").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
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
            buildings_sum_insured: Yup.string().required("Please enter building sum insured").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
            content_sum_insured: Yup.string().required("Please enter content sum insured").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
            stock_sum_insured: Yup.string().required("Please enter stock sum insured").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
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
                <h4 className="text-center mt-3 mb-3">SME Pre UW</h4>
                <section className="brand m-b-25">
                    <div className="brand-bg">
                        <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} validationSchema={vehicleRegistrationValidation}>
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                return (
                                    <Form>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

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
                                                                name='house_building_name'
                                                                type="text"
                                                                placeholder="Shop/Building Name"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.house_building_name}                                                                            
                                                            />
                                                            {errors.house_building_name && touched.house_building_name ? (
                                                            <span className="errorMsg">{errors.house_building_name}</span>
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
                                                    
                                                    {/* <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='street_name'
                                                                type="text"
                                                                placeholder="Street Name"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.street_name}                                                                            
                                                            />
                                                            {errors.street_name && touched.street_name ? (
                                                            <span className="errorMsg">{errors.street_name}</span>
                                                            ) : null}              
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='plot_no'
                                                                type="text"
                                                                placeholder="Plot No."
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.plot_no}                                                                            
                                                            />
                                                            {errors.plot_no && touched.plot_no ? (
                                                            <span className="errorMsg">{errors.plot_no}</span>
                                                            ) : null}              
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    </Row> */}
                                                    <Row>

                                                    <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="pincode"
                                                                type="test"
                                                                placeholder="Pincode"
                                                                autoComplete="off"
                                                                maxlength = "6"
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
                                                                    
                                                                    {/*<option value="area2">Area 2</option>*/}
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
                                                    {/* <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name="SI_Building"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.SI_Building}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Basis of SI-Building/Contents</option>
                                                                {pinDataArr && pinDataArr.length > 0 && pinDataArr.map((resource,rindex)=>
                                                                    <option value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                                )}
                                                                    
                                                                    <option value="area2">Area 2</option>
                                                                </Field>     
                                                                {errors.SI_Building && touched.SI_Building ? (
                                                                    <span className="errorMsg">{errors.SI_Building}</span>
                                                                ) : null}     
                                                            </div>
                                                        </FormGroup>                                                        
                                                    </Col> */}
                                                    <Row> 
                                                            <Col sm={6} md={4} lg={4}>
                                                        <label>
                                                        Fire-Building-Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Building Structure including Plinth and Foundation"}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                        <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='buildings_sum_insured'
                                                                type="text"
                                                                placeholder="Fire-Building-Sum Insured"
                                                                maxLength='7'
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.buildings_sum_insured} 
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("buildings_sum_insured");
                                                                    setFieldValue("buildings_sum_insured", e.target.value);  
                                                                }}   
                                                                // onClick={(e) =>{
                                                                //      {
                                                                //         swal("This cover is mandated by IRDAI, it is compulsory for Owner-Driver to possess a PA cover of minimum Rs 15 Lacs, except in certain conditions. By not choosing this cover, you confirm that you hold an existing PA cover or you do not possess a valid driving license.")
                                                                //     }
                                                                           
                                                                // }       }                                                                 
                                                            />
                                                            {errors.buildings_sum_insured && touched.buildings_sum_insured ? (
                                                            <span className="errorMsg">{errors.buildings_sum_insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                            <Col sm={6} md={4} lg={4}>
                                                        <label>
                                                        Fire-Contents Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Building Structure including Plinth and Foundation"}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="content_sum_insured"
                                                                type="text"
                                                                placeholder="Fire-Contents Sum Insured"
                                                                autoComplete="off"
                                                                maxlength = '8'
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.content_sum_insured}
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("content_sum_insured");
                                                                    setFieldValue("content_sum_insured", e.target.value);  
                                                                }}
                                                            />
                                                            {errors.content_sum_insured && touched.content_sum_insured ? (
                                                            <span className="errorMsg">{errors.content_sum_insured}</span>
                                                            ) : null}                                                   
                                                        </div>
                                                    </FormGroup>
                                                    </Col>
                                                    </Row>
                                                    <Row>
                                                            <Col sm={6} md={4} lg={4}>
                                                        <label>
                                                        Fire-Stock Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Building Structure including Plinth and Foundation"}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='stock_sum_insured'
                                                                type="text"
                                                                placeholder="Fire-Stock Sum Insured"
                                                                maxlength='8'
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.stock_sum_insured} 
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("stock_sum_insured");
                                                                    setFieldValue("stock_sum_insured", e.target.value);  
                                                                }}                                                                           
                                                            />
                                                            {errors.stock_sum_insured && touched.stock_sum_insured ? (
                                                            <span className="errorMsg">{errors.stock_sum_insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                         
                                                </Row>
                                                
                                                <Row>
                                                            <Col sm={6} md={4} lg={4}>
                                                        <label>
                                                        Fire-Total Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Building Structure including Plinth and Foundation"}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='stock_sum_insured'
                                                                type="text"
                                                                placeholder="Fire-Total Sum Insured"
                                                                maxlength='8'
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {parseInt(values.buildings_sum_insured) + parseInt(values.content_sum_insured) + parseInt(values.stock_sum_insured)} 
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
                                            
                                                {/* <div className="d-flex justify-content-left resmb">
                                                <a href="javascript:void(0);" className={`backBtn`} onClick= {this.Registration_SME.bind(this,productId)} >
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </a> */}
                                                {/* <Button className={`backBtn`} type="button" onClick= {this.Registration_SME.bind(this,productId)} >
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </Button>  */}
                                                {/* <Button className={`proceedBtn`} type="submit" disabled={isValid ? false : true} >
                                                    {isSubmitting ? 'Wait..' : 'Next'}
                                                </Button> 
                                                </div> */}
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
            </BaseComponent>
            </>
        );
    }
}


const mapStateToProps = state => {
    return {
      loading: state.loader.loading,

      start_date: state.sme_fire.start_date,
      end_date: state.sme_fire.end_date,
      policy_holder_id: state.sme_fire.policy_holder_id,
      policy_holder_ref_no:state.sme_fire.policy_holder_ref_no,
      request_data_id:state.sme_fire.request_data_id,
      completed_step:state.sme_fire.completed_step,
      menumaster_id:state.sme_fire.menumaster_id,

      house_building_name: state.sme_fire.house_building_name,
      block_no: state.sme_fire.block_no,
    //   street_name: state.sme_fire.street_name,
    //   plot_no: state.sme_fire.plot_no,
      house_flat_no: state.sme_fire.house_flat_no,
      pincode: state.sme_fire.pincode,
      pincode_id: state.sme_fire.pincode_id,
      buildings_sum_insured: state.sme_fire.buildings_sum_insured,
      content_sum_insured: state.sme_fire.content_sum_insured,
      stock_sum_insured: state.sme_fire.stock_sum_insured,
      policy_holder_id:state.sme_fire.policy_holder_id,
      menumaster_id:state.sme_fire.menumaster_id
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(RiskDetails));