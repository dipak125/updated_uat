import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Button, Navbar, Nav, Form, FormControl, NavDropdown, NavItem, Row, Col, Tab } from 'react-bootstrap';

import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";

import Table from './ClaimTable';
import Footer from '../common/footer/Footer';


class ClaimIntimation extends Component {

    state = {
        product_id: ''
    };

    componentDidMount() {
        let product_id = sessionStorage.getItem("product_id")
        this.setState({
            product_id: product_id
        })

        // this.setState({
        //     product_id: '5221643668'
        // })


    }
    
    render() {
        const {product_id} = this.state
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
                                        <Tab.Container id="left-tabs-example" defaultActiveKey= "first"> 
                                            <Row>
                                                <Col sm={12}>
                                                    <Nav variant="pills" className="flex-column">
                                                        <div className="d-flex justify-content-left messageDeskTab">
                                                        <div><Nav.Item><Nav.Link eventKey="first">{phrases['ClaimModule']}</Nav.Link></Nav.Item></div>
                                                        
                                                        </div>
                                                    </Nav>
                                                </Col>
                                                <Col sm={12}>
                                                    <Tab.Content>
                                                        <Tab.Pane eventKey="first">
                                                            <Table tabId='1'/>
                                                            <Footer />
                                                        </Tab.Pane>
                                                        
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
      loadingStop: () => dispatch(loaderStop())
    };
  };
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(ClaimIntimation);