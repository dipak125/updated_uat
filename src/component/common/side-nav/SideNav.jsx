import React, { Component } from "react";
import { Router, Route, Link } from "react-router-dom";
import axios from "../../../shared/axios";
import { authLogout } from "../../../store/actions/auth";
import { connect } from "react-redux";
import Encryption from "../../../shared/payload-encryption";
import { withRouter } from "react-router-dom";

class SideNav extends Component {
  state = {
    BC_check : "0"
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
      user_data = JSON.parse(encryption.decrypt(user_data.permission));
      let BC_check =  user_data ? user_data : null
      // console.log('user_data------>',BC_check)
      this.setState ({
        BC_check
      })
      console.log('this.----->',BC_check)
    }
  }

  componentDidMount() {
    this.checkBC();
  }

  render() {
    const { BC_check } = this.state
    let childPhrase = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null

    return (
      <>
      {childPhrase ?
        <nav className="flex-fill leftNav">
          <ul className="navPan">
            <li>
              <Link to="/Dashboard" activeClassName="active">
                <span className="leftIcon01">
                  <img
                    src={require("../../../assets/images/leftIcon02Hover.svg")}
                    alt=""
                  />
                </span>
                {childPhrase['Dashboard']}
              </Link>
            </li>
            <li>
              <Link to="/PolicySearch" activeClassName="active">
                <span className="leftIcon01">
                  <img
                    src={require("../../../assets/images/document.png")}
                    alt=""
                  />
                </span>
                {childPhrase['PolicySearch']}
              </Link>
            </li>
            <li>
							<Link to="/QuoteHistory" activeClassName="active"><span className="leftIcon01"><img src={require('../../../assets/images/document.png')} alt="" /></span> {childPhrase['QuoteHistory']}</Link>
            </li>
            <li>
              <Link to="/Products" activeClassName="active">
                <span className="leftIcon01">
                  <img
                    src={require("../../../assets/images/leftIcon02Hover.svg")}
                    alt=""
                  />
                </span>
                {childPhrase['Products']}
              </Link>
            </li>
            <li>
              <Link to="/Documents" activeClassName="active">
                <span className="leftIcon01">
                  <img
                    src={require("../../../assets/images/document.png")}
                    alt=""
                  />
                </span>
                {childPhrase['Documents']}
              </Link>
            </li>
            <li>
              <Link to="/Services" activeClassName="active">
                <span className="leftIcon01">
                  <img
                    src={require("../../../assets/images/support.png")}
                    alt=""
                  />
                </span>
                {childPhrase['Services']}
              </Link>
            </li>
            <li>
              <Link to="/ClaimIntimation" activeClassName="active">
                <span className="leftIcon01">
                  <img
                    src={require("../../../assets/images/support.png")}
                    alt=""
                  />
                </span>
                {childPhrase['ClaimIntimation']}
              </Link>
            </li>
            <li>
              <Link to="/Renewal" activeClassName="active">
                <span className="leftIcon01">
                  <img
                    src={require("../../../assets/images/support.png")}
                    alt=""
                  />
                </span>
                Renewal
              </Link>
            </li>
           { BC_check.is_permission == true ?
            <li>
							<Link to="/Supports" activeClassName="active"><span className="leftIcon01"><img src={require('../../../assets/images/support.png')} alt="" /></span>{childPhrase['Support']}</Link>
            </li> 
             : [] } 
            <li>
              <Link to="/Break_in" activeClassName="active">
                <span className="leftIcon01">
                  <img
                    src={require("../../../assets/images/leftIcon01.svg")}
                    alt=""
                  />
                </span>
                {childPhrase['BreakIn']}
              </Link>
            </li>
            {/* <li>
							<Link to="/UnderMaintenance" activeClassName="active"><span className="leftIcon01"><img src={require('../../../assets/images/leftIcon05.svg')} alt="" /></span>Support</Link>
                        </li> */}
          </ul>

          <button className="btn-lg" onClick={this.handleLogout}>
            <a activeClassName="active">
              <span className="leftIcon01">
                <img
                  src={require("../../../assets/images/Logout.svg")}
                  alt=""
                />
              </span>
              {childPhrase['Logout']}
            </a>
          </button>
        </nav> : null }
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch(authLogout()),
  };
};

const mapStateToProps = (state) => {
  return {
    loading: state.loader.loading,
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SideNav)
);
