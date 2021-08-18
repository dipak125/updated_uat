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


class CancellationRefund extends Component {
    state = {
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
    }

    render() {
        const { } = this.state
        const newInitialValues = Object.assign(initialValues
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
                                
                            return (
                                <Form>    
                                <div className="brandhead"> 
                                
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(CancellationRefund));