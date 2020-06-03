import React, { Component } from 'react';
import HeaderSecond from '../common/header/HeaderSecond';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import BackContinueButton from '../common/button/BackContinueButton';



class OtherComprehensive extends Component {

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    render() {
        return (
            <>
                <HeaderSecond />
                <section className="brand topcar">
                    <div className="d-flex justify-content-left">
                        <div className="premimhead">
                            <h4 className="m-b-30">Covers your Car + Damage to Others (Comprehensive)</h4>
                        </div>
                    </div>
                    <Row>
                        <Col sm={12} md={9} lg={9}>
                            <div className="rghtsideTrigr m-b-30">
                                <Collapsible trigger="Default Covered Coverages & Benefit" >
                                    <div className="listrghtsideTrigr">
                                        Hello
                                    </div>
                                </Collapsible>
                            </div>

                            <Row>
                                <Col sm={12} md={4} lg={4}>
                                    <FormGroup>
                                        <div className="insurerName">
                                            <span className="fs-16">Insured Declared Value</span>
                                        </div>
                                    </FormGroup>
                                </Col>
                                <Col sm={12} md={2} lg={2}>
                                    <FormGroup>
                                        <div className="insurerName">
                                            <input
                                                name="name"
                                                type="text"
                                                className="premiumslid"
                                                placeholder="5,00,000"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            />
                                        </div>
                                    </FormGroup>
                                </Col>
                                <Col sm={12} md={6} lg={6}>
                                    <FormGroup>
                                        <img src={require('../../assets/images/slide.svg')} alt="" />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col sm={12} md={5} lg={5}>
                                    <FormGroup>
                                        <div className="insurerName">
                                            <span className="fs-16"> Have you fitted external CNG Kit</span>
                                        </div>
                                    </FormGroup>
                                </Col>
                                <Col sm={12} md={3} lg={3}>
                                    <FormGroup>
                                        <div className="d-inline-flex m-b-35">
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
                                    </FormGroup>
                                </Col>
                                <Col sm={12} md={4} lg={4}>
                                    <FormGroup>
                                        <div className="insurerName cost">
                                            <input
                                                name="name"
                                                type="text"
                                                placeholder="Cost of Kit"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            />
                                        </div>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col sm={12} md={12} lg={12}>
                                    <FormGroup>
                                        <span className="fs-18"> Add  more coverage to your plan.</span>
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row className="m-b-40">
                                <Col sm={12} md={6} lg={6}>
                                    <label className="customCheckBox formGrp formGrp">Basic Roadside Assistance
                                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool"/></a>
                                            </OverlayTrigger>
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                  </Col>

                                  <Col sm={12} md={6} lg={6}>
                                    <label className="customCheckBox formGrp formGrp">Cover for Consumables
                                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                            </OverlayTrigger>
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                  </Col>

                                  <Col sm={12} md={6} lg={6}>
                                    <label className="customCheckBox formGrp formGrp">Depreciation Reimbursement
                                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt=""  className="premtool"/></a>
                                            </OverlayTrigger>
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                  </Col>

                                  <Col sm={12} md={6} lg={6}>
                                    <label className="customCheckBox formGrp formGrp">Return To Invoice
                                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                            </OverlayTrigger>
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                  </Col>

                                  <Col sm={12} md={6} lg={6}>
                                    <label className="customCheckBox formGrp formGrp">Engine Guard
                                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                            </OverlayTrigger>
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                  </Col>
                                </Row>    
                                <BackContinueButton/>
                                </Col>

                                <Col sm={12} md={3}>
                                    <div className="justify-content-left regisBox">
                                        <h3 className="premamnt"> Total Premium Amount</h3>
                                        <div className="rupee"> ₹ 5000</div>
                                        <div className="text-center"> <button className="brkbtn">Breakup</button></div>
                                    </div>
                                </Col>
                            </Row>
                                     </section>

            </>
        );
    }
}

export default OtherComprehensive;