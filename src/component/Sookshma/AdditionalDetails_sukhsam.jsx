import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip  } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.min.css";
import Footer from '../common/footer/Footer';
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios"
import moment from "moment";
import swal from 'sweetalert';
import {  PersonAge } from "../../shared/dateFunctions";
import Encryption from '../../shared/payload-encryption';
import { setSmeRiskData,setSmeData,setSmeOthersDetailsData,setSmeProposerDetailsData,setCommunicationAddress } from '../../store/actions/sukhsam';
import {  validSGTINcheck } from "../../shared/validationFunctions";

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
    age: "",
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

// VALIDATION :-----------------------
const vehicleRegistrationValidation = Yup.object().shape({
    salutation_id: Yup.string().required('Title is required').nullable(),
    first_name: Yup.string().required('First Name is required').min(3, function() {return "First name must be 3 characters"}).max(40,function() {
        return "Full name must be maximum 40 characters"
    }).matches(/^[A-Za-z]+$/, function() {return "Please enter valid first name"}).nullable(),
    // last_name: Yup.string().notRequired('Last Name is required').min(1, function() {return "Last name must be 1 characters"}).max(40, function() {return "Full name must be maximum 40 characters"})
    // .matches(/^[A-Za-z]+$/, function() {
    //     return "Please enter valid last name"
    // }).nullable(),
    last_name: Yup.string().notRequired('Name is required')
        .matches(/^[A-Za-z]+$/, function() {
            return "Please enter valid last name"
        }).nullable(),
    // date_of_birth: Yup.date().required("Please enter date of birth").nullable(),
    age: Yup.mixed().required("Please enter age").nullable(),

    email_id: Yup.string().email().required('Email is required').min(8, function() {
        return "Email must be minimum 8 characters"
    })
    .max(75, function() {
        return "Email must be maximum 75 characters"
    }).matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9]+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,'Invalid Email Id').nullable(),
    mobile: Yup.string()
    .matches(/^[6-9][0-9]{9}$/,'Invalid Mobile number').required('Mobile No. is required').nullable(),
    gender: Yup.string().required("Please select gender").nullable(),
    pan_no: Yup.string()
    .matches(/^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/,'Invalid PAN number') .nullable(),
    gstn_no: Yup.string()
    // .matches(/^[0-9]{2}[A,B,C,F,G,H,L,J,P,T]{4}[A-Z]{1}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[A-Z0-9]{1}$/,'Invalid GSTIN')
    .test(
        "first2digitcheck",
        function() {
            return "Invalid GSTIN"
        },
        function (value) {
            if (value && (value != "" || value != undefined) ) {             
                return validSGTINcheck(value);
            }   
            return true;
        }
    )
    .nullable(),

    com_building_name: Yup.string().required("Please enter Building name").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
        function() {
            return "Please enter valid building name"
        }).nullable(),
    // block_no: Yup.string().required("Please enter Plot number").nullable(),
    plot_no: Yup.string().required("Please enter Plot number").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
        function() {
            return "Please enter valid plot number"
        }).nullable(),
    // flat_no: Yup.string().required("Please enter Flat number").nullable(),
    street_name: Yup.string().required("Please enter Dtreet name").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
        function() {
            return "Please enter valid street name"
        }).nullable(),
    pincode: Yup.string().required('Pincode is required')
    .matches(/^[0-9]{6}$/, function() {
        return "Please enter valid 6 digit pin code"
    }).nullable(),
    pincode_id: Yup.string().required("Please select Area").nullable(),
})

