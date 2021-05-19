import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Button, Navbar, Nav, Form, FormControl, NavDropdown, NavItem, Row, Col, Tab } from 'react-bootstrap';

import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";

import Motor from '../common/Motor';
import Health from '../common/Health';
import Others from '../common/Others';
import PersonalAccident from '../common/PersonalAccident';
import Miscellaneous from '../common/Miscellaneous';
import Footer from '../common/footer/Footer';
import { setData } from "../../store/actions/data";
import axios from "../../shared/axios"
import Encryption from '../../shared/payload-encryption';
import swal from 'sweetalert';


class Products extends Component {

    state = {
        product_id: '',
        motor_list: [],
        health_list: [],
        misc_list: [],
        personalAccident_list: [],
        fire_list: []
    };

    componentDidMount() {
        this.getPolicyList();

        let product_id = sessionStorage.getItem("product_id")
        this.props.setData([])
        this.setState({
            product_id: product_id
        })

    }

    getPolicyList = () => {
        let encryption = new Encryption();
        const formData = new FormData(); 
        let bcLoginData = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")): "";
        let user_id = ""
        
        if (user_data) {
            user_id = JSON.parse(encryption.decrypt(user_data.user));
          }

        formData.append('user_id',user_id.master_user_id)
        formData.append('role_id',user_id.role_id)
        formData.append('login_type',user_id.login_type)
        formData.append('bc_id',user_id.bc_master_id)

        this.props.loadingStart();

        axios.post(`visible/products`, formData)
          .then(res => {
            if(res.data.error == false) {        
                this.setState({
                    motor_list: res.data.data.Motor,
                    health_list: res.data.data.Health,
                    misc_list: res.data.data.MiscellaneousLOB,
                    personalAccident_list: res.data.data.PersonalAccident,
                    fire_list: res.data.data.FireInsurance
                });
    
                localStorage.removeItem('policyHolder_id');
                localStorage.removeItem('policyHolder_refNo');
                localStorage.removeItem('display_gender');
                sessionStorage.removeItem('pan_data');
                sessionStorage.removeItem('email_data');
                sessionStorage.removeItem('proposed_insured');
                sessionStorage.removeItem('display_looking_for');
                sessionStorage.removeItem('display_dob');
                localStorage.removeItem('newBrandEdit');
                localStorage.removeItem('brandEdit');
                localStorage.removeItem('registration_number');
                localStorage.removeItem('policy_type');
                localStorage.removeItem('check_registration');
                localStorage.removeItem('confirm');     
                this.props.loadingStop();
            }
            else {
                this.props.loadingStop();
            }
          })
          .catch(err => {
            this.setState({
                motor_list: [],
                health_list: [],
                misc_list: [],
                personalAccident_list: [],
                fire_list: [] })
            this.props.loadingStop();
          });
    }

    render() {
        const { product_id, motor_list, health_list, misc_list, personalAccident_list, fire_list } = this.state
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        console.log('product_id', product_id)
        return (
            <>
                <BaseComponent>
				
				<div className="page-wrapper">
				
                    <section className="d-flex justify-content-left">
                        <div className="flex-fill w-100">
                            <div className="container-fluid">
                                <div className="row">
									
								<aside className="left-sidebar">
							 	 <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
							 		<SideNav />
								 </div>
								</aside>
									
                                    <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox">
                                        <div className="messageDeskSec">
                                            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                                                <Row>
                                                    <Col sm={12}>
                                                        <Nav variant="pills" className="flex-column">
                                                            <div className="d-flex justify-content-left messageDeskTab">
                                                            {motor_list && motor_list.length > 0 ?
                                                                <div><Nav.Item><Nav.Link eventKey="first">{phrases['Motor']}</Nav.Link></Nav.Item></div> : null }
                                                            {health_list && health_list.length > 0 ?
                                                                <div><Nav.Item><Nav.Link eventKey="second">{phrases['Health']}</Nav.Link></Nav.Item></div> : null }
                                                            {fire_list && fire_list.length > 0 ?    
                                                                <div><Nav.Item><Nav.Link eventKey="third">{phrases['FireInsurance']}</Nav.Link></Nav.Item></div> : null }
                                                            {personalAccident_list && personalAccident_list.length > 0 ?
                                                                <div><Nav.Item><Nav.Link eventKey="fourth">{phrases['PersonalAccident']}</Nav.Link></Nav.Item></div> : null }
                                                            {misc_list && misc_list.length > 0 ?
                                                                <div><Nav.Item><Nav.Link eventKey="fifth">{phrases['MiscellaneousLOB']}</Nav.Link></Nav.Item></div> : null }
                                                            </div>
                                                        </Nav>
                                                    </Col>
                                                    <Col sm={12}>
                                                        <Tab.Content>
                                                            {motor_list && motor_list.length > 0 ?
                                                            <Tab.Pane eventKey="first">
                                                                <Motor product_list= {motor_list} tabId = '1' />
                                                                <Footer />
                                                            </Tab.Pane> : null }

                                                            {health_list && health_list.length > 0 ?
                                                            <Tab.Pane eventKey="second">
                                                                <Health product_list= {health_list} tabId = '2' />
                                                                <Footer />
                                                            </Tab.Pane> : null }

                                                            {fire_list && fire_list.length > 0 ?
                                                            <Tab.Pane eventKey="third">
                                                                <Others product_list= {fire_list} tabId = '3' />
                                                                <Footer />
                                                            </Tab.Pane> : null }

                                                            {personalAccident_list && personalAccident_list.length > 0 ?
                                                            <Tab.Pane eventKey="fourth">
                                                                <PersonalAccident product_list= {personalAccident_list} tabId = '4' />
                                                                <Footer />
                                                            </Tab.Pane> : null }

                                                            {misc_list && misc_list.length > 0 ?
                                                            <Tab.Pane eventKey="fifth">
                                                                <Miscellaneous product_list= {misc_list} tabId = '5' />
                                                                <Footer />
                                                            </Tab.Pane> : null }

                                                        </Tab.Content>
                                                    </Col>
                                                </Row>
                                            </Tab.Container>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>
                    </section>
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
        loadingStop: () => dispatch(loaderStop()),
        setData: (data) => dispatch(setData(data))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Products);