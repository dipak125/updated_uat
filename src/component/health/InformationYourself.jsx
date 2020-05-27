import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';

import { Formik, Form, Field, ErrorMessage } from 'formik';

class InformationYourself extends Component {
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
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10">
                                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <h4 className="m-b-30">Help us with some information about yourself</h4>
                                        <div className="row formSection">
                                            <label className="col-md-4">Gender:</label>
                                            <div className="col-md-4">
                                            <select className="formGrp" name="gender" aria-required="true" aria-describedby="gender-error" aria-invalid="false">
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                            </div>
                                        </div>
                                        <div className="row formSection">
                                            <label className="col-md-4">Looking to Insure: <br /><span className="small">(Add Family Members to be Insured)</span></label>
                                            <div className="d-flex col-md-4" onClick={this.handleShow} href={'#'}>
                                                <input type="text"
                                                    placeholder="Select"
                                                    id="memberContainer"
                                                    readonly=""
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)} />
                                                <img src={require('../../assets/images/plus-sign.svg')} alt="" />
                                            </div>
                                        </div>
                                        <div className="cntrbtn">
                                            <button className="btnPrimary">Go</button>
                                        </div>
                                    </div>

                                </section>
                                <Footer />
                            </div>

                            <Modal className="customModal1" bsSize="md"
                                show={this.state.show}
                                onHide={this.handleClose}>
                                <div className="customModalfamlyForm">
                                    <div className="modal-header">
                                        <h4 className="modal-title">Add Family Members to be Insured</h4>
                                    </div>
                                    <Modal.Body>
                                        <div className="row formSection">
                                            <div className="col-md-4">
                                                <label className="customCheckBox formGrp formGrp">Self
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="formGrp error">
                                                    {/* <input type="text" 
                                    name="family[Self][dob]" 
                                    className="dobdatepicker hasDatepicker" 
                                    value="" 
                                    placeholder="Select DOB" 
                                    readonly="" 
                                    id="dp1590484875886" 
                                    aria-invalid="true" 
                                    aria-required="true" 
                                    /> */}
                                                    <DatePicker
                                                        // showTimeSelect
                                                        // timeFormat="HH:mm"
                                                        // timeIntervals={15}
                                                        // timeCaption="time"
                                                        minDate={new Date()}
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="DOB"
                                                        peekPreviousMonth
                                                        peekPreviousYear
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                    />

                                                    {/* <span className="error-message">Please enter dob</span> */}
                                                </label>
                                            </div>
                                        </div>


                                        <div className="row formSection">
                                            <div className="col-md-4">
                                                <label className="customCheckBox formGrp formGrp">Spouse
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="formGrp error">
                                                    <DatePicker
                                                        // showTimeSelect
                                                        // timeFormat="HH:mm"
                                                        // timeIntervals={15}
                                                        // timeCaption="time"
                                                        minDate={new Date()}
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="DOB"
                                                        peekPreviousMonth
                                                        peekPreviousYear
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                    />

                                                    {/* <span className="error-message">Please enter dob</span> */}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="row formSection">
                                            <div className="col-md-4">
                                                <label className="customCheckBox formGrp formGrp">Child 1
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="formGrp error">
                                                    <DatePicker
                                                        // showTimeSelect
                                                        // timeFormat="HH:mm"
                                                        // timeIntervals={15}
                                                        // timeCaption="time"
                                                        minDate={new Date()}
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="DOB"
                                                        peekPreviousMonth
                                                        peekPreviousYear
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                    />

                                                    {/* <span className="error-message">Please enter dob</span> */}
                                                </label>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="formGrp">
                                                    <select name="family[Child_1][gender]" aria-invalid="false">
                                                        <option value="">Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </select>
                                                </label>
                                                {/* <span className="error-message">Please enter dob</span> */}
                                            </div>
                                        </div>

                                        <div className="row formSection">
                                            <div className="col-md-4">
                                                <label className="customCheckBox formGrp formGrp">Father
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="formGrp error">
                                                    <DatePicker
                                                        // showTimeSelect
                                                        // timeFormat="HH:mm"
                                                        // timeIntervals={15}
                                                        // timeCaption="time"
                                                        minDate={new Date()}
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="DOB"
                                                        peekPreviousMonth
                                                        peekPreviousYear
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                    />

                                                    {/* <span className="error-message">Please enter dob</span> */}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="row formSection">
                                            <div className="col-md-4">
                                                <label className="customCheckBox formGrp formGrp">Mother
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="formGrp error">
                                                    <DatePicker
                                                        // showTimeSelect
                                                        // timeFormat="HH:mm"
                                                        // timeIntervals={15}
                                                        // timeCaption="time"
                                                        minDate={new Date()}
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="DOB"
                                                        peekPreviousMonth
                                                        peekPreviousYear
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                    />

                                                    {/* <span className="error-message">Please enter dob</span> */}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="row formSection">
                                            <div className="col-md-4">
                                                <label className="customCheckBox formGrp formGrp">Father in law
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="formGrp error">
                                                    <DatePicker
                                                        // showTimeSelect
                                                        // timeFormat="HH:mm"
                                                        // timeIntervals={15}
                                                        // timeCaption="time"
                                                        minDate={new Date()}
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="DOB"
                                                        peekPreviousMonth
                                                        peekPreviousYear
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                    />

                                                    {/* <span className="error-message">Please enter dob</span> */}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="row formSection m-b-45">
                                            <div className="col-md-4">
                                                <label className="customCheckBox formGrp formGrp">Mother in law
                                    <input type="checkbox"
                                                        name="family[Self][check]"
                                                        className="user-self"
                                                        id="family[Self][check]"
                                                        value="1"
                                                        aria-invalid="false" />
                                                    <span className="checkmark mL-0"></span>
                                                    <span className="error-message"></span>
                                                </label>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="formGrp error">
                                                    <DatePicker
                                                        // showTimeSelect
                                                        // timeFormat="HH:mm"
                                                        // timeIntervals={15}
                                                        // timeCaption="time"
                                                        minDate={new Date()}
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="DOB"
                                                        peekPreviousMonth
                                                        peekPreviousYear
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                    />

                                                    {/* <span className="error-message">Please enter dob</span> */}
                                                </label>
                                            </div>
                                        </div>
                                        <div className="cntrbtn"><button className="btnPrimary">Select</button></div>
                                    </Modal.Body>
                                </div>
                            </Modal>
                        </div>
                    </div>
                </BaseComponent>
            </>
        );
    }
}

export default InformationYourself;