class AdditionalDetails_sukhsam extends Component {


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
        // productId === 5
        this.props.history.push(`/Summary_Sookshma/${productId}`);
    }


    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params 
        let encryption = new Encryption();
        const formData = new FormData();
        let date_of_birth = moment(values.date_of_birth).format('YYYY-MM-DD')

        let post_data = {
            'bcmaster_id': '1',
            'policy_holder_id': this.props.policy_holder_id,
            'menumaster_id': this.props.menumaster_id,
            'page_name': `AdditionalDetails_Sookshma/${productId}`,
            'first_name': values.first_name,
            'last_name': values.last_name,
            'salutation_id': values.salutation_id,
            'date_of_birth': date_of_birth,
            'email_id': values.email_id,
            'mobile': values.mobile,
            'gender': values.gender,
            'pan_no': values.pan_no,
            'gstn_no': values.gstn_no,
            'house_building_name': values.com_building_name,
            'block_no': "",
            'house_flat_no': "",
            'plot_no': values.plot_no,
            'street_name': values.street_name,
            'pincode': values.pincode,
            'pincode_id': values.pincode_id,
        }

        console.log("Post_data_proposer-details---------  ", post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('sookshama/proposer-details',
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
                    com_plot_no:values.plot_no,
                    com_building_name:values.com_building_name,
                    com_block_no:values.block_no,
                    com_house_flat_no:values.flat_no,
                    com_pincode:values.pincode,
                    com_pincode_id:values.pincode_id,
                }
            );

            this.props.history.push(`/Premium_Sookshma/${productId}`);
            let formDataNew = new FormData(); 
            let post_data_new = {
                'policy_ref_no': this.props.policy_holder_ref_no,
                'menumaster_id': this.props.menumaster_id,
                'page_name': `AdditionalDetails_SME/${productId}`,
    
            }
            // formDataNew.append('enc_data',encryption.encrypt(JSON.stringify(post_data_new)))
            // axios.post('/sme/mdm-party',
            // formDataNew
            // ).then(res=>{
            //     axios.post('/sme/create-quote',
            //     formDataNew
            //     ).then(res1=>{
            //        let decryptResp = JSON.parse(encryption.decrypt(res1.data));
            //        if( decryptResp.error === false) {
            //            axios.post('/sme/con-sequence',
            //         formDataNew
            //         ).then(res2=>{
            //             const {productId} = this.props.match.params;
            //             this.props.loadingStop();
            //             let decryptResp = JSON.parse(encryption.decrypt(res2.data));
                        
            //             if( decryptResp.error === false) {
            //                 this.props.history.push(`/Premium_Sukhsam/${productId}`);
            //             } else {
            //                 this.props.loadingStop();
            //                 swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111")
            //                 actions.setSubmitting(false);
            //             };
            //         }).
            //         catch(err=>
            //             {this.props.loadingStop();
            //             swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111");
            //             actions.setSubmitting(false);
                        
            //         });
            //     }
            //     else { this.props.loadingStop()
            //         swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111");
            //         actions.setSubmitting(false);
            //     }
            //     }).
            //     catch(err=>{
            //         this.props.loadingStop();
            //         actions.setSubmitting(false);
            //     });
            // }).
            // catch(err=>{
            //     this.props.loadingStop();
            //     actions.setSubmitting(false);
            // });
        }).
        catch(err=>{
            this.props.loadingStop();
            let decryptErr = JSON.parse(encryption.decrypt(err.data))
            console.log("decryptErr------------ ", decryptErr)
            actions.setSubmitting(false);
        });
    }

    fetchAreadetails=(e, setFieldValue,setFieldTouched)=>{
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
            if (res.data.error === false )  
            {
                let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
                this.setState({
                    pinDataArr: res.data.data,
                    stateName,
                });
                this.props.loadingStop();
            } else {
                this.props.loadingStop();
                swal("Plese enter a valid pincode");
            }
            }).
            catch(err=>{
                this.props.loadingStop();
            })          
        }       
        else {
            this.setState({
                pinDataArr: [],
                stateName: [],
            });
            setFieldTouched('pincode_id')
            setFieldValue('pincode_id',"")
        }  
    }

    fetchAreadetailsBack=(pincode_input = null)=>{
        let pinCode = '';

        if(this.props.com_pincode != null && this.props.com_pincode != '' && this.props.com_pincode.length==6){
            pinCode = this.props.com_pincode;
        }else if(pincode_input != ''){
            pinCode = pincode_input;
        }

        console.log('fetchAreadetailsBack pinCode',pinCode)

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

        else {
            this.setState({
                pinDataArr: [],
                stateName: [],
            });
            this.props.setAddress(
                {
                    com_pincode:null,
                    com_pincode_id:null
                }
            );
        } 
    }

    
    fetchAreaDetails=(addressDetails)=>{
        if(addressDetails){
            let pincode = addressDetails.PIN_CD;
            const formData = new FormData();
            console.log('fetchAreadetails pinCode')
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
        else {
            this.setState({
                pinDataArr: [],
                stateName: [],
            });
        }  
        
    }

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
            this.fetchAreaDetails(addressDetails)
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                titleList: []
            });
        })
    
    }

    componentDidMount() {
        this.fetchSalutation()
        this.fetchPolicyDetails();
        //this.autoPopulateAddress();
        this.fetchAreadetailsBack();
    }

    fetchPolicyDetails=()=>{
        let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no"):0;
        let encryption = new Encryption();

        if(this.props.policy_holder_ref_no == null && policy_holder_ref_no != ''){
            
            this.props.loadingStart();
            axios.get(`sookshama/details/${policy_holder_ref_no}`)
            .then(res=>{
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log("decryptResp -------->",decryptResp)
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
                            street_name:risk_arr.street_name,
                            plot_no:risk_arr.plot_no,
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
                        // this.autoPopulateAddress();
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
    
                        this.fetchAreadetailsBack(decryptResp.data.policyHolder.pincode);

                    }
                }

                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
            })
        }else{
            // this.autoPopulateAddress();
        }
        
    }

   

    render() {
        const {showLoan, is_eia_account, is_loan_account, nomineeDetails, motorInsurance,appointeeFlag, is_appointee, showEIA, titleList,
            bankDetails,policyHolder, stateName, pinDataArr, quoteId, addressDetails, relation,step_completed,vehicleDetails,request_data} = this.state
        const {productId} = this.props.match.params 
        

    let newInitialValues = Object.assign(initialValue,{
      first_name:this.props.first_name,
      last_name:this.props.last_name,
      salutation_id:this.props.salutation_id,
      date_of_birth:this.props.date_of_birth != null ? new Date(this.props.date_of_birth):this.props.date_of_birth,
      age: this.props.date_of_birth != null ? Math.floor(moment().diff(this.props.date_of_birth, 'years', true) ) : "",
      email_id:this.props.email_id,
      mobile:this.props.mobile,
      gender:this.props.gender,
      pan_no:this.props.pan_no,
      gstn_no:this.props.gstn_no,
      street_name:this.props.com_street_name,
      plot_no:this.props.com_plot_no,
      com_building_name:this.props.com_building_name,
      block_no:this.props.com_block_no,
      flat_no:this.props.com_house_flat_no,
      pincode:this.props.com_pincode,
      pincode_id:this.props.com_pincode_id,
    //   policy_holder_id:this.props.sukhsam.policy_holder_id,
    //   menumaster_id:this.props.sukhsam.menumaster_id
        });

        // const quoteNumber =
        // quoteId ? (
        //     <h4>You are just one steps away in getting your policy ready and your Quotation Number: {quoteId}. Please share a few more details. </h4>
        // ) : null;
        const quoteNumber =
            <h4>Please share a few more details. </h4>


        
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
                        <h4 className="text-center mt-3 mb-3">SME Package Insurance</h4>

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
                                                <FormGroup className="m-b-25">
                                                <div className="insurerName">
                                                    <Field
                                                        name='age'
                                                        type="number"
                                                        placeholder='Age'
                                                        autoComplete="off"
                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                        value = {values.age}
                                                        maxLength="10"            
                                                        onChange = {(e) => {
                                                            let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                            setFieldValue('date_of_birth',dob)
                                                            setFieldValue('age',e.target.value)
                                                        }}                                                                                                 
                                                    />
                                                    {errors.age && touched.age ? (
                                                        <span className="errorMsg">{errors.age}</span>
                                                    ) : null}  
                                                </div>
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
                                                        onChange= {(e)=> 
                                                            setFieldValue('gstn_no', e.target.value.toUpperCase())
                                                            }                                                                                             
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
                                                            onKeyUp={e=> this.fetchAreadetails(e,setFieldValue,setFieldTouched)}
                                                            value={values.pincode}
                                                            maxLength="6"
                                                           
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
                                            
                                            <Col sm={12} md={4} lg={4}>
                                                <FormGroup>
                                                    <div className="insurerName">
                                                    <Field
                                                        name='com_building_name'
                                                        type="text"
                                                        placeholder="Building/House Name"
                                                        autoComplete="off"
                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                        value = {values.com_building_name}                                                                            
                                                    />
                                                    {errors.com_building_name && touched.com_building_name ? (
                                                    <span className="errorMsg">{errors.com_building_name}</span>
                                                    ) : null}  
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                        </Row> 
                                        <Row>
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
                </div>
                </BaseComponent>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
      loading: state.loader.loading,
      first_name:state.sukhsam.first_name,
      last_name:state.sukhsam.last_name,
      salutation_id:state.sukhsam.salutation_id,
      date_of_birth:state.sukhsam.date_of_birth,
      email_id:state.sukhsam.email_id,
      mobile:state.sukhsam.mobile,
      gender:state.sukhsam.gender,
      pan_no:state.sukhsam.pan_no,
      gstn_no:state.sukhsam.gstn_no,
      com_street_name:state.sukhsam.com_street_name,
      com_plot_no:state.sukhsam.com_plot_no,
      com_building_name:state.sukhsam.com_building_name,
      com_block_no:state.sukhsam.com_block_no,
      com_house_flat_no:state.sukhsam.com_house_flat_no,
      com_pincode:state.sukhsam.com_pincode,
      com_pincode_id:state.sukhsam.com_pincode_id,

    //   house_building_name: state.sukhsam.house_building_name,
      block_no: state.sukhsam.block_no,
      street_name: state.sukhsam.street_name,
      plot_no: state.sukhsam.plot_no,
      house_flat_no: state.sukhsam.house_flat_no,
      pincode: state.sukhsam.pincode,
      pincode_id: state.sukhsam.pincode_id,

      policy_holder_id:state.sukhsam.policy_holder_id,
      policy_holder_ref_no:state.sukhsam.policy_holder_ref_no,
      menumaster_id:state.sukhsam.menumaster_id
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop()),
      setData:(data) => dispatch(setSmeData(data)),
      setRiskData:(data) => dispatch(setSmeRiskData(data)),
      setSmeOthersDetails:(data) =>  dispatch(setSmeOthersDetailsData(data)),
      setSmeProposerDetails:(data) => dispatch(setSmeProposerDetailsData(data)),
      setAddress:(data) => dispatch(setCommunicationAddress(data))
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(AdditionalDetails_sukhsam));