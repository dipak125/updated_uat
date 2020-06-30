import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import BaseComponent from './BaseComponent';
import { Formik, Form, Field, ErrorMessage } from 'formik';

class ErrorPage extends Component {
    render() {
        return (
            <>
                 <BaseComponent>
                    <div className="container-fluid">
                    <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 pd-l-0">
                                <div className="error404">
                                    <h3>404</h3>
                                    <h4>Oops! Page not found</h4>
                                    <p>Sorry, but the page you are looking for is not found. Please, make sure you have typed the currect URL.</p>
                                </div>
                                </div>
                            </div>

                    </div>
                    </BaseComponent>
            </>
        );
    }
}

export default ErrorPage;