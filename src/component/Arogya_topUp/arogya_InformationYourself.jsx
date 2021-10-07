import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import BaseComponent from '../BaseComponent';
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
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";
import Encryption from '../../shared/payload-encryption';
import Select from 'react-select';

const minDobAdult = moment(moment().subtract(56, 'years').calendar()).add(1, 'day').calendar()
const maxDobAdult = moment().subtract(18, 'years').calendar();

const minDobChild = moment(moment().subtract(56, 'years').calendar()).add(1, 'day').calendar()
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
    insureList: "",
    cover_type_id: "",
    occupation_id: "",
    occupation_description: "",
}



const vehicleInspectionValidation = Yup.object().shape({
    gender: Yup.string().required('Please select gender'),
    occupation_id: Yup.string().required("Please select occupation type"),
    occupation_description: Yup.string()
        .when('occupation_id', {
            is: 193,
            then: Yup.string().typeError('Please Specify'),
            othewise: Yup.string()
        })

});

const validateFamilyMembers = Yup.object().shape({
    //check_input : Yup.string().required('Please select an options'),
    confirm: Yup.string().when(['looking_for_2'], {
        is: looking_for_2 => looking_for_2 == 'child1',
        then: Yup.string().required('Please agree to the terms'),
        othewise: Yup.string()
    }).when(['looking_for_3'], {
        is: looking_for_3 => looking_for_3 == 'child2',
        then: Yup.string().required('Please agree to the terms'),
        othewise: Yup.string()
    }).when(['looking_for_4'], {
        is: looking_for_4 => looking_for_4 == 'child3',
        then: Yup.string().required('Please agree to the terms'),
        othewise: Yup.string()
    }).when(['looking_for_5'], {
        is: looking_for_5 => looking_for_5 == 'child4',
        then: Yup.string().required('Please agree to the terms'),
        othewise: Yup.string()
    }),

    looking_for_1: Yup.string(),
    looking_for_6: Yup.string(),
    looking_for_0: Yup.string().when(['looking_for_2', 'cover_type_id'], {
        is: (looking_for_2, cover_type_id) => (looking_for_2 == 'child1' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_3', 'cover_type_id'], {
        is: (looking_for_3, cover_type_id) => (looking_for_3 == 'child2' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_4', 'cover_type_id'], {
        is: (looking_for_4, cover_type_id) => (looking_for_4 == 'child3' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_5', 'cover_type_id'], {
        is: (looking_for_5, cover_type_id) => (looking_for_5 == 'child4' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_1', 'looking_for_6', 'cover_type_id'], {
        is: (looking_for_1, looking_for_6, cover_type_id) => (looking_for_1 == 'spouse' && looking_for_6 == 'father' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_1', 'looking_for_7', 'cover_type_id'], {
        is: (looking_for_1, looking_for_7, cover_type_id) => (looking_for_1 == 'spouse' && looking_for_7 == 'mother' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_1', 'looking_for_8', 'cover_type_id'], {
        is: (looking_for_1, looking_for_8, cover_type_id) => (looking_for_1 == 'spouse' && looking_for_8 == 'fatherInLaw' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_1', 'looking_for_9', 'cover_type_id'], {
        is: (looking_for_1, looking_for_9, cover_type_id) => (looking_for_1 == 'spouse' && looking_for_9 == 'motherInLaw' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_6', 'looking_for_7', 'cover_type_id'], {
        is: (looking_for_6, looking_for_7, cover_type_id) => (looking_for_6 == 'father' && looking_for_7 == 'mother' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_6', 'looking_for_8', 'cover_type_id'], {
        is: (looking_for_6, looking_for_8, cover_type_id) => (looking_for_6 == 'father' && looking_for_8 == 'fatherInLaw' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_6', 'looking_for_9', 'cover_type_id'], {
        is: (looking_for_6, looking_for_9, cover_type_id) => (looking_for_6 == 'father' && looking_for_9 == 'motherInLaw' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_7', 'looking_for_8', 'cover_type_id'], {
        is: (looking_for_7, looking_for_8, cover_type_id) => (looking_for_7 == 'mother' && looking_for_8 == 'fatherInLaw' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_7', 'looking_for_9', 'cover_type_id'], {
        is: (looking_for_7, looking_for_9, cover_type_id) => (looking_for_7 == 'mother' && looking_for_9 == 'motherInLaw' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }).when(['looking_for_8', 'looking_for_9', 'cover_type_id'], {
        is: (looking_for_8, looking_for_9, cover_type_id) => (looking_for_8 == 'fatherInLaw' && looking_for_9 == 'motherInLaw' && cover_type_id == '3'),
        then: Yup.string().required('Please select self'),
        othewise: Yup.string()
    }),

    dob_0: Yup.string().when(['looking_for_0'], {
        is: looking_for_0 => looking_for_0 == 'self',
        then: Yup.string().required('Self Age is required')
      .test(
          "18YearsChecking",
          function() {
            return "Age should be minimum 18 and maximum 55 years"
        },
        function (value) {
            if (value) {
                
               let age=new Date().getFullYear()-new Date(value).getFullYear();
              console.log("checking===",age)
              return age < 55 && age >= 18 ;
            }
            return true;
        }
    ).nullable(),
        othewise: Yup.string()
    }),
    dob_1: Yup.string().when(['looking_for_1'], {
        is: looking_for_1 => looking_for_1 == 'spouse',
        then: Yup.string().required('Spouse Age is required')
      .test(
          "18YearsChecking",
          function() {
            return "Age should be minimum 18 and maximum 65 years"
        },
        function (value) {
            if (value) {
                let age=new Date().getFullYear()-new Date(value).getFullYear();
                return age < 55 && age >= 18 ;
            }
            return true;
        }
    ).nullable(),
        othewise: Yup.string()
    }),

    
    dob_2: Yup.string().when(['looking_for_2'], {
        is: looking_for_2 => looking_for_2 == 'child1',
        then: Yup.string().required('Child 1 Age is required').test(
            "3monthsChecking",
            function() {
                return "child age minimum 3 months and maximum 25 years"
            },
            function (value) {
                let year=new Date().getFullYear()-new Date(value).getFullYear();
                let month=new Date().getMonth()-new Date(value).getMonth();
                if (year>25) {
                    return false ;
                }
                if(year<1 && month<3)
                {
                    return false
                }
                return true;
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Self and child age difference should be 1 year"
            },
            function (value) {
                console.log("parent",this.parent)
                if(typeof this.parent.dob_0 != 'undefined'){
                    let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = self_age- chlild_age  ;
                   console.log("parent",ageDiff)
                    if (ageDiff >= 1 ) {   
                        return true;    
                    }
                    else{
                        return false;
                    }                    
                }
                else{
                    return true;
                }
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Spouse and child age difference should be 1 year"
            },
            function (value) {
                if(typeof this.parent.dob_1 != 'undefined'){
                    let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = self_age- chlild_age  ;
                    if (ageDiff >= 1 ) {   
                        return true;    
                    }
                    else{
                        return false;
                    }                
                }
                else{
                    return true;
                }   
            }
        )
        .test(
            "1yearAgeDiffChecking",
            function() {
                return "Child age should be less than self"
            },
            function (value) {              
                let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                var ageDiff = self_age- chlild_age  ;
                console.log("parent1",ageDiff)
                if (ageDiff > 0 ){ 
                    return true;    
                }
                else return false;
            }
        )
        .test(
            "1yearAgeDiffChecking",
            function() {
                return "Child age should be less than spouse"
            },
            function (value) {              
                let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                var ageDiff = self_age- chlild_age  ;
                if (ageDiff > 0 ){ 
                    return true;    
                }
                else return false;
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
        then: Yup.string().required('Child 2 Age is required').test(
            "3monthsChecking",
            function() {
                return "child age minimum 3 months and maximum 25 years"
            },
            function (value) {
                let year=new Date().getFullYear()-new Date(value).getFullYear();
                let month=new Date().getMonth()-new Date(value).getMonth();
                if (year>25) {
                    return false ;
                }
                if(year<1 && month<3)
                {
                    return false
                }
                return true;
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Self and child age difference should be 1 year"
            },
            function (value) {
                console.log("parent",this.parent)
                if(typeof this.parent.dob_0 != 'undefined'){
                    let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = self_age- chlild_age  ;
                   console.log("parent",ageDiff)
                    if (ageDiff >= 1 ) {   
                        return true;    
                    }
                    else{
                        return false;
                    }                    
                }
                else{
                    return true;
                }
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Spouse and child age difference should be 1 year"
            },
            function (value) {
                if(typeof this.parent.dob_1 != 'undefined'){
                    let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = self_age- chlild_age  ;
                    if (ageDiff >= 1 ) {   
                        return true;    
                    }
                    else{
                        return false;
                    }                
                }
                else{
                    return true;
                }   
            }
        )
        .test(
            "1yearAgeDiffChecking",
            function() {
                return "Child age should be less than self"
            },
            function (value) {              
                let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                var ageDiff = self_age- chlild_age  ;
                console.log("parent1",ageDiff)
                if (ageDiff > 0 ){ 
                    return true;    
                }
                else return false;
            }
        )
        .test(
            "1yearAgeDiffChecking",
            function() {
                return "Child age should be less than spouse"
            },
            function (value) {              
                let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                var ageDiff = self_age- chlild_age  ;
                if (ageDiff > 0 ){ 
                    return true;    
                }
                else return false;
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
        then: Yup.string().required('Child 3 Age is required').test(
            "3monthsChecking",
            function() {
                return "child age minimum 3 months and maximum 25 years"
            },
            function (value) {
                let year=new Date().getFullYear()-new Date(value).getFullYear();
                let month=new Date().getMonth()-new Date(value).getMonth();
                if (year>25) {
                    return false ;
                }
                if(year<1 && month<3)
                {
                    return false
                }
                return true;
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Self and child age difference should be 1 year"
            },
            function (value) {
                console.log("parent",this.parent)
                if(typeof this.parent.dob_0 != 'undefined'){
                    let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = self_age- chlild_age  ;
                   console.log("parent",ageDiff)
                    if (ageDiff >= 1 ) {   
                        return true;    
                    }
                    else{
                        return false;
                    }                    
                }
                else{
                    return true;
                }
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Spouse and child age difference should be 1 year"
            },
            function (value) {
                if(typeof this.parent.dob_1 != 'undefined'){
                    let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = self_age- chlild_age  ;
                    if (ageDiff >= 1 ) {   
                        return true;    
                    }
                    else{
                        return false;
                    }                
                }
                else{
                    return true;
                }   
            }
        )
        .test(
            "1yearAgeDiffChecking",
            function() {
                return "Child age should be less than self"
            },
            function (value) {              
                let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                var ageDiff = self_age- chlild_age  ;
                console.log("parent1",ageDiff)
                if (ageDiff > 0 ){ 
                    return true;    
                }
                else return false;
            }
        )
        .test(
            "1yearAgeDiffChecking",
            function() {
                return "Child age should be less than spouse"
            },
            function (value) {              
                let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                var ageDiff = self_age- chlild_age  ;
                if (ageDiff > 0 ){ 
                    return true;    
                }
                else return false;
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
        is: looking_for_5 => looking_for_5 == 'child4',
        then: Yup.string().required('Child 4 Age is required').test(
            "3monthsChecking",
            function() {
                return "child age minimum 3 months and maximum 25 years"
            },
            function (value) {
                let year=new Date().getFullYear()-new Date(value).getFullYear();
                let month=new Date().getMonth()-new Date(value).getMonth();
                if (year>25) {
                    return false ;
                }
                if(year<1 && month<3)
                {
                    return false
                }
                return true;
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Self and child age difference should be 1 year"
            },
            function (value) {
                console.log("parent",this.parent)
                if(typeof this.parent.dob_0 != 'undefined'){
                    let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = self_age- chlild_age  ;
                   console.log("parent",ageDiff)
                    if (ageDiff >= 1 ) {   
                        return true;    
                    }
                    else{
                        return false;
                    }                    
                }
                else{
                    return true;
                }
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Spouse and child age difference should be 1 year"
            },
            function (value) {
                if(typeof this.parent.dob_1 != 'undefined'){
                    let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = self_age- chlild_age  ;
                    if (ageDiff >= 1 ) {   
                        return true;    
                    }
                    else{
                        return false;
                    }                
                }
                else{
                    return true;
                }   
            }
        )
        .test(
            "1yearAgeDiffChecking",
            function() {
                return "Child age should be less than self"
            },
            function (value) {              
                let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                var ageDiff = self_age- chlild_age  ;
                console.log("parent1",ageDiff)
                if (ageDiff > 0 ){ 
                    return true;    
                }
                else return false;
            }
        )
        .test(
            "1yearAgeDiffChecking",
            function() {
                return "Child age should be less than spouse"
            },
            function (value) {              
                let chlild_age=new Date().getFullYear()-new Date(value).getFullYear();
                let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                var ageDiff = self_age- chlild_age  ;
                if (ageDiff > 0 ){ 
                    return true;    
                }
                else return false;
            }
        ), 
        othewise: Yup.string()
    }),
    child4Gender: Yup.string().when(['looking_for_5'], {
        is: looking_for_5 => looking_for_5 == 'child4',
        then: Yup.string().required('Child 4 Gender field is required'),
        othewise: Yup.string()
    }).nullable(),
    
    dob_6: Yup.string().when(['looking_for_6'], {
        is: looking_for_6 => looking_for_6 == 'father',
        then: Yup.string().required('Father DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age should be minimum 18 years & max 55 years"
            },
            function (value) {
                if (value) {
                    let age=new Date().getFullYear()-new Date(value).getFullYear();
                    if(age>=18 && age<=65)
                    {
                        return true;
                    }
                    else return false
                }
                return true;
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Self and father age difference should be 1 year"
            },
            function (value) {              
                if(this.parent.dob_0)
                {
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                if (ageDiff >= 1 ){ 
                    return true;    
                }
                else return false;
                }
                else
                {
                    return true;
                }
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Spouse and father difference should be 1 year"
            },
            function (value) { 
                if(this.parent.dob1)
                {
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                     let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                if (ageDiff >= 1 ){ 
                    return true;    
                }
                else return false;
                }
                else
                    return true;
            }
        ).test(
            "greaterAgeDiffChecking",
            function() {
                return "Father age should be greater than self"
            },
            function (value) {
                if(typeof this.parent.dob_0 != 'undefined'){
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                    if (ageDiff > 0 ){ 
                        return true;    
                    }
                    else return false;      
                }
                else{
                    return true;
                }
            }
        )
        .test(
            "greaterAgeDiffChecking",
            function() {
                return "Father age should be greater than spouse"
            },
            function (value) {
                if(typeof this.parent.dob_1 != 'undefined'){
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                    if (ageDiff > 0 ){ 
                        return true;    
                    }
                    else return false;       
                }
                else{
                    return true;
                }
            }
        ),
        othewise: Yup.string()
    }),

    dob_7: Yup.string().when(['looking_for_7'], {
        is: looking_for_7 => looking_for_7 == 'mother',
        then: Yup.string().required('Mother DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age should be minimum 18 years & max 55 years"
            },
            function (value) {
                if (value) {
                    let age=new Date().getFullYear()-new Date(value).getFullYear();
                    if(age>=18 && age<=65)
                    {
                        return true;
                    }
                    else return false
                }
                return true;
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Self and mother age difference should be 1 year"
            },
            function (value) {              
                if(this.parent.dob_0)
                {
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                if (ageDiff >= 1 ){ 
                    return true;    
                }
                else return false;
                }
                else
                {
                    return true;
                }
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Spouse and mother difference should be 1 year"
            },
            function (value) { 
                if(this.parent.dob1)
                {
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                     let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                if (ageDiff >= 1 ){ 
                    return true;    
                }
                else return false;
                }
                else
                    return true;
            }
        ).test(
            "greaterAgeDiffChecking",
            function() {
                return "mother age should be greater than self"
            },
            function (value) {
                if(typeof this.parent.dob_0 != 'undefined'){
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                    if (ageDiff > 0 ){ 
                        return true;    
                    }
                    else return false;      
                }
                else{
                    return true;
                }
            }
        )
        .test(
            "greaterAgeDiffChecking",
            function() {
                return "mother age should be greater than spouse"
            },
            function (value) {
                if(typeof this.parent.dob_1 != 'undefined'){
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                    if (ageDiff > 0 ){ 
                        return true;    
                    }
                    else return false;       
                }
                else{
                    return true;
                }
            }
        ),
        othewise: Yup.string()
    }),


    dob_8: Yup.string().when(['looking_for_8'], {
        is: looking_for_8 => looking_for_8 == 'fatherInLaw',
        then: Yup.string().required('Father-In-Law DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age should be minimum 18 years & max 55 years"
            },
            function (value) {
                if (value) {
                    let age=new Date().getFullYear()-new Date(value).getFullYear();
                    if(age>=18 && age<=65)
                    {
                        return true;
                    }
                    else return false
                }
                return true;
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Self and Father-in-law age difference should be 1 year"
            },
            function (value) {              
                if(this.parent.dob_0)
                {
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                if (ageDiff >= 1 ){ 
                    return true;    
                }
                else return false;
                }
                else
                {
                    return true;
                }
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Spouse and Father-in-law difference should be 1 year"
            },
            function (value) { 
                if(this.parent.dob1)
                {
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                     let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                if (ageDiff >= 1 ){ 
                    return true;    
                }
                else return false;
                }
                else
                    return true;
            }
        ).test(
            "greaterAgeDiffChecking",
            function() {
                return "Father-in-law age should be greater than self"
            },
            function (value) {
                if(typeof this.parent.dob_0 != 'undefined'){
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                    if (ageDiff > 0 ){ 
                        return true;    
                    }
                    else return false;      
                }
                else{
                    return true;
                }
            }
        )
        .test(
            "greaterAgeDiffChecking",
            function() {
                return "Father-in-law age should be greater than spouse"
            },
            function (value) {
                if(typeof this.parent.dob_1 != 'undefined'){
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                    if (ageDiff > 0 ){ 
                        return true;    
                    }
                    else return false;       
                }
                else{
                    return true;
                }
            }
        ),
        othewise: Yup.string()
    }),

    dob_9: Yup.string().when(['looking_for_9'], {
        is: looking_for_9 => looking_for_9 == 'motherInLaw',
        then: Yup.string().required('Mother-In-Law DOB field is required')
        .test(
            "18YearsChecking",
            function() {
                return "Age should be minimum 18 years & max 55 years"
            },
            function (value) {
                if (value) {
                    let age=new Date().getFullYear()-new Date(value).getFullYear();
                    if(age>=18 && age<=65)
                    {
                        return true;
                    }
                    else return false
                }
                return true;
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Self and Mother-in-law age difference should be 1 year"
            },
            function (value) {              
                if(this.parent.dob_0)
                {
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                if (ageDiff >= 1 ){ 
                    return true;    
                }
                else return false;
                }
                else
                {
                    return true;
                }
            }
        ).test(
            "1yearAgeDiffChecking",
            function() {
                return "Spouse and Mother-in-law difference should be 1 year"
            },
            function (value) { 
                if(this.parent.dob1)
                {
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                     let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                if (ageDiff >= 1 ){ 
                    return true;    
                }
                else return false;
                }
                else
                    return true;
            }
        ).test(
            "greaterAgeDiffChecking",
            function() {
                return "Mother-in-law age should be greater than self"
            },
            function (value) {
                if(typeof this.parent.dob_0 != 'undefined'){
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_0).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                    if (ageDiff > 0 ){ 
                        return true;    
                    }
                    else return false;      
                }
                else{
                    return true;
                }
            }
        )
        .test(
            "greaterAgeDiffChecking",
            function() {
                return "Mother-in-law age should be greater than spouse"
            },
            function (value) {
                if(typeof this.parent.dob_1 != 'undefined'){
                    let parent_age=new Date().getFullYear()-new Date(value).getFullYear();
                    let self_age=new Date().getFullYear()-new Date(this.parent.dob_1).getFullYear();             
                    var ageDiff = parent_age-self_age  ;
                    if (ageDiff > 0 ){ 
                        return true;    
                    }
                    else return false;       
                }
                else{
                    return true;
                }
            }
        ),
        othewise: Yup.string()
    }),

    cover_type_id: Yup.string().required("Select policy type")

})


const newInitialValues = {}

class arogya_InformationYourself extends Component {
    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            insureList: "",
            lookingFor: [],
            dob: [],
            gender: "",
            validateCheck: 0,
            familyMembers: [],
            addressDetails: {},
            is_eia_account: '',
            display_dob: [],
            display_looking_for: [],
            relationList: [],
            display_gender: [],
            gender_for: [],
            confirm: "",
            cover_type_id: "",
            drv: [],
            policyHolder: [],
            occupationList: []

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

    chanageGender = (value) => {
        let display_gender = localStorage.getItem('display_gender') ? JSON.parse(localStorage.getItem('display_gender')) : [];
        let display_gender_new = []
        let display_looking_for = sessionStorage.getItem('display_looking_for') ? JSON.parse(sessionStorage.getItem('display_looking_for')) : [];


        if (display_gender) {
            display_gender_new[0] = value ? value : null
            display_gender_new[1] = value ? (value == 'm') ? 'f' : 'm' : null
            display_gender_new[2] = display_gender[2] ? display_gender[2] : null
            display_gender_new[3] = display_gender[3] ? display_gender[3] : null
            display_gender_new[4] = display_gender[4] ? display_gender[4] : null
            display_gender_new[5] = display_gender[5] ? display_gender[5] : null
            display_gender_new[6] = 'm'
            display_gender_new[7] = 'f'
            display_gender_new[8] = 'm'
            display_gender_new[9] = 'f'

            let looking_for = []
            let gender_for = []
            for (let i = 0; i < display_looking_for.length; i++) {
                if (display_looking_for[i] != '') {
                    looking_for.push(display_looking_for[i])
                    gender_for.push(display_gender_new[i])
                }
            }
            localStorage.setItem('display_gender', JSON.stringify(display_gender_new))

            this.setState({
                display_gender: display_gender_new,
                display_looking_for: display_looking_for,
                looking_for,
                gender_for
            });

        }

        this.setState({
            gender: value,
            //  display_gender:display_gender_new
        });
    }

    handleFormSubmit = (values) => {
        if (values.occupation_id == '193' && (values.occupation_description == null || values.occupation_description == '')) {
            swal({
                text: "Please specify the occupation !",
                icon: "error",
            });
            return false;
        } else {

            const { productId } = this.props.match.params
            const formData = new FormData();
            let encryption = new Encryption();
            let lookingFor = this.state.lookingFor;
            let dob = this.state.dob;
            let familyMembers = this.state.familyMembers;
            let cover_type_id = this.state.cover_type_id;
            let post_data = []
            let menumaster_id = 8;

            let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
            if (bc_data) {
                bc_data = JSON.parse(encryption.decrypt(bc_data));
            }

            post_data['menumaster_id'] = menumaster_id
            post_data['page_name'] = `arogya_Health/${productId}`
            post_data['proposer_gender'] = values.gender
            post_data['cover_type_id'] = cover_type_id
            post_data['occupation_id'] = values.occupation_id
            post_data['occupation_description'] = values.occupation_description

            let arr_date = []
            for (let i = 0; i < dob.length; i++) {
                let date_of_birth = dob[i] ? dob[i] : familyMembers[i].dob;
                arr_date.push(date_of_birth)

            }
            post_data['dob'] = arr_date
            let is_self_select = false;
            arr_date = []
            for (let i = 0; i < lookingFor.length; i++) {

                let looking_for = lookingFor[i] ? lookingFor[i] : familyMembers[i].relation_with;
                is_self_select = looking_for == 'self' ? true : false
                arr_date.push(looking_for)
            }
            post_data['looking_for'] = arr_date
            let policyHolder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') : 0

            let gender_for = this.state.gender_for

            arr_date = []
            for (let i = 0; i < gender_for.length; i++) {
                let gender_val;
                gender_val = gender_for[i] ? gender_for[i] : familyMembers[i].gender;
                arr_date.push(gender_val);
            }
            post_data['gender'] = arr_date
            post_data['confirm'] = this.state.confirm

            if (sessionStorage.getItem('csc_id')) {
                post_data['csc_id'] = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : ""
                post_data['agent_name'] = sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : ""
                post_data['product_id'] = sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : ""
                post_data['bcmaster_id'] = "5"
            }
            else {
                post_data['bcmaster_id'] = bc_data ? bc_data.agent_id : ""
                post_data['bc_token'] = bc_data ? bc_data.token : ""
                post_data['bc_agent_id'] = bc_data ? bc_data.user_info.data.user.username : ""
                post_data['agent_name'] = bc_data ? bc_data.user_info.data.user.name : ""

            }
            let post_data_obj = {}

            console.log("postData========", post_data)

            if (policyHolder_id > 0) {
                post_data['policy_holder_id'] = policyHolder_id
                Object.assign(post_data_obj, post_data); // {0:"a", 1:"b", 2:"c"}
                formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data_obj)))
                //let vvv = encryption.encrypt(JSON.stringify(target))        
                this.props.loadingStart();
                axios
                    .post(`arogya-topup/update-yourself`, formData)
                    .then(res => {
                        let decryptResp = JSON.parse(encryption.decrypt(res.data))
                        console.log("decrypt", decryptResp)
                        localStorage.setItem('policyHolder_id', decryptResp.data.policyHolder_id);
                        localStorage.setItem('policyHolder_refNo', decryptResp.data.policyHolder_refNo);
                        localStorage.setItem('display_gender', JSON.stringify(this.state.display_gender));
                        this.props.loadingStop();
                        if (decryptResp.error == false) {
                            this.props.history.push(`/arogya_MedicalDetails/${productId}`);
                        }
                        else {
                            swal(decryptResp.msg)
                        }
                    })
                    .catch(err => {
                        if (err && err.data) {
                            swal('Family Member fields are required...');
                        }
                        this.props.loadingStop();
                    });
            }
            else {
                Object.assign(post_data_obj, post_data); // {0:"a", 1:"b", 2:"c"}
                formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data_obj)))

                this.props.loadingStart();
                axios
                    .post(`/arogya-topup/yourself`, formData)
                    .then(res => {
                        let decryptResp = JSON.parse(encryption.decrypt(res.data))
                        console.log("decrypt", decryptResp)
                        localStorage.setItem('policyHolder_id', decryptResp.data.policyHolder_id);
                        localStorage.setItem('policyHolder_refNo', decryptResp.data.policyHolder_refNo);
                        localStorage.setItem('display_gender', JSON.stringify(this.state.display_gender));
                        this.props.loadingStop();
                        if (decryptResp.error == false) {
                            this.props.history.push(`/arogya_MedicalDetails/${productId}`);
                        }
                        else {
                            swal(decryptResp.msg)
                        }
                        // this.props.history.push(`/arogya_MedicalDetails/${productId}`);
                    })
                    .catch(err => {
                        let decryptErr = JSON.parse(encryption.decrypt(err.data));
                        console.log('decryptResp--err---', decryptErr)
                        this.props.loadingStop();
                        if (decryptErr && err.data) {
                            swal('Family Member fields are required...');
                        }
                        // if(err && err.data){
                        //     swal('Family Member fields are required...');
                        // }
                    });
            }
        }
    }

    checkPolicyType = (value, isSelect, setFieldTouched, setFieldValue) => {
        const { drv } = this.state
        if (isSelect) {
            drv.push(value);
        }
        else {
            const index = drv.indexOf(value);
            if (index !== -1) {
                drv.splice(index, 1);
            }
        }

        if (drv && drv.length == 1) {
            setFieldTouched("cover_type_id");
            setFieldValue("cover_type_id", '1');
            this.setState({
                cover_type_id: 1
            })
        }
        else if (drv && drv.length > 1) {
            setFieldTouched("cover_type_id");
            setFieldValue("cover_type_id", '');
            this.setState({
                cover_type_id: ""
            })
        }
    }

    handleSubmitForm = (values, actions) => {
        var drv = [];
        var display_looking_for = [];
        var display_dob = [];
        let display_gender = [];

        display_gender[0] = this.state.gender ? this.state.gender : null
        display_gender[1] = this.state.gender ? (this.state.gender == 'm') ? 'f' : 'm' : null
        display_gender[2] = values.child1Gender ? values.child1Gender : null
        display_gender[3] = values.child2Gender ? values.child2Gender : null
        display_gender[4] = values.child3Gender ? values.child3Gender : null
        display_gender[5] = values.child4Gender ? values.child4Gender : null
        display_gender[6] = this.state.gender ? 'm' : null
        display_gender[7] = this.state.gender ? 'f' : null
        display_gender[8] = this.state.gender ? 'm' : null
        display_gender[9] = this.state.gender ? 'f' : null

        if (this.state.validateCheck == 1) {
            for (const key in values) {
                if (values.hasOwnProperty(key)) {
                    if (key.match(/looking_for/gi)) {
                        //  lastChar = key[key.length -1];                          
                        if (values[key] != '')
                            drv.push(values[key]);
                    }
                }
            }
            if (drv && drv.length > 0) {
                this.setState({
                    insureList: drv.toString()
                })
            }

            const { productId } = this.props.match.params
            const { gender } = this.state
            const formData = new FormData();
            let looking_for = []
            let gender_for = []
            let dob = []
            let i = [];
            let j = [];

            for (const key in values) {
                if (values.hasOwnProperty(key)) {
                    if (key.match(/looking_for/gi)) {
                        i = key.substr(12, 1);
                        display_looking_for[i] = values[key] ? values[key] : '';
                        if (values[key]) {
                            looking_for.push(values[key]);
                            gender_for.push(display_gender[i])
                        }
                    }

                    if (key.match(/dob/gi)) {
                        i = key.substr(4, 1);
                        display_dob[i] = values[key] ? values[key] : '';
                        if (values[key]) {
                            dob.push(moment(values[key]).format("YYYY-MM-DD"))
                        }
                    }
                }
            }


            sessionStorage.setItem('display_looking_for', JSON.stringify(display_looking_for));
            sessionStorage.setItem('display_dob', JSON.stringify(display_dob));
            // console.log('dataa',this.state.lookingFor,this.state.display_gender,this.state.cover_type_id)
            this.setState({
                lookingFor: looking_for,
                display_looking_for,
                display_gender: display_gender,
                gender_for: gender_for,
                cover_type_id: values.cover_type_id
            });
            this.setState({
                dob: dob,
                display_dob

            });
            this.handleClose()
        }
        else {
            swal('Please select at least one option');
            //this.handleClose()
        }
    }
    componentDidMount() {
        this.fetchData();
        this.fetchRelations();
    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo");
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`arogya-topup/health-policy-details/${policyHolder_refNo}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp)
                let family_members = decryptResp.data.policyHolder && decryptResp.data.policyHolder.request_data && decryptResp.data.policyHolder.request_data.family_members ? decryptResp.data.policyHolder.request_data.family_members : []
                let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : []
                let addressDetails = JSON.parse(decryptResp.data.policyHolder.address)
                let is_eia_account = decryptResp.data.policyHolder.is_eia_account
                let gender = decryptResp.data.policyHolder.gender
                let validateCheck = family_members && family_members.length > 0 ? 1 : 0;
                let cover_type_id = decryptResp.data.policyHolder && decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data.cover_type_id : '';
                this.setState({
                    familyMembers: family_members,
                    addressDetails,
                    is_eia_account,
                    gender,
                    validateCheck,
                    cover_type_id, policyHolder
                })
                this.setStateForPreviousData(family_members);
            })
            .catch((err) => {
                // handle error
                this.props.loadingStop();
            })
    }

    fetchRelations = () => {
        this.props.loadingStart();
        axios.get(`/arogya-topup/relations`)
            .then(res => {
                const relationList = res.data && res.data.data ? res.data.data : []
                this.setState({
                    relationList
                })
                this.fetchInsurance()
            })
            .catch((err) => {
                // handle error
                this.props.loadingStop();
            })
    }

    fetchInsurance = () => {
        let encryption = new Encryption();
        // this.props.loaderStart();
        axios
            .get(`occupations/${this.props.match.params.productId}`)
            .then((res) => {
                let decryptErr = JSON.parse(encryption.decrypt(res.data));
                console.log('decrypOccupation-----', decryptErr)
                this.setState({ occupationList: decryptErr.data });
                this.props.loadingStop();
            })
            .catch((err) => {
                this.props.loadingStop();
            });
    };

    handleChange = (e) => {
        const { occupationList } = this.state
        let declineStatus = ""
        if (occupationList) {
            {
                occupationList && occupationList.length > 0 && occupationList.map((insure, qIndex) => (
                    insure.id == e.target.value ? insure.decline_status == "Decline" ? swal('Insurance Policy cannot be offered') : '' : '',
                    insure.id == e.target.value && (declineStatus = insure.decline_status)
                ))
            }
        }
        this.setState({
            serverResponse: [],
            error: [],
            declineStatus
        })
    }


    setValueData = () => {
        var checkBoxAll = document.getElementsByClassName('user-self');
        for (const a in checkBoxAll) {
            if (checkBoxAll[a].checked) {
                return true
            }
        }
        return false
    }

    setStateForPreviousData = (family_members) => {
        if (family_members.length > 0) {
            let looking_for = family_members.map(resource => resource.relation_with);
            let gender_for = family_members.map(resource => resource.gender);

            let dob = family_members.map(resource => moment(resource.dob).format("YYYY-MM-DD"));
            let insureList = looking_for.toString();

            const display_gender_storage = JSON.parse(localStorage.getItem('display_gender'));
            let display_gender = []
            if (display_gender_storage && display_gender_storage.length > 0) {
                for (let index = 0; index < 9; index++)
                    display_gender[index] = display_gender_storage ? display_gender_storage[index] : null
            }


            this.setState({
                insureList,
                lookingFor: looking_for,
                dob,
                gender_for,
                display_gender,
                drv: looking_for
            });
        }
    }

    getInsuredList = (family_members) => {
        if (family_members.length > 0) {
            return family_members.map(resource => resource.relation_with);
        } else {
            return [];
        }
    }
    handleSelectedValChange = (selectedOption, setFieldValue, setFieldTouched) => {
        setFieldValue('occupation_id', selectedOption.value)
        this.setState({ selectedOption });
        console.log(`Option selected:`, selectedOption);
    };
    render() {
        const { memberInfo, insureList, validateCheck, gender, familyMembers, lookingFor, dob, display_looking_for,
            display_dob, display_gender, confirm, cover_type_id, policyHolder, occupationList, selectedOption } = this.state
        const insureListPrev = this.getInsuredList(familyMembers);
        let display_looking_for_arr = display_looking_for && display_looking_for.length > 0 ? display_looking_for : (sessionStorage.getItem('display_looking_for') ? JSON.parse(sessionStorage.getItem('display_looking_for')) : []);
        let display_dob_arr = display_dob && display_dob.length > 0 ? display_dob : (sessionStorage.getItem('display_dob') ? JSON.parse(sessionStorage.getItem('display_dob')) : []);
        let display_gender_arr = display_gender && display_gender.length > 0 ? display_gender : (localStorage.getItem('display_gender') ? JSON.parse(localStorage.getItem('display_gender')) : []);
        let coverTypeId = this.state.lookingFor.length == 1 ? 1 : this.state.cover_type_id;

        const newInitialValues = Object.assign(initialValues, {
            check_input: validateCheck ? validateCheck : 0,
            gender: gender ? gender : "",
            looking_for_0: display_looking_for_arr[0] ? display_looking_for_arr[0] : "",
            dob_0: display_dob_arr[0] ? new Date(display_dob_arr[0]) : "",
            age_0: display_dob_arr[0] ? Math.floor(moment().diff(display_dob_arr[0], 'years', true) ) : "",
            looking_for_1: display_looking_for_arr[1] ? display_looking_for_arr[1] : "",
            dob_1: display_dob_arr[1] ? new Date(display_dob_arr[1]) : "",
            age_1: display_dob_arr[1] ? Math.floor(moment().diff(display_dob_arr[1], 'years', true) ) : "",
            looking_for_2: display_looking_for_arr[2] ? display_looking_for_arr[2] : "",
            dob_2: display_dob_arr[2] ? new Date(display_dob_arr[2]) : "",
            age_2: display_dob_arr[2] ? Math.floor(moment().diff(display_dob_arr[2], 'years', true) ) : "",
            child1Gender: display_gender_arr  ? display_gender_arr[2] : "",
            looking_for_3: display_looking_for_arr[3] ? display_looking_for_arr[3] : "",
            dob_3: display_dob_arr[3] ? new Date(display_dob_arr[3]) : "",
            age_3: display_dob_arr[3] ? Math.floor(moment().diff(display_dob_arr[3], 'years', true) ) : "",
            child2Gender: display_gender_arr  ? display_gender_arr[3] : "",
            looking_for_4: display_looking_for_arr[4] ? display_looking_for_arr[4] : "",
            dob_4: display_dob_arr[4] ? new Date(display_dob_arr[4]) : "",
            age_4: display_dob_arr[4] ? Math.floor(moment().diff(display_dob_arr[4], 'years', true) ) : "",
            child3Gender: display_gender_arr  ? display_gender_arr[4] : "",
            looking_for_5: display_looking_for_arr[5] ? display_looking_for_arr[5] : "",
            dob_5: display_dob_arr[5] ? new Date(display_dob_arr[5]) : "",
            age_5: display_dob_arr[5] ? Math.floor(moment().diff(display_dob_arr[5], 'years', true) ) : "",
            child4Gender: display_gender_arr  ? display_gender_arr[5] : "",
            looking_for_6: display_looking_for_arr[6] ? display_looking_for_arr[6] : "",
            dob_6: display_dob_arr[6] ? new Date(display_dob_arr[6]) : "",
            age_6: display_dob_arr[6] ? Math.floor(moment().diff(display_dob_arr[6], 'years', true) ) : "",
            looking_for_7: display_looking_for_arr[7] ? display_looking_for_arr[7] : "",
            dob_7: display_dob_arr[7] ? new Date(display_dob_arr[7]) : "",     
            age_7: display_dob_arr[7] ? Math.floor(moment().diff(display_dob_arr[7], 'years', true) ) : "",                   
            looking_for_8: display_looking_for_arr[8] ? display_looking_for_arr[8] : "",
            dob_8: display_dob_arr[8] ? new Date(display_dob_arr[8]) : "",
            age_8: display_dob_arr[8] ? Math.floor(moment().diff(display_dob_arr[8], 'years', true) ) : "",
            looking_for_9: display_looking_for_arr[9] ? display_looking_for_arr[9] : "",
            dob_9: display_dob_arr[9] ? new Date(display_dob_arr[9]) : "",
            age_9: display_dob_arr[9] ? Math.floor(moment().diff(display_dob_arr[9], 'years', true) ) : "",
	    cover_type_id: cover_type_id,
            // cover_type_id: cover_type_id || lookingFor > 1 ? 1 : cover_type_id,
            insureList: insureListPrev ? insureListPrev.toString() : (insureList ? insureList : ''),
            occupation_id: policyHolder ? policyHolder.occupation_id : "",
            occupation_description: (policyHolder && policyHolder.occupation_description != null) ? policyHolder.occupation_description : ""
        });
        const options =
            occupationList && occupationList.length > 0 ? occupationList.map((insurer, qIndex) => (
                { value: insurer.id, label: insurer.occupation }
            )) : []


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


                                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox arghealth">
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
                                                                            this.chanageGender(e.target.value)
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

                                                            <div className="row formSection">
                                                                <label className="col-md-4">Occupation:</label>
                                                                <div className="col-md-4">
                                                                    <Select
                                                                        placeholder="Select Occupation"
                                                                        value={selectedOption ? selectedOption : options ? options.find(option => option.value === values.occupation_id) : ''}
                                                                        name='occupation_id'
                                                                        onChange={(e) => this.handleSelectedValChange(e, setFieldValue, setFieldTouched)}
                                                                        options={options}
                                                                    />
                                                                    {errors.occupation_id && touched.occupation_id ? (
                                                                        <span className="errorMsg">
                                                                            {errors.occupation_id}
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </div>

                                                            {
                                                                values.occupation_id == '193' ?
                                                                    <div className="row formSection">
                                                                        <label className="col-md-4"></label>
                                                                        <div className="col-md-4">
                                                                            <Field
                                                                                name="occupation_description"
                                                                                type="text"
                                                                                placeholder='Please mention your occupation here.'
                                                                                autoComplete="off"
                                                                                value={values.occupation_description}
                                                                                maxLength="256"
                                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            />
                                                                            {errors.occupation_description && touched.occupation_description ? (
                                                                                <span className="errorMsg">
                                                                                    {errors.occupation_description}
                                                                                </span>
                                                                            ) : null}
                                                                        </div>
                                                                    </div> : ''
                                                            }

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
                                                                    <img src={require('../../assets/images/plus-sign.svg')} alt="" className="plus-sign" />
                                                                    <br /><br />
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
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isValidating, isSubmitting, touched }) => {

                                            return (
                                                <Form>
                                                    <div className="customModalfamlyForm">
                                                        <div className="modal-header">
                                                            <h4 className="modal-title">Add Family Members to be Insured</h4>
                                                        </div>
                                                        <Modal.Body>
                                                            
                                                            <div className="row dropinput">
                                                                <div className="col-md-4">
                                                                    <label className="customCheckBox formGrp formGrp">Self
                                                                        <Field
                                                                            type="checkbox"
                                                                            name="looking_for_0"
                                                                            value="self"
                                                                            className="user-self"
                                                                            onChange={(e) => {
                                                                                this.checkPolicyType(e.target.value, e.target.checked, setFieldTouched, setFieldValue)
                                                                                if (e.target.checked === true) {
                                                                                    setFieldValue('looking_for_0', e.target.value);


                                                                                } else {
                                                                                    setFieldValue('looking_for_0', '');
                                                                                    setFieldValue("dob_0", '');

                                                                                }

                                                                                if (this.setValueData()) {
                                                                                    this.setState({
                                                                                        validateCheck: 1
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    this.setState({
                                                                                        validateCheck: 0
                                                                                    })
                                                                                }

                                                                            }}
                                                                            checked={values.looking_for_0 == 'self' ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"> </span>
                                                                    </label>
                                                                </div>

                                                                <div className="col-md-4" >
                                                                    <FormGroup className="m-b-25">
                                                                    <div className="insurerName">
                                                                        {/* <Field
                                                                            name='age_0'
                                                                            type="number"
                                                                            placeholder='Age'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value = {values.age_0}
                                                                            maxLength="10"            
                                                                            onChange = {(e) => {
                                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                                setFieldValue('dob_0',dob)
                                                                                setFieldValue('age_0',e.target.value)
                                                                            }}                                                                                                 
                                                                        />
                                                                        <label className="formGrp error">
                                                                        {
                                                                            errors.age_0 && touched.age_0 ?                 
                                                                            <span className="error-message">{errors.age_0}</span>:''
                                                                        }
                                                                        {
                                                                            errors.looking_for_0 && touched.looking_for_0 ?                 
                                                                            <span className="error-message">{errors.looking_for_0}</span>:''
                                                                        }
                                                                    </label> */}
                                                                        <DatePicker
                                                                        name= "dob_0"
                                                                        dateFormat="dd MMM yyyy"
                                                                        placeholderText="Date of birth"
                                                                        peekPreviousMonth
                                                                        peekPreviousYear
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        // maxDate={new Date(maxDobAdult)}
                                                                        // minDate={new Date(minDobAdult)}
                                                                        className="datePckr"
                                                                        selected={values.dob_0}
                                                                        onChange={(val) => {                                        
                                                                            setFieldTouched("dob_0");
                                                                            setFieldValue("dob_0", val);
                                                                        }}
                                                                    />
                                                                    

                                                                        {
                                                                            errors.dob_0 && touched.dob_0 ?                 
                                                                            <span className="error-message">{errors.dob_0}</span>:''
                                                                        }
                                                                        {
                                                                            errors.looking_for_0 && touched.looking_for_0 ?                 
                                                                            <span className="error-message">{errors.looking_for_0}</span>:''
                                                                        }
                                                                    </div>
                                                                    </FormGroup>
                                                                </ div>             
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
                                                                                this.checkPolicyType(e.target.value, e.target.checked, setFieldTouched, setFieldValue)
                                                                                if (e.target.checked === true) {
                                                                                    setFieldValue('looking_for_1', e.target.value);

                                                                                } else {
                                                                                    setFieldValue('looking_for_1', '');
                                                                                    setFieldValue("dob_1", '');
                                                                                }

                                                                                if (this.setValueData()) {
                                                                                    this.setState({
                                                                                        validateCheck: 1
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    this.setState({
                                                                                        validateCheck: 0
                                                                                    })
                                                                                }
                                                                            }}
                                                                            checked={values.looking_for_1 == 'spouse' ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </div>

                                                                <div className="col-md-4" >
                                                                    <FormGroup className="m-b-25">
                                                                    <div className="insurerName">
                                                                        {/* <Field
                                                                            name='age_1'
                                                                            type="number"
                                                                            placeholder='Age'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value = {values.age_1}
                                                                            maxLength="10"            
                                                                            onChange = {(e) => {
                                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                                setFieldValue('dob_1',dob)
                                                                                setFieldValue('age_1',e.target.value)
                                                                            }}                                                                                                 
                                                                        />
                                                                        <label className="formGrp error">
                                                                        {
                                                                            errors.age_1 && touched.age_1 ?                 
                                                                            <span className="error-message">{errors.age_1}</span>:''
                                                                        }
                                                                        {
                                                                    
                                                                            errors.looking_for_1 && touched.looking_for_1 ?                 
                                                                            <span className="error-message">{errors.looking_for_1}</span>:''
                                                                        }
                                                                        </label>
                                                                     */}

                                                                        <DatePicker
                                                                        name= "dob_1"
                                                                        dateFormat="dd MMM yyyy"
                                                                        placeholderText="Date of birth"
                                                                        peekPreviousMonth
                                                                        peekPreviousYear
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        // maxDate={new Date(maxDobAdult)}
                                                                        // minDate={new Date(minDobAdult)}
                                                                        className="datePckr"
                                                                        selected={values.dob_1}
                                                                        onChange={(val) => {                                        
                                                                            setFieldTouched("dob_1");
                                                                            setFieldValue("dob_1", val);
                                                                        }}
                                                                    />
                                                                    

                                                                        {
                                                                            errors.dob_1 && touched.dob_1 ?                 
                                                                            <span className="error-message">{errors.dob_1}</span>:''
                                                                        }
                                                                        {
                                                                            errors.looking_for_1 && touched.looking_for_1 ?                 
                                                                            <span className="error-message">{errors.looking_for_1}</span>:''
                                                                        }
                                                                    </div>
                                                                    </FormGroup>
                                                                </ div>
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
                                                                                if (this.setValueData()) {
                                                                                    this.setState({
                                                                                        validateCheck: 1
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    this.setState({
                                                                                        validateCheck: 0
                                                                                    })
                                                                                }
                                                                            }}
                                                                            checked={values.looking_for_2 == 'child1' ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </div>

                                                                <div className="col-md-4" >
                                                                    <FormGroup className="m-b-25">
                                                                    <div className="insurerName">
                                                                        {/* <Field
                                                                            name='age_2'
                                                                            type="number"
                                                                            placeholder='Age'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value = {values.age_2}
                                                                            maxLength="10"            
                                                                            onChange = {(e) => {
                                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                                setFieldValue('dob_2',dob)
                                                                                setFieldValue('age_2',e.target.value)
                                                                            }}                                                                                                 
                                                                        />
                                                                        <label className="formGrp error">
                                                                        {
                                                                            errors.age_2 && touched.age_2 ?                 
                                                                            <span className="error-message">{errors.age_2}</span>:''
                                                                        }                                                
                                                                    </label> */}

                                                                    <DatePicker
                                                                    name= "dob_2"
                                                                    dateFormat="dd MMM yyyy"
                                                                    placeholderText="Date of birth"
                                                                    peekPreviousMonth
                                                                    peekPreviousYear
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dropdownMode="select"
                                                                    // maxDate={new Date(maxDobAdult)}
                                                                    // minDate={new Date(minDobAdult)}
                                                                    className="datePckr"
                                                                    selected={values.dob_2}
                                                                    onChange={(val) => {                                        
                                                                        setFieldTouched("dob_2");
                                                                        setFieldValue("dob_2", val);
                                                                    }}
                                                                />
                                                                

                                                                    {
                                                                        errors.dob_2 && touched.dob_2 ?                 
                                                                        <span className="error-message">{errors.dob_2}</span>:''
                                                                    }
                                                                    {
                                                                        errors.looking_for_2 && touched.looking_for_2 ?                 
                                                                        <span className="error-message">{errors.looking_for_2}</span>:''
                                                                    }
                                                                    </div>
                                                                    </FormGroup>
                                                                </ div>

                                                                <div className="col-md-4 formSection">
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
                                                                    <label className="formGrp error">
                                                                        {
                                                                            errors.child1Gender && touched.child1Gender ?
                                                                                <span className="error-message">{errors.child1Gender}</span> : ''
                                                                        }
                                                                    </label>
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
                                                                                if (this.setValueData()) {
                                                                                    this.setState({
                                                                                        validateCheck: 1
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    this.setState({
                                                                                        validateCheck: 0
                                                                                    })
                                                                                }
                                                                            }}
                                                                            checked={values.looking_for_3 == 'child2' ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </div>

                                                                <div className="col-md-4" >
                                                                    <FormGroup className="m-b-25">
                                                                    <div className="insurerName">
                                                                        {/* <Field
                                                                            name='age_3'
                                                                            type="number"
                                                                            placeholder='Age'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value = {values.age_3}
                                                                            maxLength="10"            
                                                                            onChange = {(e) => {
                                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                                setFieldValue('dob_3',dob)
                                                                                setFieldValue('age_3',e.target.value)
                                                                            }}                                                                                                 
                                                                        />
                                                                        <label className="formGrp error">
                                                                        {
                                                                            errors.age_3 && touched.age_3 ?                 
                                                                            <span className="error-message">{errors.age_3}</span>:''
                                                                        }                                                
                                                                    </label> */}

                                                                    <DatePicker
                                                                    name= "dob_3"
                                                                    dateFormat="dd MMM yyyy"
                                                                    placeholderText="Date of birth"
                                                                    peekPreviousMonth
                                                                    peekPreviousYear
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dropdownMode="select"
                                                                    // maxDate={new Date(maxDobAdult)}
                                                                    // minDate={new Date(minDobAdult)}
                                                                    className="datePckr"
                                                                    selected={values.dob_3}
                                                                    onChange={(val) => {                                        
                                                                        setFieldTouched("dob_3");
                                                                        setFieldValue("dob_3", val);
                                                                    }}
                                                                />
                                                                

                                                                    {
                                                                        errors.dob_3 && touched.dob_3 ?                 
                                                                        <span className="error-message">{errors.dob_3}</span>:''
                                                                    }
                                                                    {
                                                                        errors.looking_for_3 && touched.looking_for_3 ?                 
                                                                        <span className="error-message">{errors.looking_for_3}</span>:''
                                                                    }
                                                                    </div>
                                                                    </FormGroup>
                                                                </ div>

                                                                <div className="col-md-4 formSection">
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
                                                                    <label className="formGrp error">
                                                                        {
                                                                            errors.child2Gender && touched.child2Gender ?
                                                                                <span className="error-message">{errors.child2Gender}</span> : ''
                                                                        }
                                                                    </label>
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
                                                                                if (this.setValueData()) {
                                                                                    this.setState({
                                                                                        validateCheck: 1
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    this.setState({
                                                                                        validateCheck: 0
                                                                                    })
                                                                                }
                                                                            }}
                                                                            checked={values.looking_for_4 == 'child3' ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </div>

                                                                <div className="col-md-4" >
                                                                    <FormGroup className="m-b-25">
                                                                    <div className="insurerName">
                                                                        {/* <Field
                                                                            name='age_4'
                                                                            type="number"
                                                                            placeholder='Age'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value = {values.age_4}
                                                                            maxLength="10"            
                                                                            onChange = {(e) => {
                                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                                setFieldValue('dob_4',dob)
                                                                                setFieldValue('age_4',e.target.value)
                                                                            }}                                                                                                 
                                                                        />
                                                                        <label className="formGrp error">
                                                                        {
                                                                            errors.age_4 && touched.age_4 ?                 
                                                                            <span className="error-message">{errors.age_4}</span>:''
                                                                        }                                                
                                                                    </label> */}
                                                                    </div>

                                                                    <DatePicker
                                                                    name= "dob_4"
                                                                    dateFormat="dd MMM yyyy"
                                                                    placeholderText="Date of birth"
                                                                    peekPreviousMonth
                                                                    peekPreviousYear
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dropdownMode="select"
                                                                    // maxDate={new Date(maxDobAdult)}
                                                                    // minDate={new Date(minDobAdult)}
                                                                    className="datePckr"
                                                                    selected={values.dob_4}
                                                                    onChange={(val) => {                                        
                                                                        setFieldTouched("dob_4");
                                                                        setFieldValue("dob_4", val);
                                                                    }}
                                                                />
                                                                

                                                                    {
                                                                        errors.dob_4 && touched.dob_4 ?                 
                                                                        <span className="error-message">{errors.dob_4}</span>:''
                                                                    }
                                                                    {
                                                                        errors.looking_for_4 && touched.looking_for_4 ?                 
                                                                        <span className="error-message">{errors.looking_for_4}</span>:''
                                                                    }
                                                                    </FormGroup>
                                                                </ div>

                                                                <div className="col-md-4 formSection">
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
                                                                    <label className="formGrp error">
                                                                        {
                                                                            errors.child3Gender && touched.child3Gender ?
                                                                                <span className="error-message">{errors.child3Gender}</span> : ''
                                                                        }
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div className="row dropinput">
                                                                <div className="col-md-4">
                                                                    <label className="customCheckBox formGrp formGrp">Child 4
                                                                        <Field
                                                                            type="checkbox"
                                                                            name="looking_for_5"
                                                                            value="child4"
                                                                            className="user-self"
                                                                            onChange={(e) => {
                                                                                if (e.target.checked === true) {
                                                                                    setFieldValue('looking_for_5', e.target.value);

                                                                                } else {
                                                                                    setFieldValue('looking_for_5', '');
                                                                                    setFieldValue("dob_5", '');

                                                                                }
                                                                                if (this.setValueData()) {
                                                                                    this.setState({
                                                                                        validateCheck: 1
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    this.setState({
                                                                                        validateCheck: 0
                                                                                    })
                                                                                }
                                                                            }}
                                                                            checked={values.looking_for_5 == 'child4' ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </div>

                                                                <div className="col-md-4" >
                                                                    <FormGroup className="m-b-25">
                                                                    <div className="insurerName">
                                                                        {/* <Field
                                                                            name='age_5'
                                                                            type="number"
                                                                            placeholder='Age'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value = {values.age_5}
                                                                            maxLength="10"            
                                                                            onChange = {(e) => {
                                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                                setFieldValue('dob_5',dob)
                                                                                setFieldValue('age_5',e.target.value)
                                                                            }}                                                                                                 
                                                                        />
                                                                        <label className="formGrp error">
                                                                        {
                                                                            errors.age_5 && touched.age_5 ?                 
                                                                            <span className="error-message">{errors.age_5}</span>:''
                                                                        }                                                
                                                                    </label> */}

                                                                        <DatePicker
                                                                        name= "dob_5"
                                                                        dateFormat="dd MMM yyyy"
                                                                        placeholderText="Date of birth"
                                                                        peekPreviousMonth
                                                                        peekPreviousYear
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        // maxDate={new Date(maxDobAdult)}
                                                                        // minDate={new Date(minDobAdult)}
                                                                        className="datePckr"
                                                                        selected={values.dob_5}
                                                                        onChange={(val) => {                                        
                                                                            setFieldTouched("dob_5");
                                                                            setFieldValue("dob_5", val);
                                                                        }}
                                                                    />
                                                                    

                                                                        {
                                                                            errors.dob_5 && touched.dob_5 ?                 
                                                                            <span className="error-message">{errors.dob_5}</span>:''
                                                                        }
                                                                        {
                                                                            errors.looking_for_5 && touched.looking_for_5 ?                 
                                                                            <span className="error-message">{errors.looking_for_5}</span>:''
                                                                        }
                                                                    </div>
                                                                    </FormGroup>
                                                                </ div>

                                                                <div className="col-md-4 formSection">
                                                                    <Field
                                                                        name="child4Gender"
                                                                        component="select"
                                                                        autoComplete="off"
                                                                        value={values.child4Gender}
                                                                        className="formGrp"
                                                                    >
                                                                        <option value="">Select gender</option>
                                                                        <option value="m">Male</option>
                                                                        <option value="f">Female</option>
                                                                    </Field>
                                                                    <label className="formGrp error">
                                                                        {
                                                                            errors.child4Gender && touched.child4Gender ?
                                                                                <span className="error-message">{errors.child4Gender}</span> : ''
                                                                        }
                                                                    </label>
                                                                </div>
                                                            </div>


                                                            <div className="row dropinput">
                                                                <div className="col-md-4">
                                                                    <label className="customCheckBox formGrp formGrp">Father
                                                                        <Field
                                                                            type="checkbox"
                                                                            name="looking_for_6"
                                                                            value="father"
                                                                            className="user-self"
                                                                            onChange={(e) => {
                                                                                this.checkPolicyType(e.target.value, e.target.checked, setFieldTouched, setFieldValue)
                                                                                if (e.target.checked === true) {
                                                                                    setFieldValue('looking_for_6', e.target.value);

                                                                                } else {
                                                                                    setFieldValue('looking_for_6', '');
                                                                                    setFieldValue("dob_6", '');

                                                                                }

                                                                                if (this.setValueData()) {
                                                                                    this.setState({
                                                                                        validateCheck: 1
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    this.setState({
                                                                                        validateCheck: 0
                                                                                    })
                                                                                }
                                                                            }}
                                                                            checked={values.looking_for_6 == 'father' ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </div>

                                                                <div className="col-md-4" >
                                                                    <FormGroup className="m-b-25">
                                                                    <div className="insurerName">
                                                                        {/* <Field
                                                                            name='age_6'
                                                                            type="number"
                                                                            placeholder='Age'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value = {values.age_6}
                                                                            maxLength="10"            
                                                                            onChange = {(e) => {
                                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                                setFieldValue('dob_6',dob)
                                                                                setFieldValue('age_6',e.target.value)
                                                                            }}                                                                                                 
                                                                        />
                                                                        <label className="formGrp error">
                                                                        {
                                                                            errors.age_6 && touched.age_6 ?                 
                                                                            <span className="error-message">{errors.age_6}</span>:''
                                                                        }                                                
                                                                    </label> */}

                                                                    <DatePicker
                                                                    name= "dob_6"
                                                                    dateFormat="dd MMM yyyy"
                                                                    placeholderText="Date of birth"
                                                                    peekPreviousMonth
                                                                    peekPreviousYear
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dropdownMode="select"
                                                                    // maxDate={new Date(maxDobAdult)}
                                                                    // minDate={new Date(minDobAdult)}
                                                                    className="datePckr"
                                                                    selected={values.dob_6}
                                                                    onChange={(val) => {                                        
                                                                        setFieldTouched("dob_6");
                                                                        setFieldValue("dob_6", val);
                                                                    }}
                                                                />
                                                                

                                                                    {
                                                                        errors.dob_6 && touched.dob_6 ?                 
                                                                        <span className="error-message">{errors.dob_6}</span>:''
                                                                    }
                                                                    {
                                                                        errors.looking_for_6 && touched.looking_for_6 ?                 
                                                                        <span className="error-message">{errors.looking_for_6}</span>:''
                                                                    }
                                                                    </div>
                                                                    </FormGroup>
                                                                </ div>
                                                            </div>

                                                            <div className="row dropinput">
                                                                <div className="col-md-4">
                                                                    <label className="customCheckBox formGrp formGrp">Mother
                                                                        <Field
                                                                            type="checkbox"
                                                                            name="looking_for_7"
                                                                            value="mother"
                                                                            className="user-self"
                                                                            onChange={(e) => {
                                                                                this.checkPolicyType(e.target.value, e.target.checked, setFieldTouched, setFieldValue)
                                                                                if (e.target.checked === true) {
                                                                                    setFieldValue('looking_for_7', e.target.value);

                                                                                } else {
                                                                                    setFieldValue('looking_for_7', '');
                                                                                    setFieldValue("dob_7", '');

                                                                                }

                                                                                if (this.setValueData()) {
                                                                                    this.setState({
                                                                                        validateCheck: 1
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    this.setState({
                                                                                        validateCheck: 0
                                                                                    })
                                                                                }
                                                                            }}
                                                                            checked={values.looking_for_7 == 'mother' ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </div>

                                                                <div className="col-md-4" >
                                                                    <FormGroup className="m-b-25">
                                                                    <div className="insurerName">
                                                                        {/* <Field
                                                                            name='age_7'
                                                                            type="number"
                                                                            placeholder='Age'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value = {values.age_7}
                                                                            maxLength="10"            
                                                                            onChange = {(e) => {
                                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                                setFieldValue('dob_7',dob)
                                                                                setFieldValue('age_7',e.target.value)
                                                                            }}                                                                                                 
                                                                        />
                                                                        <label className="formGrp error">
                                                                        {
                                                                            errors.age_7 && touched.age_7 ?                 
                                                                            <span className="error-message">{errors.age_7}</span>:''
                                                                        }                                                
                                                                    </label> */}

                                                                        <DatePicker
                                                                        name= "dob_7"
                                                                        dateFormat="dd MMM yyyy"
                                                                        placeholderText="Date of birth"
                                                                        peekPreviousMonth
                                                                        peekPreviousYear
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        // maxDate={new Date(maxDobAdult)}
                                                                        // minDate={new Date(minDobAdult)}
                                                                        className="datePckr"
                                                                        selected={values.dob_7}
                                                                        onChange={(val) => {                                        
                                                                            setFieldTouched("dob_7");
                                                                            setFieldValue("dob_7", val);
                                                                        }}
                                                                    />
                                                                    

                                                                        {
                                                                            errors.dob_7 && touched.dob_7 ?                 
                                                                            <span className="error-message">{errors.dob_7}</span>:''
                                                                        }
                                                                        {
                                                                            errors.looking_for_7 && touched.looking_for_7 ?                 
                                                                            <span className="error-message">{errors.looking_for_7}</span>:''
                                                                        }
                                                                    </div>
                                                                    </FormGroup>
                                                                </ div>
                                                            </div>

                                                            <div className="row dropinput">
                                                                <div className="col-md-4">
                                                                    <label className="customCheckBox formGrp formGrp">Father in law
                                                                        <Field
                                                                            type="checkbox"
                                                                            name="looking_for_8"
                                                                            value="fatherInLaw"
                                                                            className="user-self"
                                                                            onChange={(e) => {
                                                                                this.checkPolicyType(e.target.value, e.target.checked, setFieldTouched, setFieldValue)
                                                                                if (e.target.checked === true) {
                                                                                    setFieldValue('looking_for_8', e.target.value);

                                                                                } else {
                                                                                    setFieldValue('looking_for_8', '');
                                                                                    setFieldValue("dob_8", '');
                                                                                }

                                                                                if (this.setValueData()) {
                                                                                    this.setState({
                                                                                        validateCheck: 1
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    this.setState({
                                                                                        validateCheck: 0
                                                                                    })
                                                                                }
                                                                            }}
                                                                            checked={values.looking_for_8 == 'fatherInLaw' ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </div>

                                                                <div className="col-md-4" >
                                                                    <FormGroup className="m-b-25">
                                                                    <div className="insurerName">
                                                                        {/* <Field
                                                                            name='age_8'
                                                                            type="number"
                                                                            placeholder='Age'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value = {values.age_8}
                                                                            maxLength="10"            
                                                                            onChange = {(e) => {
                                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                                setFieldValue('dob_8',dob)
                                                                                setFieldValue('age_8',e.target.value)
                                                                            }}                                                                                                 
                                                                        />
                                                                        <label className="formGrp error">
                                                                        {
                                                                            errors.age_8 && touched.age_8 ?                 
                                                                            <span className="error-message">{errors.age_8}</span>:''
                                                                        }                                                
                                                                    </label> */}

                                                                        <DatePicker
                                                                        name= "dob_8"
                                                                        dateFormat="dd MMM yyyy"
                                                                        placeholderText="Date of birth"
                                                                        peekPreviousMonth
                                                                        peekPreviousYear
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        // maxDate={new Date(maxDobAdult)}
                                                                        // minDate={new Date(minDobAdult)}
                                                                        className="datePckr"
                                                                        selected={values.dob_8}
                                                                        onChange={(val) => {                                        
                                                                            setFieldTouched("dob_8");
                                                                            setFieldValue("dob_8", val);
                                                                        }}
                                                                    />
                                                                    

                                                                        {
                                                                            errors.dob_8 && touched.dob_8 ?                 
                                                                            <span className="error-message">{errors.dob_8}</span>:''
                                                                        }
                                                                        {
                                                                            errors.looking_for_8 && touched.looking_for_8 ?                 
                                                                            <span className="error-message">{errors.looking_for_8}</span>:''
                                                                        }
                                                                    </div>
                                                                    </FormGroup>
                                                                </ div>
                                                            </div>

                                                            <div className="row dropinput m-b-45">
                                                                <div className="col-md-4">
                                                                    <label className="customCheckBox formGrp formGrp">Mother in law
                                                                        <Field
                                                                            type="checkbox"
                                                                            name="looking_for_9"
                                                                            value="motherInLaw"
                                                                            className="user-self"
                                                                            onChange={(e) => {
                                                                                this.checkPolicyType(e.target.value, e.target.checked, setFieldTouched, setFieldValue)
                                                                                if (e.target.checked === true) {
                                                                                    setFieldValue('looking_for_9', e.target.value);

                                                                                } else {
                                                                                    setFieldValue('looking_for_9', '');
                                                                                    setFieldValue("dob_9", '');
                                                                                }

                                                                                if (this.setValueData()) {
                                                                                    this.setState({
                                                                                        validateCheck: 1
                                                                                    })
                                                                                }
                                                                                else {
                                                                                    this.setState({
                                                                                        validateCheck: 0
                                                                                    })
                                                                                }
                                                                            }}
                                                                            checked={values.looking_for_9 == 'motherInLaw' ? true : false}
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </div>

                                                                <div className="col-md-4" >
                                                                    <FormGroup className="m-b-25">
                                                                    <div className="insurerName">
                                                                        {/* <Field
                                                                            name='age_9'
                                                                            type="number"
                                                                            placeholder='Age'
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value = {values.age_9}
                                                                            maxLength="10"            
                                                                            onChange = {(e) => {
                                                                                let dob =  moment().subtract(e.target.value, 'year').format("YYYY-MM-DD")
                                                                                setFieldValue('dob_9',dob)
                                                                                setFieldValue('age_9',e.target.value)
                                                                            }}                                                                                                 
                                                                        />
                                                                        <label className="formGrp error">
                                                                        {
                                                                            errors.age_9 && touched.age_9 ?                 
                                                                            <span className="error-message">{errors.age_9}</span>:''
                                                                        }                                                
                                                                    </label> */}

                                                                        <DatePicker
                                                                        name= "dob_9"
                                                                        dateFormat="dd MMM yyyy"
                                                                        placeholderText="Date of birth"
                                                                        peekPreviousMonth
                                                                        peekPreviousYear
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        // maxDate={new Date(maxDobAdult)}
                                                                        // minDate={new Date(minDobAdult)}
                                                                        className="datePckr"
                                                                        selected={values.dob_9}
                                                                        onChange={(val) => {                                        
                                                                            setFieldTouched("dob_9");
                                                                            setFieldValue("dob_9", val);
                                                                        }}
                                                                    />
                                                                    

                                                                        {
                                                                            errors.dob_9 && touched.dob_9 ?                 
                                                                            <span className="error-message">{errors.dob_9}</span>:''
                                                                        }
                                                                        {
                                                                            errors.looking_for_9 && touched.looking_for_9 ?                 
                                                                            <span className="error-message">{errors.looking_for_9}</span>:''
                                                                        }
                                                                    </div>
                                                                    </FormGroup>
                                                                </ div>            
                                                            </div>
                                                                
                                                            {values.looking_for_2 || values.looking_for_3 || values.looking_for_4 || values.looking_for_5 ?
                                                                <div className="row dropinput m-b-20">
                                                                    <div className="col-md-15">
                                                                        <label className="customCheckBox formGrp formGrp">
                                                                            I confirm that the child is/ children are financially dependent on me
                                                                            <Field
                                                                                type="checkbox"
                                                                                name="confirm"
                                                                                value="1"
                                                                                className="user-self"
                                                                                onChange={(e) => {
                                                                                    if (e.target.checked === true) {
                                                                                        setFieldValue('confirm', e.target.value);

                                                                                    } else {
                                                                                        setFieldValue('confirm', '');
                                                                                    }
                                                                                    if (this.setValueData()) {
                                                                                        this.setState({
                                                                                            confirm: 1
                                                                                        })
                                                                                    }
                                                                                    else {
                                                                                        this.setState({
                                                                                            confirm: 0
                                                                                        })
                                                                                    }
                                                                                }}
                                                                                checked={values.confirm == '1' ? true : false}
                                                                            />
                                                                            <span className="checkmark mL-0"></span>
                                                                            <label className="formGrp error">
                                                                                {errors.confirm && (touched.looking_for_2 || touched.looking_for_3 || touched.looking_for_4 || values.looking_for_5) ?
                                                                                    <span className="error-message">{errors.confirm}</span> : ""
                                                                                }
                                                                            </label>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                : null}
                                                            {(values.looking_for_0 && values.looking_for_1) || values.looking_for_2 || values.looking_for_3 || values.looking_for_4 || values.looking_for_5 || values.looking_for_6 || values.looking_for_7 || values.looking_for_8 || values.looking_for_9 ?
                                                                <div className="d-flex justify-content-center">
                                                                    <div className="d-inline-flex m-b-15 m-l-20">
                                                                        <div className="p-r-25">
                                                                            <label className="customRadio3">
                                                                                <Field
                                                                                    type="radio"
                                                                                    name='cover_type_id'
                                                                                    value='3'
                                                                                    key='1'
                                                                                    checked={values.cover_type_id == '3' ? true : false}
                                                                                    onChange={() => {
                                                                                        setFieldTouched('cover_type_id')
                                                                                        setFieldValue('cover_type_id', '3');
                                                                                        // this.handleChange(values,setFieldTouched, setFieldValue)
                                                                                    }
                                                                                    }
                                                                                />
                                                                                <span className="checkmark " /><span className="fs-14">Floater Plan</span>
                                                                                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"A family floater policy is a health insurance plan which covers the entire family on the payment of a single annual premium."}</Tooltip>}>
                                                                                    <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                                                </OverlayTrigger>
                                                                            </label>
                                                                        </div>
                                                                        <div className="p-r-25">
                                                                            <label className="customRadio3">
                                                                                <Field
                                                                                    type="radio"
                                                                                    name='cover_type_id'
                                                                                    value='2'
                                                                                    key='1'
                                                                                    checked={values.cover_type_id == '2' ? true : false}
                                                                                    onChange={() => {
                                                                                        setFieldTouched('cover_type_id')
                                                                                        setFieldValue('cover_type_id', '2');
                                                                                        // this.handleChange(values,setFieldTouched, setFieldValue)
                                                                                    }
                                                                                    }
                                                                                />
                                                                                <span className="checkmark " /><span className="fs-14">Non Floater Plan</span>
                                                                                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"A non floater policy is a health insurance plan which covers the individual family member(s) on the payment of a single annual premium."}</Tooltip>}>
                                                                                    <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                                                </OverlayTrigger>
                                                                            </label>
                                                                            {errors.cover_type_id && touched.cover_type_id ? (
                                                                                <span className="errorMsg">{errors.cover_type_id}</span>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                : null}
                                                            <div className="cntrbtn">
                                                                <Button className={`btnPrimary m-r-15`} type="submit" >
                                                                    {this.setValueData() || this.state.validateCheck == '1' ? 'Submit' : 'Select'}
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(arogya_InformationYourself));