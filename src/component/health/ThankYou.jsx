import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";

class ThankYouPage extends Component {

    state = {
        accessToken: "",
        docLink: ""
      };

      
    getAccessToken = () => {
        this.props.loadingStart();
        axios
          .post(`/callTokenService`)
          .then(res => { 
            this.setState({
                accessToken: res.data.access_token
            }) 
            this.getPolicyDoc(res.data.access_token)
          })
          .catch(err => {
            this.setState({
                accessToken: []
            });
            this.props.loadingStop();
          });
      }

      getPolicyDoc = (access_token) => {
        const {policyId} = this.props.match.params
        const formData = new FormData();

        formData.append('access_token', access_token);
        formData.append('policyNo', policyId)
        this.props.loadingStart();
        axios
          .post(`/callDocApi`, formData)
          .then(res => { 
            this.setState({
                docLink: res.data.access_token
            }) 
          })
          .catch(err => {
            this.setState({
                docLink: []
            });
            this.props.loadingStop();
          });
      }

    componentDidMount() {
        this.getAccessToken();       
      }

    render() {
        const {policyId} = this.props.match.params
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
                     <div className="thankuinfo">
                         <div className="text-center custtxt">
                         <img src={require('../../assets/images/like.svg')} alt="" className="m-b-30"/>
                         <p>Thank you for choosing SBI General Insurance</p>
                         <p className="fs-16 m-b-30">Policy No <span className="lghtBlue"> {policyId}</span></p>
                         <div className="d-flex justify-content-center align-items-center">
                             <button className="proposal">Eproposal Form</button>
                             <button className="policy m-l-20">Policy Copy</button>
                         </div>
                         </div>
                     </div>
                     </section>
                     {/* <div className="dashbrd"><a href="#">Go to Dashboard</a></div> */}
                     <Footer/>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(ThankYouPage));