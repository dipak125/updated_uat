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
        seconds: 180,
        disable:true
      };

    checkOtp = (values, actions) => {
       this.props.loadingStart();
       const formData = new FormData();
       let otp_enter = Number(values.otp1+values.otp2+values.otp3+values.otp4+values.otp5)
       let post_data_obj = {
         'policy_ref_no': this.props.refNumber,
         'app_code': otp_enter
       }
       let encryption = new Encryption();
       formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

        axios
          .post('verify-appcode', formData)
          .then((res) => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)

            if(decryptResp.error == false) {
                this.setState({  errorMsg: "" });
                actions.setSubmitting(false);
                this.props.reloadPage(true);
            } 
            else {
                actions.setSubmitting(false);
                this.setState({ otp: "", errorMsg: decryptResp.msg });
                actions.setFieldValue('otp1', "")
                actions.setFieldValue('otp2', "")
                actions.setFieldValue('otp3', "")
                actions.setFieldValue('otp4', "")
                actions.setFieldValue('otp5', "")
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


    toUnicode= (elmnt,content)=>
    {
      //elmnt.target.form.elements[2].focus();
      //console.log(document.forms[0].elements.length);
      if (elmnt.key === "Delete" || elmnt.key === "Backspace") {
 
       
        //elmnt.target.form.elements[3].focus()
        
          const next=elmnt.target.tabIndex -2;
          // console.log(elmnt.target.tabIndex);
          
          //elmnt.target.form.elements[elmnt.target.tabIndex]="";
           if (next>-1){
           
            elmnt.target.form.elements[next].focus()
         }

    }
      else {
        if (content.length==elmnt.target.maxLength){
         const next=elmnt.target.tabIndex;
          if (next<5){
            elmnt.target.form.elements[next].focus()
        }
      }
    }
  
   
    }
    onKeyUp = (e) =>{
     
 
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
        let encryption = new Encryption();

        this.setState({
            seconds: 180, errorMsg: ""
          });
        axios
          .get(`sent-appcode/${this.props.refNumber}`)
          .then((res) => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            // console.log("decrypt--otp-------- ", decryptResp)

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

                      this.state.disable = true;
                      if(values.otp1 !="" && values.otp2 !="" && values.otp3 !="" && values.otp4 !="" && values.otp5 !="")
                      {
                       this.state.disable = false;
                      }

                    return (
                    <Form>
                        <div className="text-center boxotpmodl">
                            {/* <img src={require('../../assets/images/desk.svg')} alt="" className="m-b-25" /> */}
                            <div className="verfy">Digital consent form</div>
                            <div className="mobotp">An automated SMS & e-mail has been sent to customer with a Policy App code and Proposal link.</div>
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
                                       
                                        onChange={(e) => {
                                                setFieldValue('otp1', e.target.value);  
                                        }}
                                        onKeyPress={this.keyPressed}
                                        tabindex="1" maxlength="1" onKeyUp={e=>this.toUnicode(e,e.target.value)}
                                        
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
                                      
                                        onChange={(e) => {
                                            setFieldValue('otp2', e.target.value);  
                                    }}
                                    tabindex="2" maxlength="1" onKeyUp={e=>this.toUnicode(e,e.target.value)}
                                    
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
                                       
                                        onChange={(e) => {
                                            setFieldValue('otp3', e.target.value); 
                                             
                                    }}
                                    tabindex="3" maxlength="1" onKeyUp={e=>this.toUnicode(e,e.target.value)}
                                    
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
                                       
                                        onChange={(e) => {
                                            setFieldValue('otp4', e.target.value);  
                                    }}
                                    tabindex="4" maxlength="1" onKeyUp={e=>this.toUnicode(e,e.target.value)}
                                    
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
                                       
                                        onChange={(e) => {
                                            setFieldValue('otp5', e.target.value);  
                                    }}
                                    tabindex="5" maxlength="1" onKeyUp={e=>this.toUnicode(e,e.target.value)}
                                    
                                    />
                                </div>
                            </div>
                            <div className="m-b-25">
                            {/* <div className="sndSms">Resend Policy App code via SMS & e-mail</div> */}
                            <div>You can resend Policy App code in {seconds >= 0 ? seconds : 0} seconds</div>
                            {errorMsg ? 
                            <span className="errorMsg">{errorMsg}</span> : null }

                            </div>
                           
                            <div className="text-center">
                            <Button className={`proceedBtn`} type="button" onClick={this.generateOtp} >
                            Resend App code
                            </Button>
                            &nbsp;&nbsp;
                            <Button className={`proceedBtn`} type="submit" disabled = {this.state.disable?true:false}>
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