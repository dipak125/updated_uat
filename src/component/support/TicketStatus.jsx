import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Button, Navbar, Nav, FormControl, NavDropdown, NavItem, Row, Col, Table, Tab, FormGroup } from 'react-bootstrap';
import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { Textarea } from 'react-formik-ui'
import { Formik, Field, Form, ErrorMessage } from "formik";
import Footer from '../common/footer/Footer';
import * as Yup from "yup";
import { Link } from 'react-router-dom';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from "../../shared/axios"
import swal from 'sweetalert';
import moment from "moment";


class TicketStatus extends Component {

    state = {
        helpMasterList: [],
        details: []
    };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    getHelpMasterList = () => {
        // axios
        //     .get(`/help-master`)
        //     .then(res => {
        //         this.setState({
        //             helpMasterList: res.data.data
        //         });
        //     })
        //     .catch(err => {
        //         this.setState({
        //             helpMasterList: []
        //         });
        //     });
    }

    getDetails = () => {
        const formData = new FormData();
        formData.append('ticket_id', this.props.ticketId)   

        axios
            .post(`help-ticket/incident-details`, formData)
            .then(res => {
                this.setState({
                    details: res.data.data
                });
            })
            .catch(err => {
                this.setState({
                    details: []
                });
            });
    }

    updateStatus = (status) => {
        const formData = new FormData();
        formData.append('ticket_id', this.props.ticketId)  
        formData.append('status', status)  
        this.props.loadingStart();
        axios
            .post(`help-ticket/update-incident`, formData)
            .then(res => {
                swal(res.data.msg)
                // this.setState({
                //     details: res.data.data
                // });
                this.props.loadingStop();
            })
            .catch(err => {
                // this.setState({
                //     details: []
                // });
                this.props.loadingStop();
            });
    }

    fileUpload = (selectedFile) => {
        const formData = new FormData();

        formData.append(
            "fileName",
            selectedFile[0],
            selectedFile[0].name
        );

        axios
            .post("maintenance/uploadDocs", formData)
            .then(res => {
                swal(res.data.message, {
                    icon: "success"
                }).then(() => {
                    this.props.loadingStop();
                    this.getScheduleList();
                });
            })
            .catch(err => {
                //   swal("", err.data.message, 'error');
                this.props.loadingStop();
            });

    };

    componentDidMount() {
        this.getHelpMasterList();
        this.getDetails();

    }

