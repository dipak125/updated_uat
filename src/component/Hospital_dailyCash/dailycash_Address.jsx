import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
// import ReactTooltip from "react-tooltip";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";
import dateformat from "dateformat";
import moment from "moment";
import swal from 'sweetalert';

import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import Encryption from '../../shared/payload-encryption';
import { faAssistiveListeningSystems } from '@fortawesome/free-solid-svg-icons';

const maxDob = dateformat(new Date(), 'mm/dd/yyyy');
const minDobAdult = moment(moment().subtract(56, 'years').calendar()).add(1, 'day').calendar()
const maxDobAdult = moment().subtract(18, 'years').calendar();

const initialFamilyDetails = {
	fname: "",
    lname: "",
	cashlimit: "",
    coverduration: "",
    education_id:"",
    height: "",
    weight: "",
	dob: new Date(),
    gender: "",	
    family_member_id:0,
    looking_for:''
};

const initialValues = {
    proposerAsInsured: "",
    family_members:[initialFamilyDetails],
    panNo: "",
    phoneNo: "",
    email: "",
    address1: "",
    address2: "",
    address3: "",
    pincode: "",
    // area: "",
    state: "",
    eIA: "",
    eia_account_no:"",
    proposerName: "",
    proposerLastName: "",
    proposercashlimit: "",
    proposercoverduration: "",
    proposereducation_id: "",
    proposerheight: "",
    proposerweight: "",
    proposerDob: "",
    proposerGender: "",
    nominee_first_name: "",
    nominee_last_name: "",
    nominee_gender: "",
    nominee_dob: "",
    nominee_relation_with: "",
	is_eia_account2: "",
    educationList:[]
    };

const validateAddress =  Yup.object().shape({
    proposerAsInsured: Yup.string()
        .required(function() {
            return "Please select a value"
        }),    
    address1: Yup.string()
        .notRequired(function() {
            return "Enter plot number."
        }).matches(/^([0-9]*)$/, function() {
            return "Invalid plot number"
        }),
    address2: Yup.string()
        .required(function() {
            return "Enter building name / number"
        }).matches(/^[a-zA-Z0-9]+([\s]?[a-zA-Z0-9]+)*$/, function() {
            return "Invalid building name / number"
        }),
    address3: Yup.string()
        .required(function() {
            return "Enter street name"
        }).matches(/^[a-zA-Z0-9]+([\s]?[a-zA-Z0-9]+)*$/, function() {
            return "Invalid street name"
        }),
    email:Yup.string().email().required('Email is required').min(8, function() {
            return "Email must be minimum 8 chracters"
        })
        .max(75, function() {
            return "Email must be maximum 75 chracters"
        }).matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9]+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,'Invalid Email Id'),
    
    phoneNo: Yup.string()
    .matches(/^[6-9][0-9]{9}$/,'Invalid Mobile number').required('Phone No. is required'),

