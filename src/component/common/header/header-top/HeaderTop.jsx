import React, { Component } from 'react';
import { Dropdown } from 'react-bootstrap';
import Loader from "react-loader-spinner";
import { connect } from "react-redux";
import SideNav from "../../../common/side-nav/SideNav";
import { authLogout } from "../../../../store/actions/auth";
import axios from "../../../../shared/axios"
import Encryption from '../../../../shared/payload-encryption';
import Blink from 'react-blink-text';
import { loaderStart, loaderStop } from "../../../../store/actions/loader";
import {logoToggle } from "../../../../store/actions/toggle";

// let logo = sessionStorage.getItem('logo') && sessionStorage.getItem('logo') != "undefined" ? sessionStorage.getItem('logo') : "search.svg"

class HeaderTop extends Component {

    state = {
        logo: sessionStorage.getItem('logo') && sessionStorage.getItem('logo') != "undefined" ? sessionStorage.getItem('logo') : "",
        bc_data: {},
        csc_data: {},
        phrases: [],
        toggle1: true
    }

    // handleLogout = () => {
    //     let token = localStorage.getItem("auth_token");
    //     axios.get('/logout')
    //         .then(res => {
    //             localStorage.removeItem('cons_reg_info');
    //             this.props.history.push(`/LogIn`);
    //             this.props.logout();
    //         })
    //         .catch(err => {
    //             this.props.logout();
    //             // this.props.loadingStop();
    //         });

    // };


    componentWillUpdate(nextProps, nextState) {
        // logo = sessionStorage.getItem('logo') && sessionStorage.getItem('logo') != "undefined" ? sessionStorage.getItem('logo') : ""
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = function () {
          window.history.go(1);
        };
    }

    toggle = () => {
        var data = this.props.logo_toggle
        if(data == true) {
            this.props.logoToggle(false);
        }
        else this.props.logoToggle(true);
        
    }

    toggle1 = () => {
        var data = this.state.toggle1
        if(data == true) {
            this.setState({toggle1:false});
        }
        else this.setState({toggle1:true});
        
    }

    fetchPhrases = () => {
        this.props.loadingStart();
        axios
          .post(`maintenance/fetchPhrases`, {})
          .then(res => {
            let phraseData = (res.data.phrase ? res.data.phrase : []);
            this.setState({
                phrases: phraseData
            });
            localStorage.setItem("phrases", JSON.stringify(phraseData) )
            this.props.loadingStop();
            window.location.reload();
            return true
          })
          .catch(err => {
            this.setState({
              phrases: []
            });
            this.props.loadingStop();
            return false
          });
      }

