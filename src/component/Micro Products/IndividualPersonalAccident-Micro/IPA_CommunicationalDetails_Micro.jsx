import React, { Component } from "react";
import { Row, Col, Modal, Button, FormGroup } from "react-bootstrap";
import BaseComponent from "../../BaseComponent";
import SideNav from "../../common/side-nav/SideNav";
import Footer from "../../common/footer/Footer";
import axios from "../../../shared/axios";
import { withRouter } from "react-router-dom";
import { loaderStart, loaderStop } from "../../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from "yup";
import swal from "sweetalert";
import Encryption from "../../../shared/payload-encryption";
import { Formik, Form, Field, ErrorMessage } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.min.css";
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../../shared/dateFunctions";
import moment from "moment";

const initialValues = {
  regNumber: "",
  check_registration: 2,
  pinDataArr: [],
  titleList: [],
  first_name: "",
  last_name: "",
  salutation_id: "",
  date_of_birth: "",
  email_id: "",
  building_name: "",
  city: "",
  plot_no: "",
  street_name: "",
  pincode: "",
  pincode_id: "",
  nominee_dob: null,
  nominee_first_name: "",
  nominee_last_name: "",
  nominee_salutation_id: "",
  date_of_birth: "",
  relation_with: "",
  appointee_name: "",
  appointee_dob: null,
  appointee_relation_with: "",
  marital_status_id: "",
  // is_appointee: 0
  pancard:"",
  is_eia_account: "",
  is_eia_account2: "",
  eia_no: ""  
};
const minDobNominee = moment(moment().subtract(111, 'years').calendar()).add(1, 'day').calendar()
const maxDobNominee = moment().subtract(3, 'months').calendar();
const minDobAppointee = moment(moment().subtract(111, 'years').calendar()).add(1, 'day').calendar()
const maxDobAppointee = moment().subtract(3, 'months').calendar();
// VALIDATION :-----------------------
const IPA__Validation = Yup.object().shape({
  email_id: Yup.string().email().min(8, function () {
    return "Email must be minimum 8 characters"
  })
    .max(75, function () {
      return "Email must be maximum 75 characters"
    }).matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9]+)*@\w+([-]?\w+)*(\.\w{2,3})+$/, 'Invalid Email Id').nullable(),

  building_name: Yup.string()
    .required("Please enter Building name")
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
      return "Please enter valid building name";
    })
    .nullable(),
  // block_no: Yup.string().required("Please enter Plot number").nullable(),
  plot_no: Yup.string()
    .required("Please enter Plot number")
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
      return "Please enter valid plot number";
    })
    .nullable(),
  city: Yup.string()
    .required("Please enter City")
    // .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
    //   return "Please enter valid City";
    // })
    .nullable(),
  street_name: Yup.string()
    .required("Please enter City")
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
      return "Please enter valid street name";
    })
    .nullable(),
  pincode: Yup.string()
    .required("Pincode is required")
    .matches(/^[0-9]{6}$/, function () {
      return "Please enter valid 6 digit pin code";
    })
    .nullable(),
  pincode_id: Yup.string().required("Please select Area").nullable(),
  
  
    pancard: Yup.string()
    .required(function() {		
			if ((document.querySelector('input[name="is_eia_account2"]:checked')) && (document.querySelector('input[name="is_eia_account2"]:checked').value == 1 )) {
				
                return "Enter PAN number";
            }
    }).matches(/^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/, function() {
        return "Please enter valid Pan Number"
    }),
  
  
  // NOMINEE--------
  nominee_salutation_id: Yup.string().required("Title is required").nullable(),
  nominee_first_name: Yup.string()
    .required("First Name is required")
    .min(3, function () {
      return "First name must be 3 characters";
    })
    .max(40, function () {
      return "Full name must be maximum 40 characters";
    })
    .matches(/^[A-Za-z]+$/, function () {
      return "Please enter valid first name";
    })
    .nullable(),
  nominee_last_name: Yup.string()
    .required("Last Name is required")
    .min(1, function () {
      return "Last name must be 1 characters";
    })
    .max(40, function () {
      return "Full name must be maximum 40 characters";
    })
    .matches(/^[A-Za-z]+$/, function () {
      return "Please enter valid last name";
    })
    .nullable(),
  nominee_dob: Yup.date().required("Please enter date of birth").nullable(),
  relation_with: Yup.string().required(function () {
    return "Please select relation";
  }),
  nominee_gender: Yup.string().required("Nominee gender required"),

  appointee_name: Yup.string()
  .min(3, function () {
    return "Name must be minimum 3 chracters"
  })
  .max(40, function () {
    return "Name must be maximum 40 chracters"
  }) 
  .matches(/^[a-zA-Z\s]*$/, function () {
    return "Please enter valid name"
  })
    .test(
      "18YearsChecking",
      function () {
        return "Please enter appointee name"
      },
      function (value) {
        const ageObj = new PersonAge();
        if (ageObj.whatIsMyAge(this.parent.nominee_dob) < 18 && !value) {
          return false;
        }
        return true;
      }
    )
    .test(
      "FirstNameCheck",
      function () {
        return "Please enter First Name"
      },
      function (value) {       
        if(value) {
          var spaceCount = (value.split(" "));
          if(spaceCount.length >= 1  && spaceCount[0] == "" ) {        
                return false
            }
        }      
        return true;
      }
    ).test(
      "LastNameCheck",
      function () {
        return "Please enter Last Name"
      },
      function (value) {
        if(value) {
          var spaceCount = (value.split(" "));
          if(spaceCount.length == 2 && spaceCount[1] == "") {        
                return false
            }
          else if(spaceCount.length == 1 ) {        
              return false
          }
        }      
        return true;
      }
    )
    .nullable(),


  appointee_relation_with: Yup.string()
    .test(
      "18YearsChecking",
      function () {
        return "Please enter Appointee relation"
      },
      function (value) {
        const ageObj = new PersonAge();
        if (ageObj.whatIsMyAge(this.parent.nominee_dob) < 18 && !value) {
          return false;
        }
        return true;
      }
    )
    .nullable(),
	
	is_eia_account: Yup.string().required('RequiredField'),
	eia_no: Yup.string()
    .test(
        "isEIAchecking",
        function() {
            return "PleaseEiaN"
        },
        function (value) {
            if (this.parent.is_eia_account == 1 && !value) {   
                return false;    
            }
            return true;
        }
    )
    .min(13, function() {
        return "EIAMin"
    })
    .max(13, function() {
        return "EIAMax"
    }).matches(/^[1245][0-9]{0,13}$/,'EIAValidReq').notRequired('EIARequired'),

  marital_status_id: Yup.string().required("Please select marital status"),
  
  	is_eia_account2: Yup.string().when(['is_eia_account'], {
        is: is_eia_account => is_eia_account == 0, 
        then: Yup.string().required('RequiredField')
    }), 
	
	tpaInsurance: Yup.string().when(['is_eia_account2'], {
        is: is_eia_account2 => is_eia_account2 == 1, 
        then: Yup.string().required('RequiredField')
    })
  
  
});

