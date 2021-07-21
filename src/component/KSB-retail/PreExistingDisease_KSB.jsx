import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
// import ReactTooltip from "react-tooltip";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";

import swal from 'sweetalert';

import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import Encryption from '../../shared/payload-encryption';

const initialFamilyDetails = {
	fname: "",
	lname: "",
	dob: new Date(),
    gender: "",	
    family_member_id:0,
    looking_for:''
};

const initialValues = {
    proposerAsInsured: "",
    family_members:[initialFamilyDetails],
    panNo: "",
    phoneNo: "",
    email: "",
    address1: "",
    address2: "",
    address3: "",
    pincode: "",
    // area: "",
    state: "",
    proposerName: "",
    proposerLname: "",
    proposerDob: "",
    proposerGender: "",
    is_eia_account: "",
    is_ckyc_account: "",
    eia_no: "",
    ckyc_account_no: ""
    };

const validateAddress =  Yup.object().shape({
    family_members: Yup.array().of(
            Yup.object().shape({
                looking_for : Yup.string(),
                preExistingDisease: Yup.string().required("Pre-existing disease required"),

                preExistingDetails: Yup.string().when(['preExistingDisease'], {
                    is: preExistingDisease => preExistingDisease == 'yes',       
                    then: Yup.string().required("Pre-existing disease required")
                    .min(3, function() {
                        return "Pre-existing disease must be minimum 3 chracters"
                    })
                    .max(50, function() {
                        return "Pre-existing disease must be maximum 50 chracters"
                    })
                    .matches(/^([A-Za-z,\s]*)$/, function() {
                        return "Please enter valid disease name"
                    }),
                    otherwise: Yup.string()
                })
                // dob: Yup.date().when(['looking_for'],{
                //     //is: looking_for => (looking_for == 'self' || looking_for == 'spouse' || looking_for == 'child1') ,
                //     is: looking_for => ['self','spouse','mother','father','fatherInLaw','motherInLaw'].includes(looking_for) ,
                //     then: Yup.date().required("Please enter DOB").max(maxDob, function() {
                //         return "Date should not be future date"
                //         })
                //         .test(
                //             "18YearsChecking",
                //             function() {
                //                 return "Age should me minium 18 years and maximum 55 years"
                //             },
                //             function (value) {
                //                 if (value) {
                //                     const ageObj = new PersonAge();
                //                     return ageObj.whatIsMyAge(value) < 56 && ageObj.whatIsMyAge(value) >= 18;
                //                 }
                //                 return true;
                //             }
                //         )

                // })
            })     
    ),

});


class Address extends Component {

  
    constructor(props) {
		super(props)
		this.state = {
            policy_holder:{},
            familyMembers:[],
            addressDetails:{},
            selfFlag:false,
            ksbPreExisting: []
		}
	}


    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    componentDidMount(){       
        this.fetchData();
    }

    fetchData=()=>{
        const {productId } = this.props.match.params
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo");
        this.props.loadingStart();
        axios.get(`ksb/details/${policyHolder_refNo}`)
            .then(res=>{
                let policy_holder =  res.data.data.policyHolder;
                let family_members = res.data.data.policyHolder.request_data.family_members
                let selfFlag = false;
                let ksbPreExisting = res.data.data.policyHolder.ksbinfo && res.data.data.policyHolder.ksbinfo.ksbpreexisting ? res.data.data.policyHolder.ksbinfo.ksbpreexisting : []
                for(let i=0;i<family_members.length;i++){
                    if(family_members[i].relation_with=='self'){
                        selfFlag = true
                        break
                    }
                }            
                this.setState({ 
                    selfFlag,
                    policy_holder,
                    familyMembers:family_members,
                    ksbPreExisting
                })       
            })
            .catch(function (error) {
                // handle error
                // this.props.loadingStop();
            })
            this.props.loadingStop();
    }


    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    sumInsured = (productId) => {
        this.props.history.push(`/Health_KSB/${productId}`);
    }

    handleSubmit = (values, actions) => {
        const {productId } = this.props.match.params
        const policyHolder_id =  localStorage.getItem('policyHolder_id');
        const formData = new FormData();

        let formArr = []
        
        formArr['policy_holder_id'] = policyHolder_id;
        const family_members = values.family_members;
        let proposerAsInsured = values.proposerAsInsured;
        sessionStorage.setItem('proposed_insured',proposerAsInsured);
 
        let looking_for = []
        let family_member_id = []
        let preExistingDisease = []
        let preExistingDetails = []


        for(let i=0;i<family_members.length;i++){
             looking_for.push(family_members[i].looking_for)
            family_member_id.push(family_members[i].family_member_id)
            preExistingDisease.push(family_members[i].preExistingDisease)
            preExistingDetails.push(family_members[i].preExistingDetails && family_members[i].preExistingDisease == "yes" ? family_members[i].preExistingDetails : "" )

        }  

        formArr['looking_for'] = looking_for
        formArr['family_member_id'] = family_member_id     
        formArr['policy_holder_id'] = policyHolder_id;
        formArr['pre_existing_disease'] = preExistingDisease;
        formArr['pre_existing_details'] = preExistingDetails;
        formArr['page_name'] = `PreExistingDisease_KSB/${productId}`
        

        let formObj = {}
        Object.assign(formObj,formArr);
        // console.log("preExistingDisease---- ", formObj)
        let encryption = new Encryption(); 
        formData.append('enc_data',encryption.encrypt(JSON.stringify(formObj)))

        this.props.loadingStart();
        axios
        .post(`ksb/pre-existing-disease`, formData)
        .then(res => {
           // if(res.data.completedStep == 4){
                this.props.loadingStop();
                this.props.history.push(`/SelectDuration_KSB/${productId}`);
           // }        
        })
        .catch(err => {
            if(err.status == 401) {
                swal("Session out. Please login")
            }
            else swal("Something wrong happened. Please try after some")
            actions.setSubmitting(false);
        this.props.loadingStop();
        });
    }

