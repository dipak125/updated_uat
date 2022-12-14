import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import Footer from '../common/footer/Footer';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios"
import moment from "moment";
import {  PersonAge } from "../../shared/dateFunctions";
import Encryption from '../../shared/payload-encryption';
import {  fullNameValidation, addressValidation } from "../../shared/validationFunctions";


const minDobAdult = moment(moment().subtract(100, 'years').calendar())
const maxDobAdult = moment().subtract(18, 'years').calendar();
const minDobNominee = moment(moment().subtract(100, 'years').calendar())
const maxDobNominee = moment().subtract(3, 'months').calendar();

const initialValue = {
    first_name:"",
    last_name:"",
    gender:"",
    dob: "",
    pancard:"",
    pincode:"",
    is_carloan:"",
    bank_name:"",
    bank_branch:"",
    nominee_relation_with:"",
    nominee_first_name:"",
    nominee_last_name:"test",
    nominee_gender:"",
    nominee_dob: "",
    phone: "",
    email: "",
    address: "",
    is_eia_account: "",
	is_eia_account2: "",
    eia_no: "",
    stateName: "",
    pinDataArr: [],
    pincode_id: "",
    age: "",
    nominee_age: ""
}

const ownerValidation = Yup.object().shape({
    first_name: Yup.string().required('NameRequired')
        .min(3, function() {
            return "FirstNameMin"
        })
        .max(40, function() {
            return "FullNameMax"
        })
        .test(
            "nameChecking",
            function() {
                return "FirstNameMin"
            },
            function(value) {   
                return fullNameValidation(value);
            }
        )
        .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)([\s]+[a-zA-Z]+)$/, function() {
            return "ValidName"
        }),
    // last_name:Yup.string().required('Last name is required'),
    gender: Yup.string().required('GenderRequired')
    .matches(/^[MmFf]$/, function() {
        return "ValidGender"
    }),
    dob:Yup.date().required('DOBRequired')
    .test(
        "18YearsChecking",
        function() {
            return "AgeRange"
        },
        function (value) {
            if (value) {
                const ageObj = new PersonAge();
                return ageObj.whatIsMyAge(value) <= 100 && ageObj.whatIsMyAge(value) >= 18;
            }
            return true;
        }
    ),

    age: Yup.mixed().when(['policy_for'], {
        is: policy_for => policy_for == '1', 
        then: Yup.mixed().required('RequiredField')
            .test(
                "18YearsChecking",
                function() {
                    return "AgeRange"
                },
                function (value) {
                    if (value) {
                        return value <= 100 && value >= 18;
                    }
                    return true;
            }),
        otherwise: Yup.mixed().nullable()
    }), 
    
    nominee_age: Yup.mixed().when(['policy_for','pa_flag'], {
        is: (policy_for,pa_flag) => (policy_for == '1') && (pa_flag == '1'), 
        then: Yup.mixed().required('This field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age should be minimum 3 months & maximum 100 years"
            },
            function (value) {
                if (value) {
                    return value <= 100 && value > 0;
                }
                return true;
        }),

        otherwise: Yup.mixed().nullable()
    }),

    pancard: Yup.string().when(['is_eia_account2','net_premium'], {
        is: (is_eia_account2,net_premium) => (is_eia_account2=='1') || (net_premium >= 100000), 
        then: Yup.string().required("EnterPan").test(
            "1LakhChecking",
			function(){return "EnterPan"; },
            function (value) {
                if (!value) {
                    return this.parent.net_premium <= 100000
                }
                 return true;
				 
        }).matches(/^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/, function() {
            return "ValidPan"
        }),
        otherwise: Yup.string().matches(/^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/, function() {
            return "ValidPan"
        })
    }), 

    pincode_id:Yup.string().required('LocationRequired'),

    pincode:Yup.string().required('PincodeRequired')
    .matches(/^[0-9]{6}$/, function() {
        return "ValidPin"
    }),

    address:Yup.string().required('AddressRequired')
    // .matches(/^(?![0-9._])(?!.*[0-9._]$)(?!.*\d_)(?!.*_\d)[a-zA-Z0-9_.,-\\]+$/, 
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9\s,/.-]*$/, 
    function() {
        return "PleaseValidAddress"
    })
    .max(100, function() {
        return "AddressMustBeMaximum100Chracters"
    }),

    phone: Yup.string()
    .matches(/^[6-9][0-9]{9}$/,'ValidMobile').required('PhoneRequired'),
    
    email:Yup.string().email().required('EmailRequired').min(8, function() {
        return "EmainMin"
    })
    .max(75, function() {
        return "EmailMax"
    }).matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9]+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,'InvalidEmail'),

    is_carloan: Yup.mixed().required('RequiredField'),
    bank_name:Yup.string().notRequired('BankNameReq').nullable()
    .test(
        "isLoanChecking",
        function() {
            return "PleaseEnterBank"
        },
        function (value) {
            console.log("vald",this.parent.is_carloan == 1,value)
            if (this.parent.is_carloan == 1 && !value) {   
                return false;    
            }
            return true;
        }
    ).matches(/^[A-Za-z][A-Za-z\s]*$/, function() {
        return "EnterValidBank"
    }),
    bank_branch: Yup.string().notRequired('BankBranchReq').nullable()
    .test(
        "isLoanChecking",
        function() {
            return "PleaseEnterBranch"
        },
        function (value) {
            console.log("vald11",this.parent.is_carloan == 1,value)
            if (this.parent.is_carloan == 1 && !value) { 
                console.log("vald11",this.parent.is_carloan == 1,value)  
                return false;    
            }
            return true;
        }
    ).matches(/^[A-Za-z][A-Za-z\s]*$/, function() {
        return "EnterValidBankBranch"
    }),
    
    salutation_id: Yup.string().required('TitleIsRequired').nullable(),
    nominee_salutation: Yup.string().required('TitleIsRequired').nullable(),

    nominee_relation_with: Yup.string().when(['pa_flag'], {
        is: pa_flag => pa_flag == '1',       
        then:  Yup.string().required("NomineeReltnRequired"),
        otherwise: Yup.string().nullable()
    }),
    nominee_first_name: Yup.string().when(['pa_flag'], {
        is: pa_flag => pa_flag == '1',       
        then: Yup.string().required("NomineeNameRequired")
                .min(3, function() {
                    return "FirstNameMin"
                })
                .max(40, function() {
                    return "NameReqMax"
                })
                .test(
                    "nameChecking",
                    function() {
                        return "FirstNameMin"
                    },
                    function(value) {   
                        return fullNameValidation(value);
                    }
                )
                .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)([\s]+[a-zA-Z]+)$/, function() {
                    return "ValidName"
                }),
        otherwise: Yup.string().nullable()
    }),
    nominee_gender: Yup.string().when(['pa_flag'], {
        is: pa_flag => pa_flag == '1',       
        then: Yup.string().required("NomGenderRequired"),
        otherwise: Yup.string()
    }),
    nominee_dob: Yup.date().when(['pa_flag'], {
        is: pa_flag => pa_flag == '1',       
        then: Yup.date().required("DOBRequired")
                .test(
                    "3monthsChecking",
                    function() {
                        return "NomineeMinAge"
                    },
                    function (value) {
                        if (value) {
                            const ageObj = new PersonAge();
                            return ageObj.whatIsMyAge(value) <= 100 && ageObj.whatIsMyAgeMonth(value) >= 3;
                        }
                        return true;
                    }
                ),
        otherwise: Yup.date()   
    }),

    appointee_name: Yup.string().notRequired()
                .min(3, function() {
                    return "NameReqMin"
                })
                .max(40, function() {
                    return "NameReqMax"
                })        
                .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)([\s]?[a-zA-Z]+)$/, function() {
                    return "ValidName"
                }).test(
                    "18YearsChecking",
                    function() {
                        return "AppoNameRequired"
                    },
                    function (value) {
                        const ageObj = new PersonAge();
                        if (ageObj.whatIsMyAge(this.parent.nominee_dob) < 18 && this.parent.pa_flag == 1 && !value) {   
                            return false  
                        }
                        return true;
                    }
                ),


    appointee_relation_with: Yup.string().notRequired()
                .test(
                    "18YearsChecking",
                    function() {
                        return 'AppoReltnRequired'
                    },
                    function (value) {
                        const ageObj = new PersonAge();
                        if (ageObj.whatIsMyAge(this.parent.nominee_dob) < 18 && this.parent.pa_flag == 1 && !value) {   
                            return false;    
                        }
                        return true;
                    }
                ),

   
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
	
	
	//is_eia_account2: Yup.string().required('RequiredField'),
	
	is_eia_account2: Yup.string().when(['is_eia_account'], {
        is: is_eia_account => is_eia_account == 0, 
        then: Yup.string().required('RequiredField')
    }), 
	
	tpaInsurance: Yup.string().when(['is_eia_account2'], {
        is: is_eia_account2 => is_eia_account2 == 1, 
        then: Yup.string().required('RequiredField')
    }),
	
	
})

