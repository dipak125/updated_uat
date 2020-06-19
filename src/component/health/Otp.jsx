import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import { Formik, Field, Form } from "formik";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios";
import Encryption from '../../shared/payload-encryption';

// import OtpInput from 'react-otp-input';

const initialValue = {
    otp1: "",
    otp2: "",
    otp3: "",
    otp4: "",
    otp5: ""
}

class Otp extends Component {

    state = {
        otp: "",
        errorMsg: "",
        seconds: 20
      };

    checkOtp = (values, actions) => {
        this.props.loadingStart();
        const formData = new FormData();
       // formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));
       // formData.append("menumaster_id", '2');
       let post_data_obj = {
         'policy_holder_id':localStorage.getItem('policyHolder_id'),
         'menumaster_id':'2'
       }
       let encryption = new Encryption();
       formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

        axios
          .post('/otp/check-status', formData)
          .then((res) => {
            if(res.data.error == false) {
                actions.setSubmitting(false);
                this.handleSubmit(values, actions, res.data.data.otp)
            } 
            else {
                actions.setSubmitting(false);
                this.setState({ otp: "", errorMsg: res.data.msg });
            } 
            this.props.loadingStop();         
          })
          .catch((err) => {
            this.setState({
              otp: "",
            });
            this.props.loadingStop();
          });
    };

    handleSubmit = (values,actions, otp) => {
        let otp_enter = Number(values.otp1+values.otp2+values.otp3+values.otp4+values.otp5)
        if(otp_enter == Number(otp)){
            this.props.reloadPage(otp_enter);
        }
        else {
            actions.setFieldValue('otp1', "")
            actions.setFieldValue('otp2', "")
            actions.setFieldValue('otp3', "")
            actions.setFieldValue('otp4', "")
            actions.setFieldValue('otp5', "")
            this.setState({ errorMsg: "Wrong OTP" });
        }        
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

    generateOtp = () => {
        this.props.loadingStart();
        const formData = new FormData();
       // formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));
       // formData.append("menumaster_id", '2');
        let post_data_obj = {
          'policy_holder_id':localStorage.getItem('policyHolder_id'),
          'menumaster_id':'2'
        }
        let encryption = new Encryption();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

        this.setState({
            seconds: 20, errorMsg: ""
          });
        axios
          .post('/otp/generate', formData)
          .then((res) => {
            this.props.loadingStop();
            this.getOtp()
          })
          .catch((err) => {
            this.setState({
              otp: "",
            });
            this.props.loadingStop();
          });
      };

      getOtp = () => {
        this.props.loadingStart();
        const formData = new FormData();
        //formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));
        //formData.append("menumaster_id", '2');
        let post_data_obj = {
          'policy_holder_id':localStorage.getItem('policyHolder_id'),
          'menumaster_id':'2'
        }
        let encryption = new Encryption();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
        axios
          .post('/otp/check-status', formData)
          .then((res) => {
            if(res.data.error == false) {
                this.setState({ otp: res.data.data.otp });
            } 
            else {
                this.setState({ otp: "", errorMsg: res.data.msg });
            } 
            this.props.loadingStop();         
          })
          .catch((err) => {
            this.setState({
              otp: "",
            });
            this.props.loadingStop();
          });
      };

      coundown = () => {
        this.myInterval = setInterval(() => {
            this.setState(({ seconds }) => ({
              seconds: seconds - 1
            }))
          }, 1000) 
      }


    componentDidMount() {
        this.generateOtp();  
        this.coundown();
        
      }
    
    render() {
        const {otp, errorMsg, seconds} = this.state

        const newInitialValues = Object.assign(initialValue, {
            otp1: errorMsg ? "" : "",
            otp2: errorMsg ? "" : "",
            otp3: errorMsg ? "" : "",
            otp4: errorMsg ? "" : "",
            otp5: errorMsg ? "" : "",
        })
        return (
           
                <Formik initialValues={initialValue} onSubmit={this.checkOtp}
                    // validationSchema={validateNominee}
                    >
                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                    return (
                    <Form>
                        <div className="text-center boxotpmodl">
                            <img src={require('../../assets/images/desk.svg')} alt="" className="m-b-25" />
                            <div className="verfy">Verify OTP</div>
                            <div className="mobotp">Your one time password (OTP)  is sent to your registered mobile number XXXXXXX 445.</div>
                            <span className="errorMsg">{otp}</span>

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
                                        maxLength="1"
                                        onChange={(e) => {
                                                setFieldValue('otp1', e.target.value);  
                                        }}
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
                                        maxLength="1"
                                        onChange={(e) => {
                                            setFieldValue('otp2', e.target.value);  
                                    }}
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
                                        maxLength="1"
                                        onChange={(e) => {
                                            setFieldValue('otp3', e.target.value);  
                                    }}
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
                                        maxLength="1"
                                        onChange={(e) => {
                                            setFieldValue('otp4', e.target.value);  
                                    }}
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
                                        maxLength="1"
                                        onChange={(e) => {
                                            setFieldValue('otp5', e.target.value);  
                                    }}
                                    />
                                </div>
                            </div>
                            <div className="m-b-25">
                            <div className="sndSms">Resend OTP via SMS</div>
                            <div>You can resend OTP in {seconds >= 0 ? seconds : 0} seconds</div>
                            {errorMsg ? 
                            <span className="errorMsg">{errorMsg}</span> : null }

                            </div>
                           
                            <div className="text-center">
                            <Button className={`proceedBtn`} type="button" onClick={this.generateOtp} >
                            Resend OTP
                            </Button>

                            <Button className={`proceedBtn`} type="submit" >
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