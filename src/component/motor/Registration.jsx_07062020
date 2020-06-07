import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from 'yup';
import swal from 'sweetalert';

import { Formik, Form, Field, ErrorMessage } from 'formik';


const initialValues = {}

const vehicleRegistrationValidation = Yup.object().shape({
    regNumber: Yup.string().required('Please enter valid registration number'),
   
   
});


class Registration extends Component {

    state = {};

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }


    handleFormSubmit = (values) => {
    const {productId} = this.props.match.params
    this.props.history.push(`/Select-brand`);
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



    render() {
        const {} = this.state
        const newInitialValues = Object.assign(initialValues)

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
                                        validationSchema={vehicleRegistrationValidation}>
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                        return (
                                        <Form>
                                        <div className="row formSection">
                                            <label className="col-md-4">Enter Vehicle Registration Number:</label>
                                            <div className="col-md-4">
                                            <Field
                                                name="regNumber"
                                                type="text"
                                                placeholder="Registration Number"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value={values.regNumber} 
                                            />
                                            {errors.regNumber && touched.regNumber ? (
                                                <span className="errorMsg">{errors.regNumber}</span>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Registration));