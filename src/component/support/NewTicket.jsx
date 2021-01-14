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
import Encryption from '../../shared/payload-encryption';


class NewTicket extends Component {

    state = {
        selectedFile: '',
        selectedFileName: '',
        ticketId: ''
    };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
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
        
        // const formData = new FormData();

        // formData.append(
        //     "fileName",
        //     selectedFile[0],
        //     selectedFile[0].name
        // );

        // axios
        //     .post("maintenance/uploadDocs", formData)
        //     .then(res => {
        //         swal(res.data.message, {
        //             icon: "success"
        //         }).then(() => {
        //             this.props.loadingStop();
        //             this.getScheduleList();
        //         });
        //     })
        //     .catch(err => {
        //         //   swal("", err.data.message, 'error');
        //         this.props.loadingStop();
        //     });

    }

    fileAttachment = (ticketId, resetForm, message) => {
        const formData = new FormData();
        formData.append('attachment_file', this.state.selectedFile); 
        formData.append('fileName', this.state.selectedFileName);
        formData.append('ticket_id', ticketId);

        axios
        .post("help-ticket/file-move", formData)
        .then(res => {
            console.log("File Upload", res);

            const formData1 = new FormData();
            formData1.append('ticket_id', ticketId);
            
            axios
            .post("help-ticket/attachment", formData1)
            .then(res1 => {
                console.log("Attach Upload", res1);
                swal(message +" "+ `\nTicket No.  ${ticketId}`, {
                    icon: "success"
                }).then(() => {
                    this.props.loadingStop();
                    resetForm();
                    window.location.reload();
                    // this.props.history.push('Supports');
                });
            })
            .catch(err1 => {
                console.log("Attach fail", err1);
                this.props.loadingStop();
            });
        })
        .catch(err => {
            console.log("File fail", err);

            // swal("", err.data.message, 'error');
            this.props.loadingStop();
        });
    }

    handleSubmit=(values, { resetForm })=>{

        const formData = new FormData();
        let encryption = new Encryption();

        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }
        let user_type = sessionStorage.getItem('csc_id') ? 'csc' : 'bc'
        let master_id = sessionStorage.getItem('csc_id') ? '5' : bc_data ? bc_data.agent_id : ""
        let user_id = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : bc_data ? bc_data.user_info.data.user.username : ""

        formData.append('user_type', user_type); 
        formData.append('master_id', master_id);
        formData.append('user_id', user_id);

        formData.append('caller_email', values.caller_email); 
        formData.append('description', values.description);
        formData.append('area', values.area); 
        formData.append('title', values.title);
        formData.append('mobile', values.mobile); 

        this.props.loadingStart();
        axios.post('help-ticket/create',formData)
        .then(res=>{

            console.log("Ticket", res.data);
            let ticketId = res.data.data.internal_ticket_id;

            this.setState({
                ticketId
            });
            if (this.state.selectedFile && this.state.selectedFileName !== '') {
                this.fileAttachment(ticketId, resetForm, res.data.msg);
            }else {
                swal(res.data.msg +" "+ `\nTicket No.  ${ticketId}`, {
                    icon: "success"
                }).then(() => {
                    this.props.loadingStop();
                    resetForm();
                    window.location.reload();
                    // this.props.history.push('Supports');
                });
            }
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                selectedFile: "",
                selectedFileName: "",
                ticketId: ""
            });
        })
    }

    shouldComponentUpdate( nextProps ) {
        if ( !this.editor ) {
            return false;
        }
    }

    // componentDidMount() {
    //     this.getHelpMasterList()
    // }

    render() {
        const { selectedFile, selectedFileName } = this.state
        console.log(selectedFile, selectedFileName);
        return (
            <>
                <div className="createtckt">
                    <div className="d-flex justify-content-left opntckt">
                        <div>
                            <h2>Open a New Ticket</h2>
                            <p>Please fill in the form below to open a new ticket.</p>
                            {/* <p class='class="text-primary'>
                                <Link class='class="text-primary' to="/TicketCount" activeClassName="active">Existing Tickets</Link>
                            </p> */}

                        </div>
                    </div>

                    {/* <div className="opntckt">
                        <Row>
                            <Col sm={12} md={1}>Email:	</Col>
                            <Col sm={12} md={1}>test@gmail.com</Col>
                        </Row>
                        <Row>
                            <Col sm={12} md={1}>Client:</Col>
                            <Col sm={12} md={11}>XXXXXX</Col>
                        </Row>
                    </div> */}

                    <div className="justify-content-left opntckt">
                        <Formik
                            initialValues={{ caller_email: '', description: '' }}
                            validationSchema={Yup.object().shape({
                                caller_email: Yup.string().email('Enter a valid Email Id').required('Email Id is required'),
                                description: Yup.string().required('Issue Summery is required')
                            })}
                            onSubmit={this.handleSubmit}
                        >
                            {({ errors, status, touched, values }) => (
                                <Form>
                                    <div className="justify-content-left opntckt">
                                        <Row>
                                            <Col sm={12} md={1}><strong>Email: </strong></Col>
                                            <Col sm={12} md={3} className="formSection">
                                                <FormGroup >
                                                        <Field
                                                            name="caller_email"
                                                            type="text"
                                                            placeholder=""
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value={values.caller_email}
                                                            style={{width: '100%'}}
                                                        />
                                                        {errors.caller_email && touched.caller_email ? (
                                                            <span className="errorMsg">{errors.caller_email}</span>
                                                        ) : null}
                                                        <ErrorMessage name="caller_email" component="div" className="invalid-feedback" />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col sm={12} md={1}><strong>Mobile: </strong></Col>
                                            <Col sm={12} md={3} className="formSection">
                                                <FormGroup >
                                                        <Field
                                                            name="mobile"
                                                            type="text"
                                                            placeholder=""
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value={values.mobile}
                                                            style={{width: '100%'}}
                                                        />
                                                        {errors.mobile && touched.mobile ? (
                                                            <span className="errorMsg">{errors.mobile}</span>
                                                        ) : null}
                                                        <ErrorMessage name="mobile" component="div" className="invalid-feedback" />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="justify-content-left opntckt">
                                        <Row>
                                            <Col sm={12} md={1}><strong>Area: </strong></Col>
                                            <Col sm={12} md={3} className="formSection">
                                                <FormGroup >
                                                <Field
                                                        name='area'
                                                        component="select"
                                                        autoComplete="off"
                                                        className="formGrp inputfs12"
                                                        value = {values.status}                                            
                                                    >
                                                        <option value="PDF related issues">PDF related issues</option>
                                                        <option value="Portal slowness/speed related issues">Portal slowness/speed related issues</option>
                                                        <option value="Agent ID unauthorized / Invalid Request">Agent ID unauthorized / Invalid Request</option>
                                                        <option value="Vehicle Make/Model not available in Portal">Vehicle Make/Model not available in Portal</option>
                                                        <option value="Break-in inspection related issues">Break-in inspection related issues</option>
                                                        <option value="Payment related issues">Payment related issues</option>
                                                        <option value="VAAHAN related issues">VAAHAN related issues</option>
                                                        <option value="Any other issues">Any other issues</option>

                                                        
                                                    </Field>
                                                        {errors.area && touched.area ? (
                                                            <span className="errorMsg">{errors.area}</span>
                                                        ) : null}
                                                        <ErrorMessage name="area" component="div" className="invalid-feedback" />
                                                </FormGroup>
                                            </Col>
                                        </Row>                                      
                                    </div>
                                    <div class="form-group issue-area">
                                        <Row>
                                            <Col sm={12} md={1}><strong>Title: </strong></Col>
                                            <Col sm={12} md={9} className="formSection">
                                                <FormGroup >
                                                        <Field
                                                            name="title"
                                                            type="text"
                                                            placeholder=""
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value={values.title}
                                                            style={{width: '100%'}}
                                                        />
                                                        {errors.title && touched.title ? (
                                                            <span className="errorMsg">{errors.title}</span>
                                                        ) : null}
                                                        <ErrorMessage name="title" component="div" className="invalid-feedback" />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <label for="usr"><strong>Issue Summary:</strong></label>
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
                                            <ErrorMessage name="description" component="div" className="invalid-feedback" />
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

                                    <div className="form-group">
                                        <button type="submit" className="btn btn-primary mr-2">Register</button>
                                        <button type="reset" className="btn btn-secondary">Reset</button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(NewTicket);