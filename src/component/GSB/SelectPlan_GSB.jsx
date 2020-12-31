import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { setSmeRiskData,setSmeData,setSmeUpdateData,setSmeOthersDetailsData,setSmeProposerDetailsData } from "../../store/actions/sme_fire";
import { connect } from "react-redux";
import moment from "moment";
import * as Yup from 'yup';
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';

const minDate = moment().format();
// alert(new Date(minDate));
const maxDate = moment().add(14, 'day');
const maxDateEnd = moment().add(15, 'day').calendar();

const initialValues = {
    policy_type: '1',
    pol_start_date:null,
    pinDataArr: [],
    flat_no: "",
    city: "",
    building_name: "",
    area_name: "",
    state_name: "",
    pincode: "",
    pincode_id: "",
    policy_for: "",
    plan_for: ""

}

const vehicleRegistrationValidation = Yup.object().shape({
    pol_start_date: Yup.date().required("Please select both policy start date & time").nullable(),
    pol_end_date: Yup.date().required("Please select both policy end date & time").nullable(),
    building_name: Yup.string()
      .required("Please enter building name")
      .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
        return "Please enter valid building name";
      })
      .nullable(),
    // block_no: Yup.string().required("Please enter Plot number").nullable(),
    flat_no: Yup.string()
      .required("Please enter flat number")
      .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
        return "Please enter valid flat number";
      })
      .nullable(),
    city: Yup.string()
      .required("Please enter city")
      .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
        return "Please enter valid city";
      })
      .nullable(),
    area_name: Yup.string()
      .required("Please enter area name")
      .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
        return "Please enter valid area name";
      })
      .nullable(),
    state_name: Yup.string()
        .required("Please enter state")
        .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
          return "Please enter valid state";
        })
        .nullable(),
    pincode: Yup.string()
      .required("Pincode is required")
      .matches(/^[0-9]{6}$/, function () {
        return "Please enter valid 6 digit pin code";
      })
      .nullable(),
    pincode_id: Yup.string().required("Please select locality").nullable(),
    policy_for: Yup.string().required("Please select type of business").nullable(),
    plan_for: Yup.string().required("Please select a plan").nullable()
})


class SelectPlan_GSB extends Component {
    state = {
        motorInsurance:'',
        regno:'',
        length:14,
        fastlanelog: []
    }
   
     handleChange = date => {    
        // this.setState({ startDate: date });  
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
        console.log("product_id",this.props.match.params)

        // let encryption = new Encryption();
        // let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        // console.log('bc_data',JSON.parse(encryption.decrypt(bc_data)));
        
    }

