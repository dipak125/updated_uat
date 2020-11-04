import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip  } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import Footer from '../common/footer/Footer';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios"
import moment from "moment";
import {  PersonAge } from "../../shared/dateFunctions";
import Encryption from '../../shared/payload-encryption';
import { setSmeProposerDetailsData } from '../../store/actions/sme_fire';


const minDobAdult = moment(moment().subtract(100, 'years').calendar())
const maxDobAdult = moment().subtract(18, 'years').calendar();
const minDobNominee = moment(moment().subtract(100, 'years').calendar())
const maxDobNominee = moment().subtract(3, 'months').calendar();
const maxDoi = new Date()
const minDoi = moment(moment().subtract(100, 'years').calendar())
const eia_desc = "The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy"

const initialValue = {
    first_name:"",
    last_name:"",
    gender:"",
    date_of_birth: "",
    pan_no:"",
    pincode:"",
    is_carloan:"",
    bank_name:"",
    bank_branch:"",
    nominee_relation_with:"",
    nominee_first_name:"",
    nominee_last_name:"test",
    gender:"",
    nominee_dob: "",
    mobile: "",
    email_id: "",
    address: "",
    is_eia_account: "0",
    eia_no: "",
    stateName: "",
    pinDataArr: [],
    pincode_id: "",
    org_level: "",
    net_premium: "0",
    salutation_id: ""
}

const vehicleRegistrationValidation = Yup.object().shape({
    first_name: Yup.string().required('Name is required').nullable(),
    last_name: Yup.string().required('Name is required').nullable(),
    date_of_birth: Yup.date().required("Please enter date of birth").nullable(),
    email_id: Yup.string().email().required('Email is required').min(8, function() {
        return "Email must be minimum 8 characters"
    })
    .max(75, function() {
        return "Email must be maximum 75 characters"
    }).matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9]+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,'Invalid Email Id').nullable(),
    mobile: Yup.string()
    .matches(/^[6-9][0-9]{9}$/,'Invalid Mobile number').required('mobile No. is required').nullable(),
    gender: Yup.string().required("Please select gender").nullable(),
    pan_no: Yup.string().notRequired(function() {
        return "Enter PAN number"
    }).matches(/^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/, function() {
        return "Please enter valid Pan Number"
    }).nullable(),
    gstn_no: Yup.string().required("Please enter GSTN number")
    .matches(/^[0-9]{2}[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/,'Invalid GSTIN'),
    //11AAACC7777A7A7
    building_name: Yup.string().required("Please enter building name").nullable(),
    plot_no: Yup.string().required("Please enter plot number").nullable(),
    street_name: Yup.string().required("Please enter street name").nullable(),
    pincode: Yup.string().required("Please enter pincode").nullable(),
    pincode_id: Yup.string().required("Please select area").nullable(),
})

class AdditionalDetails_sme extends Component {


    state = {
        showEIA: false,
        is_eia_account: '',
        showLoan: false,
        is_loan_account: '',
        insurerList: [],
        policyHolder: {},
        nomineeDetails: {},
        quoteId: "",
        bankDetails: {},
        addressDetails: [],
        relation: [],
        step_completed: "0",
        appointeeFlag: false,
        is_appointee:0,
        request_data: [],
        titleList: []
    };
    
