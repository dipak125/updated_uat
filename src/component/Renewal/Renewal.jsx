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
import Encryption from '../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { setData } from "../../store/actions/data";
import { validRegistrationNumber } from "../../shared/validationFunctions";
// let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null

// const { t, i18n } = useTranslation();
// const href = "#";

const initialValues = {
    policy_number: '',
}

const vehicleRegistrationValidation = Yup.object().shape({

    policy_number: Yup.string().required("RequiredField")
    .matches(/^[a-zA-Z0-9-]*$/, function() {
        return "ValidPolicyNumber"
    }),

});

class renewal extends Component {

    state = {
        motorInsurance: '',
        regno: '',
        length: 14,
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


    back = () => {
        this.props.history.push(`/Products`);
    }
    forward = (policy_type) => {
        if(policy_type == '1') {
            this.props.history.push(`/MotorCoverages`);
        }
        else {
            this.props.history.push(`/HealthSummery`);
        }
        
    }


    handleSubmit = (values, actions) => {
        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        let user_id = ""
        let user_type = ""
        let csc_data = sessionStorage.getItem('users') ? (sessionStorage.getItem('users')) : "";
        let user_data= sessionStorage.getItem('user_data') ? JSON.parse(sessionStorage.getItem('user_data')) : "";
        
        console.log("check",user_data.master_user_id,user_data.user_type,user_data.user_type == "Intermidiary")
        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(user_data && user_data.user_type && user_data.user_type == "Intermidiary" )
        {
            user_id = user_data.master_user_id
            user_type = "intermidiary";
        }
        else if(user_data && user_data.user_type && user_data.user_type == "Micro" )
        {
            user_id = user_data.master_user_id
            user_type = "Micro";
        }
         else if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
            console.log("bc_data",bc_data)
            user_id = bc_data ? bc_data.agent_id : ""
            user_type = 'bc'
        }
        else if(csc_data && sessionStorage.getItem('csc_id')) {
            let encryption = new Encryption();
            csc_data = JSON.parse(csc_data)        
            csc_data = csc_data.user
            csc_data = JSON.parse(encryption.decrypt(csc_data));    
            console.log("cscData----------- ", csc_data)      
            user_id = csc_data.master_user_id 
            user_type = 'csc'  
            sessionStorage.getItem('type') ? formData.append('csc_user_type', sessionStorage.getItem('type')) : formData.append('csc_user_type', csc_data.user_type)
        }

        post_data = {
            'policy_number': values.policy_number,
        }
        // formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        formData.append('policy_number', values.policy_number)
        formData.append('user_id', user_id)
        formData.append('user_type', user_type) 
       
        

        this.props.loadingStart();
        axios
            .post(`/renewal/policy-search`, formData)
            .then(res => {
               if(res.data.error == false){
                actions.setSubmitting(false)
                if(res.data.data.eligible_for_renewal == 1) {
                    this.quoteDetails(values.policy_number, actions)
                }
                else this.props.loadingStop();
               }
               else {
                swal(res.data.msg);
                actions.setSubmitting(false)
                this.props.loadingStop();
               }              
            })
            .catch(err => {
                if (err && err.data) {
                    actions.setSubmitting(false)
                }
                this.props.loadingStop();
            });
        }

    quoteDetails = (policy_number, actions) => {
        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}

        post_data = {
            'policy_number': policy_number,
        }
        // formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        formData.append('policy_number', policy_number)

        this.props.loadingStart();
        axios
            .post(`/renewal/quote-detail`, formData)
            .then(res => {
                if(res.data.error == false){
                localStorage.setItem("policyHolder_refNo", res.data.data.reference_no)	
                localStorage.setItem("policyHolder_id", res.data.data.policyHolder_id)
                let policy_type = res.data.data.policy_type ? res.data.data.policy_type : "";
                this.props.loadingStop();
                this.forward(policy_type)
                }
                else {
                swal(res.data.msg);
                this.props.loadingStop();
                }              
            })
            .catch(err => {
                this.props.loadingStop();
            });
        }


    render() {
        const { motorInsurance } = this.state
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
                                <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                    <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                                    <section className="brand">
                                        <div className="boxpd">
                                            <h4 className="m-b-30">Please provide your previous year policy number for renewal</h4>
                                            <Formik initialValues={initialValues}
                                                onSubmit={this.handleSubmit}
                                                validationSchema={vehicleRegistrationValidation}>
                                                {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                                    // console.log('values',values)

                                                    return (
                                                        <Form>
                                                            <div className="row formSection">
                                                                <label className="col-md-3">Enter Policy Number :</label>
                                                                <div className="col-md-4">

                                                                    <Field
                                                                        name="policy_number"
                                                                        type="text"
                                                                        placeholder="Policy Number"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value={values.policy_number}
                                                                    />
                                                                    {errors.policy_number && touched.policy_number ? (
                                                                        <span className="errorMsg">{phrases[errors.policy_number]}</span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                            <div className="row formSection"> &nbsp; </div>

                                                            <div >
                                                                <Button className={`btnPrimary`} type="submit" >
                                                                    {phrases.hasOwnProperty('Renew') ? phrases['Renew'] : null}
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
        loadingStop: () => dispatch(loaderStop()),
        setData: (data) => dispatch(setData(data))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(renewal));