    render() {
        const { helpMasterList } = this.state
        const {selectedTicket} = this.props
        console.log("selectedTicket--- ", selectedTicket);
        return (
            <>
                <div className="">
                    <div className="d-flex justify-content-left opntckt">
                        <div>
                            <h2><strong>{selectedTicket.title}</strong> #{this.props.ticketId}</h2>
                        </div>
                    </div>

                    <Formik
                    initialValues={{
                        help_topic: '',
                        issueSummery: '',
                        status: selectedTicket.status
                    }}
                    onSubmit={fields => {
                        alert('SUCCESS!! :-)\n\n' + JSON.stringify(fields, null, 4))
                    }}
                    >
                    {({ errors, status, touched, values, setFieldValue, setFieldTouched }) => (
                        <Form>
                            <div className="tootalTicketinfo">
                                <Row>
                                    <Col sm={12} md={6}>
                                        <h3>Basic Ticket Information</h3>
                                        <div className="col-one">
                                            <Row>
                                                <Col sm={12} md={3}><div className="first">Ticket Status:</div></Col>
                                                <Col sm={12} md={4}><div className="formSection">
                                                
                                                    <Field
                                                        name='status'
                                                        component="select"
                                                        autoComplete="off"
                                                        className="formGrp inputfs12"
                                                        value = {values.status}      
                                                        onChange= {(e) => {
                                                            setFieldValue(`status`, e.target.value);
                                                            setFieldTouched(`status`);
                                                            this.updateStatus(e.target.value)
                                                        }}                                      
                                                    >
                                                        <option value="">-----</option>
                                                        <option value="Created">Created</option>
                                                        <option value="Pending">Pending</option>
                                                        <option value="In-Progress">In-Progress</option>
                                                        <option value="Closed">Closed</option>
                                                        <option value="Resolved">Resolved</option>

                                                        {/* {goodscarriedtypes.map((subVehicle, qIndex) => ( 
                                                            <option value= {subVehicle.id}>{subVehicle.goodscarriedtype}</option>
                                                        ))} */}
                                            
                                                    </Field>
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col sm={12} md={3}><div>Department:</div></Col>
                                                <Col sm={12} md={9}><div>{selectedTicket.area}</div></Col>
                                            </Row>
                                            <Row>
                                                <Col sm={12} md={3}><div>Create Date:</div></Col>
                                                <Col sm={12} md={9}><div>{moment(selectedTicket.created_at).format('DD/MM/YYYY hh:mm A')}</div></Col>
                                            </Row>
                                        </div>
                                    </Col>
                                    <Col sm={12} md={6}>
                                        <h3>User Information</h3>
                                        <div className="col-two">
                                            <Row>
                                                <Col sm={12} md={3}><div className="first">Name:</div></Col>
                                                <Col sm={12} md={9}><div className="first">{selectedTicket.bc_user_id ? selectedTicket.bc_user_id : selectedTicket.csc_id}</div></Col>
                                            </Row>
                                            <Row>
                                                <Col sm={12} md={3}><div>Email:</div></Col>
                                                <Col sm={12} md={9}><div>{selectedTicket.email}</div></Col>
                                            </Row>
                                            <Row>
                                                <Col sm={12} md={3}><div>Phone:</div></Col>
                                                <Col sm={12} md={9}><div>{selectedTicket.mobile}</div></Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                            </div>


                            <div className="tickeddetails">
                                <h3>Ticket Details</h3>
                                <Row>
                                    <Col sm={12} md={3}><div>Module</div></Col>
                                    <Col sm={12} md={9}><div>DN</div></Col>
                                </Row>
                            </div>

                            <div className="entry-message-area">
                                <div className="thread-entry message avatar">
                                    <span className="avatar">
                                        <img className="avatar" alt="Avatar" src="//www.gravatar.com/avatar/c4b67d2401af1361e3b91f250ebc5b1b?s=80&amp;d=mm" />    </span>
                                    <div className="header-panel">
                                        <div className="header">
                                            <b>{selectedTicket.bc_user_id ? selectedTicket.bc_user_id : selectedTicket.csc_id}</b> posted <span>{moment(selectedTicket.created_at).format('DD/MM/YYYY hh:mm A')}</span> <span className="title truncate"></span>
                                        </div>
                                        <div className="thread-body">
                                            <div> {selectedTicket.description} </div>
                                            <div className="clear"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="thread-event">
                                    <span className="type-icon">
                                        <img src={require('../../assets/images/pencil-sign.svg')} alt="" />
                                    </span>
                                    <span className="description">Created by <b>SYSTEM</b> <i>10/05/2018 4:06 pm</i></span>
                                </div>
                            </div>


                            <div className="justify-content-left opntckt">
                
                                <div className="issueSummery">
                                    <div class="form-group">
                                        <h4>Post a Reply</h4>
                                        <p className="mandotory-field">To best assist you, we request that you be specific and detailed <span>*</span></p>
                                        <FormGroup>
                                            <Field
                                                name="issueSummery"
                                                as="textarea"
                                                className={'form-control' + (errors.issueSummery && touched.issueSummery ? ' is-invalid' : '')}
                                                component={props =>
                                                    <CKEditor
                                                        editor={ClassicEditor}
                                                        config={{placeholder: "Write your details here"}} 
                                                        onInit={editor => {
                                                            // You can store the "editor" and use when it is needed.
                                                            console.log('Editor is ready to use!', editor);
                                                        }}
                                                        onChange={(event, editor) => {
                                                            const data = editor.getData();
                                                            console.log({ event, editor, data });
                                                        }}
                                                        onBlur={(event, editor) => {
                                                            console.log('Blur.', editor);
                                                        }}
                                                        onFocus={(event, editor) => {
                                                            console.log('Focus.', editor);
                                                        }}
                                                    />
                                                }
                                            />
                                            <ErrorMessage name="issueSummery" component="div" className="invalid-feedback" />
                                        </FormGroup>
                                    </div>
                                    <div class="form-group">
                                        <input type="file" key='1' name="attachment"
                                            accept=".png, .jpeg, .jpg, .doc, .docx, .xls, .xlsx, .pdf"
                                            onChange={(e) => {
                                                const { target } = e
                                                if (target.value.length > 0) {
                                                    this.fileUpload(e.target.files)
                                                } else {
                                                    target.reset();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                                    <button type="submit" className="btn btn-success mr-2">Post Reply</button>
                                                    <button type="reset" className="btn btn-primary mr-2">Reset</button>
                                                    <button className="btn btn-info" onClick={this.props.updateViewTicket}>Cancel</button>
                                                </div>
                            </div>
                        </Form>
                        )}
                        </Formik>
                    
                </div>
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
export default connect( mapStateToProps, mapDispatchToProps)(TicketStatus);