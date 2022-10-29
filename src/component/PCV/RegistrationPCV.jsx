import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from 'yup';
import swal from 'sweetalert';
import { setData } from "../../store/actions/data";
import Encryption from '../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { registrationNumberFirstBlock, registrationNumberSecondBlock, registrationNumberThirdBlock, registrationNumberLastBlock } from "../../shared/validationFunctions";

const menumaster_id = 12
const initialValues = {
    regNumber: '',
    reg_number_part_one: '',
    reg_number_part_two: '',
    reg_number_part_three: '',
    reg_number_part_four: '',
    check_registration: 2,
    lapse_duration: ''
}

const vehicleRegistrationValidation = Yup.object().shape({

    check_registration: Yup.string().notRequired(),

    reg_number_part_one: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string().required('RegistrationNumber')
        .test(
            "firstDigitcheck",
            function () {
                return "InvalidRegistrationNumber"
            },
            function (value) {         
                return registrationNumberFirstBlock(value);
            }
        ),
        otherwise: Yup.string().nullable()
    }),
    reg_number_part_two: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string()
        .test(
            "secondDigitcheck",
            function () {
                return "InvalidRegistrationNumber"
            },
            function (value) {         
                return registrationNumberSecondBlock(value);
            }
        ),
        otherwise: Yup.string().nullable()
    }),
    reg_number_part_three: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string()
        .test(
            "thirdDigitcheck",
            function () {
                return "InvalidRegistrationNumber"
            },
            function (value) {         
                return registrationNumberThirdBlock(value);
            }
        ),
        otherwise: Yup.string().nullable()
    }),
    reg_number_part_four: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string().required('RegistrationNumber')
            .test(
                "last4digitcheck",
                function () {
                    return "InvalidRegistrationNumber"
                },
                function (value) {         
                    return registrationNumberLastBlock(value);
                }
            ),
        otherwise: Yup.string().nullable()
    }),

    policy_type: Yup.string().required("PleaseSPT"),
    policy_for: Yup.string().required("PleasePIC"),
    subclass_id: Yup.string().required("PleaseSSP"),
    lapse_duration: Yup.string().when("policy_type", {
        is: "3",       
        then: Yup.string().required('LapseDuration'),
        otherwise: Yup.string()
    }),

});


class RegistrationPCV extends Component {
    state = {
        motorInsurance:'',
        regno:'',
        length:14,
        fastLaneData: [],
        fastlanelog: [],
        subVehicleList: []
    }
   

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }



componentDidMount(){
    this.fetchSubVehicle();
    
}

fetchData=()=>{
    const {productId } = this.props.match.params
    let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo"):0;
    let encryption = new Encryption();
    axios.get(`pcv/policy-holder/details/${policyHolder_id}`)
        .then(res=>{
           //console.log("checking====",res.data)
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            let is_fieldDisabled = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.is_fieldDisabled :{}
            let fastlanelog = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.fastlanelog : {};
            if(decryptResp.data.policyHolder){
                var obj = decryptResp.data.policyHolder
                var i = 0
                for (var x in obj){
                    if (obj.hasOwnProperty(x)){
                      i++
                    }
                  }
            }
            

            let motorInsurance = i > 0 ? decryptResp.data.policyHolder.motorinsurance : []          
            this.setState({ 
                motorInsurance,is_fieldDisabled,fastlanelog
            })
            this.props.loadingStop();
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })
}

fetchSubVehicle=()=>{
    const {productId } = this.props.match.params
    let encryption = new Encryption();
    this.props.loadingStart();
    axios.get(`gcv/sub-vehical-list/${menumaster_id}`)
        .then(res=>{
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt--fetchSubVehicle------ ", decryptResp)

            let subVehicleList = decryptResp.data        
            this.setState({ 
                subVehicleList
            })
            this.fetchData()
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })
}

