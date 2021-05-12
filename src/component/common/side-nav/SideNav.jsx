import React, { Component } from "react";
import { Router, Route, Link } from "react-router-dom";
import axios from "../../../shared/axios";
import { authLogout } from "../../../store/actions/auth";
import { connect } from "react-redux";
import Encryption from "../../../shared/payload-encryption";
import { withRouter } from "react-router-dom";
import {logoToggle } from "../../../store/actions/toggle";

class SideNav extends Component {
  state = {
    userMenu : []
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
    // let post_data = {};
    let user_data = sessionStorage.getItem("users")
      ? JSON.parse(sessionStorage.getItem("users"))
      : "";
    if (user_data) {
      user_data = JSON.parse(encryption.decrypt(user_data.userMenu));
      let userMenu =  user_data ? user_data : null
      // console.log('user_data------>',userMenu)
      this.setState ({
        userMenu
      })
      console.log('userMenu.----->',userMenu)
    }
  }

  componentDidMount() {
    this.checkBC();
  }

  render() {
    const { userMenu } = this.state
    let childPhrase = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null

    return (
      <>
      {childPhrase ?
        <nav className="flex-fill leftNav">
          <ul className="navPan">
            {userMenu && userMenu.length && userMenu.map((values,index) => (
              <li key={index}>
              <Link to={values.router_link} activeClassName="active" onClick = {this.toggle.bind(this)}>
                <span className="leftIcon01">
                  <img
                    // src={require(`../../../assets/images${values.icon}`)}
                    alt=""
                  />
                </span>
                <span className="hidemenu">{childPhrase[values.phases]}</span>
              </Link>
            </li>
            ))        
          }

					<li class="logoutbtn">
					 <button className="btn-lg" onClick={this.handleLogout}>
            <a activeClassName="active">
              <span className="leftIcon01">
                <img
                  src={require("../../../assets/images/Logout.svg")}
                  alt=""
                />
              </span>
             <span class="valuetxt"> {childPhrase['Logout']}</span>
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
