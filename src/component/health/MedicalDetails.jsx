import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import axios from "../../shared/axios"

import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik'
import * as Yup from "yup";
import mapValues from 'lodash/mapValues';
import swal from 'sweetalert';



const validateMedicalDetails = Yup.object().shape({
    question_id: Yup.lazy(obj =>
        Yup.object(
            mapValues(obj => {     
                console.log('ssss===>',obj);
              //  console.log('aaaaa=====>',key)
           /* if (key.includes('question_id')) {
                return Yup.object().shape({
                question_id: Yup.string().required("Enter")
                })
            }*/
            })
        )
        )
        
}) 
        
// const initialValues = {
//     question_id_1 : "n"
// }
let styleData = {
    background:'blue'
}

let styleDataOuter = {
}

class MedicalDetails extends Component {

    state = {
        questionList: [],
        message: "",
        question_answer: [],
        flag: false,
        selected_answer:[],
        selected_question:[],
        validation_message:"",
        show:false,
        isForwarded : true,
        showImg: {},
        family_members:[],
        tempSelectedFamily:[],
        selectedQuestion:[],
        famArr:[],
        clickCheckbox:false,
        selected_family_members:[]
      };

    sumInsured = (productId) => {
        this.props.history.push(`/SelectDuration/${productId}`);
    }

    buy_policy = (productId) => {
        this.props.history.push(`/Health/${productId}`);
    } 

    handleClose=()=>{
        this.setState({ show: false });
    }

