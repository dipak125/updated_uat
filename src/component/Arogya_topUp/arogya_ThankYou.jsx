import React, { Component } from 'react';
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import swal from 'sweetalert';
import queryString from 'query-string';

// const refNumber = localStorage.getItem("policyHolder_id")

class arogya_ThankYouPage extends Component {

  state = {
    accessToken: "",
    response_text: [],
    policy_holder_id: localStorage.getItem("policyHolder_id"),
    refNumber:  queryString.parse(this.props.location.search).access_id ? 
                queryString.parse(this.props.location.search).access_id : 
                localStorage.getItem("policyHolder_refNo")
  };

  generateDoc = () => {
    const { policyId } = this.props.match.params
    const formData = new FormData();
    formData.append('policyNo', policyId)
    this.props.loadingStart();
    axios
      .post(`/policy-download/policy-pdf`, formData)
      .then(res => {
        this.props.loadingStop();
        if(res.data.error == false) {
          this.downloadDoc()
        }
        else swal("Document not found")
               
      })
    
  }

  downloadDoc = () => {
    let file_path = `${process.env.REACT_APP_PAYMENT_URL}/policy_pdf_download.php?refrence_no=${this.state.refNumber}`
    const url = file_path;
    const pom = document.createElement('a');

    pom.style.display = 'none';
    pom.href = url;
    document.body.appendChild(pom);
    pom.click(); 
    window.URL.revokeObjectURL(url);

    localStorage.removeItem("policyHolder_id");
    localStorage.removeItem("policyHolder_refNo");
    localStorage.removeItem("policy_type");
    localStorage.removeItem("brandEdit");
    localStorage.removeItem("newBrandEdit");
    sessionStorage.removeItem('pan_data');
    sessionStorage.removeItem('email_data');
    sessionStorage.removeItem('proposed_insured');
    sessionStorage.removeItem('display_looking_for');
    sessionStorage.removeItem('display_dob');
  }


  componentDidMount() {      
    const { policyId } = this.props.match.params

    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

  }
  render() {
    const { policyId } = this.props.match.params
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
                      <img src={require('../../assets/images/like.svg')} alt="" className="m-b-30" />
                      <p>Thank you for choosing SBI General Insurance</p>
                      <p className="fs-16 m-b-30">Policy No <span className="lghtBlue"> {policyId}</span></p>
                        <div className="d-flex justify-content-center align-items-center">
                            <button className="policy m-l-20" onClick={this.generateDoc}>Policy Copy </button>
                        </div>
                    </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(arogya_ThankYouPage));