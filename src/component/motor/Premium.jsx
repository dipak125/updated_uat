import React, { Component } from 'react';
import HeaderSecond from '../common/header/HeaderSecond';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";



class Premium extends Component {

    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
        };
    }


    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }

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
                            <h4>The Summary of your Policy Premium Details is as below </h4>
                        </div>
                    </div>
                    <Row>
                        <Col sm={12} md={9} lg={9}>
                            <div className="rghtsideTrigr">
                                <Collapsible trigger="Retail Motor Policy" >
                                    <div className="listrghtsideTrigr">
                                        <Row>
                                            <Col sm={12} md={3}>
                                                <div className="motopremium">
                                                    Premium:
                                                                    </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="premamount">
                                                    ₹ 4000
                                                </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="motopremium">
                                                    Swachh Bharat cess:
                                                                    </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="premamount">
                                                    ₹ 4000
                                                </div>
                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="motopremium">
                                                    Gross Premium:
                                                                    </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="premamount">
                                                    ₹ 1000
                                                </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="motopremium">
                                                    Krishi Kalyan cess:
                                                                    </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="premamount">
                                                    ₹ 1000
                                                </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="motopremium">
                                                    Service Tax:
                                                                    </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="premamount">
                                                    ₹ 5000
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                </Collapsible>
                            </div>

                            <div className="rghtsideTrigr m-b-30">
                                <Collapsible trigger="Member Details" >
                                    <div className="listrghtsideTrigr">
                                        Hello
                                    </div>

                                </Collapsible>
                            </div>

                            <Row>
                                <Col sm={12} md={6}>
                                    <div className="carloan">
                                        <h4>Make Payment</h4>
                                    </div>
                                </Col>
                                <Col sm={12} md={6}>
                                    <div className="carloan">
                                        <h4>Select Payment Gateway</h4>
                                    </div>
                                </Col>
                            </Row>


                            <Row>
                                <Col sm={12} md={6}>
                                    <Row>
                                        <Col sm={6}>
                                            <FormGroup>
                                                <div className="refno">
                                                    My reference no is
                                    </div>
                                            </FormGroup>
                                        </Col>
                                        <Col sm={6}>
                                            <FormGroup>
                                                <div className="insurerName">
                                                    <input
                                                        name="name"
                                                        type="text"
                                                        placeholder="Type No"
                                                        className="hght30"
                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    />
                                                </div>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                </Col>
                                <Col sm={12} md={6}>
                                    <FormGroup>
                                        <img src={require('../../assets/images/green-check.svg')} alt="" className="m-r-10" />
                                        <img src={require('../../assets/images/CSC.svg')} alt="" />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col sm={12}>
                                    <label className="customCheckBox formGrp formGrp fscheck">I want to receive my Quote & Policy Details on Whatsapp
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
                            <div className="d-flex justify-content-left resmb">
                                <button className="backBtn">Back</button>
                                <button className="proceedBtn" onClick={this.handleShow} href={'#'}>Continue</button>
                            </div>
                        </Col>


                        <Col sm={12} md={3} lg={3}>
                            <div className="motrcar"><img src={require('../../assets/images/motor-car.svg')} alt="" /></div>
                        </Col>
                    </Row>
                </section>

                <Modal className="" bsSize="md"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <div className="otpmodal">
                        <Modal.Body>
                            <div className="text-center boxotpmodl">
                                <img src={require('../../assets/images/desk.svg')} alt="" className="m-b-25" />
                                <div className="verfy">Verify OTP</div>
                                <div className="mobotp">Your one time password (OTP)  is sent to your registered mobile number XXXXXXX 445.</div>


                                <div className="d-flex justify-content-center otpInputWrap mx-auto m-b-25">
                                    <div className="mr-1 ml-1">
                                        <input
                                            name="input1"
                                            type="tel"
                                            className="form-control placeHCenter"
                                            autoComplete="off"
                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        />
                                    </div>
                                    <div className="mr-1 ml-1">
                                        <input
                                            name="input2"
                                            type="tel"
                                            className="form-control placeHCenter"
                                            autoComplete="off"
                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        />
                                    </div>
                                    <div className="mr-1 ml-1">
                                        <input
                                            name="input3"
                                            type="tel"
                                            className="form-control placeHCenter"
                                            autoComplete="off"
                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        />
                                    </div>
                                    <div className="mr-1 ml-1">
                                        <input
                                            name="input4"
                                            type="tel"
                                            className="form-control placeHCenter"
                                            autoComplete="off"
                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        />
                                    </div>
                                    <div className="mr-1 ml-1">
                                        <input
                                            name="input5"
                                            type="tel"
                                            className="form-control placeHCenter"
                                            autoComplete="off"
                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        />
                                    </div>
                                    <div className="mr-1 ml-1">
                                        <input
                                            name="input6"
                                            type="tel"
                                            className="form-control placeHCenter"
                                            autoComplete="off"
                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        />
                                    </div>
                                </div>
                                <div className="m-b-25">
                                <div className="sndSms">Resend OTP via SMS</div>
                                <div>You can resend OTP in 17 seconds</div>
                                </div>

                                <div className="text-center">
                                    <button className="proceedBtn" href={'#'}>Continue</button>
                                </div>
                            </div>
                        </Modal.Body>
                    </div>
                </Modal>
            </>
        );
    }
}

export default Premium;