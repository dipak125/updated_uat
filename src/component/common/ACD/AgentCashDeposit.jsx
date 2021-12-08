import React, { Component } from 'react';
import BaseComponent from '../../BaseComponent';
import { Row, Col, Button, FormGroup } from 'react-bootstrap';
import swal from 'sweetalert';
import SideNav from '../side-nav/SideNav';
import Footer from '../footer/Footer';
import axios from "../../../shared/axios"
import { loaderStart, loaderStop } from "../../../store/actions/loader";
import { connect } from "react-redux";
import Encryption from '../../../shared/payload-encryption';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";
import queryString from 'query-string';

class AgentCashDeposit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            agentData: [],
            toggleACD: true,
            account_number: "",
            balanceAmount: "",
            showError: false,
        }

    }

    fetchBalanceAmount = () => {
        const formData = new FormData();
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data) {

            let encryption = new Encryption();
            user_data = JSON.parse(encryption.decrypt(user_data.user));

            const user_id = user_data.master_user_id ? user_data.master_user_id : null;
            var formObj = {
                user_id
            };
            formData.append('enc_data', encryption.encrypt(JSON.stringify(formObj)))
            
            axios.post(`acd/acd-balance`, formData)
                .then(res => {
                    let encryption = new Encryption();
                    var balanceDetails = JSON.parse(encryption.decrypt(res.data));

                    if (balanceDetails.error == true) {
                        swal("Unable to fetch amount", {
                            icon: "error",
                        })
                    } else {
                        this.setState({
                            balanceAmount: balanceDetails.data.balanceAmount
                        })
                    }
                    this.props.loadingStop();
                }).
                catch(err => {
                    console.log(err);
                    console.log("User Id", `acd/acd-balance/${user_id}`);
                    this.props.loadingStop();
                })
        }
    }

    actionFormatter = (acd_amount) => {
        if (acd_amount == '' || acd_amount == undefined) {
            this.setState({
                showError: true
            })
        } else {
            window.open(`${process.env.REACT_APP_PAYMENT_URL}/razorpay/acd_pay.php?account_number=${this.state.agentData.account_number}&amount=${acd_amount}`, "_self");
        }

    }
    removeErrorMsg = () => {
        this.setState({
            showError: false
        })
    }

    handleSubmit = () => {
        const formData = new FormData();

        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data) {
            let encryption = new Encryption();
            user_data = JSON.parse(encryption.decrypt(user_data.user));

            const user_id = user_data.master_user_id ? user_data.master_user_id : null;
            console.log("User Id", user_id);
            formData.append("user_id", user_id);
            axios.post('acd/acd-create', formData)
                .then(res => {
                    console.log("RESPONSE ACD=>", res);
                    if (res.data.error == false) {
                        const account_number = res.data.data.accountNumber;
                        console.log("account_number", account_number);
                        this.setState({
                            account_number: account_number
                        })
                        this.fetchACD();
                        swal(res.data.msg, {
                            icon: "success",
                        })
                    } else {
                        swal(res.data.msg, {
                            icon: "error",
                        })
                    }
                    this.props.loadingStop();
                }).
                catch(err => {
                    console.log(err);
                    this.props.loadingStop();
                })
        }
    }

    fetchACD = () => {
        const formData = new FormData();
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data) {
            let encryption = new Encryption();
            user_data = JSON.parse(encryption.decrypt(user_data.user));

            const user_id = user_data.master_user_id ? user_data.master_user_id : null;
            formData.append("user_id", user_id);
            axios.post('acd/acd-agent', formData)
                .then(res => {
                    if (res.error == false) {
                    } else {
                        this.setState({
                            agentData: res.data.data
                        })
                    }
                    this.props.loadingStop();
                }).
                catch(err => {
                    console.log(err);
                    this.props.loadingStop();
                })
        }


    }
    componentDidUpdate() {
        // this.fetchACD();
    }

    componentDidMount() {
        this.fetchACD();
        this.paymentmesg();
    }

    paymentmesg = () => {
        const payment_status = queryString.parse(this.props.location.search).status;
        if (payment_status == 'pay_cancel' || payment_status == 'pay_fail') {
            swal("Something went wrong.", {
                icon: "error",
            })
            this.props.history.push(`/AgentCashDeposit/`);
        }
        else if (payment_status == 'pay_success') {
            swal("Successfully cash deposited.", {
                icon: "success",
            })
            this.props.history.push(`/AgentCashDeposit/`);
        }
    }

    render() {
        const { agentData, toggleACD, account_number, balanceAmount, showError } = this.state;
        {
            console.log('tettetette', agentData);
        }
        const formValues = {
            agreement_code: agentData.agreement_code,
            intermediary_code: agentData.intermediary_code,
            user_name: agentData.intermediary_name,
            credit_date: agentData.credit_date
        }
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null;

        return (
            <BaseComponent>
                <div className="page-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            <aside className="left-sidebar">
                                <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
                                    <SideNav />
                                </div>
                            </aside>

                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox">
                                <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                                <div className="contBox m-b-45 tickedTable">
                                    <h4 className="text-center mt-3 mb-3">Agent Cash Deposit</h4>
                                    <Formik initialValues={formValues}
                                        onSubmit={this.handleSubmit}
                                        enableReinitialize
                                    >
                                        {({ values, errors, setFieldValue, setFieldTouched, touched }) => {
                                            return (
                                                <Form>
                                                    <div className="rghtsideTrigr collinput W-90 m-b-30 collaps_area">
                                                        <Collapsible openedClassName="custom_ovberflow" trigger='Create ACD' open={toggleACD}>
                                                            <div className="listrghtsideTrigr">
                                                                <Row>
                                                                    <Col sm={12} md={12} lg={10}>
                                                                        <Row>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <span className="fs-16">Agent Code</span>
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <Field
                                                                                            name="intermediary_code"
                                                                                            type="text"
                                                                                            className="premiumslid"
                                                                                            value={values.intermediary_code}
                                                                                            disabled
                                                                                        />
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={3} lg={2}>&nbsp;</Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <span className="fs-16">Agent Name</span>
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <Field
                                                                                            name="user_name"
                                                                                            type="text"
                                                                                            className="premiumslid"
                                                                                            value={values.user_name}
                                                                                            disabled
                                                                                        />
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={3} lg={2}>&nbsp;</Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <span className="fs-16">Agreement Code</span>
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <Field
                                                                                            name="agreement_code"
                                                                                            type="text"
                                                                                            className="premiumslid"
                                                                                            value={values.agreement_code}
                                                                                            disabled
                                                                                        />
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={3} lg={2}>&nbsp;</Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <span className="fs-16">Credit date</span>
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <Field
                                                                                            name="credit_date"
                                                                                            type="text"
                                                                                            className="premiumslid"
                                                                                            value={values.credit_date}
                                                                                            disabled
                                                                                        />
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={3} lg={2}>&nbsp;</Col>
                                                                        </Row>
                                                                        <Row>
                                                                            &nbsp;
                                                                            <Col sm={12} md={6} lg={5}>
                                                                                &nbsp;
                                                                            </Col>
                                                                            {(agentData.account_number === '' ? <Col sm={12} md={4} lg={4}>
                                                                                <Button className={`proceedBtn`} type="submit" >
                                                                                    Create ACD
                                                                                </Button>
                                                                            </Col> : null)}
                                                                        </Row>
                                                                    </Col>
                                                                </Row>
                                                                <Row><Col>&nbsp;</Col></Row>
                                                            </div>
                                                        </Collapsible>


                                                        <Collapsible openedClassName="custom_ovberflow" trigger='Amount deposit in ACD account' open={false} >
                                                            <div className="listrghtsideTrigr">
                                                                <Row>
                                                                    <Col sm={12} md={12} lg={10}>
                                                                        <Row>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <span className="fs-16">ACD Account Number</span>
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <Field
                                                                                            name="acd_account_no"
                                                                                            type="text"
                                                                                            className="premiumslid"
                                                                                            value={agentData.account_number ? agentData.account_number : account_number}
                                                                                            readOnly
                                                                                        />
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={3} lg={2}>&nbsp;</Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <span className="fs-16">Amount want to add</span>
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <Field
                                                                                            name="acd_amount"
                                                                                            type="text"
                                                                                            className="premiumslid"
                                                                                            value={values.acd_amount}
                                                                                            onKeyPress={this.removeErrorMsg}
                                                                                        />
                                                                                        {showError ? (
                                                                                            <span className="errorMsg">Please enter amount</span>
                                                                                        ) : null}
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={3} lg={2}>&nbsp;</Col>
                                                                        </Row>
                                                                        <Row>
                                                                            &nbsp;
                                                                            <Col sm={12} md={6} lg={5}>
                                                                                &nbsp;
                                                                            </Col>
                                                                            <Col sm={12} md={3} lg={2}>
                                                                                <Button className={`proceedBtn`} onClick={() => {
                                                                                    this.actionFormatter(values.acd_amount)

                                                                                }}>
                                                                                    Pay Now
                                                                                </Button>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>
                                                                <Row><Col>&nbsp;</Col></Row>
                                                            </div>
                                                        </Collapsible>

                                                        <Collapsible openedClassName="custom_ovberflow" trigger='Balance Amount in ACD account' open={false} >
                                                            <div className="listrghtsideTrigr">
                                                                <Row>
                                                                    <Col sm={12} md={12} lg={10}>
                                                                        <Row>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <FormGroup>
                                                                                    <div className="insurerName">
                                                                                        <span className="fs-16">Amount</span>
                                                                                    </div>
                                                                                </FormGroup>
                                                                            </Col>
                                                                            <Col sm={12} md={6} lg={4}>
                                                                                <span>{balanceAmount}</span>
                                                                            </Col>
                                                                            <Col sm={12} md={3} lg={2}>&nbsp;</Col>
                                                                        </Row>

                                                                        <Row>
                                                                            &nbsp;
                                                                            <Col sm={12} md={6} lg={5}>
                                                                                &nbsp;
                                                                            </Col>
                                                                            <Col sm={12} md={3} lg={4}>
                                                                                <Button className={`proceedBtn`} onClick={this.fetchBalanceAmount} >
                                                                                    Balance Credit limit
                                                                                </Button>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>
                                                                <Row><Col>&nbsp;</Col></Row>
                                                            </div>
                                                        </Collapsible>

                                                    </div>
                                                </Form>
                                            );
                                        }}
                                    </Formik>
                                    <Row>
                                        &nbsp;
                                    </Row>

                                </div>
                            </div>
                            <Footer />
                        </div>
                    </div>
                </div>
            </BaseComponent >
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

export default connect(mapStateToProps, mapDispatchToProps)(AgentCashDeposit);
