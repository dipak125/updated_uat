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


const initialValues = {


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
        .matches(/^([a-zA-Z0-9.,-\/]+\s)*[\/a-zA-Z0-9.,-/]+$/, 'The field should have only one space in between words').nullable(),

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
        .matches(/^([a-zA-Z0-9.,-\/]+\s)*[\/a-zA-Z0-9.,-]+$/, 'The field should have only one space in between words').nullable(),
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


class BasicInfo extends Component {
    state = {
        product_category_list: [],
        product_list: [],
        request_receive_date: []
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

    getProductCategoryList = () => {
        this.props.loadingStart();
        axios
            .get(`/dyi-endorsement/product-category-list`)
            .then(res => {
                if(res.data.error == false) {
                    let product_category_list = res.data.data.product_categories ? res.data.data.product_categories : []
                    this.setState({
                        product_category_list
                    })
                }
                this.props.loadingStop();
            })
            .catch(err => {
                this.setState({
                    product_category_list: []
                });
                this.props.loadingStop();
            });
    }

    getProductList = (product_category_id) => {
        const formData = new FormData();
        let encryption = new Encryption();
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data.user) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));
        }

        formData.append('product_category_id', product_category_id)
        formData.append('user_id', user_data.master_user_id)

        if(user_data.login_type == 4) {
            if(user_data.bc_master_id == 5) {
                formData.append('user_type', 'csc')
            }
            else {
                formData.append('user_type', 'bc')
                formData.append('agent_id', user_data.user_name)
            }
        }
        else {
            formData.append('user_type', user_data.user_type)
        }         

        this.props.loadingStart();
        axios
            .post('dyi-endorsement/product-list', formData)
            .then(res => {
                console.log("product_list ---------- ", res.data)
                if(res.data.error == false) {
                    let product_list = res.data.data.products ? res.data.data.products : []
                    this.setState({
                        product_list
                    })
                }
                this.props.loadingStop();
            })
            .catch(err => {
                this.setState({
                    product_category_list: []
                });
                this.props.loadingStop();
            });
    }

    initClaimDetailsList = () => {
        let innicialClaimList = []
        let endorsement_array = []
        for (var i = 0; i < 2; i++) {
            innicialClaimList.push(
                {
                    endorsement_type: endorsement_array && endorsement_array[i] && endorsement_array[i].endorsement_type ? endorsement_array[i].endorsement_type : "",
                    endorsement_sub_type: endorsement_array && endorsement_array[i] && endorsement_array[i].endorsement_sub_type ? endorsement_array[i].endorsement_sub_type : "",
                    request_receive_date: endorsement_array && endorsement_array[i] && endorsement_array[i].request_receive_date ? endorsement_array[i].request_receive_date : "",
                    old_value: endorsement_array && endorsement_array[i] && endorsement_array[i].old_value ? endorsement_array[i].old_value : "",
                    new_value: endorsement_array && endorsement_array[i] && endorsement_array[i].new_value ? endorsement_array[i].new_value : "",
                }
            )
        }

        return innicialClaimList

    };


    handleClaims = (values, errors, touched, setFieldTouched, setFieldValue, loop) => {
        let field_array = []
        let request_receive_date = []
console.log("jhgjkhgjhgjhgbnjhbg")
        for (var i = 0; i < loop; i++) {
            field_array.push(
                <FormGroup key = {i}>
                    <Row className="row formSection">
                        <label className="col-md-3">Endorsement Type:</label>
                        <div className="col-md-4">
                            
                            <div className="formSection">
                                <Field
                                    name= {`endorsement_array[${i}].endorsement_type`}
                                    component="select"
                                    autoComplete="off"
                                    className="formGrp inputfs12"
                                    // value = {values.endorsement_type}                                             
                                >  
                                    <option value="">List Of Endorsement Type </option>
                                    <option value="1">Health</option>
                                    <option value="2">Individual Personal Accident </option>
                                    <option value="3">Loan Insurance</option>
                                    <option value="4">Longterm Home</option>
                                    
                                </Field>
                                {errors.endorsement_array && errors.endorsement_array[i] && errors.endorsement_array[i].endorsement_type ? (
                                    <span className="errorMsg">{errors.endorsement_array[i].endorsement_type}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>

                    <Row className="row formSection">
                        <label className="col-md-3">Endorsement Sub type:</label>
                        <div className="col-md-4">
                            
                            <div className="formSection">
                                <Field
                                    name= {`endorsement_array[${i}].endorsement_sub_type`} 
                                    component="select"
                                    autoComplete="off"
                                    className="formGrp inputfs12"
                                    // value = {values.endorsement_sub_type}                                             
                                >  
                                    <option value="">List Of Endorsement Sub Type </option>
                                    <option value="1">Health</option>
                                    <option value="2">Individual Personal Accident </option>
                                    <option value="3">Loan Insurance</option>
                                    <option value="4">Longterm Home</option>
                                    
                                </Field>
                                {errors.endorsement_array && errors.endorsement_array[i] && errors.endorsement_array[i].endorsement_sub_type ? (
                                    <span className="errorMsg">{errors.endorsement_array[i].endorsement_sub_type}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>

                    <Row className="row formSection">
                        <label className="col-md-3">Request Receive Date:</label>
                        <div className="col-md-4">                                            
                            <div className="formSection">                         
                                <DatePicker
                                    name= {`endorsement_array[${i}].request_receive_date`}
                                    dateFormat="dd MMM yyyy"
                                    placeholderText="Request Receive Date"
                                    peekPreviousMonth
                                    peekPreviousYear
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    // maxDate={new Date(maxDobAdult)}
                                    // minDate={new Date(minDobAdult)}
                                    className="datePckr"
                                    selected={values.endorsement_array[i].request_receive_date}
                                    onChange={(val) => {
                                        console.log("i --------------- ",i)
                                        setFieldTouched(`endorsement_array[${i}].request_receive_date`);
                                        setFieldValue(`endorsement_array[${i}].request_receive_date`, val);
                                        }}
                                />
                                {errors.endorsement_array && errors.endorsement_array[i] && errors.endorsement_array[i].request_receive_date ? (
                                    <span className="errorMsg">{errors.endorsement_array[i].request_receive_date}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>

                    <Row className="row formSection">
                        <label className="col-md-3">Old Value:</label>
                        <div className="col-md-4">
                            {console.log("i 2 --------------- ", i)}
                            <div className="formSection">
                                <Field
                                    name=  {`endorsement_array[${i}].old_value`}
                                    type="text"
                                    autoComplete="off"
                                    placeholder = "Old Value"
                                    className="formGrp inputfs12"
                                    // value = {values.old_value}                                             
                                >  
                                </Field>
                                {errors.endorsement_array && errors.endorsement_array[i] && errors.endorsement_array[i].old_value ? (
                                    <span className="errorMsg">{errors.endorsement_array[i].old_value}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>

                    <Row className="row formSection">
                        <label className="col-md-3">New Value:</label>
                        <div className="col-md-4">
                            
                            <div className="formSection">
                                <Field
                                    name= {`endorsement_array[${i}].new_value`}
                                    type="text"
                                    autoComplete="off"
                                    placeholder = "New Value"
                                    className="formGrp inputfs12"
                                    // value = {values.new_value}                                            
                                >  
                                </Field>
                                {errors.endorsement_array && errors.endorsement_array[i] && errors.endorsement_array[i].new_value ? (
                                    <span className="errorMsg">{errors.endorsement_array[i].new_value}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>

                </FormGroup>
            )
        }
        return field_array

    }


    componentDidMount(){
        this.getProductCategoryList()
    }

    render() {
        const { product_category_list, product_list} = this.state
        const newInitialValues = Object.assign(initialValues,{
            endorsement_array: this.initClaimDetailsList(),
        }
        )

        return (
            <>
                <div >
                    <section className="brand">
                        <div className="boxpd">
                            <Formik initialValues={newInitialValues} 
                        //    onSubmit={ }
                            // validationSchema={vehicleRegistrationValidation}
                            >
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                console.log("values ---------- ", values)
                            return (
                                <Form>    
                                <div className="brandhead"> 
                                    <Row className="row formSection">
                                        <label className="col-md-3">Email Address:</label>
                                        <div className="col-md-4">
                                            
                                            <div className="formSection">
                                                <Field
                                                    name='email_id'
                                                    type="text"
                                                    autoComplete="off"
                                                    placeholder = "Email Address"
                                                    className="formGrp inputfs12"
                                                    value = {values.email_id}                                             
                                                >  
                                                </Field>
                                                {errors.email_id && touched.email_id ? (
                                                    <span className="errorMsg">{errors.email_id}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Row>

                                    <Row className="row formSection">
                                        <label className="col-md-3">Mobile Number:</label>
                                        <div className="col-md-4">
                                            
                                            <div className="formSection">
                                                <Field
                                                    name='mobile_no'
                                                    type="text"
                                                    autoComplete="off"
                                                    placeholder = "Mobile Number"
                                                    className="formGrp inputfs12"
                                                    value = {values.mobile_no}                                             
                                                >  
                                                </Field>
                                                {errors.mobile_no && touched.mobile_no ? (
                                                    <span className="errorMsg">{errors.mobile_no}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Row>

                                    <Row className="row formSection">
                                        <label className="col-md-3">Product Category:</label>
                                        <div className="col-md-4">
                                            
                                            <div className="formSection">
                                                <Field
                                                    name='product_category'
                                                    component="select"
                                                    autoComplete="off"
                                                    className="formGrp inputfs12"
                                                    value = {values.product_category}        
                                                    onChange = {(e) => {
                                                        this.getProductList(e.target.value)
                                                    }}                                      
                                                >  
                                                    <option value="">Select product category</option>
                                                    {product_category_list && product_category_list.map((resource, rindex) => 
                                                    <option value = {resource.id}> {resource.category_name}</option>
                                                    )}
                                                   
                                                   
                                                </Field>
                                                {errors.product_category && touched.product_category ? (
                                                    <span className="errorMsg">{errors.product_category}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Row>

                                    <Row className="row formSection">
                                        <label className="col-md-3">Product:</label>
                                        <div className="col-md-4">
                                            
                                            <div className="formSection">
                                                <Field
                                                    name='product'
                                                    component="select"
                                                    autoComplete="off"
                                                    className="formGrp inputfs12"
                                                    value = {values.product}                                                                                       
                                                >  
                                                    <option value="">Select product </option>
                                                    {product_list && product_list.map((resource, rindex) => 
                                                    <option value = {resource.id}> {resource.product_name}</option>
                                                    )}
                                                   
                                                </Field>
                                                {errors.product && touched.product ? (
                                                    <span className="errorMsg">{errors.product}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Row>

                                    <Row className="row formSection">
                                        <label className="col-md-3">Policy Number:</label>
                                        <div className="col-md-4">
                                            
                                            <div className="formSection">
                                                <Field
                                                    name='policy_no'
                                                    type="text"
                                                    autoComplete="off"
                                                    placeholder = "Policy Number"
                                                    className="formGrp inputfs12"
                                                    value = {values.policy_no}                                             
                                                >  
                                                </Field>
                                                {errors.policy_no && touched.policy_no ? (
                                                    <span className="errorMsg">{errors.policy_no}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Row>

                                    {this.handleClaims(values, errors, touched, setFieldTouched, setFieldValue, 1)}

                                    <Row className="row formSection">
                                        <label className="col-md-3">Add another endorsement:</label>
                                        <div className="col-md-4">                                
                                        <Button type="button" onClick = {this.handleClaims.bind(this, values, errors, touched, setFieldTouched, setFieldValue, 2)}>
                                           +
                                        </Button>
                                        </div>
                                    </Row>

                                    <Row className="row formSection">
                                        <label className="col-md-3">Attach Documents:</label>
                                        <div className="col-md-4">
                                            
                                            +
                                        </div>
                                    </Row>
                                    
                                </div>                                           
                                
                            </Form>
                            );
                        }}
                        </Formik>
                        </div>

                    </section>
                </div>        
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(BasicInfo));