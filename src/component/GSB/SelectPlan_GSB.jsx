import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import moment from "moment";
import * as Yup from 'yup';
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import {  alphanumericCheck } from "../../shared/validationFunctions";

const minDate = moment().add(1, 'day').format();
// alert(new Date(minDate));
const maxDate = moment().add(16, 'day');
const maxDateEnd = moment().add(15, 'day').calendar();

const initialValues = {
    pol_start_date: new Date(new Date().setHours(0, 0, 0, 0)),
    pol_end_date: new Date(new Date(moment().add(364, 'day').calendar()).setHours(23, 59, 0, 0) ),
    pinDataArr: [],
    house_flat_no: "",
    city: "",
    house_building_name: "",
    area_name: "",
    state_name: "",
    pincode: "",
    pincode_id: "",
    business_type: "1",
    plan_id: ""

}

const vehicleRegistrationValidation = Yup.object().shape({
    pol_start_date: Yup.date().required("Please select both policy start date & time").nullable(),
    pol_end_date: Yup.date().required("Please select both policy end date & time").nullable(),
    house_building_name: Yup.string()
      .test(
        "buildingNameCheck",
        function() {
            return "Please enter building name"
        },
        function (value) {
            if (this.parent.house_flat_no || value) {
               
                return true
            }
            return false;
    }) .matches(/^(?![0-9]*$)+([\s]?[\/a-zA-Z0-9.,-])+$/, 'Please enter a valid building name only')
        .matches(/^([a-zA-Z0-9.,-]+\s)*[\/a-zA-Z0-9.,-]+$/, 'The field should have only one space in between words').nullable(),

    house_flat_no: Yup.string()
      .test(
        "buildingNameCheck",
        function() {
            return "Please enter flat number"
        },
        function (value) {
            if (this.parent.house_building_name || value) {
               
                return true
            }
            return false;
    }).matches(/^[\/a-zA-Z0-9.,-]*$/, 'Please enter a valid flat number only').nullable(),

    area_name: Yup.string()
      .required("Please enter area name")
      .matches(/^[a-zA-Z0-9]+([\s]?[\/a-zA-Z0-9.,-])*$/, function () {
        return "Please enter valid area name";
      }).matches(/^(?![0-9]*$)+([\s]?[\/a-zA-Z0-9.,-])+$/, 'Please enter a valid area name only')
        .matches(/^([a-zA-Z0-9.,-]+\s)*[\/a-zA-Z0-9.,-]+$/, 'The field should have only one space in between words').nullable(),
    pincode: Yup.string()
      .required("Pincode is required")
      .matches(/^[0-9]{6}$/, function () {
        return "Please enter valid 6 digit pin code";
      })
      .nullable(),
    pincode_id: Yup.string().required("Please select locality").nullable(),
    business_type: Yup.string().required("Please select type of business").nullable(),
    plan_id: Yup.string().required("Please select a plan").nullable()
})


class SelectPlan_GSB extends Component {
    state = {
        motorInsurance:'',
        regno:'',
        length:14,
        fastlanelog: [],
        cityName:"",
        stateName: "",
        requested_Data: [],
        gsb_Details: [],
        addressDetails: [],
        coverPlanA: [], 
        coverPlanB: [], 
        coverPlanC: []
    }
   
    forwardNextPage=()=> {    
        this.props.history.push(`/AdditionalDetails_GSB/${this.props.match.params.productId}`);  
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
        this.fetchPolicyDetails(); 
    }

    handleChange = (e) => {
        const {occupationList} = this.state
        this.setState({
          serverResponse: [],
          error: []
        })
      }

    handleCoverChange = (val) => {
        const {coverPlanA, coverPlanB, coverPlanC} = this.state
        let policyCoverage = val == 1 ? coverPlanA : val == 2 ? coverPlanB : coverPlanC
        
        return(
            <table >
                 <tr>
                    <th>Section</th>
                    <th>Sum Insured</th>
                </tr>
               { policyCoverage && policyCoverage.length > 0 ?
                    policyCoverage.map((coverage, qIndex) => (
                        <tr>
                            <td>{coverage.benefit_name}:</td>
                            <td>₹ {Math.round(coverage.benefit_suminsured)}</td>
                        </tr>                    

                )) : null}
            </table > 
        )
    }

