import React, { Component } from 'react';
import HeaderTop from '../common/header/header-top/HeaderTop';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import queryString from 'query-string';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import Footer from '../common/footer/Footer';

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
                    <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10">
                      <section className="thankuBox">
                        <div className="text-center custtxt">
                        <p className="fs-16 m-b-30"><span className="lghtBlue">&nbsp;</span></p>
                          <img src={require('../../assets/images/Error.png')} alt="" className="m-b-30" />
                          <p className="fs-16 m-b-30">&nbsp;&nbsp;&nbsp;&nbsp;<span className="lghtBlue">{errorDetails.message}</span></p>
                          <p className="fs-16 m-b-30"><span className="lghtBlue">&nbsp;</span></p>
                            
                        </div>
                      </section>
                      {/* <div className="dashbrd"><a href="#">Go to Dashboard</a></div> */}
                      <Footer />
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