class AdditionalDetailsOD extends Component {


    state = {
        showEIA: false,
		showEIA2: false,
        is_eia_account: '',
		is_eia_account2: '',
        showLoan: false,
        is_loan_account: '',
        insurerList: [],
        policyHolder: {},
        nomineeDetails: {},
        quoteId: "",
        bankDetails: {},
        addressDetails: [],
        relation: [],
        is_appointee:0,
        appointeeFlag: false,
        motorInsurance: [],
        titleList: [],
		tpaInsurance: []
    };

    ageCheck = (value) => {
        const ageObj = new PersonAge();
        let age = ageObj.whatIsMyAge(value)
        if(age < 18){
            this.setState({
                appointeeFlag: true,
                is_appointee:1
            })
        }
        else {
            this.setState({
                appointeeFlag: false,
                is_appointee:0
            })
        } 
    }
    

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
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

    showLoanText = (value) =>{
        if(value == 1){
            this.setState({
                showLoan:true,
                is_loan_account:1
            })
        }
        else{
            this.setState({
                showLoan:false,
                is_loan_account:0
            })
        }
    }

    otherComprehensive = (productId) => {
        this.props.history.push(`/OtherComprehensiveOD/${productId}`);
    }


    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params 
        const formData = new FormData(); 
        let encryption = new Encryption();
		
