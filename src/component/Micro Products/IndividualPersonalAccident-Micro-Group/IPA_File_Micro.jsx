<<<<<<< HEAD
import React, { Component, Fragment } from 'react';
import { Button } from 'react-bootstrap';
import BaseComponent from '../../BaseComponent';
import SideNav from '../../common/side-nav/SideNav';
import Footer from '../../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from 'yup';
import Encryption from '../../../shared/payload-encryption';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";
import { Formik, Form, Field } from 'formik';
import swal from 'sweetalert';
import LinkWithTooltip from "../../../shared/LinkWithTooltip";
import axios from "../../../shared/axios";
import moment from "moment";
import queryString from 'query-string';

const initialValues = {
    ksb_branch_id: ''
}

const gpaFileUploadValidation = Yup.object().shape({
    // ksb_branch_id: Yup.string().required('Please select branch'),
    // fpo_gpa_file: Yup.mixed().required('Only xls, xlsx file format is allowed'),
    fpo_gpa_file: Yup.mixed()
        .required('Please select a file')
        .test('type', "Only xls, xlsx file format is allowed", (value) => {
            if (value) {
                let fileType = value[0].name.split('.').pop();
                return (fileType === 'xlsx' || fileType === 'xls');
            }

        })

});


const actionFormatter = (refObj) => (cell, row, enumObject) => {
    return (
        <div>
            <span
                href="#"
                onClick={() => refObj.GPAFileDownload(cell)
                }
                id="tooltip-1"
            >
                <Button type="button" >
                    Download
                </Button>

            </span>
            &nbsp;
            {row.microbatchstatus.id && row.microbatchstatus.id !== 3 ? (<span
                href="#"
                onClick={() => refObj.GPAFileDelete(cell)
                }
                id="tooltip-1"
            >
                <Button type="button" className="btn btn-danger">
                    Delete
                </Button>
                <i className="far fa-trash-alt" />
            </span>) : null}
            &nbsp;
            {row.microbatchstatus.id && row.microbatchstatus.id == 2 ? (<span
                href="#"
                onClick={() => makePayment(cell)
                }
                id="tooltip-1"
            >
                <Button type="button" className="btn btn-success">
                    Pay now
                </Button>
                <i className="far fa-trash-alt" />
            </span>) : null}
        </div>
    )
}



