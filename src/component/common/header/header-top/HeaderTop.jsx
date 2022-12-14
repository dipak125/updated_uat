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


class HeaderTop extends Component {

    state = {
        logo: sessionStorage.getItem('logo') && sessionStorage.getItem('logo') != "undefined" ? sessionStorage.getItem('logo') : "",
        bc_d: {},
		user_data: {},
        phrases: [],
        toggle1: true,
        profileBatch : ''
    }


    componentWillUpdate(nextProps, nextState) {
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
		let user_data = sessionStorage.getItem('users') ? JSON.parse(sessionStorage.getItem('users')) : "";

        if(user_data) {
            let encryption = new Encryption();
            user_data = user_data.user
            user_data = JSON.parse(encryption.decrypt(user_data));  
            this.setState({user_data})
        }
        this.getProfileBatchName();
    }

    getProfileBatchName = () => {
        // due to cors-policy and base url of uat has changed, I am unable to access the axios
        
        // axios.get(`profiling-csc-user/profile_batch_name`,{},{
        //     headers:{
        //         'Access-Control-Allow-Origin' : '*'
        //     }
	    // })        
        //   .then((response) => {
        //     console.log("response of profile batch", response);
        //     const val = response.data;
        //     this.setState({
        //       profileBatch: val.msg,
        //     });
        //   })
        //   .catch((error) => {
        //     console.log("error of profile batch", error);
        //   });
        let csc_data = sessionStorage.getItem('users') ? (sessionStorage.getItem('users')) : "";
        if(csc_data && sessionStorage.getItem('csc_id')) {
            const formData = new FormData();
        formData.append("csc_id",sessionStorage.getItem('csc_id'));
          axios.post(`profiling-csc-user/profile_batch_name`,formData).then(response=>{
            console.log("response of profile batch", response);
                const val = response.data;
                 this.setState({
                   profileBatch: val.msg,
                 });
          }).catch(err=>{
            
          })
        }
       
      };

      
    render() {
        const { logo, user_data } = this.state
		// console.log('user_data', user_data)

        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null

        const profileBatch = this.state.profileBatch;

        const profile_batch_styles = {
            padding: "2px 10px",
            borderRadius: "2px",
            border: "1px solid #aaa",
            boxShadow: `${
                profileBatch === "Gold"
                ? "#ff80007a"
                : profileBatch === "Platinum"
                ? "#630f687a"
                : "#aaaaaa9c"
            } 0px 2px 10px, inset ${
                profileBatch === "Gold"
                ? "#ff80007a"
                : profileBatch === "Platinum"
                ? "#630f687a"
                : "#aaaaaa9c"
            } 1px 1px 3px`,
            borderColor:
                profileBatch === "Gold"
                ? "#ff8000"
                : profileBatch === "Platinum"
                ? "#630f68"
                : "#aaa",
            };

        const profile_batch_name_styles = {
            fontFamily: "'Open Sans', sans-serif",
            textTransform: "uppercase",
            fontWeight: "500",
            fontSize: "1rem",
            color:
                profileBatch === "Gold"
                ? "#ff8000"
                : profileBatch === "Platinum"
                ? "#630f68"
                : "#aaa",
        };
        
        return (
            <>
            <header className="topbar" data-navbarbg="skin1">
                <nav className="navbar top-navbar navbar-expand-md navbar-dark">
                    <div className="navbar-header expand-logo" data-logobg="skin1">
                        
                        <a className="nav-toggler waves-effect waves-light d-block d-md-none" href="javascript:void(0)" onClick= {this.toggle}>
                        <img src={require('../../../../assets/images/toggle-icon.png')} alt="" />
                        </a>                     
                        <a className="navbar-brand logoActive" href="javascript:void(0)" >
                            <b className="logo-icon text-center">
                                <img src={require('../../../../assets/images/smallLogo.png')} alt="" />
                            </b>
                            <span className="logo-text text-center" >
                                <img src={require('../../../../assets/images/logo.svg')} alt="" />
                            </span>
                        </a> 

                        <a className="topbartoggler d-block d-md-none waves-effect waves-light" href="javascript:void(0)" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" onClick= {this.toggle1}>
                            <img src={require('../../../../assets/images/toggler.png')} alt="" />
                        </a>
                    </div>
                    
                    <div className= {this.state.toggle1 ? "navbar-collapse collapse pushWrap" : "navbar-collapse collapse pushWrap displayshow"} id="navbarSupportedContent" data-navbarbg="skin1">
                    {sessionStorage.getItem("auth_token") ?
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item"> 
                                <a className="nav-link sidebartoggler d-none d-md-block waves-effect waves-dark" href="javascript:void(0)" onClick= {this.toggle}>
                                <img src={require('../../../../assets/images/toggle-icon.png')} alt="" />
                                
                                </a>
                            </li>
                        </ul> : null }

                        {profileBatch && profileBatch !== "" ? (
                            <div
                              className="profile_batch mx-auto"
                              style={profile_batch_styles}
                            >
                              {/* <div class="_left">SBI</div> */}
                              <div
                                className="profile_batch_name"
                                style={profile_batch_name_styles}
                              >
                                {profileBatch}
                              </div>
                            </div>
                          ) : null}
                        
                    
                        <ul className="navbar-nav">
                        {sessionStorage.getItem("auth_token") ?
                            <li className="nav-item dropdown">
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
                            </li> : null }
                            
                            <li className="nav-item dropdown dropmodify">
                                <Dropdown alignRight>
                                <Dropdown.Toggle variant="" id="dropdown-basic">
                                    <div className="d-flex topUserBtn">
                                    {sessionStorage.getItem("auth_token")  && phrases ?
                                         user_data && sessionStorage.getItem('csc_id')?
                                            <div className="align-self-center userNameImg">
                                                {phrases['Welcome']} {user_data.user_name}
                                                <p><a href={process.env.REACT_APP_PAYMENT_URL+'/core/public/pdf_files/RM-name-SBIG.xlsx'}>
                                                    <Blink color='blue' text= {phrases['DownloadRMList']} fontSize='14'>
                                                    {phrases['DownloadRMList']}
                                                    </Blink> 
                                                </a></p>
                                            </div> : 
                                            <div className="align-self-center userNameImg">
                                                {phrases['Welcome']} {user_data.user_name}
                                            </div>
                                        : null }
                                        <div className="align-self-center">
                                        {this.props.flag == "logout" ? null :  
                                        logo ? 
                                        <img src={require(`../../../../assets/images/${logo}`)} alt="" className="notiBell"/>
                                        : null}
                                        </div> 
                                    </div>
                                </Dropdown.Toggle>
                            </Dropdown>
                            </li>                  
                        </ul>
                    </div>
                </nav>
                {this.props.loading ? (
                    <div className="loading">
                        <Loader type="Oval" color="#edae21" height="50" width="50" />
                    </div>
                ) : null}
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