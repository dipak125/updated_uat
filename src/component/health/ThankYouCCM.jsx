import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import queryString from 'query-string';
import { setSmeRiskData,setSmeData,setSmeOthersDetailsData,setSmeProposerDetailsData,setCommunicationAddress,setTransactionId } from '../../store/actions/sme_fire';

// const refNumber = localStorage.getItem("policyHolder_id")

class ThankYouCCM extends Component {

  state = {
    accessToken: "",
    response_text: [],
    policyNo : "",
    retry : 2,
    policyHolder: [],
    retryCount: 0,
    policy_holder_id: localStorage.getItem("policyHolder_id"),
    refNumber:  queryString.parse(this.props.location.search).access_id ? 
                queryString.parse(this.props.location.search).access_id : 
                localStorage.getItem("policyHolder_refNo")
  };


  getAgentReceipt = () => {
    const formData = new FormData();
    formData.append('policy_ref_no', this.state.refNumber);
    if(this.state.retryCount < 3){
      this.setState({
        retryCount: this.state.retryCount + 1
      });
      this.props.loadingStart();
        if(this.props.receipt_no === null || this.props.receipt_no == "") {
          axios
          .post(`/sme/agent-receipt`, formData)
          .then(res => {
            if(res.data.error === false ) {
              this.props.setTransactionId(
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
      swal({
        title: "Alert",
        text: "Maximum Retry attempt limit is crossed. Now refund process would be initiated",
        icon: "warning",
        // buttons: true,
        dangerMode: true,
      })
      .then((willRefund) => {
        if (willRefund) {
        this.handleRefund()
        }
      })
    }
  }

  issuePolicy = () => {
    const formData = new FormData();
    formData.append('policy_ref_no', this.state.refNumber);
    this.props.loadingStart();
    axios
      .post(`/sme/issue-policy`, formData)
      .then(res => {
        if(res.data.error === false) {
          this.setState({
            policyNo: res.data.data.PolicyNo, retry: 0
          });
          this.getCustomerMsg(res.data.data.PolicyNo)
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
          accessToken: []
        });
        this.props.loadingStop();
      });
  }

  generateDoc = () => {
    const { policyNo } = this.state
    const formData = new FormData();
    formData.append('policyNo', policyNo)
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


  // getAccessToken = () => {
  //   this.props.loadingStart();
  //   axios
  //     .post(`/callTokenService`)
  //     .then(res => {
  //       this.setState({
  //         accessToken: res.data.access_token
  //       })
  //       return new Promise(resolve => {setTimeout(() => {
  //         this.getPolicyDoc(res.data.access_token)
  //           }
  //           ,5000)
  //       })
        
  //     })
  //     .catch(err => {
  //       this.setState({
  //         accessToken: []
  //       });
  //       this.props.loadingStop();
  //     });
  // }

  // getPolicyDoc = (access_token) => {

  //   const { policyNo } = this.state
  //   const formData = new FormData();
  //   //formData.append('access_token', access_token);
  //   //formData.append('policyNo', policyNo)
  //   const post_data_obj = {
  //     'access_token': access_token,
  //     'policyNo': policyNo,
  //     'policyHolder_Id':  this.state.policy_holder_id
  //   }
  //   let encryption = new Encryption();
  //   formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data_obj)))
  //   this.props.loadingStart();
  //   axios
  //     .post(`/callDocApi`, formData)
  //     .then(res => {
  //       this.props.loadingStop();

  //       if(res.data.error == true) {
  //         swal({
  //           title: "Alert",
  //           text: "PDF Generation process is taking longer time than expected. Please have patience.",
  //           icon: "warning",
  //           // buttons: true,
  //           dangerMode: true,
  //         })
  //         .then((willDownload) => {
  //           if (willDownload) {
  //           this.getAccessToken()
  //           }
  //         })

  //       }
  //       else if (res.data.data.getPolicyDocumentResponseBody.payload.URL[0] == "No Results found for the given Criteria") {
  //         // swal(res.data.getPolicyDocumentResponseBody.payload.URL[0]);
  //         swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy document online. Please call 180 22 1111");
  //       }
        
  //       else {
  //         this.setState({
  //           response_text: res.data,
  //           res_error: false
  //         })

  //         this.generate_pdf(res.data.data, this.state.policy_holder_id)    
  //       }
  //     })
  //     .catch(err => {
  //       this.setState({
  //         response_text: []
  //       });
  //       this.props.loadingStop();
  //     });
  // }

  // generate_pdf = (response_text, policy_holder_id) => {
  //   // const {response_text, policy_holder_id, res_error} = this.state
  //   console.log('policy_holder_id', policy_holder_id)
  //   console.log("response_text", response_text)
  //   const { policyNo } = this.state
  //   if (response_text && policy_holder_id) {
  //     const formData = new FormData();
  //     //  formData.append('policy_holder_id', policy_holder_id);
  //     // formData.append('policy_no', policyNo);
  //     //formData.append('response_text', JSON.stringify(response_text))
  //     const post_data_obj = {
  //       'policy_holder_id': policy_holder_id,
  //       'policy_no': policyNo,
  //       'response_text': JSON.stringify(response_text)
  //     }

  //     let encryption = new Encryption();
  //     formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data_obj)))
  //     this.props.loadingStart();
  //     axios
  //       .post(`/generate-pdf`, formData)
  //       .then(res => {
  //         this.props.loadingStop();
  //         localStorage.removeItem("policyHolder_id");
  //         localStorage.removeItem("policyHolder_refNo");
  //         localStorage.removeItem("policy_type");
  //         localStorage.removeItem("brandEdit");
  //         localStorage.removeItem("newBrandEdit");
  //         sessionStorage.removeItem('pan_data');
  //         sessionStorage.removeItem('email_data');
  //         sessionStorage.removeItem('proposed_insured');
  //         sessionStorage.removeItem('display_looking_for');
  //         sessionStorage.removeItem('display_dob');
  //         this.downloadDoc(res.data.data.uploded_path)
  //       })
  //       .catch(err => {
  //         this.setState({
  //         });
  //         this.props.loadingStop();
  //       });
  //   }
  //   else {
  //     swal("Could not get policy document")
  //   }

  // }

  // downloadDoc = () => {
  //   let file_path = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/policy_pdf_download.php?refrence_no=${this.state.refNumber}`
  //   console.log(file_path);
  //   const { policyNo } = this.state
  //   const url = file_path;
  //   const pom = document.createElement('a');

  //   pom.style.display = 'none';
  //   pom.href = url;

  //   document.body.appendChild(pom);
  //   pom.click(); 
  //   window.URL.revokeObjectURL(url);

    // fetch(file_path,{
    //   mode: 'no-cors' // 'cors' by default
    // })
    //   .then(resp => resp.blob())
    //   .then(blob => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.style.display = 'none';
    //     a.href = url;
    //     // the filename you want
    //     // a.download = 'b7b98d12c9da4f44b7f5e372945fbf7f.pdf';
    //     a.download = policyNo+'.pdf';
    //     document.body.appendChild(a);
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    //     this.props.loadingStop();
    //     //alert('your file has downloaded!'); // or you know, something with better UX...
    //   })
     
      // .catch(() => {
      //  this.props.loadingStop();

      // });
      
  // }

  handleRefund = (values) => {
    const {policyHolder} = this.state
    
    if(policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.slug) {
        if(policyHolder.bcmaster.paymentgateway.slug == "csc_wallet") {
            this.CSCRefund()
        }
        if(policyHolder.bcmaster.paymentgateway.slug == "razorpay") {
            this.RazorpayRefund()
        }
        // if(policyHolder.bcmaster.paymentgateway.slug == "PPINL") {
        //     this.paypoint_payment()
        // }
    }
    // else if (policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.slug && values.gateway == 2) {
    //     this.props.history.push(`/Vedvag_gateway/${this.props.match.params.productId}?access_id=${this.state.policyHolder_refNo}`);
    // }
}

  CSCRefund = () => {
    const { refNumber } = this.state;
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/sme_fire_refund.php?refrence_no=${refNumber}`
  }
  // http://14.140.119.44/sbig-csc/razorpay/smefire_pay.php?refrence_no=b6682aa3f5bc9003623cdee5506dfb2d
  RazorpayRefund = () => {
    const { refNumber } = this.state;
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/sme_fire_refund.php?refrence_no=${refNumber}`
  }


  fetchPolicyDetails=()=>{
    let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no"):0;
    let encryption = new Encryption();

    if(this.props.policy_holder_ref_no == null && policy_holder_ref_no != ''){
        
        this.props.loadingStart();
        axios.get(`sme/details/${policy_holder_ref_no}`)
        .then(res=>{
          let decryptResp = JSON.parse(encryption.decrypt(res.data));
          
          if(decryptResp.data.policyHolder.step_no > 0){

            this.props.setData({
                start_date:decryptResp.data.policyHolder.request_data.start_date,
                end_date:decryptResp.data.policyHolder.request_data.end_date,
                
                policy_holder_id:decryptResp.data.policyHolder.id,
                policy_holder_ref_no:policy_holder_ref_no,
                request_data_id:decryptResp.data.policyHolder.request_data.id,
                completed_step:decryptResp.data.policyHolder.step_no,
                menumaster_id:decryptResp.data.policyHolder.menumaster_id
            });
        }
        
        if(decryptResp.data.policyHolder.step_no == 1 || decryptResp.data.policyHolder.step_no > 1){

            let risk_arr = JSON.parse(decryptResp.data.policyHolder.smeinfo.risk_address);

            this.props.setRiskData(
                {
                    house_building_name:risk_arr.house_building_name,
                    block_no:risk_arr.block_no,
                    street_name:risk_arr.street_name,
                    plot_no:risk_arr.plot_no,
                    house_flat_no:risk_arr.house_flat_no,
                    pincode:decryptResp.data.policyHolder.smeinfo.pincode,
                    pincode_id:decryptResp.data.policyHolder.smeinfo.pincode_id,

                    buildings_sum_insured:decryptResp.data.policyHolder.smeinfo.buildings_sum_insured,
                    content_sum_insured:decryptResp.data.policyHolder.smeinfo.content_sum_insured,
                    stock_sum_insured:decryptResp.data.policyHolder.smeinfo.stock_sum_insured
                }
            );
        }
        
        if(decryptResp.data.policyHolder.step_no == 2 || decryptResp.data.policyHolder.step_no > 2){

            this.props.setSmeOthersDetails({
            
                Commercial_consideration: decryptResp.data.policyHolder.previouspolicy ? decryptResp.data.policyHolder.previouspolicy.Commercial_consideration : null,
                previous_start_date: decryptResp.data.policyHolder.previouspolicy ? decryptResp.data.policyHolder.previouspolicy.start_date : null,
                previous_end_date: decryptResp.data.policyHolder.previouspolicy ? decryptResp.data.policyHolder.previouspolicy.end_date : null,
                Previous_Policy_No: decryptResp.data.policyHolder.previouspolicy ? decryptResp.data.policyHolder.previouspolicy.policy_no : null,
                insurance_company_id: decryptResp.data.policyHolder.previouspolicy ? decryptResp.data.policyHolder.previouspolicy.insurancecompany_id : null,
                previous_city: decryptResp.data.policyHolder.previouspolicy ? decryptResp.data.policyHolder.previouspolicy.address : null

            });
        }
        
        if(decryptResp.data.policyHolder.step_no == 3 || decryptResp.data.policyHolder.step_no > 3){
            let address = '';
            if(decryptResp.data.policyHolder.address == null){
                // this.autoPopulateAddress();
            }else{
                address = JSON.parse(decryptResp.data.policyHolder.address);

                this.props.setSmeProposerDetails(
                    {
                        first_name:decryptResp.data.policyHolder.first_name,
                        last_name:decryptResp.data.policyHolder.last_name,
                        salutation_id:decryptResp.data.policyHolder.salutation_id,
                        date_of_birth:decryptResp.data.policyHolder.dob,
                        email_id:decryptResp.data.policyHolder.email_id,
                        mobile:decryptResp.data.policyHolder.mobile,
                        gender:decryptResp.data.policyHolder.gender,
                        pan_no:decryptResp.data.policyHolder.pancard,
                        gstn_no:decryptResp.data.policyHolder.gstn_no,

                        com_street_name:address.street_name,
                        com_plot_no:address.plot_no,
                        com_building_name:address.house_building_name,
                        com_block_no:address.block_no,
                        com_house_flat_no:address.house_flat_no,
                        com_pincode:decryptResp.data.policyHolder.pincode,
                        com_pincode_id:decryptResp.data.policyHolder.pincode_id
                    }
                );
            }        
        }

        if(decryptResp.data.policyHolder.step_no > 3 ){

          this.props.setTransactionId({
          
            // receipt_no: decryptResp.data.policyHolder.smeinfo ? decryptResp.data.policyHolder.smeinfo.receipt_no : null,
            // quoteNo: res.decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data.quote_id : null
            receipt_no: decryptResp.data.policyHolder.smeinfo.receipt_no,
            quoteNo: decryptResp.data.policyHolder.request_data.quote_id

          });
      }
      this.setState(
        {
        
            policyHolder:decryptResp.data.policyHolder
        }
    );
      this.getAgentReceipt()

        })
        .catch(err => {
            this.props.loadingStop();
        })
    }else{
      this.getAgentReceipt()
        // this.autoPopulateAddress();
    }
    
}

getCustomerMsg = (policyId) => {
  const { productId } = this.props.match.params
  // let encryption = new Encryption();
  // const { policyId } = this.props.match.params

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
  let file_path = `${process.env.REACT_APP_PAYMENT_URL}/policy_pdf_download.php?wording=1`
  const url = file_path;
  const pom = document.createElement('a');

  pom.style.display = 'none';
  pom.href = url;
  document.body.appendChild(pom);
  pom.click(); 
  window.URL.revokeObjectURL(url);
}


  componentDidMount() {   
    const { policyNo } = this.state

    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
    // this.getAgentReceipt()
    this.fetchPolicyDetails()
    // this.getPolicyHolderDetails();
  }
  render() {
    const { policyNo, retry } = this.state
    const {quoteNo} = this.props
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
                      <p className="fs-16 m-b-30">{policyNo ? "Policy No" : "Quote No"} <span className="lghtBlue"> {policyNo ? policyNo : quoteNo}</span></p>
                      
                      {retry === 1 ?
                        <div className="d-flex justify-content-center align-items-center">
                          <button className="policy m-l-20" onClick={this.getAgentReceipt}>Retry Policy Creation</button>
                          {/* {this.state.retryCount > 3 ?
                          <button className="policy m-l-20" onClick={this.handleRefund}>Refund</button> : null } */}

                        </div> : retry === 0 ?
                        <div className="d-flex justify-content-center align-items-center">
                          <button className="policy m-l-20" onClick={this.generateDoc}>Policy Copy</button>
                          <button className="policy m-l-20" onClick={this.downloadWording}>Policy Wording</button>
                        </div> : null
                      }
                      {/* <div className="d-flex justify-content-center align-items-center">
                        <button className="policy m-l-20" onClick={this.getAlternateAccessToken}>Policy Copy </button>
                      </div> */}
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
    loading: state.loader.loading,
    
    first_name:state.sme_fire.first_name,
    last_name:state.sme_fire.last_name,
    salutation_id:state.sme_fire.salutation_id,
    date_of_birth:state.sme_fire.date_of_birth,
    email_id:state.sme_fire.email_id,
    mobile:state.sme_fire.mobile,
    gender:state.sme_fire.gender,
    pan_no:state.sme_fire.pan_no,
    gstn_no:state.sme_fire.gstn_no,
    com_street_name:state.sme_fire.com_street_name,
    com_plot_no:state.sme_fire.com_plot_no,
    com_building_name:state.sme_fire.com_building_name,
    com_block_no:state.sme_fire.com_block_no,
    com_house_flat_no:state.sme_fire.com_house_flat_no,
    com_pincode:state.sme_fire.com_pincode,
    com_pincode_id:state.sme_fire.com_pincode_id,

    house_building_name: state.sme_fire.house_building_name,
    block_no: state.sme_fire.block_no,
    street_name: state.sme_fire.street_name,
    plot_no: state.sme_fire.plot_no,
    house_flat_no: state.sme_fire.house_flat_no,
    pincode: state.sme_fire.pincode,
    pincode_id: state.sme_fire.pincode_id,

    policy_holder_id:state.sme_fire.policy_holder_id,
    policy_holder_ref_no:state.sme_fire.policy_holder_ref_no,
    menumaster_id:state.sme_fire.menumaster_id,

    quoteNo: state.sme_fire.quoteNo,
    receipt_no: state.sme_fire.receipt_no,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    loadingStart: () => dispatch(loaderStart()),
    loadingStop: () => dispatch(loaderStop()),
    setData:(data) => dispatch(setSmeData(data)),
    setRiskData:(data) => dispatch(setSmeRiskData(data)),
    setSmeOthersDetails:(data) => dispatch(setSmeOthersDetailsData(data)),
    setSmeProposerDetails:(data) => dispatch(setSmeProposerDetailsData(data)),
    setAddress:(data) => dispatch(setCommunicationAddress(data)),
    setTransactionId:(data) => dispatch(setTransactionId(data)),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ThankYouCCM));