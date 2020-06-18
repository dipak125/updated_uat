import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import moment from "moment";
import * as Yup from 'yup';
import swal from 'sweetalert';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import dateformat from "dateformat";
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";
import Encryption from '../../shared/payload-encryption';

const minDobAdult = moment(moment().subtract(46, 'years').calendar()).add(1, 'day').calendar()
const maxDobAdult = moment().subtract(18, 'years').calendar();

const minDobChild = moment(moment().subtract(26, 'years').calendar()).add(1, 'day').calendar()
const maxDobChild = moment().subtract(3, 'months').calendar();

const initialValues = {
    self: 0,
    selfDob: "",
    spouse: 0,
    spouseDob: "",
    child1: 0,
    child1Dob: "",
    child1Gender: "",
    father: 0,
    fatherDob: "",
    mother: 0,
    motherDob: "",
    fatherInLaw: 0,
    fatherInLawDob: "",
    motherInLaw: 0,
    motherInLawDob: "",
    gender: "",
    insureList: ""

}



const vehicleInspectionValidation = Yup.object().shape({
    gender: Yup.string().required('Please select gender'),
   
   
});

const validateFamilyMembers  = Yup.object().shape({
    //check_input : Yup.string().required('Please select an options'),
    looking_for_1 : Yup.string(),
    looking_for_5 : Yup.string(),
    looking_for_0: Yup.string().when(['looking_for_2'], {
        is: looking_for_2 => looking_for_2 == 'child1',       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_3'], {
        is: looking_for_3 => looking_for_3 == 'child2',       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_4'], {
        is: looking_for_4 => looking_for_4 == 'child3',       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_1','looking_for_5'], {
        is: (looking_for_1,looking_for_5) => (looking_for_1 == 'spouse' && looking_for_5 == 'father'),       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_1','looking_for_6'], {
        is: (looking_for_1,looking_for_6) => (looking_for_1 == 'spouse' && looking_for_6 == 'mother'),       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_1','looking_for_7'], {
        is: (looking_for_1,looking_for_7) => (looking_for_1 == 'spouse' && looking_for_7 == 'fatherInLaw'),       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_1','looking_for_8'], {
        is: (looking_for_1,looking_for_8) => (looking_for_1 == 'spouse' && looking_for_8 == 'motherInLaw'),       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_5','looking_for_6'], {
        is: (looking_for_5,looking_for_6) => (looking_for_5 == 'father' && looking_for_6 == 'mother'),       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_5','looking_for_7'], {
        is: (looking_for_5,looking_for_7) => (looking_for_5 == 'father' && looking_for_7 == 'fatherInLaw'),       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_5','looking_for_8'], {
        is: (looking_for_5,looking_for_8) => (looking_for_5 == 'father' && looking_for_8 == 'motherInLaw'),       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_6','looking_for_7'], {
        is: (looking_for_6,looking_for_7) => (looking_for_6 == 'mother' && looking_for_7 == 'fatherInLaw'),       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_6','looking_for_8'], {
        is: (looking_for_6,looking_for_8) => (looking_for_6 == 'mother' && looking_for_8 == 'motherInLaw'),       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_7','looking_for_8'], {
        is: (looking_for_7,looking_for_8) => (looking_for_7 == 'fatherInLaw' && looking_for_8 == 'motherInLaw'),       
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }),
    
    dob_0: Yup.string().when(['looking_for_0'], {
      is: looking_for_0 => looking_for_0 == 'self',
      then: Yup.string().required('Self DOB field is required')
    .test(
        "18YearsChecking",
        function() {
            return "Age should be minimum 18 and maximum 45 years"
        },
        function (value) {
            if (value) {
                const ageObj = new PersonAge();
                return ageObj.whatIsMyAge(value) < 46 && ageObj.whatIsMyAge(value) >= 18 ;
            }
            return true;
        }
    ).nullable(),
      othewise: Yup.string()
    }),
    dob_1: Yup.string().when(['looking_for_1'], {
        is: looking_for_1 => looking_for_1 == 'spouse',
        then: Yup.string().required('Spouse DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age should be minimum 18 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) < 46 && ageObj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),
    dob_2: Yup.string().when(['looking_for_2'], {
        is: looking_for_2 => looking_for_2 == 'child1',
        then: Yup.string().required('Child 1 DOB field is required').test(
            "3monthsChecking",
            function() {
                return "Age should be minimum 3 months and maximum 25 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) < 26 && ageObj.whatIsMyAgeMonth(value) >=3 ;
                }
                return true;
            }
        ),
        
        othewise: Yup.string()
    }),
    child1Gender: Yup.string().when(['looking_for_2'], {
        is: looking_for_2 => looking_for_2 == 'child1',
        then: Yup.string().required('Child 1 Gender field is required'),
        othewise: Yup.string()
    }).nullable(),

    dob_3: Yup.string().when(['looking_for_3'], {
        is: looking_for_3 => looking_for_3 == 'child2',
        then: Yup.string().required('Child 2 DOB field is required').test(
            "3monthsChecking",
            function() {
                return "Age should be minimum 3 months and maximum 25 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) < 26 && ageObj.whatIsMyAgeMonth(value) >=3;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),
    child2Gender: Yup.string().when(['looking_for_3'], {
        is: looking_for_3 => looking_for_3 == 'child2',
        then: Yup.string().required('Child 2 Gender field is required'),
        othewise: Yup.string()
    }).nullable(),

    dob_4: Yup.string().when(['looking_for_4'], {
        is: looking_for_4 => looking_for_4 == 'child3',
        then: Yup.string().required('Child 3 DOB field is required').test(
            "3monthsChecking",
            function() {
                return "Age should be minimum 3 months and maximum 25 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) < 26 && ageObj.whatIsMyAgeMonth(value) >=3 ;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),
    child3Gender: Yup.string().when(['looking_for_4'], {
        is: looking_for_4 => looking_for_4 == 'child3',
        then: Yup.string().required('Child 3 Gender field is required'),
        othewise: Yup.string()
    }).nullable(),
    
    dob_5: Yup.string().when(['looking_for_5'], {
        is: looking_for_5 => looking_for_5 == 'father',
        then: Yup.string().required('Father DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age should be minimum 18 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) < 46 && ageObj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),

    dob_6: Yup.string().when(['looking_for_6'], {
        is: looking_for_6 => looking_for_6 == 'mother',
        then: Yup.string().required('Mother DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age should be minimum 18 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) < 46 && ageObj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),

    dob_7: Yup.string().when(['looking_for_7'], {
        is: looking_for_7 => looking_for_7 == 'fatherInLaw',
        then: Yup.string().required('Father-In-Law DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age should be minimum 18 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) < 46 && ageObj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),
    dob_8: Yup.string().when(['looking_for_8'], {
        is: looking_for_8 => looking_for_8 == 'motherInLaw',
        then: Yup.string().required('Mother-In-Law DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age should be minimum 18 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) < 46 && ageObj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ),
        othewise: Yup.string()
    }),
    
    
})

function checkSelfData(str)
{
    let error;

    let looking_for = document.getelementsbyname("looking_for_1").value

    console.log("Looking for===-==============>",looking_for)
    return 'sssss'
   
}

const newInitialValues = {}

class InformationYourself extends Component {
    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            insureList: "",
            lookingFor:[],
            dob:[],
            gender: "",
            validateCheck:0,
            familyMembers:[],
            addressDetails:{},
            is_eia_account:'',
            display_dob:[],
            display_looking_for:[],
            relationList:[],
            display_gender:[],
            gender_for:[]
        };
    }


    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }


    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    handleChangeSubmit = (value) => {
        this.setState({
            gender: value
        });
    }

    handleFormSubmit = (values) => {
        const {productId} = this.props.match.params
        const formData = new FormData();
       // let gender = values.gender
    // console.log("gender=========>",gender);
   // formData.append(`gender`, gender);
    let lookingFor = this.state.lookingFor ;
    console.log("lookingFor=========>",lookingFor);
    let dob = this.state.dob ;
    console.log("dob=========>",dob);
    let familyMembers = this.state.familyMembers;
    let post_data = []
    let menumaster_id = 2;
    console.log("menumaster_id=========>",menumaster_id);
    post_data['menumaster_id'] = menumaster_id
    //formData.append(`menumaster_id`, menumaster_id);  
    post_data['proposer_gender'] = values.gender    
    //formData.append(`proposer_gender`, values.gender);  
    
    let arr_date=[]
    for(let i=0;i<dob.length;i++){        
        let date_of_birth= dob[i] ? dob[i] : familyMembers[i].dob;    
       // formData.append(`dob[${i}]`, date_of_birth);
      // post_data[`dob[${i}]`] = date_of_birth  
      arr_date.push(date_of_birth)
      
    }  
    post_data['dob'] = arr_date
    let is_self_select = false;
    arr_date=[]
    for(let i=0;i<lookingFor.length;i++){        
            
            let looking_for = lookingFor[i] ? lookingFor[i] : familyMembers[i].relation_with; 
            is_self_select =  looking_for == 'self' ? true:false   
            arr_date.push(looking_for)
             //= arr_date[i]
          //  post_data[`looking_for[${i}]`] = looking_for  
           // formData.append(`looking_for[${i}]`, looking_for);                
    }  
    post_data['looking_for'] = arr_date
    let policyHolder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') :0
    
    let gender_for = this.state.gender_for

    console.log("WWWWW+======>>>>>>",gender_for)
    arr_date=[]
    for(let i=0;i<gender_for.length;i++){
        let gender_val;
        gender_val = gender_for[i] ? gender_for[i] : familyMembers[i].gender; 
        arr_date.push(gender_val); 
        
       // post_data[`gender[${i}]`] = gender_val         
       // post_data[`gender[${i}]`] = gender_val                
       // formData.append(`gender[${i}]`, gender_val);
    } 
    post_data['gender'] = arr_date
    

    let encryption = new Encryption();
    let post_data_obj = {}





    if(policyHolder_id > 0){
        post_data['policy_holder_id'] = policyHolder_id
        Object.assign(post_data_obj, post_data); // {0:"a", 1:"b", 2:"c"}
        console.log("POST DATA=============>>",post_data_obj)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
        //let vvv = encryption.encrypt(JSON.stringify(target))        
        this.props.loadingStart();
        axios
        .post(`/update-yourself`, formData)
        .then(res => {
            localStorage.setItem('policyHolder_id', res.data.data.policyHolder_id);
            localStorage.setItem('policyHolder_refNo', res.data.data.policyHolder_refNo);
            localStorage.setItem('display_gender', JSON.stringify(this.state.display_gender));
            this.props.loadingStop();
            this.props.history.push(`/MedicalDetails/${productId}`);
        })
        .catch(err => {
        console.log('Errors==============>',err.data);
        if(err && err.data){
            swal('Family Member fields are required...');
        }
        this.props.loadingStop();
        });
    }
    else{
        Object.assign(post_data_obj, post_data); // {0:"a", 1:"b", 2:"c"}
        console.log("POST DATA=============>>",post_data_obj)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

        this.props.loadingStart();
        axios
        .post(`/yourself`, formData)
        .then(res => {
            localStorage.setItem('policyHolder_id', res.data.data.policyHolder_id);
            localStorage.setItem('policyHolder_refNo', res.data.data.policyHolder_refNo);
            localStorage.setItem('display_gender', JSON.stringify(this.state.display_gender));
            this.props.loadingStop();
            this.props.history.push(`/MedicalDetails/${productId}`);
        })
        .catch(err => {
        console.log('Errors==============>',err.data);
        if(err && err.data){
            swal('Family Member fields are required...');
        }
        this.props.loadingStop();
        });
    }
    
       // this.props.history.push(`/MedicalDetails/${productId}`);
    }


    handleSubmitForm = (values, actions) => {
        var drv = []; 
        var display_looking_for = [];
        var display_dob = [];
        let display_gender = [];
        console.log("VALUES --------->",values);

        
       
            display_gender[0] = this.state.gender ? this.state.gender:null
            display_gender[1] = this.state.gender ? (this.state.gender == 'm') ?'f':'m' :null
            display_gender[2] = values.child1Gender ? values.child1Gender :null
            display_gender[3] = values.child2Gender ? values.child2Gender :null
            display_gender[4] = values.child3Gender ? values.child3Gender :null
            display_gender[5] = this.state.gender ? 'm' : null
            display_gender[6] = this.state.gender ? 'f' : null
            display_gender[7] = this.state.gender ? 'm' : null
            display_gender[8] = this.state.gender ? 'f' : null
        
        


        //var check_input = values.check_input
        if(this.state.validateCheck == 1){
            for (const key in values) {
                if (values.hasOwnProperty(key)) {
                    if ( key.match(/looking_for/gi)){   
                      //  lastChar = key[key.length -1];                          
                        if(values[key] != '' )
                            drv.push(values[key]);
                    }    
                }
            }
            if(drv && drv.length>0){
                 this.setState({
                    insureList: drv.toString()
                })
            }    
    
            const {productId} = this.props.match.params
            const {gender} = this.state
            const formData = new FormData();
            let looking_for = []
            let gender_for = []
            let dob = []
            let i=[];
            let j=[];
            
            for (const key in values) {
                if (values.hasOwnProperty(key)) {
                    if ( key.match(/looking_for/gi)){                  
                        i = key.substr(12, 1);                                             
                        console.log("ASSSS1111======>", values[key]);
                        display_looking_for[i] = values[key] ? values[key] : '';                       
                        if(values[key]){
                            looking_for.push(values[key]);
                            gender_for.push(display_gender[i])    
                        }                           // formData.append(`looking_for[${i}]`, values[key]);
                    }

                   
                   
                    if ( key.match(/dob/gi)){                 
                        i = key.substr(4, 1);   
                        display_dob[i] = values[key] ? values[key] : '';    
                        if(values[key]) {
                            dob.push(moment(values[key]).format("YYYY-MM-DD"))
                        }
                        //formData.append(`dob[${i}]`, moment(values[key]).format("YYYY-MM-DD"));
                    }
                } 
            }

            
            sessionStorage.setItem('display_looking_for',JSON.stringify(display_looking_for));
            sessionStorage.setItem('display_dob',JSON.stringify(display_dob));
            this.setState({
                lookingFor:looking_for,
                display_looking_for,
                display_gender:display_gender,
                gender_for:gender_for
             });
             this.setState({
                dob:dob,
                display_dob
             });  
             this.handleClose()
        /*formData.append('menumaster_id', 2);
        formData.append('gender', gender);
        axios
            .post(`/yourself`, formData)
            .then(res => {
                localStorage.setItem('policyHolder_id', res.data.data.policyHolder_id);
                localStorage.setItem('policyHolder_refNo', res.data.data.policyHolder_refNo);
               
            })
            .catch(err => {
              
              this.props.loadingStop();
            });
            this.handleClose()*/
    }   
    else{
        swal('Please select at least one option');
        //this.handleClose()
    }
}
componentDidMount(){
    this.fetchData();
    this.fetchRelations();
}

fetchData=()=>{
    const {productId } = this.props.match.params
    let policyHolder_id = localStorage.getItem("policyHolder_id");
    this.props.loadingStart();
    axios.get(`policy-holder/${policyHolder_id}`)
        .then(res=>{
            //console.log("aaaaaabbbbbir========>",response.data.data.policyHolder.request_data.family_members)
            let family_members =  res.data.data.policyHolder && res.data.data.policyHolder.request_data && res.data.data.policyHolder.request_data.family_members ? res.data.data.policyHolder.request_data.family_members : []
            console.log("Family Members =======>",family_members)
            let addressDetails = JSON.parse(res.data.data.policyHolder.address)
            let is_eia_account = res.data.data.policyHolder.is_eia_account
            let gender = res.data.data.policyHolder.gender
            let validateCheck = family_members && family_members.length>0 ? 1:0;
            this.setState({ 
                familyMembers:family_members,
                addressDetails,
                is_eia_account,
                gender,
                validateCheck
            })
            this.setStateForPreviousData(family_members);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        this.props.loadingStop();
}

fetchRelations = () => {
    axios.get(`relations`)
    .then(res=>{
       // console.log("AAAAAAAAAAAA=====>",res.data.data)
        //let relationsData = res.data. 
        const relationList = res.data && res.data.data ? res.data.data : []
        this.setState({
            relationList            
        })
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
}


setValueData = () => {
    var checkBoxAll = document.getElementsByClassName('user-self');
   // console.log('OP===>',checkBoxAll)
    for(const a in checkBoxAll){
        if(checkBoxAll[a].checked){            
            return true
        }
    }
    return false
}

setStateForPreviousData=(family_members)=>{
    if (family_members.length > 0) {
        let looking_for = family_members.map(resource =>resource.relation_with);
        let gender_for = family_members.map(resource =>resource.gender);

        let dob = family_members.map(resource => moment(resource.dob).format("YYYY-MM-DD"));
        let insureList = looking_for.toString();

        const display_gender_storage =JSON.parse(localStorage.getItem('display_gender'));
        let display_gender = []
        if(display_gender_storage && display_gender_storage.length>0){
            for(let index = 0 ;index<9;index++)
                display_gender[index] = display_gender_storage ? display_gender_storage[index] :null                       
        }


        this.setState({
            insureList,
            lookingFor:looking_for,
            dob,
            gender_for,
            display_gender
         });
    } 
}

    getInsuredList=(family_members)=>{
        ///console.log("FAMILY======>",family_members);
        if (family_members.length > 0) {
			return family_members.map(resource => resource.relation_with);
		} else {
			return [];
		}
    }
    render() {
        const {memberInfo, insureList,validateCheck,gender,familyMembers,lookingFor,dob,display_looking_for,display_dob,display_gender} = this.state
        console.log("FAMILY11111==ddddddddddddddd=sssssss====>",gender);
        console.log("FAMILY22222======>",display_dob);
        const insureListPrev = this.getInsuredList(familyMembers);
        console.log("insureList =====",familyMembers);
        let display_looking_for_arr = display_looking_for  && display_looking_for.length >0 ? display_looking_for : (sessionStorage.getItem('display_looking_for') ? JSON.parse(sessionStorage.getItem('display_looking_for')) : []);
        let display_dob_arr = display_dob && display_dob.length >0 ? display_dob : (sessionStorage.getItem('display_dob') ? JSON.parse(sessionStorage.getItem('display_dob')) : []);
        let display_gender_arr = display_gender && display_gender.length > 0 ? display_gender : (localStorage.getItem('display_gender') ? JSON.parse(localStorage.getItem('display_gender')) : []);
        
        console.log("insureList Gender=====",display_gender_arr);

        const newInitialValues = Object.assign(initialValues, {
            check_input: validateCheck ? validateCheck :0,
            gender: gender ? gender : "",
            looking_for_0: display_looking_for_arr[0] ? display_looking_for_arr[0]:"",
            dob_0: display_dob_arr[0] ? new Date(display_dob_arr[0]) : "",
            looking_for_1: display_looking_for_arr[1] ? display_looking_for_arr[1] : "",
            dob_1: display_dob_arr[1] ? new Date(display_dob_arr[1]) : "",
            looking_for_2: display_looking_for_arr[2] ? display_looking_for_arr[2] : "",
            dob_2: display_dob_arr[2] ? new Date(display_dob_arr[2]) : "",
            child1Gender: display_gender_arr  ? display_gender_arr[2] : "",
            looking_for_3: display_looking_for_arr[3] ? display_looking_for_arr[3] : "",
            dob_3: display_dob_arr[3] ? new Date(display_dob_arr[3]) : "",
            child2Gender: display_gender_arr  ? display_gender_arr[3] : "",
            looking_for_4: display_looking_for_arr[4] ? display_looking_for_arr[4] : "",
            dob_4: display_dob_arr[4] ? new Date(display_dob_arr[4]) : "",
            child3Gender: display_gender_arr  ? display_gender_arr[4] : "",
            looking_for_5: display_looking_for_arr[5] ? display_looking_for_arr[5] : "",
            dob_5: display_dob_arr[5] ? new Date(display_dob_arr[5]) : "",
            looking_for_6: display_looking_for_arr[6] ? display_looking_for_arr[6] : "",
            dob_6: display_dob_arr[6] ? new Date(display_dob_arr[6]) : "",                        
            looking_for_7: display_looking_for_arr[7] ? display_looking_for_arr[7] : "",
            dob_7: display_dob_arr[7] ? new Date(display_dob_arr[7]) : "",
            looking_for_8: display_looking_for_arr[8] ? display_looking_for_arr[8] : "",
            dob_8: display_dob_arr[6] ? new Date(display_dob_arr[8]) : "",
            insureList: insureListPrev ? insureListPrev.toString()  : (insureList ? insureList :'')
        });
           

        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <h4 className="m-b-30">Help us with some information about yourself</h4>
                                        <Formik initialValues={newInitialValues} 
                                        onSubmit={this.handleFormSubmit} 
                                        validationSchema={vehicleInspectionValidation}>
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                        return (
                                        <Form>
                                        <div className="row formSection">
                                            <label className="col-md-4">Gender:</label>
                                            <div className="col-md-4">
                                            <Field
                                                name="gender"
                                                component="select"
                                                autoComplete="off"
                                                value={values.gender}
                                                className="formGrp"
                                                onChange={(e) => {
                                                    setFieldValue('gender', e.target.value);
                                                    this.setState({
                                                        gender:e.target.value
                                                    })
                                                   // this.handleChangeSubmit(e.target.value)
                                                }}
                                            >
                                            <option value="">Select gender</option>
                                                <option value="m">Male</option>
                                                <option value="f">Female</option>
                                            </Field>  
                                            {errors.gender && touched.gender ? (
                                                <span className="errorMsg">{errors.gender}</span>
                                            ) : null}    
                                            </div>
                                        </div>
                                        <div className="row formSection m-b-30">
                                            <label className="col-md-4">Looking to Insure: <br /><span className="small">(Add Family Members to be Insured)</span></label>
                                            <div className="d-flex col-md-4" onClick={this.handleShow} href={'#'}>
                                                <Field
                                                    name="insureList"
                                                    type="text"
                                                    placeholder="Select"
                                                    className="hght45"
                                                    autoComplete="off"
                                                    readonly="true"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value={insureList ? insureList : values.insureList}
                                                />                    
                                                <img src={require('../../assets/images/plus-sign.svg')} alt="" />
                                                <br/><br/>
                                                {errors.insureList && touched.insureList ? (
                                                    <span className="errorMsg">{errors.insureList}</span>
                                                ) : null} 
                                            </div>
                                        </div>
                                        <div className="cntrbtn">
                                        <Button className={`btnPrimary`} type="submit" >
                                            Go
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

                            <Modal className="customModal1" bsSize="md"
                                show={this.state.show}
                                onHide={this.handleClose}>

                                <Formik initialValues={newInitialValues} onSubmit={this.handleSubmitForm}
                                 validationSchema={validateFamilyMembers}
                                >
                                {({ values, errors, setFieldValue, setFieldTouched, isValid, isValidating ,isSubmitting, touched }) => {

                                return (
                                <Form>
                                    <div className="customModalfamlyForm">
                                        <div className="modal-header">
                                            <h4 className="modal-title">Add Family Members to be Insured</h4>
                                        </div>
                                        <Modal.Body>
                                           {/* <Field type="hidden" className="form-control" className="check_input" name="check_input" value = {validateCheck}
                                            validate={checkInputdata} 
                                            /> 
                                            {
                                                errors.check_input && touched.check_input ?                 
                                                <span className="error-message">{errors.check_input}</span>:''
                                            }*/}
                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Self
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_0"
                                                        value="self"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_0', e.target.value);     
                                                                                                                      
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_0', '');
                                                                setFieldValue("dob_0", '');
                                                                
                                                            }

                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }

                                                        }}
                                                    checked={values.looking_for_0 == 'self' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"> </span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <FormGroup>                                                  
                                                        <DatePicker
                                                            name="dob_0"
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date(maxDobAdult)}
                                                            minDate={new Date(minDobAdult)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value,e) => {
                                                                if (e && typeof e.preventDefault === 'function') {
                                                                    e.preventDefault();
                                                                 }
                                                                setFieldTouched("dob_0");
                                                                setFieldValue("dob_0", value);
                                                              }}
                                                            selected={values.dob_0}
                                                        />
                                                        <label className="formGrp error">
                                                        {
                                                            errors.dob_0 && touched.dob_0 ?                 
                                                            <span className="error-message">{errors.dob_0}</span>:''
                                                        }

                                                        {
                                                            errors.looking_for_0 && touched.looking_for_0 ?                 
                                                            <span className="error-message">{errors.looking_for_0}</span>:''
                                                        }
                                                        </label>
                                                        
                                                    </FormGroup>
                                                </div>
                                            </div>


                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Spouse
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_1"
                                                        value="spouse"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_1', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_1', '');
                                                                setFieldValue("dob_1", '');                                                                
                                                            }

                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }
                                                        }}
                                                        checked={values.looking_for_1 == 'spouse' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <FormGroup >
                                                        <DatePicker
                                                            name="dob_1"
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date(maxDobAdult)}
                                                            minDate={new Date(minDobAdult)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value,e) => {
                                                                if (e && typeof e.preventDefault === 'function') {
                                                                    e.preventDefault();
                                                                }
                                                                setFieldTouched("dob_1");
                                                                setFieldValue("dob_1", value);
                                                              }}
                                                            selected={values.dob_1}
                                                        />
                                                        <label className="formGrp error">
                                                        {
                                                            errors.dob_1 && touched.dob_1 ?                 
                                                            <span className="error-message">{errors.dob_1}</span>:''
                                                        }
                                                        </label>
                                                    </FormGroup>
                                                </div>
                                            </div>

                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Child 1
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_2"
                                                        value="child1"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_2', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_2', '');
                                                                setFieldValue("dob_2", '');
                                                                
                                                            }
                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }
                                                        }}
                                                        checked={values.looking_for_2 == 'child1' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <FormGroup >
                                                        <DatePicker
                                                            name="dob_2"
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date(maxDobChild)}
                                                            minDate={new Date(minDobChild)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value,e) => {
                                                                if (e && typeof e.preventDefault === 'function') {
                                                                    e.preventDefault();
                                                                }
                                                                setFieldTouched("dob_2");
                                                                setFieldValue("dob_2", value);
                                                              }}
                                                            selected={values.dob_2}
                                                        />
                                                        <label className="formGrp error">
                                                        {
                                                            errors.dob_2 && touched.dob_2 ?                 
                                                            <span className="error-message">{errors.dob_2}</span>:''
                                                        }
                                                        </label>
                                                    </FormGroup>
                                                </div>

                                                <div className="col-md-4 formSection">
                                                    <label className="formGrp">
                                                    <Field
                                                        name="child1Gender"
                                                        component="select"
                                                        autoComplete="off"
                                                        value={values.child1Gender}
                                                        className="formGrp"
                                                    >
                                                    <option value="">Select gender</option>
                                                        <option value="m">Male</option>
                                                        <option value="f">Female</option>
                                                    </Field>    
                                                    </label>
                                                    {
                                                            errors.child1Gender && touched.child1Gender ?                 
                                                            <span className="error-message">{errors.child1Gender}</span>:''
                                                    }
                                                </div>
                                            </div>

                                            {/*  Child 2 */}    
                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Child 2
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_3"
                                                        value="child2"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_3', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_3', '');
                                                                setFieldValue("dob_3", '');
                                                                
                                                            }
                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }
                                                        }}
                                                        checked={values.looking_for_3 == 'child2' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <FormGroup >
                                                        <DatePicker
                                                            name="dob_3"
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date(maxDobChild)}
                                                            minDate={new Date(minDobChild)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value,e) => {
                                                                if (e && typeof e.preventDefault === 'function') {
                                                                    e.preventDefault();
                                                                }
                                                                setFieldTouched("dob_3");
                                                                setFieldValue("dob_3", value);
                                                              }}
                                                            selected={values.dob_3}
                                                        />
                                                        <label className="formGrp error">
                                                        {
                                                            errors.dob_3 && touched.dob_3 ?                 
                                                            <span className="error-message">{errors.dob_3}</span>:''
                                                        }
                                                        </label>
                                                    </FormGroup>
                                                </div>

                                                <div className="col-md-4 formSection">
                                                    <label className="formGrp">
                                                    <Field
                                                        name="child2Gender"
                                                        component="select"
                                                        autoComplete="off"
                                                        value={values.child2Gender}
                                                        className="formGrp"
                                                    >
                                                    <option value="">Select gender</option>
                                                        <option value="m">Male</option>
                                                        <option value="f">Female</option>
                                                    </Field>    
                                                    </label>
                                                    {
                                                            errors.child2Gender && touched.child2Gender ?                 
                                                            <span className="error-message">{errors.child2Gender}</span>:''
                                                    }
                                                </div>
                                            </div>  

                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Child 3
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_4"
                                                        value="child3"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_4', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_4', '');
                                                                setFieldValue("dob_4", '');
                                                                
                                                            }
                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }
                                                        }}
                                                        checked={values.looking_for_4 == 'child3' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <FormGroup >
                                                        <DatePicker
                                                            name="dob_4"
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date(maxDobChild)}
                                                            minDate={new Date(minDobChild)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value,e) => {
                                                                if (e && typeof e.preventDefault === 'function') {
                                                                    e.preventDefault();
                                                                }
                                                                setFieldTouched("dob_4");
                                                                setFieldValue("dob_4", value);
                                                              }}
                                                            selected={values.dob_4}
                                                        />
                                                        <label className="formGrp error">
                                                        {
                                                            errors.dob_4 && touched.dob_4 ?                 
                                                            <span className="error-message">{errors.dob_4}</span>:''
                                                        }
                                                        </label>
                                                    </FormGroup>
                                                </div>

                                                <div className="col-md-4 formSection">
                                                    <label className="formGrp">
                                                    <Field
                                                        name="child3Gender"
                                                        component="select"
                                                        autoComplete="off"
                                                        value={values.child3Gender}
                                                        className="formGrp"
                                                    >
                                                    <option value="">Select gender</option>
                                                        <option value="m">Male</option>
                                                        <option value="f">Female</option>
                                                    </Field>    
                                                    </label>
                                                    {
                                                            errors.child3Gender && touched.child3Gender ?                 
                                                            <span className="error-message">{errors.child3Gender}</span>:''
                                                    }
                                                </div>
                                            </div> 



                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Father
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_5"
                                                        value="father"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_5', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_5', '');
                                                                setFieldValue("dob_5", '');
                                                                
                                                            }

                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }
                                                        }}
                                                        checked={values.looking_for_5 == 'father' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <FormGroup>
                                                        <DatePicker
                                                            name="dob_5"
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date(maxDobAdult)}
                                                            minDate={new Date(minDobAdult)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value,e) => {
                                                                if (e && typeof e.preventDefault === 'function') {
                                                                    e.preventDefault();
                                                                }
                                                                setFieldTouched("dob_5");
                                                                setFieldValue("dob_5", value);
                                                              }}
                                                            selected={values.dob_5}
                                                        />
                                                        <label className="formGrp error">
                                                        {
                                                            errors.dob_5 && touched.dob_5 ?                 
                                                            <span className="error-message">{errors.dob_5}</span>:''
                                                        }
                                                        </label>
                                                        
                                                    </FormGroup>
                                                </div>
                                            </div>

                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Mother
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_6"
                                                        value="mother"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_6', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_6', '');
                                                                setFieldValue("dob_6", '');
                                                                
                                                            }

                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }
                                                        }}
                                                        checked={values.looking_for_6 == 'mother' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <FormGroup >
                                                        <DatePicker
                                                            name="dob_6"
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date(maxDobAdult)}
                                                            minDate={new Date(minDobAdult)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value,e) => {
                                                                if (e && typeof e.preventDefault === 'function') {
                                                                    e.preventDefault();
                                                                }
                                                                setFieldTouched("dob_6");
                                                                setFieldValue("dob_6", value);
                                                              }}
                                                            selected={values.dob_6}
                                                        />
                                                        <label className="formGrp error">
                                                        {
                                                            errors.dob_6 && touched.dob_6 ?                 
                                                            <span className="error-message">{errors.dob_6}</span>:''
                                                        }
                                                        </label>
                                                    </FormGroup>
                                                </div>
                                            </div>

                                            <div className="row dropinput">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Father in law
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_7"
                                                        value="fatherInLaw"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_7', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_7', '');
                                                                setFieldValue("dob_7", '');                                                                
                                                            }

                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }
                                                        }}
                                                        checked={values.looking_for_7 == 'fatherInLaw' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <FormGroup >
                                                        <DatePicker
                                                            name="dob_7"
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date(maxDobAdult)}
                                                            minDate={new Date(minDobAdult)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value,e) => {
                                                                if (e && typeof e.preventDefault === 'function') {
                                                                    e.preventDefault();
                                                                }
                                                                setFieldTouched("dob_7");
                                                                setFieldValue("dob_7", value);
                                                              }}
                                                            selected={values.dob_7}
                                                        />
                                                        <label className="formGrp error">
                                                        {
                                                            errors.dob_7 && touched.dob_7 ?                 
                                                            <span className="error-message">{errors.dob_7}</span>:''
                                                        }
                                                        </label>
                                                    </FormGroup>
                                                </div>
                                            </div>

                                            <div className="row dropinput m-b-45">
                                                <div className="col-md-4">
                                                    <label className="customCheckBox formGrp formGrp">Mother in law
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_8"
                                                        value="motherInLaw"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldValue('looking_for_8', e.target.value);
                                                                
                                                            } else {
                                                                setFieldValue('looking_for_8', '');
                                                                setFieldValue("dob_8", '');                                                                
                                                            }

                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    validateCheck:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    validateCheck:0
                                                                })
                                                            }
                                                        }}
                                                        checked={values.looking_for_8 == 'motherInLaw' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </label>
                                                </div>

                                                <div className="col-md-4">
                                                    <FormGroup >
                                                        <DatePicker
                                                            name="dob_8"
                                                            dateFormat="dd MMM yyyy"
                                                            placeholderText="DOB"
                                                            peekPreviousMonth
                                                            peekPreviousYear
                                                            showMonthDropdown
                                                            showYearDropdown
                                                            maxDate={new Date(maxDobAdult)}
                                                            minDate={new Date(minDobAdult)}
                                                            className="datePckr"
                                                            dropdownMode="select"
                                                            onChange={(value,e) => {
                                                                if (e && typeof e.preventDefault === 'function') {
                                                                    e.preventDefault();
                                                                }
                                                                setFieldTouched("dob_8");
                                                                setFieldValue("dob_8", value);
                                                              }}
                                                            selected={values.dob_8}
                                                        />
                                                        <label className="formGrp error">
                                                        {
                                                            errors.dob_6 && touched.dob_8 ?                 
                                                            <span className="error-message">{errors.dob_8}</span>:''
                                                        }
                                                        </label>
                                                    </FormGroup>
                                                </div>
                                            </div>
                                            <div className="cntrbtn">
                                            <Button className={`btnPrimary m-r-15`} type="submit" >
                                            {this.setValueData() || this.state.validateCheck == '1' ? 'Submit':'Select' }
                                            </Button>
                                            <Button className={`btnPrimary`} type="button" onClick={e => this.handleClose()} >
                                             Cancel
                                            </Button>
                                            </div>
                                        </Modal.Body>
                                    </div>
                                    </Form>
                                    );
                                }}
                                </Formik>
                            </Modal>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(InformationYourself));