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
import { setSmeRiskData,setSmeData,setSmeOthersDetailsData,setSmeProposerDetailsData } from '../../store/actions/sme_fire';


//const ageObj = new PersonAge();
// const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
// const maxDate = moment(minDate).add(30, 'day').calendar();
//const minDate = moment(moment().subtract(20, 'years').calendar()).add(1, 'day').calendar();
const maxDate = moment().subtract(1, 'day');
const minDate = moment().subtract(10, 'years');
let endMinDate = moment();
//const startRegnDate = moment().subtract(20, 'years').calendar();
//const minRegnDate = moment(startRegnDate).startOf('year').format('YYYY-MM-DD hh:mm');
//const maxRegnDate = new Date();

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
    previous_policy_no: ""
}
const vehicleRegistrationValidation = Yup.object().shape({
    previous_start_date : Yup.date().required("Please select previous policy start date").nullable(),
    previous_end_date : Yup.date().required("Please select previous policy end date").nullable(),
    Previous_Policy_No : Yup.string().required("Please select previous policy number").nullable(),
    insurance_company_id : Yup.number().required("Please select insurance company name").nullable(),
    // previous_city : Yup.string().required("Please select policy start date").nullable()
});



class OtherDetails extends Component {

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
        disable_end_date:true
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
    //     this.props.history.push(`/AdditionalDetails_SME/${productId}`);
      
    // }