const makePayment = cell => {
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/micro_group_pay.php?batch_id=${cell}`
}

const paymentStatusFormatter = (refObj) => (cell, row, enumObject) => {
    return (
        <div>
            {cell.status_name ? cell.status_name : null}
        </div>
    )
}
class GPA_File_Micro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            KSBbranches: [],
            clickedKSBStatus: "",
            clickedKSBBranch: "",
            clickedKSBAction: "",
            resmessage: "",
            reserror: false,
            ksbFileList: []
        };
    }



    fileUpload = async (uploadFile, setFieldValue, setFieldTouched) => {

        if (uploadFile[0] && uploadFile[0].name !== "") {
            let selectedFileSize = uploadFile[0].size;
            setFieldTouched("fileSize")
            setFieldValue("fileSize", selectedFileSize);
            let selectedFile = uploadFile[0];
            let selectedFileName = uploadFile[0].name;
            setFieldTouched("fpo_gpa_file")
            setFieldValue("fpo_gpa_file", uploadFile);

            await this.setState({
                selectedFile,
                selectedFileName
            })

        }

    }

    handleFormSubmit = (values, { resetForm }) => {
        const formData = new FormData();
        let encryption = new Encryption();
        let randomString = Math.random().toString(36);

        let user_type = ""
        let master_id = ""
        let user_id = ""

        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));
        }

        if (user_data.login_type == '4') {
            let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
            if (bc_data) {
                bc_data = JSON.parse(encryption.decrypt(bc_data));
            }
            user_type = sessionStorage.getItem('csc_id') ? 'csc' : 'bc'
            master_id = sessionStorage.getItem('csc_id') ? '5' : bc_data ? bc_data.agent_id : "0"
            user_id = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : bc_data ? bc_data.user_info.data.user.username : ""
        }
        else {
            user_type = user_data.user_type
            master_id = user_data.bc_master_id
            user_id = user_data.master_user_id
        }

        formData.append('user_type', user_type);
        formData.append('master_id', master_id);
        formData.append('user_id', user_id);
        const { productId } = this.props.match.params
        const { selectedFile, selectedFileName } = this.state;
        formData.append('excel_file', selectedFile);
        formData.append('fileName', selectedFileName);
        formData.append('product_id', productId);
        this.props.loadingStart();
        axios
            .post("ipa/excel-upload", formData)
            .then(res => {
                if (!res.data.error) {
                    this.setState({
                        resmessage: res.data.msg,
                        reserror: res.data.error,
                        theInputKey: randomString
                    })
                    swal('File successfully uploaded');
                    this.batchList()
                } else {
                    this.setState({
                        resmessage: res.data.msg,
                        reserror: res.data.error,
                        tempBatchId: res.data.data.temp_batch_id,
                        theInputKey: randomString
                    })
                }
                resetForm();
                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
            });
    }


    GPAFileDelete = (cell) => {
        swal({
            title: 'Delete',
            text: 'Delete File',
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                axios.get(`ksb-group-excel/delete-batch/${cell}`)
                    .then(res => {
                        if (res.data.error == false) {
                            swal(res.data.msg, {
                                icon: "success",
                            }).then(() => {
                                this.batchList();
                            });
                        }
                        else {
                            swal("", res.data.msg, 'error');
                        }
                    })
                    .catch(err => {
                        swal("", err.data.msg, 'error');
                        this.props.loadingStop();
                    });
            }
        });
    }

    GPAFileDownload(cell) {
        const url = `${process.env.REACT_APP_API_URL}/ksb-group-excel/succeed-file/${cell}`;
        this.props.loadingStart();
        const anchortag = document.createElement('a');
        anchortag.style.display = 'none';
        anchortag.href = url;
        document.body.appendChild(anchortag);
        anchortag.click();
        this.props.loadingStop();
    }

    downloadErrorFile = () => {
        const { tempBatchId } = this.state;
        const url = `${process.env.REACT_APP_API_URL}/ksb-group-excel/error-file/${tempBatchId}`;
        this.props.loadingStart();
        const anchortag = document.createElement('a');
        anchortag.style.display = 'none';
        anchortag.href = url;
        document.body.appendChild(anchortag);
        anchortag.click();
        this.props.loadingStop();
    }

    downloadSampleFile = () => {
        const { tempBatchId } = this.state;
        const url = `${process.env.REACT_APP_API_URL}/ipa/excel-sample-file`;
        this.props.loadingStart();
        const anchortag = document.createElement('a');
        anchortag.style.display = 'none';
        anchortag.href = url;
        document.body.appendChild(anchortag);
        anchortag.click();
        this.props.loadingStop();
    }



    batchList = () => {
        const formData = new FormData();
        let encryption = new Encryption();

        let user_type = ""
        let master_id = ""
        let user_id = ""

        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));
        }

        if (user_data.login_type == '4') {
            let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
            if (bc_data) {
                bc_data = JSON.parse(encryption.decrypt(bc_data));
            }
            user_type = sessionStorage.getItem('csc_id') ? 'csc' : 'bc'
            master_id = sessionStorage.getItem('csc_id') ? '5' : bc_data ? bc_data.agent_id : "0"
            user_id = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : bc_data ? bc_data.user_info.data.user.username : ""
        }
        else {
            user_type = user_data.user_type
            master_id = user_data.bc_master_id
            user_id = user_data.master_user_id
        }

        const { productId } = this.props.match.params

        formData.append('user_type', user_type);
        formData.append('master_id', master_id);
        formData.append('user_id', user_id);
        formData.append('product_id', productId);
        this.props.loadingStart();
        axios
            .post("ksb-group-excel/uploded-batch-list", formData)
            .then(res => {
                if (!res.data.error) {
                    this.setState({
                        ksbFileList: res.data.data.batch_details
                    })
                    this.paymentmesg();
                } else {
                    this.setState({
                        ksbFileList: []
                    })
                    this.paymentmesg();
                }
                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
            });
    }

    componentDidMount() {
        this.batchList()

    }

    paymentmesg = () => {
        const payment_status = queryString.parse(this.props.location.search).status;
        const access_id = queryString.parse(this.props.location.search).access_id;
        if (access_id !== '' && payment_status == 'pay_success') {
            axios
                .get(`group-excel/check-payment-status/${access_id}`)
                .then(res => {
                    if (!res.data.error) {
                        swal(res.data.msg, {
                            icon: "success",
                        })
                    } else {
                        swal(res.data.msg, {
                            icon: "error",
                        })
                    }
                    this.props.loadingStop();
                })
                .catch(err => {
                    this.props.loadingStop();
                });
        }
    }

    render() {
        const { KSBbranches, reserror, resmessage, clickedKSBStatus, clickedKSBBranch, ksbFileList } = this.state;
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        const options = {
            // afterColumnFilter: this.afterColumnFilter,
            // onExportToCSV: this.onExportToCSV,
            page: 1,  // which page you want to show as default
            sizePerPageList: [{
                text: '5', value: 5
            }, {
                text: '10', value: 10
            }, {
                text: '15', value: 15
            }, {
                text: '20', value: 20
            }, {
                text: 'All', value: ksbFileList.length
            }], // you can change the dropdown list for size per page
            sizePerPage: 10,  // which size per page you want to locate as default
            pageStartIndex: 1, // where to start counting the pages
            paginationSize: 3,  // the pagination bar size.
            prePage: phrases['Prev'], // Previous page button text
            nextPage: phrases['Next'], // Next page button text
            firstPage: phrases['First'], // First page button text
            lastPage: phrases['Last'], // Last page button text
            paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
            paginationPosition: phrases['bottom'],  // default is bottom, top and both is all available
            noDataText: phrases['NoData']

        };

        return (
            <>
                <BaseComponent>
                    <div className="page-wrapper">
                        <div className="container-fluid">
                            <div className="row">

                                <aside className="left-sidebar">
                                    <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
                                        <SideNav />
                                    </div>
                                </aside>
                                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox healthkas">
                                    <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                                    <section className="brand">
                                        <div className="boxpd">
                                            <button class="policy m-b-10" onClick={this.downloadSampleFile} style={{ float: 'left' }}>Download Sample Group GPA File </button>
                                            <Formik initialValues={initialValues}
                                                onSubmit={this.handleFormSubmit}
                                                validationSchema={gpaFileUploadValidation}>
                                                {({ values, errors, setFieldValue, setFieldTouched, touched }) => {
                                                    return (
                                                        <Form>

                                                            <div className="row formSection">
                                                                <label className="col-md-4">Upload the FPO-GPA file:</label>
                                                                <div className="col-md-4">
                                                                    <input type="file" key={this.state.theInputKey || ''} name="fpo_gpa_file"
                                                                        onChange={(e) => {
                                                                            const { target } = e
                                                                            if (target.value.length > 0) {
                                                                                this.fileUpload(e.target.files, setFieldValue, setFieldTouched)
                                                                            }
                                                                        }}
                                                                    />
                                                                    {errors.fpo_gpa_file ? (
                                                                        <span className="errorMsg">{errors.fpo_gpa_file}</span>
                                                                    ) : null}
                                                                </div>
                                                                <div className="cntrbtn">
                                                                    <Button className={`btnPrimary`} type="submit" >
                                                                        Upload
                                                                    </Button>
                                                                </div>
                                                            </div>


                                                        </Form>
                                                    );
                                                }}
                                            </Formik>
                                            {reserror ? (
                                                <>
                                                    {resmessage ? <span className="errorMsg" style={{ textAlign: 'right' }}>{resmessage}</span> : null}
                                                    <button className="policy m-l-20" onClick={this.downloadErrorFile} style={{ float: 'right' }}>Download the Error FPO-GPA file </button>

                                                </>
                                            ) : null}
                                            <Fragment>
                                                <div className="contBox m-b-45 tickedTable" style={{ marginTop: "50px" }}>
                                                    <h4 className="text-center mt-3 mb-3">Jan Rakshak Personal Accident Uploaded Files</h4>
                                                    <div className="customInnerTable dataTableCustom">
                                                        <BootstrapTable ref="table"
                                                            data={ksbFileList}
                                                            pagination={true}
                                                            options={options}
                                                            striped
                                                            hover
                                                            wrapperClasses="table-responsive"
                                                        >
                                                            <TableHeaderColumn width="100px" dataField='batch_no' isKey >Batch Code</TableHeaderColumn>
                                                            <TableHeaderColumn width='100px' dataField='microbatchstatus' dataFormat={paymentStatusFormatter(this)} >Status</TableHeaderColumn>
                                                            <TableHeaderColumn width='100px' dataField='total_members' >Total Member</TableHeaderColumn>
                                                            <TableHeaderColumn width='100px' dataField='all_total_premium' >Total Premium</TableHeaderColumn>
                                                            <TableHeaderColumn width='100px' dataField='uploded_time' dataFormat={(cell) => (cell !== '0000-00-00 00:00:00' ? moment(cell).format("DD-MM-YYYY") : '')}>Upload Date</TableHeaderColumn>
                                                            <TableHeaderColumn width='150px' dataField='batch_no' dataFormat={actionFormatter(this)} >Action</TableHeaderColumn>
                                                        </BootstrapTable>
                                                    </div>
                                                </div>
                                            </Fragment>
                                        </div>
                                    </section>
                                    <Footer />
                                </div>
                            </div>
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

=======
import React, { Component, Fragment } from 'react';
import { Button } from 'react-bootstrap';
import BaseComponent from '../../BaseComponent';
import SideNav from '../../common/side-nav/SideNav';
import Footer from '../../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from 'yup';
import Encryption from '../../../shared/payload-encryption';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";
import { Formik, Form, Field } from 'formik';
import swal from 'sweetalert';
import LinkWithTooltip from "../../../shared/LinkWithTooltip";
import axios from "../../../shared/axios";
import moment from "moment";
import queryString from 'query-string';

const initialValues = {
    ksb_branch_id: ''
}

const gpaFileUploadValidation = Yup.object().shape({
    // ksb_branch_id: Yup.string().required('Please select branch'),
    // fpo_gpa_file: Yup.mixed().required('Only xls, xlsx file format is allowed'),
    fpo_gpa_file: Yup.mixed()
        .required('Please select a file')
        .test('type', "Only xls, xlsx file format is allowed", (value) => {
            if (value) {
                let fileType = value[0].name.split('.').pop();
                return (fileType === 'xlsx' || fileType === 'xls');
            }

        })

});


const actionFormatter = (refObj) => (cell, row, enumObject) => {
    return (
        <div>
            <span
                href="#"
                onClick={() => refObj.GPAFileDownload(cell)
                }
                id="tooltip-1"
            >
                <Button type="button" >
                    Download
                </Button>

            </span>
            &nbsp;
            {row.microbatchstatus.id && row.microbatchstatus.id !== 3 ? (<span
                href="#"
                onClick={() => refObj.GPAFileDelete(cell)
                }
                id="tooltip-1"
            >
                <Button type="button" className="btn btn-danger">
                    Delete
                </Button>
                <i className="far fa-trash-alt" />
            </span>) : null}
            &nbsp;
            {row.microbatchstatus.id && row.microbatchstatus.id == 2 ? (<span
                href="#"
                onClick={() => makePayment(cell)
                }
                id="tooltip-1"
            >
                <Button type="button" className="btn btn-success">
                    Pay now
                </Button>
                <i className="far fa-trash-alt" />
            </span>) : null}
        </div>
    )
}



const makePayment = cell => {
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/micro_group_pay.php?batch_id=${cell}`
}

