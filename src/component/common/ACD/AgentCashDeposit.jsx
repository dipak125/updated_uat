import React, { Component } from 'react';
import BaseComponent from '../../BaseComponent';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';

import swal from 'sweetalert';
import SideNav from '../side-nav/SideNav';
import Footer from '../footer/Footer';
import LinkWithTooltip from "../../../shared/LinkWithTooltip";
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";
import axios from "../../../shared/axios"
import { loaderStart, loaderStop } from "../../../store/actions/loader";
import { connect } from "react-redux";
import Encryption from '../../../shared/payload-encryption';
import moment from "moment";
import Collapsible from 'react-collapsible';
import { Formik, Field, Form, FieldArray } from "formik";
import DatePicker from "react-datepicker";
// import { array } from 'prop-types';

const actionFormatter = (refObj) => (cell, row, enumObject) => {
    return (
        <LinkWithTooltip
            tooltip="Download PDF"
            href="#"
            clicked={() => refObj.downloadDoc(cell)
            }
            id="tooltip-1"
        >
            <Button type="button" >
                <img src={require('../../../assets/images/download.png')} alt="" />
            </Button>
        </LinkWithTooltip>
    )
}

function quoteFormatter(cell) {
    return (cell ? (cell.quote_id ? cell.quote_id : null) : null);
}

function premiumFormatter(cell) {
    return (cell ? (cell.net_premium ? cell.net_premium : null) : null);
}

function polNumFormatter(cell) {
    return (cell ? (cell.policy_note ? cell.policy_note.policy_no : null) : null);
}

function productFormatter(cell) {
    return (cell ? (cell.vehicletype ? cell.vehicletype.name : null) : null);
}

const newInitialValues = {}


