import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import BaseComponent from '../.././BaseComponent';
import SideNav from '../../common/side-nav/SideNav';
import Footer from '../../common/footer/Footer';
import axios from "../../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from 'yup';
import swal from 'sweetalert';
import Encryption from '../../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';

const initialValues = {
    policy_number: "",
    claim_number: ""
}

const claimValidation = Yup.object().shape({


    claim_number: Yup.string()
        .test(
            "policyNumberCheck",
            function () {
                return "Please enter claim number"
            },
            function (value) {
                if (!value && (this.parent.policy_number == "" || this.parent.policy_number == undefined)) {
                    return false;
                }
                return true;
            }
        ),

        policy_number: Yup.string()
        .test(
            "claimNumberCheck",
            function () {
                return "Please enter policy number"
            },
            function (value) {
                if (!value && (this.parent.claim_number == "" || this.parent.claim_number == undefined)) {
                    return false;
                }
                return true;
            }
        ),

});

class ClaimStatus extends Component {

    state = {
        claim_search: []
    }


    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    componentDidMount() {
        // this.fetchData();

    }

    fetchData = (values) => {
        const { productId } = this.props.match.params
        let encryption = new Encryption();
        const formData = new FormData();
        let user_id = ""
        let bcmaster_id = ""
        let csc_data = sessionStorage.getItem('users') ? sessionStorage.getItem('users') : "";
        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";

        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
            user_id = bc_data ? bc_data.bc_agent_id : ""
            bcmaster_id = bc_data ? bc_data.agent_id : ""
        }
        else if(csc_data && sessionStorage.getItem('csc_id')) {
            let encryption = new Encryption();
            csc_data = JSON.parse(csc_data)        
            csc_data = csc_data.user
            csc_data = JSON.parse(encryption.decrypt(csc_data));          
            user_id = csc_data.csc_digital_seva_id 
            bcmaster_id = '5'  
        }
        if (values.policy_number) {
            formData.append('policy_number', values.policy_number)
        }
        if(values.claim_number) {
            formData.append('claim_number', values.claim_number)
        }
        formData.append('user_id', user_id)
        formData.append('bcmaster_id', bcmaster_id)

        this.props.loadingStart();
        axios.post(`/claim/search`, formData)
            .then(res => {
                let claim_search = res.data.data.claim_search
                this.setState({
                    claim_search
                })
                this.props.loadingStop();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }


    render() {
        const { claim_search } = this.state
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        
        return (
            <>
                <BaseComponent>
                    {phrases ?
					<div className="page-wrapper">
					
                        <div className="container-fluid">
                            <div className="row">
							
							<aside className="left-sidebar">
							 	 <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
							 		<SideNav />
								 </div>
								</aside>
												
                                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox">
                                    <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                                    <section className="brand">
                                        <div className="boxpd">
                                            <h4 className="m-b-30">{phrases['AboutVehicle']}</h4>
                                            <Formik initialValues={initialValues}
                                                onSubmit={this.fetchData}
                                                validationSchema={claimValidation}
                                                >
                                                {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                                    return (
                                                        <Form>
                                                            <div className="row formSection">
                                                                <label className="col-md-3">Claim Number :</label>
                                                                <div className="col-md-4">
                                                                    <Field
                                                                        name="claim_number"
                                                                        type="text"
                                                                        placeholder="Claim Number"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value={values.claim_number}
                                                                        maxLength={this.state.length}
                                                                        onChange = {(e) =>{
                                                                            setFieldValue("policy_number");
                                                                            setFieldValue("policy_number", "");
                                                                            setFieldValue("claim_number", e.target.value)
                                                                        }}

                                                                    />
                                                                    {errors.claim_number && touched.claim_number ? (
                                                                        <span className="errorMsg">{errors.claim_number}</span>
                                                                    ) : null}
                                                                </div>
                                                            </div> 

                                                            <div className="row formSection">
                                                                <label className="col-md-3"></label>
                                                                <label className="col-md-4">Or</label>
                                                            </div>

                                                            <div className="row formSection">
                                                                <label className="col-md-3">Policy Number :</label>
                                                                <div className="col-md-4">
                                                                    <Field
                                                                        name="policy_number"
                                                                        type="text"
                                                                        placeholder="Policy Number"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value={values.policy_number}
                                                                        maxLength={this.state.length}
                                                                        onChange = {(e) =>{
                                                                            setFieldValue("claim_number");
                                                                            setFieldValue("claim_number", "");
                                                                            setFieldValue("policy_number", e.target.value)
                                                                        }}

                                                                    />
                                                                    {errors.policy_number && touched.policy_number ? (
                                                                        <span className="errorMsg">{errors.policy_number}</span>
                                                                    ) : null}
                                                                </div>
                                                            </div> 
                                                            <div className="cntrbtn">
                                                                <Button className={`btnPrimary`} type="submit" >
                                                                    {phrases['Go']}
                                                                </Button>
                                                            </div>
                                                           

                                                            <div className="row formSection">
                                                                <label className="col-md-3">Insured Name :</label>
                                                                <label className="col-md-4">{claim_search && claim_search.InsuredName}</label>
                                                            </div> 
                                                            <div className="row formSection">
                                                                <label className="col-md-3">Claim Status :</label>
                                                                <label className="col-md-4">{claim_search && claim_search.RuralPortalStatus}</label>
                                                            </div> 
                                                            <div className="row formSection">
                                                                <label className="col-md-3">Claim Handler Name :</label>
                                                                <label className="col-md-4">{claim_search && claim_search.IHAName}</label>
                                                            </div> 
                                                            <div className="row formSection">
                                                                <label className="col-md-3">Claim Handler Number :</label>
                                                                <label className="col-md-4">{claim_search && claim_search.IHAContactNO}</label>
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
                        </div> : null}
                </BaseComponent>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        loading: state.loader.loading,
        data: state.processData.data
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop())
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ClaimStatus));