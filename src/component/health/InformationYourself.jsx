import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import moment from "moment";
import * as Yup from 'yup';
import swal from 'sweetalert';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import dateformat from "dateformat";
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";

const maxDob = dateformat(new Date(), 'mm/dd/yyyy');

const initialValues = {
    self: 0,
    selfDob: "",
    spouse: 0,
    spouseDob: "",
    child1: 0,
    child1Dob: "",
    child1Gender: "",
    father: 0,
    fatherDob: "",
    mother: 0,
    motherDob: "",
    fatherInLaw: 0,
    fatherInLawDob: "",
    motherInLaw: 0,
    motherInLawDob: "",
    gender: "",
    insureList: ""

}


const vehicleInspectionValidation = Yup.object().shape({
    gender: Yup.string().required('Please select gender'),
   
   
});

const validateFamilyMembers  = Yup.object().shape({
    //check_input : Yup.string().required('Please select an options'),
    dob_0: Yup.string().when(['looking_for_0'], {
      is: looking_for_0 => looking_for_0 == 'self',
      then: Yup.string().required('Self DOB field is required')
    .test(
        "18YearsChecking",
        function() {
            return "Age sgould me minium 18 years"
        },
        function (value) {
            if (value) {
                const ageObj = new PersonAge();
                return ageObj.whatIsMyAge(value) >= 18;
            }
            return true;
        }
    ),
      othewise: Yup.string()
    }),
    dob_1: Yup.string().when(['looking_for_1'], {
        is: looking_for_1 => looking_for_1 == 'spouse',
        then: Yup.string().required('Spouse DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age sgould me minium 18 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),
    dob_2: Yup.string().when(['looking_for_2'], {
        is: looking_for_2 => looking_for_2 == 'child1',
        then: Yup.string().required('Child 1 DOB field is required'),
        othewise: Yup.string()
    }),
    child1Gender: Yup.string().when(['looking_for_2'], {
        is: looking_for_2 => looking_for_2 == 'child1',
        then: Yup.string().required('Child 1 Gender field is required'),
        othewise: Yup.string()
    }),
    
    dob_3: Yup.string().when(['looking_for_3'], {
        is: looking_for_3 => looking_for_3 == 'father',
        then: Yup.string().required('Father DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age sgould me minium 18 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),
    dob_4: Yup.string().when(['looking_for_4'], {
        is: looking_for_4 => looking_for_4 == 'mother',
        then: Yup.string().required('Mother DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age sgould me minium 18 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),
    dob_5: Yup.string().when(['looking_for_5'], {
        is: looking_for_5 => looking_for_5 == 'fatherInLaw',
        then: Yup.string().required('Father-In-Law DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age sgould me minium 18 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),
    dob_6: Yup.string().when(['looking_for_6'], {
        is: looking_for_6 => looking_for_6 == 'motherInLaw',
        then: Yup.string().required('Mother-In-Law DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age sgould me minium 18 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),
    
    
})

function checkInputdata(str)
{
    let error;
    //I use the following script for min 8 letter password, with at least a symbol, upper and lower case letters and a number
    if(str==0){
        error = 'Please select an options.';
    }
    return error;
}

const newInitialValues = {}

class InformationYourself extends Component {
    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            insureList: "",
            lookingFor:[],
            dob:[],
            gender: "",
            validateCheck:0,
            familyMembers:[],
            addressDetails:{},
            is_eia_account:'',
            display_dob:[],
            display_looking_for:[]
        };
    }


    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }


    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    handleChangeSubmit = (value) => {
        this.setState({
            gender: value
        });
    }

    handleFormSubmit = (values) => {
        const {productId} = this.props.match.params
        const formData = new FormData();
        let gender = values.gender
    console.log("gender=========>",gender);
    formData.append(`gender`, gender);
    let lookingFor = this.state.lookingFor ;
    console.log("lookingFor=========>",lookingFor);
    let dob = this.state.dob ;
    console.log("dob=========>",dob);
    let familyMembers = this.state.familyMembers;
    
    let menumaster_id = 2;
    console.log("menumaster_id=========>",menumaster_id);
    formData.append(`menumaster_id`, menumaster_id);    
    for(let i=0;i<dob.length;i++){
        let date_of_birth= dob[i] ? dob[i] : familyMembers[i].dob;
        formData.append(`dob[${i}]`, date_of_birth);
    }  
    for(let i=0;i<lookingFor.length;i++){
        let looking_for = lookingFor[i] ? lookingFor[i] : familyMembers[i].relation_with;
        formData.append(`looking_for[${i}]`, looking_for);
    }   
    this.props.loadingStart();
    axios
    .post(`/yourself`, formData)
    .then(res => {
        localStorage.setItem('policyHolder_id', res.data.data.policyHolder_id);
        localStorage.setItem('policyHolder_refNo', res.data.data.policyHolder_refNo);
        this.props.history.push(`/MedicalDetails/${productId}`);
    })
    .catch(err => {
      console.log('Errors==============>',err.data);
      if(err && err.data){
         swal('Family Member fields are required...');
      }
      this.props.loadingStop();
    });
    
       // this.props.history.push(`/MedicalDetails/${productId}`);
    }


    handleSubmitForm = (values, actions) => {
        var drv = []; 
        var display_looking_for = [];
        var display_dob = [];
        console.log("VALUES --------->",values);
        //var check_input = values.check_input
        if(this.state.validateCheck == 1){
            for (const key in values) {
                if (values.hasOwnProperty(key)) {
                    if ( key.match(/looking_for/gi)){   
                      //  lastChar = key[key.length -1];                          
                        if(values[key] != '' )
                            drv.push(values[key]);
                    }    
                }
            }
            if(drv && drv.length>0){
                 this.setState({
                    insureList: drv.toString()
                })
            }    
    
            const {productId} = this.props.match.params
            const {gender} = this.state
            const formData = new FormData();
            let looking_for = []
            let dob = []
            let i=[];
            let j=[];
            for (const key in values) {
                if (values.hasOwnProperty(key)) {
                    if ( key.match(/looking_for/gi)){                  
                        i = key.substr(12, 1);                                             
                        console.log("ASSSS1111======>", values[key]);
                        display_looking_for[i] = values[key] ? values[key] : '';
                        if(values[key]){
                            looking_for.push(values[key]);
                                
                        }                           // formData.append(`looking_for[${i}]`, values[key]);
                    }

                   
                   
                    if ( key.match(/dob/gi)){                 
                        i = key.substr(4, 1);   
                        display_dob[i] = values[key] ? values[key] : '';    
                        if(values[key]) {
                            dob.push(moment(values[key]).format("YYYY-MM-DD"))
                        }
                        //formData.append(`dob[${i}]`, moment(values[key]).format("YYYY-MM-DD"));
                    }
                } 
            }
            sessionStorage.setItem('display_looking_for',JSON.stringify(display_looking_for));
            sessionStorage.setItem('display_dob',JSON.stringify(display_dob));
            this.setState({
                lookingFor:looking_for,
                display_looking_for
             });
             this.setState({
                dob:dob,
                display_dob
             });  
             this.handleClose()
        /*formData.append('menumaster_id', 2);
        formData.append('gender', gender);
        axios
            .post(`/yourself`, formData)
            .then(res => {
                localStorage.setItem('policyHolder_id', res.data.data.policyHolder_id);
                localStorage.setItem('policyHolder_refNo', res.data.data.policyHolder_refNo);
               
            })
            .catch(err => {
              
              this.props.loadingStop();
            });
            this.handleClose()*/
    }   
    else{
        swal('Please select at least one option');
        //this.handleClose()
    }
}
componentDidMount(){
    this.fetchData();
    
}

fetchData=()=>{
    const {productId } = this.props.match.params
    let policyHolder_id = localStorage.getItem("policyHolder_id");
    axios.get(`policy-holder/${policyHolder_id}`)
        .then(res=>{
            //console.log("aaaaaabbbbbir========>",response.data.data.policyHolder.request_data.family_members)
            let family_members = res.data.data.policyHolder.request_data.family_members
            let addressDetails = JSON.parse(res.data.data.policyHolder.address)
            let is_eia_account = res.data.data.policyHolder.is_eia_account
            let gender = res.data.data.policyHolder.gender
            let validateCheck = family_members && family_members.length>0 ? 1:0;
            this.setState({ 
                familyMembers:family_members,
                addressDetails,
                is_eia_account,
                gender,
                validateCheck
            })
            this.setStateForPreviousData(family_members);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
}


setValueData = () => {
    var checkBoxAll = document.getElementsByClassName('user-self');
   // console.log('OP===>',checkBoxAll)
    for(const a in checkBoxAll){
        if(checkBoxAll[a].checked){            
            return true
        }
    }
    return false
}

setStateForPreviousData=(family_members)=>{
    if (family_members.length > 0) {
        let looking_for = family_members.map(resource =>resource.relation_with);
        let dob = family_members.map(resource => moment(resource.dob).format("YYYY-MM-DD"));
        let insureList = looking_for.toString();

        this.setState({
            insureList,
            lookingFor:looking_for,
            dob
         });
    } 
}

    getInsuredList=(family_members)=>{
        ///console.log("FAMILY======>",family_members);
        if (family_members.length > 0) {
			return family_members.map(resource => resource.relation_with);
		} else {
			return [];
		}
    }
    render() {
        const {memberInfo, insureList,validateCheck,gender,familyMembers,lookingFor,dob,display_looking_for,display_dob} = this.state
        console.log("FAMILY11111======>",display_looking_for);
        console.log("FAMILY22222======>",display_dob);
        const insureListPrev = this.getInsuredList(familyMembers);
       
        console.log("insureList =====",familyMembers);
        let display_looking_for_arr = display_looking_for  && display_looking_for.length >0 ? display_looking_for : (sessionStorage.getItem('display_looking_for') ? JSON.parse(sessionStorage.getItem('display_looking_for')) : []);
        let display_dob_arr = display_dob && display_dob.length >0 ? display_dob : (sessionStorage.getItem('display_dob') ? JSON.parse(sessionStorage.getItem('display_dob')) : []);
        console.log("insureList =====",display_looking_for_arr);

        const newInitialValues = Object.assign(initialValues, {
            check_input: validateCheck ? validateCheck :0,
            gender: gender ? gender : "",
            looking_for_0: display_looking_for_arr[0] ? display_looking_for_arr[0]:"",
            dob_0: display_dob_arr[0] ? new Date(display_dob_arr[0]) : "",
            looking_for_1: display_looking_for_arr[1] ? display_looking_for_arr[1] : "",
            dob_1: display_dob_arr[1] ? new Date(display_dob_arr[1]) : "",
            looking_for_2: display_looking_for_arr[2] ? display_looking_for_arr[2] : "",
            dob_2: display_dob_arr[2] ? new Date(display_dob_arr[2]) : "",
            child1Gender: memberInfo ? memberInfo.child1Gender : "",
            looking_for_3: display_looking_for_arr[3] ? display_looking_for_arr[3] : "",
            dob_3: display_dob_arr[3] ? new Date(display_dob_arr[3]) : "",
            looking_for_4: display_looking_for_arr[4] ? display_looking_for_arr[4] : "",
            dob_4: display_dob_arr[4] ? new Date(display_dob_arr[4]) : "",
            looking_for_5: display_looking_for_arr[5] ? display_looking_for_arr[5] : "",
            dob_5: display_dob_arr[5] ? new Date(display_dob_arr[5]) : "",
            looking_for_6: display_looking_for_arr[6] ? display_looking_for_arr[6] : "",
            dob_6: display_dob_arr[6] ? new Date(display_dob_arr[6]) : "",
            insureList: insureListPrev ? insureListPrev.toString()  : (insureList ? insureList :'')
        });
           

        
       


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
                                <section className="brand">
                                    <div className="boxpd">
                                        <h4 className="m-b-30">Help us with some information about yourself</h4>
                                        <Formik initialValues={newInitialValues} 
                                        onSubmit={this.handleFormSubmit} 
                                        validationSchema={vehicleInspectionValidation}>
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                        return (
                                        <Form>
                                        <div className="row formSection">
                                            <label className="col-md-4">Gender:</label>
                                            <div className="col-md-4">
                                            <Field
                                                name="gender"
                                                component="select"
                                                autoComplete="off"
                                                value={values.gender}
                                                className="formGrp"
                                                onChange={(e) => {
                                                    setFieldValue('gender', e.target.value);
                                                   // this.handleChangeSubmit(e.target.value)
                                                }}
                                            >
                                            <option value="">Select gender</option>
                                                <option value="m">Male</option>
                                                <option value="f">Female</option>
                                            </Field>  
                                            {errors.gender && touched.gender ? (
                                                <span className="errorMsg">{errors.gender}</span>
                                            ) : null}    
                                            </div>
                                        </div>
                                        <div className="row formSection m-b-30">
                                            <label className="col-md-4">Looking to Insure: <br /><span className="small">(Add Family Members to be Insured)</span></label>
                                            <div className="d-flex col-md-4" onClick={this.handleShow} href={'#'}>
                                                <Field
                                                    name="insureList"
                                                    type="text"
                                                    placeholder="Select"
                                                    className="hght45"
                                                    autoComplete="off"
                                                    readonly="true"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value={insureList ? insureList : values.insureList}
                                                />                    
                                                <img src={require('../../assets/images/plus-sign.svg')} alt="" />
                                                <br/><br/>
                                                {errors.insureList && touched.insureList ? (
                                                    <span className="errorMsg">{errors.insureList}</span>
                                                ) : null} 
                                            </div>
                                        </div>
                                        <div className="cntrbtn">
                                        <Button className={`btnPrimary`} type="submit" >
                                            Go
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

                            <Modal className="customModal1" bsSize="md"
                                show={this.state.show}
                                onHide={this.handleClose}>

                                <Formik initialValues={newInitialValues} onSubmit={this.handleSubmitForm}
                                 validationSchema={validateFamilyMembers}
                                >
                                {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                return (
                                <Form>
                                    <div className="customModalfamlyForm">
                                        <div className="modal-header">
                                            <h4 className="modal-title">Add Family Members to be Insured</h4>
                                        </div>
                                        <Modal.Body>
                                           {/* <Field type="hidden" className="form-control" className="check_input" name="check_input" value = {validateCheck}
                                            validate={checkInputdata} 
                                            /> 
                                            {
                                                errors.check_input && touched.check_input ?                 
                                                <span className="error-message">{errors.check_input}</span>:''
                                            }*/}
                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Self
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_0"
                                                        value="self"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_0', e.target.value);     
                                                                                                                      
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_0', '');
                                                                setFieldValue("dob_0", '');
                                                                
                                                            }

                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }

                                                        }}
                                                    checked={values.looking_for_0 == 'self' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"> </span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="formGrp error">                                                  
                                                        <DatePicker
                                                            name="dob_0"
                                                            minDate={new Date()}
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date()}
                                                            minDate={new Date(1/1/1900)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value) => {
                                                                setFieldTouched("dob_0");
                                                                setFieldValue("dob_0", value);

                                                              }}
                                                            selected={values.dob_0}
                                                        />

                                                        {
                                                            errors.dob_0 && touched.dob_0 ?                 
                                                            <span className="error-message">{errors.dob_0}</span>:''
                                                        }
                                                    </label>
                                                </div>
                                            </div>


                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Spouse
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_1"
                                                        value="spouse"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_1', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_1', '');
                                                                setFieldValue("dob_1", '');                                                                
                                                            }

                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }
                                                        }}
                                                        checked={values.looking_for_1 == 'spouse' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="formGrp error">
                                                        <DatePicker
                                                            name="dob_1"
                                                            minDate={new Date()}
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date()}
                                                            minDate={new Date(1/1/1900)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value) => {
                                                                setFieldTouched("dob_1");
                                                                setFieldValue("dob_1", value);
                                                              }}
                                                            selected={values.dob_1}
                                                        />

                                                        {
                                                            errors.dob_1 && touched.dob_1 ?                 
                                                            <span className="error-message">{errors.dob_1}</span>:''
                                                        }
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Child 1
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_2"
                                                        value="child1"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_2', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_2', '');
                                                                setFieldValue("dob_2", '');
                                                                
                                                            }
                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }
                                                        }}
                                                        checked={values.looking_for_2 == 'child1' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="formGrp error">
                                                        <DatePicker
                                                            name="dob_2"
                                                            minDate={new Date()}
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date()}
                                                            minDate={new Date(1/1/1900)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value) => {
                                                                setFieldTouched("dob_2");
                                                                setFieldValue("dob_2", value);
                                                              }}
                                                            selected={values.dob_2}
                                                        />
                                                        {
                                                            errors.dob_2 && touched.dob_2 ?                 
                                                            <span className="error-message">{errors.dob_2}</span>:''
                                                        }
                                                    </label>
                                                </div>

                                                <div className="col-md-4 formSection">
                                                    <label className="formGrp">
                                                    <Field
                                                        name="child1Gender"
                                                        component="select"
                                                        autoComplete="off"
                                                        value={values.child1Gender}
                                                        className="formGrp"
                                                    >
                                                    <option value="">Select gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </Field>    
                                                    </label>
                                                    {
                                                            errors.child1Gender && touched.child1Gender ?                 
                                                            <span className="error-message">{errors.child1Gender}</span>:''
                                                    }
                                                </div>
                                            </div>

                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Father
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_3"
                                                        value="father"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_3', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_3', '');
                                                                setFieldValue("dob_3", '');
                                                                
                                                            }
                                                        }}
                                                        checked={values.looking_for_3 == 'father' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="formGrp error">
                                                        <DatePicker
                                                            name="dob_3"
                                                            minDate={new Date()}
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date()}
                                                            minDate={new Date(1/1/1900)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value) => {
                                                                setFieldTouched("dob_3");
                                                                setFieldValue("dob_3", value);
                                                              }}
                                                            selected={values.dob_3}
                                                        />

                                                        {
                                                            errors.dob_3 && touched.dob_3 ?                 
                                                            <span className="error-message">{errors.dob_3}</span>:''
                                                        }
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Mother
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_4"
                                                        value="mother"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_4', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_4', '');
                                                                setFieldValue("dob_4", '');
                                                                
                                                            }
                                                        }}
                                                        checked={values.looking_for_4 == 'mother' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="formGrp error">
                                                        <DatePicker
                                                            name="dob_4"
                                                            minDate={new Date()}
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date()}
                                                            minDate={new Date(1/1/1900)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value) => {
                                                                setFieldTouched("dob_4");
                                                                setFieldValue("dob_4", value);
                                                              }}
                                                            selected={values.dob_4}
                                                        />

                                                        {
                                                            errors.dob_4 && touched.dob_4 ?                 
                                                            <span className="error-message">{errors.dob_4}</span>:''
                                                        }
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Father in law
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_5"
                                                        value="fatherInLaw"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_5', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_5', '');
                                                                setFieldValue("dob_5", '');                                                                
                                                            }
                                                        }}
                                                        checked={values.looking_for_5 == 'fatherInLaw' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="formGrp error">
                                                        <DatePicker
                                                            name="dob_5"
                                                            minDate={new Date()}
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date()}
                                                            minDate={new Date(1/1/1900)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value) => {
                                                                setFieldTouched("dob_5");
                                                                setFieldValue("dob_5", value);
                                                              }}
                                                            selected={values.dob_5}
                                                        />

                                                        {
                                                            errors.dob_5 && touched.dob_5 ?                 
                                                            <span className="error-message">{errors.dob_5}</span>:''
                                                        }
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="row dropinput m-b-45">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Mother in law
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_6"
                                                        value="motherInLaw"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_6', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_6', '');
                                                                setFieldValue("dob_6", '');
                                                                
                                                            }
                                                        }}
                                                        checked={values.looking_for_6 == 'motherInLaw' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <label className="formGrp error">
                                                        <DatePicker
                                                            name="dob_6"
                                                            minDate={new Date()}
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date()}
                                                            minDate={new Date(1/1/1900)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value) => {
                                                                setFieldTouched("dob_6");
                                                                setFieldValue("dob_6", value);
                                                              }}
                                                            selected={values.dob_6}
                                                        />

                                                        {
                                                            errors.dob_6 && touched.dob_6 ?                 
                                                            <span className="error-message">{errors.dob_6}</span>:''
                                                        }
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="cntrbtn">
                                            <Button className={`btnPrimary m-r-15`} type="submit" >
                                               Select
                                            </Button>
                                            <Button className={`btnPrimary`} type="button" onClick={e => this.handleClose()} >
                                             Cancel
                                            </Button>
                                            </div>
                                        </Modal.Body>
                                    </div>
                                    </Form>
                                    );
                                }}
                                </Formik>
                            </Modal>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(InformationYourself));