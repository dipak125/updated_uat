import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from 'yup';
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { setData } from "../../store/actions/data";
import { registrationNumberFirstBlock, registrationNumberSecondBlock, registrationNumberThirdBlock, registrationNumberLastBlock } from "../../shared/validationFunctions";

// const { t, i18n } = useTranslation();
// const href = "#";

const initialValues = {
    regNumber: '',
    reg_number_part_one: '',
    reg_number_part_two: '',
    reg_number_part_three: '',
    reg_number_part_four: '',
    check_registration: 2
}

const vehicleRegistrationValidation = Yup.object().shape({

    check_registration: Yup.string().notRequired(),

    reg_number_part_one: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string().required('RegistrationNumber')
        .test(
            "firstDigitcheck",
            function () {
                return "InvalidRegistrationNumber"
            },
            function (value) {         
                return registrationNumberFirstBlock(value);
            }
        ),
        otherwise: Yup.string().nullable()
    }),
    reg_number_part_two: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string()
        .test(
            "secondDigitcheck",
            function () {
                return "InvalidRegistrationNumber"
            },
            function (value) {         
                return registrationNumberSecondBlock(value);
            }
        ),
        otherwise: Yup.string().nullable()
    }),
    reg_number_part_three: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string()
        .test(
            "thirdDigitcheck",
            function () {
                return "InvalidRegistrationNumber"
            },
            function (value) {         
                return registrationNumberThirdBlock(value);
            }
        ),
        otherwise: Yup.string().nullable()
    }),
    reg_number_part_four: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string().required('RegistrationNumber')
            .test(
                "last4digitcheck",
                function () {
                    return "InvalidRegistrationNumber"
                },
                function (value) {         
                    return registrationNumberLastBlock(value);
                }
            ),
        otherwise: Yup.string().nullable()
    }),

    // regNumber: Yup.string()
    //     .test(
    //         "registrationNumberCheck",
    //         function () {
    //             return "RegistrationNumber"
    //         },
    //         function (value) {
    //             // console.log('YUP', value)
    //             if ((value == "" || value == undefined) && this.parent.check_registration == 2) {
    //                 return false;
    //             }
    //             return true;
    //         }
    //     ).test(
    //         "last4digitcheck",
    //         function () {
    //             return "InvalidRegistrationNumber"
    //         },
    //         function (value) {
    //             if (value && this.parent.check_registration == 2 && (value != "" || value != undefined)) {
    //                 return validRegistrationNumber(value);
    //             }
    //             return true;
    //         }
    //     ),

});

class Registration extends Component {

