import React, { Component, Fragment } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
// import { HiRefresh } from "react-icons/hi";
import {
  Row,
  Col,
  Modal,
  Button,
  FormGroup,
  OverlayTrigger,
  Tooltip,
  Container,
  Card,
  Dropdown,
} from "react-bootstrap";
// import Calendar from "react-calendar";
// import Collapsible from "react-collapsible";
// import BackContinueButton from "../common/button/BackContinueButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.min.css";
import { Formik, Field, Form, FieldArray } from "formik";
import BaseComponent from "../BaseComponent";
import SideNav from "../common/side-nav/SideNav";
import Footer from "../common/footer/Footer";
import { Link, withRouter } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios";
// import Encryption from "../../shared/payload-encryption";
// import * as Yup from "yup";
// import swal from "sweetalert";
// import { useState } from "react";
import moment from "moment";
// var Component = React.Component;
import "./style.css";
// import Autosuggest from "react-autosuggest";

var minDate = "";
var maxDate = "";

const initialValues = {
  start_date: new Date(),
  end_date: new Date(),
};

minDate = moment().calendar();
var max_date = moment().format("L");
maxDate = moment().calendar();

console.log(minDate);
console.log(maxDate);

const option = {
  title: {
    display: true,
    // text: 'Line chart'
  },
  scales: {
    yAxes: [
      {
        ticks: {
          min: 0,
          max: 100,
          stepSize: 10,
        },
      },
    ],
  },
};

class Dashboard extends Component {
  state = {
    chartData: {},
    update_data: [],
    posts: [],
  };

  handleSubmit = (values) => {
    console.log("submit_values------ ", values.start_date);
    const formData = new FormData();
    formData.append(
      "start_date",
      moment(values.start_date).format("YYYY-MM-DD")
    );
    formData.append("end_date", moment(values.end_date).format("YYYY-MM-DD"));

    axios
      .post(`policy-master`, formData)
      .then((res) => {
        let rawData = res.data.data;
        let motor_policy_count = 0;
        let health_policy_count = 0;
        let motor_premium_count = 0;
        let health_premium_count = 0;

        for (var i = 0; i < rawData.length; i++) {
          if (rawData[i].name !== "Health") {
            motor_policy_count =
              parseInt(rawData[i].totalPolicyCount) + motor_policy_count;
          } else {
            health_policy_count =
              parseInt(rawData[i].totalPolicyCount) + health_policy_count;
          }
        }

        for (var i = 0; i < rawData.length; i++) {
          if (rawData[i].name !== "Health") {
            motor_premium_count =
              parseInt(rawData[i].totalPremium) + motor_premium_count;
          } else {
            health_premium_count =
              parseInt(rawData[i].totalPremium) + health_premium_count;
          }
        }

        let total_count =
          parseInt(motor_policy_count) + parseInt(health_policy_count);

        let total_premium_count =
          parseInt(motor_premium_count) + parseInt(health_premium_count);

        let chartData = {
          labels: ["Motor", "Health", "Total"],
          datasets: [
            {
              label: "Policy",
              data: [motor_policy_count, health_policy_count, total_count],
              backgroundColor: "#48dbfb",
            },
            {
              label: "Premium",
              data: [
                motor_premium_count,
                health_premium_count,
                total_premium_count,
              ],
              backgroundColor: "#00d2d3",
            },
          ],
        };
        console.log("chart data------->", chartData);

        this.setState({
          chartData: chartData,
        });
      })
      .catch((err) => {
        this.props.loadingStop();
      });
  };

  fetchNotification = () => {
    axios
      .get(`notifications`)
      .then((res) => {
        let Data = res.data.data;
        this.setState({
          update_data: Data,
        });
      })
      .catch((err) => {
        this.props.loadingStop();
      });
  };

  componentDidMount() {
    this.fetchNotification();
  }

