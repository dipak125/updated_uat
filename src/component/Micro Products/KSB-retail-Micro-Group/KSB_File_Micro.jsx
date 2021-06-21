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
import axios from "../../../shared/axios"

const initialValues = {
    ksb_branch_id: ''
}

const ksbFileUploadValidation = Yup.object().shape({
    // ksb_branch_id: Yup.string().required('Please select branch'),
    fpo_ksb_file: Yup.mixed().required('Only xls, xlsx file format is allowed'),
    fpo_ksb_file: Yup.mixed()
        .required('Please select a file')
        .test('type', "Only xls, xlsx file format is allowed", (value) => {
            if (value) {
                let fileType = value[0].name.split('.').pop();
                return (fileType === 'xlsx' || fileType === 'xls');
            }

        })

});

function branchFormatter(cell) {
    return (cell ? (cell ? cell : null) : null);
}

function statusFormatter(cell) {
    return (cell ? (cell ? cell : null) : null);
}

const actionFormatter = (refObj) => (cell, row, enumObject) => {
    return (
        <LinkWithTooltip
            tooltip="Pay"
            href="#"
            clicked={() => refObj.KSBFileDetails(row)
            }
            id="tooltip-1"
        >
            <Button type="button" >
                Pay
            </Button>
        </LinkWithTooltip>
    )
}

class KSB_File_Micro extends Component {
    constructor(props) {
        super(props);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.state = {
            KSBbranches: [],
            clickedKSBStatus: "",
            clickedKSBBranch: "",
            clickedKSBAction: "",
            resmessage: "",
            reserror: false
        };
    }