class AgentCashDeposit extends Component {
    state = {
        statusCount: [],
        policyHolder: [],
        searchValues: {},
        products: []

    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    fetchDashboard = (values, page_no) => {

        const formData = new FormData();
        let encryption = new Encryption();
        page_no = page_no ? page_no : '1'
        if (values != []) {
            this.setState({
                searchValues: values
            });

            for (const key in values) {
                if (values.hasOwnProperty(key)) {
                    if (key == "start_date" || key == "end_date") {
                        formData.append(key, moment(values[key]).format("YYYY-MM-DD"));
                    }
                    else {
                        formData.append(key, values[key]);
                    }
                }
            }

        }

        let user_data = sessionStorage.getItem('users') ? JSON.parse(sessionStorage.getItem('users')) : "";

        if (user_data) {
            let encryption = new Encryption();
            user_data = user_data.user
            user_data = JSON.parse(encryption.decrypt(user_data));
        }

        formData.append('bcmaster_id', user_data.bc_master_id)
        formData.append('page_no', page_no)
        formData.append('bc_agent_id', user_data.master_user_id)
        formData.append('login_type', user_data.login_type)

        this.props.loadingStart();
        axios.post('bc/policy-customer', formData)
            .then(res => {
                let statusCount = res.data.data ? res.data.data : []
                let policyHolder = res.data.data ? res.data.data.policyHolder : []
                this.setState({
                    statusCount, policyHolder
                });
                this.props.loadingStop();
            }).
            catch(err => {
                this.props.loadingStop();
                this.setState({
                    statusCount: []
                });
            })

    }

    handleSubmit = (values) => {

        const formData = new FormData();
        let encryption = new Encryption();
        if (values != []) {
            this.setState({
                searchValues: values
            });

            for (const key in values) {
                console.log("values--- ", values[key])
                if (values.hasOwnProperty(key) && values[key] != "") {
                    if (key == "start_date" || key == "end_date") {
                        formData.append(key, moment(values[key]).format("YYYY-MM-DD"));
                    }
                    else {
                        formData.append(key, values[key]);
                    }
                }
            }

        }

        let user_data = sessionStorage.getItem('users') ? JSON.parse(sessionStorage.getItem('users')) : "";

        if (user_data) {
            let encryption = new Encryption();
            user_data = user_data.user
            user_data = JSON.parse(encryption.decrypt(user_data));
        }

        formData.append('bcmaster_id', user_data.bc_master_id)
        formData.append('page_no', 1)
        formData.append('policy_status', 'complete')
        formData.append('bc_agent_id', user_data.master_user_id)
        formData.append('login_type', user_data.login_type)

        this.props.loadingStart();
        axios.post('bc/policy-customer', formData)
            .then(res => {
                let statusCount = res.data.data ? res.data.data : []
                let policyHolder = res.data.data ? res.data.data.policyHolder : []
                this.setState({
                    statusCount, policyHolder
                });
                this.props.loadingStop();
            }).
            catch(err => {
                this.props.loadingStop();
                this.setState({
                    statusCount: []
                });
            })

    }

    downloadDoc = (refNumber) => {
        let file_path = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/policy_pdf_download.php?refrence_no=${refNumber}`
        console.log(file_path);
        const { policyId } = this.props.match.params
        const url = file_path;
        const pom = document.createElement('a');

        pom.style.display = 'none';
        pom.href = url;

        document.body.appendChild(pom);
        pom.click();
        window.URL.revokeObjectURL(url);

    }

    onPageChange(page, sizePerPage) {
        this.fetchDashboard(this.state.searchValues, page);
    }

    renderShowsTotal(start, to, total) {
        let trans = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        start = start ? start : 0
        to = to ? to : 0
        total = total ? total : 0
        return (
            <p style={{ color: 'blue' }}>
                {trans['From']} {start} {trans['to']} {to}, {trans['totalis']} {total} {trans['hai']}
            </p>
        );
    }


    getAllProducts = () => {
        let encryption = new Encryption();
        const formData = new FormData();
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        let user_id = ""

        if (user_data) {
            user_id = JSON.parse(encryption.decrypt(user_data.user));
        }

        formData.append('user_id', user_id.master_user_id)
        formData.append('role_id', user_id.role_id)
        formData.append('login_type', user_id.login_type)
        formData.append('bc_id', user_id.bc_master_id)

        this.props.loadingStart();

        axios.post(`visible/products`, formData)
            .then(res => {
                if (res.data.error == false) {
                    this.props.loadingStop();
                    var all_products = []
                    var temp_products = []
                    var products = []
                    all_products = res.data.data

                    for (const [key, value] of Object.entries(all_products)) {
                        temp_products.push(value)
                    }

                    temp_products.map((value, index) => {
                        value.map((sub_value, sub_index) =>
                            products.push(sub_value)
                        )
                    })

                    this.setState({
                        products
                    });
                }
                else {
                    this.props.loadingStop();
                }
            })
            .catch(err => {
                this.setState({ products: [] })
                this.props.loadingStop();
            });
    }

    handleClose = (val, setFieldValue, setFieldTouched) => {
        if (val == 1) {
            setFieldTouched('policy_no')
            setFieldValue('policy_no', "")
        }
        if (val == 2) {
            setFieldTouched('mobile_no')
            setFieldValue('mobile_no', "")
            setFieldTouched('email_id')
            setFieldValue('email_id', "")
        }
        if (val == 3) {
            setFieldTouched('start_date')
            setFieldValue('start_date', "")
            setFieldTouched('end_date')
            setFieldValue('end_date', "")
        }
        if (val == 4) {
            setFieldTouched('start_date')
            setFieldValue('start_date', "")
            setFieldTouched('end_date')
            setFieldValue('end_date', "")
            setFieldTouched('product_id')
            setFieldValue('product_id', "")
        }

    }

    componentDidMount() {
        this.getAllProducts()
    }


    render() {
        const { statusCount, policyHolder, products } = this.state
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        var totalRecord = statusCount ? statusCount.totalRecord : 1
        var page_no = statusCount ? statusCount.page_no : 1

        const options = {
            // afterColumnFilter: this.afterColumnFilter,
            // onExportToCSV: this.onExportToCSV,
            page: parseInt(page_no),  // which page you want to show as default
            sizePerPage: 10,
            paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
            prePage: phrases['Prev'], // Previous page button text
            nextPage: phrases['Next'], // Next page button text
            hideSizePerPage: true,
            remote: true,
            showTotal: true,
            onPageChange: this.onPageChange.bind(this),

        };


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
                                    <Formik initialValues={newInitialValues}
                                        onSubmit={this.handleSubmit}
                                    // validationSchema={ComprehensiveValidation}
                                    >
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                            return (
                                                <Form>
                                                    <div className="rghtsideTrigr collinput W-90 m-b-30 collaps_area">
                                                        <Collapsible openedClassName="custom_ovberflow" trigger='Create ACD' open={false} onClose={this.handleClose.bind(this, 1, setFieldValue, setFieldTouched)}>
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
                                                                                            name="policy_no"
                                                                                            type="text"
                                                                                            placeholder=""
                                                                                            autoComplete="off"
                                                                                            className="premiumslid"
                                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                            value={values.policy_no}
                                                                                        />
                                                                                        {errors.policy_no && touched.policy_no ? (
                                                                                            <span className="errorMsg">{errors.policy_no}</span>
                                                                                        ) : null}
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
                                                                                            name="policy_no"
                                                                                            type="text"
                                                                                            placeholder=""
                                                                                            autoComplete="off"
                                                                                            className="premiumslid"
                                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                            value={values.policy_no}
                                                                                        />
                                                                                        {errors.policy_no && touched.policy_no ? (
                                                                                            <span className="errorMsg">{errors.policy_no}</span>
                                                                                        ) : null}
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
                                                                                            name="policy_no"
                                                                                            type="text"
                                                                                            placeholder=""
                                                                                            autoComplete="off"
                                                                                            className="premiumslid"
                                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                            value={values.policy_no}
                                                                                        />
                                                                                        {errors.policy_no && touched.policy_no ? (
                                                                                            <span className="errorMsg">{errors.policy_no}</span>
                                                                                        ) : null}
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
                                                                                            name="policy_no"
                                                                                            type="text"
                                                                                            placeholder=""
                                                                                            autoComplete="off"
                                                                                            className="premiumslid"
                                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                            value={values.policy_no}
                                                                                        />
                                                                                        {errors.policy_no && touched.policy_no ? (
                                                                                            <span className="errorMsg">{errors.policy_no}</span>
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
                                                                                <Button className={`proceedBtn`} type="submit" >
                                                                                    Create ACD
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
                                    {policyHolder ?
                                        <div className="customInnerTable policytab">
                                            <BootstrapTable ref="table"
                                                data={policyHolder}
                                                pagination={true}
                                                options={options}
                                                remote={true}
                                                fetchInfo={{ dataTotalSize: totalRecord }}
                                                // striped
                                                // hover
                                                wrapperClasses="table-responsive"
                                            >

                                                <TableHeaderColumn width='150px' dataField="request_data" dataFormat={polNumFormatter} >{phrases['PolicyNumber']}</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField='request_data' dataFormat={(cell) => (cell !== '0000-00-00 00:00:00' ? moment(cell.start_date).format("MM-DD-YYYY") : '')} dataSort>{phrases['PSD']}</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField='request_data' dataFormat={(cell) => (cell !== '0000-00-00 00:00:00' ? moment(cell.end_date).format("MM-DD-YYYY") : '')} dataSort>{phrases['PED']}</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField="vehiclebrandmodel" dataFormat={productFormatter} >{phrases['Product']}</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField="first_name" >{phrases['ProposerName']}</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField="mobile"  >{phrases['MobileNumber']}</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField="email_id"  >{phrases['EmailId']}</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField="reference_no" isKey dataAlign="center" dataFormat={actionFormatter(this)}>{phrases['Download']}</TableHeaderColumn>

                                            </BootstrapTable>
                                        </div>
                                        : null}
                                </div>
                            </div>
                            <Footer />
                        </div>
                    </div>
                </div>
            </BaseComponent>
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
