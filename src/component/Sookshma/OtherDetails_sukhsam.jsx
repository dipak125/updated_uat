import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip,Label } from 'react-bootstrap';
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


//const ageObj = new PersonAge();
// const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
// const maxDate = moment(minDate).add(30, 'day').calendar();
//const minDate = moment(moment().subtract(20, 'years').calendar()).add(1, 'day').calendar();
const maxDate = moment().subtract(1, 'years');
const minDate = moment().subtract(2, 'years');
let endMinDate = moment();
//const startRegnDate = moment().subtract(20, 'years').calendar();
//const minRegnDate = moment(startRegnDate).startOf('year').format('YYYY-MM-DD hh:mm');
//const maxRegnDate = new Date();

const initialValue = {
    registration_date: "",
    location_id:"",
    previous_is_claim:"",
    financial_party: "",
    financial_modgaged: "",
    financer_name: ""
    // Commercial_consideration: "",
} 

// VALIDATION :---------------------------------
const vehicleRegistrationValidation = 
Yup.object().shape({

Commercial_consideration : Yup.string().matches(/^[0-9]*$/, function() {
    return "Please enter commercial consideration % in number"
}).nullable(),

financial_party : Yup.string().required("This field is required").nullable(),

financial_modgaged : Yup.string().when(['financial_party'], {
    is: financial_party => financial_party == '1',       
    then: Yup.string().required("This field is required").nullable(),
    otherwise: Yup.string().nullable()}),

financer_name : Yup.string().when(['financial_party'], {
    is: financial_party => financial_party == '1',       
    then: Yup.string().required("This field is required")
            .matches(/^[a-zA-Z]+([\s]?[a-zA-Z])*$/, function() {
                return "Invalid Name"
            }).nullable(),
    otherwise: Yup.string().nullable()}),
    
})



class OtherDetails_sukhsam extends Component {

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
        disable_end_date:true,
        // previous_policy_check:'0'
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
    