    handleSubmit=(values)=>{
        const formData = new FormData();
        let previous_start_date = moment(values.previous_start_date).format('YYYY-MM-DD')
        let previous_end_date = moment(values.previous_end_date).format('YYYY-MM-DD')

        formData.append('policy_holder_id',this.props.policy_holder_id)
        formData.append('menumaster_id',this.props.menumaster_id)
        
        formData.append('previous_start_date', previous_start_date)
        formData.append('previous_end_date',previous_end_date)


        formData.append('previous_policy_no',values.Previous_Policy_No)
        formData.append('insurance_company_id',values.insurance_company_id)
        // values.insurance_company_id
        formData.append('address',"kolkata")
        // values.previous_city

        this.props.loadingStart();

        axios.post('sme/previous-policy-details',
        formData
        ).then(res=>{       
 
            this.props.loadingStop();
            this.props.setSmeOthersDetails({
                
                previous_start_date:values.previous_start_date,
                previous_end_date:values.previous_end_date,
                Previous_Policy_No:values.Previous_Policy_No,
                insurance_company_id:values.insurance_company_id,
                previous_city:values.previous_city

            });
            const {productId} = this.props.match.params;
            this.props.history.push(`/AdditionalDetails_SME/${productId}`);
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
        this.props.loadingStart();
        axios.get(`sme/details/${this.props.policy_holder_ref_no}`)
        .then(res => {
            console.log('fetch_data',res.data.data); 
            this.props.loadingStop();
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })
    }

    fetchInsurance = () => {
        // this.props.loaderStart();
        axios.get('company')
        .then(res => {
            console.log('fetch_data_insurance',res);
            this.setState({insurerList:res.data.data});
            this.props.loadingStop();
        })
        .catch(err => {
            this.props.loadingStop();
        })
    }

    fetchPolicyDetails=()=>{
        let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no"):0;
        console.log('this.props.policy_holder_ref_no',this.props.policy_holder_ref_no);

        if(this.props.policy_holder_ref_no == null && policy_holder_ref_no != ''){
            
            this.props.loadingStart();
            axios.get(`sme/details/${policy_holder_ref_no}`)
            .then(res=>{
                
                if(res.data.data.policyHolder.step_no > 0){

                    this.props.setData({
                        start_date:res.data.data.policyHolder.request_data.start_date,
                        end_date:res.data.data.policyHolder.request_data.end_date,
                        
                        policy_holder_id:res.data.data.policyHolder.id,
                        policy_holder_ref_no:policy_holder_ref_no,
                        request_data_id:res.data.data.policyHolder.request_data.id,
                        completed_step:res.data.data.policyHolder.step_no,
                        menumaster_id:res.data.data.policyHolder.menumaster_id
                    });
                
                }

                if(res.data.data.policyHolder.step_no == 1 || res.data.data.policyHolder.step_no > 1){

                    let risk_arr = JSON.parse(res.data.data.policyHolder.smeinfo.risk_address);

                    this.props.setRiskData(
                        {
                            house_building_name:risk_arr.house_building_name,
                            block_no:risk_arr.block_no,
                            street_name:risk_arr.street_name,
                            plot_no:risk_arr.plot_no,
                            house_flat_no:risk_arr.house_flat_no,
                            pincode:res.data.data.policyHolder.smeinfo.pincode,
                            pincode_id:res.data.data.policyHolder.smeinfo.pincode_id,

                            buildings_sum_insured:res.data.data.policyHolder.smeinfo.buildings_sum_insured,
                            content_sum_insured:res.data.data.policyHolder.smeinfo.content_sum_insured,
                            stock_sum_insured:res.data.data.policyHolder.smeinfo.stock_sum_insured
                        }
                    );

                }

                if(res.data.data.policyHolder.step_no == 2 || res.data.data.policyHolder.step_no > 2){

                    this.props.setSmeOthersDetails({
                    
                        previous_start_date:res.data.data.policyHolder.previouspolicy.start_date,
                        previous_end_date:res.data.data.policyHolder.previouspolicy.end_date,
                        Previous_Policy_No:res.data.data.policyHolder.previouspolicy.policy_no,
                        insurance_company_id:res.data.data.policyHolder.previouspolicy.insurancecompany_id,
                        previous_city:res.data.data.policyHolder.previouspolicy.address
        
                    });
                }

                if(res.data.data.policyHolder.step_no == 3 || res.data.data.policyHolder.step_no > 3){
                    
                    let address = '';
                    if(res.data.data.policyHolder.address == null){
                        
                    }else{
                        address = JSON.parse(res.data.data.policyHolder.address);

                        this.props.setSmeProposerDetails(
                            {
                                first_name:res.data.data.policyHolder.first_name,
                                last_name:res.data.data.policyHolder.last_name,
                                salutation_id:res.data.data.policyHolder.salutation_id,
                                date_of_birth:res.data.data.policyHolder.dob,
                                email_id:res.data.data.policyHolder.email_id,
                                mobile:res.data.data.policyHolder.mobile,
                                gender:res.data.data.policyHolder.gender,
                                pan_no:res.data.data.policyHolder.pancard,
                                gstn_no:res.data.data.policyHolder.gstn_no,

                                com_street_name:address.street_name,
                                com_plot_no:address.plot_no,
                                com_building_name:address.house_building_name,
                                com_block_no:address.block_no,
                                com_house_flat_no:address.house_flat_no,
                                com_pincode:res.data.data.policyHolder.pincode,
                                com_pincode_id:res.data.data.policyHolder.pincode_id
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

    componentDidMount() {
        this.fetchPolicyDetails();
        this.fetchInsurance();
        
    }
    RiskDetails = (productId) => {
        this.props.history.push(`/RiskDetails/${productId}`);
    }

    render() {
        const {productId} = this.props.match.params  
        const {insurerList, showClaim, previous_is_claim, motorInsurance, previousPolicy,
            CustomerID,suggestions, vehicleDetails, RTO_location} = this.state

        let newInitialValues = Object.assign(initialValue,{
            previous_start_date:this.props.previous_start_date != null?new Date(this.props.previous_start_date):this.props.previous_start_date,
            previous_end_date:this.props.previous_end_date != null?new Date(this.props.previous_end_date):this.props.previous_end_date,
            Previous_Policy_No:this.props.Previous_Policy_No,
            insurance_company_id:this.props.insurance_company_id,
            previous_city:this.props.previous_city
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
                                                        <h4 >COVERAGE DETAILS: &nbsp;&nbsp;&nbsp; SECTION 2 - BURGLARY</h4>
                                                    </div>
                                                </div>   
                                                <Row>  
                                                   
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='Contents_Sum_Insured'
                                                                type="text"
                                                                placeholder="Contents Sum Insured"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {this.props.content_sum_insured}     
                                                                disabled={true}                                                                       
                                                            />
                                                            {errors.Contents_Sum_Insured && touched.Contents_Sum_Insured ? (
                                                            <span className="errorMsg">{errors.Contents_Sum_Insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='Stocks_Sum_Insured'
                                                                type="text"
                                                                placeholder="Stocks Sum Insured"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {this.props.stock_sum_insured}
                                                                disabled={true}                                                                              
                                                            />
                                                            {errors.Stocks_Sum_Insured && touched.Stocks_Sum_Insured ? (
                                                            <span className="errorMsg">{errors.Stocks_Sum_Insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                    
                                                </Row>
                                            </Col>
                                        </Row>

                                        <div className="brandhead"> 
                                            <p>&nbsp;</p>
                                        </div>
                                    
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>
                                                <div className="d-flex justify-content-left">
                                                    <div className="brandhead">
                                                        <h4>Commercial consideration in %</h4>
                                                    </div>
                                                </div>   
                                                <Row> 
                                                    {/* <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name="Cost_of_sale"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.Cost_of_sale}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Cost of sale</option>

                                                                </Field>     
                                                                {errors.Cost_of_sale && touched.Cost_of_sale ? (
                                                                    <span className="errorMsg">{errors.Cost_of_sale}</span>
                                                                ) : null}     
                                                            </div>
                                                        </FormGroup>   
                                                    </Col> */}
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='Commercial_consideration'
                                                                type="text"
                                                                placeholder="Commercial consideration in %"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {5}
                                                                // disabled={true}                                                                       
                                                            />
                                                            {errors.Commercial_consideration && touched.Commercial_consideration ? (
                                                            <span className="errorMsg">{errors.Commercial_consideration}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    {/* <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='Loan_Account_Number'
                                                                type="text"
                                                                placeholder="Loan Account Number"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.Loan_Account_Number}                                                                            
                                                            />
                                                            {errors.Loan_Account_Number && touched.Loan_Account_Number ? (
                                                            <span className="errorMsg">{errors.Loan_Account_Number}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                 */}
                                                </Row> 
                                            </Col>
                                        </Row> 

                                        <div className="brandhead"> 
                                            <p>&nbsp;</p>
                                        </div>
                                    
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>
                                                <div className="d-flex justify-content-left">
                                                    <div className="brandhead">
                                                        <h4 >PREVIOUS INSURANCE DETAILS</h4>
                                                    </div>
                                                </div>   
                                                <Row>
                                                    <Col sm={12} md={11} lg={4}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="previous_start_date"
                                                                minDate={new Date(minDate)}
                                                                maxDate={new Date(maxDate)}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="policy start date"
                                                                autoComplete="off"
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.previous_start_date}
                                                                onChange={(val) => {
                                                                    //setFieldTouched('previous_start_date')
                                                                    setFieldValue('previous_start_date', val);
                                                                    setFieldValue('previous_end_date', new Date(moment(val).add(364, 'day').calendar()));
                                                                    //this.setState({disable_end_date:false});
                                                                    //endMinDate = moment(val).add(364, 'day');
                                                                }}
                                                            />
                                                            {errors.previous_start_date && touched.previous_start_date ? (
                                                                <span className="errorMsg">{errors.previous_start_date}</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={11} lg={4}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="previous_end_date"
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Policy end date"
                                                                disabled = {this.state.disable_end_date}
                                                                minDate={new Date(endMinDate)}
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.previous_end_date}
                                                                onChange={(val) => {
                                                                    setFieldTouched('previous_end_date');
                                                                    setFieldValue('previous_end_date', val);
                                                                }}
                                                            />
                                                            {errors.previous_end_date && touched.previous_end_date ? (
                                                                <span className="errorMsg">{errors.previous_end_date}</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={5} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="Previous_Policy_No"
                                                                    type="text"
                                                                    placeholder="Previous Policy No"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}   
                                                                />
                                                                {errors.Previous_Policy_No && touched.Previous_Policy_No ? (
                                                                    <span className="errorMsg">{errors.Previous_Policy_No}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>  
                                                </Row>

                                                <Row>                                                  
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='insurance_company_id'
                                                                component="select"
                                                                autoComplete="off"                                                                        
                                                                className="formGrp"
                                                            >
                                                                <option value="">Previous Insurance</option>
                                                                {insurerList.map((insurer, qIndex) => ( 
                                                                    <option value= {insurer.Id}>{insurer.name}</option>
                                                                ))}
                                                            </Field>     
                                                            {errors.insurance_company_id && touched.insurance_company_id ? (
                                                            <span className="errorMsg">{errors.insurance_company_id}</span>
                                                            ) : null}          
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={5} lg={5}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="previous_city"
                                                                    type="text"
                                                                    placeholder="Insurance Company Address"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}     
                                                                />
                                                                {errors.previous_city && touched.previous_city ? (
                                                                    <span className="errorMsg">{errors.previous_city}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>                    
                                            </Col>  
                                        </Row>
                                                
                                        <div className="brandhead"> 
                                            <p>&nbsp;</p>
                                        </div>
                                    
                                        <div className="d-flex justify-content-left resmb">
                                        <Button className={`backBtn`} type="button"  onClick= {this.RiskDetails.bind(this,productId)} >
                                            {isSubmitting ? 'Wait..' : 'Back'}
                                        </Button> 
                                        <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                            {isSubmitting ? 'Wait..' : 'Next'}
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


      previous_start_date:state.sme_fire.previous_start_date,
      previous_end_date:state.sme_fire.previous_end_date,
      Previous_Policy_No:state.sme_fire.Previous_Policy_No,
      insurance_company_id:state.sme_fire.insurance_company_id,
      previous_city:state.sme_fire.previous_city,

      policy_holder_id: state.sme_fire.policy_holder_id,
      policy_holder_ref_no:state.sme_fire.policy_holder_ref_no,
      request_data_id:state.sme_fire.request_data_id,
      completed_step:state.sme_fire.completed_step,
      menumaster_id:state.sme_fire.menumaster_id,


      content_sum_insured: state.sme_fire.content_sum_insured,
      stock_sum_insured: state.sme_fire.stock_sum_insured

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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(OtherDetails));