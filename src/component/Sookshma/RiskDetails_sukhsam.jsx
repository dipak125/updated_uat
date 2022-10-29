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
import { array, object } from 'prop-types';


const ageObj = new PersonAge();
// const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
// const maxDate = moment(minDate).add(30, 'day').calendar();
const minDate = moment(moment().subtract(20, 'years').calendar()).add(1, 'day').calendar();
const maxDate = moment(moment().subtract(1, 'years').calendar()).add(30, 'day').calendar();
const startRegnDate = moment().subtract(20, 'years').calendar();
const minRegnDate = moment(startRegnDate).startOf('year').format('YYYY-MM-DD hh:mm');
const maxRegnDate = new Date();

const initialValue = {
    policy_type: null,
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
    fire_sum_insured: 0,
    multipleAddress:[]
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
        previous_is_claim: "",
        pinDataArr: [[]],
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

    fetchAreadetails=(e, inputName)=>{
        let pinCode = e.target.value;      
        // console.log(inputName);
        if(pinCode.length==6){
            const formData = new FormData();
            this.props.loadingStart();
            // let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
        //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
           formData.append('pincode',pinCode)
           const mainData = axios.post('pincode-details',
            formData
            ).then(res=>{
                if( res.data.error === false)
                {       
                let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
                
                switch(inputName){
                    case "pincode":
                        
                        this.state.pinDataArr[0] =  res.data.data
                        break;
                    
                    case "pincode0":
                        this.state.pinDataArr[1] =  res.data.data
                        break;

                    case "pincode1":
                        this.state.pinDataArr[2] =  res.data.data
                        break;
                    
                    case "pincode2":
                        this.state.pinDataArr[3] =  res.data.data
                        break;

                    case "pincode3":
                        this.state.pinDataArr[4] =  res.data.data
                        break;

                    case "pincode4":
                        this.state.pinDataArr[5] =  res.data.data
                        break;
                    
                    case "pincode5":
                        this.state.pinDataArr[6] =  res.data.data
                        break;

                    case "pincode6":
                        this.state.pinDataArr[7] =  res.data.data
                        break;

                    case "pincode7":
                        this.state.pinDataArr[8] =  res.data.data
                        break;

                    case "pincode8":
                        this.state.pinDataArr[9] =  res.data.data
                        break;

                    case "pincode9":
                        this.state.pinDataArr[10] =  res.data.data
                        break;

                    default :
                        var data = [];
                        break
                }
               
                //     // this.setState({
                //     //     pinDataArr: [res.data.data],
                //     //     stateName,
                //     // });
                
                
                this.props.loadingStop();
            } else {
                swal("Plese enter a valid pincode")
                this.props.loadingStop();
            }
            }).
            catch(err=>{
                this.props.loadingStop();
            }) 
            
        } else {
        //     this.setState({
        //         pinDataArr: [],
        //         stateName: [],
        //     });

            switch(inputName){
                case "pincode":
                    this.state.pinDataArr[0] =  []
                    break;
                
                case "pincode0":
                    this.state.pinDataArr[1] =  []
                    break;

                case "pincode1":
                    this.state.pinDataArr[2] =  []
                    break;
                
                case "pincode2":
                    this.state.pinDataArr[3] =  []
                    break;

                case "pincode3":
                    this.state.pinDataArr[4] =  []
                    break;

                case "pincode4":
                    this.state.pinDataArr[5] =  []
                    break;
                
                case "pincode5":
                    this.state.pinDataArr[6] =  []
                    break;

                case "pincode6":
                    this.state.pinDataArr[7] =  []
                    break;

                case "pincode7":
                    this.state.pinDataArr[8] =  []
                    break;

                case "pincode8":
                    this.state.pinDataArr[9] =  []
                    break;

                case "pincode9":
                    this.state.pinDataArr[10] =  []
                    break;
                    
                default :
                    var data = [];
                    break
            }                                                                                                                                           
        }  
    }

    fetchPinAreaDetails = (pincode, pinmethod)=>{
        if(pincode != null &&pincode.length === 6 && pincode != ''){
            const formData = new FormData();
            this.props.loadingStart();
            // let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pincode
            };
        
           formData.append('pincode',pincode)
            axios.post('pincode-details',
                formData
            ).then(res=>{
                if( res.data.error === false){       
                    let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
                
                    switch(pinmethod){
                        case "pincode":
                            
                            this.state.pinDataArr[0] =  res.data.data
                            break;
                        
                        case "pincode0":
                            //console.log("pinmethod", res.data.data);
                            this.state.pinDataArr[1] =  res.data.data
                            break;

                        case "pincode1":
                            this.state.pinDataArr[2] =  res.data.data
                            break;
                        
                        case "pincode2":
                            this.state.pinDataArr[3] =  res.data.data
                            break;

                        case "pincode3":
                            this.state.pinDataArr[4] =  res.data.data
                            break;

                        case "pincode4":
                            this.state.pinDataArr[5] =  res.data.data
                            break;
                        
                        case "pincode5":
                            this.state.pinDataArr[6] =  res.data.data
                            break;

                        case "pincode6":
                            this.state.pinDataArr[7] =  res.data.data
                            break;

                        case "pincode7":
                            this.state.pinDataArr[8] =  res.data.data
                            break;

                        case "pincode8":
                            this.state.pinDataArr[9] =  res.data.data
                            break;

                        case "pincode9":
                            this.state.pinDataArr[10] =  res.data.data
                            break;

                        default :
                            var data = [];
                            break
                    }
               
                    this.props.loadingStop();
                } else {
                    swal("Plese enter a valid pincode")
                    this.props.loadingStop();
                }
            })
            .catch(err=>{
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

            this.fetchPinAreaDetails(pinCode, "pincode");
            console.log("testtt",this.props.multipleAddress);

            if(this.props.multipleAddress){

                this.props.multipleAddress.map((_, i)=>{
                    this.state.pinDataArr[i+1] = []
                    var pin = "pincode"+i;
                    this.fetchPinAreaDetails(this.props.multipleAddress[i].pincode, pin)
                })
            }
            // formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
            // formData.append('pincode',pinCode)
            // axios.post('pincode-details',
            // formData
            // ).then(res=>{       
            //     let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
            //     this.setState({
            //         pinDataArr: [res.data.data],
            //         stateName,
            //     });
            //     this.props.loadingStop();
            // }).
            // catch(err=>{
            //     this.props.loadingStop();
            // })          
        }
        // else {
        //     this.setState({
        //         pinDataArr: [],
        //         stateName: [],
        //     });
        // }  

        
        
    }

    //Call Policy Details Api
    callPolicyDetailsApi = (formData = null, values, actions, Fire_sum_insured, multiple_fire_sum_insured= [])=>{
        //const formData = new FormData();
        let encryption = new Encryption();
        
        if(formData !=null){
            axios.post('sookshama/policy-details',
                formData
            ).then(res=>{     
                let decryptResp = JSON.parse(encryption.decrypt(res.data));

                console.log("form data response", decryptResp);

                if (decryptResp.error === false )  {
                    this.props.loadingStop();
                    this.props.setRiskData(
                        {
                            policy_type: values.policy_type,
                            shop_building_name:values.shop_building_name,
                            block_no:values.block_no,
                            house_flat_no:values.house_flat_no,
                            pincode:values.pincode,
                            pincode_id:values.pincode_id,
                            multipleAddress : values.multipleAddress.length > 0 ? values.multipleAddress : [],
                            buildings_si:values.buildings_si,
                            plant_machinary_si:values.plant_machinary_si,
                            furniture_fixture_si:values.furniture_fixture_si,
                            stock_raw_mat:values.stock_raw_mat,
                            finish_goods:values.finish_goods,
                            stock_wip:values.stock_wip,
                            content_sum_insured: Fire_sum_insured,
                            stock_sum_insured : parseInt(values.stock_raw_mat) + parseInt(values.finish_goods) + parseInt(values.stock_wip),
                            multiple_fire_sum_insured : multiple_fire_sum_insured.length > 0 ? multiple_fire_sum_insured : null
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
                //console.log('decryptErr-----', decryptResp)
                actions.setSubmitting(false);
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
            'policy_type' : values.policy_type,
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
            'multipleAddress' : values.multipleAddress.length > 0 ? values.multipleAddress : []
        }

        console.log("form Post Data",post_data);

        var Fire_sum_insured = parseInt(values.buildings_si) + 
        parseInt(values.plant_machinary_si) + 
        parseInt(values.furniture_fixture_si) + 
        parseInt(values.stock_raw_mat) + 
        parseInt(values.finish_goods) + 
        parseInt(values.stock_wip);

        //console.log('Sookshama....post_data..--- ',post_data)
        

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
            var multipleAddressData = values.multipleAddress.length > 0 ? values.multipleAddress : [] 
            //console.log(multipleAddressData);
            //get all dynamic address & check the sum
            var multiple_fire_sum_insured = [];

            if(multipleAddressData.length > 0){
                this.props.loadingStop();                

                for(let i =0 ; i < multipleAddressData.length; i++){

                    var shop_name = multipleAddressData[i].shop_building_name

                    var total_sum_insured = parseInt(multipleAddressData[i].buildings_si) + 
                    parseInt(multipleAddressData[i].plant_machinary_si) + 
                    parseInt(multipleAddressData[i].furniture_fixture_si) + 
                    parseInt(multipleAddressData[i].stock_raw_mat) + 
                    parseInt(multipleAddressData[i].finish_goods) + 
                    parseInt(multipleAddressData[i].stock_wip);

                    var stock_sum_insured = parseInt(multipleAddressData[i].stock_raw_mat) + parseInt(multipleAddressData[i].finish_goods) + parseInt(multipleAddressData[i].stock_wip)

                    if (total_sum_insured < 500000) {
                        this.props.loadingStop();
                        swal("Sum total of fire buildings sum insured, fire contents sum insured and stock sum insured should be equal to or more than 5 Lakhs")
                        return false;
                    } else if(total_sum_insured > 10000000) {
                         this.props.loadingStop();
                        swal("Sum total of fire buildings sum insured, fire contents sum insured and stock sum insured should be less than 1 crore")
                        return false;
                    }

                    //values.multipleAddress[i].fire_contents_sum_insured = total_sum_insured
                    //values.multipleAddress[i].fire_stock_sum_insured = stock_sum_insured
                    var data = {
                        "shop_name" : shop_name,
                        "content_sum_insured" : total_sum_insured,
                        "stock_sum_insured" : stock_sum_insured
                    }

                     multiple_fire_sum_insured.push(data)
                    //console.log("buildings_si",multipleAddressData);                    
                }
                post_data['multiple_fire_sum_insured'] = multiple_fire_sum_insured.length > 0 ? multiple_fire_sum_insured : []
                //console.log("Fire_sum_insured",post_data);
                formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
                this.callPolicyDetailsApi(formData, values, actions, Fire_sum_insured, multiple_fire_sum_insured);
               // return false
            }else{
                this.props.loadingStop();
                console.log("multipleAddress" , multipleAddressData);
                post_data['multiple_fire_sum_insured'] = []
                formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
                this.callPolicyDetailsApi(formData, values, actions, Fire_sum_insured);
                //return false
            }
            
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
                console.log("ole", decryptResp);
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
                    console.log("risk data",decryptResp.data.policyHolder.sookshamainfo.risk_address);
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

                    console.log(decryptResp.data);
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
            })
        }
        
    }

    fireSumCalculate (){
        const fire_Sum = this.state.Fire_sum_insured
    }

    componentDidMount() {
        // this.getInsurerList();
        //this.fetchData();
        //this.fetchAreadetailsBack();
        this.fetchPolicyDetails();
        
        this.fireSumCalculate();
        
    }
    Registration_SME = (productId) => {
        this.props.history.push(`/Registration_Sookshma/${productId}`);
    }

    getBackData = (pincode, arrayIndex = 0, pinMethod = null)=>{
        console.log(pincode);
        console.log("arrayIndex", arrayIndex);
        console.log("pinMethod", pinMethod);
        
        if(this.state.pinDataArr[arrayIndex] == 0 ){
            
            this.fetchAreadetailsBack(pincode)
            console.log("amiiii");
            
            
        }
        console.log(this.state.pinDataArr);
        console.log(this.state.pinDataArr[arrayIndex]);
    }

    getBackDataArry = (pincode, arrayIndex , pinMethod = null)=>{
        console.log(pincode);
        console.log("arrayIndex2", arrayIndex);
        console.log("pinMethod2", pinMethod);
        //this.state.pinDataArr[parseInt(arrayIndex)]=[]
        if(this.state.pinDataArr[parseInt(arrayIndex)] == 0 ){
            //if(pinMethod){
                this.fetchPinAreaDetails(pincode, pinMethod)
                console.log("helllo");
            //}
            
        }
        console.log(this.state.pinDataArr);
        console.log(this.state.pinDataArr[parseInt(arrayIndex)]);
    }

    render() {
        const Fire_contents_sum_insured = parseInt(this.props.plant_machinary_si) + parseInt(this.props.furniture_fixture_si);
        const Fire_stock_sum_insured = parseInt(this.props.stock_raw_mat) + parseInt(this.props.stock_wip) + parseInt(this.props.finish_goods);
        const {productId} = this.props.match.params  
        const {insurerList, showClaim, previous_is_claim, motorInsurance, previousPolicy,
            stateName,pinDataArr,CustomerID,suggestions, vehicleDetails, RTO_location} = this.state

            //console.log("addressss",this.props.multipleAddress);
         console.log('Sookshama...',this.props)
        let newInitialValues = Object.assign(initialValue,{
            policy_type : this.props.policy_type,
            shop_building_name:this.props.shop_building_name ? this.props.shop_building_name :null,
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
            fire_stock_sum_insured:Fire_stock_sum_insured && Math.round(Fire_stock_sum_insured),
            multipleAddress : this.props.multipleAddress ? this.props.multipleAddress : []
        });

        //console.log("new value",newInitialValues);

        // VALIDATION :----------------------------------------///////////////////////////
        const vehicleRegistrationValidation = Yup.object().shape({
            policy_type : Yup.string().required("Please select a risk location").nullable(),
            shop_building_name: Yup.string().required("Please enter building name").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                function() {
                    return "Please enter valid building name"
                })
                .max(50, function() {
                    return "Max 50 characters allowed"
                }).nullable(),
            block_no: Yup.string().required("Please enter block no.").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                function() {
                    return "Please enter valid block no."
                })
                .max(50, function() {
                    return "Max 50 characters allowed"
                }).nullable(),
            house_flat_no: Yup.string().required("Please enter house/flat no.").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                function() {
                    return "Please enter valid house/flat no,"
                })
                .max(50, function() {
                    return "Max 50 characters allowed"
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
            multipleAddress : Yup.array()
                .of(
                    Yup.object().shape({
                        shop_building_name: Yup.string().required("Please enter building name").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                            function() {
                                return "Please enter valid building name"
                            })
                            .max(50, function() {
                                return "Max 50 characters allowed"
                            }).nullable(),
                        block_no: Yup.string().required("Please enter block no.").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                            function() {
                                return "Please enter valid block no."
                            })
                            .max(50, function() {
                                return "Max 50 characters allowed"
                            }).nullable(),
                        house_flat_no: Yup.string().required("Please enter house/flat no.").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                            function() {
                                return "Please enter valid house/flat no,"
                            })
                            .max(50, function() {
                                return "Max 50 characters allowed"
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
            )
        })

        var location_serial_no = 1;
       // console.log("pincode", pinDataArr);
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
                               // console.log("error",errors)
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
                                                    <h4 className="fs-18 m-b-30">Type of occupancy at risk location : &nbsp;</h4>
                                                    <div className="d-inline-flex m-b-15">
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='policy_type'
                                                                        value='1'
                                                                        key='1'
                                                                        checked={values.policy_type == '1' ? true : false}
                                                                        onChange={() => {
                                                                            setFieldValue('policy_type', '1');
                                                                        }}
                                                                    />
                                                                <span className="checkmark " /><span className="fs-14" style={{color: "black", fontWeight: "bold"}}> Shop Risk</span>
                                                            </label>                                                                                                                        
                                                        </div>

                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='policy_type'
                                                                        value='2'
                                                                        key='1'
                                                                        checked={values.policy_type == '2' ? true : false}
                                                                        onChange={() => {
                                                                            setFieldValue('policy_type', '2');
                                                                        }}
                                                                    />
                                                                <span className="checkmark " /><span className="fs-14" style={{color: "black", fontWeight: "bold"}}> Tiny Risk</span>
                                                            </label>
                                                        </div>
                                                         {errors.policy_type && touched.policy_type ? (
                                                            <span className="errorMsg">{errors.policy_type}</span>
                                                            ) : null}  

                                                    </div>
                                                </div> 
                                                <Row>
                                                    <Col sm={12}>
                                                        <h4 className="fs-18 m-b-30">Location {location_serial_no}:</h4>
                                                    </Col>
                                                </Row>
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
                                                                onKeyUp={e=> this.fetchAreadetails(e, "pincode")}
                                                                value={values.pincode}
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
                                                                {values.pincode_id ? 
                                                                    <>{this.getBackData(values.pincode)}
                                                                    {pinDataArr && pinDataArr[0] &&  pinDataArr.length > 0 && pinDataArr[0].map((resource,rindex)=>
                                                                        <option key={rindex} value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                                        
                                                                    )}</>
                                                                :(
                                                                    <>
                                                                        <option value="">Select Location</option>
                                                                    
                                                                        {pinDataArr && pinDataArr[0] &&  pinDataArr.length > 0 && pinDataArr[0].map((resource,rindex)=>
                                                                            <option key={rindex} value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                                            
                                                                        )}
                                                                    </>
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
                                                                value = {values.furniture_fixture_si && parseInt(values.plant_machinary_si) + 
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
                                                                value = {
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

                                                {/*========================== Dynamic form area ====================== */}
                                                
                                                <FieldArray 
                                                    name='multipleAddress'
                                                    validateOnChange
                                                    render = {({push, remove}) => {                                                        
                                                        return (
                                                        <React.Fragment>
                                                            {values.multipleAddress.length > 0 && values.multipleAddress.map((dynamicValue, index) => {
                                                                //console.log(dynamicValue);
                                                                return (
                                                                <div key={index}>
                                                                    <div className="fs-18 m-b-30">
                                                                        <Row>
                                                                            <Col sm={6}>
                                                                                <h4 className="fs-18 m-b-30">Location {index === 0 ?  location_serial_no + 1: index+2}:</h4>
                                                                            </Col>
                                                                            <Col sm ={6}>
                                                                                <button type="button" style={{float: "right"}}  className="btn btn-danger" onClick={() => remove(index)}>-</button> 
                                                                            </Col>
                                                                        </Row>
                                                                    </div>
                                                        
                                                                    <Row>
                                                                        <Col sm={12} md={4} lg={4}>
                                                                            <FormGroup>
                                                                                <div className="formSection">
                                                                                <Field
                                                                                    name={`multipleAddress.${index}.shop_building_name`}
                                                                                    type="text"
                                                                                    placeholder="Shop/Building Name"
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}  
                                                                                    value = {dynamicValue.shop_building_name}                                                                   
                                                                                />
                                                                                {
                                                                                    errors.multipleAddress &&
                                                                                    errors.multipleAddress[index] &&
                                                                                    errors.multipleAddress[index].shop_building_name &&
                                                                                    touched.multipleAddress &&
                                                                                    touched.multipleAddress[index] && touched.multipleAddress[index].shop_building_name ? (
                                                                                        <div className='errorMsg'>
                                                                                            {errors.multipleAddress[index].shop_building_name}
                                                                                        </div>
                                                                                    ) : null
                                                                                }
                                                                                
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>
                                                                        <Col sm={12} md={4} lg={4}>
                                                                            <FormGroup>
                                                                                <div className="insurerName">
                                                                                <Field
                                                                                    name={`multipleAddress[${index}].block_no`}
                                                                                    type="text"
                                                                                    placeholder="Block No."
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value = {dynamicValue.block_no}                                                  
                                                                                />
                                                                                {
                                                                                    errors.multipleAddress &&
                                                                                    errors.multipleAddress[index] &&
                                                                                    errors.multipleAddress[index].block_no &&
                                                                                    touched.multipleAddress &&
                                                                                    touched.multipleAddress[index] && touched.multipleAddress[index].block_no ? (
                                                                                        <div className='errorMsg'>
                                                                                            {errors.multipleAddress[index].block_no}
                                                                                        </div>
                                                                                    ) : null
                                                                                }
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>
                                                                        <Col sm={12} md={4} lg={4}>
                                                                            <FormGroup>
                                                                                <div className="insurerName">
                                                                                <Field
                                                                                    name={`multipleAddress[${index}].house_flat_no`}
                                                                                    type="text"
                                                                                    placeholder="House/Flat No"
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value = {dynamicValue.house_flat_no}                                                                         
                                                                                />
                                                                                {
                                                                                    errors.multipleAddress &&
                                                                                    errors.multipleAddress[index] &&
                                                                                    errors.multipleAddress[index].house_flat_no &&
                                                                                    touched.multipleAddress &&
                                                                                    touched.multipleAddress[index] && touched.multipleAddress[index].house_flat_no ? (
                                                                                        <div className='errorMsg'>
                                                                                            {errors.multipleAddress[index].house_flat_no}
                                                                                        </div>
                                                                                    ) : null
                                                                                }
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>

                                                                    <Row>

                                                                        <Col sm={12} md={4} lg={4}>
                                                                            <FormGroup>
                                                                                <div className="insurerName">
                                                                                    <Field
                                                                                        name={`multipleAddress[${index}]pincode`}
                                                                                        type="test"
                                                                                        placeholder="Pincode"
                                                                                        autoComplete="off"
                                                                                        maxLength = "6"
                                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                        onKeyUp={e=> this.fetchAreadetails(e, 'pincode'+index)}
                                                                                        value={dynamicValue.pincode}
                                                                                        
                                                                                    />
                                                                                    {
                                                                                        errors.multipleAddress &&
                                                                                        errors.multipleAddress[index] &&
                                                                                        errors.multipleAddress[index].pincode &&
                                                                                        touched.multipleAddress &&
                                                                                        touched.multipleAddress[index] && touched.multipleAddress[index].pincode ? (
                                                                                            <div className='errorMsg'>
                                                                                                {errors.multipleAddress[index].pincode}
                                                                                            </div>
                                                                                        ) : null
                                                                                    }                                          
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>
                                                                        <Col sm={12} md={4} lg={4}>
                                                                            <FormGroup>
                                                                                <div className="formSection">
                                                                                    <Field
                                                                                        name={`multipleAddress[${index}]pincode_id`}
                                                                                        component="select"
                                                                                        autoComplete="off"
                                                                                        value ={dynamicValue.pincode_id}
                                                                                        className="formGrp"
                                                                                    >
                                                                                    {
                                                                                        dynamicValue.pincode_id ? (
                                                                                            <>
                                                                                                {this.getBackDataArry(dynamicValue.pincode, index+1,"pincode"+(index))}
                                                                                                {pinDataArr && pinDataArr[(index+1)] && pinDataArr.length > 0 && pinDataArr[(index+1)].map((resource,rindex)=>
                                                                                                    <option key={rindex} value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                                                                    
                                                                                                )}
                                                                                            </>
                                                                                        ):(
                                                                                            <>
                                                                                                <option value="">Select Location</option>
                                                                                                {pinDataArr && pinDataArr[(index+1)] && pinDataArr.length > 0 && pinDataArr[(index+1)].map((resource,rindex)=>
                                                                                                    <option key={rindex} value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                                                                    
                                                                                                )}
                                                                                            </>
                                                                                        )
                                                                                    }
                                                                                    

                                                                                    
                                                                                        
                                                                                    </Field>     
                                                                                        
                                                                                    {
                                                                                        errors.multipleAddress &&
                                                                                        errors.multipleAddress[index] &&
                                                                                        errors.multipleAddress[index].pincode_id &&
                                                                                        touched.multipleAddress &&
                                                                                        touched.multipleAddress[index] && touched.multipleAddress[index].pincode_id ? (
                                                                                            <div className='errorMsg'>
                                                                                                {errors.multipleAddress[index].pincode_id}
                                                                                            </div>
                                                                                        ) : null
                                                                                    }
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
                                                                                name={`multipleAddress[${index}]buildings_si`}
                                                                                type="text"
                                                                                placeholder="Fire-Building-Sum Insured"
                                                                                maxLength='7'
                                                                                autoComplete="off"
                                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                value = {dynamicValue.buildings_si}   
                                                                                        
                                                                            />
                                                                            {errors.multipleAddress && 
                                                                                errors.multipleAddress[index] &&
                                                                                errors.multipleAddress[index].buildings_si &&
                                                                                touched.multipleAddress && 
                                                                                touched.multipleAddress[index] && 
                                                                                touched.multipleAddress[index].buildings_si ? (
                                                                            <span className="errorMsg">{errors.multipleAddress[index].buildings_si}</span>
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
                                                                                    name={`multipleAddress[${index}]plant_machinary_si`}
                                                                                    type="text"
                                                                                    placeholder="Plant & Machinery Sum Insured"
                                                                                    autoComplete="off"
                                                                                    maxLength = '7'
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value={dynamicValue.plant_machinary_si}
                                                                                    
                                                                                />
                                                                                {
                                                                                    errors.multipleAddress &&
                                                                                    errors.multipleAddress[index] &&
                                                                                    errors.multipleAddress[index].plant_machinary_si && 
                                                                                    touched.multipleAddress &&
                                                                                    touched.multipleAddress[index] &&
                                                                                    touched.multipleAddress[index].plant_machinary_si ? (
                                                                                <span className="errorMsg">{errors.multipleAddress[index].plant_machinary_si}</span>
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
                                                                                    name={`multipleAddress[${index}]furniture_fixture_si`}
                                                                                    type="text"
                                                                                    placeholder="Furniture, Fixture & Fittings Sum Insured"
                                                                                    maxLength='7'
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value = {dynamicValue.furniture_fixture_si} 
                                                                                                                                                              
                                                                                />
                                                                                {
                                                                                    errors.multipleAddress &&
                                                                                    errors.multipleAddress[index] &&
                                                                                    errors.multipleAddress[index].furniture_fixture_si && 
                                                                                    touched.multipleAddress &&
                                                                                    touched.multipleAddress[index] &&
                                                                                    touched.multipleAddress[index].furniture_fixture_si ? (
                                                                                <span className="errorMsg">{errors.multipleAddress[index].furniture_fixture_si}</span>
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
                                                                                    name={`multipleAddress[${index}]fire_contents_sum_insured`}
                                                                                    type="text"
                                                                                    placeholder="Fire-Contents Sum Insured"
                                                                                    maxLength='7'
                                                                                    autoComplete="off"
                                                                                    value = { parseInt(dynamicValue.plant_machinary_si) + 
                                                                                        parseInt(dynamicValue.furniture_fixture_si)}  
                                                                                    disabled={true}
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                                                                                    
                                                                                />
                                                                                {
                                                                                    errors.multipleAddress &&
                                                                                    errors.multipleAddress[index] &&
                                                                                    errors.multipleAddress[index].fire_contents_sum_insured &&
                                                                                    touched.multipleAddress && 
                                                                                    touched.multipleAddress[index] &&
                                                                                    touched.multipleAddress[index].fire_contents_sum_insured ? (
                                                                                <span className="errorMsg">{errors.multipleAddress[index].fire_contents_sum_insured}</span>
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
                                                                                    name={`multipleAddress[${index}]stock_raw_mat`}
                                                                                    type="text"
                                                                                    placeholder="Stocks of Raw Material"
                                                                                    maxLength='7'
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value = {dynamicValue.stock_raw_mat} 
                                                                                                                                                             
                                                                                />
                                                                                {
                                                                                    errors.multipleAddress &&
                                                                                    errors.multipleAddress[index] &&
                                                                                    errors.multipleAddress[index].stock_raw_mat && 
                                                                                    touched.multipleAddress &&
                                                                                    touched.multipleAddress[index] &&
                                                                                    touched.multipleAddress[index].stock_raw_mat ? (
                                                                                <span className="errorMsg">{errors.multipleAddress[index].stock_raw_mat}</span>
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
                                                                                    name={`multipleAddress[${index}]finish_goods`}
                                                                                    type="text"
                                                                                    placeholder="Stock of Finished Goods"
                                                                                    maxLength='7'
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value = {dynamicValue.finish_goods} 
                                                                                                                                                               
                                                                                />
                                                                                {
                                                                                    errors.multipleAddress &&
                                                                                    errors.multipleAddress[index] &&
                                                                                    errors.multipleAddress[index].finish_goods &&
                                                                                    touched.multipleAddress &&
                                                                                    touched.multipleAddress[index] && 
                                                                                    touched.multipleAddress[index].finish_goods ? (
                                                                                <span className="errorMsg">{errors.multipleAddress[index].finish_goods}</span>
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
                                                                                    name={`multipleAddress[${index}]stock_wip`}
                                                                                    type="text"
                                                                                    placeholder="Stocks of Work in Progress"
                                                                                    maxLength='7'
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value = {dynamicValue.stock_wip} 
                                                                                                                                                               
                                                                                />
                                                                                {
                                                                                    errors.multipleAddress &&
                                                                                    errors.multipleAddress[index] &&
                                                                                    errors.multipleAddress[index].stock_wip && 
                                                                                    touched.multipleAddress &&
                                                                                    touched.multipleAddress[index] &&
                                                                                    touched.multipleAddress[index].stock_wip ? (
                                                                                <span className="errorMsg">{errors.multipleAddress[index].stock_wip}</span>
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
                                                                                    name={`multipleAddress[${index}]fire_stock_sum_insured`}
                                                                                    type="text"
                                                                                    placeholder="Fire-Stock Sum Insured"
                                                                                    maxLength='7'
                                                                                    autoComplete="off"
                                                                                    disabled={true}
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value = {
                                                                                        parseInt(dynamicValue.stock_raw_mat) + 
                                                                                        parseInt(dynamicValue.finish_goods) + 
                                                                                        parseInt(dynamicValue.stock_wip)}                                                                       
                                                                                />
                                                                                {
                                                                                    errors.multipleAddress && 
                                                                                    errors.multipleAddress[index] &&
                                                                                    errors.multipleAddress[index].fire_stock_sum_insured &&
                                                                                    touched.multipleAddress && 
                                                                                    touched.multipleAddress[index] &&
                                                                                    touched.multipleAddress[index].fire_stock_sum_insured ? (
                                                                                <span className="errorMsg">{errors.multipleAddress[index].fire_stock_sum_insured}</span>
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
                                                                                    name={`multipleAddress[${index}]fire_sum_insured`}
                                                                                    type="number"
                                                                                    placeholder="Fire-Total Sum Insured"
                                                                                    maxLength='10'
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value = {parseInt(dynamicValue.buildings_si) + 
                                                                                        parseInt(dynamicValue.plant_machinary_si) + 
                                                                                        parseInt(dynamicValue.furniture_fixture_si) + 
                                                                                        parseInt(dynamicValue.stock_raw_mat) + 
                                                                                        parseInt(dynamicValue.finish_goods) + 
                                                                                        parseInt(dynamicValue.stock_wip)} 
                                                                                    disabled={true}                                                                                                                                                               
                                                                                />
                                                                                {
                                                                                    errors.multipleAddress &&
                                                                                    errors.multipleAddress[index] &&
                                                                                    errors.multipleAddress[index].Fire_sum_insured && 
                                                                                    touched.multipleAddress &&
                                                                                    touched.multipleAddress[index] &&
                                                                                    touched.multipleAddress[index].Fire_sum_insured ? (
                                                                                <span className="errorMsg">{errors.multipleAddress[index].Fire_sum_insured}</span>
                                                                                ) : null}  
                                                                                </div>
                                                                            </FormGroup>
                                                                        </Col>                         
                                                                    </Row>
                                                                </div>
                                                                )
                                                            })}
                                                            {/*==========================Add New Form Button =======================*/}
                                                            <div className="brandhead"> 
                                                                <div style={{float:"right"}}>
                                                                
                                                                { 
                                                                    values.multipleAddress.length < 9 ? (
                                                                        <button className={`btn btn-info`} type='button' onClick={() => push(
                                                                            {
                                                                                shop_building_name: '', 
                                                                                block_no : '', 
                                                                                house_flat_no : '', 
                                                                                pincode: '', 
                                                                                pincode_id : '', 
                                                                                buildings_si : '', 
                                                                                plant_machinary_si : '',
                                                                                furniture_fixture_si : '', 
                                                                                fire_contents_sum_insured: '', 
                                                                                stock_raw_mat : '', 
                                                                                finish_goods : '', 
                                                                                stock_wip: '', 
                                                                                fire_stock_sum_insured : '', 
                                                                                fire_sum_insured : ''
                                                                            })}>+ Add Location</button>
                                                                    ) : null
                                                                }</div>
                                                            </div>
                                                        </React.Fragment>
                                                        
                                                    )}}
                                                    >
                                                </FieldArray>                                                
                                                {/*=========================================== */}

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
      multipleAddress : state.sukhsam.multipleAddress,
      multiple_fire_sum_insured : state.sukhsam.multiple_fire_sum_insured,
      policy_type : state.sukhsam.policy_type,
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