  render() {
    // const {update_data} = this.state

    // let newInitialValues = Object.assign()
    const { chartData, update_data } = this.state;

    console.log("Data----->", update_data);

    const notificationData =
      update_data && update_data.length > 0
        ? update_data.map(
            (id, qIndex) => (
              // id.description &&
              // id.description.map((benefit, bIndex) => (
              <div>
                <div className="container">
                  <Row>
                    <Col sm={12} md={12}>
                      <FormGroup>
                        <h8>&#10146;{id.description}</h8>
                      </FormGroup>
                    </Col>
                    {/* <Col sm={12} md={6}>
                      <FormGroup>
                        ₹ {Math.round(benefit.AnnualPremium)}
                      </FormGroup>
                    </Col> */}
                  </Row>
                </div>
              </div>
            )
            // )
            // )
          )
        : null;

    return (
      <>
        <BaseComponent>
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                <SideNav />
              </div>
              <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                <h4 className="text-center mt-3 mb-3">
                  SBI General Insurance Company Limited
                </h4>
                <section className="brand m-b-25">
                  <h4 className="text-center mt-3 mb-3">Dashboard</h4>
                  <Formik
                    initialValues={initialValues}
                    onSubmit={this.handleSubmit}
                    // validationSchema={ComprehensiveValidation}
                  >
                    {({
                      values,
                      errors,
                      setFieldValue,
                      setFieldTouched,
                      isValid,
                      isSubmitting,
                      touched,
                    }) => {
                      return (
                        <Form>
                          <Container fluid>
                            <Row
                              className="show-grid contentTopPan"
                              xs={2}
                              md={4}
                              lg={6}
                              mb={3}
                            >
                              <Col sm={12} md={12} lg={6}>
                                <Card
                                  border="success"
                                  style={
                                    ({ width: "30rem" }, { height: "30rem" })
                                  }
                                >
                                  <Card.Header>
                                  <h6><strong>Business Achievement</strong>
                                    <Button type="submit" className="ml-4">
                                      Fetch
                                      {/* {<HiRefresh />} */}
                                    </Button>
                                    </h6>
                                  </Card.Header>
                                  <Card.Body>
                                    <Card.Title>
                                      <Row>
                                        <Col sm={6} md={5} lg={6}>
                                          <FormGroup>
                                            <DatePicker
                                              name="start_date"
                                              minDate={new Date(minDate)}
                                              maxDate={new Date(max_date)}
                                              dateFormat="yyyy MMM dd"
                                              placeholderText="start date"
                                              peekPreviousMonth
                                              peekPreviousYear
                                              showMonthDropdown
                                              // showYearDropdown
                                              scrollableMonthYearDropdown
                                              dropdownMode="select"
                                              className="datePckr inputfs12"
                                              selected={values.start_date}
                                              onChange={(val) => {
                                                setFieldTouched("start_date");
                                                setFieldValue(
                                                  "start_date",
                                                  val
                                                );
                                              }}
                                            />
                                          </FormGroup>
                                        </Col>
                                        <Col sm={6} md={5} lg={6}>
                                          <FormGroup>
                                            <DatePicker
                                              name="end_date"
                                              minDate={values.start_date}
                                              maxDate={new Date(maxDate)}
                                              dateFormat="yyyy MMM dd"
                                              placeholderText="end date"
                                              peekPreviousMonth
                                              peekPreviousYear
                                              showMonthDropdown
                                              // showYearDropdown
                                              dropdownMode="select"
                                              className="datePckr inputfs12"
                                              selected={values.end_date}
                                              onChange={(val) => {
                                                setFieldTouched("end_date");
                                                setFieldValue("end_date", val);
                                              }}
                                            />
                                          </FormGroup>
                                        </Col>
                                      </Row>
                                    </Card.Title>
                                    <Card.Text>
                                      <Bar
                                        data={this.state.chartData}
                                        options={option}
                                      />
                                    </Card.Text>
                                  </Card.Body>
                                </Card>
                                {/* <h4 className="col-lm-5">
                        Business Achievement <HiRefresh />
                      </h4> */}

                                {/* <a href="#/businessachivement">refresh1 </a> */}
                                {/* <Link to="/#/businessAchivement">refresh</Link> */}
                                {/* <Bar data={data} options={option} /> */}
                              </Col>
                              {/* </Row>
                  <Row className="show-grid contentTopPan"> */}
                              <Col sm={12} md={12} lg={6}>
                                <Card
                                  border="info"
                                  style={
                                    ({ width: "30rem" }, { height: "30rem" })
                                  }
                                >
                                  <Card.Header>
                                    <h6 className="mt-1 mb-4"><strong>Updates and notification</strong></h6>
                                  </Card.Header>
                                  <Card.Body className="scrollable">
                                    <Card.Text>{notificationData}</Card.Text>
                                  </Card.Body>
                                </Card>
                              </Col>
                            </Row>
                          </Container>
                        </Form>
                      );
                    }}
                  </Formik>
                </section>
                <Footer />
              </div>
            </div>
          </div>
        </BaseComponent>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.loader.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadingStart: () => dispatch(loaderStart()),
    loadingStop: () => dispatch(loaderStop()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Dashboard)
);