    fileUpload = async (uploadFile, setFieldValue, setFieldTouched) => {

        if (uploadFile[0] && uploadFile[0].name !== "") {
            let selectedFileSize = uploadFile[0].size;
            setFieldTouched("fileSize")
            setFieldValue("fileSize", selectedFileSize);
            let selectedFile = uploadFile[0];
            let selectedFileName = uploadFile[0].name;
            setFieldTouched("fpo_ksb_file")
            setFieldValue("fpo_ksb_file", uploadFile);

            await this.setState({
                selectedFile,
                selectedFileName
            })

        }

    }

    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }

    handleFormSubmit = (values) => {
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
            .post("ksb-group-excel/upload", formData)
            .then(res => {
                if (!res.data.error) {
                    this.setState({
                        resmessage: res.data.msg,
                        reserror: res.data.error
                    })
                    swal('File successfully uploaded');
                } else {
                    this.setState({
                        resmessage: res.data.msg,
                        reserror: res.data.error,
                        tempBatchId: res.data.data.temp_batch_id
                    })
                }
                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
            });

    }

    fetchBranches = () => {
        const KSBbranches = [{
            "id": 1,
            "branch": "Branch One"
        },
        {
            "id": 2,
            "branch": "Branch Two"
        },
        {
            "id": 3,
            "branch": "Branch Three"
        },
        {
            "id": 4,
            "branch": "Branch Four"
        }]
        this.setState({
            KSBbranches
        })
        this.props.loadingStop();
    }
    KSBFileDetails(row) {
        this.setState({
            clickedKSBStatus: row.status,
            clickedKSBBranch: row.branch,
            clickedKSBAction: row.action
        })
    }

    downloadErrorFile = () => {
        const { tempBatchId } = this.state;
        const url = `http://14.140.119.44/sbig-csc/core/auth/ksb-group-excel/error-file/${tempBatchId}`;
        this.props.loadingStart();
        const anchortag = document.createElement('a');
        anchortag.style.display = 'none';
        anchortag.href = url;
        document.body.appendChild(anchortag);
        anchortag.click();
    }

    componentDidMount() {
        this.fetchBranches();
    }

    render() {
        const { KSBbranches, reserror, resmessage, clickedKSBStatus, clickedKSBBranch, clickedKSBAction } = this.state;
        let ksbFileList =
            [{
                branch: 'Branch 1', status: 'NA', action: 'Pay'
            }, {
                branch: 'Branch 2', status: 'NA', action: 'Pay'
            }, {
                branch: 'Branch 3', status: 'NA', action: 'Pay'
            }, {
                branch: 'Branch 4', status: 'NA', action: 'Pay'
            }]
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
                                            {/* <h5 className="m-b-30">Download Sample Group KSB File</h5> */}
                                            <button class="policy m-b-10" onClick={this.downloadErrorFile} style={{ float: 'left' }}>Download Sample Group KSB File </button>
                                            <Formik initialValues={initialValues}
                                                onSubmit={this.handleFormSubmit}
                                                validationSchema={ksbFileUploadValidation}>
                                                {({ values, errors, setFieldValue, setFieldTouched, touched }) => {
                                                    return (
                                                        <Form>
                                                            <div className="row formSection">
                                                                <label className="col-md-4">Branch:</label>
                                                                <div className="col-md-4">
                                                                    <Field
                                                                        name="ksb_branch_id"
                                                                        component="select"
                                                                        autoComplete="off"
                                                                        value={values.ksb_branch_id}
                                                                        className="formGrp"
                                                                        key='1'
                                                                        onChange={(e) => {
                                                                            setFieldValue('ksb_branch_id', e.target.value);
                                                                        }}
                                                                    >
                                                                        <option value="">Select Branch</option>
                                                                        {KSBbranches.map((KSBbranch, qIndex) => (
                                                                            <option value={KSBbranch.id} key={qIndex}>{KSBbranch.branch}</option>
                                                                        ))}
                                                                    </Field>
                                                                    {errors.ksb_branch_id && touched.ksb_branch_id ? (
                                                                        <span className="errorMsg">{errors.ksb_branch_id}</span>
                                                                    ) : null}
                                                                </div>
                                                            </div>

                                                            <div className="row formSection">
                                                                <label className="col-md-4">Upload the FPO-KSB file:</label>
                                                                <div className="col-md-4">
                                                                    <input type="file" key='2' name="fpo_ksb_file"
                                                                        onChange={(e) => {
                                                                            const { target } = e
                                                                            if (target.value.length > 0) {
                                                                                this.fileUpload(e.target.files, setFieldValue, setFieldTouched)
                                                                            }
                                                                        }}
                                                                    />
                                                                    {errors.fpo_ksb_file ? (
                                                                        <span className="errorMsg">{errors.fpo_ksb_file}</span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                            {reserror ? (
                                                                <>
                                                                    {resmessage ? <span className="errorMsg" style={{ textAlign: 'right' }}>{resmessage}</span> : null}
                                                                    <button className="policy m-l-20" onClick={this.downloadErrorFile} style={{ float: 'right' }}>Download the Error FPO-KSB file </button>

                                                                </>
                                                            ) : null}

                                                            <div className="cntrbtn">
                                                                <Button className={`btnPrimary`} type="submit" >
                                                                    Upload
                                                                </Button>
                                                            </div>
                                                        </Form>
                                                    );
                                                }}
                                            </Formik>

                                            <Fragment>
                                                <div className="contBox m-b-45 tickedTable" style={{ marginTop: "10px" }}>
                                                    <h4 className="text-center mt-3 mb-3">KSB Uploaded Files</h4>
                                                    <div className="customInnerTable dataTableCustom">
                                                        <BootstrapTable ref="table"
                                                            data={ksbFileList}
                                                            pagination={true}
                                                            options={options}
                                                            striped
                                                            hover
                                                            wrapperClasses="table-responsive"
                                                        >
                                                            <TableHeaderColumn width="150px" dataField='branch' isKey dataSort dataFormat={branchFormatter}>Branch Code</TableHeaderColumn>
                                                            <TableHeaderColumn width='150px' dataField='status' dataFormat={statusFormatter} >Status</TableHeaderColumn>
                                                            <TableHeaderColumn width='150px' dataField='action' dataFormat={actionFormatter(this)} >Action</TableHeaderColumn>
                                                        </BootstrapTable>
                                                    </div>
                                                </div>
                                            </Fragment>

                                            {clickedKSBStatus != '' && clickedKSBBranch != '' ? (
                                                <Fragment>
                                                    <h4 className="m-b-30">File Details</h4>
                                                    <div className="row formSection">
                                                        <label className="col-md-4">Total No. Of Families:</label>
                                                        <div className="col-md-4">
                                                            200
                                                        </div>
                                                    </div>
                                                    <div className="row formSection">
                                                        <label className="col-md-4">Total Premium:</label>
                                                        <div className="col-md-4">
                                                            200
                                                        </div>
                                                    </div>
                                                    <div className="cntrbtn">
                                                        <Button className={`btnPrimary`} disabled="true" >
                                                            Pay Now
                                                        </Button>
                                                    </div>
                                                </Fragment>
                                            ) : null}
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(KSB_File_Micro));