const paymentStatusFormatter = (refObj) => (cell, row, enumObject) => {
    return (
        <div>
            {cell.status_name ? cell.status_name : null}
        </div>
    )
}
class GPA_File_Micro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            KSBbranches: [],
            clickedKSBStatus: "",
            clickedKSBBranch: "",
            clickedKSBAction: "",
            resmessage: "",
            reserror: false,
            ksbFileList: []
        };
    }



    fileUpload = async (uploadFile, setFieldValue, setFieldTouched) => {

        if (uploadFile[0] && uploadFile[0].name !== "") {
            let selectedFileSize = uploadFile[0].size;
            setFieldTouched("fileSize")
            setFieldValue("fileSize", selectedFileSize);
            let selectedFile = uploadFile[0];
            let selectedFileName = uploadFile[0].name;
            setFieldTouched("fpo_gpa_file")
            setFieldValue("fpo_gpa_file", uploadFile);

            await this.setState({
                selectedFile,
                selectedFileName
            })

        }

    }

    handleFormSubmit = (values, { resetForm }) => {
        const formData = new FormData();
        let encryption = new Encryption();
        let randomString = Math.random().toString(36);

        let user_type = ""
        let master_id = ""
        let user_id = ""

        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));
        }

        if (user_data.login_type == '4') {
            let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
            if (bc_data) {
                bc_data = JSON.parse(encryption.decrypt(bc_data));
            }
            user_type = sessionStorage.getItem('csc_id') ? 'csc' : 'bc'
            master_id = sessionStorage.getItem('csc_id') ? '5' : bc_data ? bc_data.agent_id : "0"
            user_id = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : bc_data ? bc_data.user_info.data.user.username : ""
        }
        else {
            user_type = user_data.user_type
            master_id = user_data.bc_master_id
            user_id = user_data.master_user_id
        }

        formData.append('user_type', user_type);
        formData.append('master_id', master_id);
        formData.append('user_id', user_id);
        const { productId } = this.props.match.params
        const { selectedFile, selectedFileName } = this.state;
        formData.append('excel_file', selectedFile);
        formData.append('fileName', selectedFileName);
        formData.append('product_id', productId);
        this.props.loadingStart();
        axios
            .post("ipa/excel-upload", formData)
            .then(res => {
                if (!res.data.error) {
                    this.setState({
                        resmessage: res.data.msg,
                        reserror: res.data.error,
                        theInputKey: randomString
                    })
                    swal('File successfully uploaded');
                    this.batchList()
                } else {
                    this.setState({
                        resmessage: res.data.msg,
                        reserror: res.data.error,
                        tempBatchId: res.data.data.temp_batch_id,
                        theInputKey: randomString
                    })
                }
                resetForm();
                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
            });
    }


    GPAFileDelete = (cell) => {
        swal({
            title: 'Delete',
            text: 'Delete File',
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                axios.get(`ksb-group-excel/delete-batch/${cell}`)
                    .then(res => {
                        if (res.data.error == false) {
                            swal(res.data.msg, {
                                icon: "success",
                            }).then(() => {
                                this.batchList();
                            });
                        }
                        else {
                            swal("", res.data.msg, 'error');
                        }
                    })
                    .catch(err => {
                        swal("", err.data.msg, 'error');
                        this.props.loadingStop();
                    });
            }
        });
    }

    GPAFileDownload(cell) {
        const url = `${process.env.REACT_APP_API_URL}/ksb-group-excel/succeed-file/${cell}`;
        this.props.loadingStart();
        const anchortag = document.createElement('a');
        anchortag.style.display = 'none';
        anchortag.href = url;
        document.body.appendChild(anchortag);
        anchortag.click();
        this.props.loadingStop();
    }

    downloadErrorFile = () => {
        const { tempBatchId } = this.state;
        const url = `${process.env.REACT_APP_API_URL}/ksb-group-excel/error-file/${tempBatchId}`;
        this.props.loadingStart();
        const anchortag = document.createElement('a');
        anchortag.style.display = 'none';
        anchortag.href = url;
        document.body.appendChild(anchortag);
        anchortag.click();
        this.props.loadingStop();
    }

    downloadSampleFile = () => {
        const { tempBatchId } = this.state;
        const url = `${process.env.REACT_APP_API_URL}/ipa/excel-sample-file`;
        this.props.loadingStart();
        const anchortag = document.createElement('a');
        anchortag.style.display = 'none';
        anchortag.href = url;
        document.body.appendChild(anchortag);
        anchortag.click();
        this.props.loadingStop();
    }



    batchList = () => {
        const formData = new FormData();
        let encryption = new Encryption();

        let user_type = ""
        let master_id = ""
        let user_id = ""

        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";
        if (user_data) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));
        }

        if (user_data.login_type == '4') {
            let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
            if (bc_data) {
                bc_data = JSON.parse(encryption.decrypt(bc_data));
            }
            user_type = sessionStorage.getItem('csc_id') ? 'csc' : 'bc'
            master_id = sessionStorage.getItem('csc_id') ? '5' : bc_data ? bc_data.agent_id : "0"
            user_id = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : bc_data ? bc_data.user_info.data.user.username : ""
        }
        else {
            user_type = user_data.user_type
            master_id = user_data.bc_master_id
            user_id = user_data.master_user_id
        }

        const { productId } = this.props.match.params

        formData.append('user_type', user_type);
        formData.append('master_id', master_id);
        formData.append('user_id', user_id);
        formData.append('product_id', productId);
        this.props.loadingStart();
        axios
            .post("ksb-group-excel/uploded-batch-list", formData)
            .then(res => {
                if (!res.data.error) {
                    this.setState({
                        ksbFileList: res.data.data.batch_details
                    })
                    this.paymentmesg();
                } else {
                    this.setState({
                        ksbFileList: []
                    })
                    this.paymentmesg();
                }
                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
            });
    }

    componentDidMount() {
        this.batchList()

    }

    paymentmesg = () => {
        const payment_status = queryString.parse(this.props.location.search).status;
        const access_id = queryString.parse(this.props.location.search).access_id;
        if (access_id !== '' && payment_status == 'pay_success') {
            axios
                .get(`group-excel/check-payment-status/${access_id}`)
                .then(res => {
                    if (!res.data.error) {
                        swal(res.data.msg, {
                            icon: "success",
                        })
                    } else {
                        swal(res.data.msg, {
                            icon: "error",
                        })
                    }
                    this.props.loadingStop();
                })
                .catch(err => {
                    this.props.loadingStop();
                });
        }
    }

    render() {
        const { KSBbranches, reserror, resmessage, clickedKSBStatus, clickedKSBBranch, ksbFileList } = this.state;
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        const options = {
            // afterColumnFilter: this.afterColumnFilter,
            // onExportToCSV: this.onExportToCSV,
            page: 1,  // which page you want to show as default
            sizePerPageList: [{
                text: '5', value: 5
            }, {
                text: '10', value: 10
            }, {
                text: '15', value: 15
            }, {
                text: '20', value: 20
            }, {
                text: 'All', value: ksbFileList.length
            }], // you can change the dropdown list for size per page
            sizePerPage: 10,  // which size per page you want to locate as default
            pageStartIndex: 1, // where to start counting the pages
            paginationSize: 3,  // the pagination bar size.
            prePage: phrases['Prev'], // Previous page button text
            nextPage: phrases['Next'], // Next page button text
            firstPage: phrases['First'], // First page button text
            lastPage: phrases['Last'], // Last page button text
            paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
            paginationPosition: phrases['bottom'],  // default is bottom, top and both is all available
            noDataText: phrases['NoData']

        };

        return (
            <>
                <BaseComponent>
                    <div className="page-wrapper">
                        <div className="container-fluid">
                            <div className="row">

                                <aside className="left-sidebar">
                                    <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
                                        <SideNav />
                                    </div>
                                </aside>
                                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox healthkas">
                                    <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                                    <section className="brand">
                                        <div className="boxpd">
                                            <button class="policy m-b-10" onClick={this.downloadSampleFile} style={{ float: 'left' }}>Download Sample Group GPA File </button>
                                            <Formik initialValues={initialValues}
                                                onSubmit={this.handleFormSubmit}
                                                validationSchema={gpaFileUploadValidation}>
                                                {({ values, errors, setFieldValue, setFieldTouched, touched }) => {
                                                    return (
                                                        <Form>

                                                            <div className="row formSection">
                                                                <label className="col-md-4">Upload the FPO-GPA file:</label>
                                                                <div className="col-md-4">
                                                                    <input type="file" key={this.state.theInputKey || ''} name="fpo_gpa_file"
                                                                        onChange={(e) => {
                                                                            const { target } = e
                                                                            if (target.value.length > 0) {
                                                                                this.fileUpload(e.target.files, setFieldValue, setFieldTouched)
                                                                            }
                                                                        }}
                                                                    />
                                                                    {errors.fpo_gpa_file ? (
                                                                        <span className="errorMsg">{errors.fpo_gpa_file}</span>
                                                                    ) : null}
                                                                </div>
                                                                <div className="cntrbtn">
                                                                    <Button className={`btnPrimary`} type="submit" >
                                                                        Upload
                                                                    </Button>
                                                                </div>
                                                            </div>


                                                        </Form>
                                                    );
                                                }}
                                            </Formik>
                                            {reserror ? (
                                                <>
                                                    {resmessage ? <span className="errorMsg" style={{ textAlign: 'right' }}>{resmessage}</span> : null}
                                                    <button className="policy m-l-20" onClick={this.downloadErrorFile} style={{ float: 'right' }}>Download the Error FPO-GPA file </button>

                                                </>
                                            ) : null}
                                            <Fragment>
                                                <div className="contBox m-b-45 tickedTable" style={{ marginTop: "50px" }}>
                                                    <h4 className="text-center mt-3 mb-3">Jan Rakshak Personal Accident Uploaded Files</h4>
                                                    <div className="customInnerTable dataTableCustom">
                                                        <BootstrapTable ref="table"
                                                            data={ksbFileList}
                                                            pagination={true}
                                                            options={options}
                                                            striped
                                                            hover
                                                            wrapperClasses="table-responsive"
                                                        >
                                                            <TableHeaderColumn width="100px" dataField='batch_no' isKey >Batch Code</TableHeaderColumn>
                                                            <TableHeaderColumn width='100px' dataField='microbatchstatus' dataFormat={paymentStatusFormatter(this)} >Status</TableHeaderColumn>
                                                            <TableHeaderColumn width='100px' dataField='total_members' >Total Member</TableHeaderColumn>
                                                            <TableHeaderColumn width='100px' dataField='all_total_premium' >Total Premium</TableHeaderColumn>
                                                            <TableHeaderColumn width='100px' dataField='uploded_time' dataFormat={(cell) => (cell !== '0000-00-00 00:00:00' ? moment(cell).format("DD-MM-YYYY") : '')}>Upload Date</TableHeaderColumn>
                                                            <TableHeaderColumn width='150px' dataField='batch_no' dataFormat={actionFormatter(this)} >Action</TableHeaderColumn>
                                                        </BootstrapTable>
                                                    </div>
                                                </div>
                                            </Fragment>
                                        </div>
                                    </section>
                                    <Footer />
                                </div>
                            </div>
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

>>>>>>> 0e31e53c369eea5c7cf1dbfeb51d7be55d71d1f3
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GPA_File_Micro));