    ageCheck = (value) => {
        const ageObj = new PersonAge();
        let age = ageObj.whatIsMyAge(value)
        if(age < 18){
            this.setState({
                appointeeFlag: true,
                is_appointee:1
            })
        }
        else {
            this.setState({
                appointeeFlag: false,
                is_appointee:0
            })
        } 
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    showEIAText = (value) =>{
        if(value == 1){
            this.setState({
                showEIA:true,
                is_eia_account:1
            })
        }
        else{
            this.setState({
                showEIA:false,
                is_eia_account:0
            })
        }
    }

    showLoanText = (value) =>{
        if(value == 1){
            this.setState({
                showLoan:true,
                is_loan_account:1
            })
        }
        else{
            this.setState({
                showLoan:false,
                is_loan_account:0
            })
        }
    }

    fetchSalutationdetails=(e)=>{
        let salutation = e.target.value;      

        if(salutation.length>0){
            const formData = new FormData();
            this.props.loadingStart();
            let encryption = new Encryption();
            const post_data_obj = {
                'salutation':salutation
            };
           formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
           formData.append('salutation',salutation)
           axios.post('salutation-list',
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

    otherDetails = (productId) => {
        this.props.history.push(`/OtherDetails/${productId}`);
    }


    handleSubmit = (values, actions) => {
        // const {productId} = this.props.match.params 
        // const {motorInsurance, request_data} = this.state  
        // this.props.history.push(`/Premium_SME/${productId}`);
        console.log('handleSubmit', values);
        const formData = new FormData();
        let date_of_birth = moment(values.date_of_birth).format('YYYY-MM-DD')
        formData.append('bcmaster_id','1')
        formData.append('policy_holder_id',this.props.policy_holder_id)
        formData.append('menumaster_id',this.props.menumaster_id)
        formData.append('first_name',values.first_name)
        formData.append('last_name',values.last_name)
        formData.append('salutation_id',values.salutation_id)
        formData.append('date_of_birth', date_of_birth)
        formData.append('email_id',values.email_id)
        formData.append('mobile',values.mobile)
        formData.append('gender',values.gender)
        formData.append('pan_no',values.pan_no)
        formData.append('gstn_no',values.gstn_no)
        formData.append('house_building_name',values.building_name)
        formData.append('block_no',values.block_no)
        formData.append('house_flat_no',values.flat_no)
        formData.append('plot_no',values.plot_no)
        formData.append('street_name',values.street_name)
        formData.append('pincode',values.pincode)
        formData.append('pincode_id',values.pincode_id)
        this.props.loadingStart();
        axios.post('sme/proposer-details',
        formData
        ).then(res=>{
            
            this.props.setSmeProposerDetails(
                {
                    first_name:values.first_name,
                    last_name:values.last_name,
                    salutation_id:values.salutation_id,
                    date_of_birth:values.date_of_birth,
                    email_id:values.email_id,
                    mobile:values.mobile,
                    gender:values.gender,
                    pan_no:values.pan_no,
                    gstn_no:values.gstn_no,
                    com_street_name:values.street_name,
                    plot_no:values.plot_no,
                    com_building_name:values.building_name,
                    com_block_no:values.block_no,
                    com_house_flat_no:values.flat_no,
                    com_pincode:values.pincode,
                    com_pincode_id:values.pincode_id,
                }
            );

            let formDataNew = new FormData(); 
            formDataNew.append('menumaster_id',this.props.menumaster_id)
            formDataNew.append('policy_ref_no',this.props.policy_holder_ref_no)    

            axios.post('/sme/mdm-party',
            formDataNew
            ).then(res=>{
                axios.post('/sme/calculate-premium/phase-one',
                formDataNew
                ).then(res=>{
                    axios.post('/sme/calculate-premium/phase-two',
                    formDataNew
                    ).then(res=>{
                        axios.post('/sme/create-quote',
                        formDataNew
                        ).then(res=>{
                            axios.post('/sme/con-sequence',
                            formDataNew
                            ).then(res=>{
                                const {productId} = this.props.match.params;
                                this.props.loadingStop();
                                this.props.history.push(`/Premium_SME/${productId}`);
                            }).
                            catch(err=>{
                                this.props.loadingStop();
                            });
                        }).
                        catch(err=>{
                            this.props.loadingStop();
                        });
                    }).
                    catch(err=>{
                        this.props.loadingStop();
                    });
                }).
                catch(err=>{
                    this.props.loadingStop();
                });
            }).
            catch(err=>{
                this.props.loadingStop();
            });
        }).
        catch(err=>{
            this.props.loadingStop();
        });
    }

    // fetchData = () => {
    //     const { productId } = this.props.match.params
    //     let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
    //     let encryption = new Encryption();
    //     this.props.loadingStart();
    //     axios.get(`gcv-tp/policy-holder/details/${policyHolder_id}`)
    //         .then(res => {
    //              let decryptResp = JSON.parse(encryption.decrypt(res.data))
    //              console.log("decrypt---", decryptResp)
    //              let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {};
    //              let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
    //              let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
    //              let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : {};
    //              let nomineeDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.nominee[0] : {}
    //              let is_loan_account = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.is_carloan : 0
    //              let quoteId = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.quote_id : ""
    //              let is_eia_account=  policyHolder && (policyHolder.is_eia_account == 0 || policyHolder.is_eia_account == 1) ? policyHolder.is_eia_account : ""
    //              let bankDetails = decryptResp.data.policyHolder && decryptResp.data.policyHolder.bankdetail ? decryptResp.data.policyHolder.bankdetail[0] : {};
    //              let addressDetails = JSON.parse(decryptResp.data.policyHolder.pincode_response)
    //              let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";
    //              let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {};
            
    //              console.log('is_appointee', nomineeDetails ? nomineeDetails.is_appointee : "efg")
    //             //  return false;
    //              this.setState({
    //                 quoteId, motorInsurance, previousPolicy, vehicleDetails, policyHolder, nomineeDetails, is_loan_account, 
    //                 is_eia_account, bankDetails, addressDetails, step_completed, request_data,
    //                 is_appointee: nomineeDetails ? nomineeDetails.is_appointee : ""
                    
    //             })
    //             this.props.loadingStop();
    //             this.fetchSalutation(addressDetails, motorInsurance)
    //         })
    //         .catch(err => {
    //             // handle error
    //             this.props.loadingStop();
    //         })
    // }

    fetchAreadetails=(e)=>{
        let pinCode = e.target.value;      

        if(pinCode.length==6){
            const formData = new FormData();
            this.props.loadingStart();
            let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
        //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
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

    
    fetchAreadetailsBack=()=>{
        if(this.props.com_pincode != null && this.props.com_pincode != '' && this.props.com_pincode.length==6){
            let pinCode = this.props.com_pincode;      

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
    }

    
    fetchPrevAreaDetails=(addressDetails)=>{
        if(addressDetails){
            let pincode = addressDetails.PIN_CD;
            const formData = new FormData();
            // let encryption = new Encryption();

        //    const post_data_obj = {
        //         'pincode':pincode.toString()
        //     };
           // let encryption = new Encryption();
        //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

            formData.append('pincode', pincode)
            this.props.loadingStart();
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

    // fetchRelationships=()=>{

    //         this.props.loadingStart();
    //         axios.get('relations')
    //         .then(res=>{
    //             let relation = res.data.data ? res.data.data : []                        
    //             this.setState({
    //                 relation
    //             });
    //             this.fetchData();
    //         }).
    //         catch(err=>{
    //             this.props.loadingStop();
    //             this.setState({
    //                 relation: []
    //             });
    //         })
        
    // }

    fetchSalutation=(addressDetails, motorInsurance)=>{

        const formData = new FormData();
        let policy_for = motorInsurance && motorInsurance.policy_for ? motorInsurance.policy_for : "1"
        this.props.loadingStart();
        formData.append('policy_for_flag', policy_for)
        axios.post('salutation-list', formData)
        .then(res=>{
            let titleList = res.data.data.salutationlist ? res.data.data.salutationlist : []                        
            this.setState({
                titleList
            });
            this.props.loadingStop();
            this.fetchPrevAreaDetails(addressDetails)
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                titleList: []
            });
        })
    
}

    componentDidMount() {
        // this.fetchRelationships();
        this.fetchAreadetailsBack();
    }

   

    render() {
        const {showLoan, is_eia_account, is_loan_account, nomineeDetails, motorInsurance,appointeeFlag, is_appointee, showEIA, titleList,
            bankDetails,policyHolder, stateName, pinDataArr, quoteId, addressDetails, relation,step_completed,vehicleDetails,request_data} = this.state
        const {productId} = this.props.match.params 
        

        let newInitialValues = Object.assign(initialValue,{
      first_name:this.props.first_name,
      last_name:this.props.last_name,
      salutation_id:this.props.salutation_id,
      date_of_birth:this.props.date_of_birth,
      email_id:this.props.email_id,
      mobile:this.props.mobile,
      gender:this.props.gender,
      pan_no:this.props.pan_no,
      gstn_no:this.props.gstn_no,
      street_name:this.props.com_street_name,
      plot_no:this.props.plot_no,
      building_name:this.props.com_building_name,
      block_no:this.props.com_block_no,
      flat_no:this.props.com_house_flat_no,
      pincode:this.props.com_pincode,
      pincode_id:this.props.com_pincode_id,
    //   policy_holder_id:this.props.sme_fire.policy_holder_id,
    //   menumaster_id:this.props.sme_fire.menumaster_id
        });

        // const quoteNumber =
        // quoteId ? (
        //     <h4>You are just one steps away in getting your policy ready and your Quotation Number: {quoteId}. Please share a few more details. </h4>
        // ) : null;
        const quoteNumber =
            <h4>You are just one steps away in getting your policy ready and your Quotation Number: SME12345678. Please share a few more details. </h4>


        
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

                        <Formik initialValues={newInitialValues} 
                        onSubmit={this.handleSubmit}
                        validationSchema={vehicleRegistrationValidation}
                        >
                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                             
                        return (
                        <Form>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                            <div className="d-flex justify-content-left brandhead">
                            {quoteNumber}
                            <div className="brandhead"> 
                                <p>&nbsp;</p>
                            </div>
                            </div>

                                <div className="d-flex justify-content-left">
                                    <div className="brandhead">
                                        <h4 className="fs-18 m-b-30">PROPOSER DETAILS</h4>
                                    </div>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={2}>
                                        <FormGroup>
                                            <div className="formSection">
                                            <Field
                                                name='salutation_id'
                                                component="select"
                                                autoComplete="off"                                                                        
                                                className="formGrp"
                                            >
                                                <option value="">Title</option>
                                                <option value="1">Mr</option>
                                                <option value="2">Mrs</option>
                                                {titleList.map((title, qIndex) => ( 
                                                <option value={title.id}>{title.displayvalue}</option>
                                                ))}
                                            </Field>     
                                            {errors.salutation_id && touched.salutation_id ? (
                                            <span className="errorMsg">{errors.salutation_id}</span>
                                            ) : null}              
                                            </div>
                                        </FormGroup>
                                    </Col>

                                    <Col sm={12} md={4} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='first_name'
                                                type="text"
                                                placeholder= "First Name"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.first_name}                                                                            
                                            />
                                                {errors.first_name && touched.first_name ? (
                                            <span className="errorMsg">{errors.first_name}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>

                                    <Col sm={12} md={4} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='last_name'
                                                type="text"
                                                placeholder= "Last Name"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.last_name}                                                                            
                                            />
                                                {errors.last_name && touched.last_name ? (
                                            <span className="errorMsg">{errors.last_name}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    </Row>

                                    <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="formSection">
                                            <Field
                                                name='gender'
                                                component="select"
                                                autoComplete="off"                                                                        
                                                className="formGrp"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="m">Male</option>
                                                <option value="f">Female</option>
                                            </Field>     
                                            {errors.gender && touched.gender ? (
                                            <span className="errorMsg">{errors.gender}</span>
                                            ) : null}              
                                            </div>
                                        </FormGroup>
                                    </Col> 

                                    <Col sm={12} md={4} lg={4}>
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
                                        {errors.date_of_birth && touched.dodate_of_birthb ? (
                                            <span className="errorMsg">{errors.date_of_birth}</span>
                                        ) : null}  
                                        </FormGroup>
                                    </Col>
 
                                        <Col sm={12} md={4} lg={4}>
                                            <FormGroup>
                                                <div className="insurerName">
                                                <Field
                                                    name='gstn_no'
                                                    type="text"
                                                    placeholder= "GSTIN"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value = {values.gstn_no}                                                                            
                                                />
                                                    {errors.gstn_no && touched.gstn_no ? (
                                                <span className="errorMsg">{errors.gstn_no}</span>
                                                ) : null} 
                                                </div>
                                            </FormGroup>
                                        </Col> 
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
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
                                                value = {values.mobile}
                                                maxLength="10" 
                                                className="phoneinput pd-l-25"                                                                          
                                            />
                                            {errors.mobile && touched.mobile ? (
                                            <span className="errorMsg msgpositn">{errors.mobile}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='pan_no'
                                                type="text"
                                                placeholder="PAN Card No. "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.pan_no} 
                                                onChange= {(e)=> 
                                                    setFieldValue('pan_no', e.target.value.toUpperCase())
                                                    }                                                                           
                                            />
                                            {errors.pan_no && touched.pan_no ? (
                                            <span className="errorMsg">{errors.pan_no}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>       
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='email_id'
                                                type="email"
                                                placeholder="Email "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.email_id}                                                                            
                                            />
                                            {errors.email_id && touched.email_id ? (
                                            <span className="errorMsg">{errors.email_id}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>                        
                                </Row>
                                

                                <div className="d-flex justify-content-left carloan">
                                    <h4> </h4>
                                </div>

                                 
                                <div className="d-flex justify-content-left">
                                    <div className="brandhead">
                                        <h4 className="fs-18 m-b-30">COMMUNICATION ADDRESS</h4>
                                    </div>
                                </div>
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
                                                <option value="">Select Area</option>
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
                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='block_no'
                                                type="text"
                                                placeholder="Block No. "
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
                                                name='building_name'
                                                type="text"
                                                placeholder="Building/House Name"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.building_name}                                                                            
                                            />
                                            {errors.building_name && touched.building_name ? (
                                            <span className="errorMsg">{errors.building_name}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='flat_no'
                                                type="text"
                                                placeholder="House/Flat No"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.flat_no}                                                                            
                                            />
                                            {errors.flat_no && touched.flat_no ? (
                                            <span className="errorMsg">{errors.flat_no}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row><Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='plot_no'
                                                type="text"
                                                placeholder="Plot No. "
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
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
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
                                </Row>

                                <div className="d-flex justify-content-left carloan">
                                    <h4> </h4>
                                </div>
                                <div className="d-flex justify-content-left resmb">
                                <Button className={`backBtn`} type="button" onClick= {this.otherDetails.bind(this,productId)}>
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
                </div>
                <Footer />
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
      plot_no:state.sme_fire.plot_no,
      com_building_name:state.sme_fire.com_building_name,
      com_block_no:state.sme_fire.com_block_no,
      com_house_flat_no:state.sme_fire.com_house_flat_no,
      com_pincode:state.sme_fire.com_pincode,
      com_pincode_id:state.sme_fire.com_pincode_id,
      policy_holder_id:state.sme_fire.policy_holder_id,
      policy_holder_ref_no:state.sme_fire.policy_holder_ref_no,
      menumaster_id:state.sme_fire.menumaster_id
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop()),
      setSmeProposerDetails:(data) => dispatch(setSmeProposerDetailsData(data))
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(AdditionalDetails_sme));