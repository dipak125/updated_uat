import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Button, Row, Col } from 'react-bootstrap';

import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { Formik, Field, Form } from "formik";

import Table from '../common/Table';
import Footer from '../common/footer/Footer';

const initialValues = []

class Health extends Component {
    render() {
        const newInitialValues = Object.assign(initialValues, {
            gender: '',
            password: ''
        });
        return (
            <>
            <BaseComponent>
                <section className="d-flex justify-content-left">
                    <div className="flex-fill w-100">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2">
                                    <SideNav />
                                </div>
                                <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10">
                                    <div className="messageDeskSec">
                                        Help us with some information about yourself

                                        <Formik
                                        initialValues={newInitialValues}
                                        // validationSchema={loginvalidation}
                                        // onSubmit={this.handleSubmit}
                                    >
                                        {({ values, errors, isValid, touched, isSubmitting }) => {
                                            return (
                                                <Form>
                                                    <Row className="show-grid">
                                                        <Col md={12}>
                                                            <div className="form-group">
                                                                <label>Gender</label>
                                                                <Field
                                                                    name="gender"
                                                                    type="text"
                                                                    className={`form-control`}
                                                                    placeholder=""
                                                                    autoComplete="off"
                                                                    value={values.gender}
                                                                />
                                                            </div>
                                                        </Col>
                                                        <Col md={12}>
                                                            <div className="form-group">
                                                                <label>Looking to insure</label>
                                                                <Field
                                                                    name="members"
                                                                    type="text"
                                                                    className={`form-control`}
                                                                    autoComplete="off"
                                                                    placeholder="Select"
                                                                    value={values.members}
                                                                />

                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Row className="show-grid">
                                                        <Col xs={4}>
                                                            <Button
                                                                type="submit"
                                                                className={`btn btn-default btn-md ${
                                                                    isSubmitting ? "btn-disable" : "btn-custom-red"
                                                                    } pull-right`}
                                                                disabled={isSubmitting ? true : false}
                                                            >
                                                                {isSubmitting ? "Wait..." : "Go"}
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </Form>
                                            );
                                        }}
                                    </Formik>
                                    </div>
                                    <Footer />
                                </div>

                            </div>
                        </div>
                    </div>
                </section>
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
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(Health);