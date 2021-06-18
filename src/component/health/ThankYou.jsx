import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import swal from 'sweetalert';
import queryString from 'query-string';
import Encryption from '../../shared/payload-encryption';

// const refNumber = localStorage.getItem("policyHolder_id")

class ThankYouPage extends Component {

  state = {
    accessToken: "",
    response_text: [],
    policyNo: this.props.match.params.policyId,
    vehicletype: [],
    dloadCounter: 0,
    refNumber:  queryString.parse(this.props.location.search).access_id ? 
                queryString.parse(this.props.location.search).access_id : 
                localStorage.getItem("policyHolder_refNo")
  };

  // ------------------------ Custom PDF----------------------------

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
        else swal(res.data.msg)
               
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

  }

  //-----------------------------------Custom PDF End----------------------------------------


  //--------------------------------------CCM Service PDF ------------------------------------------
  getPolicyDoc = () => {

    const { policyNo, dloadCounter } = this.state
    const formData = new FormData();
    const post_data_obj = {
      'policyNo': policyNo,
      'policyHolder_Id':  this.state.refNumber
    }
    console.log('post_data_obj', post_data_obj)
    let encryption = new Encryption();
    formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data_obj)))
    this.props.loadingStart();
    axios
      .post(`/policy-download/external`, formData)
      .then(res => {
        this.props.loadingStop();
        console.log('external_res', res)
        if(res.data.error == true) {
          this.setState({dloadCounter: dloadCounter+1})
          swal({
            title: "Alert",
            text: "PDF Generation process is taking longer time than expected. Please have patience.",
            icon: "warning",
            // buttons: true,
            dangerMode: true,
          })
          .then((willDownload) => {
            if (willDownload && dloadCounter < 3) {
            this.getPolicyDoc()
            }
            else {swal(res.data.msg)}
          })

        }
        else {
          this.downloadCCMDoc(res.data.data.uploded_path) 
        }
      })
      .catch(err => {
        this.setState({
          response_text: []
        });
        this.props.loadingStop();
      });
  }

  downloadCCMDoc = (fileURL) => {
    // const url = file_path;
    // const pom = document.createElement('a');

    // pom.style.display = 'none';
    // pom.href = url;
    // document.body.appendChild(pom);
    // pom.click(); 
    // window.URL.revokeObjectURL(url);
    fetch(fileURL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/pdf',
    },
    })
    .then((response) => response.blob())
    .then((blob) => {
      // Create blob link to download
      const url = window.URL.createObjectURL(
        new Blob([blob]),
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `FileName.pdf`,
      );

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode.removeChild(link);
    });

  }

  //-----------------------------------CCM Service PDF End----------------------------------------


  fetchData = () => {
    const { productId } = this.props.match.params
    let encryption = new Encryption();
	
	
	axios.get(`ceiaCall/${this.state.refNumber}`)
        .then(res => {
        })
        .catch(err => {
            
        })

    axios.get(`policy-holder-additional-details/${this.state.refNumber}`)
        .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)
            let vehicletype = decryptResp.data.policyHolder && decryptResp.data.policyHolder.vehiclebrandmodel ? decryptResp.data.policyHolder.vehiclebrandmodel.vehicletype : {};

            console.log('vehicletype', vehicletype)
            
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
            
            this.getCustomerMsg()
            this.setState({
                vehicletype       
            })

            setTimeout(
              function() {
                this.noBackButton()
              }
              .bind(this),
              300
          );
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })
}

getCustomerMsg = () => {
  const { productId } = this.props.match.params
  // let encryption = new Encryption();
  const { policyId } = this.props.match.params

  const formData = new FormData();
  formData.append('policy_no', policyId);

  axios.post(`customer-msg`, formData)
      .then(res => {
        // custom Msg
      })
      .catch(err => {
          // handle error
          this.props.loadingStop();
      })
}



downloadWording = () => {
  let file_path = `${process.env.REACT_APP_PAYMENT_URL}/policy_pdf_download.php?ipa_wording=1`
  const url = file_path;
  const pom = document.createElement('a');

  pom.style.display = 'none';
  pom.href = url;
  document.body.appendChild(pom);
  pom.click(); 
  window.URL.revokeObjectURL(url);
}

downloadWordingGSB = () => {
  let file_path = `${process.env.REACT_APP_PAYMENT_URL}/policy_pdf_download.php?gsb_wording=1`
  const url = file_path;
  const pom = document.createElement('a');

  pom.style.display = 'none';
  pom.href = url;
  document.body.appendChild(pom);
  pom.click(); 
  window.URL.revokeObjectURL(url);
}

  componentDidMount() {      
    const { policyId } = this.props.match.params
    this.fetchData()

  }

  noBackButton() {
    window.history.replaceState(null, null, window.location.href);
    window.onpopstate = function (e) {
      window.history.go(1);
      e.preventDefault()
    };
}

  render() {
    const { policyId } = this.props.match.params
    const { vehicletype } = this.state
    let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null


    return (
      <>
        <BaseComponent>
        {phrases ? 
		
		<div className="page-wrapper">
          <div className="container-fluid fg">
            <div className="row">
			
			<aside className="left-sidebar">
		 				 <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
						 <SideNav />
						</div>
						</aside>
								
					 {/*<div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">             
						<SideNav />
             		 </div>*/}
					 
            			  
              <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10">
                <section className="thankuBox">
                  <div className="thankuinfo">
                    <div className="text-center custtxt">
                      <img src={require('../../assets/images/like.svg')} alt="" className="m-b-30" />
                      <p>{phrases['ThankYouSBI']}</p>
                      <p className="fs-16 m-b-30">{phrases['PolicyNo']} <span className="lghtBlue"> {policyId}</span></p>
                        <div className="d-flex justify-content-center align-items-center">
                        {vehicletype.download_type == 0 ?
                            <button className="policy m-l-20" onClick={this.generateDoc}>{phrases['PolicyCopy']} </button>
                            :
                            <button className="policy m-l-20" onClick={this.getPolicyDoc}>{phrases['PolicyCopy']} </button>
                        }
                        {/* <button className="policy m-l-20" onClick={this.generateDoc}>{phrases['PolicyCopy']} </button> */}
                        {vehicletype && vehicletype.id && vehicletype.id == 13 ?
                            <button className="policy m-l-20" onClick={this.downloadWording}>Policy Wording </button>
                            :
                           null
                        }
                        
                        {vehicletype && vehicletype.id && vehicletype.id == 14 ?
                            <button className="policy m-l-20" onClick={this.downloadWordingGSB}>Policy Wording </button>
                            :
                           null
                        }
                        </div>
                    </div>
                  </div>
                </section>
                {/* <div className="dashbrd"><a href="#">Go to Dashboard</a></div> */}
                <Footer />
              </div>
            </div>
			  </div>
          </div> : null }
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ThankYouPage));