    componentDidMount() {
        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        let csc_data = sessionStorage.getItem('users') ? sessionStorage.getItem('users') : "";

        if(bc_data) {
            let encryption = new Encryption();
            bc_data = JSON.parse(encryption.decrypt(bc_data));
            this.setState({bc_data})
        }
        else if(csc_data && sessionStorage.getItem('csc_id')) {
            let encryption = new Encryption();
            // csc_data = JSON.parse(csc_data)          
            // csc_data = csc_data.user
            csc_data = JSON.parse(csc_data) 
            csc_data = csc_data.user
            csc_data = JSON.parse(encryption.decrypt(csc_data));  
            this.setState({csc_data})
        }
    }

      
    render() {
        const { logo, bc_data, csc_data } = this.state

        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        
        return (
            <>
				
			
		<header class="topbar" data-navbarbg="skin1">
            <nav class="navbar top-navbar navbar-expand-md navbar-dark">
                <div class="navbar-header expand-logo" data-logobg="skin1">
                    
                    <a class="nav-toggler waves-effect waves-light d-block d-md-none" href="javascript:void(0)" onClick= {this.toggle}>
					<img src={require('../../../../assets/images/toggle-icon.png')} alt="" />
					</a>
					
                    
                    <a class="navbar-brand logoActive" href="javascript:void(0)" >
                    
                        <b class="logo-icon text-center">
							<img src={require('../../../../assets/images/smallLogo.png')} alt="" />
                        </b>
                        
						
                        
                        <span class="logo-text text-center" >
							<img src={require('../../../../assets/images/logo.svg')} alt="" />
                        </span>
                    </a>
                    
					
                  
                    <a class="topbartoggler d-block d-md-none waves-effect waves-light" href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" onClick= {this.toggle1}>
						<img src={require('../../../../assets/images/toggler.png')} alt="" />
					</a>
                </div>
				
                <div class= {this.state.toggle1 ? "navbar-collapse collapse pushWrap" : "navbar-collapse collapse pushWrap displayshow"} id="navbarSupportedContent" data-navbarbg="skin1">
                    
                    <ul class="navbar-nav me-auto">
						<li class="nav-item"> 
							<a class="nav-link sidebartoggler d-none d-md-block waves-effect waves-dark" href="javascript:void(0)" onClick= {this.toggle}>
							<img src={require('../../../../assets/images/toggle-icon.png')} alt="" />
							
							</a>
						</li>
                    </ul>
					
                   
                    <ul class="navbar-nav">
						<li class="nav-item dropdown">
                             <select
                            name="langauage"
                            className="listSelect"
                            defaultValue={localStorage.getItem('lang_name')}
                            onChange={e => {
                                localStorage.setItem('lang_name', e.target.value);
                                this.fetchPhrases();
                            }}
                            style={{
                                width: '96px',
                                position: 'relative',
                                top: '14px',
                                left: '-9px',
                                border: '0px',
                                boxShadow: 'none'
                            }}>
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                        </select>
                        </li>
						
                        <li class="nav-item dropdown dropmodify">
                            <Dropdown alignRight>
                            <Dropdown.Toggle variant="" id="dropdown-basic">
                                <div className="d-flex topUserBtn">
                                {sessionStorage.getItem("auth_token") && bc_data.user_info && phrases ?
                                    <div className="align-self-center userNameImg">
                                        {phrases['Welcome']} {bc_data.user_info.data.user.name}
                                        <p><a href={process.env.REACT_APP_PAYMENT_URL+'/core/public/pdf_files/RM-name-SBIG.xlsx'}>
                                                <Blink color='blue' text= {phrases['DownloadRMList']} fontSize='14'>
                                                {phrases['DownloadRMList']}
                                                </Blink> 
                                        </a></p>
                                    </div>
                                        :  
                                        sessionStorage.getItem("auth_token") && csc_data && phrases ?
                                        <div className="align-self-center userNameImg">
                                            {phrases['Welcome']} {csc_data.name}
                                            <p><a href={process.env.REACT_APP_PAYMENT_URL+'/core/public/pdf_files/RM-name-SBIG.xlsx'}>
                                                <Blink color='blue' text= {phrases['DownloadRMList']} fontSize='14'>
                                                {phrases['DownloadRMList']}
                                                </Blink> 
                                            </a></p>
                                        </div>
                                        : null }
                                    <div className="align-self-center">
                                     {this.props.flag == "logout" ? null :  
                                    logo ? 
                                    <img src={require(`../../../../assets/images/${logo}`)} alt="" className="notiBell"/>
                                    : null}
                                    </div>
                                    
                                    {/* <div className="align-self-center d-none d-sm-block">
                                    <img src={require('../../../../assets/images/shapes-and-symbols.svg')} alt="" />
                                    </div> */}
                                </div>
                            </Dropdown.Toggle>
                            {/* <Dropdown.Menu>
                                <Dropdown.Item >Logout</Dropdown.Item> 
                            </Dropdown.Menu> */}
                        </Dropdown>
                        </li>
						
                                              
                    </ul>
                </div>
            </nav>
        </header>

           </>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        logout: () => dispatch(authLogout()),
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
        logoToggle: (data) => dispatch(logoToggle(data)),
    }
}

const mapStateToProps = state => {
    return {
        loading: state.loader.loading,
        logo_toggle: state.toggle.logo_toggle
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderTop);