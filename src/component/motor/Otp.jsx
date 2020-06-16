import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import { Formik, Field, Form } from "formik";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";

const initialValue = {}

class Otp extends Component {

    handleSubmit = (values) => {
        this.props.reloadPage(values.otp1+values.otp2+values.otp3+values.otp4+values.otp5+values.otp6);
        // this.props.otp(values.otp);
        // this.props.history.push(`/ThankYou_motor`);
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
        console.log(this.props)
        return (
                <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                    // validationSchema={validateNominee}
                    >
                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                    return (
                    <Form>
                        <div className="text-center boxotpmodl">
                            <img src={require('../../assets/images/desk.svg')} alt="" className="m-b-25" />
                            <div className="verfy">Verify OTP</div>
                            <div className="mobotp m-b-25">Your one time password (OTP)  is sent to your registered mobile number XXXXXXX 445.</div>


                            <div className="d-flex justify-content-center otpInputWrap mx-auto m-b-25">
                                <div className="mr-1 ml-1">
                                    <Field
                                        name="otp1"
                                        type="text"
                                        autoComplete="off"
                                        className="form-control placeHCenter"
                                        value = {values.otp1}
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                    />
                                </div>
                                <div className="mr-1 ml-1">
                                    <Field
                                        name="otp2"
                                        type="text"
                                        autoComplete="off"
                                        className="form-control placeHCenter"
                                        value = {values.otp2}
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                    />
                                </div>
                                <div className="mr-1 ml-1">
                                    <Field
                                        name="otp3"
                                        type="text"
                                        autoComplete="off"
                                        className="form-control placeHCenter"
                                        value = {values.otp3}
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                    />
                                </div>
                                <div className="mr-1 ml-1">
                                    <Field
                                        name="otp4"
                                        type="text"
                                        autoComplete="off"
                                        className="form-control placeHCenter"
                                        value = {values.otp4}
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                    />
                                </div>
                                <div className="mr-1 ml-1">
                                    <Field
                                        name="otp5"
                                        type="text"
                                        autoComplete="off"
                                        className="form-control placeHCenter"
                                        value = {values.otp5}
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                    />
                                </div>
                                <div className="mr-1 ml-1">
                                    <Field
                                        name="otp6"
                                        type="text"
                                        autoComplete="off"
                                        className="form-control placeHCenter"
                                        value = {values.otp6}
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
                            <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                {isSubmitting ? 'Wait..' : 'Continue'}
                            </Button> 
                            </div>
                        </div>  
                    </Form>
                    );
                }}
                </Formik>

        )
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Otp));