handleSubmit=(values)=>{

    const {productId} = this.props.match.params;
   
    if(this.state.stop ===1)
    {
        swal(this.state.stopMsg)
        this.props.loadingStop()
    }
    else{

    const formData = new FormData();
    let encryption = new Encryption();
    const {fastLaneData, fastlanelog } = this.state
    let post_data = {}
     var registration_part_numbers  = {}
        var regNumber = ""
        if(values.check_registration == '2') {
            registration_part_numbers  = {
                reg_number_part_one: values.reg_number_part_one,
                reg_number_part_two: values.reg_number_part_two,
                reg_number_part_three: values.reg_number_part_three,
                reg_number_part_four: values.reg_number_part_four
            } 
            regNumber = `${values.reg_number_part_one} ${values.reg_number_part_two} ${values.reg_number_part_three} ${values.reg_number_part_four}`
        }
        else {
            registration_part_numbers  = {
                reg_number_part_one: "",
                reg_number_part_two: "",
                reg_number_part_three: "",
                reg_number_part_four: ""
    
            } 
            regNumber = "NEW"
        }
    let policyHolder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') :0

    let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
    if(bc_data) {
        bc_data = JSON.parse(encryption.decrypt(bc_data));
    }

    if(values.check_registration && values.check_registration == 1) {
        sessionStorage.setItem("check_registration", 1)
    }
    else {
        sessionStorage.setItem("check_registration", 2)
    }
   

    if(policyHolder_id > 0){
        if(sessionStorage.getItem('csc_id')) {
            post_data = {
                'policy_holder_id': policyHolder_id,
                'registration_no': regNumber,
                    'registration_part_numbers': JSON.stringify(registration_part_numbers),
                'check_registration': values.check_registration,
                'menumaster_id':menumaster_id,
                'vehicle_type_id':productId,
                'csc_id':sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                'agent_name':sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                'product_id':sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                'bc_token': "5",
		        'lapse_duration': values.lapse_duration,
                'policy_type_id':values.policy_type,
                'policy_for': values.policy_for,
                'subclass_id' : values.subclass_id,
                'fastlaneLog_id': this.state.fastLaneData && this.state.fastLaneData.fastlaneLog_id ? this.state.fastLaneData.fastlaneLog_id : fastlanelog && fastlanelog.id ? fastlanelog.id : "",
                'page_name': `Registration_PCV/${productId}`
            } 
        }
        else {
            post_data = {
                'policy_holder_id': policyHolder_id,
                'registration_no': regNumber,
                'registration_part_numbers': JSON.stringify(registration_part_numbers),
                'check_registration': values.check_registration,
		        'lapse_duration': values.lapse_duration,
                'menumaster_id':menumaster_id,
                'vehicle_type_id':productId,
                'bcmaster_id': bc_data ? bc_data.agent_id : "",
                'bc_token': bc_data ? bc_data.token : "",
                'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                'policy_type_id':values.policy_type,
                'policy_for': values.policy_for,
                'subclass_id' : values.subclass_id,
                'fastlaneLog_id': this.state.fastLaneData && this.state.fastLaneData.fastlaneLog_id ? this.state.fastLaneData.fastlaneLog_id : fastlanelog && fastlanelog.id ? fastlanelog.id : "",
                'page_name': `Registration_PCV/${productId}`
            } 
        }

        console.log('post_data', post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
    
        this.props.loadingStart();
        axios
        .post(`pcv/update-registration`, formData)
        .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
          // console.log("errror ======="/decryptResp.error)

            if(decryptResp.error == false) {
                this.props.history.push(`/SelectBrand_PCV/${productId}`);
            }
            else{
                swal(decryptResp.msg)
            }   
            this.props.loadingStop();
                
        })
        .catch(err => {
            let decryptErr = JSON.parse(encryption.decrypt(err.data));
            //console.log('decryptResp--err---', decryptErr)
            if(decryptErr && err.data){
                swal('Registration number required...');
            }
        this.props.loadingStop();
        });
    }
    else{
        if(sessionStorage.getItem('csc_id')) {
            post_data = {
                'registration_no': regNumber,
                'registration_part_numbers': JSON.stringify(registration_part_numbers),
                'check_registration': values.check_registration,
                'menumaster_id':menumaster_id,
                'vehicle_type_id':productId,
                'csc_id':sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                'agent_name':sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                'product_id':sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                'bcmaster_id': "5",
		        'lapse_duration': values.lapse_duration,
                'page_name': `Registration_PCV/${productId}`,
                'policy_type_id':values.policy_type,
                'policy_for': values.policy_for,
                'subclass_id': values.subclass_id,
                'fastlaneLog_id': this.state.fastLaneData && this.state.fastLaneData.fastlaneLog_id ? this.state.fastLaneData.fastlaneLog_id : fastlanelog && fastlanelog.id ? fastlanelog.id : ""
            } 
        }
        else {
            post_data = {
                'registration_no': regNumber,
                'registration_part_numbers': JSON.stringify(registration_part_numbers),
                'check_registration': values.check_registration,
		        'lapse_duration': values.lapse_duration,
                'menumaster_id':menumaster_id,
                'vehicle_type_id':productId,
                'bcmaster_id': bc_data ? bc_data.agent_id : "",
                'bc_token': bc_data ? bc_data.token : "",
                'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                'page_name': `Registration_PCV/${productId}`,
                'policy_type_id':values.policy_type,
                'policy_for': values.policy_for,
                'subclass_id': values.subclass_id,
                'fastlaneLog_id': this.state.fastLaneData && this.state.fastLaneData.fastlaneLog_id ? this.state.fastLaneData.fastlaneLog_id : fastlanelog && fastlanelog.id ? fastlanelog.id : ""
            } 
        }
        console.log('post_data', post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios
        .post(`pcv/registration`, formData)
        .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
           // console.log("decrypt", decryptResp)
            this.props.loadingStop();  

            if(decryptResp.error == false) {
                localStorage.setItem('policyHolder_id', decryptResp.data.policyHolder_id);
                localStorage.setItem('policyHolder_refNo', decryptResp.data.policyHolder_refNo);
                this.props.history.push(`/SelectBrand_PCV/${productId}`); 
            }   
            else{
                swal(decryptResp.msg)
            }                          
        })
        .catch(err => {
        this.props.loadingStop();
        // let decryptResp = JSON.parse(encryption.decrypt(err.data))
      
        if(err && err.data){
            swal('Please check..something went wrong!!');
        }      
        });
    }
}
}
fetchFastlane = async (values) => {
    const {is_fieldDisabled} = this.state
    const {productId} = this.props.match.params
    if(is_fieldDisabled && is_fieldDisabled == "true")
    {
        this.props.history.push(`/VehicleDetails_PCV/${productId}`);
    }
    else{
    const formData = new FormData();
    var regNumber = values.reg_number_part_one + values.reg_number_part_two + values.reg_number_part_three + values.reg_number_part_four
    if (values.check_registration == '2') {
        formData.append('registration_no', regNumber)
        formData.append('menumaster_id', '12')
        this.props.loadingStart();
        axios.post('fastlane', formData).then(res => {
                console.log("check12",res.data)
            if(res.data && res.data.error && res.data.error === 1)
            {
                console.log("cond",res.data.error,typeof(res.data.error))
                this.setState({
                    ...this.state,
                    stop: 1,
                    stopMsg:res.data.msg
                })
            }
             else if (res.data.error == false) {
                this.props.loadingStop();
                this.setState({ fastLaneData: res.data.data, brandView: '0' ,stop: 0})
                let fastLaneData = { 'fastLaneData': res.data.data }
                this.props.setData(fastLaneData)
                console.log("props12",this.props.data)
            }
            else {
                this.props.loadingStop();
                this.props.setData([])
                this.setState({ fastLaneData: [], brandView: '1', vehicleDetails: [],stop: 0 })
            }
            this.handleSubmit(values, res.data.data)
        })
            .catch(err => {
                this.props.loadingStop();
            })
    } else {
        this.props.setData([])
        this.handleSubmit(values, [])
    }
}

}
    