    handleChangeSubmit = (key,value) => {
        let question_id = [];
        let selected_answer = [];
        let selected_question = [];
        const formData = new FormData(); 
        
        if ( key.match(/question_id/gi)){      
            question_id.push(key.substr(12, 1));                            
        }

        let showImage = this.state.showImage  ? this.state.showImage : []
      //  s//howImage.map((obj))
        let newShowImage = showImage && showImage.map(resource=>({
            //`${resource.id}`:false
            'question_id':resource.question_id,
            'status': (value == 'y' && resource.question_id == question_id[0]) ? true : (resource.status && resource.question_id != question_id[0] )?true:false
        //resource.id} : false
            })           
        );
            console.log("SSSSSSSSSSS=======>",newShowImage)
      
       formData.append('question_id', question_id[0]);
       formData.append('answer', value);
       selected_answer.push(value);
       selected_answer = [...new Set(selected_answer)];
       selected_question = this.state.selected_question;
       selected_question.push(question_id[0]);
       selected_question = [...new Set(selected_question)];

       this.setState({
            showImage:newShowImage,
            selected_question,
            selected_answer
      })


       let familyMembers=document.getElementsByClassName(`familyMembers${question_id[0]}`)
       let answerStr = value;
       console.log("AAAAA====>",familyMembers);
       if(answerStr=='n'){
            let family_members = this.state.family_members
            family_members && family_members.map((resource,index) =>{
                console.log('aaaaa123344======>',resource.id)
                formData.append(`family_member_ids[${index}]`,resource.id);  
                }
            );  
            formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));
            this.props.loadingStart();
            axios
                .post(`/medical-question`, formData)
                .then(res => {
                this.setState({
                    message: res.data.msg
                });
                this.props.loadingStop();
                })
                .catch(err => {
                this.setState({
                    message: ""
                });
                this.props.loadingStop();
                }); 
            
       }
       else{
           if(answerStr=='y'){
                let cnt = 0
                for(let i=0;i<familyMembers.length;i++){
                    if(familyMembers[i].checked){     
                        cnt++;
                    }                
                    //formData.append(familyMembers[i].value);
                }
                if(cnt==0){
                    swal("Please select a family member");
                }
           }
           
       }
       console.log("Form Data=======>",formData)
      console.log("Form Data=======>",formData)
       
       


          
    }

    capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    handleSubmit = (values) => {
        const {productId} = this.props.match.params
        const questionClass = document.getElementsByClassName('questionClass');
        let count = 0
        let checkFamily = []
        let selectCheck = []
        for(let i=0;i<questionClass.length;i++){
            if(questionClass[i].checked){  
                //console.log("Name====>",questionClass[i].name  
               let classId = questionClass[i].name[questionClass[i].name.length-1]
               let familyMembers=`familyMembers${classId}`
               let familyMembersClass = document.getElementsByClassName(familyMembers);
                if(questionClass[i].value == 'y'){
                    selectCheck.push(questionClass[i].value)
                }
               for(let j=0;j<familyMembersClass.length;j++){
                    if(familyMembersClass[j].checked){                        
                        checkFamily.push(true)
                    }   
               }  
               count++;              
            }            
        }

        console.log("CHECK FAMILY ==============>", checkFamily)
        console.log("CHECK FAMILY ==============>", checkFamily)

        let q = questionClass.length/2






        if(count == q && checkFamily.length >= selectCheck.length){
            if(this.state.isForwarded){
                this.props.history.push(`/SelectDuration/${productId}`);
            }            
        }
        else{
            swal('Please answer all of the questions');

           /* this.setState({
                validation_message:'Please answer all of the questions',
                show:true
            })*/
        }
       /* if(count===questionClass.length){
            alert(all )
        }*/
       //  this.props.history.push(`/SelectDuration/${productId}`);
    }

    getQuestionList = () => {
        this.props.loadingStart();
        axios
          .get(`/questions`)
          .then(res => {
              
            let showImage = res.data.data && res.data.data.length ? this.setShowImage(res.data.data):[]
            this.setState({
                questionList: res.data.data,
                showImage
            });
          })
          .catch(err => {
            this.setState({
                questionList: []
            });
            this.props.loadingStop();
          });
          this.props.loadingStop();
      }

    getFamilyMembers = (question_answer) => {
        let famArr=[]
        for(let i=0; i<question_answer.length; i++){
            famArr[question_answer[i].question_id] = question_answer[i].family_members.split(' ')
        }
        return famArr;
    }   

    getPolicyHolderDetails = () => {
        this.props.loadingStart();
        axios
          .get(`/policy-holder/${localStorage.getItem('policyHolder_id')}`)
          .then(res => { 
            this.setState({
                flag: true,
                question_answer: res.data.data.policyHolder.request_data.question_answer,
                family_members:res.data.data.policyHolder.request_data.family_members,
            }) 
            let question_answer = res.data.data.policyHolder.request_data.question_answer ? res.data.data.policyHolder.request_data.question_answer : {};
            //console.log('FAM ARRRRRR========>',this.getFamilyMembers(question_answer))
            let famArr =  this.getFamilyMembers(question_answer)
            this.setState({
                famArr:famArr && famArr.length >0 ? famArr :[   ]
            })
          })
          .catch(err => {
            this.setState({
                question_answer: [], flag: true
            });
            this.props.loadingStop();
          });
          this.props.loadingStop();
      }

    componentDidMount() {
        this.getQuestionList();
        this.getPolicyHolderDetails();
        //this.setShowImage();
      }


    showRestriction=(value)=>{
        if(value == 'y'){
            swal('Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 180 22 1111');
            this.setState({
                isForwarded : false
            })
        }
        else{
            this.setState({
                isForwarded : true
            })
        }
        
    }

    setShowImage = (questionList) => {
        console.log("aaaaa----Question list=====>",questionList);
       let showImage = questionList && questionList.map(resource=>({
                //`${resource.id}`:false
                'question_id':resource.id,
                'status':false
               //resource.id} : false
        })           
        );
      return showImage
    }
    
    setAnswer = (e) =>{
        let selected_answer = [];
        let selected_question = [];    
        let selected_family_members = [];   
        const formData = new FormData(); 
        console.log('aaaassss====>',e.target)
        
        console.log('aaaa====>',e.target.checked)
        let classId = e.target.className[e.target.className.length-1]
        
        formData.append('question_id',classId);
        formData.append('answer','y');
        let cnt = 0;

            let tempSelectedFamily = this.state.tempSelectedFamily;
            console.log('11111222===>',document.getElementsByClassName(`${e.target.id}:checkbox:checked`))

            console.log("aaaaa========>",document.getElementById(`${e.target.id}:checkbox:checked`)!=null);
            if(document.getElementById(`${e.target.id}:checkbox:checked`)!=null){
                this.setState({
                    clickCheckbox:false
                })
                document.getElementsByClassName(`${e.target.id}`).checked = false
            }
            else{
                this.setState({
                    clickCheckbox:true
                })
                document.getElementsByClassName(`${e.target.id}`).checked = true
            }
            selected_answer.push('y');
            selected_answer = [...new Set(selected_answer)];
            selected_question = this.state.selected_question;
            selected_question.push(classId);
            selected_question = [...new Set(selected_question)];

            this.setState({
                    selected_question,
                    selected_answer
            })


            let familyMembers=document.getElementsByClassName(e.target.className)
            console.log("Family Members =====> ",familyMembers);
           // document.getElementsByClassName(`${e.target.className}`).cheked  =  true 
           // let familyMembers = document.getElementsByClassName(`${e.target.className}`);
           formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));
            let count = 0;
           if(familyMembers.length>0){
            for(let i=0;i<familyMembers.length;i++){
                if(familyMembers[i].checked){
                     formData.append(`family_member_ids[${i}]`,familyMembers[i].value);   
                     selected_family_members.push(familyMembers[i].value)                                         
                    }
                    else{
                        let rand_val = Math.floor(Math.random() * 6) <1 ? 1: (Math.floor(Math.random() * 6)+1)
                        formData.append(`family_member_ids[${i}]`,rand_val);                        
                        selected_family_members.push(rand_val) 
                    }                                                 
                }
           }
           selected_family_members=[...new Set(selected_family_members)];
           this.setState({
                selected_question,
                selected_answer,
                selected_family_members
            })

           this.props.loadingStart();
                    axios
                        .post(`/medical-question`, formData)
                        .then(res => {
                        this.setState({
                            message: res.data.msg
                        });
                       // this.getQuestionList();
                       // this.getPolicyHolderDetails();
                       window.location.reload(true)
                        this.props.loadingStop();
                        })
                        .catch(err => {
                        this.setState({
                            message: ""
                        });
                        this.props.loadingStop();
                        });

           
           
            
  
          //  tempSelectedFamily.push(e.target.value)
           // tempSelectedFamily = Array.from(new Set(tempSelectedFamily))

         
          /*  this.setState({
                tempSelectedFamily
            }) */
        
        
       
                //formData.append(`family_member_ids[${cnt++}]`,e.target.value);
         
       /* for(let i=0;i<tempSelectedFamily.length;i++){
            formData.append(`family_member_ids[${i}]`,tempSelectedFamily[i]);
        }*/

        

         
        //console.log('bbbbb====>',document.getElementsByClassName(e))
    }
    
    render() {
        const {productId } = this.props.match.params
        const {questionList, question_answer, flag,selected_question,selected_answer,showImg,family_members,famArr,selected_family_members} = this.state
      
       console.log("SHOW IMAGE DATA=======>",question_answer)
       // let showImage = {}
       let qlength = questionList ? questionList.length:0;
        console.log('Selected Questions==>',selected_question)
        console.log('Selected Answer==>',selected_answer)
        
        let initialValues = {}
        let selectedQuestion = [];
        if(questionList && flag && questionList.length > 0) {
            questionList.map((question, qIndex) => {
            if(question_answer && question_answer.length > 0) {
                question_answer.map((answer, aIndex) => {
                initialValues[`question_id_${answer.question_id}`] = answer.response;
                initialValues[`family_members_${answer.question_id}`] = answer.family_members.split(' ');
                selectedQuestion[answer.question_id] = answer.response == 'y' ? answer.family_members.split(' ') : null  
                console.log("IIIIIII======>",selectedQuestion[answer.question_id])    
                                
            })
            }
            else {
                selectedQuestion[question.id] = []  
                initialValues[`question_id_${question.id}`] = "";
                initialValues[`family_members_${question.id}`] = [];
            }    
            initialValues[`show_question_id_${question.id}`]=false
            initialValues[`famArr`]=famArr

        })


      


      //  this.setShowImage(showImage)
      // console.log("SHOW IMAGE ARRRRRRRRRR=========>",showImage);
    }

    

    

console.log("FORM ARRAY----------=====>",famArr)
    
    const newInitialValues =  Object.assign(initialValues) ;
    console.log("SSSSSSSSSSSSSSSSSS==============>",newInitialValues);
        
        return (
            <>
                <BaseComponent>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                            <SideNav />
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                        <h4 className="text-center mt-3 mb-3">Arogya Sanjeevani Policy</h4>
                            <section className="d-flex justify-content-center brand m-t-60">
                                <div className="brand-bg pd-30">
                                <div className="d-flex justify-content-left">
                            <div className="brandhead m-b-25">
                                <h4>Please help us with more details to arrive at the best suited plan </h4>
                            </div>
                           
                            </div>

                            {Object.keys(newInitialValues).length > 0 ?
                            <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit}
                           //  validationSchema={validateMedicalDetails}
                            >
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                               console.log("aaaaaa=====>",values)
                            return (
                            <Form>
                            <Row>
                            <Col sm={12} md={9}>
                            <FieldArray
                            name="abc"
                            render={flagHelpers => { 
                            return (
                            questionList.map((question, qIndex) => ( 
                                
                            <div className="d-flex justify-content-left">
                                <div className="m-r-25"><img src={require(`../../assets/images/${question.logo}`)} alt="" /></div>
                                    <div className="medinfo"><p className="W500 m-r-15">{question.title}</p>
                                        
                                    <FormGroup>
                                        <div className="d-inline-flex m-b-30">
                                            <div className="p-r-25">
                                                <label className="customRadio3">
                                                <Field
                                                    type="radio"
                                                    name={`question_id_${question.id}`}
                                                    className = 'questionClass'
                                                    value="y"
                                                    key={qIndex}  
                                                    onClick={(e) => {
                                                        setFieldValue(`question_id_${question.id}`, e.target.value);
                                                        this.handleChangeSubmit(`question_id_${question.id}`,e.target.value)
                                                        //this.setState({ showImg: !this.state.showImg })
                                                        console.log("HURAAAAAAAA",values[`family_members_${question.id}`]);
                                                        if(qIndex == qlength -1){
                                                            this.showRestriction('y');
                                                        } 
                                                    }}
                                                    checked={values[`question_id_${question.id}`] == 'y' ? true : false}
                                                />
                                                    <span className="checkmark " /><span className="fs-14" > Yes</span>                      
                                                </label>
                                            </div>

                                            <div className="">
                                                <label className="customRadio3">
                                                <Field
                                                    type="radio"
                                                    name={`question_id_${question.id}`}
                                                    className = 'questionClass'
                                                    value="n"
                                                    key={qIndex}
                                                    onClick={(e) => {
                                                        setFieldValue(`question_id_${question.id}`, e.target.value);
                                                        this.handleChangeSubmit(`question_id_${question.id}`,e.target.value)
                                                        //this.setState({ showImg: !this.state.showImg })
                                                        if(qIndex == qlength -1){
                                                            this.showRestriction('n');
                                                        } 
                                                    }}
                                                    checked={values[`question_id_${question.id}`] == 'n' ? true : false}
                                                   // validation = {checkValidation}
                                                />
                                                    <span className="checkmark" />
                                                    <span className="fs-14">No</span>
                                                    {/*!this.state.selected_question.includes(question.id) ? (
                                                    <span className="errorMsg">Please select a question</span>
                                                    ) : null*/}
                                                </label>
                                            </div>
                                        </div>
                                        </FormGroup>

                                    </div>
                                       {
                                          console.log("HHHHHHHHIIIIIOOOOO==============>",values[`family_members_${question.id}`]) 
                                       }             
                                    {(values[`question_id_${question.id}`] =='y' && values[`family_members_${question.id}`]) ||(this.state.showImage && this.state.showImage[qIndex].status == true)  ?
                                    <div class="gender">
                                    {family_members && family_members.map((resource,index)=>(
                                        <>
                                        {resource.relation_with == 'self' ?
                                        <>
                                        <input type="checkbox"
                                            className={`familyMembers${question.id}`}
                                            name={`family_members.${question.id}.${index}.${resource.relation_with}`}
                                            value={resource.id} id={`family_members.${question.id}.${index}.${resource.relation_with}`}
                                            checked = {values[`question_id_${question.id}`] =='y' ? (values[`family_members_${question.id}`] && values[`family_members_${question.id}`].includes(resource.id.toString())?'checked':''):''}
                                            //checked = {values[`question_id_${question.id}`] =='y' ? (values[`family_members_${question.id}`] && values[`family_members_${question.id}`].includes(resource.id)?'checked':''):''}
                                           // checked = {this.state.famArr && this.state.famArr[question.id].indexOf(resource.id)==-1}
                                            //checked = {values[`family_members_${question.id}`] && values[`family_members_${question.id}`].length && values[`family_members_${question.id}`].indexOf(resource.id) && (values[`question_id_${question.id}`]=='y') ? 'checked':''}
                                            onClick = {(e) => {
                                                this.setAnswer(e)
                                            }}
                                            />
                                         {resource.gender == 'm' ? <label for={`family_members.${question.id}.${index}.${resource.relation_with}`}> <img src={require('../../assets/images/self.svg')} alt=""/>{this.capitalize(resource.relation_with)}</label>:
                                         <label for={`family_members.${question.id}.${index}.${resource.relation_with}`}><img src={require('../../assets/images/Spouse.svg')} alt=""/>{this.capitalize(resource.relation_with)}</label>}
                                         </>
                                         :
                                             resource.relation_with == 'spouse'   ?
                                            <>
                                            <input type="checkbox" 
                                            className={`familyMembers${question.id}`}
                                            name={`family_members.${question.id}.${index}.${resource.relation_with}`}
                                            value={resource.id} id={`family_members.${question.id}.${index}.${resource.relation_with}`}
                                            checked = {values[`question_id_${question.id}`] =='y' ? (values[`family_members_${question.id}`] && values[`family_members_${question.id}`].includes(resource.id.toString())?'checked':''):''}
                                            //checked = {values[`family_members_${question.id}`] && values[`family_members_${question.id}`].length && values[`family_members_${question.id}`].indexOf(resource.id) && (values[`question_id_${question.id}`]=='y')} 
                                            onClick = {(e) => {
                                                this.setAnswer(e)
                                            }}
                                            />
                                           {resource.gender == 'm' ? 
                                             <label for={`family_members.${question.id}.${index}.${resource.relation_with}`}> <img src={require('../../assets/images/self.svg')} alt=""/>{this.capitalize(resource.relation_with)}</label>
                                             : <label for={`family_members.${question.id}.${index}.${resource.relation_with}`}><img src={require('../../assets/images/Spouse.svg')} alt=""/>{this.capitalize(resource.relation_with)}</label>}
                                            </> :
                                            resource.relation_with == 'child1' || resource.relation_with == 'child2' ||  resource.relation_with == 'child3' ?
                                            <>
                                            <input type="checkbox"
                                            className={`familyMembers${question.id}`}
                                            name={`family_members.${question.id}.${index}.${resource.relation_with}`}
                                            value={resource.id} id={`family_members.${question.id}.${index}.${resource.relation_with}`}
                                            checked = {values[`question_id_${question.id}`] =='y' ? (values[`family_members_${question.id}`] && values[`family_members_${question.id}`].includes(resource.id.toString())?'checked':''):''}
                                            //checked = {values[`family_members_${question.id}`] && values[`family_members_${question.id}`].length && values[`family_members_${question.id}`].indexOf(resource.id) && (values[`question_id_${question.id}`]=='y')}
                                            onClick = {(e) => {
                                                this.setAnswer(e)
                                            }}
                                            />
                                             <label for={`family_members.${question.id}.${index}.${resource.relation_with}`}> 
                                             {resource.gender == 'm' ? 
                                             <img src={require('../../assets/images/kids-boy.svg')} alt=""/>
                                             :<img src={require('../../assets/images/kids-girl.svg')} alt=""/>                                            
                                             }
                                             {this.capitalize(resource.relation_with)}</label>
                                            </>:
                                            resource.relation_with == 'father' || resource.relation_with == 'fatherInLaw'?
                                            <>
                                            <input type="checkbox"
                                            className={`familyMembers${question.id}`}
                                            name={`family_members.${question.id}.${index}.${resource.relation_with}`}
                                            value={resource.id} id={`family_members.${question.id}.${index}.${resource.relation_with}`}
                                            checked = {values[`question_id_${question.id}`] =='y' ? (values[`family_members_${question.id}`] && values[`family_members_${question.id}`].includes(resource.id.toString())?'checked':''):''}
                                            //checked = {values[`family_members_${question.id}`] && values[`family_members_${question.id}`].length && values[`family_members_${question.id}`].indexOf(resource.id) && (values[`question_id_${question.id}`]=='y')}
                                            onClick = {(e) => {
                                                this.setAnswer(e)
                                            }}
                                            />
                                             <label for={`family_members.${question.id}.${index}.${resource.relation_with}`}> <img src={require('../../assets/images/self.svg')} alt=""/>{this.capitalize(resource.relation_with)}</label>
                                            </>:
                                            resource.relation_with == 'mother' || resource.relation_with == 'motherInLaw'?
                                            <>
                                            <input type="checkbox"
                                            className={`familyMembers${question.id}`}
                                            name={`family_members.${question.id}.${index}.${resource.relation_with}`}
                                            value={resource.id} id={`family_members.${question.id}.${index}.${resource.relation_with}`}
                                            checked = {values[`question_id_${question.id}`] =='y' ? (values[`family_members_${question.id}`] && values[`family_members_${question.id}`].includes(resource.id.toString())?'checked':''):''}
                                            //checked = {values[`family_members_${question.id}`] && values[`family_members_${question.id}`].length && values[`family_members_${question.id}`].indexOf(resource.id) && (values[`question_id_${question.id}`]=='y')}
                                            onClick = {(e) => {
                                                this.setAnswer(e)
                                            }}
                                            />
                                             <label for={`family_members.${question.id}.${index}.${resource.relation_with}`}> <img src={require('../../assets/images/Spouse.svg')} alt=""/>{this.capitalize(resource.relation_with)}</label>
                                            </>:
                                            null                                                                                                                          
                                         
                                        }
                                         </>
                                    ))}
                                   
                                    

                                    
                                   {/* <input type="checkbox"
                                    name="cigrate_smokeSpouse"
                                    value="1" id="cigrate_smokeSpouse"/>
                                    <label for="cigrate_smokeSpouse"> <img src={require('../../assets/images/Spouse.svg')} alt=""/>Spouse</label>
                                    

                                    
                                    <input type="checkbox"
                                    name="cigrate_smokeChild_1"
                                    value="1" id="cigrate_smokeChild_1"/>
                                    <label for="cigrate_smokeChild_1"> <img src={require('../../assets/images/kids-boy.svg')} alt=""/>Child</label>*/}
                                    
                                        </div>
                                        :null
                                          
                                        }
                                </div>
                                )) 
                            )}}
                            />
                                
                                
                                <div className="d-flex justify-content-left resmb">
                                <Button className={`backBtn`} type="button"  onClick= {this.buy_policy.bind(this, productId )} >
                                    Back
                                </Button>
                                <Button className={`proceedBtn`} type="submit"  >
                                    Continue
                                </Button>
                                </div>
                            </Col>

                            <Col sm={12} md={3}>
                                <div className="regisBox medpd">
                                    <h3 className="medihead">No Medical Test upto the Age of 45 for People with No Medical History </h3>
                                </div>
                            </Col>
                        </Row>
                        </Form>
                            );
                        }}
                        </Formik> : null }
                        </div>
                        </section> 
                        <Footer />  
                        </div>
                        <Modal className="customModal1" bsSize="md" show={this.state.show}
                                onHide={this.handleClose}>
                             <div className="errorMsg">
                                {this.state.validation_message}
                            </div>
                            <div className="d-flex justify-content-left resmb" style={styleDataOuter}>
                            <button className="backBtn" onClick= {this.handleClose} style={styleData}>Close</button>
                            </div>
                            
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(MedicalDetails));