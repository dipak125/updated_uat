import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import BackContinueButton from '../common/button/BackContinueButton';



class MedicalDetails extends Component {
    render() {
        return (
            <>
                <BaseComponent>
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                            <SideNav />
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10">
                            <section className="d-flex justify-content-center brand m-t-60">
                                <div className="brand-bg pd-30">
                                <div className="d-flex justify-content-left">
                            <div className="brandhead m-b-25">
                                <h4>Please help us with more details to arrive at the best suited plan </h4>
                            </div>
                            </div>

                            <Row>
                            <Col sm={12} md={9}>
                            <div className="d-flex justify-content-left">
                                <div className="m-r-25"><img src={require('../../assets/images/medi-1.svg')} alt="" /></div>

                                <div className="medinfo"><p className="W225">Does any insured member(s) smoke cigarettes?</p>
                                <div className="d-inline-flex m-b-30">
                                            <div className="p-r-25">
                                                <label className="customRadio3">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                    />
                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                </label>
                                            </div>

                                            <div className="">
                                                <label className="customRadio3">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                    />
                                                    <span className="checkmark" />
                                                    <span className="fs-14">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-left">
                                <div className="m-r-25"><img src={require('../../assets/images/medi-2.svg')} alt="" /></div>
                                
                                <div className="medinfo"><p className="W275">Does any of the insured member(s) consume tobacco in any other form?</p>
                                <div className="d-inline-flex m-b-30">
                                            <div className="p-r-25">
                                                <label className="customRadio3">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                    />
                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                </label>
                                            </div>

                                            <div className="">
                                                <label className="customRadio3">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                    />
                                                    <span className="checkmark" />
                                                    <span className="fs-14">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-left">
                                <div className="m-r-25"><img src={require('../../assets/images/medi-3.svg')} alt="" /></div>
                                
                                <div className="medinfo"><p className="W270">Does any of the insured member(s) drink alcohol?</p>
                                <div className="d-inline-flex m-b-30">
                                            <div className="p-r-25">
                                                <label className="customRadio3">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                    />
                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                </label>
                                            </div>

                                            <div className="">
                                                <label className="customRadio3">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                    />
                                                    <span className="checkmark" />
                                                    <span className="fs-14">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center m-b-20">
                                <div className="d-flex align-items-center medinfo"><img src={require('../../assets/images/medi-4.svg')} alt="" className="m-r-25" />
                                <p className="W500">Does any of the insured member(s) suffer from physical/mental illness or deformity or any other medical complaints?</p></div>
                                
                                <div className="medinfo">
                                <div className="d-inline-flex align-items-center">
                                            <div className="p-r-25">
                                                <label className="customRadio3">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                    />
                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                </label>
                                            </div>

                                            <div className="">
                                                <label className="customRadio3">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                    />
                                                    <span className="checkmark" />
                                                    <span className="fs-14">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <BackContinueButton/>
                            </Col>

                            <Col sm={12} md={3}>
                                <div className="regisBox medpd">
                                    <h3 className="medihead">No Medical Test upto the Age of 45 for People with No Medical History </h3>
                                </div>
                            </Col>
                        </Row>
                        
                                    </div>
                                 </section>   
                                </div>
                      </div>      
                </BaseComponent>
            </>
        );
    }
}

export default MedicalDetails;