import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import swal from 'sweetalert';

const policy_holder_id = localStorage.getItem("policyHolder_id")

class ThankYouPage extends Component {

    state = {
        accessToken: "",
        response_text: ""
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
        
        localStorage.removeItem("policyHolder_id");
        localStorage.removeItem("policyHolder_refNo");
        sessionStorage.removeItem('pan_data');
        sessionStorage.removeItem('email_data');
        sessionStorage.removeItem('proposed_insured');
        sessionStorage.removeItem('display_looking_for');
        sessionStorage.removeItem('display_dob');
        this.props.loadingStart();
        axios
          .post(`/callDocApi`, formData)
          .then(res => {  
            this.props.loadingStop();
            if(res.data.getPolicyDocumentResponseBody.payload.URL[0] == "No Results found for the given Criteria") {
                swal(res.data.getPolicyDocumentResponseBody.payload.URL[0]);
            }
            else{
                this.setState({
                    response_text: res.data.getPolicyDocumentResponseBody.payload.URL[1]
                })
                this.generate_pdf(res.data.getPolicyDocumentResponseBody.payload.URL[1]) 
            }
                  
          })
          .catch(err => {
            this.setState({
                response_text: []
            });
            this.props.loadingStop();
          });
      }

      generate_pdf = (responseText) => {
        const formData = new FormData();
        formData.append('policy_holder_id', policy_holder_id);
        formData.append('response_text', responseText)
        this.props.loadingStart();
        axios
          .post(`/generate-pdf`, formData)
          .then(res => { 
            this.setState({
               
            }) 
            
            this.props.loadingStop();
          })
          .catch(err => {
            this.setState({
            });
            this.props.loadingStop();
          });
      }

      downloadDoc = () => {
        const url = "https://content.sbigeneral.in/uploads/b7b98d12c9da4f44b7f5e372945fbf7f.pdf";
        const fileName = "b7b98d12c9da4f44b7f5e372945fbf7f.pdf"
        const pom = document.createElement('a');
        pom.setAttribute('href', url);
        pom.setAttribute('target', '_blank');
        // pom.setAttribute('download', fileName);
        document.body.appendChild(pom);
        pom.click();
        // document.body.removeChild(pom);  
        window.URL.revokeObjectURL(url);
      }

    componentDidMount() {
        this.getAccessToken();       
        window.addEventListener("popstate", () => {
        this.props.history.push('/Products');
          });
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
                             {/* <button className="proposal" onClick={this.downloadDoc}>Eproposal Form</button> */}
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