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
    policyNo: "",
    vehicletype: [],
    receipt_no:"",
    quoteNo:"",
    retry : 2,
    retryCount: 0,
    refNumber:  queryString.parse(this.props.location.search).access_id ? 
                queryString.parse(this.props.location.search).access_id : 
                localStorage.getItem("policyHolder_refNo")
  };

  // ------------------------ Custom PDF----------------------------

  generateDoc = () => {
    const { policyNo } = this.state
    const formData = new FormData();
    formData.append('policyNo', policyNo)
    this.props.loadingStart();
    axios
      .post(`/policy-download/renewal-policy-pdf`, formData)
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

  }

  //-----------------------------------Custom PDF End----------------------------------------


  //--------------------------------------CCM Service PDF ------------------------------------------
    getAccessToken = () => {
    this.props.loadingStart();
    axios
      .post(`/callTokenService`)
      .then(res => {
        this.setState({
          accessToken: res.data.access_token
        })
        return new Promise(resolve => {setTimeout(() => {
          this.getPolicyDoc(res.data.access_token)
            }
            ,5000)
        })
        
      })
      .catch(err => {
        this.setState({
          accessToken: []
        });
        this.props.loadingStop();
      });
  }

  getPolicyDoc = (access_token) => {

    const { policyNo } = this.state
    const formData = new FormData();
    //formData.append('access_token', access_token);
    //formData.append('policyNo', policyNo)
    const post_data_obj = {
      'access_token': access_token,
      'policyNo': policyNo,
      'policyHolder_Id':  this.state.refNumber
    }
    let encryption = new Encryption();
    formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data_obj)))
    this.props.loadingStart();
    axios
      .post(`/callDocApi`, formData)
      .then(res => {
        this.props.loadingStop();

        if(res.data.error == true) {
          swal({
            title: "Alert",
            text: "PDF Generation process is taking longer time than expected. Please have patience.",
            icon: "warning",
            // buttons: true,
            dangerMode: true,
          })
          .then((willDownload) => {
            if (willDownload) {
            this.getAccessToken()
            }
          })

        }
        else if (res.data.data.getPolicyDocumentResponseBody.payload.URL[0] == "No Results found for the given Criteria") {
          // swal(res.data.getPolicyDocumentResponseBody.payload.URL[0]);
          swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy document online. Please call 180 22 1111");
        }
        
        else {
          this.setState({
            response_text: res.data,
            res_error: false
          })

          this.generate_pdf(res.data.data, this.state.refNumber)    
        }
      })
      .catch(err => {
        this.setState({
          response_text: []
        });
        this.props.loadingStop();
      });
  }

  generate_pdf = (response_text, refNumber) => {
    // const {response_text, refNumber, res_error} = this.state
    const { policyNo } = this.state
    if (response_text && refNumber) {
      const formData = new FormData();
      //  formData.append('refNumber', refNumber);
      // formData.append('policy_no', policyNo);
      //formData.append('response_text', JSON.stringify(response_text))
      const post_data_obj = {
        'policy_holder_id': refNumber,
        'policy_no': policyNo,
        'response_text': JSON.stringify(response_text)
      }

      let encryption = new Encryption();
      formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data_obj)))
      this.props.loadingStart();
      axios
        .post(`/generate-pdf`, formData)
        .then(res => {
          this.props.loadingStop();
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

  downloadDoc = () => {
    let file_path = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/policy_pdf_download.php?refrence_no=${this.state.refNumber}`
    console.log(file_path);
    const { policyNo } = this.state
    const url = file_path;
    const pom = document.createElement('a');

    pom.style.display = 'none';
    pom.href = url;

    document.body.appendChild(pom);
    pom.click(); 
    window.URL.revokeObjectURL(url);
      
  }

  //-----------------------------------CCM Service PDF End----------------------------------------


  fetchData = () => {
    const { productId } = this.props.match.params
    let encryption = new Encryption();
    this.props.loadingStart();
    axios.get(`policy-holder-additional-details/${this.state.refNumber}`)
        .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)
            if(decryptResp.error == false) {
              let vehicletype = decryptResp.data.policyHolder && decryptResp.data.policyHolder.vehiclebrandmodel ? decryptResp.data.policyHolder.vehiclebrandmodel.vehicletype : {};        
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
              
              this.getAgentReceipt()
              this.setState({
                  vehicletype       
              })
            }
            else {
              swal(decryptResp.msg)
              this.props.loadingStop();
            }
            
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
            let decryptErr = JSON.parse(encryption.decrypt(err.data))
            console.log("decryptErr", decryptErr)
            this.props.loadingStop();
        })
}

getAgentReceipt = () => {
  const formData = new FormData();
  formData.append('policy_ref_no', this.state.refNumber);
  if(this.state.retryCount < 3){
    this.setState({
      retryCount: this.state.retryCount + 1
    });
    this.props.loadingStart();
      if(this.state.receipt_no === null || this.state.receipt_no == "") {
        axios
        .post(`/renewal/agent-receipt`, formData)
        .then(res => {
          if(res.data.error === false ) {
            this.setState(
              {
                receipt_no:res.data.data.receipt_no,
                quoteNo:res.data.data.quoteNo,
              }
            )
            this.issuePolicy()
          }    
          else {         
            this.props.loadingStop()
            swal(res.data.msg)
          }   
        })
        .catch(err => {
          this.setState({
            accessToken: []
          });
          this.props.loadingStop();
        });
      }
      else {
        this.issuePolicy()
      }  
  }
  else {
    this.props.loadingStop();
    // swal({
    //   title: "Alert",
    //   text: "Maximum Retry attempt limit is crossed. Now refund process would be initiated",
    //   icon: "warning",
    //   // buttons: true,
    //   dangerMode: true,
    // })
    // .then((willRefund) => {
    //   if (willRefund) {
    // this.handleRefund()
    //   }
    // })
  }
}

issuePolicy = () => {
  const formData = new FormData();
  formData.append('policy_ref_no', this.state.refNumber);
  this.props.loadingStart();
  axios
    .post(`/renewal/issue-policy`, formData)
    .then(res => {
      if(res.data.error === false) {
        this.setState({
          policyNo: res.data.data.PolicyNumber, retry: 0
        });
        this.getCustomerMsg(res.data.data.PolicyNumber)
        this.props.loadingStop();   
      }
      else { 
        if(this.state.retryCount <= 1){   
          this.getAgentReceipt()
        }else {
          this.setState({
            retry: 1
          }); 
          this.props.loadingStop();   
          swal("Due to some reason, policy could not be created at this moment. Please retry in some time.")
        }
       
      }      
    })
    .catch(err => {
      this.setState({
        accessToken: [],  retry: 1
      });
      this.props.loadingStop();
    });
}

// handleRefund = (values) => {
//   const {policyHolder} = this.state
  
//   if(policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.slug) {
//       if(policyHolder.bcmaster.paymentgateway.slug == "csc_wallet") {
//           this.CSCRefund()
//       }
//       if(policyHolder.bcmaster.paymentgateway.slug == "razorpay") {
//           this.RazorpayRefund()
//       }     
//   }
// }

CSCRefund = () => {
  const { refNumber } = this.state;
  window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/sme_fire_refund.php?refrence_no=${refNumber}`
}
// http://14.140.119.44/sbig-csc/razorpay/smefire_pay.php?refrence_no=b6682aa3f5bc9003623cdee5506dfb2d
RazorpayRefund = () => {
  const { refNumber } = this.state;
  window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/sme_fire_refund.php?refrence_no=${refNumber}`
}



getCustomerMsg = (PolicyNo) => {
  const { productId } = this.props.match.params
  // let encryption = new Encryption();
  const formData = new FormData();
  formData.append('policy_no', PolicyNo);

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
    this.fetchData()

  }

  noBackButton() {
    window.history.replaceState(null, null, window.location.href);
    window.onpopstate = function (e) {
      window.history.go(1);
      e.preventDefault()
    };
}
getPolicyDowonload =() =>{
  console.log("third type")
  const policyNo = this.state.policyNo;
  const formData = new FormData();
  formData.append("policyNo",policyNo);
  this.props.loadingStart();
  axios.post(`download/policy-pdf`,formData).then(res=>{
   if(res.data.error == false)
   {
      this.downloadThirdType(res.data.data.uploded_path,res.data.data.file_name)
      this.props.loadingStop()
   }
   else{
     swal(res.data.error)
   }
  }).catch(err=>{
    swal(err)
    this.props.loadingStop();
  })

}
downloadThirdType =(url,name)=>{
 
  const pom = document.createElement('a');

  pom.style.display = 'none';
  pom.href = url;
  document.body.appendChild(pom);
  pom.click(); 
  window.URL.revokeObjectURL(url);
}

  render() {
    const { vehicletype, policyNo, retry } = this.state
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

              <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10">
                <section className="thankuBox">
                  <div className="thankuinfo">
                    <div className="text-center custtxt">
                      <img src={require('../../assets/images/like.svg')} alt="" className="m-b-30" />
                      <p>{phrases['ThankYouSBI']}</p>
                      <p className="fs-16 m-b-30">{phrases['PolicyNo']} <span className="lghtBlue"> {policyNo}</span></p>
                        <div className="d-flex justify-content-center align-items-center">
                        {retry === 1 ?
                        <div className="d-flex justify-content-center align-items-center">
                          <button className="policy m-l-20" onClick={this.getAgentReceipt}>Retry Policy Creation</button>
                          {/* {this.state.retryCount > 3 ?
                          <button className="policy m-l-20" onClick={this.handleRefund}>Refund</button> : null } */}

                        </div> : null }
                       
                        {this.state.policyNo ? 
                          vehicletype.download_type == 0 ?
                            <button className="policy m-l-20" onClick={this.generateDoc}>{phrases['PolicyCopy']} </button>
                            :
                            <button className="policy m-l-20" onClick={this.getPolicyDowonload}>{phrases['PolicyCopy']} </button>
                        : null }

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