		let create_eia_account;
		if(values['is_eia_account2']==='')
		{
			 create_eia_account = 2;
		}
		else
		{
			 create_eia_account = values['is_eia_account2'];
		}
		
        const post_data = {
            'policy_holder_id':localStorage.getItem('policyHolder_id'),
            'menumaster_id':1,
            'first_name':values['first_name'],
            'last_name':values['last_name'],
            'gender':values['gender'],
            'dob':moment(values['dob']).format("YYYY-MM-DD"),
            'pancard':values['pancard'],
            'pincode_id':values['pincode_id'],
            'district':values['district'],
            'pincode':values['pincode'].toString(),
            'is_carloan':values['is_carloan'],
            'bank_name':values['bank_name'],
            'bank_branch':values['bank_branch'],
            'nominee_relation_with':values['nominee_relation_with'],
            'nominee_first_name':values['nominee_first_name'],
            'nominee_last_name':values['nominee_last_name'],
            'nominee_gender':values['nominee_gender'],
            'nominee_dob':moment(values['nominee_dob']).format("YYYY-MM-DD"),
            'phone': values['phone'],
            'email': values['email'],
            'is_eia_account': values['is_eia_account'],
			
            'eia_no': values['eia_no'],
            'address': values['address'],
            'appointee_name': values['appointee_name'],
            'appointee_relation_with': values['appointee_relation_with'],
            'is_appointee': this.state.is_appointee,
            'salutation_id': values['salutation_id'],
            'nominee_title_id': values['nominee_salutation'],
            'page_name': `Additional_detailsOD/${productId}`,
			'create_eia_account': create_eia_account,
			'tpaInsurance': values['tpaInsurance'],
        }
console.log('post_data', post_data);
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios
        .post(`/four-wh-stal/owner-details`, formData)
        .then(res => { 
            // this.props.loadingStop();
            this.props.history.push(`/PremiumOD/${productId}`);
        })
        .catch(err => { 
          this.props.loadingStop();
          actions.setSubmitting(false)
        });

    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`four-wh-stal/policy-holder/motor-saod/${policyHolder_id}`)
            .then(res => {
                 let decryptResp = JSON.parse(encryption.decrypt(res.data))
                 console.log("decrypt", decryptResp)
                 let bank =decryptResp.data.policyHolder ? decryptResp.data.policyHolder.bankdetail : {};
                 let fastlanelog = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.fastlanelog : {};
                 let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {};
                 let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                 let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                 let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : {};
                 let nomineeDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.nominee[0] : {}
                 let is_loan_account = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.is_carloan : 0
                 let quoteId = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.quote_id : ""
                 let is_eia_account=  policyHolder && (policyHolder.is_eia_account == 0 || policyHolder.is_eia_account == 1) ? policyHolder.is_eia_account : ""
				 let is_eia_account2=  policyHolder && (policyHolder.create_eia_account == 0 || policyHolder.create_eia_account == 1) ? policyHolder.create_eia_account : ""
				 
				 let tpaInsurance = policyHolder.T_Insurance_Repository_id ? policyHolder.T_Insurance_Repository_id : ""
				 
                 let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {};
                 let bankDetails = decryptResp.data.policyHolder && decryptResp.data.policyHolder.bankdetail ? decryptResp.data.policyHolder.bankdetail[0] : {};
                 let addressDetails = JSON.parse(decryptResp.data.policyHolder.pincode_response)
                 this.setState({
                    quoteId, motorInsurance, previousPolicy, vehicleDetails, policyHolder, nomineeDetails, is_loan_account, is_eia_account,is_eia_account2, bankDetails, addressDetails,
                    is_appointee: nomineeDetails ? nomineeDetails.is_appointee : "", request_data
                })
                is_loan_account == 1 ? this.showLoanText(1):this.showLoanText(0);
                this.props.loadingStop();
                
                if(policyHolder && policyHolder.pincode) 
                {
                    this.fetchAreadetails(policyHolder.pincode)
                } 
               
                this.fetchPrevAreaDetails(addressDetails)
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
			
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

    fetchAreadetails=(value)=>{
        let pinCode = value;      
        console.log("hi")
        if(pinCode.length==6){
            const formData = new FormData();
            this.props.loadingStart();
            let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
            
        //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
           formData.append('pincode',pinCode)
           axios.post('pincode-details',
            formData
            ).then(res=>{       
                let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
                this.setState({
                    pinDataArr: res.data.data,
                    stateName,
                });
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
            })          
        }       
    }

    
    fetchPrevAreaDetails=(addressDetails)=>{
        if(addressDetails){
            let pincode = addressDetails.PIN_CD;
            const formData = new FormData();
            // let encryption = new Encryption();

        //    const post_data_obj = {
        //         'pincode':pincode.toString()
        //     };
           // let encryption = new Encryption();
        //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

            formData.append('pincode', pincode)
            this.props.loadingStart();
            axios.post('pincode-details',
            formData
            ).then(res=>{
                let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
                this.setState({
                    pinDataArr: res.data.data,
                    stateName,
                });
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
            })
        }
        
    }

    fetchRelationships=()=>{

            this.props.loadingStart();
            axios.get('relations')
            .then(res=>{
                let relation = res.data.data ? res.data.data : []                        
                this.setState({
                    relation
                });
                this.props.loadingStop();
                this.fetchSalutation();
            }).
            catch(err=>{
                this.props.loadingStop();
                this.setState({
                    relation: []
                });
            })
        
    }

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
	  


    componentDidMount() {
        this.fetchData();
        this.fetchRelationships(); 
		this.tpaInsuranceRepository();
    }

   

    render() {
        const {showEIA, showEIA2, is_eia_account,is_eia_account2, showLoan, is_loan_account, nomineeDetails, is_appointee,appointeeFlag, titleList,tpaInsurance,
            bankDetails,policyHolder, stateName, pinDataArr, quoteId, addressDetails, relation, motorInsurance,request_data} = this.state
        const {productId} = this.props.match.params 
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null        

        let newInitialValues = Object.assign(initialValue, {
            first_name: policyHolder && policyHolder.first_name ? policyHolder.first_name : "",
            gender:  policyHolder && policyHolder.gender ? policyHolder.gender : "",
            dob: policyHolder && policyHolder.dob ? new Date(policyHolder.dob) : "",
            age: policyHolder && policyHolder.dob ? Math.floor(moment().diff(policyHolder.dob, 'years', true) ) : "",
            pancard: policyHolder && policyHolder.pancard ? policyHolder.pancard : "",
            pincode_id: addressDetails && addressDetails.id ? addressDetails.id : "",
            pincode: policyHolder && policyHolder.pincode ? policyHolder.pincode : "",
            address: policyHolder && policyHolder.address ? policyHolder.address : "",
            is_carloan:parseInt(is_loan_account),
            bank_name: bankDetails ? bankDetails.bank_name : "",
            bank_branch: bankDetails ? bankDetails.bank_branch : "",
            nominee_relation_with: nomineeDetails && nomineeDetails.relation_with ? nomineeDetails.relation_with.toString() : "",
            nominee_first_name: nomineeDetails && nomineeDetails.first_name ? nomineeDetails.first_name : "",
            nominee_gender: nomineeDetails && nomineeDetails.gender ? nomineeDetails.gender : "",
            nominee_dob: nomineeDetails && nomineeDetails.dob ? new Date(nomineeDetails.dob) : "",
            nominee_age: nomineeDetails && nomineeDetails.dob ? Math.floor(moment().diff(nomineeDetails.dob, 'years', true) ) : "",
            pa_flag : motorInsurance ? motorInsurance.pa_flag : 0,
            
            phone: policyHolder && policyHolder.mobile ? policyHolder.mobile : "",
            email:  policyHolder && policyHolder.email_id ? policyHolder.email_id : "",
            address: policyHolder && policyHolder.address ? policyHolder.address : "",
            is_eia_account:  is_eia_account,
			is_eia_account2:  is_eia_account2,
            eia_no: policyHolder && policyHolder.eia_no ? policyHolder.eia_no : "",
            appointee_relation_with: nomineeDetails && nomineeDetails.appointee_relation_with ? nomineeDetails.appointee_relation_with : "",
            appointee_name: nomineeDetails && nomineeDetails.appointee_name ? nomineeDetails.appointee_name : "",
            salutation_id: policyHolder && policyHolder.salutation_id ? policyHolder.salutation_id : "",        
            nominee_salutation: nomineeDetails && nomineeDetails.gender ? nomineeDetails.title_id : "",
            net_premium: request_data && request_data.net_premium ? request_data.net_premium : "0",
			policy_for : motorInsurance ? motorInsurance.policy_for : "",
			tpaInsurance: policyHolder && policyHolder.T_Insurance_Repository_id ? policyHolder.T_Insurance_Repository_id : "",
			

        });

        const quoteNumber =
        quoteId ? (
            <h4>{phrases['PolicyReady']}: {quoteId} {phrases['MoreDetailsPolicy']} </h4>
        ) : null;

        // console.log("newInitialValues", newInitialValues)
        return (
            <>
                <BaseComponent>
                {phrases ? 
                <div className="page-wrapper">				
                <div className="container-fluid">
                    <div className="row">			
                        <aside className="left-sidebar">
                        <div className="scroll-sidebar ps-container ps-theme-default ps-active-y">
                        <SideNav />
                        </div>
                        </aside>

                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox addiOd">
                            <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>
                            <section className="brand m-b-25">
                                <div className="brand-bg">

                                <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit}
                                    validationSchema={ownerValidation}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                        console.log("err",errors)
                                        console.log("value",values)
                                    return (
                                    <Form autoComplete="off">
                                    <Row>
                            <Col sm={12} md={12} lg={9}>
                                        <div className="d-flex justify-content-left brandhead">
                                        {quoteNumber}
                                        </div>
                                            <div className="d-flex justify-content-left carloan">
                                                <h4> {phrases['CarLoan']}</h4>
                                            </div>

                                            <Row>
                                                <Col sm={12} md={4} lg={4}>
                                                    <div className="d-inline-flex m-b-35">
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                            <Field
                                                                type="radio"
                                                                name='is_carloan'                                            
                                                                value='1'
                                                                key='1'  
                                                                onChange={(e) => {
                                                                    setFieldValue(`is_carloan`, e.target.value);
                                                                    this.showLoanText(1);
                                                                }}
                                                                checked={values.is_carloan == '1' ? true : false}
                                                            />
                                                                <span className="checkmark " /><span className="fs-14"> {phrases['Yes']}</span>
                                                            </label>
                                                        </div>

                                                        <div className="">
                                                            <label className="customRadio3">
                                                            <Field
                                                                type="radio"
                                                                name='is_carloan'                                            
                                                                value='0'
                                                                key='1'  
                                                                onChange={(e) => {
                                                                    setFieldValue(`is_carloan`, e.target.value); 
                                                                    this.showLoanText(0);  
                                                                }}
                                                                checked={values.is_carloan == '0' ? true : false}
                                                            />
                                                                <span className="checkmark" />
                                                                <span className="fs-14">{phrases['No']}</span>
                                                            </label>
                                                            {errors.is_carloan && touched.is_carloan ? (
                                                            <span className="errorMsg">{errors.is_carloan}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </Col>
                                                {showLoan || is_loan_account == 1 ?
                                                <Fragment>
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                        <Field
                                                                name='bank_name'
                                                                type="text"
                                                                placeholder={phrases["BankName"]}
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.bank_name}                                                                            
                                                        />
                                                            {errors.bank_name && touched.bank_name ? (
                                                        <span className="errorMsg">{phrases[errors.bank_name]}</span>
                                                        ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col> 
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                        <Field
                                                                name='bank_branch'
                                                                type="text"
                                                                placeholder={phrases["BankBranch"]}
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.bank_branch}                                                                            
                                                        />
                                                            {errors.bank_branch && touched.bank_branch ? (
                                                        <span className="errorMsg">{phrases[errors.bank_branch]}</span>
                                                        ) : null} 
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                                </Fragment>: ''}
                                            </Row>
                                            <Row>
                                                <Col>&nbsp;</Col>
                                            </Row>

                                            <div className="d-flex justify-content-left carloan">
                                                <h4> {phrases['OwnersDetails']}</h4>
                                            </div>

                                            <Row>
                                                <Col sm={12} md={4} lg={2}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                        <Field
                                                            name='salutation_id'
                                                            component="select"
                                                            autoComplete="off"                                                                        
                                                            className="formGrp"
                                                        >
                                                            <option value="">{phrases['Title']}</option>
                                                            {titleList.map((title, qIndex) => ( 
                                                            <option value={title.id}>{title.displayvalue}</option>
                                                            ))}
                                                        </Field>     
                                                        {errors.salutation_id && touched.salutation_id ? (
                                                        <span className="errorMsg">{phrases[errors.salutation_id]}</span>
                                                        ) : null}              
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                                <Col sm={12} md={4} lg={5}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                        <Field
                                                            name='first_name'
                                                            type="text"
                                                            placeholder={phrases["FullName"]}
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value = {values.first_name}                                                                            
                                                        />
                                                            {errors.first_name && touched.first_name ? (
                                                        <span className="errorMsg">{phrases[errors.first_name]}</span>
                                                        ) : null} 
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                                <Col sm={12} md={4} lg={5}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                        <Field
                                                            name='gender'
                                                            component="select"
                                                            autoComplete="off"                                                                        
                                                            className="formGrp"
                                                        >
                                                        <option value="">{phrases['SelectGender']}</option>
                                                            <option value="m">{phrases['Male']}</option>
                                                            <option value="f">{phrases['Female']}</option>
                                                        </Field>     
                                                        {errors.gender && touched.gender ? (
                                                        <span className="errorMsg">{phrases[errors.gender]}</span>
                                                        ) : null}              
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            <Row>
                                                {/* <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                    <DatePicker
                                                        name="dob"
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText={phrases["DOB"]}
                                                        peekPreviousMonth
                                                        peekPreviousYear
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        autoComplete="off"
                                                        dropdownMode="select"
                                                        maxDate={new Date(maxDobAdult)}
                                                        minDate={new Date(minDobAdult)}
                                                        className="datePckr"
                                                        selected={values.dob}
                                                        onChange={(val) => {
                                                            setFieldTouched('dob');
                                                            setFieldValue('dob', val);
                                                            }}
                                                    />
                                                    {errors.dob && touched.dob ? (
                                                        <span className="errorMsg">{phrases[errors.dob]}</span>
                                                    ) : null}  
                                                    </FormGroup>
                                                </Col> */}
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup className="m-b-25">
                                                    <div className="insurerName">
                                                        <Field
                                                            name='age'
                                                            type="number"
                                                            placeholder={phrases['Age']}
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value = {values.age}
                                                            maxLength="10"            
                                                            onChange = {(e) => {
                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                setFieldValue('dob',dob)
                                                                setFieldValue('age',e.target.value)
                                                            }}                                                                                                 
                                                        />
                                                        {errors.age && touched.age ? (
                                                            <span className="errorMsg">{phrases[errors.age]}</span>
                                                        ) : null}  
                                                    </div>
                                                    </FormGroup>
                                                </Col>
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                        <Field
                                                            name='email'
                                                            type="email"
                                                            placeholder={phrases["Email"]}
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value = {values.email}                                                                            
                                                        />
                                                        {errors.email && touched.email ? (
                                                        <span className="errorMsg">{errors.email == "email must be a valid email" ? errors.email : phrases[errors.email]}</span>
                                                        ) : null}  
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup className="m-b-25">
                                                        <div className="insurerName nmbract">
                                                            <span>+91</span>
                                                        <Field
                                                            name='phone'
                                                            type="text"
                                                            placeholder={phrases["Mobile"]}
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value = {values.phone}
                                                            maxLength="10" 
                                                            className="phoneinput pd-l-25"                                                                          
                                                        />
                                                        {errors.phone && touched.phone ? (
                                                        <span className="errorMsg msgpositn">{phrases[errors.phone]}</span>
                                                        ) : null}  
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                                
                                            </Row>

                                            <Row>  
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                        <Field
                                                            name='address'
                                                            type="text"
                                                            placeholder={phrases['Address']}
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value = {values.address}                                                                            
                                                        />
                                                        {errors.address && touched.address ? (
                                                        <span className="errorMsg">{phrases[errors.address]}</span>
                                                        ) : null}  
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                                <Col sm={12} md={4} lg={4}>
                                                <FormGroup>
                                                    <div className="insurerName">
                                                        <Field
                                                            name="pincode"
                                                            type="test"
                                                            placeholder={phrases["Pincode"]}
                                                            autoComplete="off"
                                                            maxlength = "6"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            onKeyUp={e=> this.fetchAreadetails(e.target.value)}
                                                            value={values.pincode}
                                                            maxLength="6"
                                                            onInput= {(e)=> {
                                                                setFieldTouched("state");
                                                                setFieldTouched("pincode");
                                                                setFieldValue("pincode", e.target.value);
                                                                setFieldValue("state", stateName ? stateName[0] : values.state);
                                                                setFieldValue("pincode_id", "");
                                                            }}
                                                        />
                                                        {errors.pincode && touched.pincode ? (
                                                        <span className="errorMsg">{phrases[errors.pincode]}</span>
                                                        ) : null}                                                   
                                                    </div>
                                                </FormGroup>
                                                </Col>
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                            <Field
                                                                name="pincode_id"
                                                                component="select"
                                                                autoComplete="off"
                                                                value={values.pincode_id}
                                                                className="formGrp"
                                                            >
                                                            <option value="">{phrases['SelectArea']}</option>
                                                            {pinDataArr && pinDataArr.length > 0 && pinDataArr.map((resource,rindex)=>
                                                                <option value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                            )}
                                                                
                                                                {/*<option value="area2">Area 2</option>*/}
                                                            </Field>     
                                                            {errors.pincode_id && touched.pincode_id ? (
                                                                <span className="errorMsg">{phrases[errors.pincode_id]}</span>
                                                            ) : null}     
                                                        </div>
                                                    </FormGroup>
                                                    
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="state"
                                                                type="text"
                                                                placeholder={phrases["State"]}
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={stateName ? stateName : values.state} 
                                                                disabled = {true}
                                                                
                                                            />
                                                            {errors.state && touched.state ? (
                                                            <span className="errorMsg">{errors.state}</span>
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
                                                        <span className="errorMsg">{phrases[errors.pancard]}</span>
                                                        ) : null} 
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {motorInsurance && motorInsurance.pa_flag == '1' ?
                                            <Fragment>
                                            <div className="d-flex justify-content-left carloan">
                                                <h4> {phrases['NomineeDetails']}</h4>
                                            </div>

                                            <Row>
                                                <Col sm={12} md={4} lg={2}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                        <Field
                                                            name='nominee_salutation'
                                                            component="select"
                                                            autoComplete="off"                                                                        
                                                            className="formGrp"
                                                        >
                                                            <option value="">{phrases['Title']}</option>
                                                            {titleList.map((title, qIndex) => ( 
                                                            <option value={title.id}>{title.displayvalue}</option>
                                                            ))}
                                                        </Field>     
                                                        {errors.nominee_salutation && touched.nominee_salutation ? (
                                                        <span className="errorMsg">{phrases[errors.nominee_salutation]}</span>
                                                        ) : null}              
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                        <Field
                                                            name='nominee_first_name'
                                                            type="text"
                                                            placeholder={phrases['FullName']}
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value = {values.nominee_first_name}                                                                            
                                                        />
                                                        {errors.nominee_first_name && touched.nominee_first_name ? (
                                                        <span className="errorMsg">{phrases[errors.nominee_first_name]}</span>
                                                        ) : null}  
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                        <Field
                                                            name='nominee_gender'
                                                            component="select"
                                                            autoComplete="off"                                                                        
                                                            className="formGrp"
                                                        >
                                                        <option value="">{phrases['SelectGender']}</option>
                                                            <option value="m">{phrases['Male']}</option>
                                                            <option value="f">{phrases['Female']}</option>
                                                        </Field>     
                                                        {errors.nominee_gender && touched.nominee_gender ? (
                                                        <span className="errorMsg">{phrases[errors.nominee_gender]}</span>
                                                        ) : null}              
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            <Row>
                                                {/* <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                    <DatePicker
                                                        name="nominee_dob"
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText={phrases['DOB']}
                                                        peekPreviousMonth
                                                        peekPreviousYear
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                        maxDate={new Date(maxDobNominee)}
                                                        minDate={new Date(minDobNominee)}
                                                        className="datePckr"
                                                        selected={values.nominee_dob}
                                                        onChange={(val) => {
                                                            this.ageCheck(val)
                                                            setFieldTouched('nominee_dob');
                                                            setFieldValue('nominee_dob', val);
                                                            }}
                                                    />
                                                    {errors.nominee_dob && touched.nominee_dob ? (
                                                        <span className="errorMsg">{phrases[errors.nominee_dob]}</span>
                                                    ) : null}  
                                                    </FormGroup>
                                                </Col> */}
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup className="m-b-25">
                                                    <div className="insurerName">
                                                        <Field
                                                            name='nominee_age'
                                                            type="number"
                                                            placeholder={phrases['Age']}
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value = {values.nominee_age}
                                                            maxLength="10"            
                                                            onChange = {(e) => {
                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                this.ageCheck(dob)
                                                                setFieldValue('nominee_dob',dob)
                                                                setFieldValue('nominee_age',e.target.value)
                                                            }}                                                                                                 
                                                        />
                                                        {errors.nominee_age && touched.nominee_age ? (
                                                            <span className="errorMsg">{errors.nominee_age}</span>
                                                        ) : null}  
                                                    </div>
                                                    </FormGroup>
                                                </Col>
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                        <Field
                                                            name="nominee_relation_with"
                                                            component="select"
                                                            autoComplete="off"
                                                            value={values.nominee_relation_with}
                                                            className="formGrp"
                                                        >
                                                        <option value="">{phrases['PrimaryRelation']}</option>
                                                    { relation.map((relations, qIndex) => 
                                                        relations.name != "Self" ? <option value={relations.id}>{relations.name}</option> : null                                       
                                                    )}
                                                        </Field>     
                                                        {errors.nominee_relation_with && touched.nominee_relation_with ? (
                                                            <span className="errorMsg">{phrases[errors.nominee_relation_with]}</span>
                                                        ) : null}        
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {appointeeFlag || is_appointee == '1' ? 
                                                <div>
                                                    <div className="d-flex justify-content-left carloan">
                                                        <h4> </h4>
                                                    </div>
                                                    <div className="d-flex justify-content-left carloan">
                                                        <h4> {phrases['AppoDetails']}</h4>
                                                    </div>
                                                    <Row className="m-b-45">
                                                        <Col sm={12} md={4} lg={4}>
                                                            <FormGroup>
                                                                <div className="insurerName">
                                                                    <Field
                                                                        name="appointee_name"
                                                                        type="text"
                                                                        placeholder={phrases["AppoName"]}
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value={values.appointee_name}
                                                                    />
                                                                    {errors.appointee_name && touched.appointee_name ? (
                                                                    <span className="errorMsg">{phrases[errors.appointee_name]}</span>
                                                                    ) : null}
                                                                    
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={4} lg={8}>
                                                            <FormGroup>
                                                                <div className="formSection">                                                           
                                                                    <Field
                                                                        name="appointee_relation_with"
                                                                        component="select"
                                                                        autoComplete="off"
                                                                        value={values.appointee_relation_with}
                                                                        className="formGrp"
                                                                    >
                                                                    <option value="">{phrases['NomineeRelation']}</option>
                                                                    { relation.map((relations, qIndex) => 
                                                                        relations.name != "Self" ? <option value={relations.id}>{relations.name}</option> : null                                        
                                                                    )}
                                                                    </Field>     
                                                                    {errors.appointee_relation_with && touched.appointee_relation_with ? (
                                                                        <span className="errorMsg">{phrases[errors.appointee_relation_with]}</span>
                                                                    ) : null}        
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </div>  : null } 
                                            </Fragment> : null }

                                            <Row>
                                                <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <h4 className="fs-16">{phrases['EIAAccount']}</h4>
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
                                                <Col sm={12} md={4} lg={4}>
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
                                            <div className="d-flex justify-content-left resmb">
                                            <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.otherComprehensive.bind(this,productId)}>
                                                {isSubmitting ? phrases['Wait'] : phrases['Back']}
                                            </Button> 
                                            <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                {isSubmitting ? phrases['Wait'] : phrases['Next']}
                                            </Button> 
                                            </div>

                                        </Col>

                                        <Col sm={12} md={3} lg={3}>
                                            <div className="motrcar"><img src={require('../../assets/images/motor-car.svg')} alt="" /></div>
                                        </Col>
                                    </Row>
                                    </Form>
                                    );
                                    }}
                                    </Formik>
                                </div>
                            </section>
                        </div>
                        <Footer />
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(AdditionalDetailsOD));