    fetchData=()=>{
        const {productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo"):0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`sme/details/${policyHolder_id}`)
            .then(res=>{
                // let decryptResp = JSON.parse(encryption.decrypt(res.data))
                // console.log("decrypt", decryptResp)

                // let policyHolder = decryptResp.data.policyHolder.motorinsurance           
                // // let fastlanelog = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.fastlanelog : {};
                // this.setState({ 
                //     policyHolder
                // })
                this.props.loadingStop();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    fetchPolicyDetails=()=>{
        const { productId } = this.props.match.params;
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        axios
          .get(`/${policyHolder_refNo}`)
          .then((res) => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            let gsb_Details = decryptResp.data && decryptResp.data.policyHolder ? decryptResp.data.policyHolder : null;
            console.log("---gsb_Details--->>", gsb_Details);
            this.setState({
              gsb_Details
            });
            this.props.loadingStop();
          })
          .catch((err) => {
            // handle error
            this.props.loadingStop();
          });        
    }

    handleSubmit=(values, actions)=>{
        const {productId} = this.props.match.params;
        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {
            'menumaster_id': '5',
            'page_name': `SelectPlan_GSB/${productId}`,
            'vehicle_type_id': productId
        }

        if(sessionStorage.getItem('csc_id')) {
            post_data['bcmaster_id'] = '5'
            post_data['csc_id'] = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : ""
            post_data['agent_name']= sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : ""
            post_data['product_id'] = productId
        }else{
            let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
            if(bc_data) {
                bc_data = JSON.parse(encryption.decrypt(bc_data));
                post_data['bcmaster_id'] = bc_data ? bc_data.agent_id : ""
                post_data['bc_token'] = bc_data ? bc_data.token : ""
                post_data['bc_agent_id']= bc_data ? bc_data.user_info.data.user.username : ""
                post_data['product_id'] = productId
            }
        }

        let pol_start_date = moment(values.pol_start_date).format('YYYY-MM-DD HH:mm:ss')
        let pol_end_date = moment(values.pol_end_date).format('YYYY-MM-DD hh:mm:ss')

        post_data['pol_start_date'] = pol_start_date
        post_data['pol_end_date'] = pol_end_date

        this.props.loadingStart();
        
        if(this.props.policy_holder_id != null){
            post_data['policy_holder_id'] = this.props.policy_holder_id
            formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))

            axios.post('',
            formData
            ).then(res=>{
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                // console.log('decryptResp-----', decryptResp)
                if (decryptResp.error === false )
                {
                this.props.loadingStop();
                this.props.setDataUpdate({
                    start_date:values.pol_start_date,
                    end_date:values.pol_end_date
                });
                this.props.history.push(`/RiskDetails/${productId}`);
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
        }else{
            formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
            axios.post('',
            formData
            ).then(res=>{     
                let decryptResp = JSON.parse(encryption.decrypt(res.data));   
                localStorage.setItem('policy_holder_ref_no',decryptResp.data.policyHolder_refNo);
                this.props.loadingStop();
                this.props.setData({
                    start_date:values.pol_start_date,
                    end_date:values.pol_end_date,
                    
                    policy_holder_id:decryptResp.data.policyHolder_id,
                    policy_holder_ref_no:decryptResp.data.policyHolder_refNo,
                    request_data_id:decryptResp.data.request_data_id,
                    completed_step:decryptResp.data.completedStep,
                    menumaster_id:decryptResp.data.menumaster_id
                });
                this.props.history.push(`/RiskDetails/${productId}`);
            }).
            catch(err=>{
                this.props.loadingStop();
                actions.setSubmitting(false);
            })
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
                this.setState({
                  pinDataArr: res.data.data,
                  stateName,
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
    
      fetchAreadetailsBack = (pincode_input) => {
        let pinCode = pincode_input.toString();
    
        if (pinCode != null && pinCode != "" && pinCode.length == 6) {
          console.log("fetchAreadetailsBack pinCode", pinCode);
          const formData = new FormData();
          this.props.loadingStart();
          // let encryption = new Encryption();
          const post_data_obj = {
            pincode: pinCode,
          };
          // formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
          formData.append("pincode", pinCode);
          axios
            .post("pincode-details", formData)
            .then((res) => {
              let stateName =
                res.data.data &&
                res.data.data[0] &&
                res.data.data[0].pinstate.STATE_NM
                  ? res.data.data[0].pinstate.STATE_NM
                  : "";
              this.setState({
                pinDataArr: res.data.data,
                stateName,
              });
              this.props.loadingStop();
            })
            .catch((err) => {
              this.props.loadingStop();
            });
        }
      };
    

    render() {
        const {pinDataArr} = this.state
        const newInitialValues = Object.assign(initialValues,{
            pol_start_date:this.props.start_date != null? new Date(this.props.start_date): null,
            pol_end_date:this.props.end_date != null? new Date(this.props.end_date): null,
            flat_no: "",
            city: "",
            building_name: "",
            area_name: "",
            state_name: "",
            pincode: "",
            pincode_id: "",
            policy_for: "",
            plan_for: ""
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
                                        onSubmit={this.handleSubmit} 
                                        validationSchema={vehicleRegistrationValidation}
                                        >
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                            // console.log('values',values)
                                            
                                        return (
                                            <Form>    
                                                {/* {console.log('pol_start_date',values.pol_start_date)}                                                                                
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead">
                                                </div>
                                            </div> */}
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
                                                                <span className="checkmark " /><span className="fs-14"><h7> New</h7></span>
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
                                                                <span className="checkmark " /><span className="fs-14"><h7> SBIG Renewal</h7></span>
                                                            </label>
                                                            {errors.policy_for && touched.policy_for ? (
                                                                <span className="errorMsg">{errors.policy_for}</span>
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
                                                                // showTimeSelect
                                                                // timeFormat="p"
                                                                timeFormat="HH:mm"
                                                                // timeIntervals={15}
                                                                placeholderText="Policy Start Date & Time"
                                                                peekPreviousMonth
                                                                autoComplete="off"
                                                                peekPreviousYear
                                                                // showMonthDropdown
                                                                // showYearDropdown
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
                                                                minDate={new Date(values.pol_start_date)}
                                                                maxDate={new Date(maxDate)}
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
                                                    name="flat_no"
                                                    type="text"
                                                    placeholder="House/Flat No."
                                                    autoComplete="off"
                                                    onFocus={(e) =>
                                                        this.changePlaceHoldClassAdd(e)
                                                    }
                                                    onBlur={(e) =>
                                                        this.changePlaceHoldClassRemove(e)
                                                    }
                                                    value={values.flat_no}
                                                    />
                                                    {errors.flat_no && touched.flat_no ? (
                                                    <span className="errorMsg">
                                                        {errors.flat_no}
                                                    </span>
                                                    ) : null}
                                                </div>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={6} md={3} lg={3}>
                                                <FormGroup>
                                                <div className="insurerName">
                                                    <Field
                                                    name="building_name"
                                                    type="text"
                                                    placeholder="House/Building Name"
                                                    autoComplete="off"
                                                    // onFocus={(e) =>
                                                    //   this.changePlaceHoldClassAdd(e)
                                                    // }
                                                    // onBlur={(e) =>
                                                    //   this.changePlaceHoldClassRemove(e)
                                                    // }
                                                    value={values.building_name}
                                                    />
                                                    {errors.building_name &&
                                                    touched.building_name ? (
                                                    <span className="errorMsg">
                                                        {errors.building_name}
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
                                                    autoComplete="off"
                                                    onFocus={(e) =>
                                                        this.changePlaceHoldClassAdd(e)
                                                    }
                                                    onBlur={(e) =>
                                                        this.changePlaceHoldClassRemove(e)
                                                    }
                                                    value={values.city}
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
                                                    onFocus={(e) =>
                                                        this.changePlaceHoldClassAdd(e)
                                                    }
                                                    onBlur={(e) =>
                                                        this.changePlaceHoldClassRemove(e)
                                                    }
                                                    value={values.state_name}
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
                                                                    name='plan_for'
                                                                    value='1'
                                                                    key='1'
                                                                    checked = {values.plan_for == '1' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('plan_for')
                                                                        setFieldValue('plan_for', '1');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
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
                                                                    name='plan_for'
                                                                    value='2'
                                                                    key='1'
                                                                    checked = {values.plan_for == '2' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('plan_for')
                                                                        setFieldValue('plan_for', '2');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"><h7> Plan B</h7></span>
                                                            </label>
                                                            {errors.plan_for && touched.plan_for ? (
                                                                <span className="errorMsg">{errors.plan_for}</span>
                                                            ) : null}
                                                        </div>
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='plan_for'
                                                                    value='3'
                                                                    key='1'
                                                                    checked = {values.plan_for == '3' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('plan_for')
                                                                        setFieldValue('plan_for', '3');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"><h7> Plan C</h7></span>
                                                            </label>
                                                            {/* {errors.plan_for && touched.plan_for ? (
                                                                <span className="errorMsg">{errors.plan_for}</span>
                                                            ) : null} */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                            <div className="brandhead"> 
                                                <p>&nbsp;</p>
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