    handleSubmit=(values, actions)=>{
        const {productId} = this.props.match.params 
        const formData = new FormData();
        let previous_start_date = values.previous_start_date == "" ? null : moment(values.previous_start_date).format('YYYY-MM-DD 00:00:00')
        let previous_end_date = values.previous_end_date == "" ? null : moment(values.previous_end_date).format('YYYY-MM-DD 23:59:00')
        let previous_Policy_No = values.Previous_Policy_No == '' ? null : values.Previous_Policy_No
        let insurance_company_id = values.insurance_company_id == '' ? null : values.insurance_company_id
        let encryption = new Encryption();

        let post_data = {
            'menumaster_id': this.props.menumaster_id,
            'page_name': `OtherDetails_Sookshma/${productId}`,
            'policy_holder_id': this.props.policy_holder_id,
            'Commercial_consideration':'5',
            'financial_party': values.financial_party,
            'is_claim': 0,
            'financial_modgaged' : values.financial_modgaged,
            'financer_name': values.financer_name
        }
        console.log("Post Data------------- ", post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        axios.post('sookshama/previous-policy-details',
        formData
        ).then(res=>{       
 
            this.props.loadingStop();
            this.props.setSmeOthersDetails({
                
                Commercial_consideration:'5',
                insurance_company_id:values.insurance_company_id,
                financial_party: values.financial_party,
                is_claim: 0,
                financial_modgaged : values.financial_modgaged,
                financer_name: values.financer_name

            });
            
            let formDataNew = new FormData(); 
            let post_data_new = {
                'id': this.props.policy_holder_id,
                'menumaster_id': this.props.menumaster_id,
                'page_name': `OtherDetails_Sookshma/${productId}`,
    
            }
            formDataNew.append('enc_data',encryption.encrypt(JSON.stringify(post_data_new)))
            
            this.props.loadingStart();
            axios.post('/sookshama/quote',
            formDataNew
            ).then(res=>{
                // let decryptResp = JSON.parse(encryption.decrypt(res.data));
                let decryptResp = res.data;
                console.log("decryptResp-------->",decryptResp)
                this.props.history.push(`/Summary_Sookshma/${productId}`);
                
                }).
            catch(err=>{
                this.props.loadingStop();
                let decryptResp = JSON.parse(encryption.decrypt(err.data));
                // let decryptResp = err.data;
                console.log("decryptErr -------->",decryptResp)
                actions.setSubmitting(false);
            });
        }).
        catch(err=>{
            let decryptErr = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptResp--err---', decryptErr)

        this.props.loadingStop();
        actions.setSubmitting(false)
        })
    // }
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

    fetchInsurance = () => {
        // this.props.loaderStart();
        axios.get('company')
        .then(res => {
            this.setState({insurerList:res.data.data});
            this.props.loadingStop();
        })
        .catch(err => {
            this.props.loadingStop();
        })
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
                            house_building_name:risk_arr.house_building_name,
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
                        financer_name: decryptResp.data.policyHolder.sookshamainfo.financer_name
        
                    });

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
                // let decryptErr = JSON.parse(encryption.decrypt(err.data));
                // console.log("decryptErr -------->",decryptErr)
            })
        }
        
    }

    componentDidMount() {
        this.fetchPolicyDetails();
        this.fetchInsurance();
        
    }
    RiskDetails = (productId) => {
        this.props.history.push(`/RiskDetails_Sookshma/${productId}`);
    }

    render() {
        let newInitialValues = Object.assign(initialValue,{
            previous_start_date:this.props.previous_start_date == null || this.props.previous_start_date == '' ? "" : new Date(this.props.previous_start_date),
            previous_end_date:this.props.previous_end_date == null || this.props.previous_end_date == '' ? "" : new Date(this.props.previous_end_date),
            Commercial_consideration: this.props.Commercial_consideration,
            Previous_Policy_No:this.props.Previous_Policy_No != null ? this.props.Previous_Policy_No : "",
            insurance_company_id:this.props.insurance_company_id != null ? this.props.insurance_company_id : "",
            address:this.props.address,
            financial_party: this.props.financial_party,
            is_claim: this.props.is_claim,
            previous_policy_check: this.props.previous_policy_check,
            financial_modgaged : this.props.financial_modgaged,
            financer_name: this.props.financer_name
            
        });
        
        const {productId} = this.props.match.params  
        const {insurerList, showClaim, previous_is_claim, motorInsurance, previousPolicy,
            CustomerID,suggestions, vehicleDetails, RTO_location} = this.state

        
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
                            
                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox otherDetail2">
                        <h4 className="text-center mt-3 mb-3">SME – Pre UW Package Sookshma Udyog</h4>
                        <section className="brand m-b-25">
                            <div className="brand-bg">
                                <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} 
                                validationSchema={vehicleRegistrationValidation}
                                >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                        return (
                                            <Form>
                                                <Row>
                                                    <Col sm={12} md={12} lg={9}>
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h4 >FINANCER INFORMATION:</h4>
                                                            </div>
                                                        </div>   
                                                        <Row>  
                                                            <Col sm={6} md={4} lg={4}>
                                                            <label>
                                                            Is any Financial Party Involved?
                                                            </label>
                                                            </Col>
                                                        
                                                            <Col sm={6} md={4} lg={4}>
                                                                <FormGroup>
                                                                    <div className="formSection">
                                                                        <Field
                                                                            name='financial_party'
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            className="formGrp inputfs12"
                                                                            value = {values.financial_party}                                                                           
                                                                        >
                                                                            <option value="">Select</option>
                                                                            <option value="1">Yes</option>
                                                                            <option value="2">No</option>
                                                                        </Field>
                                                                        {errors.financial_party && touched.financial_party ? (
                                                                        <span className="errorMsg">{errors.financial_party}</span>
                                                                        ) : null}  
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                        {values.financial_party == '1' ?
                                                        <Fragment>
                                                            <Row>  
                                                                <Col sm={6} md={4} lg={4}>
                                                                <label>
                                                                Is asset mortgaged with SBI Bank & Associates?
                                                                </label>
                                                                </Col>
                                                            
                                                                <Col sm={6} md={4} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="formSection">
                                                                            <Field
                                                                                name='financial_modgaged'
                                                                                component="select"
                                                                                autoComplete="off"
                                                                                className="formGrp inputfs12"
                                                                                value = {values.financial_modgaged}                                                                           
                                                                            >
                                                                                <option value="">Select</option>
                                                                                <option value="1">Yes</option>
                                                                                <option value="2">No</option>
                                                                            </Field>
                                                                            {errors.financial_modgaged && touched.financial_modgaged ? (
                                                                            <span className="errorMsg">{errors.financial_modgaged}</span>
                                                                            ) : null}  
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>
                                                            <Row>  
                                                                <Col sm={6} md={4} lg={4}>
                                                                <label>
                                                                Financier Name
                                                                </label>
                                                                </Col>
                                                            
                                                                <Col sm={6} md={4} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="formSection">
                                                                            <Field
                                                                                name='financer_name'
                                                                                type="text"
                                                                                autoComplete="off"
                                                                                className="formGrp inputfs12"
                                                                                value = {values.financer_name}                                                                           
                                                                            >
                                                                            </Field>
                                                                            {errors.financer_name && touched.financer_name ? (
                                                                            <span className="errorMsg">{errors.financer_name}</span>
                                                                            ) : null}  
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>
                                                        </Fragment> : null }

                                                        <div className="brandhead"> 
                                                            <p>&nbsp;</p>
                                                        </div>
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h4 >COVERAGE DETAILS: &nbsp;&nbsp;&nbsp; SECTION 2 - BURGLARY</h4>
                                                            </div>
                                                        </div>   
                                                        <Row>  
                                                            <Col sm={6} md={4} lg={4}>
                                                            <label>
                                                            Burglary: Contents Sum Insured
                                                            </label>
                                                            </Col>
                                                        
                                                            <Col sm={6} md={4} lg={4}>
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
                                                            </Row>
                                                            <Row>
                                                                    <Col sm={6} md={4} lg={4}>
                                                                <label>
                                                                Burglary: Stocks Sum Insured
                                                                </label>
                                                                </Col>
                                                            <Col sm={6} md={4} lg={4}>
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
                                                                                               
                                                <div className="brandhead"> 
                                                    <p>&nbsp;</p>
                                                </div>
                                            
                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.RiskDetails.bind(this,productId)}>
                                                            {isSubmitting ? 'Wait..' : 'Back'}
                                                        </Button> 
                                                        <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                            {isSubmitting ? 'Wait..' : 'Calculate Premium'}
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


      previous_start_date:state.sukhsam.previous_start_date,
      previous_end_date:state.sukhsam.previous_end_date,
      Commercial_consideration:state.sukhsam.Commercial_consideration,
      Previous_Policy_No:state.sukhsam.Previous_Policy_No,
      insurance_company_id:state.sukhsam.insurance_company_id,
      address:state.sukhsam.address,

      policy_holder_id: state.sukhsam.policy_holder_id,
      policy_holder_ref_no:state.sukhsam.policy_holder_ref_no,
      request_data_id:state.sukhsam.request_data_id,
      completed_step:state.sukhsam.completed_step,
      menumaster_id:state.sukhsam.menumaster_id,


      content_sum_insured: state.sukhsam.content_sum_insured,
      stock_sum_insured: state.sukhsam.stock_sum_insured,

      financial_party: state.sukhsam.financial_party,
      is_claim: state.sukhsam.is_claim,
      previous_policy_check: state.sukhsam.previous_policy_check,
      financial_modgaged : state.sukhsam.financial_modgaged,
      financer_name: state.sukhsam.financer_name

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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(OtherDetails_sukhsam));