    initPreExisting = (familyDetails, ksbPreExisting) => {
		if (familyDetails.length > 0) {
			return familyDetails.map((resource,index) => ({
				// fname: resource.first_name ? resource.first_name:'',
				// lname: resource.last_name ? resource.last_name:'',
				// dob: resource.dob,
                // gender: resource.gender ?  resource.gender:'',
                looking_for: resource.relation_with,
                family_member_id: resource.id,
                preExistingDisease: ksbPreExisting && ksbPreExisting.length > 0 && index < ksbPreExisting.length ? ksbPreExisting[index].description : "",
                preExistingDetails: ksbPreExisting && ksbPreExisting.length > 0 && index < ksbPreExisting.length && ksbPreExisting[index].pre_existing_details ? ksbPreExisting[index].pre_existing_details : ""
			}));
		} else {
			return [initialFamilyDetails];
		}
    };

    
    render() {
        const {policy_holder,familyMembers,ksbPreExisting,selfFlag} = this.state    

        let newInitialValues = Object.assign(initialValues, {
            proposerAsInsured: sessionStorage.getItem('proposed_insured') ? sessionStorage.getItem('proposed_insured') : (selfFlag ? 1:0),
            family_members:this.initPreExisting(
                familyMembers, ksbPreExisting
            )   
        });
console.log("innitial family_members------------------- ", newInitialValues)
        const {productId} = this.props.match.params
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
							
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox prehealthex">
                                <h4 className="text-center mt-3 mb-3">KSB Retail Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">

                                    <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} 
                                    validationSchema={validateAddress}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => { 
                                        console.log("errors--------------- ", errors)                                   
                                    return (                  
                                    <Form>                                      
                                        <Row>
                                        <Col sm={12} md={12} lg={12}>
                                        <>
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Tell us more about Pre-existing disease of Insured Members</h4>
                                        </div>
                                                        
                                            <FieldArray
                                                name="family_members"
                                                render={arrayHelpers => (
                                                    <div>
                                            {familyMembers && familyMembers.length>0 && familyMembers.map((resource,index)=> 
                                                    <div className="d-flex justify-content-left prsnlinfo">
                                                        <div className="W12">
                                                            {resource.relation_with == "motherInLaw" ? "MOTHER IN LAW" : resource.relation_with == "fatherInLaw" ? "FATHER IN LAW" : resource.relation_with.toUpperCase()}
                                                            <Field
                                                                name={`family_members.${index}.family_member_id`}
                                                                type="hidden"
                                                                value={values.family_members[index].family_member_id}
                                                            />
                                                            <Field
                                                                name={`family_members.${index}.looking_for`}
                                                                type="hidden"
                                                                value={values.family_members[index].looking_for}
                                                            />
                                                        </div> &nbsp;&nbsp;
                                                        <Row>
                                                        <Col sm={12} md={12} lg={12}>
                                                            <FormGroup>
                                                                <div className="d-inline-flex m-b-35">
                                                                    <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                        <Field
                                                                            name={`family_members.${index}.preExistingDisease`}
                                                                            type="radio"
                                                                            value='yes'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            checked = {values.family_members[index].preExistingDisease == 'yes' ? true : false}
                                                                        /> 
                                                                         <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                                    </label>
                                                                    </div>
                                                                    <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                        <Field
                                                                            name={`family_members.${index}.preExistingDisease`}
                                                                            type="radio"
                                                                            value='no'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            checked = {values.family_members[index].preExistingDisease == 'no' ? true : false}
                                                                        />
                                                                         <span className="checkmark " /><span className="fs-14"> No</span>
                                                                    </label>
                                                                    </div>
                                                                    <div className="p-r-25">
                                                                    {errors.family_members && errors.family_members[index] && errors.family_members[index].preExistingDisease ? (
                                                                        <span className="errorMsg">{errors.family_members[index].preExistingDisease}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        {values.family_members[index].preExistingDisease == 'yes' ?
                                                        <Col sm={12} md={12} lg={12}>
                                                            <FormGroup>
                                                                <div className="insurerName">
                                                                    <Field
                                                                        name={`family_members.${index}.preExistingDetails`}
                                                                        type="text"
                                                                        placeholder="Pre-existing disease "
                                                                        autoComplete="off"
                                                                        maxLength = {50}
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value = {values.family_members[index].preExistingDetails}
                                                                    />
                                                                    {errors.family_members && errors.family_members[index] && errors.family_members[index].preExistingDetails ? (
                                                                    <span className="errorMsg">{errors.family_members[index].preExistingDetails}</span>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col> : null
                                                        }
                                                        </Row>   
                                                    </div>
                                                    )}                                                
                                                    </div>
                                                )}/>
                                                </>
                                               
                                        <div className="d-flex justify-content-left resmb">
                                        <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.sumInsured.bind(this, productId )}>
                                            {isSubmitting ? 'Wait..' : 'Back'}
                                        </Button> 
                                        <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                            {isSubmitting ? 'Wait..' : 'Continue'}
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
      loading: state.loader.loading
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop())
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Address));