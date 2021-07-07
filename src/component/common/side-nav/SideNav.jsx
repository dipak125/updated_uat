import React, { Component } from "react";
import { Router, Route, Link } from "react-router-dom";
import axios from "../../../shared/axios";
import { authLogout } from "../../../store/actions/auth";
import { connect } from "react-redux";
import Encryption from "../../../shared/payload-encryption";
import { withRouter } from "react-router-dom";
import {logoToggle } from "../../../store/actions/toggle";

const images = require.context('../../../assets/images', true);

class SideNav extends Component {
  state = {
    userMenu : [],
    login_type: []
  }


  toggle = () => {
    if(window.innerWidth < 768) {
      var data = this.props.logo_toggle
      if(data == true) {
          this.props.logoToggle(false);
      }
      else this.props.logoToggle(true);
    }
}
  
  handleLogout = () => {
    const formData = new FormData();
    let encryption = new Encryption();
    let post_data = {};
    let bc_data = sessionStorage.getItem("bcLoginData")
      ? sessionStorage.getItem("bcLoginData")
      : "";
    if (bc_data) {
      bc_data = JSON.parse(encryption.decrypt(bc_data));
    }
    post_data = {
      token: bc_data ? bc_data.token : "",
      bc_agent_id: bc_data ? bc_data.user_info.data.user.username : "",
      bc_master_id: bc_data ? bc_data.agent_id : "",
    };

    formData.append("enc_data", encryption.encrypt(JSON.stringify(post_data)));
    axios
      .post("/logout", formData)
      .then((res) => {
        this.props.logout();
        localStorage.removeItem("cons_reg_info");
        // window.location = `${res.data.data.logout_url}`
        this.props.history.push(`/logout`);
        
      })
      .catch((err) => {
        this.props.logout();
        // this.props.loadingStop();
      });
  };

  checkBC = () => {
    const formData = new FormData();
    let encryption = new Encryption();
    let user_data = sessionStorage.getItem("users")
      ? JSON.parse(sessionStorage.getItem("users"))
      : "";
    if (user_data) {
      let login_type = JSON.parse(encryption.decrypt(user_data.user));
      user_data = JSON.parse(encryption.decrypt(user_data.userMenu));     
      let userMenu =  user_data ? user_data : null
      console.log('login_type------>',login_type)
      this.setState ({
        userMenu, 
        login_type
      })
    }
  }

  componentDidMount() {
    this.checkBC();
  }

  render() {
    const { userMenu, login_type } = this.state
    let childPhrase = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
    let url_prefix = "../../../assets/images"

    return (
      <>
      {childPhrase && login_type.bc_master_id != '9' ?
        <nav className="flex-fill leftNav">
          <ul className="navPan">
            {userMenu && userMenu.length && userMenu.map((values,index) => (
              <li key={index}>
              <Link to={values.router_link} activeClassName="active" onClick = {this.toggle.bind(this)}>
                <span className="leftIcon01">
                  <img
                    src= {images(`./${values.icon}.png`)}
                    // src={require(`${url_prefix}`)}
                    // src={require('../../../assets/images/leftIcon02Hover.svg')}
                    alt=""
                  />
                  {/* <img src={`${url_prefix}` + `${values.icon}`} /> */}
                </span>
                <span className="hidemenu">{childPhrase[values.phases]}</span>
              </Link>
            </li>
            ))        
          }

					<li className="logoutbtn">
					 <button className="btn-lg" onClick={this.handleLogout}>
            <a activeClassName="active">
              <span className="leftIcon01">
                <img
                  src={require("../../../assets/images/Logout.svg")}
                  alt=""
                />
              </span>
             <span className="valuetxt"> {childPhrase['Logout']}</span>
            </a>
          </button>
					</li>	
          </ul>        
        </nav> : null }
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch(authLogout()),
    logoToggle: (data) => dispatch(logoToggle(data)),
  };
};

const mapStateToProps = (state) => {
  return {
    loading: state.loader.loading,
    logo_toggle: state.toggle.logo_toggle
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SideNav)
);