/*   
    panNo: Yup.string().when(['netPremiumCheckCount'], {
        is: netPremiumCheckCount => netPremiumCheckCount == 1,       
        then: Yup.string()		
		.required(function() {
        
			if ((document.querySelector('input[name="is_eia_account2"]:checked')) && (document.querySelector('input[name="is_eia_account2"]:checked').value == 1 )) {
				
                return "PAN number is required";
            }
		})
    .matches(/^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/,'Invalid PAN number'),
        otherwise: Yup.string().matches(/^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/,'Invalid PAN number').nullable()}),
	*/	
		
	panNo: Yup.string().when(['is_eia_account2','net_premium'], {
        is: (is_eia_account2,net_premium) => (is_eia_account2=='1') || (net_premium >= 100000), 
        then: Yup.string().required().test(
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
        otherwise: Yup.string()
    }),	
		
		
    pincode: Yup.string()
        .required(function() {
            return "Enter pin code"
        }).matches(/^([0-9]*)$/, function() {
            return "Invalid pin code"
        }).min(6, 'Must be exactly 6 digits')
        .max(6, 'Must be exactly 6 digits'),

    pincode_id: Yup.string()
        .required(function() {
            return "Select area"
        }),
    // state: Yup.string()
    //     .required(function() {
    //         return "Enter state"
    //     }),
    eIA: Yup.string()
        .required(function() {
            return "Select eIA option"
        }),
    family_members: Yup.array().of(
            Yup.object().shape({
                looking_for : Yup.string(),
                fname: Yup.string(function() {
                    return "Please enter first name"
                }).required(function() {
                    return "Please enter first name"
                })
                    .min(3, function() {
                        return "Name must be minimum 3 chracters"
                    })
                    .max(40, function() {
                        return "Name must be maximum 40 chracters"
                    })
                    .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)$/, function() {
                        return "Please enter valid name"
                }),
                lname: Yup.string()
                .required("Please enter last name")
                .matches(/^[a-zA-Z]+$/, "Please enter valid L-name")
                .min(1, "Name must be minimum 1 chracters")
                .max(40, "Name must be maximum 40 chracters")                
                ,
                cashlimit: Yup.string(function() {
                    return "Please Select Daily Cash Limit"
                }).required(function() {
                    return "Please Select Daily Cash Limit"
                }),
                coverduration: Yup.string(function(value) {
                    console.log("cover", value)
                    return "Please Select Cover Duration"
                }).required(function() {
                    
                    return "Please Select Cover Duration"
                }),
                // education_id: Yup.string(function() {
                //     return "Please Select Education"
                // }).required(function() {
                //     return "Please Select Education"
                // }),
                height: Yup.string().required("Please enter height")
                .test("inch",function()
                {return "Valid height"},
                function(value){
                    if(value)
                    {
                        return !isNaN(value)
                    }
                    return true
                }),
                weight: Yup.string().required("Please enter weight")
                .test("number&floatChecking",function(){
                    return "Valid weight"
                },
                function(value){
                    if(value){
                        return !isNaN(value)
                    }
                    return true
                }),
                dob: Yup.date().when(['looking_for'],{
                    //is: looking_for => (looking_for == 'self' || looking_for == 'spouse' || looking_for == 'child1') ,
                    is: looking_for => ['self','spouse','mother','father','fatherInLaw','motherInLaw'].includes(looking_for) ,
                    then: Yup.date().required("Please enter DOB").max(maxDob, function() {
                        return "Date should not be future date"
                        })
                        .test(
                            "18YearsChecking",
                            function() {
                                return "Age should me minium 18 years and maximum 65 years"
                            },
                            function (value) {
                                if (value) {
                                    const ageObj = new PersonAge();
                                    return ageObj.whatIsMyAge(value) < 66 && ageObj.whatIsMyAge(value) >= 18;
                                }
                                return true;
                            }
                        )

                })
               
                ,
                gender: Yup.string().nullable().required("Require Gender"),        

            })     
    ),
    eia_account_no:Yup.string().when(['eIA'], {
        is: eIA => eIA == 1,
        then: Yup.string().required('Please select the EIA account number')
        .min(13, function() {
            return "EIA number should be minimum 13 digits"
        })
        .max(13, function() {
            return "EIA number should be maximum 13 digits"
        }).matches(/^[1245]{1}[0-9]{12}$/, function() {
            return "Invalid number"
        }),
        othewise: Yup.string()
    }),
    proposerName: Yup.string().when(['proposerAsInsured'],{
        is: proposerAsInsured => proposerAsInsured == '0',
        then :Yup.string(function() {
            return "Please enter proposer name"
            }).notRequired(function() {
                return "Please enter proposer name"
            })
            .min(3, function() {
                return "Name must be minimum 3 chracters"
            })
            .max(40, function() {
                return "Name must be maximum 40 chracters"
            })
            .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)$/, function() {
                return "Please enter valid name"
            }).test(
            "proposerAsInsured",
            function() {
                return "Please enter proposer name"
            },
            function (value) {
                if (this.parent.proposerAsInsured == '0' && !value) {   
                    return false;    
                }
                return true;
        })
    }),
    proposerLastName: Yup.string().when(['proposerAsInsured'],{
        is: proposerAsInsured => proposerAsInsured == '0',
        then :Yup.string(function() {
            return "Please enter proposer name"
            }).notRequired(function() {
                return "Please enter proposer name"
            })
            .min(1, function() {
                return "Name must be minimum 1 chracters"
            })
            .max(40, function() {
                return "Name must be maximum 40 chracters"
            })
            .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)$/, function() {
                return "Please enter valid name"
            }).test(
            "proposerAsInsured",
            function() {
                return "Please enter proposer name"
            },
            function (value) {
                if (this.parent.proposerAsInsured == '0' && !value) {   
                    return false;    
                }
                return true;
        }),
    }),
    // proposercashlimit: Yup.string(function() {
    //     return "Please Select Cash Limit"
    //     }).notRequired(function() {
    //         return "Please Select Cash Limit"
    //     }).test(
    //     "proposerAsInsured",
    //     function() {
    //         return "Please Select Cash Limit"
    //     },
    //     function (value) {
    //         if (this.parent.proposerAsInsured == '0' && !value) {   
    //             return false;    
    //         }
    //         return true;
    // }),
    proposerDob: Yup.date()
        .notRequired( function() {
        return "Please enter proposer date of birth"
        }).test(
        "proposerAsInsured",
        function() {
            return "Please enter proposer date of birth"
        },
        function (value) {
            if (this.parent.proposerAsInsured == '0' && !value) {   
                return false;    
            }
            return true;
    }).test(
        "18YearsChecking",
        function() {
            return "Proposer age should be between 18 to 65 years"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (value) {
                const age_Obj = new PersonAge();
                return ageObj.whatIsMyAge(value) < 66 && ageObj.whatIsMyAge(value) >= 18;
            }
            return true;
    }),
    proposerGender: Yup.string().notRequired(function() {
        return "Please select gender"
        }).matches(/^[MmFf]$/, function() {
        return "Please select valid gender"
    }).test(
        "proposerAsInsured",
        function() {
            return "Please select proposer gender"
        },
        function (value) {
            if (this.parent.proposerAsInsured == '0' && !value) {   
                return false;    
            }
            return true;
    }),
	
		is_eia_account2: Yup.string().when(['eIA'], {
			is: eIA => eIA == 0, 
			then: Yup.string().required('RequiredField')
		}), 
		
		tpaInsurance: Yup.string().when(['is_eia_account2'], {
			is: is_eia_account2 => is_eia_account2 == 1, 
			then: Yup.string().required('RequiredField')
		})

});

const validateFirstName=(str)=>{
    let error;
    if(str == ''){
        error = 'Please enter the name';
    }
    return error;    
}

class dailycash_Address extends Component {

  
    constructor(props) {
		super(props)
		this.state = {
            policy_holder:{},
            familyMembers:[],
            addressDetails:{},
            is_eia_account:'',
            selfFlag:false,
            pinDataArr:[],
            stateName:[],
            showEIA:false,
            pincode_Details: [],
            titleList: [],
			is_eia_account2: '',
			tpaInsurance: [],
            educationList:[],
            proposercoverduration : '',
            proposercashlimit: '',
            proposerCoverError : false,
            proposercashlimitCoverError : false
		}
	}

    


    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    componentDidMount(){       
        this.fetchData();
		this.tpaInsuranceRepository();
        this.fetchEducations();
        
    }

