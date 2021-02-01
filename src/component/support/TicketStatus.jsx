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
import Encryption from '../../shared/payload-encryption';
import ReactHtmlParser from 'react-html-parser';
import ReadMoreReact from 'read-more-react';


const ticketValidation = Yup.object().shape({

    description: Yup.string().required('Issue Summery is required')
        .min(12, function () {
        return "Minimum 5 characters required";
      })
        .max(1000, function () {
            return "Characters limit exceeds 1000";
    }),
})


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


    getDetails = () => {
        const formData = new FormData();
        formData.append('ticket_id', this.props.ticketId)   
        this.props.loadingStart();
        axios
            .post(`help-ticket/post`, formData)
            .then(res => {
                this.setState({
                    details: res.data.data
                });
                this.props.loadingStop();
            })
            .catch(err => {
                this.setState({
                    details: []
                });
                this.props.loadingStop();
            });
    }


    getCurrentStatus = (row) => {
        const formData = new FormData(); 
        formData.append('ticket_id', row.ticketid_Internal) 

        this.props.loadingStart();
        axios.post('help-ticket/incident-details',formData)
        .then(res=>{
            if(res.data.error == false) {
                swal(`Current Status: ${res.data.data.currentStatus}`)
                .then((willUpdate) =>{
                    if(willUpdate) {
                        // this.getDetails()
                        this.props.updateViewTicket()
                    }
                } )
            }   
            else{
                // this.getDetails()
                this.props.updateViewTicket()
            }             
            this.props.loadingStop();
        }).
        catch(err=>{
            this.props.loadingStop();
        })  
    }

    fileUpload = async (uploadFile) => {

        if (uploadFile[0] && uploadFile[0].name !== "") {
            let selectedFile = uploadFile[0];
            let selectedFileName = uploadFile[0].name;

            await this.setState({
                selectedFile,
                selectedFileName
            })
        }
    }


    fileAttachment = (values, { resetForm }) => {
        
        this.props.loadingStart();

        if(this.state.selectedFile) {        
            const formData1 = new FormData();
            formData1.append('ticket_id', this.props.ticketId);
            formData1.append('attachment_file', this.state.selectedFile); 
            formData1.append('fileName', this.state.selectedFileName);
            formData1.append('destination', 1);
            axios
            .post("help-ticket/file-move", formData1)
            .then(res => {
                let post_id = ""
                if(res.data.error === false){
                post_id = res.data.data.support_post_id
                const formData2 = new FormData();
                formData2.append('ticket_id', this.props.ticketId);
                formData2.append('destination', 1);
                formData2.append('post_id', post_id);
                axios
                .post("help-ticket/attachment", formData2)
                .then(res2 => {
                if(res2.data.error === false) {
                    this.setState({
                        selectedFile: "",
                        selectedFileName: ""
                    })

                    const formData = new FormData();
                    formData.append('ticket_id', this.props.ticketId);
                    formData.append('description', values.description);
                    formData.append('post_id', post_id);
                    
                    axios
                    .post("help-ticket/insert-post", formData)
                    .then(res1 => {
                        console.log("Attach Upload", res1);
                        swal("Reply posted sucessfully "+ `\nTicket No.  ${res1.data.data.ticket_no}`, {
                            icon: "success"
                        }).then(() => {
                            this.props.loadingStop();
                            resetForm();
                            // this.getDetails()
                            this.props.updateViewTicket()
                        });
                    })
                    .catch(err1 => {
                        console.log("Attach fail", err1);
                        this.props.loadingStop();
                    });
                }
                })}})
                .catch(err => {
                    console.log("Reply fail", err);
        
                    // swal("", err.data.message, 'error');
                    this.props.loadingStop();
                });
            }      
            else {
                    const formData = new FormData();
                    formData.append('ticket_id', this.props.ticketId);
                    formData.append('description', values.description);
                    
                    axios
                    .post("help-ticket/insert-post", formData)
                    .then(res1 => {
                        console.log("Attach Upload", res1);
                        swal("Reply posted sucessfully "+ `\nTicket No.  ${res1.data.data.ticket_no}`, {
                            icon: "success"
                        }).then(() => {
                            this.props.loadingStop();
                            resetForm();
                            // this.getDetails()
                            this.props.updateViewTicket()
                        });
                    })
                    .catch(err1 => {
                        console.log("Attach fail", err1);
                        this.props.loadingStop();
                    });
            }
        }

    
    ticketReopen = (values, { resetForm }) => {
        const formData = new FormData();
        formData.append('ticket_id', this.props.ticketId);
        formData.append('description', values.description);
        
        axios
        .post("help-ticket/reopen-incident", formData)
        .then(res1 => {
            if(res1.data.error == false) {
                swal("Ticket reopened sucessfully "+ `\nTicket No.  ${res1.data.data.ticket_no}`, {
                    icon: "success"
                }).then(() => {
                    this.props.loadingStop();
                    resetForm();
                    this.getCurrentStatus(this.props.selectedTicket)
                });
            }
            else{
                swal(res1.data.msg, {
                    icon: "error"
                })
                resetForm();
                this.getCurrentStatus(this.props.selectedTicket)
            }        
        })
        .catch(err1 => {
            console.log("Attach fail", err1);
            this.props.loadingStop();
        });
    }


    componentDidMount() {
        this.getDetails();

    }

    render() {
        const { details } = this.state
        const {selectedTicket} = this.props
        let userName = selectedTicket.user_type == 'bc' ? (selectedTicket.bcuser == null ? selectedTicket.bc_user_id : selectedTicket.bcuser.user_name) : selectedTicket.csc_user.name
        console.log("userName--- ", selectedTicket.bc_user);
        console.log("selectedTicket--- ", selectedTicket);

        return (
            <>
                <div className="">
                    <div className="d-flex justify-content-left opntckt">
                        <div>
                            <h2><strong>{selectedTicket.title}</strong> #{this.props.selectedTicket.ticket_no}</h2>
                        </div>
                    </div>

                    <Formik
                    initialValues={{
                        help_topic: '',
                        description: '',
                        status: selectedTicket.status
                    }}
                    validationSchema={ticketValidation}
                    onSubmit={selectedTicket.status == "Resolved" ? this.ticketReopen : this.fileAttachment} 
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
                                                <Col sm={12} md={9}><div>{selectedTicket.status}</div></Col>
                                                {/* <Col sm={12} md={4}><div className="formSection">
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
                                                        <option disabled = {selectedTicket.status == "Resolved" ? true : false} value="Reopen">Reopen</option>
                                                        <option disabled = {true} value="Created">Created</option>
                                                        <option disabled = {true} value="Pending">Pending</option>
                                                        <option disabled = {true} value="In-Progress">In-Progress</option>
                                                        <option disabled = {true} value="Closed">Closed</option>
                                                        <option disabled = {true} value="Resolved">Resolved</option>

                                                         {goodscarriedtypes.map((subVehicle, qIndex) => ( 
                                                            <option value= {subVehicle.id}>{subVehicle.goodscarriedtype}</option>
                                                        ))} 
                                            
                                                    </Field> 
                                                    </div>
                                                </Col> */}
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
                                                <Col sm={12} md={9}><div className="first">{userName}</div></Col>
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
                                            <b>{userName}</b> posted <span>{moment(selectedTicket.created_at).format('DD/MM/YYYY hh:mm A')}</span> <span className="title truncate"></span>
                                        </div>
                                        <div className="thread-body">
                                             {/* <div>
					                            <ReadMoreReact 
                                                    text={selectedTicket.description}
                                                    min={2}
                                                    ideal={50}
                                                    max={50}
                                                    readMoreText="...Read More"/>
					                        </div> */}
                                            {ReactHtmlParser(selectedTicket.description)}
                                            <div className="clear"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="thread-event">
                                    <span className="type-icon">
                                        <img src={require('../../assets/images/pencil-sign.svg')} alt="" />
                                    </span>
                                    <span className="description">Created by <b>SYSTEM</b> <i>{moment(selectedTicket.created_at).format('DD/MM/YYYY hh:mm A')}</i></span>
                                </div>   
                            </div>

                            {details && details.map((row, index) =>
                            <div className="entry-message-area">
                                <div className="thread-entry message avatar">
                                    <span className="avatar">
                                        <img className="avatar" alt="Avatar" src="//www.gravatar.com/avatar/c4b67d2401af1361e3b91f250ebc5b1b?s=80&amp;d=mm" />    </span>
                                    <div className="header-panel">
                                        <div className= {row.is_solution == '0' ? "header" : "header_reply"}>
                                            <b>{row.name}</b> posted <span>{moment(row.created_at).format('DD/MM/YYYY hh:mm A')}</span> <span className="title truncate"></span>
                                        </div>
                                        <div className="thread-body">
 					                         {/* <div> 
                                                {row.decriptions && row.decriptions !== "" ? (
                                                    <ReadMoreReact 
                                                        text={row.decriptions}
                                                        min={2}
                                                        ideal={50}
                                                        max={50}
                                                        readMoreText="...Read More"/>
                                                ) : row.decriptions}                                               
                                            </div> */}
                                             {ReactHtmlParser(row.decriptions)}
                                            <div className="clear"></div>
                                        </div>
                                    </div>
                                </div>
                                    { row.attachment_file_name != null ?   
                                        <div className="thread-event">
                                            {console.log(" row.attachment_file_name--- ",  row.attachment_file_name)}
                                            <span className="type-icon">
                                                <img src={require('../../assets/images/pencil-sign.svg')} alt="" />
                                            </span>
                                            <span className="description">{row.attachment_file_name} </span>
                                            {/* <span className="description">Created by <b>SYSTEM</b> <i>{moment(selectedTicket.created_at).format('DD/MM/YYYY hh:mm A')}</i></span> */}
                                        </div>   
                                    : null}
                            </div>
                            )}

                            <div className="justify-content-left opntckt">
                
                                <div className="issueSummery">
                                    <div class="form-group">
                                        <h4>Post a Reply</h4>
                                        <p className="mandotory-field">To best assist you, we request that you be specific and detailed <span>*</span></p>
                                        <FormGroup>
                                            <Field
                                                name="description"
                                                as="textarea"
                                                className={'form-control' + (errors.description && touched.description ? ' is-invalid' : '')}
                                                component={props =>
                                                    <CKEditor
                                                        config={
                                                            {placeholder: "Write your details here"},
                                                            {fillEmptyBlocks: false},
                                                            {forcePasteAsPlainText: true},
                                                            {basicEntities : false},
                                                            {entities_greek : false},
                                                            {entities_latin : false},
                                                            {entities_additional : ''}
                                                        }
                                                        editor={ClassicEditor}
                                                        // onInit={editor => {
                                                        //     // You can store the "editor" and use when it is needed.
                                                        //     console.log('Editor is ready to use!', editor);
                                                        // }}
                                                        data={values.description}
                                                        onReady={ editor => {
                                                            // You can store the "editor" and use when it is needed.
                                                            console.log( 'Editor is ready to use!', editor );
                                                        } }
                                                        onChange={(event, editor) => {
                                                            const data = editor.getData();
                                                            console.log({ event, editor, data });
                                                        }}
                                                        onBlur={(event, editor) => {
                                                            const data = editor.getData();
                                                            console.log('Blur.',event, editor.getData());
                                                            values.description = data;
                                                        }}
                                                        onFocus={(event, editor) => {
                                                            console.log('Focus.', editor);
                                                        }}
                                                    />
                                                }
                                            />
                                            <ErrorMessage name="description" component="div" className="errorMsg" /> 
                                        </FormGroup>
                                    </div>
                                    <div class="form-group">
                                        <input type="file" key='1' name="attachment"
                                            // accept=".png, .jpeg, .jpg, .doc, .docx, .xls, .xlsx, .pdf"
                                            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.key,.ppt,.pptx,.pps,.ppsx,.odt,.xls,.xlsx,.zip,.html,.bmp,.dib,.txt,.xml,.eml,.csv,.msg,.xps,.htm"
                                            onChange={(e) => {
                                                const { target } = e
                                                if (target.value.length > 0) {
                                                    this.fileUpload(e.target.files)
                                                } 
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    {selectedTicket.status != "Resolved" ?
                                    <button type="submit" className="btn btn-success mr-2">Post Reply</button> : null
                                    }
                                    {selectedTicket.status == "Resolved" ?
                                    <button type="submit" className="btn btn-success mr-2">Reopen</button> : null
                                    }
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