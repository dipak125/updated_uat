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
import Encryption from '../../shared/payload-encryption';
import {  PersonAge } from "../../shared/dateFunctions";


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

const vehicleRegistrationValidation = Yup.object().shape({
    house_building_name: Yup.string().required("Please enter building name"),
    block_no: Yup.string().required("Please enter block no."),
    house_flat_no: Yup.string().required("Please enter house/flat no."),
    pincode: Yup.string().required('Pincode is required')
    .matches(/^[0-9]{6}$/, function() {
        return "Please enter valid pin code"
    }),
    pincode_id: Yup.string().required("Please select area"),
    buildings_sum_insured: Yup.string().required("Please enter building sum insured"),
    content_sum_insured: Yup.string().required("Please enter content sum insured"),
    stock_sum_insured: Yup.string().required("Please enter stock sum insured"),
})



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
    
    handleSubmit=(values)=>{
        console.log('handleSubmit', values);
        // console.log("policyHolder_id-------->",policyHolder_id)
        const formData = new FormData();
        
        formData.append('policy_holder_id','3229')
        formData.append('menumaster_id','5')
        formData.append('street_name','NH-34')
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
        this.props.loadingStart();
        axios.post('sme/policy-details',
        formData
        ).then(res=>{       
            console.log('res', res)
            this.props.loadingStop();
            const {productId} = this.props.match.params;
            this.props.history.push(`/OtherDetails/${productId}`);
        }).
        catch(err=>{
            this.props.loadingStop();
        })
        
    }

    componentDidMount() {
        // this.getInsurerList();
        this.fetchData();
        
    }
    Registration_SME = (productId) => {
        this.props.history.push(`/Registration_SME/${productId}`);
    }

    render() {
        const {productId} = this.props.match.params  
        const {insurerList, showClaim, previous_is_claim, motorInsurance, previousPolicy,
            stateName,pinDataArr,CustomerID,suggestions, vehicleDetails, RTO_location} = this.state

        let newInitialValues = Object.assign(initialValue);

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
                                                <Row>
                                                    {/* <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='gender'
                                                                component="select"
                                                                autoComplete="off"                                                                        
                                                                className="formGrp"
                                                            >
                                                            <option value="">Shops dealing with hazardous goods</option>
                                                                <option value="m">Male</option>
                                                                <option value="f">Female</option>
                                                            </Field>     
                                                            {errors.gender && touched.gender ? (
                                                            <span className="errorMsg">{errors.gender}</span>
                                                            ) : null}              
                                                            </div>
                                                        </FormGroup>
                                                    </Col> */}
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='house_building_name'
                                                                type="text"
                                                                placeholder="House/Building Name"
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
                                                <Row>  
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
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='buildings_sum_insured'
                                                                type="text"
                                                                placeholder="Fire-Building-Sum Insured"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.buildings_sum_insured}                                                                            
                                                            />
                                                            {errors.buildings_sum_insured && touched.buildings_sum_insured ? (
                                                            <span className="errorMsg">{errors.buildings_sum_insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="content_sum_insured"
                                                                type="text"
                                                                placeholder="Fire-Contents Sum Insured"
                                                                autoComplete="off"
                                                                // maxlength = "6"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                onKeyUp={e=> this.fetchAreadetails(e)}
                                                                value={values.content_sum_insured}
                                                                maxLength="6"
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
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='stock_sum_insured'
                                                                type="text"
                                                                placeholder="Fire-Stock Sum Insured"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.stock_sum_insured}                                                                            
                                                            />
                                                            {errors.stock_sum_insured && touched.stock_sum_insured ? (
                                                            <span className="errorMsg">{errors.stock_sum_insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                         
                                                </Row>

                                                <div className="brandhead"> 
                                                    <p>&nbsp;</p>
                                                </div>
                                            
                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.Registration_SME.bind(this,productId)} >
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
      loading: state.loader.loading
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop())
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(RiskDetails));