    fetchCoveragePlan=(pincode_Details)=>{
        const { productId } = this.props.match.params;
        let encryption = new Encryption();
        axios
          .get(`gsb/get-plan-with-coverage`)
          .then((res) => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            let coverPlanA = decryptResp.data && decryptResp.data.plan_with_coverages ? decryptResp.data.plan_with_coverages[2].coveragebenefit : null;
            let coverPlanB = decryptResp.data && decryptResp.data.plan_with_coverages ? decryptResp.data.plan_with_coverages[1].coveragebenefit : null;
            let coverPlanC = decryptResp.data && decryptResp.data.plan_with_coverages ? decryptResp.data.plan_with_coverages[0].coveragebenefit : null;
            console.log("---gsb_Details--->>", decryptResp);
            this.setState({
                coverPlanA, coverPlanB, coverPlanC
            });
            this.fetchPrevAreaDetails(pincode_Details)
          })
          .catch((err) => {
            // handle error
            this.props.loadingStop();
          });        
    }

    fetchPolicyDetails=()=>{
        const { productId } = this.props.match.params;
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        axios
          .get(`gsb/gsb-policy-details/${policyHolder_refNo}`)
          .then((res) => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            let gsb_Details = decryptResp.data && decryptResp.data.policyHolder.gsbinfo ? decryptResp.data.policyHolder.gsbinfo : null;
            let requested_Data = decryptResp.data && decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data : null;
            let addressDetails = gsb_Details ? JSON.parse(gsb_Details.risk_address) : null
            let pincode_Details = gsb_Details ? JSON.parse(gsb_Details.pincode_response) : null
            console.log("---gsb_Details--->>", gsb_Details);
            this.setState({
              gsb_Details, requested_Data, 
              addressDetails, pincode_Details
            });
            this.fetchCoveragePlan(pincode_Details)           
            this.props.loadingStop();
          })
          .catch((err) => {
            // handle error
            this.props.loadingStop();
          });        
    }

    quote = (values, actions) => {
        const { accessToken, accidentDetails, declineStatus } = this.state
        const formData = new FormData();
        this.props.loadingStart();
        // const post_data = {
        //   'id': localStorage.getItem('policyHolder_id'),
        //   'proposer_dob': date_of_birth,
        //   'sum_insured': ipaInfo ? ipaInfo.sum_insured : null
        // }
        let encryption = new Encryption();
        // formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        formData.append('policy_reference_no',localStorage.getItem("policyHolder_refNo"))
    
        axios
          .post(`/gsb/fullQuoteGSB`, formData)
          .then(res => {
            if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
              this.setState({
                fulQuoteResp: res.data.PolicyObject,
                serverResponse: res.data.PolicyObject,
                error: [],
                validation_error: []
              })
              this.props.loadingStop();
            }
            else if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Fail") {
              this.setState({
                fulQuoteResp: res.data.PolicyObject,
                serverResponse: [],
                validation_error: [],
                error: { "message": 1 }
              })
              this.props.loadingStop();
            }
            else if (res.data.code && res.data.message && ((res.data.code == "validation failed" && res.data.message == "validation failed") || (res.data.code == "Policy Validation Error" && res.data.message == "Policy Validation Error"))) {
              var validationErrors = []
              for (const x in res.data.messages) {
                validationErrors.push(res.data.messages[x].message)
              }
              this.setState({
                fulQuoteResp: [],
                validation_error: validationErrors,
                error: [],
                serverResponse: []
              });
              // swal(res.data.data.messages[0].message)
              this.props.loadingStop();
            }
            else {
              this.setState({
                fulQuoteResp: [],
                error: res.data.ValidateResult,
                validation_error: [],
                serverResponse: []
              });
              this.props.loadingStop();
            }
            actions.setSubmitting(false)
          })
          .catch(err => {
            this.setState({
              serverResponse: []
            });
            this.props.loadingStop();
          }); 
    }
    

    handleSubmit=(values,actions)=>{

        const {productId} = this.props.match.params;
    
        const formData = new FormData();
        let encryption = new Encryption();
        const {fastLaneData, fastlanelog } = this.state
        let post_data = {}
        let policyHolder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') :0

        post_data = {
            'area_name':values.area_name,
            'plan_id': values.plan_id,
            'menumaster_id':10,
            'vehicle_type_id':productId,
            'page_name': `SelectPlan_GSB/${productId}`,
            'house_building_name' : values.house_building_name,
            'business_type': values.business_type,
            'house_flat_no': values.house_flat_no,
            'pincode_id': values.pincode_id,
            'pol_end_date': values.pol_end_date ? moment(values.pol_end_date).format("YYYY-MM-DD HH:mm") : "" ,
            'pol_start_date': values.pol_start_date ? moment(values.pol_start_date).format("YYYY-MM-DD HH:mm") : "",

        } 
    
        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }
        if(sessionStorage.getItem('csc_id')) {
            post_data['csc_id'] = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : ""
            post_data['agent_name'] = sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : ""
            post_data['product_id'] = sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : ""
            post_data['bcmaster_id'] = "5"
        }
        else {
            post_data['bcmaster_id'] = bc_data ? bc_data.agent_id : ""
            post_data['bc_token'] = bc_data ? bc_data.token : ""
            post_data['bc_agent_id'] = bc_data ? bc_data.user_info.data.user.username : ""
        }
    
        if(policyHolder_id > 0){
            post_data['policy_holder_id'] = policyHolder_id
            
            console.log('post_data', post_data)
            formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        
            this.props.loadingStart();
            axios
            .post(`gsb/update-registration`, formData)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp)
    
                if(decryptResp.error == false) {
                    this.quote(values, actions)
                }
                else{
                    this.props.loadingStop();
                    swal(decryptResp.msg)
                }                          
            })
            .catch(err => {
                let decryptErr = JSON.parse(encryption.decrypt(err.data));
                console.log('decryptResp--err---', decryptErr)
                if(decryptErr && err.data){
                    swal('Registration number required...');
                }
            this.props.loadingStop();
            });
        }
        else{

            console.log('post_data', post_data)
            formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
            this.props.loadingStart();
            axios
            .post(`gsb/registration`, formData)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp)

                if(decryptResp.error == false) {
                    localStorage.setItem('policyHolder_id', decryptResp.data.policyHolder_id);
                    localStorage.setItem('policyHolder_refNo', decryptResp.data.policyHolder_refNo);
                    this.quote(values, actions)
                }   
                else{
                    this.props.loadingStop();
                    swal(decryptResp.msg)
                }                          
            })
            .catch(err => {
            this.props.loadingStop();
            let decryptErr = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptResp--err---', decryptErr)
            if(err && err.data){
                swal('Please check..something went wrong!!');
            }      
            });
        }
    }

    fetchAreadetails = (e) => {
        let pinCode = e.target.value;
    
        if (pinCode.length == 6) {
          const formData = new FormData();
          this.props.loadingStart();
          // let encryption = new Encryption();
          const post_data_obj = {
            pincode: pinCode,
          };
          //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
          formData.append("pincode", pinCode);
          axios
            .post("pincode-details", formData)
            .then((res) => {
              if (res.data.error === false) {
                let stateName =
                  res.data.data &&
                  res.data.data[0] &&
                  res.data.data[0].pinstate.STATE_NM
                    ? res.data.data[0].pinstate.STATE_NM
                    : "";

                let cityName =
                    res.data.data &&
                    res.data.data[0] &&
                    res.data.data[0].pincity.CITY_NM
                      ? res.data.data[0].pincity.CITY_NM
                      : "";
                this.setState({
                  pinDataArr: res.data.data,
                  stateName, cityName
                });
                this.props.loadingStop();
              } else {
                this.props.loadingStop();
                swal("Plese enter a valid pincode");
              }
            })
            .catch((err) => {
              this.props.loadingStop();
            });
        }
      };
    
      fetchPrevAreaDetails=(pincode_Details)=>{
        if(pincode_Details){
            let pincode = pincode_Details.PIN_CD;
            const formData = new FormData();
            // let encryption = new Encryption();

           const post_data_obj = {
                'pincode':pincode.toString()
            };
           let encryption = new Encryption();
           formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

            formData.append('pincode', pincode)
            this.props.loadingStart();
            axios.post('pincode-details',
            formData
            ).then(res=>{
                let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""    
                let cityName = res.data.data && res.data.data[0] && res.data.data[0].pincity.CITY_NM ? res.data.data[0].pincity.CITY_NM : ""                     
                this.setState({
                    pinDataArr: res.data.data,
                    stateName, cityName
                });
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
            })
        }
        
}
    

    render() {
        const {pinDataArr, stateName, cityName, requested_Data, gsb_Details, addressDetails, serverResponse,
                validation_error, error, coverPlanA, coverPlanB, coverPlanC} = this.state
        const newInitialValues = Object.assign(initialValues,{
            pol_start_date: requested_Data && requested_Data.start_date ? new Date(requested_Data.start_date)  : new Date(new Date(moment().add(1,'day')).setHours(0, 0, 0, 0)),
            pol_end_date: requested_Data && requested_Data.end_date ? new Date(requested_Data.end_date)  : new Date(new Date(moment().add(365, 'day').calendar()).setHours(23, 59, 0, 0) ),
            house_flat_no: addressDetails && addressDetails.house_flat_no ? addressDetails.house_flat_no: "",
            city: addressDetails && addressDetails.city ? addressDetails.city: "",
            house_building_name:  addressDetails && addressDetails.house_building_name ? addressDetails.house_building_name: "",
            area_name: addressDetails && addressDetails.area_name ? addressDetails.area_name: "",
            pincode: gsb_Details && gsb_Details.pincode ? gsb_Details.pincode : "",
            pincode_id: gsb_Details && gsb_Details.pincode_id ? gsb_Details.pincode_id : "",
            business_type: gsb_Details && gsb_Details.business_type ? gsb_Details.business_type : "1",
            plan_id: gsb_Details && gsb_Details.plan_id ? gsb_Details.plan_id : "",
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
                                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited </h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <Formik initialValues={newInitialValues} 
                                       onSubmit={ serverResponse && serverResponse != "" ? (serverResponse.message ? this.handleSubmit : this.forwardNextPage ) : this.handleSubmit}  
                                        validationSchema={vehicleRegistrationValidation}
                                        >
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                            // console.log('values',values)
                                            
                                        return (
                                            <Form>    
                                            <div className="brandhead"> 
                                                <h4 className="fs-18 m-b-30">POLICY INFORMATION</h4>
                                            </div>                                           
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead"> 
                                                <h6><b>Type Of Business</b></h6>
                                                    <div className="d-inline-flex m-b-15">
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='business_type'
                                                                    value='1'
                                                                    key='1'
                                                                    checked = {values.business_type == '1' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('business_type')
                                                                        setFieldValue('business_type', '1');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"><h7> New</h7></span>
                                                            </label>
                                                        </div>
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='business_type'
                                                                    value='2'
                                                                    key='1'
                                                                    disabled={true}
                                                                    checked = {values.business_type == '2' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('business_type')
                                                                        setFieldValue('business_type', '2');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"><h7> SBIG Renewal</h7></span>
                                                            </label>
                                                            {errors.business_type && touched.business_type ? (
                                                                <span className="errorMsg">{errors.business_type}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <Row>
                                                <Col sm={6} md={5} lg={5}>
                                                    <h6>Policy start date & time:</h6>
                                                </Col>
                                                <Col sm={6} md={11} lg={4}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                            <DatePicker
                                                                name="pol_start_date"
                                                                minDate={new Date(minDate)}
                                                                maxDate={new Date(maxDate)}
                                                                excludeOutOfBoundsTimes
                                                                dateFormat="dd-MM-yyyy HH:mm"
                                                                timeFormat="HH:mm"
                                                                placeholderText="Policy Start Date & Time"
                                                                peekPreviousMonth
                                                                autoComplete="off"
                                                                peekPreviousYear
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.pol_start_date}
                                                                onSelect={(val) => {       
                                                                    Math.floor(moment().diff(val, 'days', true)) == 0 ? val.setHours(moment().format("HH"),moment().format("mm"),0,0) : val.setHours(0, 0, 0, 0)                                                                                                            
                                                                    // setFieldTouched('pol_start_date')
                                                                    setFieldValue('pol_start_date', val)
                                                                    //console.log('here',val);
                                                                    setFieldTouched('pol_end_date')
                                                                    setFieldValue('pol_end_date', new Date(new Date(moment(val).add(364, 'day').calendar()).setHours(23, 59, 0, 0) ) );
                                                                }}                            
                                                            />
                                                            {errors.pol_start_date && touched.pol_start_date ? (
                                                                <span className="errorMsg">{errors.pol_start_date}</span>
                                                            ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                                </Row>
                                                <Row>
                                                <Col sm={6} md={5} lg={5}>
                                                    <h6>Policy end date & time:</h6>
                                                </Col>
                                                <Col sm={6} md={11} lg={4}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                            <DatePicker
                                                                name="pol_end_date"
                                                                // minDate={new Date(values.pol_start_date)}
                                                                // maxDate={new Date(maxDate)}
                                                                dateFormat="dd-MM-yyyy HH:mm"
                                                                showTimeSelect
                                                                // dateFormat="Pp"
                                                                timeFormat="HH:mm"
                                                                placeholderText="Policy End Date & Time"
                                                                peekPreviousMonth
                                                                autoComplete="off"
                                                                peekPreviousYear
                                                                disabled={true}
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                // selected={values.pol_end_date}    
                                                                selected={values.pol_end_date}
                                                                onChange={(val) => {                                                            
                                                                    setFieldTouched('pol_end_date')
                                                                    setFieldValue('pol_end_date', val);
                                                                }}   
                                                                                       
                                                            />
                                                            {errors.pol_end_date && touched.pol_end_date ? (
                                                                <span className="errorMsg">{errors.pol_end_date}</span>
                                                            ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col>                                           
                                            </Row>
                                            <div className="brandhead"> 
                                                <h4 className="fs-18 m-b-30">RISK DETAILS</h4>
                                            </div>   
                                            <Row><Col sm={6} md={3} lg={3}>
                                                <FormGroup>
                                                <div className="insurerName">
                                                    <Field
                                                    name="house_flat_no"
                                                    type="text"
                                                    placeholder="House/Flat No."
                                                    autoComplete="off"
                                                    onFocus={(e) =>
                                                        this.changePlaceHoldClassAdd(e)
                                                    }
                                                    onBlur={(e) =>
                                                        this.changePlaceHoldClassRemove(e)
                                                    }
                                                    value={values.house_flat_no}
                                                    />
                                                    {errors.house_flat_no && touched.house_flat_no ? (
                                                    <span className="errorMsg">
                                                        {errors.house_flat_no}
                                                    </span>
                                                    ) : null}
                                                </div>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={6} md={3} lg={3}>
                                                <FormGroup>
                                                <div className="insurerName">
                                                    <Field
                                                    name="house_building_name"
                                                    type="text"
                                                    placeholder="House/Building Name"
                                                    autoComplete="off"
                                                    // onFocus={(e) =>
                                                    //   this.changePlaceHoldClassAdd(e)
                                                    // }
                                                    // onBlur={(e) =>
                                                    //   this.changePlaceHoldClassRemove(e)
                                                    // }
                                                    value={values.house_building_name}
                                                    />
                                                    {errors.house_building_name &&
                                                    touched.house_building_name ? (
                                                    <span className="errorMsg">
                                                        {errors.house_building_name}
                                                    </span>
                                                    ) : null}
                                                </div>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={6} md={3} lg={3}>
                                                <FormGroup>
                                                <div className="insurerName">
                                                    <Field
                                                    name="area_name"
                                                    type="text"
                                                    placeholder="Area Name"
                                                    autoComplete="off"
                                                    onFocus={(e) =>
                                                        this.changePlaceHoldClassAdd(e)
                                                    }
                                                    onBlur={(e) =>
                                                        this.changePlaceHoldClassRemove(e)
                                                    }
                                                    value={values.area_name}
                                                    />
                                                    {errors.area_name &&
                                                    touched.area_name ? (
                                                    <span className="errorMsg">
                                                        {errors.area_name}
                                                    </span>
                                                    ) : null}
                                                </div>
                                                </FormGroup>
                                            </Col>
                                            </Row>
                                            <Row>
                                            
                                            <Col sm={6} md={3} lg={3}>
                                                <FormGroup>
                                                <div className="insurerName">
                                                    <Field
                                                    name="pincode"
                                                    type="test"
                                                    placeholder="Pincode"
                                                    autoComplete="off"
                                                    maxLength="6"
                                                    onFocus={(e) =>
                                                        this.changePlaceHoldClassAdd(e)
                                                    }
                                                    onBlur={(e) =>
                                                        this.changePlaceHoldClassRemove(e)
                                                    }
                                                    onKeyUp={(e) => this.fetchAreadetails(e)}
                                                    value={values.pincode}
                                                    maxLength="6"
                                                    onInput={(e) => {}}
                                                    />
                                                    {errors.pincode && touched.pincode ? (
                                                    <span className="errorMsg">
                                                        {errors.pincode}
                                                    </span>
                                                    ) : null}
                                                </div>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={6} md={3} lg={3}>
                                                <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                    name="pincode_id"
                                                    component="select"
                                                    autoComplete="off"
                                                    value={values.pincode_id}
                                                    className="formGrp"
                                                    >
                                                    <option value="">Locality</option>
                                                    {pinDataArr &&
                                                        pinDataArr.length > 0 &&
                                                        pinDataArr.map((resource, rindex) => (
                                                        <option key= {rindex} value={resource.id}>
                                                            {
                                                            resource.LCLTY_SUBRB_TALUK_TEHSL_NM
                                                            }
                                                        </option>
                                                        ))}

                                                    {/*<option value="area2">Area 2</option>*/}
                                                    </Field>
                                                    {errors.pincode_id && touched.pincode_id ? (
                                                    <span className="errorMsg">
                                                        {errors.pincode_id}
                                                    </span>
                                                    ) : null}
                                                </div>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={6} md={3} lg={3}>
                                                <FormGroup>
                                                <div className="insurerName">
                                                    <Field
                                                    name="city"
                                                    type="text"
                                                    placeholder="City"
                                                    disabled = {true}
                                                    autoComplete="off"
                                                    onFocus={(e) =>
                                                        this.changePlaceHoldClassAdd(e)
                                                    }
                                                    onBlur={(e) =>
                                                        this.changePlaceHoldClassRemove(e)
                                                    }
                                                    value={cityName}
                                                    />
                                                    {errors.city && touched.city ? (
                                                    <span className="errorMsg">
                                                        {errors.city}
                                                    </span>
                                                    ) : null}
                                                </div>
                                                </FormGroup>
                                            </Col>
                                            </Row>
                                            
                                            <Row>                                            
                                            <Col sm={6} md={3} lg={3}>
                                                <FormGroup>
                                                <div className="insurerName">
                                                    <Field
                                                    name="state_name"
                                                    type="text"
                                                    placeholder="State"
                                                    autoComplete="off"
                                                    disabled = {true}
                                                    onFocus={(e) =>
                                                        this.changePlaceHoldClassAdd(e)
                                                    }
                                                    onBlur={(e) =>
                                                        this.changePlaceHoldClassRemove(e)
                                                    }
                                                    value={stateName}
                                                    />
                                                    {errors.state_name &&
                                                    touched.state_name ? (
                                                    <span className="errorMsg">
                                                        {errors.state_name}
                                                    </span>
                                                    ) : null}
                                                </div>
                                                </FormGroup>
                                            </Col>
                                            </Row>
                                            <div className="brandhead"> 
                                                <h4 className="fs-18 m-b-30">PLAN</h4>
                                            </div>                                            
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead"> 
                                                <h6><b>Please select a plan</b></h6>
                                                    <div className="d-inline-flex m-b-15">
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='plan_id'
                                                                    value='1'
                                                                    key='1'
                                                                    checked = {values.plan_id == '1' ? true : false}
                                                                    onChange = {(e) =>{
                                                                        setFieldTouched('plan_id')
                                                                        setFieldValue('plan_id', '1');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                        this.fetchCoveragePlan(e.target.value)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"><h7> Plan A</h7></span>
                                                            </label>
                                                        </div>
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='plan_id'
                                                                    value='2'
                                                                    key='1'
                                                                    checked = {values.plan_id == '2' ? true : false}
                                                                    onChange = {(e) =>{
                                                                        setFieldTouched('plan_id')
                                                                        setFieldValue('plan_id', '2');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                        this.fetchCoveragePlan(e.target.value)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"><h7> Plan B</h7></span>
                                                            </label>                         
                                                        </div>
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='plan_id'
                                                                    value='3'
                                                                    key='1'
                                                                    checked = {values.plan_id == '3' ? true : false}
                                                                    onChange = {(e) =>{
                                                                        setFieldTouched('plan_id')
                                                                        setFieldValue('plan_id', '3');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                        this.fetchCoveragePlan(e.target.value)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"><h7> Plan C</h7></span>
                                                            </label>
                                                            {errors.plan_id && touched.plan_id ? (
                                                                <span className="errorMsg">{errors.plan_id}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>                                               
                                            </div>
                                            <div className="brandhead"> 
                                                {this.handleCoverChange(values.plan_id)}
                                            </div>
                                            <div className="brandhead"> 
                                                <p>&nbsp;</p>
                                            </div>
                                            { serverResponse && serverResponse.QuotationNo ?
                                                <Row className="d-flex justify-content-left carloan m-b-25">
                                                    <Col sm={4}>
                                                    <div className="d-flex justify-content-between align-items-center premium m-b-25">
                                                        <p>Quotation No:</p>
                                                        <p><b> {serverResponse ? (serverResponse.message ? "---" : serverResponse.QuotationNo) : "---"}</b></p>
                                                    </div>
                                                    </Col>
                                                    <Col sm={4}>
                                                    <div className="d-flex justify-content-between align-items-center premium m-b-25">
                                                        <p>Total Premium:</p>
                                                        <p><strong>Rs: {serverResponse ? (serverResponse.message ? 0 : serverResponse.DuePremium) : 0}</strong></p>
                                                    </div>
                                                    </Col>
                                                </Row>
                                                : null}

                                            
                                            <div className="cntrbtn">
                                            {serverResponse && serverResponse != "" ? (serverResponse.message ?
                                                <Button className={`proceedBtn`} type="submit"  >
                                                Quote
                                                </Button> : <Button className={`proceedBtn`} type="submit"  >
                                                Go
                                                </Button>) : <Button className={`proceedBtn`} type="submit"  >
                                                Quote
                                                </Button>}                                    
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
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(SelectPlan_GSB));