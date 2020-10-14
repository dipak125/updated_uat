import React, { Component } from 'react';
import HeaderTop from '../common/header/header-top/HeaderTop';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import queryString from 'query-string';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";

class ErrorPage extends Component {

    state = {
        errorDetails: [],
        refNumber:  queryString.parse(this.props.location.search).access_id ? 
                    queryString.parse(this.props.location.search).access_id : 
                    localStorage.getItem("policyHolder_refNo")
    };

    componentDidMount() {
        this.fetchError();       
    }

    fetchError() {
        const formData = new FormData();
        formData.append('policy_ref_no', this.state.refNumber)
        axios.post(`policy-error-msg`, formData)
          .then(res => {
            this.setState({
              errorDetails: res.data.data.message.ValidateResult
            });
            this.props.loadingStop();
          })
          .catch(err => {
            this.props.loadingStop();
          });
      }


    render() {
        const { errorDetails } = this.state
        return (
            <>
                 <BaseComponent>
                    <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                            <SideNav />
                        </div>
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 pd-l-0">
                                <div className="error404">
                                    <h3>Sorry!</h3>
                                    {errorDetails.message}
                                    {/* <p>Sorry, but the page you are looking for is not found. Please, make sure you have typed the currect URL.</p> */}
                                    {/* <p>Please login to continue.</p> */}
                                </div>
                                </div>
                            </div>
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
  
  export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ErrorPage));