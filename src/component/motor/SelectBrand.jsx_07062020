import React, { Component } from 'react';
import HeaderSecond from '../common/header/HeaderSecond';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import BrandTable from '../common/BrandTable';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const initialValues = {};

const vehicleValidation = Yup.object().shape({
    regNumber: Yup.string().required('Please enter valid registration number'),
   
   
});

class SelectBrand extends Component {

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
                        <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                            <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                            
                            <Formik initialValues={initialValues} 
                            onSubmit={this.handleSubmit} 
                            // validationSchema={vehicleValidation}
                            >
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                            return (
                            <Form>
                            <section className="brand">
                                <div className="brand-bg pd-30">
                                    <div className="d-flex justify-content-left">
                                        <div className="brandhead">
                                            <h4>Please select  your car brand </h4>
                                            <p>Lets start with your car details</p>
                                        </div>
                                    </div>

                                    <Row>
                                        <Col sm={12} md={9}>
                                            <BrandTable />

                                            <div className="d-flex justify-content-left resmb">
                                                <button className="backBtn">Back</button>
                                                <button className="proceedBtn" onClick={this.handleShow} >Continue</button>
                                            </div>
                                        </Col>

                                        <Col sm={12} md={3}>
                                            <div className="regisBox">
                                                <Row className="no-gutters m-b-25">
                                                    <Col sm={12} md={6}>
                                                        <div className="txtRegistr resmb-15">Registration No.
                                                        MH 01B4266</div>
                                                    </Col>

                                                    <Col sm={12} md={6}>
                                                        <button className="rgistrBtn">Edit</button>
                                                    </Col>
                                                </Row>

                                                <Row className="no-gutters">
                                                    <Col sm={12} md={6}>
                                                        <div className="txtRegistr resmb-15">Car Brand
                                                            Honda</div>
                                                    </Col>

                                                    <Col sm={12} md={6}>
                                                        <button className="rgistrBtn">Edit</button>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </section>
                            
                            <Modal className="customModal" bsSize="md"
                                show={this.state.show}
                                onHide={this.handleClose}>
                                <Modal.Body>
                                    <h3>Select Model </h3>
                                    <div><img src={require('../../assets/images/image-02.svg')} alt="" /></div>

                                    <div className="modalForm">
                                        <FormGroup>
                                            <div className="main">
                                                <input
                                                    name="search"
                                                    type="text"
                                                    placeholder="Search your variant "
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                            </div>
                                        </FormGroup>
                                        <div className="brdrbottom">
                                        <div className="d-flex justify-content-between">
                                                <div className="modalboxInfo">Accord
                                                    <span className="grey ml-5">1.2 E I-VTEC 1198CC</span>
                                                </div>
                                                <div>
                                                    <label className="slctmodalbox formGrp formGrp">
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
                                        </div>
                                        </div>

                                        <div className="brdrbottom">
                                        <div className="d-flex justify-content-between">
                                                <div className="modalboxInfo">Honda City
                                                    <span className="grey ml-5">1.2 E MT 1198CC</span>
                                                </div>
                                                <div>
                                                    <label className="slctmodalbox formGrp formGrp">
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
                                        </div>
                                        </div>

                                        <div className="brdrbottom">
                                        <div className="d-flex justify-content-between">
                                                <div className="modalboxInfo">NEON
                                                    <span className="grey ml-5">1.2 EX MT 1198CC</span>
                                                </div>
                                                <div>
                                                    <label className="slctmodalbox formGrp formGrp">
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
                                        </div>
                                        </div>

                                        <div className="brdrbottom">
                                        <div className="d-flex justify-content-between">
                                                <div className="modalboxInfo">BRIO
                                                    <span className="grey ml-5">1.2 S AT 1198CC</span>
                                                </div>
                                                <div>
                                                    <label className="slctmodalbox formGrp formGrp">
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
                                        </div>
                                        </div>

                                        <div className="brdrbottom">
                                        <div className="d-flex justify-content-between">
                                                <div className="modalboxInfo">Accord
                                                    <span className="grey ml-5">1.2 E I-VTEC 1198CC</span>
                                                </div>
                                                <div>
                                                    <label className="slctmodalbox formGrp formGrp">
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
                                        </div>
                                        </div>

                                        <div className="brdrbottom">
                                        <div className="d-flex justify-content-between">
                                                <div className="modalboxInfo">Honda City
                                                    <span className="grey ml-5">1.2 E MT 1198CC</span>
                                                </div>
                                                <div>
                                                    <label className="slctmodalbox formGrp formGrp">
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
                                        </div>
                                        </div>



                                    </div>
                                    <button className="proceedBtn" >Continue</button>
                                </Modal.Body>
                            </Modal>
                            </Form>
                                );
                            }}
                            </Formik>
                            </div>

                    </div>
                </div>
                </BaseComponent>
            </>
        );
    }
}

export default SelectBrand;