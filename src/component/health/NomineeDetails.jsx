import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";

// const newInitialValues ={
//     family_member_id_33: 'y'
// }

class NomineeDetails extends Component {

    state = {
        policyHolderDetails: [],
        message: ""

      };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    addressInfo = (productId) => {
        this.props.history.push(`/Address/${productId}`);
    }

    handleSubmit = (event) => {
        const {productId} = this.props.match.params
        this.props.history.push(`/PolicyDetails/${productId}`);
    }

    handleChangeSubmit = (family_member_id,value) => {

        const formData = new FormData(); 

        formData.append('family_member_id', family_member_id);
        formData.append('is_nominee', value);
        formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));

        this.props.loadingStart();
        axios
          .post(`/set-nominee`, formData)
          .then(res => {
            this.setState({
                message: res.data.msg
            });
          })
          .catch(err => {
            this.setState({
                message: ""
            });
            this.props.loadingStop();
          });
    }

    getPolicyHolderDetails = () => {
        this.props.loadingStart();
        axios
          .get(`/policy-holder/${localStorage.getItem('policyHolder_id')}`)
          .then(res => {
            this.setState({
                policyHolderDetails: res.data.data.policyHolder.request_data.family_members
            }) 
          })
          .catch(err => {
            this.setState({
                policyHolderDetails: [], flag: true
            });
            this.props.loadingStop();
          });
      }

    componentDidMount() {
        this.getPolicyHolderDetails();
      }


    render() {
        const {productId} = this.props.match.params
        const {policyHolderDetails} = this.state

        let initialValues = {}

        policyHolderDetails.map((member, qIndex) => {
            initialValues[`family_member_id_${member.id}`] = member.is_nominee;
        })

        const newInitialValues =  Object.assign(initialValues) ;


        return (
            
            <>
            {console.log("newInitialValues", newInitialValues)}

                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">Arogya Sanjeevani Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <div className="justify-content-left brandhead  m-b-20">
                                            <h4 className="fs-18">You are just one step away from geting your policy ready</h4>
                                        </div>
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Nominee  Details</h4>
                                        </div>
                                    {Object.keys(newInitialValues).length > 0 ?
                                    <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} 
                                    // validationSchema={validateNominee}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                    return (
                                    <Form>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

                                            {policyHolderDetails.map((member, qIndex) => ( 
                                                member.relation_with != 'self' ?
                                                <div className="medinfo"><p className="W500">{member.relation_with}</p>                              
                                                <FormGroup>
                                                    <div className="d-inline-flex m-b-30">
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                            <Field
                                                                type="radio"
                                                                name={`family_member_id_${member.id}`}
                                                                value="y"
                                                                key={qIndex}  
                                                                onChange={(e) => {
                                                                    setFieldValue(`family_member_id_${member.id}`, e.target.value);
                                                                    this.handleChangeSubmit(member.id,e.target.value)
                                                                }}
                                                                checked={values[`family_member_id_${member.id}`] == 'y' ? true : false}
                                                            />
                                                                <span className="checkmark " /><span className="fs-14"> Yes</span>                      
                                                            </label>
                                                        </div>     
                                                        <div className="">
                                                            <label className="customRadio3">
                                                            <Field
                                                                type="radio"
                                                                name={`family_member_id_${member.id}`}
                                                                value="n"
                                                                key={qIndex}  
                                                                onChange={(e) => {
                                                                    setFieldValue(`family_member_id_${member.id}`, e.target.value);
                                                                    this.handleChangeSubmit(member.id, e.target.value)
                                                                }}
                                                                checked={values[`family_member_id_${member.id}`] == 'n' ? true : false}
                                                            />
                                                                <span className="checkmark" />
                                                                <span className="fs-14">No</span>                                      
                                                            </label>
                                                        </div>                             
                                                    </div>
                                                    </FormGroup>
            
                                                </div>
                                                : null
                                                ))}

                                                    
                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.addressInfo.bind(this, productId )}>
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </Button> 
                                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                    {isSubmitting ? 'Wait..' : 'Next'}
                                                </Button> 
                                                </div>
                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="regisBox">
                                                    <h3 className="medihead">Assurance of Insurance Everywhere in India, for every Indian </h3>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Form>
                                    );
                                    }}
                                    </Formik>
                                    : null}
                                    </div>
                                </section>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(NomineeDetails));