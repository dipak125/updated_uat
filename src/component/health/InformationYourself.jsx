import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, ButtonToolbar } from 'react-bootstrap';
// import DatePicker from "react-datepicker";
import DatePicker from "react-date-picker";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from 'formik';


const initialValues = {};

class InformationYourself extends Component {
    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,  
            selectedMember: [],
            memberInfo: []
        };
    }

    handleSubmit = (values) => {
        var drv = [];
        var memberInfo = [];
        const formData = new FormData(); 
        for (const key in values) {
            if (values.hasOwnProperty(key)) {
                formData.append(key, values[key]);
                if(values[key] === '1') {                
                    drv.push(key);                 
                }      
                memberInfo.push(key,values[key]);
            }
        }
        this.setState({
            selectedMember: drv, memberInfo: memberInfo
        })
        this.handleClose();
    }

    medicalQuestions = (productId,memberInfo) => {
        this.props.history.push(`/MedicalDetails/${productId}/${memberInfo}`);
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
        const {selectedMember, show, memberInfo} = this.state
        const {productId} = this.props
        // console.log("localStorage", localStorage.getItem('customerInfo'))
        console.log("memberInfo", memberInfo)
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
                                                    value = {selectedMember}
                                                    readonly=""
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)} />
                                                <img src={require('../../assets/images/plus-sign.svg')} alt="" />
                                            </div>
                                        </div>
                                        <div className="cntrbtn">
                                            <button className="btnPrimary" onClick= {this.medicalQuestions.bind(this,productId,memberInfo )}>Go</button>
                                        </div>
                                    </div>

                                </section>
                                <Footer />
                            </div>

                            <Modal className="customModal1" bsSize="md"
                                show={show}
                                onHide={this.handleClose}>
                                <div className="customModalfamlyForm">
                                    <div className="modal-header">
                                        <h4 className="modal-title">Add Family Members to be Insured</h4>
                                    </div>
                                    <Modal.Body>
                                        <div className="row formSection">
                                            <Formik initialValues={initialValues} 
                                            onSubmit={this.handleSubmit} 
                                            // validationSchema={vehicleInspectionValidation}
                                            >
                                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                                return (
                                                <Form>
                                                    <Row xs={12} sm={12} md={12}>
                                                    <Col xs={12} sm={6} md={4}>
                                                        <div className="col-md-4">
                                                        <label className="customCheckBox formGrp formGrp">Self</label>
                                                        <Field
                                                            type="checkbox"
                                                            name="self"
                                                            value="1"
                                                            onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('self', '1');
                                                            } else {
                                                                setFieldValue('self', '0');
                                                                setFieldValue("selfDob", '');
                                                            }
                                                        }}
                                                        checked={values.self == '1' ? true : false}
                                                />
                                                        <DatePicker
                                                            name="selfDob"
                                                            onChange={(value) => {
                                                            setFieldTouched("selfDob");
                                                            setFieldValue("selfDob", value);
                                                            }}
                                                            value={values.selfDob}
                                                        />
                                                        {errors.selfDob ? (
                                                                <span className="errorMsg">{errors.selfDob}</span>
                                                            ) : null }
                                                        </div>
                                                    </Col>
                                                    </Row>

                                                    <Row xs={12} sm={12} md={12}>
                                                    <Col xs={12} sm={6} md={4}>
                                                        <div className="col-md-4">
                                                        <label className="customCheckBox formGrp formGrp">Spouse</label>
                                                        <Field
                                                            type="checkbox"
                                                            name="spouse"
                                                            value="1"
                                                            onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('spouse', '1');
                                                            } else {
                                                                setFieldValue('spouse', '0');
                                                                setFieldValue("spouseDob", '');
                                                            }
                                                        }}
                                                        checked={values.spouse == '1' ? true : false}
                                                />
                                                        <DatePicker
                                                            name="spouseDob"
                                                            onChange={(value) => {
                                                            setFieldTouched("spouseDob");
                                                            setFieldValue("spouseDob", value);
                                                            }}
                                                            value={values.spouseDob}
                                                        />
                                                        {errors.spouseDob ? (
                                                                <span className="errorMsg">{errors.spouseDob}</span>
                                                            ) : null }
                                                        </div>
                                                    </Col>
                                                    </Row>

                                                    <Row xs={12} sm={12} md={12}>
                                                    <Col xs={12} sm={6} md={4}>
                                                        <div className="col-md-4">
                                                        <label className="customCheckBox formGrp formGrp">Child 1</label>
                                                        <Field
                                                            type="checkbox"
                                                            name="child1"
                                                            value="1"
                                                            onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('child1', '1');
                                                            } else {
                                                                setFieldValue('child1', '0');
                                                                setFieldValue("child1Dob", '');
                                                            }
                                                        }}
                                                        checked={values.child1 == '1' ? true : false}
                                                />
                                                        <DatePicker
                                                            name="child1Dob"
                                                            onChange={(value) => {
                                                            setFieldTouched("child1Dob");
                                                            setFieldValue("child1Dob", value);
                                                            }}
                                                            value={values.child1Dob}
                                                        />
                                                        {errors.child1Dob ? (
                                                                <span className="errorMsg">{errors.child1Dob}</span>
                                                            ) : null }
                                                        </div>
                                                    </Col>                                                  
                                                    </Row>

                                                    <Row xs={12} sm={12} md={12}>
                                                    <Col xs={12} sm={6} md={4}>
                                                        <div className="col-md-4">
                                                        <label className="customCheckBox formGrp formGrp">Father</label>
                                                        <Field
                                                            type="checkbox"
                                                            name="father"
                                                            value="1"
                                                            onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('father', '1');
                                                            } else {
                                                                setFieldValue('father', '0');
                                                                setFieldValue("fatherDob", '')
                                                            }
                                                        }}
                                                        checked={values.father == '1' ? true : false}
                                                />
                                                        <DatePicker
                                                            name="fatherDob"
                                                            onChange={(value) => {
                                                            setFieldTouched("fatherDob");
                                                            setFieldValue("fatherDob", value);
                                                            }}
                                                            value={values.fatherDob}
                                                        />
                                                        {errors.fatherDob ? (
                                                                <span className="errorMsg">{errors.fatherDob}</span>
                                                            ) : null }
                                                        </div>
                                                    </Col>
                                                    </Row>

                                                    <Row xs={12} sm={12} md={12}>
                                                    <Col xs={12} sm={6} md={4}>
                                                        <div className="col-md-4">
                                                        <label className="customCheckBox formGrp formGrp">Mother</label>
                                                        <Field
                                                            type="checkbox"
                                                            name="mother"
                                                            value="1"
                                                            onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('mother', '1');
                                                            } else {
                                                                setFieldValue('mother', '0');
                                                                setFieldValue("motherDob", '');
                                                            }
                                                        }}
                                                        checked={values.mother == '1' ? true : false}
                                                />
                                                        <DatePicker
                                                            name="motherDob"
                                                            onChange={(value) => {
                                                            setFieldTouched("motherDob");
                                                            setFieldValue("motherDob", value);
                                                            }}
                                                            value={values.motherDob}
                                                        />
                                                        {errors.motherDob ? (
                                                                <span className="errorMsg">{errors.motherDob}</span>
                                                            ) : null }
                                                        </div>
                                                    </Col>
                                                    </Row>


                                                    <ButtonToolbar>

                                                    <Button className={`btnPrimary`}
                                                        type="submit" 
                                                        disabled={isSubmitting ? true : false}
                                                    >
                                                        {isSubmitting ? 'Wait' : 'Submit'}
                                                    </Button>      
                                                    </ButtonToolbar>
                                                </Form>
                                                );
                                            }}
                                            </Formik>

                                        </div>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(InformationYourself));