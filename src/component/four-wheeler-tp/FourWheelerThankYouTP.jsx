import React, { Component } from 'react';
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';

class TwoWheelerThankYouPage extends Component {

    state = {
        accessToken: "",
        response_text: [],
        policy_holder_id: localStorage.getItem("policyHolder_id")
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
        //formData.append('access_token', access_token);
        //formData.append('policyNo', policyId)
        const post_data_obj = {
          'access_token':access_token,
          'policyNo':policyId
        }
        let encryption = new Encryption();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
        this.props.loadingStart();
        axios
          .post(`/callDocApi`, formData)
          .then(res => {  
            this.props.loadingStop();
            if(res.data.getPolicyDocumentResponseBody.payload.URL[0] == "No Results found for the given Criteria") {
                // swal(res.data.getPolicyDocumentResponseBody.payload.URL[0]);
                swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy document online. Please call 180 22 1111");
            }
            else{
                this.setState({
                    response_text: res.data,
                    res_error: false
                })
                this.generate_pdf(res.data, localStorage.getItem("policyHolder_id")) 
            }
                  
          })
          .catch(err => {
            this.setState({
                response_text: []
            });
            this.props.loadingStop();
          });
      }

      generate_pdf = (response_text, policy_holder_id) => {
        // const {response_text, policy_holder_id, res_error} = this.state
        const {policyId} = this.props.match.params
        if(response_text && policy_holder_id) {
          const formData = new FormData();
        //  formData.append('policy_holder_id', policy_holder_id);
         // formData.append('policy_no', policyId);
          //formData.append('response_text', JSON.stringify(response_text))
          const post_data_obj = {
            'policy_holder_id':policy_holder_id,
            'policy_no':policyId,
            'response_text':JSON.stringify(response_text)
          }

          let encryption = new Encryption();
          formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
          this.props.loadingStart();
          axios
            .post(`/generate-pdf`, formData)
            .then(res => {             
              this.props.loadingStop();
              localStorage.removeItem("policyHolder_id");
              localStorage.removeItem("policyHolder_refNo");
              sessionStorage.removeItem('pan_data');
              sessionStorage.removeItem('email_data');
              sessionStorage.removeItem('proposed_insured');
              sessionStorage.removeItem('display_looking_for');
              sessionStorage.removeItem('display_dob');
              this.downloadDoc(res.data.data.uploded_path)
            })
            .catch(err => {
              this.setState({
              });
              this.props.loadingStop();
            });
        }
        else {
          swal("Could not get policy document")
        }
        
      }

      downloadDoc = (file_path) => {
        const url = file_path ;
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
        // this.getAccessToken();       
        const {policyId} = this.props.match.params
        // window.addEventListener("popstate", (e) => {
        // this.props.history.go(`/ThankYou/${policyId}`);
        //   });

        // window.history.pushState(null, document.title, window.location.href);
        // window.addEventListener('popstate', function (event){
        // window.history.pushState(null, document.title,  window.location.href);
        // }); 

        window.history.pushState(null, null, window.location.href);
        window.onpopstate = function () {
        window.history.go(1);
    };
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
                             <button className="policy m-l-20" onClick={this.getAccessToken}>Policy Copy</button>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(TwoWheelerThankYouPage));