    state = {
        motorInsurance: '',
        regno: '',
        length: 14,
        fastlanelog: []
    }


    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }


    componentDidMount() {
        this.fetchData();

    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp)

                let motorInsurance = decryptResp.data.policyHolder.motorinsurance
                let fastlanelog = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.fastlanelog : {};
                this.setState({
                    motorInsurance, fastlanelog
                })
                this.props.loadingStop();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    fetchFastlane = (values) => {
        const formData = new FormData();
        var regNumber = values.reg_number_part_one+values.reg_number_part_two+values.reg_number_part_three+values.reg_number_part_four
        if (values.check_registration == '2') {
            formData.append('registration_no', regNumber)
            formData.append('menumaster_id', '1')
            this.props.loadingStart();
            axios.post('fastlane', formData).then(res => {

                if (res.data.error == false) {
                    this.props.loadingStop();
                    this.setState({ fastLaneData: res.data.data, brandView: '0' })
                    let fastLaneData = { 'fastLaneData': res.data.data }
                    this.props.setData(fastLaneData)
                }
                else {
                    this.props.loadingStop();
                    this.props.setData([])
                    this.setState({ fastLaneData: [], brandView: '1', vehicleDetails: [] })
                }
                this.handleSubmit(values, res.data.data)
            })
                .catch(err => {
                    this.props.loadingStop();
                })
        } else {
            this.props.setData([])
            this.handleSubmit(values, [])
        }

    }

    handleSubmit = (values, fastLaneData) => {

        const { productId } = this.props.match.params;
        const { fastlanelog } = this.state;

        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        var registration_part_numbers  = {}
        var regNumber = ""
        if(values.check_registration == '2') {
            registration_part_numbers  = {
                reg_number_part_one: values.reg_number_part_one,
                reg_number_part_two: values.reg_number_part_two,
                reg_number_part_three: values.reg_number_part_three,
                reg_number_part_four: values.reg_number_part_four
            } 
            regNumber = values.reg_number_part_one+values.reg_number_part_two+values.reg_number_part_three+values.reg_number_part_four
        }
        else {
            registration_part_numbers  = {
                reg_number_part_one: "",
                reg_number_part_two: "",
                reg_number_part_three: "",
                reg_number_part_four: ""
    
            } 
            regNumber = "NEW"
        }
        
        let policyHolder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') : 0

        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if (bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }

        if (policyHolder_id > 0) {
            if (sessionStorage.getItem('csc_id')) {
                post_data = {
                    'policy_holder_id': policyHolder_id,
                    'registration_no': regNumber,
                    'registration_part_numbers': JSON.stringify(registration_part_numbers),
                    'check_registration': values.check_registration,
                    'menumaster_id': 1,
                    'vehicle_type_id': productId,
                    'csc_id': sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                    'agent_name': sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                    'product_id': sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                    'bcmaster_id': "5",
                    'page_name': `Registration/${productId}`,

                }
            }
            else {
                post_data = {
                    'policy_holder_id': policyHolder_id,
                    'registration_no': regNumber,
                    'registration_part_numbers': JSON.stringify(registration_part_numbers),
                    'check_registration': values.check_registration,
                    'menumaster_id': 1,
                    'vehicle_type_id': productId,
                    'bcmaster_id': bc_data ? bc_data.agent_id : "",
                    'bc_token': bc_data ? bc_data.token : "",
                    'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                    'page_name': `Registration/${productId}`,

                }
            }

            console.log('post_data', post_data)
            formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))

            this.props.loadingStart();
            axios
                .post(`/update-registration`, formData)
                .then(res => {
                    if (res.data.error == false) {
                        this.props.history.push(`/select-brand/${productId}`);
                    }
                    else {
                        swal(res.data.msg)
                    }
                    this.props.loadingStop();

                })
                .catch(err => {
                    if (err && err.data) {
                        swal('Registratioon number required...');
                    }
                    this.props.loadingStop();
                });
        }
        else {
            if (sessionStorage.getItem('csc_id')) {
                post_data = {
                    'registration_no': regNumber,
                    'check_registration': values.check_registration,
                    'registration_part_numbers': JSON.stringify(registration_part_numbers),
                    'menumaster_id': 1,
                    'vehicle_type_id': productId,
                    'csc_id': sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                    'agent_name': sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                    'product_id': sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                    'bcmaster_id': "5",
                    'page_name': `Registration/${productId}`,

                }
            }
            else {
                post_data = {
                    'registration_no': regNumber,
                    'check_registration': values.check_registration,
                    'registration_part_numbers': JSON.stringify(registration_part_numbers),
                    'menumaster_id': 1,
                    'vehicle_type_id': productId,
                    'bcmaster_id': bc_data ? bc_data.agent_id : "",
                    'bc_token': bc_data ? bc_data.token : "",
                    'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                    'page_name': `Registration/${productId}`,

                }
            }
            console.log('post_data', post_data)
            formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
            this.props.loadingStart();
            axios
                .post(`/registration`, formData)
                .then(res => {
                    if (res.data.error == false) {
                        localStorage.setItem('policyHolder_id', res.data.data.policyHolder_id);
                        localStorage.setItem('policyHolder_refNo', res.data.data.policyHolder_refNo);
                        this.props.history.push(`/select-brand/${productId}`);
                    }
                    else {
                        swal(res.data.msg)
                    }
                    this.props.loadingStop();
                })
                .catch(err => {
                    if (err && err.data) {
                        swal('Please check..something went wrong!!');
                    }
                    this.props.loadingStop();
                });
        }
    }

    setValueData = () => {
        var checkBoxAll = document.getElementsByClassName('user-self');
        for (const a in checkBoxAll) {
            if (checkBoxAll[a].checked) {
                return true
            }
        }
        return false
    }

    regnoFormat = (e, setFieldTouched, setFieldValue) => {

        let regno = e.target.value
        e.target.value = regno.toUpperCase()

    }


    render() {
        const { motorInsurance } = this.state
        var tempRegNo = motorInsurance && JSON.parse(motorInsurance.registration_part_numbers)
        const newInitialValues = Object.assign(initialValues, {
            reg_number_part_one: tempRegNo && tempRegNo.reg_number_part_one,
            reg_number_part_two: tempRegNo && tempRegNo.reg_number_part_two,
            reg_number_part_three: tempRegNo && tempRegNo.reg_number_part_three,
            reg_number_part_four: tempRegNo && tempRegNo.reg_number_part_four,
	        regNumber: motorInsurance ? motorInsurance.registration_no : '',
            check_registration: motorInsurance && motorInsurance.registration_no == "NEW" ? '1' : '2'
        })
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        

        return (
            <>
                <BaseComponent>
                    {phrases ?
					<div className="page-wrapper">
					
                        <div className="container-fluid">
                            <div className="row">
							
                                <aside className="left-sidebar">
		 						 <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
								 <SideNav />
								 </div>
								</aside>
								
                                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox registerbr">
                                    <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                                    <section className="brand">
                                        <div className="boxpd">
                                            <h4 className="m-b-30">{phrases['About']}</h4>
                                            <Formik initialValues={newInitialValues}
                                                onSubmit={this.fetchFastlane}
                                                validationSchema={vehicleRegistrationValidation}>
                                                {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                                    return (
                                                        <Form>
                                                            <div className="row formSection">
                                                                <label className="col-md-4">{phrases['RegName']} :</label>
                                                                <div className="col-md-1">

                                                                    <Field
                                                                        name="reg_number_part_one"
                                                                        type="text"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value={values.reg_number_part_one}
                                                                        disabled= {values.check_registration == '1' ? true : false}
                                                                        maxLength="2"
                                                                        onInput={e => {
                                                                            this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                                            setFieldTouched('check_registration')
                                                                            setFieldValue('check_registration', '2');
                                                                        }}

                                                                    />
                                                                </div>
                                                                <div className="col-md-1">

                                                                    <Field
                                                                        name="reg_number_part_two"
                                                                        type="text"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value={values.reg_number_part_two}
                                                                        disabled= {values.check_registration == '1' ? true : false}
                                                                        maxLength="3"
                                                                        onInput={e => {
                                                                            this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                                            setFieldTouched('check_registration')
                                                                            setFieldValue('check_registration', '2');
                                                                        }}

                                                                    />         
                                                                </div>
                                                                <div className="col-md-1">

                                                                    <Field
                                                                        name="reg_number_part_three"
                                                                        type="text"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value={values.reg_number_part_three}
                                                                        disabled= {values.check_registration == '1' ? true : false}
                                                                        maxLength="3"
                                                                        onInput={e => {
                                                                            this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                                            setFieldTouched('check_registration')
                                                                            setFieldValue('check_registration', '2');
                                                                        }}

                                                                    />
                                                                </div>
                                                                <div className="col-md-1">

                                                                    <Field
                                                                        name="reg_number_part_four"
                                                                        type="text"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value={values.reg_number_part_four}
                                                                        disabled= {values.check_registration == '1' ? true : false}
                                                                        maxLength="4"
                                                                        onInput={e => {
                                                                            this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                                            setFieldTouched('check_registration')
                                                                            setFieldValue('check_registration', '2');
                                                                        }}

                                                                    />
                                                                </div>
                                                                {(errors.reg_number_part_one || errors.reg_number_part_two || errors.reg_number_part_three || errors.reg_number_part_four) 
                                                                && (touched.reg_number_part_one || touched.reg_number_part_two || touched.reg_number_part_three || touched.reg_number_part_four) ? (
                                                                        <span className="errorMsg">{phrases["InvalidRegistrationNumber"]}</span>
                                                                    ) : null}
                                                            </div>
                                                            <div className="row formSection">
                                                                <label className="customCheckBox formGrp formGrp">
                                                                    {phrases['WithoutNo']}
                                                                    <Field
                                                                        type="checkbox"
                                                                        name="check_registration"
                                                                        value="1"
                                                                        className="user-self"
                                                                        onChange={(e) => {
                                                                            if (e.target.checked === true) {
                                                                                setFieldTouched('reg_number_part_one')
                                                                                setFieldValue('reg_number_part_one', '');
                                                                                setFieldTouched('reg_number_part_two')
                                                                                setFieldValue('reg_number_part_two', '');
                                                                                setFieldTouched('reg_number_part_three')
                                                                                setFieldValue('reg_number_part_three', '');
                                                                                setFieldTouched('reg_number_part_four')
                                                                                setFieldValue('reg_number_part_four', '');
                                                                                setFieldTouched('check_registration')
                                                                                setFieldValue('check_registration', e.target.value);

                                                                            } else {
                                                                                setFieldTouched('reg_number_part_one')
                                                                                setFieldValue('reg_number_part_one', '');
                                                                                setFieldTouched('reg_number_part_two')
                                                                                setFieldValue('reg_number_part_two', '');
                                                                                setFieldTouched('reg_number_part_three')
                                                                                setFieldValue('reg_number_part_three', '');
                                                                                setFieldTouched('reg_number_part_four')
                                                                                setFieldValue('reg_number_part_four', '');
                                                                                setFieldTouched('check_registration')
                                                                                setFieldValue('check_registration', '2');                                                                            }
                                                                            if (this.setValueData()) {
                                                                                this.setState({
                                                                                    check_registration: 1
                                                                                })
                                                                            }
                                                                            else {
                                                                                this.setState({
                                                                                    check_registration: 2
                                                                                })
                                                                            }
                                                                        }}
                                                                        checked={values.check_registration == '1' ? true : false}
                                                                    />
                                                                    <span className="checkmark mL-0"></span>
                                                                </label>
                                                                {errors.check_registration ?
                                                                    <span className="error-message">{errors.check_registration}</span> : ""
                                                                }
                                                                
                                                            </div>
                                                            <div className="cntrbtn">
                                                                <Button className={`btnPrimary`} type="submit" >
                                                                    {phrases['Go']}
                                                                </Button>


                                                            </div>
                                                        </Form>
                                                    );
                                                }}
                                            </Formik>
                                        </div>

                                    </section>
                                    <Footer />
                                </div>
                            </div>
							</div>
                        </div> : null}
                </BaseComponent>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        loading: state.loader.loading,
        data: state.processData.data
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
        setData: (data) => dispatch(setData(data))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Registration));