    fetchEducations = () => {
        this.props.loadingStart();
        let encryption = new Encryption();
        axios.get(`/daily-cash/educations`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log('education list',decryptResp.data);
                let educationList = decryptResp && decryptResp.data ? decryptResp.data : []

                this.setState({
                   educationList
                })
             
            })
            .catch((err) => {
                // handle error
                let decryptErr = JSON.parse(encryption.decrypt(err.data))
                console.log('education=====',decryptErr)
                this.props.loadingStop();
            })
    }


    fetchData=()=>{
        const {productId } = this.props.match.params
        let encryption = new Encryption();
        this.props.loadingStart();
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo");
        axios.get(`daily-cash/policy-details/${policyHolder_refNo}`)
            .then(res=>{
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp)
                let policy_holder =  decryptResp.data.policyHolder;
                let family_members = decryptResp.data.policyHolder.request_data.family_members
                let addressDetails = JSON.parse(decryptResp.data.policyHolder.address)
                let is_eia_account = decryptResp.data.policyHolder.is_eia_account == 2 ? "" : decryptResp.data.policyHolder.is_eia_account
                let selfFlag = false;
                let pincode_Details = JSON.parse(decryptResp.data.policyHolder.pincode_response)
                let netPremiumCheck = policy_holder.request_data.net_premium;
				
				
				//let is_eia_account2 = decryptResp.data.policyHolder.create_eia_account == 1 ? "" : decryptResp.data.policyHolder.create_eia_account;
				
				let is_eia_account2 = ((decryptResp.data.policyHolder.create_eia_account === 1) || (decryptResp.data.policyHolder.create_eia_account === 0))? decryptResp.data.policyHolder.create_eia_account : "";
				 
				 
				 let tpaInsurance = decryptResp.data.policyHolder.T_Insurance_Repository_id ? decryptResp.data.policyHolder.T_Insurance_Repository_id : "";
				
				
                console.log("netPremiumCheck----",netPremiumCheck);
                for(let i=0;i<family_members.length;i++){
                    if(family_members[i].relation_with=='self'){
                        selfFlag = true
                        break
                    }
                }

                this.setState({ 
                    selfFlag,
                    policy_holder,
                    familyMembers:family_members,
                    addressDetails,
                    is_eia_account,
                    pincode_Details,
                    netPremiumCheck,
					is_eia_account2
                })
                this.props.loadingStop();
                this.fetchSalutation(pincode_Details);
                
            })
            .catch(err=>{
                // handle error
                // this.props.loadingStop();
            })
            this.props.loadingStop();
    }

    fetchPrevAreaDetails=(pincode_Details)=>{
            if(pincode_Details){
                let pincode = pincode_Details.PIN_CD;
                const formData = new FormData();
                // let encryption = new Encryption();

               const post_data_obj = {
                    'pincode':pincode.toString()
                };
               let encryption = new Encryption();
               formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

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

    fetchAreadetails=(e)=>{
        let pinCode = e.target.value;      

        if(pinCode.length==6){
            const formData = new FormData();
            this.props.loadingStart();
            let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
           formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
           formData.append('pincode',pinCode)
           axios.post('pincode-details', formData)
           .then(res=>{       
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

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    sumInsured = (productId) => {
        this.props.history.push(`/dailycash_MedicalDetails/${productId}`);
    }

    handleSubmit = (values, actions) => {
        const {productId } = this.props.match.params
        const policyHolder_id =  localStorage.getItem('policyHolder_id');
        const formData = new FormData();

			let create_eia_account;
			if(values.is_eia_account2==='')
			{
				 create_eia_account = 2;
			}
			else
			{
				 create_eia_account = values.is_eia_account2;
			}

            console.log("values.proposercoverduration", values.proposercoverduration)

            if(values.proposercashlimit != ''){
                this.setState({proposercashlimit: values.proposercashlimit})
            }else{
                this.setState({proposercashlimit:''});
            }

            if(values.proposercoverduration != ''){
                this.setState({proposercoverduration: values.proposercoverduration})
            }else{
                this.setState({proposercoverduration:''});
            }

        let formArr = []
        
        formArr['policy_holder_id'] = policyHolder_id;
        const family_members = values.family_members;

        console.log("family_members", family_members);
        let proposerAsInsured = values.proposerAsInsured;
        sessionStorage.setItem('proposed_insured',proposerAsInsured);
 
        let looking_for = []
        let family_member_id = []
        let gender = []
        let first_name = []
        let last_name = []
        let cash_limit = []
        let cover_duration = []
        let education_id = []
        let height = []
        let weight = []
        let dob = []
        let pancard_no = []
        let salutation_id = []

        for(let j=0;j<family_members.length;j++){
            if(family_members[j].looking_for == 'self'){
                this.setState({proposercoverduration : family_members[j].coverduration})
                this.setState({proposercashlimit: family_members[j].cashlimit})

            }
        }

        for(let i=0;i<family_members.length;i++){
             looking_for.push(family_members[i].looking_for)
            family_member_id.push(family_members[i].family_member_id)
            gender.push(family_members[i].gender)
            first_name.push(family_members[i].fname)
            last_name.push(family_members[i].lname)
            cash_limit.push(family_members[i].cashlimit)
            cover_duration.push(family_members[i].coverduration)
            education_id.push(family_members[i].education_id)
            height.push(family_members[i].height)
            weight.push(family_members[i].weight)
            salutation_id.push(family_members[i].salutation_id)
           dob.push(moment(family_members[i].dob).format("YYYY-MM-DD"))
           pancard_no.push(values.panNo)

           if(this.state.proposercoverduration != ''){
            if(this.state.proposercoverduration != family_members[i].coverduration){
                this.setState({proposerCoverError : true})
            }else{
                this.setState({proposerCoverError : false})
            }
           }

           if(this.state.proposercashlimit != ''){
            if(family_members[i].cashlimit > this.state.proposercashlimit){
                this.setState({proposercashlimitCoverError : true})
            }else{
                this.setState({proposercashlimitCoverError : false})
            }
           }
        }  

        formArr['looking_for'] = looking_for
        formArr['page_name'] = 'dailycash_Address/12'
        formArr['family_member_id'] = family_member_id
        formArr['gender'] = gender
        formArr['first_name'] = first_name
        formArr['last_name'] = last_name
        formArr['cash_limit'] = cash_limit
        formArr['cover_duration'] = cover_duration
        formArr['education_id'] = education_id
        formArr['height'] = height
        formArr['weight'] = weight
        formArr['dob'] = dob
        formArr['pancard_no'] = pancard_no 
        formArr['salutation_id'] = salutation_id

        formArr['policy_holder_id'] = policyHolder_id;


        let email = values.email;
        formArr['phoneNo'] = values.phoneNo;
        formArr['email_id'] = values.email;
        sessionStorage.setItem('email_data',email);
        formArr['is_eia_account'] = values.eIA;      
        sessionStorage.setItem('pan_data',values.panNo);
        sessionStorage.setItem('email_data',values.email);

        let address_object = {}
        Object.assign(address_object,{
            address1:values.address1,
            address2:values.address2,
            address3:values.address3,
            pincode_id:values.pincode_id,
            phoneNo:values.phoneNo,
            pincode:values.pincode,
            state:values.state,
        }) 
        formArr['communication_address'] = JSON.stringify(address_object);   
        formArr['panNo'] = values.panNo;
        formArr['phoneNo'] = values.phoneNo;
        formArr['email'] = values.email;
        formArr['proposerName'] = values.proposerName;
        formArr['proposerLastName'] = values.proposerLastName;
        formArr['proposercashlimit'] = values.proposercashlimit; 
        formArr['proposercoverduration'] = values.proposercoverduration;
        formArr['proposereducation_id'] = values.proposereducation_id;
        formArr['proposerheight'] = values.proposerheight;
        formArr['proposerweight'] = values.proposerweight;
        formArr['proposerDob'] = moment(values.proposerDob).format("YYYY-MM-DD");
        formArr['proposerGender'] = values.proposerGender;
        formArr['pincode_id'] = values.pincode_id;
        formArr['salutation_id'] = values.salutation_id;
		
		
        
        if(values.eIA == 1){
            formArr['eia_account_no'] = values.eia_account_no;
        }  
			
		formArr['create_eia_account'] = create_eia_account;
        formArr['tpaInsurance'] = values.tpaInsurance;
		

        let formObj = {}
        Object.assign(formObj,formArr);
        let encryption = new Encryption();
        console.log("formObj_input--------- ", formObj)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(formObj)))
        this.props.loadingStart();

        console.log("this.state.proposerCoverError", this.state.proposerCoverError)
        
        if(this.state.proposerCoverError){
            this.props.loadingStop();
            actions.setSubmitting(false);
            swal("cover duration for all family member must be same as Propser/primary insured")
        } else if(this.state.proposercashlimitCoverError){
            this.props.loadingStop();
            actions.setSubmitting(false);
            swal("Cash limit of dependent cannot be more than cash limit of propser/primary insured")
        }else{
            axios
            .post(`daily-cash/insured-member-details`, formData)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decryptResp--------- ", decryptResp)
            // if(res.data.completedStep == 4){
                    this.props.loadingStop();
                    if(decryptResp.error)
                    {
                        actions.setSubmitting(false);
                        swal(decryptResp.msg)
                    }
                    else
                    {
                        this.props.history.push(`/dailycash_FullQuote/${productId}`);
                    }
                
            // }        
            })
            .catch(err => {
                let decryptResp = JSON.parse(encryption.decrypt(err.data))
                console.log("decrypt---Err---", decryptResp)
                if(err.status == 401) {
                    swal("Session out. Please login")
                }
                else swal("Something wrong happened. Please try after some")
                actions.setSubmitting(false);
            this.props.loadingStop();
            });
        }
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

    initFamilyDetailsList = familyDetails => {
		if (familyDetails.length > 0) {
			return familyDetails.map(resource => ({
				fname: resource.first_name ? resource.first_name:'',
				lname: resource.last_name ? resource.last_name:'',
				cashlimit: resource.cash_limit ? resource.cash_limit:'',
                coverduration: resource.cover_duration ? resource.cover_duration:'',
                education_id: resource.education_id ? resource.education_id:'',
                height: resource.height ? resource.height:'',
                weight: resource.weight ? resource.weight:'',
				dob: resource.dob,
                gender: resource.gender ?  resource.gender:'',
                looking_for: resource.relation_with,
                family_member_id: resource.id,
                pancard_no:resource.pancard_no,
                salutation_id: resource.salutation_id,
			}));
		} else {
			return [initialFamilyDetails];
		}
    };

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

    fetchSalutation=(pincode_Details)=>{

        const formData = new FormData();
        this.props.loadingStart();
        formData.append('policy_for_flag', 1)
        axios.post('salutation-list', formData)
        .then(res=>{
            let titleList = res.data.data.salutationlist ? res.data.data.salutationlist : []                        
            this.setState({
                titleList
            });
            this.props.loadingStop();
            this.fetchPrevAreaDetails(pincode_Details)
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                titleList: []
            });
        })
    
    }

    toCamelCase = (str) => {
        let stringLength = str.length
        let subString = str.substring(1, stringLength)
        let firstString = str.substring(0, 1)
        firstString = firstString.toUpperCase()
        let formatVal = firstString+subString
        return formatVal
    }
 
    
    render() {
        const {educationList,policy_holder,familyMembers,is_eia_account2, tpaInsurance, addressDetails,is_eia_account,selfFlag,pinDataArr,stateName,showEIA,showEIA2, pincode_Details, netPremiumCheck, titleList} = this.state    
		
		 let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null

        let newInitialValues = Object.assign(initialValues, {
            proposerAsInsured: sessionStorage.getItem('proposed_insured') ? sessionStorage.getItem('proposed_insured') : (selfFlag ? 1:0),
            family_members:this.initFamilyDetailsList(
                familyMembers
            ),
            panNo: sessionStorage.getItem('pan_data') ? sessionStorage.getItem('pan_data') : "",
            phoneNo: addressDetails && addressDetails.phoneNo ? addressDetails.phoneNo: "",
            email: sessionStorage.getItem('email_data') ? sessionStorage.getItem('email_data') : "",
            address1: addressDetails && addressDetails.address1 ? addressDetails.address1: "",
            address2: addressDetails && addressDetails.address2 ? addressDetails.address2:  "",
            address3: addressDetails && addressDetails.address3 ? addressDetails.address3: "",
            pincode: addressDetails && addressDetails.pincode ? addressDetails.pincode: "",
            pincode_id: pincode_Details && pincode_Details.id ? pincode_Details.id : "",
            state: addressDetails && addressDetails.state ? addressDetails.state:"",
            eIA: is_eia_account,
            eia_account_no : policy_holder && policy_holder.eia_no ?  policy_holder.eia_no : '',

            proposerName : policy_holder && policy_holder.first_name ?  policy_holder.first_name : '',
            proposerLastName : policy_holder && policy_holder.last_name ?  policy_holder.last_name : '',
            proposercashlimit : policy_holder && policy_holder.cash_limit ?  policy_holder.cash_limit : '',
            proposercoverduration : policy_holder && policy_holder.cover_duration ?  policy_holder.cover_duration : '',
            height : policy_holder && policy_holder.height ?  policy_holder.height : '',
            weight : policy_holder && policy_holder.weight ?  policy_holder.weight : '',
            proposereducation_id : policy_holder && policy_holder.education_id ?  policy_holder.education_id : '',
            proposerDob : policy_holder && policy_holder.dob ?  new Date(policy_holder.dob) : '',
            proposerGender : policy_holder && policy_holder.gender ?  policy_holder.gender : '',
            netPremiumCheckCount: netPremiumCheck > 100000 ? 1 : 0,
			is_eia_account2:  is_eia_account2,
			
			tpaInsurance: policy_holder && policy_holder.T_Insurance_Repository_id ? policy_holder.T_Insurance_Repository_id : "",
        });
        

        const {productId} = this.props.match.params
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
							
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox arogyaa_address">
                                <h4 className="text-center mt-3 mb-3">Hospital Daily Cash Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">

                                    <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} 
                                    validationSchema={validateAddress}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {                                    
                                   console.log("values",values)
                                   console.log("error",errors)
                                   return (
                                    <Form>
                                        <div className="d-flex flex-column flex-sm-column flex-md-column flex-lg-row justify-content-left m-b-15">
                                        <div className="proposr prsres m-r-60"><p>Is the Proposer same as insured</p></div>
                                            <div className="d-inline-flex">
                                                <div className="p-r-25">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='proposerAsInsured'                                            
                                                        value='1'
                                                        key='0'  
                                                        onChange={(e) => {
                                                            setFieldValue(`proposerAsInsured`, e.target.value);
                                                        }}
                                                        checked={values.proposerAsInsured == '1' ? true : false}
                                                        disabled={true}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='proposerAsInsured'                                            
                                                        value='0'
                                                        key='0'  
                                                        onChange={(e) => {
                                                            setFieldValue(`proposerAsInsured`, e.target.value);
                                                        }}
                                                        checked={values.proposerAsInsured == '0' ? true : false}
                                                        disabled={true}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">No</span>
                                                        {errors.proposerAsInsured && touched.proposerAsInsured ? (
                                                        <span className="errorMsg">{errors.proposerAsInsured}</span>
                                                    ) : null}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <Row>
                                        <Col sm={12} md={12} lg={9}>
                                        <>
                                        {newInitialValues.proposerAsInsured == '0' ? 
                                       
                                        <div>
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Proposer Details</h4>
                                        </div>
                                        <div className="d-flex justify-content-left prsnlinfo">
                                            <div className="W12">
                                                Proposer
                                                <Field
                                                    name="name"
                                                    type="hidden"
                                                    value={values.name}
                                                />
                                                <Field
                                                    name="name"
                                                    type="hidden"
                                                    value={values.name}
                                                />
                                            </div>
                                            <Row>
                                            <Col sm={12} md={6} lg={3}>
                                                <FormGroup>
                                                    <div className="insurerName">
                                                        <Field
                                                            name="proposerName"
                                                            type="text"
                                                            placeholder="First Name"
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value = {values.proposerName}
                                                        />
                                                            {errors.proposerName && touched.proposerName ? (
                                                        <span className="errorMsg">{errors.proposerName}</span>
                                                        ) : null}
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={12} md={6} lg={3}>
                                                <FormGroup>
                                                    <div className="insurerName">
                                                        <Field
                                                            name="proposerLastName"
                                                            type="text"
                                                            placeholder="Last Name"
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value = {values.proposerLastName}
                                                        />
                                                            {errors.proposerLastName && touched.proposerLastName ? (
                                                        <span className="errorMsg">{errors.proposerLastName}</span>
                                                        ) : null}
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={12} md={6} lg={3}>
                                                <FormGroup>
                                                    <DatePicker
                                                        name="proposerDob"
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="DOB"
                                                        peekPreviousMonth
                                                        peekPreviousYear
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                        maxDate={new Date(maxDobAdult)}
                                                        minDate={new Date(minDobAdult)}
                                                        className="datePckr"
                                                        selected={values.proposerDob }
                                                        onChange={(val) => {
                                                            setFieldTouched("proposerDob");
                                                            setFieldValue("proposerDob", val);
                                                            }}
                                                            
                                                        //selected={moment(values.family_members[index].dob).format("dd MMM yyyy")}
                                                        
                                                    />
                                                    {errors.proposerDob && touched.proposerDob ? (
                                                        <span className="errorMsg">{errors.proposerDob}</span>
                                                    ) : null}  
                                                </FormGroup>
                                            </Col>
                                            <Col sm={12} md={6} lg={3}>
                                                <FormGroup>
                                                    <div className="formSection">
                                                        <Field
                                                            name="proposerGender"
                                                            component="select"
                                                            autoComplete="off"                                                                        
                                                            className="formGrp"
                                                        >
                                                        <option value="">Select gender</option>
                                                            <option value="m">Male</option>
                                                            <option value="f">Female</option>
                                                        </Field>     
                                                        {errors.proposerGender && touched.proposerGender ? (
                                                        <span className="errorMsg">{errors.proposerGender}</span>
                                                    ) : null}                   
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                            </Row>   
                                        </div>
                                        </div>
                                         : null
                                        } 
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Tell us more about the Insured Members</h4>
                                        </div>
                                                        
                                        
                                            <FieldArray
                                                name="family_members"
                                                render={arrayHelpers => (
                                                <div>
                                            {familyMembers && familyMembers.length>0 && familyMembers.map((resource,index)=> 
                                                    <div className="d-flex justify-content-left prsnlinfo" key={index}>
                                                        <div className="W12" >
                                                            <strong>
                                                            {resource.relation_with == "motherInLaw" ? "Mother In Law" : resource.relation_with == "fatherInLaw" ? "Father In Law" : this.toCamelCase(resource.relation_with)}
                                                            </strong>
                                                            <Row></Row>
                                                            <Field
                                                                name={`family_members.${index}.family_member_id`}
                                                                type="hidden"
                                                                value={values.family_members[index].family_member_id}
                                                            />
                                                            <Field
                                                                name={`family_members.${index}.looking_for`}
                                                                type="hidden"
                                                                value={values.family_members[index].looking_for}
                                                            />
                                                        </div> &nbsp;&nbsp;
                                                        <Row>
                                                        {/* <Col sm={12} md={3} lg={3}>  
                                                         <FormGroup>                      
                                                            <div className="formSection">
                                                                    <Field
                                                                        name='salutation_id'
                                                                        type="text"
                                                                        component="select"
                                                                        autoComplete="off"            
                                                                        className="formGrp"
                                                                    >
                                                                        <option value="">Title</option>
                                                                        {titleList.map((title, qIndex) => ( 
                                                                        <option value={title.id}>{title.displayvalue}</option>
                                                                        ))}
                                                                    </Field>     
                                                                    {errors.salutation_id && touched.salutation_id ? (
                                                                    <span className="errorMsg">{errors.salutation_id}</span>
                                                                    ) : null}               
                                                                </div>
                                                             </FormGroup>                               
                                                            </Col> */}
                                                        <Col sm={12} md={6} lg={3}>
                                                            <FormGroup>
                                                                <div className="insurerName">
                                                                    <Field
                                                                        name={`family_members.${index}.fname`}
                                                                        type="text"
                                                                        placeholder="First Name"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value = {values.family_members[index].fname}
                                                                    />
                                                                     {errors.family_members && errors.family_members[index] && errors.family_members[index].fname ? (
                                                                    <span className="errorMsg">{errors.family_members[index].fname}</span>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={6} lg={3}>
                                                            <FormGroup>
                                                                <div className="insurerName">
                                                                    <Field
                                                                        name={`family_members.${index}.lname`}
                                                                        type="text"
                                                                        placeholder="Last Name"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value = {values.family_members[index].lname}
                                                                    />
                                                                     {errors.family_members && errors.family_members[index] && errors.family_members[index].lname ? (
                                                                    <span className="errorMsg">{errors.family_members[index].lname}</span>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                
                                                        <Col sm={12} md={6} lg={3}>
                                                            <FormGroup>
                                                                <DatePicker
                                                                    name={`family_members.${index}.dob`}
                                                                    dateFormat="dd MMM yyyy"
                                                                    placeholderText="DOB"
                                                                    peekPreviousMonth
                                                                    peekPreviousYear
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dropdownMode="select"
                                                                    maxDate={new Date(maxDobAdult)}
                                                                    minDate={new Date(minDobAdult)}
                                                                    className="datePckr"
                                                                    disabled = {true}
                                                                    selected={values.family_members[index].dob ? new Date(values.family_members[index].dob):new Date()}
                                                                    onChange={(val) => {
                                                                        setFieldTouched(`family_members.${index}.dob`);
                                                                        setFieldValue(`family_members.${index}.dob`, val);
                                                                      }}
                                                                      
                                                                    //selected={moment(values.family_members[index].dob).format("dd MMM yyyy")}
                                                                    
                                                                />
                                                                {errors.family_members && errors.family_members[index] && errors.family_members[index].dob ? (
                                                                    <span className="errorMsg">{errors.family_members[index].dob}</span>
                                                                ) : null}  
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={6} lg={3}>
                                                            <FormGroup>
                                                                <div className="formSection">
                                                                    <Field
                                                                        name={`family_members.${index}.gender`}
                                                                        component="select"
                                                                        autoComplete="off"                                                                        
                                                                        className="formGrp"
                                                                        disabled = {true}
                                                                    >
                                                                    <option value="">Select gender</option>
                                                                        <option value="m">Male</option>
                                                                        <option value="f">Female</option>
                                                                    </Field>     
                                                                    {errors.family_members && errors.family_members[index] && errors.family_members[index].gender ? (
                                                                    <span className="errorMsg">{errors.family_members[index].gender}</span>
                                                                ) : null}                   
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={6} lg={3}>
                                                            <FormGroup>
                                                                <div className="insurerName">
                                                                    <Field
                                                                        name={`family_members.${index}.height`}
                                                                        type="text"
                                                                        placeholder="Height(CM)"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value = {values.family_members[index].height}
                                                                    />
                                                                     {errors.family_members && errors.family_members[index] && errors.family_members[index].height ? (
                                                                    <span className="errorMsg">{errors.family_members[index].height}</span>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={6} lg={3}>
                                                            <FormGroup>
                                                                <div className="insurerName">
                                                                    <Field
                                                                        name={`family_members.${index}.weight`}
                                                                        type="text"
                                                                        placeholder="Weight(KG)"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value = {values.family_members[index].weight}
                                                                    />
                                                                     {errors.family_members && errors.family_members[index] && errors.family_members[index].weight ? (
                                                                    <span className="errorMsg">{errors.family_members[index].weight}</span>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={6} lg={3}>
                                                            <FormGroup>
                                                                <div className="formSection">
                                                                    <Field
                                                                        name={`family_members.${index}.cashlimit`}
                                                                        component="select"
                                                                        autoComplete="off"                                                                        
                                                                        className="formGrp"
                                                                        onChange={(e) => {
                                                                            if(resource.relation_with=='self')
                                                                            {
                                                                                setFieldValue(`proposercashlimit`, e.target.value);
                                                                                this.setState({proposercashlimit : e.target.value})
                                                                                
                                                                            }
                                                                            
                                                                            setFieldValue(`family_members.${index}.cashlimit`, e.target.value);
                            
                                                                        }}
                                                                    >
                                                                    <option value="">Cash Limit/Day</option>
                                                                        <option value="1">500</option>
                                                                        <option value="2">1000</option>
                                                                        <option value="3">1500</option>
                                                                        <option value="4">2000</option>
                                                                    </Field>     
                                                                    {errors.family_members && errors.family_members[index] && errors.family_members[index].cashlimit ? (
                                                                    <span className="errorMsg">{errors.family_members[index].cashlimit}</span>
                                                                ) : null}                   
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        
                                                        <Col sm={12} md={6} lg={3}>
                                                            <FormGroup>
                                                                <div className="formSection">
                                                                    <Field
                                                                        name={`family_members.${index}.coverduration`}
                                                                        component="select"
                                                                        autoComplete="off"                                                                        
                                                                        className="formGrp"
                                                                        onChange={(e) => {
                                                                            if(resource.relation_with=='self')
                                                                            {
                                                                                setFieldValue(`proposercoverduration`, e.target.value);
                                                                                this.setState({proposercoverduration : e.target.value})
                                                                            }
                                                                            
                                                                            setFieldValue(`family_members.${index}.coverduration`, e.target.value);
                            
                                                                        }}
                                
                                                                    >
                                                                    <option value="">Cover Duration</option>
                                                                        <option value="1">30 Days</option>
                                                                        <option value="2">60 Days</option>
                                                
                                                                    </Field>     
                                                                    {errors.family_members && errors.family_members[index] && errors.family_members[index].coverduration ? (
                                                                    <span className="errorMsg">{errors.family_members[index].coverduration}</span>
                                                                ) : null}                   
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={6} lg={3}>
                                                            <FormGroup>
                                                                <div className="formSection">
                                                                    <Field
                                                                        name={`family_members.${index}.education_id`}
                                                                        component="select"
                                                                        autoComplete="off"                                                                        
                                                                        className="formGrp"
                                                                        onChange={(e) => {
                                                    
                                                                            setFieldValue(`family_members.${index}.education_id`, e.target.value);
                            
                                                                        }}
                                
                                                                    >
                                                                    <option value="">Education</option>    
                                                                    {educationList && educationList.map((education, qIndex) => (
                                                                        <option value={education.id} key={qIndex}>{education.descriptions}</option>

                                                                    ))}   
                                                                    
                                                
                                                                    </Field>     
                                                                    {errors.family_members && errors.family_members[index] && errors.family_members[index].education_id ? (
                                                                    <span className="errorMsg">{errors.family_members[index].education_id}</span>
                                                                ) : null}                   
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        </Row>   
                                                    </div>
                                                    )}                                                
                                                    </div>
                                                )}/>
                                                </>
                                                <Row className="m-b-25">
                                                    <Col sm={12} md={4} lg={4}>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="panNo"
                                                                type="text"
                                                                placeholder="PAN NO"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.panNo.toUpperCase()}
                                                                onChange= {(e)=> 
                                                                setFieldValue('panNo', e.target.value.toUpperCase())
                                                                }
                                                            />
                                                            {errors.panNo && touched.panNo ? (
                                                            <span className="errorMsg">{errors.panNo}</span>
                                                            ) : null}                                        
                                                        </div>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="phoneNo"
                                                                type="text"
                                                                placeholder="PHONE NO"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.phoneNo}
                                                            />
                                                            {errors.phoneNo && touched.phoneNo ? (
                                                            <span className="errorMsg">{errors.phoneNo}</span>
                                                            ) : null}  
                                                        </div>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <div className="insurerName">
                                                        <Field
                                                            name="email"
                                                            type="text"
                                                            placeholder="EMAIL"
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value={values.email}
                                                        />
                                                        {errors.email && touched.email ? (
                                                        <span className="errorMsg">{errors.email}</span>
                                                        ) : null}  
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex justify-content-left carloan">
                                                    <h4> Communication Address</h4>
                                                </div>

                                                <Row className="m-b-45">
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="address1"
                                                                    type="text"
                                                                    placeholder="Plot / Flat No."
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.address1}
                                                                    onChange= {(e)=> 
                                                                    setFieldValue('address1', e.target.value)
                                                                    }
                                                                    
                                                                />
                                                                {errors.address1 && touched.address1 ? (
                                                                <span className="errorMsg">{errors.address1}</span>
                                                                ) : null}                                                             
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="address2"
                                                                    type="text"
                                                                    placeholder="Building Name / Number"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.address2}
                                                                    onChange= {(e)=> 
                                                                    setFieldValue('address2', e.target.value)
                                                                    }
                                                                />
                                                                {errors.address2 && touched.address2 ? (
                                                                <span className="errorMsg">{errors.address2}</span>
                                                                ) : null}       
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="address3"
                                                                    type="text"
                                                                    placeholder="Street Name"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.address3}
                                                                    onChange= {(e)=> 
                                                                    setFieldValue('address3', e.target.value)
                                                                    }
                                                                />
                                                                {errors.address3 && touched.address3 ? (
                                                                <span className="errorMsg">{errors.address3}</span>
                                                                ) : null}       
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="pincode"
                                                                    type="number"
                                                                    placeholder="Pincode"
                                                                    autoComplete="off"
                                                                    maxlength = "6"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    onKeyUp={e=> this.fetchAreadetails(e)}
                                                                    value={values.pincode}
                                                                    onInput= {(e)=> {
                                                                        setFieldTouched("state");
                                                                        setFieldTouched("pincode");
                                                                        setFieldValue("pincode", e.target.value);
                                                                        setFieldValue("state", stateName ? stateName[0] : values.state);
                                                                        setFieldValue("pincode_id", "");
                                                                    }}
                                                                />
                                                                {errors.pincode && touched.pincode ? (
                                                                <span className="errorMsg">{errors.pincode}</span>
                                                                ) : null}                                                   
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                        <div className="formSection">
                                                                <Field
                                                                    name="pincode_id"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.pincode_id}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Select Area</option>
                                                                {pinDataArr && pinDataArr.map((resource,rindex)=>
                                                                    <option value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                                )}
                                                                    
                                                                    {/*<option value="area2">Area 2</option>*/}
                                                                </Field>     
                                                                {errors.pincode_id && touched.pincode_id ? (
                                                                    <span className="errorMsg">{errors.pincode_id}</span>
                                                                ) : null}     
                                                                </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="state"
                                                                    type="text"
                                                                    placeholder="State"
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
                                                </Row>            

                                                <div className="d-flex flex-column flex-sm-column flex-md-column flex-lg-row justify-content-left m-b-40">
                                                
                                            <div className="proposr prsres m-r-60"><p>Do you have an eIA number? 
                                            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" /></a>
                                            </OverlayTrigger></p>
                            
                              
                                                </div>
                                            <div className="d-inline-flex">
                                                <div className="p-r-25">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='eIA'                                            
                                                        value='1'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`eIA`, e.target.value);
                                                            this.showEIAText(1);
                                                        }}
                                                        checked={values.eIA == '1' ? true : false}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='eIA'                                            
                                                        value='0'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`eIA`, e.target.value);
                                                            this.showEIAText(0);
                                                        }}
                                                        checked={values.eIA == '0' ? true : false}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">No</span>
                                                        {errors.eIA && touched.eIA ? (
                                                        <span className="errorMsg">{errors.eIA}</span>
                                                    ) : null}
                                                    </label>
                                                </div>
                                            </div>
                                            
                                        
                                        </div>

                                       {showEIA || is_eia_account == 1 ?                         
                                        <div className="d-flex justify-content-left align-items-center m-b-40">
                                                
                                            <div className="proposr m-r-60"><p>EIA Number
                                            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" /></a>
                                            </OverlayTrigger></p>
                            
                              
                                                </div>
                                            <div className="d-inline-flex">
                                            <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="eia_account_no"
                                                                    type="text"
                                                                    placeholder="EIA NUMBER"
                                                                    autoComplete="off"
                                                                    value = {values.eia_account_no}
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                />
                                                                  {errors.eia_account_no && touched.eia_account_no ? (
                                                        <span className="errorMsg">{errors.eia_account_no}</span>
                                                    ) : null}                                             
                                                            </div>
                                                        </FormGroup>
                                            </div>
                                            
                                        
                                        </div>:''}
										
										
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
                                        <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.sumInsured.bind(this, productId )}>
                                            {isSubmitting ? 'Wait..' : 'Back'}
                                        </Button> 
                                        <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                            {isSubmitting ? 'Wait..' : 'Continue'}
                                        </Button> 
                                            
                                        </div>
                                        </Col>                                       
                                            <Col sm={12} md={12} lg={3}>
                                                <div className="regisBox">
                                                    <h3 className="medihead">123 Operating Branches and Satellite Presence in 350+ locations </h3>
                                                </div>
                                            </Col>
                                        </Row>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(dailycash_Address));