setValueData = () => {
    var checkBoxAll = document.getElementsByClassName('user-self');
    for(const a in checkBoxAll){
        if(checkBoxAll[a].checked){            
            return true
        }
    }
    return false
}

handleChange = (values, setFieldTouched, setFieldValue) => {
    if(values.regNumber == "NEW"){
        // setFieldTouched('check_registration')
        setFieldValue('regNumber', "");
    }
}

regnoFormat = (e, setFieldTouched, setFieldValue) => {   
    let regno = e.target.value   
    e.target.value = regno.toUpperCase()
}


    render() {
        const {motorInsurance, subVehicleList,is_fieldDisabled} = this.state
	    var tempRegNo = motorInsurance && motorInsurance.registration_part_numbers && JSON.parse(motorInsurance.registration_part_numbers)
        const newInitialValues = Object.assign(initialValues,{
	        reg_number_part_one:  typeof(tempRegNo) == 'undefined'?"":tempRegNo && tempRegNo.reg_number_part_one,
            reg_number_part_two:  typeof(tempRegNo) == 'undefined'?"":tempRegNo && tempRegNo.reg_number_part_two,
            reg_number_part_three:  typeof(tempRegNo) == 'undefined'?"":tempRegNo && tempRegNo.reg_number_part_three,
            reg_number_part_four:  typeof(tempRegNo) == 'undefined'?"":tempRegNo && tempRegNo.reg_number_part_four,
            regNumber: motorInsurance && motorInsurance.registration_no ? motorInsurance.registration_no : "",
            policy_type: motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : "",
            policy_for: motorInsurance && motorInsurance.policy_for ? motorInsurance.policy_for : "",
            subclass_id : motorInsurance && motorInsurance.subclass_id ? motorInsurance.subclass_id : "",
	        check_registration: motorInsurance && motorInsurance.registration_no == "NEW"? '1' : '2',
            lapse_duration: motorInsurance && motorInsurance.lapse_duration ? motorInsurance.lapse_duration : "",
        })
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null

        return (
            <>
                <BaseComponent>
				
				<div className="page-wrapper">
                    <div className="container-fluid asd">
                        <div className="row">
						
						<aside className="left-sidebar">
		 				 <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
						 <SideNav />
						</div>
						</aside>
						
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox">
                                <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <h4 className="m-b-30">{phrases['About']}</h4>
                                        <Formik initialValues={newInitialValues} 
                                        onSubmit={this.fetchFastlane} 
                                        validationSchema={vehicleRegistrationValidation}
                                        >
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                            // console.log('values========',values)
                                            
                                        return (
                                        <Form>                                           
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead"> 
                                                <p>{phrases['customerType']}</p>
                                                    <div className="d-inline-flex m-b-15">
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='policy_for'
                                                                    value='1'
                                                                    key='1'
                                                                    checked = {values.policy_for == '1' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('policy_for')
                                                                        setFieldValue('policy_for', '1');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> {phrases['Individual']}</span>
                                                            </label>
                                                        </div>
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='policy_for'
                                                                    value='2'
                                                                    key='1'
                                                                    checked = {values.policy_for == '2' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('policy_for')
                                                                        setFieldValue('policy_for', '2');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> {phrases['Corporate']}</span>
                                                            </label>
                                                            {errors.policy_for && touched.policy_for ? (
                                                                <span className="errorMsg">{phrases[errors.policy_for]}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead"> 
                                                    <p>{phrases['businessType']}</p>

                                                    <div className="d-inline-flex m-b-15">
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='policy_type'
                                                                    value='1'
                                                                    key='1'
                                                                    checked = {values.policy_type == '1' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('policy_type')
                                                                        setFieldValue('policy_type', '1');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> {phrases['NewPolicy']}</span>
                                                            </label>
                                                        </div>
                                                        
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='policy_type'
                                                                    value='2'
                                                                    key='1'
                                                                    checked = {values.policy_type == '2' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('policy_type')
                                                                        setFieldValue('policy_type', '2');
                                                                        setFieldValue('check_registration', '2');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> {phrases['RollOver']}</span>
                                                            </label>
                                                            
                                                        </div>

                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='policy_type'
                                                                    value='3'
                                                                    key='1'
                                                                    checked = {values.policy_type == '3' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('policy_type')
                                                                        setFieldValue('policy_type', '3');
                                                                        setFieldValue('check_registration', '2');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> {phrases['LapsedPolicy']}</span>
                                                            </label>
                                                            {errors.policy_type && touched.policy_type ? (
                                                                    <span className="errorMsg">{phrases[errors.policy_type]}</span>
                                                                ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {values.policy_type == '3' ? 
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead"> 
                                                <p>{phrases['LapseDuration']}</p>
                                                    <div className="d-inline-flex m-b-15">
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='lapse_duration'
                                                                    value='1'
                                                                    key='1'
                                                                    checked = {values.lapse_duration == '1' ? true : false}
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> {phrases['BeforeNinety']}</span>
                                                            </label>
                                                        </div>
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='lapse_duration'
                                                                    value='2'
                                                                    key='1'
                                                                    checked = {values.lapse_duration == '2' ? true : false}
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> {phrases['OverNinety']}</span>
                                                            </label>
                                                            {errors.lapse_duration && touched.lapse_duration ? (
                                                                <span className="errorMsg">{phrases[errors.lapse_duration]}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div> : null }

                                            <div className="row formSection">
                                                <label className="col-md-4">{phrases['SubProduct']}:</label>
                                                <div className="col-md-4">
                                                    
                                                    <div className="formSection">
                                                        <Field
                                                            name='subclass_id'
                                                            component="select"
                                                            autoComplete="off"
                                                            className="formGrp inputfs12"
                                                            value = {values.subclass_id}
                                                            // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.previous_policy_name}
                                                        >
                                                            <option value="">{phrases['SelectProduct']}</option>
                                                            {/* {subVehicleList.map((subVehicle, qIndex) => ( 
                                                                <option value={subVehicle.subclass_id} key={qIndex} 
                                                                >{subVehicle.subclass_title}</option>
                                                            ))} */}
                                                            {subVehicleList.map((subVehicle, qIndex) => ( 
                                                                <option hidden = {subVehicle.status == 1 ? false : true } value= {subVehicle.subclass_id}>{subVehicle.subclass_title}</option>
                                                            ))}
                                                
                                                        </Field>
                                                        {errors.subclass_id && touched.subclass_id ? (
                                                            <span className="errorMsg">{phrases[errors.subclass_id]}</span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row formSection">
                                                <label className="col-md-4">{phrases['RegName']} :</label>
                                                <div className="col-md-1">

                                                    <Field
                                                        name="reg_number_part_one"
                                                        type="text"
                                                        autoComplete="off"
                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                        value={values.reg_number_part_one}
                                                        disabled={values.check_registration == '1' ? true : is_fieldDisabled && is_fieldDisabled == "true" ? true :false}
                                                        maxLength="2"
                                                        onInput={e => {
                                                            this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                            setFieldTouched('check_registration')
                                                            setFieldValue('check_registration', '2');
                                                        }}

                                                    />
                                                </div>
                                                <div className="col-md-1">

                                                    <Field
                                                        name="reg_number_part_two"
                                                        type="text"
                                                        autoComplete="off"
                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                        value={values.reg_number_part_two}
                                                        disabled={values.check_registration == '1' ? true : is_fieldDisabled && is_fieldDisabled == "true" ? true :false}
                                                        maxLength="3"
                                                        onInput={e => {
                                                            this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                            setFieldTouched('check_registration')
                                                            setFieldValue('check_registration', '2');
                                                        }}

                                                    />         
                                                </div>
                                                <div className="col-md-1">

                                                    <Field
                                                        name="reg_number_part_three"
                                                        type="text"
                                                        autoComplete="off"
                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                        value={values.reg_number_part_three}
                                                        disabled={values.check_registration == '1' ? true : is_fieldDisabled && is_fieldDisabled == "true" ? true :false}
                                                        maxLength="3"
                                                        onInput={e => {
                                                            this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                            setFieldTouched('check_registration')
                                                            setFieldValue('check_registration', '2');
                                                        }}

                                                    />
                                                </div>
                                                <div className="col-md-1">

                                                    <Field
                                                        name="reg_number_part_four"
                                                        type="text"
                                                        autoComplete="off"
                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                        value={values.reg_number_part_four}
                                                        disabled={values.check_registration == '1' ? true : is_fieldDisabled && is_fieldDisabled == "true" ? true :false}
                                                        maxLength="4"
                                                        onInput={e => {
                                                            this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                            setFieldTouched('check_registration')
                                                            setFieldValue('check_registration', '2');
                                                        }}

                                                    />
                                                </div>
                                                {(errors.reg_number_part_one || errors.reg_number_part_two || errors.reg_number_part_three || errors.reg_number_part_four) 
                                                && (touched.reg_number_part_one || touched.reg_number_part_two || touched.reg_number_part_three || touched.reg_number_part_four) ? (
                                                        <span className="errorMsg">{phrases["InvalidRegistrationNumber"]}</span>
                                                    ) : null}
                                            </div>

                                            {values.policy_type == '1' ?
                                            <div className="row formSection">
                                                    <label className="customCheckBox formGrp formGrp">
                                                    {phrases['WithoutNo']}
                                                    <Field
                                                        type="checkbox"
                                                        name="check_registration"
                                                        value="1"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldTouched('regNumber')
                                                                setFieldValue('regNumber', 'NEW');
                                                                setFieldTouched('reg_number_part_one')
                                                                setFieldValue('reg_number_part_one', '');
                                                                setFieldTouched('reg_number_part_two')
                                                                setFieldValue('reg_number_part_two', '');
                                                                setFieldTouched('reg_number_part_three')
                                                                setFieldValue('reg_number_part_three', '');
                                                                setFieldTouched('reg_number_part_four')
                                                                setFieldValue('reg_number_part_four', '');
                                                                setFieldTouched('check_registration')
                                                                setFieldValue('check_registration', e.target.value);
        
                                                            } else {
                                                                setFieldValue('check_registration', '2');   
                                                                setFieldValue('regNumber', '');                                                         
                                                            }
                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    check_registration:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    check_registration:2
                                                                })
                                                            }
                                                        }}
                                                        checked={values.check_registration == '1' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                    </label>
                                                    {errors.check_registration && (touched.looking_for_2 || touched.looking_for_3 || touched.looking_for_4) ? 
                                                            <span className="error-message">{errors.check_registration}</span> : ""
                                                        }
                                                    
                                                </div>  : null}
                                            <div className="cntrbtn">
                                            <Button className={`btnPrimary`} type="submit" >
                                            {phrases['Go']}
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
      setData: (data) => dispatch(setData(data))
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(RegistrationPCV));