class IPA_CommunicationalDetails_Micro extends Component {
  state = {
    appointeeFlag: false,
    is_appointee: 0,
    request_data: [],
    nominee_age: "",
    nomineeRelation: [],
    titleNomineeList: [],
	showEIA: false,
	showEIA2: false,
    is_eia_account: '',
	is_eia_account2: '',
	tpaInsurance: []
  };

  changePlaceHoldClassAdd(e) {
    let element = e.target.parentElement;
    element.classList.add("active");
  }

  changePlaceHoldClassRemove(e) {
    let element = e.target.parentElement;
    e.target.value.length === 0 && element.classList.remove("active");
  }

  componentDidMount() {
    this.fetchNomineeRel();
	this.tpaInsuranceRepository();
    // this.fetchSalutation();
    // this.fetchData();
  }
  
  	tpaInsuranceRepository = () => {
				axios.get(`/tpaInsuranceRepository`)
            .then(res => {
					
					let tpaInsurance = res.data ? res.data : {};
					console.log("tpaInsuranceRepository===", tpaInsurance);
					
					//let titleList = decryptResp.data.salutationlist
					this.setState({
					  tpaInsurance
					});
				});
			console.log("tpaInsuranceRepository=");	
	}
  

  fetchNomineeRel = () => {
    const { productId } = this.props.match.params;
    let encryption = new Encryption();
    this.props.loadingStart();
    axios
      .get(`ipa/ipa-relation-list`)
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        console.log("decrypt--fetchSubVehicle------ ", decryptResp);
        if(decryptResp.error == false) {
          let nomineeRelation = decryptResp.data.iparelationList;
          this.setState({
          nomineeRelation,
        });
        this.fetchSalutation();
        }      
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });
  };

  fetchData = () => {
    const { productId } = this.props.match.params;
    let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
    let encryption = new Encryption();
    axios
      .get(`ipa/details/${policyHolder_refNo}`)
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        const ageObj = new PersonAge();
        let accidentDetails = decryptResp.data && decryptResp.data.policyHolder ? decryptResp.data.policyHolder : null;
        console.log("---accidentDetails--->>", accidentDetails);

        let address = accidentDetails && accidentDetails.address ? JSON.parse(accidentDetails.address) : {};
        let pincodeRESP = accidentDetails && accidentDetails.pincode_response ? JSON.parse(accidentDetails.pincode_response) : {};
        let is_appointee = accidentDetails.request_data.nominee.length > 0 ? accidentDetails.request_data.nominee[0].is_appointee : "0"
        let nominee_age = (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? ageObj.whatIsMyAge(new Date(accidentDetails.request_data.nominee[0].dob)) : null

		let is_eia_account=  accidentDetails && (accidentDetails.is_eia_account == 0 || accidentDetails.is_eia_account == 1) ? accidentDetails.is_eia_account : ""
                 
		let is_eia_account2=  accidentDetails && (accidentDetails.create_eia_account === 0 || accidentDetails.create_eia_account === 1) ? accidentDetails.create_eia_account : ""
				 
				 
		let tpaInsurance = accidentDetails.T_Insurance_Repository_id ? accidentDetails.T_Insurance_Repository_id : ""/**/

        this.setState({
          accidentDetails,
          address,
          pincodeRESP,
          is_appointee, nominee_age,
		  is_eia_account,is_eia_account2

        });
        let pincodeArea = pincodeRESP && pincodeRESP.PIN_CD ? pincodeRESP.PIN_CD : ""
        this.fetchAreadetailsBack(pincodeArea)
        this.props.loadingStop();
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });
  };

  handleSubmit = (values, actions) => {
    const { productId } = this.props.match.params
    const { accidentDetails } = this.state
    const formData = new FormData();
    let encryption = new Encryption();
    let date_of_birth = moment(values.nominee_dob).format('yyyy-MM-DD');
    this.props.loadingStart();
	
		let create_eia_account;
		if(values.is_eia_account2==='')
		{
			 create_eia_account = 2;
		}
		else
		{
			 create_eia_account = values.is_eia_account2;
		}
	
    let post_data = {
      'policy_holder_id': accidentDetails.id,
      'menumaster_id': '9',
      'page_name': `AccidentAdditionalDetails/${productId}`,
      'first_name': values.first_name,
      'last_name': values.last_name,
      'salutation_id': values.salutation_id,
      'date_of_birth': date_of_birth,
      'email_id': values.email_id,
      'house_building_name': values.building_name,
      // 'city': values.city,
      'plot_no': values.plot_no,
      'street': values.street_name,
      // 'pincode': values.pincode,
      'nominee_gender': values.nominee_gender,
      'nominee_first_name': values.nominee_first_name,
      'nominee_last_name': values.nominee_last_name,
      'nominee_title_id': values.nominee_salutation_id,
      'nominee_dob': date_of_birth,
      'relation_with': values.relation_with,
      'is_appointee': this.state.is_appointee,
      'marital_status_id': values.marital_status_id,
	  'is_appointee': this.state.is_appointee,
      'marital_status_id': values.marital_status_id,
	  
	  'pancard':values.pancard,
	  'is_eia_account': values.is_eia_account,
      'eia_no': values.eia_no,
	  'create_eia_account': create_eia_account,
	  'tpaInsurance': values.tpaInsurance,
    }
    if (this.state.appointeeFlag == true || this.state.is_appointee == '1') {
      // let date_of_birth_appointee = moment(values.appointee_dob).format('yyyy-MM-DD');
      post_data['appointee_name'] = values.appointee_name
      // post_data['appointee_dob'] = date_of_birth_appointee
      post_data['appointee_relation_with'] = values.appointee_relation_with
    }

    console.log('post_data', post_data);
    formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
    axios
      .post(`ipa/proposer-info`, formData)
      .then(res => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        console.log('decryptResp-----', decryptResp)
        if (decryptResp.error == false) {
          this.props.history.push(`/AccidentAdditionalPremium_Micro/${productId}`);
        } else {
          actions.setSubmitting(false)
        }
        this.props.loadingStop();
      })
      .catch(err => {
        this.props.loadingStop();
        actions.setSubmitting(false)
        let decryptErr = JSON.parse(encryption.decrypt(err.data));
        console.log('decryptErr-----', decryptErr)
        actions.setSubmitting(false)
      });

  }

  fetchAreadetails = (e) => {
    let pinCode = e.target.value;

    if (pinCode.length == 6) {
      const formData = new FormData();
      this.props.loadingStart();
      // let encryption = new Encryption();
      const post_data_obj = {
        pincode: pinCode,
      };
      //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
      formData.append("pincode", pinCode);
      axios
        .post("pincode-details", formData)
        .then((res) => {
          if (res.data.error === false) {
            let stateName =
              res.data.data &&
                res.data.data[0] &&
                res.data.data[0].pinstate.STATE_NM
                ? res.data.data[0].pinstate.STATE_NM
                : "";
            this.setState({
              pinDataArr: res.data.data,
              stateName,
            });
            this.props.loadingStop();
          } else {
            this.props.loadingStop();
            swal("Plese enter a valid pincode");
          }
        })
        .catch((err) => {
          this.props.loadingStop();
        });
    }
  };

  fetchAreadetailsBack = (pincode_input) => {
    let pinCode = pincode_input.toString();

    if (pinCode != null && pinCode != "" && pinCode.length == 6) {
      const formData = new FormData();
      this.props.loadingStart();
      // let encryption = new Encryption();
      const post_data_obj = {
        pincode: pinCode,
      };
      // formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
      formData.append("pincode", pinCode);
      axios
        .post("pincode-details", formData)
        .then((res) => {
          let stateName =
            res.data.data &&
              res.data.data[0] &&
              res.data.data[0].pinstate.STATE_NM
              ? res.data.data[0].pinstate.STATE_NM
              : "";
          this.setState({
            pinDataArr: res.data.data,
            stateName,
          });
          this.props.loadingStop();
        })
        .catch((err) => {
          this.props.loadingStop();
        });
    }
  };

  fetchSalutation = () => {
    const formData = new FormData();
    let encryption = new Encryption();
    this.props.loadingStart();
    let post_data = {
      'policy_for_flag': '1',
    }
    formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
    axios.post('ipa/titles', formData)
      .then(res => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data))
        let titleList = decryptResp.data.salutationlist
        this.setState({
          titleList
        });
        this.fetchData();
      }).
      catch(err => {
        this.props.loadingStop();
        this.setState({
          titleList: []
        });
      })
  }

  // fetchNomineeSalutation = (pincodeArea) => {
  //   const formData = new FormData();
  //   let encryption = new Encryption();
  //   this.props.loadingStart();
  //   axios.get('ipa/ipa-nominee-titles')
  //     .then(res => {
  //       let decryptResp = JSON.parse(encryption.decrypt(res.data))
  //       let titleNomineeList = decryptResp.data.ipanomineetitles
  //       this.setState({
  //         titleNomineeList
  //       });
  //       this.fetchAreadetailsBack(pincodeArea)
  //     }).
  //     catch(err => {
  //       this.props.loadingStop();
  //       this.setState({
  //         titleNomineeList: []
  //       });
  //     })
  // }

  AddDetails = (productId) => {
    this.props.history.push(`/AccidentAddDetails_Micro/${productId}`);
  };

  ageCheck = (value) => {
    const ageObj = new PersonAge();
    let age = ageObj.whatIsMyAge(value)
    if (age < 18) {
      this.setState({
        appointeeFlag: true,
        is_appointee: 1,
      })
    }
    else {
      this.setState({
        appointeeFlag: false,
        is_appointee: 0
      })
    }
  }


  ageCheckValue = (value) => {
    const ageObj = new PersonAge();
    let nominee_age = ageObj.whatIsMyAge(value)
    this.setState({
      nominee_age
    })
  }

    showEIAText = (value) =>{
        if(value == 1){
            this.setState({
                showEIA:true,
                is_eia_account:1,
				showEIA2:false,
				is_eia_account2:0
            })
        }
        else{
            this.setState({
                showEIA:false,
                is_eia_account:0
            })
        }
    }
	showEIAText2 = (value) =>{
        if(value == 1){
            this.setState({
                showEIA2:true,
                is_eia_account2:1
            })
        }
        else{
            this.setState({
                showEIA2:false,
                is_eia_account2:0
            })
        }
    }


  render() {
    const { showEIA, showEIA2, is_eia_account,is_eia_account2, tpaInsurance, pinDataArr, titleList, appointeeFlag, is_appointee, accidentDetails, address, pincodeRESP, nomineeRelation, titleNomineeList } = this.state;
	
	let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
	
    const { productId } = this.props.match.params;
    const newInitialValues = Object.assign(initialValues, {
      salutation_id: accidentDetails && accidentDetails.ipainfo ? accidentDetails.ipainfo.ipatitle.id : "",
      first_name: accidentDetails ? accidentDetails.first_name : "",
      last_name: accidentDetails ? accidentDetails.last_name : "",
      date_of_birth: accidentDetails && accidentDetails.dob ? new Date(accidentDetails.dob) : "",
      mobile: accidentDetails ? accidentDetails.mobile : "",
      email_id: accidentDetails ? accidentDetails.email_id : "",
      proposer_gender: accidentDetails ? accidentDetails.gender : "",
      building_name: address && address.house_building_name ? address.house_building_name : "",
      city: address && address.city ? address.city : "",
      plot_no: address && address.plot_no ? address.plot_no : "",
      street_name: address && address.street_name ? address.street_name : "",
      pincode: accidentDetails ? accidentDetails.pincode : "",
      pincode_id: pincodeRESP && pincodeRESP.id ? pincodeRESP.id : "",
      nominee_salutation_id: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? accidentDetails.request_data.nominee[0].title_id : "",
      nominee_first_name: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? accidentDetails.request_data.nominee[0].first_name : "",
      nominee_last_name: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? accidentDetails.request_data.nominee[0].last_name : "",
      nominee_dob: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? new Date(accidentDetails.request_data.nominee[0].dob) : null,
      relation_with: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? accidentDetails.request_data.nominee[0].relation_with : "",
      nominee_gender: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? accidentDetails.request_data.nominee[0].gender : "",
      is_appointee: is_appointee,
      appointee_name: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? accidentDetails.request_data.nominee[0].appointee_name : "",
      appointee_dob: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? new Date(accidentDetails.request_data.nominee[0].appointee_dob) : "",
      appointee_relation_with: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? accidentDetails.request_data.nominee[0].appointee_relation_with : "",
      marital_status_id: accidentDetails && accidentDetails.ipainfo && accidentDetails.ipainfo.marital_status_id != '0' ? accidentDetails.ipainfo.marital_status_id : "",
	  
	  pancard: accidentDetails && accidentDetails.pancard ? accidentDetails.pancard : "",
	  is_eia_account:  is_eia_account,
	  is_eia_account2:  is_eia_account2,
      eia_no: accidentDetails && accidentDetails.eia_no ? accidentDetails.eia_no : "",
	  
	  tpaInsurance: accidentDetails && accidentDetails.T_Insurance_Repository_id ? accidentDetails.T_Insurance_Repository_id : "",
	  
    });

    return (
      <>
        <BaseComponent>
		    <div className="page-wrapper">
          <div className="container-fluid">
            <div className="row">

              <aside className="left-sidebar">
                <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
                <SideNav />
                </div>
              </aside>

              <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox cmdpol2">
                <h4 className="text-center mt-3 mb-3">
                  SBI General Insurance Company Limited
                </h4>
                <section className="brand">
                  <div className="boxpd">
                    <h4 className="m-b-30">
                      {" "}
                      {/* Select the Sum Insured for individual personal accident */}
                    </h4>
                    <Formik
                      initialValues={newInitialValues}
                      onSubmit={this.handleSubmit}
                      validationSchema={IPA__Validation}
                    >
                      {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                        return (
                          <Form>
                            <h4 className="text mt-3 mb-3">
                              Communication Details
                            </h4>
                            <div className="d-flex justify-content-left">
                              <div className="brandhead">
                                <h4 className="fs-18 m-b-30">
                                  Contact details of proposer
                                </h4>
                              </div>
                            </div>

                            <Row>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="salutation_id"
                                      component="select"
                                      autoComplete="off"
                                      disabled={true}
                                      className="formGrp"
                                    >
                                      <option value="">Title</option>
                                      {titleList && titleList.length > 0 && titleList.map((title, qIndex) => (
                                        <option key={qIndex} value={title.id}>{title.displayvalue}</option>
                                      ))}
                                    </Field>
                                    {errors.salutation_id && touched.salutation_id ? (
                                      <span className="errorMsg">{errors.salutation_id}</span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="first_name"
                                      type="text"
                                      placeholder="First Name"
                                      disabled={true}
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.first_name}
                                    />
                                    {errors.first_name && touched.first_name ? (
                                      <span className="errorMsg">
                                        {errors.first_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="last_name"
                                      type="text"
                                      placeholder="Last Name"
                                      disabled={true}
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.last_name}
                                    />
                                    {errors.last_name && touched.last_name ? (
                                      <span className="errorMsg">
                                        {errors.last_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <DatePicker
                                    name="date_of_birth"
                                    dateFormat="dd MMM yyyy"
                                    placeholderText="DOB"
                                    peekPreviousMonth
                                    peekPreviousYear
                                    showMonthDropdown
                                    showYearDropdown
                                    disabled={true}
                                    dropdownMode="select"
                                    // maxDate={new Date(maxDobAdult)}
                                    // minDate={new Date(minDobAdult)}
                                    className="datePckr"
                                    selected={values.date_of_birth}
                                    onChange={(val) => {
                                      setFieldTouched("date_of_birth");
                                      setFieldValue("date_of_birth", val);
                                    }}
                                  />
                                  {errors.date_of_birth &&
                                    touched.date_of_birth ? (
                                      <span className="errorMsg">
                                        {errors.date_of_birth}
                                      </span>
                                    ) : null}
                                </FormGroup>
                              </Col>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup className="m-b-25">
                                  <div className="insurerName nmbract">
                                    <span>+91</span>
                                    <Field
                                      name="mobile"
                                      type="text"
                                      placeholder="Mobile No. "
                                      disabled={true}
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.mobile}
                                      maxLength="10"
                                      className="phoneinput pd-l-25"
                                    />
                                    {errors.mobile && touched.mobile ? (
                                      <span className="errorMsg msgpositn">
                                        {errors.mobile}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="email_id"
                                      type="email"
                                      placeholder="Email "
                                      autoComplete="off"
                                      disabled={true}
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.email_id}
                                    />
                                    {errors.email_id && touched.email_id ? (
                                      <span className="errorMsg">
                                        {errors.email_id}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="pincode"
                                      type="test"
                                      placeholder="Pincode"
                                      autoComplete="off"
                                      maxLength="6"
                                      disabled = {true}
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      onKeyUp={(e) => this.fetchAreadetails(e)}
                                      value={values.pincode}
                                      maxLength="6"
                                    />
                                    {errors.pincode && touched.pincode ? (
                                      <span className="errorMsg">
                                        {errors.pincode}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="pincode_id"
                                      component="select"
                                      autoComplete="off"
                                      value={values.pincode_id}
                                      className="formGrp"
                                      disabled = {true}
                                    >
                                      <option value="">Select Area</option>
                                      {pinDataArr &&
                                        pinDataArr.length > 0 &&
                                        pinDataArr.map((resource, rindex) => (
                                          <option key={rindex} value={resource.id}>
                                            {
                                              resource.LCLTY_SUBRB_TALUK_TEHSL_NM
                                            }
                                          </option>
                                        ))}

                                      {/*<option value="area2">Area 2</option>*/}
                                    </Field>
                                    {errors.pincode_id && touched.pincode_id ? (
                                      <span className="errorMsg">
                                        {errors.pincode_id}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="building_name"
                                      type="text"
                                      placeholder="Building/House Name"
                                      autoComplete="off"
                                      // onFocus={(e) =>
                                      //   this.changePlaceHoldClassAdd(e)
                                      // }
                                      // onBlur={(e) =>
                                      //   this.changePlaceHoldClassRemove(e)
                                      // }
                                      value={values.building_name}
                                    />
                                    {errors.building_name &&
                                      touched.building_name ? (
                                        <span className="errorMsg">
                                          {errors.building_name}
                                        </span>
                                      ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="plot_no"
                                      type="text"
                                      placeholder="Plot No. "
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.plot_no}
                                    />
                                    {errors.plot_no && touched.plot_no ? (
                                      <span className="errorMsg">
                                        {errors.plot_no}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="street_name"
                                      type="text"
                                      placeholder="Street Name"
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.street_name}
                                    />
                                    {errors.street_name &&
                                      touched.street_name ? (
                                        <span className="errorMsg">
                                          {errors.street_name}
                                        </span>
                                      ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="city"
                                      type="text"
                                      placeholder="City"
                                      autoComplete="off"
                                      disabled = {true}
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.city}
                                    />
                                    {errors.city && touched.city ? (
                                      <span className="errorMsg">
                                        {errors.city}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                            <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="marital_status_id"
                                      placeholder="Marital Status"
                                      component="select"
                                      autoComplete="off"
                                      className="formGrp"
                                      value={values.marital_status_id}
                                    >
                                      <option value="">Select Marital Status</option>
                                      <option value="1">Married</option>
                                      <option value="2">Single</option>
                                      <option value="3">Widow</option>
                                      <option value="4">Divorced</option>
                                    </Field>
                                    {errors.marital_status_id && touched.marital_status_id ? (
                                      <span className="errorMsg">
                                        {errors.marital_status_id}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
							  
							  <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='pancard'
                                                type="text"
                                                placeholder={phrases["PAN"]}
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.pancard.toUpperCase()} 
                                                onChange= {(e)=> 
                                                    setFieldValue('pancard', e.target.value.toUpperCase())
                                                    }                                                                           
                                            />
                                            {errors.pancard && touched.pancard ? (
                                            <span className="errorMsg">{errors.pancard}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                               </Col>
							  
                            </Row>
                            <Row></Row>
                            <Row>
                              <h3></h3>
                            </Row>
                            <div className="d-flex justify-content-left">
                              <div className="brandhead">
                                <h4 className="fs-18 m-b-30">
                                  Nominee Details
                                </h4>
                              </div>
                            </div>
                            <Row>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="nominee_salutation_id"
                                      component="select"
                                      autoComplete="off"
                                      className="formGrp"
                                    >
                                      <option value="">Title</option>
                                      {titleList && titleList.length > 0 && titleList.map((title, qIndex) => (
                                        <option key={qIndex} value={title.id}>{title.displayvalue}</option>
                                      ))}
                                    </Field>
                                    {errors.nominee_salutation_id && touched.nominee_salutation_id ? (
                                      <span className="errorMsg">{errors.nominee_salutation_id}</span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="nominee_first_name"
                                      type="text"
                                      placeholder="First Name"
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.nominee_first_name}
                                    />
                                    {errors.nominee_first_name &&
                                      touched.nominee_first_name ? (
                                        <span className="errorMsg">
                                          {errors.nominee_first_name}
                                        </span>
                                      ) : null}
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="nominee_last_name"
                                      type="text"
                                      placeholder="Last Name"
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.nominee_last_name}
                                    />
                                    {errors.nominee_last_name &&
                                      touched.nominee_last_name ? (
                                        <span className="errorMsg">
                                          {errors.nominee_last_name}
                                        </span>
                                      ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row >
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <DatePicker
                                    name="nominee_dob"
                                    dateFormat="dd-MM-yyyy"
                                    placeholderText="DOB"
                                    peekPreviousMonth
                                    peekPreviousYear
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    maxDate={new Date(maxDobNominee)}
                                    minDate={new Date(minDobNominee)}
                                    className="datePckr"
                                    onChange={(value) => {
                                      setFieldTouched("nominee_dob");
                                      setFieldValue("nominee_dob", value);
                                      this.ageCheck(value);
                                      this.ageCheckValue(value)
                                    }}
                                    selected={values.nominee_dob}
                                  />
                                  {errors.nominee_dob && touched.nominee_dob ? (
                                    <span className="errorMsg">
                                      {errors.nominee_dob}
                                    </span>
                                  ) : null}
                                </FormGroup>
                              </Col>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="nominee_age"
                                      type="text"
                                      placeholder="Age"
                                      autoComplete="off"
                                      // selected={}
                                      value={this.state.nominee_age}
                                    />

                                  </div>
                                </FormGroup>
                              </Col>
                              <Col sm={6} md={4} lg={3}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="relation_with"
                                      component="select"
                                      autoComplete="off"
                                      value={values.relation_with}
                                      className="formGrp"
                                    >
                                      <option value="">
                                        Relation with Primary Insured
                                      </option>
                                      { nomineeRelation && nomineeRelation.map((relation, qIndex)=> (
                                         <option value={relation.id}>{relation.ipa_relation_name}</option>
                                      ))}
                                    </Field>
                                    {errors.relation_with &&
                                      touched.relation_with ? (
                                        <span className="errorMsg">
                                          {errors.relation_with}
                                        </span>
                                      ) : null}
                                  </div>
                                </FormGroup>
                              </Col> 
                            </Row>  
                            <Row className="m-b-45">
                            <Col sm={6} md={8} lg={3}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="nominee_gender"
                                      placeholder="Nominee Gender"
                                      component="select"
                                      autoComplete="off"
                                      className="formGrp"
                                      value={values.nominee_gender}
                                    >
                                      <option value="">Select Nominee Gender</option>
                                      <option value="m">Male</option>
                                      <option value="f">Female</option>
                                    </Field>
                                    {errors.nominee_gender && touched.nominee_gender ? (
                                      <span className="errorMsg">
                                        {errors.nominee_gender}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                           
                            {appointeeFlag || is_appointee == "1" ? (
                              <div>
                                <div className="d-flex justify-content-left carloan m-b-25">
                                  <h4> Appointee Details</h4>
                                </div>
                                <Row className="m-b-45">
                                  <Col sm={6} md={3} lg={3}>
                                    <FormGroup>
                                      <div className="insurerName">
                                        <Field
                                          name="appointee_name"
                                          type="text"
                                          placeholder="Appointee Name"
                                          autoComplete="off"
                                          onFocus={(e) =>
                                            this.changePlaceHoldClassAdd(e)
                                          }
                                          onBlur={(e) =>
                                            this.changePlaceHoldClassRemove(e)
                                          }
                                          value={values.appointee_name}
                                        />
                                        {errors.appointee_name &&
                                          touched.appointee_name ? (
                                            <span className="errorMsg">
                                              {errors.appointee_name}
                                            </span>
                                          ) : null}
                                      </div>
                                    </FormGroup>
                                  </Col>
                                  
                                  <Col sm={6} md={3} lg={3}>
                                    <FormGroup>
                                      <div className="formSection">
                                        <Field
                                          name="appointee_relation_with"
                                          component="select"
                                          autoComplete="off"
                                          value={values.appointee_relation_with}
                                          className="formGrp"
                                        >
                                          <option value="">
                                            Relation with Nominee
                                          </option>
                                          { nomineeRelation && nomineeRelation.map((relation, qIndex)=> (
                                         <option value={relation.id}>{relation.ipa_relation_name}</option>
                                      ))}
                                        </Field>
                                        {errors.appointee_relation_with &&
                                          touched.appointee_relation_with ? (
                                            <span className="errorMsg">
                                              {errors.appointee_relation_with}
                                            </span>
                                          ) : null}
                                      </div>
                                    </FormGroup>
                                  </Col>
                                </Row>
                              </div>
                            ) : null}
							
							
							
							
							<Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <h4 className="fs-16">{phrases['EIAAccount']}</h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={2}>
                                        <FormGroup>
                                            <div className="d-inline-flex m-b-35">
                                                <div className="p-r-25">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='is_eia_account'                                            
                                                        value='1'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`is_eia_account`, e.target.value);
                                                            this.showEIAText(1);
                                                        }}
                                                        checked={values.is_eia_account == '1' ? true : false}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> {phrases['Yes']}</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                        <Field
                                                        type="radio"
                                                        name='is_eia_account'                                            
                                                        value='0'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`is_eia_account`, e.target.value);
                                                            this.showEIAText(0);
                                                        }}
                                                        checked={values.is_eia_account == '0' ? true : false}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">{phrases['No']}</span>
                                                        {errors.is_eia_account && touched.is_eia_account ? (
                                                        <span className="errorMsg">{phrases[errors.is_eia_account]}</span>
                                                    ) : null}
                                                    </label>
                                                </div>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    {showEIA || is_eia_account == '1' ?
                                    <Col sm={12} md={4} lg={3}>
                                        <FormGroup>
                                        <div className="insurerName">   
                                            <Field
                                                name="eia_no"
                                                type="text"
                                                placeholder={phrases['EIANumber']}
                                                autoComplete="off"
                                                value = {values.eia_no}
                                                maxLength="13"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            />
                                            {errors.eia_no && touched.eia_no ? (
                                            <span className="errorMsg">{phrases[errors.eia_no]}</span>
                                            ) : null}                                             
                                            </div>
                                        </FormGroup>
                                    </Col> : ''}
									
									
							</Row> 		
							
							{showEIA==false && is_eia_account == '0' ?
								<Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <h4 className="fs-16">{phrases['wish_to_create_EIA_Account']}</h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="d-inline-flex m-b-35">
                                                <div className="p-r-25">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='is_eia_account2'                                            
                                                        value='1'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`is_eia_account2`, e.target.value);
                                                            this.showEIAText2(1);
                                                        }}
                                                        checked={values.is_eia_account2 == '1' ? true : false}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> {phrases['Yes']}</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                        <Field
                                                        type="radio"
                                                        name='is_eia_account2'                                            
                                                        value='0'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`is_eia_account2`, e.target.value);
                                                            this.showEIAText2(0);
                                                        }}
                                                        checked={values.is_eia_account2 == '0' ? true : false}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">{phrases['No']}</span>
																																									{errors.is_eia_account2 && touched.is_eia_account2 ? (
                                                        <span className="errorMsg">{phrases[errors.is_eia_account2]}</span>
                                                    ) : null}
                                                        
                                                    </label>
                                                </div>
                                            </div>
                                        </FormGroup>
                                    </Col>							
								</Row> 
							: ''}

									
							{showEIA2 || is_eia_account2 == '1' ?
								<Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <h4 className="fs-16">{phrases['Your_preferred_TPA']}</h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
									<Col sm={12} md={4} lg={5}>
										 <FormGroup>
                                                    <div className="formSection">                                                           
                                                        <Field
                                                            name="tpaInsurance"
                                                            component="select"
                                                            autoComplete="off"
                                                            value={values.tpaInsurance}
                                                            className="formGrp"
															 selected="2"
                                                        >
                                                        <option value="">{phrases['SELECT_TPA']}</option>
                                                        { tpaInsurance.map((relations, qIndex) => 
                                                            <option value={relations.repository_id}>{relations.name}</option>                                        
                                                        )}
                                                        </Field> 
													{errors.tpaInsurance && touched.tpaInsurance ? (
                                                        <span className="errorMsg">{phrases[errors.tpaInsurance]}</span>
                                                    ) : null}														
                                                               
                                                    </div>
                                                </FormGroup>
									</Col>
								</Row> 
									: ''}
							
							
							

                            <div className="d-flex justify-content-left carloan">
                              <h4> </h4>
                            </div>
                            <div className="d-flex justify-content-left resmb">
                              <Button
                                className={`backBtn`}
                                type="button"
                                onClick={this.AddDetails.bind(this, productId)}
                              >
                                {isSubmitting ? "Wait.." : "Back"}
                              </Button>
                              <Button
                                className={`proceedBtn`}
                                type="submit"
                                disabled={isSubmitting ? true : false}
                              >
                                {isSubmitting ? "Wait.." : "Procced"}
                              </Button>
                            </div>
                          </Form>
                        );
                      }}
                    </Formik>
                  </div>
                </section>
                <Footer />
              </div>
            </div>
          </div>
		  </div>
        </BaseComponent>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.loader.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadingStart: () => dispatch(loaderStart()),
    loadingStop: () => dispatch(loaderStop()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(IPA_CommunicationalDetails_Micro)
);
