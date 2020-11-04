import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { setSmeData,setSmeUpdateData } from "../../store/actions/sme_fire";
import { connect } from "react-redux";
import moment from "moment";
import * as Yup from 'yup';
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';

const minDate = moment(moment().subtract(20, 'years').calendar()).add(1, 'day').calendar();
const maxDate = moment(moment().subtract(1, 'years').calendar()).add(30, 'day').calendar();

const initialValues = {
    policy_type: '1',
    pol_start_date:null
}

const vehicleRegistrationValidation = Yup.object().shape({
    pol_start_date: Yup.date().required("Please select policy start date").nullable(),
    pol_end_date: Yup.date().required("Please select policy end date").nullable(),
})


class Registration_sme extends Component {
    state = {
        motorInsurance:'',
        regno:'',
        length:14,
        fastlanelog: []
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
    this.fetchData();
    
}

fetchData=()=>{
    const {productId } = this.props.match.params
    // console.log("productid------",productId)
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

    handleSubmit=(values)=>{
        const {productId} = this.props.match.params;
        // let encryption = new Encryption();
        console.log('handleSubmit', values);
        const formData = new FormData();
        formData.append('menumaster_id','5')
        formData.append('bcmaster_id','1')
        formData.append('vehicle_type_id','9')
        let pol_start_date = moment(values.pol_start_date).format('YYYY-MM-DD HH:mm:ss')
        let pol_end_date = moment(values.pol_end_date).format('YYYY-MM-DD HH:mm:ss')
        formData.append('pol_start_date', pol_start_date)
        formData.append('pol_end_date',pol_end_date)
        this.props.loadingStart();

        if(this.props.policy_holder_id != null){
            formData.append('policy_holder_id',this.props.policy_holder_id);
            axios.post('sme/update-policy-info',
            formData
            ).then(res=>{       
                console.log('res', res.data.data.policyHolder_id)
                // localStorage.setItem(res.data.data.policyHolder_id)
                // this.props.loadingStop();
                // let decrypryption.decrypt(res.data))
                // console.log("decrypt", decryptResp)

                // if(decryptResp.error == false) {
                //     this.props.history.push(`/RiskDetails/${productId}`);
                // }
                // else{
                //     // swal(decryptResp.msg)
                // }   
                this.props.loadingStop();
                this.props.setDataUpdate({
                    start_date:values.pol_start_date,
                    end_date:values.pol_end_date
                });
                const {productId} = this.props.match.params;
                this.props.history.push(`/RiskDetails/${productId}`);
            }).
            catch(err=>{
                // let decryptErr = JSON.parse(encryption.decrypt(err.data));
                // console.log('decryptResp--err---', decryptErr)
                // if(decryptErr && err.data){
                //     swal('Registration number required...');
                // }
            this.props.loadingStop();
            })
        }else{
            axios.post('sme/policy-info',
            formData
            ).then(res=>{       
                console.log('res', res.data.data.policyHolder_id)
                // localStorage.setItem(res.data.data.policyHolder_id)
                // this.props.loadingStop();
                // let decrypryption.decrypt(res.data))
                // console.log("decrypt", decryptResp)

                // if(decryptResp.error == false) {
                //     this.props.history.push(`/RiskDetails/${productId}`);
                // }
                // else{
                //     // swal(decryptResp.msg)
                // }   
                this.props.loadingStop();
                this.props.setData({
                    start_date:values.pol_start_date,
                    end_date:values.pol_end_date,
                    
                    policy_holder_id:res.data.data.policyHolder_id,
                    policy_holder_ref_no:res.data.data.policyHolder_refNo,
                    request_data_id:res.data.data.request_data_id,
                    completed_step:res.data.data.completedStep,
                    menumaster_id:res.data.data.menumaster_id
                });
                const {productId} = this.props.match.params;
                this.props.history.push(`/RiskDetails/${productId}`);
            }).
            catch(err=>{
                // let decryptErr = JSON.parse(encryption.decrypt(err.data));
                // console.log('decryptResp--err---', decryptErr)
                // if(decryptErr && err.data){
                //     swal('Registration number required...');
                // }
            this.props.loadingStop();
            })
        }
    }


    render() {
        const {motorInsurance} = this.state
        const newInitialValues = Object.assign(initialValues,{
            pol_start_date:this.props.start_date != null?new Date(this.props.start_date):this.props.start_date,
            pol_end_date:this.props.end_date != null?new Date(this.props.end_date):this.props.end_date
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
                                <h4 className="text-center mt-3 mb-3">SME Pre UW </h4>
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
                                                {console.log('pol_start_date',values.pol_start_date)}                                                                                
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead"> 
                                                    {/* <h4 className="fs-18 m-b-30">Tell us about your policy details</h4> */}

                                                    {/* <div className="d-inline-flex m-b-15">
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
                                                                        //this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> New Policy</span>
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
                                                                        // this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> Roll Over</span>
                                                            </label>
                                                            {errors.policy_type && touched.policy_type ? (
                                                                    <span className="errorMsg">{errors.policy_type}</span>
                                                                ) : null}
                                                        </div>
                                                    </div> */}
                                                </div>
                                            </div>
                                            {/* <div className="row formSection">
                                                <label className="col-md-4">Sub Product:</label>
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
                                                            <option value="1">SME – Fire Pre UW</option>       
                                                
                                                        </Field>
                                                        {errors.subclass_id && touched.subclass_id ? (
                                                            <span className="errorMsg">{errors.subclass_id}</span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div> */}
                                            <div className="brandhead"> 
                                                <h4 className="fs-18 m-b-30">POLICY INFORMATION</h4>
                                            </div>
                                            {/* <Row>
                                                <Col sm={12} md={11} lg={4}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                            <DatePicker
                                                                name="previous_start_date"
                                                                minDate={new Date(minDate)}
                                                                maxDate={new Date(maxDate)}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Policy start date"
                                                                peekPreviousMonth
                                                                autoComplete="off"
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.previous_start_date}                              
                                                            />
                                                            {errors.previous_start_date && touched.previous_start_date ? (
                                                                <span className="errorMsg">{errors.previous_start_date}</span>
                                                            ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col>

                                                <Col sm={12} md={11} lg={4}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                            <DatePicker
                                                                name="previous_start_date"
                                                                minDate={new Date(minDate)}
                                                                maxDate={new Date(maxDate)}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Policy start time"
                                                                peekPreviousMonth
                                                                autoComplete="off"
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.previous_start_date}                              
                                                            />
                                                            {errors.previous_start_date && touched.previous_start_date ? (
                                                                <span className="errorMsg">{errors.previous_start_date}</span>
                                                            ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col>                                           
                                            </Row> */}
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
                                                                dateFormat="Pp"
                                                                showTimeSelect
                                                                placeholderText="Policy Start Date & Time"
                                                                peekPreviousMonth
                                                                autoComplete="off"
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.pol_start_date}    
                                                                onChange={(val) => {                                                                   
                                                                    setFieldTouched('pol_start_date')
                                                                    setFieldValue('pol_start_date', val);
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
                                                                showTimeSelect
                                                                dateFormat="Pp"
                                                                placeholderText="Policy End Date & Time"
                                                                peekPreviousMonth
                                                                autoComplete="off"
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
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
      start_date: state.sme_fire.start_date,
      end_date: state.sme_fire.end_date,
      policy_holder_id: state.sme_fire.policy_holder_id
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop()),
      setData:(data) => dispatch(setSmeData(data)),
      setDataUpdate:(data) => dispatch(setSmeUpdateData(data))
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Registration_sme));