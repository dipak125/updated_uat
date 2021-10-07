import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
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
import Encryption from '../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { SearchField } from 'react-bootstrap-table';
import { assertCompletionStatement } from '@babel/types';


const initialValues = {
    makeEndorsement: []

}

const endorsementValidation = Yup.object().shape({

    makeEndorsement: Yup.array().of(
        Yup.object().shape({
            New_values: Yup.string().required('This field is required'),
            Old_values: Yup.string().required('This field is required')            
        })
    ),

    additionalEndorsement: Yup.array().of(
        Yup.object().shape({
            add_endorsement_sub_type: Yup.string().required('This field is required'),
            add_endorsement_type: Yup.string().required('This field is required'),
            addEndorsementInitValues: Yup.array().of(
                Yup.object().shape({
                    add_endorsement_new_value: Yup.string().required('This field is required'),
                    add_endorsement_old_value: Yup.string().required('This field is required')            
                })
            )
        })
    ),

    email_id: Yup.string().required('This field is required'),
    mobile_no: Yup.string().required('This field is required'),
    product_category: Yup.string().required('This field is required'),
    product: Yup.string().required('This field is required'),
    policy_no: Yup.string().required('This field is required'),
    endorsement_type: Yup.string().required('This field is required'),
    endorsement_sub_type: Yup.string().required('This field is required'),

})


class UpdateEndorsement extends Component {
    check=0;
    constructor(props){
        super(props)
        this.state = {
            product_category_list: [],
            product_list: [],
            request_receive_date: [],
            selectedFile:[],
            endorsement_info_id: [],
            endorsement_data_id: this.props.endorsementdata_id,
            product_endorsement_list:[],
            endorsement_sub_type_list:[],
            endorsementfields:{},
            addEndorsementFields:[],
            additionalEndorsement_sub_type_list:[],
            endorsement_array:[],
            type2_info_id:"",
            count:this.props.endorsementInfo.length - 1,
            add_endorsement_received_date: [],
            endorsementDetails: [],
            endorsementInfo: this.props.endorsementInfo
           
        }
    }
   
    forwardNextPage=()=> {    
        this.props.history.push(`/AdditionalDetails_GSB/${this.props.match.params.productId}`);  
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    getProductCategoryList = (endorsementInfo) => {
        this.props.loadingStart();
        axios
            .get(`/dyi-endorsement/product-category-list`)
            .then(res => {
                if(res.data.error == false) {
                    let product_category_list = res.data.data.product_categories ? res.data.data.product_categories : []
                    this.setState({
                        product_category_list
                        
                    })
                    this.getProductList(endorsementInfo[0].endorsement_product_category_id, endorsementInfo)
                }
                else {
                    this.props.loadingStop();
                }          
            })
            .catch(err => {
                this.setState({
                    product_category_list: []
                });
                this.props.loadingStop();
            });
    }

    getEndorsementDetails = () => {
        const formData = new FormData();
        formData.append('endorsementdata_id', this.props.endorsementdata_id)
        this.props.loadingStart();
        axios
            .post(`/dyi-endorsement/details`, formData)
            .then(res => {
                if(res.data.error == false) {
                    let endorsementDetails = res.data.data.details ? res.data.data.details : []
                    let endorsementInfo = res.data.data.details && res.data.data.details.info ? res.data.data.details.info : []
                    this.setState({
                        endorsementDetails
                        
                    })
                }
                this.props.loadingStop();
            })
            .catch(err => {
                this.setState({
                    product_category_list: []
                });
                this.props.loadingStop();
            });
    }

    getProductList = (product_category_id, endorsementInfo) => {
        const formData = new FormData();
        
        let encryption = new Encryption();
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";    
        if (user_data.user) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));
        }
        
        formData.append('product_category_id', product_category_id)
        formData.append('user_id', user_data.bc_master_id)
        formData.append('is_update', 1)
        formData.append('endrosment_data_id', this.state.endorsement_data_id)
      
        if(user_data.login_type == 4) {
            if(user_data.bc_master_id == 5) {
                formData.append('user_type', 'csc')
            }
            else {
                formData.append('user_type', 'bc')
                formData.append('agent_id', user_data.user_name)
            }
        }
        else {
            formData.append('user_type', user_data.user_type)
        }     
        axios
            .post('dyi-endorsement/product-list', formData)
            .then(res => {
                if(res.data.error == false) {
                    let product_list = res.data.data.products ? res.data.data.products : []
                    this.setState({
                        product_list,
                        // endorsement_info_id:res.data.data.endorsementinfo_id,
                        // endorsement_data_id:res.data.data.endrosment_data_id
                    })
                    this.getEndorsmentList(endorsementInfo)
                }    
                else{
                    this.props.loadingStop();
                }         
            })
            .catch(err => {
                this.setState({
                    product_category_list: []
                });
                this.props.loadingStop();
            });        
    }

    getEndorsementSubtypeList=(endorsementInfo)=>{
        let endorsement_sub_type_list = []
        for(let i=0; i<endorsementInfo.length; i++){
            let product_endorsement_id = endorsementInfo[i].product_endorsement_type_id
            const formData=new FormData();
            formData.append("endrosment_data_id",this.state.endorsement_data_id);
            formData.append("endorsementinfo_id",endorsementInfo[i].id)
            formData.append("product_endorsement_id",product_endorsement_id);
            formData.append("type",1);
            this.props.loadingStart();
            axios
            .post('dyi-endorsement/update-endorsement-value',formData)
            .then(res=>{      
                endorsement_sub_type_list[i] = res.data.data.endorsement_field_value
                this.setState({
                    endorsement_sub_type_list: endorsement_sub_type_list
                })         
                this.props.loadingStop();
            })
            .catch(err=>{
                this.props.loadingStop();
            })
        }
        this.getEndorsementDetails()
    }

    getEndorsmentList=(endorsementInfo)=>{
        let product_id = endorsementInfo[0].product_id
        let formData=new FormData();
        formData.append("endorsementinfo_id",endorsementInfo[0].id);
        formData.append("product_id",product_id);
        axios
        .post(`dyi-endorsement/endorsement-type-list`,formData)
        .then(res=>{
            if(res.data.error == false) {
                this.setState({
                    product_endorsement_list:res.data.data.product_endorsement_list
                })
                this.getEndorsementSubtypeList(endorsementInfo)
            }
            else {
                this.props.loadingStop();
            }
        })
        .catch(err=>{
            this.props.loadingStop();
        })  
    }

    getAddEndorsementFields=(field_id,values, errors, touched, setFieldTouched, setFieldValue, i)=>{
        const formData=new FormData();
        const {addEndorsementFields} = this.state
        formData.append("endorsementinfo_id",this.state.type2_info_id);
        formData.append("endrosment_data_id",this.state.endorsement_data_id);
        formData.append("field_id",field_id);
        formData.append("policy_number",values.policy_no);
        this.props.loadingStart();
        axios
        .post('dyi-endorsement/fields',formData)
        .then(res=>{
            addEndorsementFields[i] = res.data.data.fields
            // this.setState({
            //     addEndorsementFields:res.data.data.fields
            // })
            this.additionalEndorsement(values, errors, touched, setFieldTouched, setFieldValue)
            this.props.loadingStop();
           
        })
        .catch(err=>{
            this.props.loadingStop();
        })
    }
    getEndorsementFields=(field_id,values, setFieldTouched, setFieldValue)=>{
        const formData=new FormData();
        formData.append("endorsementinfo_id",this.state.endorsement_info_id);
        formData.append("endrosment_data_id",this.state.endorsement_data_id);
        formData.append("field_id",field_id);
        formData.append("policy_number",values.policy_no);

        this.props.loadingStart();
        axios
        .post('dyi-endorsement/fields',formData)
        .then(res=>{
            if(res.data.error == false) {
                this.setState({
                    ...this.state,
                    endorsementfields:res.data.data.fields
                })         
                this.props.loadingStop();
                this.initEndorsementUpdate(values,setFieldTouched, setFieldValue, res.data.data.fields)   
            }
            else {
                this.props.loadingStop();
            }
            
        })
        .catch(err=>{
            this.props.loadingStop();
        })
    }

    makeAddEndorsementOldField=(values, errors, touched, setFieldTouched, setFieldValue,j)=>{
        const arr=[];
        const {endorsementInfo} =this.state
        let endorsementfields = endorsementInfo && endorsementInfo[j] && endorsementInfo[j].master_fields ? JSON.parse(endorsementInfo[j].master_fields) : []
        endorsementfields && Object.keys(endorsementfields).map((item,i)=>
        arr.push(
            <FormGroup key={`oldAdd${i}`}>
                <Field
                    name={`additionalEndorsement[${j}]addEndorsementInitValues[${i}]add_endorsement_old_value`}
                    type="text"
                    autoComplete="off"
                    placeholder={`Additional Old ${endorsementfields[item]}`}
                    className="formGrp inputfs12"
                    // onChange={(e)=>{
                    //     setFieldValue(`additionalEndorsement[${j}]add_endorsement_old_value`,e.target.value)
                    // }}
                >
                </Field>
                {errors.additionalEndorsement && errors.additionalEndorsement[j] && errors.additionalEndorsement[j].addEndorsementInitValues && errors.additionalEndorsement[j].addEndorsementInitValues[i] && errors.additionalEndorsement[j].addEndorsementInitValues[i].add_endorsement_old_value
                && touched.additionalEndorsement && touched.additionalEndorsement[j] && touched.additionalEndorsement[j].addEndorsementInitValues && touched.additionalEndorsement[j].addEndorsementInitValues[i] && touched.additionalEndorsement[j].addEndorsementInitValues[i].add_endorsement_old_value ? (
                    <span className="errorMsg">{errors.additionalEndorsement[j].addEndorsementInitValues[i].add_endorsement_old_value}</span>
                ) : null}
            </FormGroup>
        ) )      
       return arr;            
     }
     
     makeAddEndorsementNewField=(values, errors, touched, setFieldTouched, setFieldValue,j)=>{
        const arr=[];
        const {endorsementInfo} =this.state
        let endorsementfields = endorsementInfo && endorsementInfo[j] && endorsementInfo[j].master_fields ? JSON.parse(endorsementInfo[j].master_fields) : []
        endorsementfields && Object.keys(endorsementfields).map((item,i)=>
        arr.push(
            <FormGroup key={`oldAdd${i}`}>
                <Field
                    name={`additionalEndorsement[${j}]addEndorsementInitValues[${i}]add_endorsement_new_value`}
                    type="text"
                    autoComplete="off"
                    placeholder={`Additional New ${endorsementfields[item]}`}
                    className="formGrp inputfs12"
                    // onChange={(e)=>{                     
                    //     setFieldValue(`additionalEndorsement[${j}]add_endorsement_new_value`,e.target.value)
                    // }}
                >
                </Field>
                {errors.additionalEndorsement && errors.additionalEndorsement[j] && errors.additionalEndorsement[j].addEndorsementInitValues && errors.additionalEndorsement[j].addEndorsementInitValues[i] && errors.additionalEndorsement[j].addEndorsementInitValues[i].add_endorsement_new_value 
                && touched.additionalEndorsement && touched.additionalEndorsement[j] && touched.additionalEndorsement[j].addEndorsementInitValues && touched.additionalEndorsement[j].addEndorsementInitValues[i] && touched.additionalEndorsement[j].addEndorsementInitValues[i].add_endorsement_new_value ? (
                    <span className="errorMsg">{errors.additionalEndorsement[j].addEndorsementInitValues[i].add_endorsement_new_value}</span>
                ) : null}
            </FormGroup>
        )  )      
       return arr;             
     }


     makeEndorsementOldField=(values, errors, touched, setFieldTouched, setFieldValue)=>{
        const arr=[];
        const {endorsementInfo} =this.state
        let endorsementfields = endorsementInfo && endorsementInfo[0] && endorsementInfo[0].master_fields ? JSON.parse(endorsementInfo[0].master_fields) : []
        // console.log("endorsementfields ------------ ", endorsementfields)
        endorsementfields && Object.keys(endorsementfields).map((item,i)=>
        arr.push(    
             <FormGroup key={`old${i}`}>
                 <Field
                    name={`makeEndorsement[${i}].Old_values`}
                    type="text"
                    autoComplete="off"
                    placeholder = {`Old ${endorsementfields[item]}`}
                    className="formGrp inputfs12"
                    // onChange={(e)=>{
                    //     setFieldValue(`makeEndorsement[${i}].Old_values`,e.target.value)
                    // }}                                             
                >  
                </Field>
                {errors.makeEndorsement && errors.makeEndorsement[i] && errors.makeEndorsement[i].Old_values 
                && touched.makeEndorsement && touched.makeEndorsement[i] && touched.makeEndorsement[i].Old_values ? (
                    <span className="errorMsg">{errors.makeEndorsement[i].Old_values}</span>
                ) : null}
             </FormGroup>
        ) )   
       return arr;
             
     }

    makeEndorsementNewField=(values, errors, touched, setFieldTouched, setFieldValue)=>{
       const arr=[];
       const {endorsementInfo} =this.state
       let endorsementfields = endorsementInfo && endorsementInfo[0] && endorsementInfo[0].master_fields ? JSON.parse(endorsementInfo[0].master_fields) : []
       endorsementfields && Object.keys(endorsementfields).map((item,i)=>
       arr.push( 
            <FormGroup key={`new${i}`}>
                 <Field
                    name= {`makeEndorsement[${i}].New_values`}
                    type="text"
                    autoComplete="off"
                    placeholder = {`New ${endorsementfields[item]}`}
                    className="formGrp inputfs12"
                        // onChange={(e)=>{
                        //     setFieldValue(`makeEndorsement[${i}].New_values`,e.target.value)
                        // }}                                             
                >  
                 </Field>
                 {errors.makeEndorsement && errors.makeEndorsement[i] && errors.makeEndorsement[i].New_values 
                 && touched.makeEndorsement && touched.makeEndorsement[i] && touched.makeEndorsement[i].New_values ? (
                    <span className="errorMsg">{errors.makeEndorsement[i].New_values}</span>
                ) : null}
            </FormGroup>
       )
        )
       
      return arr;
            
    }

    initClaimDetailsList = () => {
        const {endorsementInfo} = this.state
        let innicialClaimList = []
        let newEndorsementfields = endorsementInfo && endorsementInfo[0] && endorsementInfo[0].new_values ? JSON.parse(endorsementInfo[0].new_values) : []
        let oldEndorsementfields = endorsementInfo && endorsementInfo[0] && endorsementInfo[0].old_values ? JSON.parse(endorsementInfo[0].old_values) : []

        newEndorsementfields && Object.keys(newEndorsementfields).map((item,i)=>{
            innicialClaimList.push(
                {
                    // endorsement_type: endorsement_array && endorsement_array[i] && endorsement_array[i].endorsement_type ? endorsement_array[i].endorsement_type : "",
                    // endorsement_sub_type: endorsement_array && endorsement_array[i] && endorsement_array[i].endorsement_sub_type ? endorsement_array[i].endorsement_sub_type : "",
                    // request_receive_date: endorsement_array && endorsement_array[i] && endorsement_array[i].request_receive_date ? endorsement_array[i].request_receive_date : "",
                    New_values: newEndorsementfields && newEndorsementfields[item],
                    Old_values: oldEndorsementfields && oldEndorsementfields[item],
                }
                
            )
        })
        return innicialClaimList

    };

    initAddClaimDetailsList = () => {
        const {endorsementInfo} = this.state
        let innicialClaimList = [{"new":"", "old":""}] 
        let add_endorsement_old_value = []
        let add_endorsement_new_value = []
        if(endorsementInfo.length >1 ) {
            for(let i = 1; i<endorsementInfo.length ; i++ ){
                let newEndorsementfields = endorsementInfo && endorsementInfo[i] && endorsementInfo[i].new_values ? JSON.parse(endorsementInfo[i].new_values) : []
                let oldEndorsementfields = endorsementInfo && endorsementInfo[i] && endorsementInfo[i].old_values ? JSON.parse(endorsementInfo[i].old_values) : []
                let tempInnicialClaimList = []
                newEndorsementfields && Object.keys(newEndorsementfields).map((item,i)=>{
                    tempInnicialClaimList.push(
                        {
                            add_endorsement_new_value: newEndorsementfields && newEndorsementfields[item],
                            add_endorsement_old_value: oldEndorsementfields && oldEndorsementfields[item],
                        }
                        
                    )         
                })
                innicialClaimList.push({
                    addEndorsementInitValues: tempInnicialClaimList,
                    add_endorsement_type: endorsementInfo && endorsementInfo.length > 0 && endorsementInfo[i].product_endorsement_type_id ? endorsementInfo[i].product_endorsement_type_id : "",
                    add_endorsement_sub_type: endorsementInfo && endorsementInfo.length > 0 && endorsementInfo[i].master_endorsement_id ? endorsementInfo[i].master_endorsement_id : "",
                    add_endorsement_received_date: endorsementInfo && endorsementInfo.length > 0 && endorsementInfo[i].req_receive_date ? new Date(endorsementInfo[i].req_receive_date) : "",

                })
                
            }
        }
        // console.log("item ===================== ", newEndorsementfields && newEndorsementfields[item])
                    // console.log("newEndorsementfields==================== ", newEndorsementfields)
        
        return innicialClaimList
    };

    initEndorsementUpdate = async (values,setFieldTouched, setFieldValue ,endorsementfields ) => {
        let innicialClaimList = []

        endorsementfields && Object.keys(endorsementfields).map((item,i)=>{
            innicialClaimList.push(
                {
                    // endorsement_type: endorsement_array && endorsement_array[i] && endorsement_array[i].endorsement_type ? endorsement_array[i].endorsement_type : "",
                    // endorsement_sub_type: endorsement_array && endorsement_array[i] && endorsement_array[i].endorsement_sub_type ? endorsement_array[i].endorsement_sub_type : "",
                    // request_receive_date: endorsement_array && endorsement_array[i] && endorsement_array[i].request_receive_date ? endorsement_array[i].request_receive_date : "",
                    Old_values: "",
                    New_values: "",
                }
                
            )
        })
        setFieldValue("makeEndorsement",innicialClaimList)
    };

    onFileChange=(e)=>{
        this.setState({
            ...this.state,
            selectedFile:e.target.files
        }) 
    }

    Delete=(endorsementDetails)=>{
        console.log("hello --------------")
        const formData=new FormData();
        formData.append("doc_id",endorsementDetails.endorsement_doc_id);
        formData.append("endorsementdata_id",this.state.endorsement_data_id)
        swal({
            title: "Do you want to delete document",
            icon: "warning", 
            dangerMode: true
        })
        .then((willDelete) => {
            if (willDelete) {
                this.props.loadingStart();
                axios
                .post('dyi-endorsement/delete-document',formData)
                .then(res=>{
                    swal(res.data.msg)
                    .then((willUpdate) =>{
                        if(willUpdate) {
                            // this.getDetails()
                            this.getEndorsementDetails()
                        }
                    } )
                })
                .catch(err=>{
                    this.props.loadingStop();
                
                })
                
            }             
          })
            
    }

    deleteEndorsement =(endorsementInfo,i)=>{
        const formData=new FormData();
        formData.append("endorsementdata_id",endorsementInfo[i].endrosmentdata_id)
        formData.append("endrosment_id",endorsementInfo[i].endrosment_id)
        swal({
            title: "Do you want to delete endorsement",
            icon: "warning", 
            dangerMode: true
        })
        .then((willDelete) => {
            if (willDelete) {
                this.props.loadingStart();
                axios
                .post('dyi-endorsement/delete',formData)
                .then(res=>{
                    if(res.data.error == false){
                        swal(res.data.msg)
                        .then((willUpdate) =>{
                            if(willUpdate) {
                                // this.getDetails()
                                this.props.updateList()
                            }
                        })
                    }
                    else {
                        swal(res.data.msg)
                        this.props.loadingStop();
                    }
                })
                .catch(err=>{
                    this.props.loadingStop();
                
                })
                
            }             
        })
    }
    
   getAddEndorsementSubTypeList=(product_endorsement_id,values, errors, touched, setFieldTouched, setFieldValue,i)=>{
    const {additionalEndorsement_sub_type_list} = this.state
    const formData=new FormData();
    formData.append("endrosment_data_id",this.state.endorsement_data_id);
    formData.append("endorsementinfo_id",this.state.endorsement_info_id)
    formData.append("product_endorsement_id",product_endorsement_id);
    formData.append("type",2);
    this.props.loadingStart();
    axios
    .post('dyi-endorsement/update-endorsement-value',formData)
    .then(res=>{
        additionalEndorsement_sub_type_list[i] = res.data.data.endorsement_field_value
        this.setState({
            // additionalEndorsement_sub_type_list:res.data.data.endorsement_field_value,
            type2_info_id:res.data.data.new_endorsement_info

        })
       
        this.additionalEndorsement(values, errors, touched, setFieldTouched, setFieldValue)
        this.props.loadingStop();
    })
    .catch(err=>{
        this.props.loadingStop();
    
    })
   }

   handleSubmit=(values,actions)=>{
    const formData=new FormData();
    formData.append("user_email",values.email_id)
    formData.append("user_mobile",values.mobile_no)
    formData.append("endorsementdata_id",this.state.endorsement_data_id)
    formData.append("endorsementinfo_id",this.state.endorsement_info_id)
    let newValues = []
    let oldValues = []
    values.makeEndorsement && values.makeEndorsement.length > 0 && values.makeEndorsement.map((item,i)=>{
        newValues.push(item.New_values)
        oldValues.push(item.Old_values)
    } )
    formData.append(`new_endrosment_values`,JSON.stringify(newValues))
    formData.append(`old_endrosment_values`,JSON.stringify(oldValues))
    
    values.additionalEndorsement && values.additionalEndorsement.length > 0 && values.additionalEndorsement.map((item,i)=>{
        let addNewValues = []
        let addOldValues = []
        if(i > 0) {
            item.addEndorsementInitValues && item.addEndorsementInitValues.length > 0 && item.addEndorsementInitValues.map((subItem,j)=>{
                addNewValues.push(subItem.add_endorsement_new_value)
                addOldValues.push(subItem.add_endorsement_old_value)
            } )
    
            formData.append(`new_additional_endrosment_values[${i-1}]`,JSON.stringify(addNewValues))
            formData.append(`old_additional_endrosment_values[${i-1}]`,JSON.stringify(addOldValues))
        }       
    } )
   
    this.props.loadingStart();
    axios
    .post("dyi-endorsement/update",formData)
    .then(res=>{
        if(res.data.error == false) {
            swal({
                title: res.data.msg,
                text: "Serial number: "+res.data.data.sr_no,
                icon: "success",
                // buttons: true,
                dangerMode: false,
              })
              .then((willDownload) => {
                if (willDownload) {
                    actions.setSubmitting(false)
                    actions.resetForm(true)
                    this.props.updateList()
                }             
              })
            
            this.props.loadingStop();
        }
        else{
            swal(res.data.msg)
            this.props.loadingStop();
        }
        
    })
    .catch((err)=>{
        this.props.loadingStop()
    })
   
}

    endorsement = (values, errors, touched, setFieldTouched, setFieldValue, loop) => {
        let field_array = []
        const {endorsementfields, endorsement_sub_type_list, product_endorsement_list} = this.state
        let request_receive_date = []  
            field_array.push(
                <FormGroup key = {2}>
                    <Row className="row formSection">
                        <label className="col-md-3">Endorsement Type:</label>
                        <div className="col-md-4">
                            
                            <div className="formSection">
                                <Field
                                    name= "endorsement_type"
                                    component="select"
                                    autoComplete="off"
                                    className="formGrp inputfs12"
                                     value = {values.endorsement_type} 
                                     disabled = {true} 
                                    //  onChange={(e)=>{
                                    //      this.getEndorsementSubtypeList(e.target.value)
                                    //      setFieldValue("endorsement_type",e.target.value)
                                    //      setFieldTouched("endorsement_type")
                                    //  }} 
                                                                      
                                >  
                                    <option value="">List Of Endorsement Type </option>
                                    {product_endorsement_list && product_endorsement_list.map(data=>                            
                                        <option value={data.id} key= {data.id}>{data.endorsement_type_name}</option>   
                                    )}
                                    
                                </Field>
                                {errors.endorsement_type ? (
                                    <span className="errorMsg">{errors.endorsement_type}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>

                    <Row className="row formSection">
                        <label className="col-md-3">Endorsement Sub type:</label>
                        <div className="col-md-4">
                            
                            <div className="formSection">
                                <Field
                                    name= "endorsement_sub_type" 
                                    component="select"
                                    autoComplete="off"
                                    className="formGrp inputfs12"
                                     value = {values.endorsement_sub_type}  
                                     disabled = {true} 
                                    //  onChange={(e)=>{
                                       
                                    //     this.getEndorsementFields(e.target.value,values, setFieldTouched, setFieldValue);    
                                         
                                    //     setFieldValue("endorsement_sub_type",e.target.value);
                                    //     setFieldTouched("endorsement_sub_type")
                                    //  }} 
                                                                           
                                >  
                                    <option value="">List Of Endorsement Sub Type </option>
                                    {endorsement_sub_type_list && endorsement_sub_type_list.length>0 && endorsement_sub_type_list[0] && endorsement_sub_type_list[0].length>0 && endorsement_sub_type_list[0].map(data=>
                                        <option value={data.id} key= {data.id}>{data.Sub_Type}</option>
                                    )}
                                    
                                </Field>
                                {errors.endorsement_sub_type ? (
                                    <span className="errorMsg">{errors.endorsement_sub_type}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>

                    <Row className="row formSection">
                        <label className="col-md-3">Request Receive Date:</label>
                        <div className="col-md-4">                                            
                            <div className="formSection">                         
                                <DatePicker
                                    name= "endorsement_received_date"
                                    dateFormat="dd MMM yyyy"
                                    placeholderText="Request Receive Date"
                                    peekPreviousMonth
                                    peekPreviousYear
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    // maxDate={new Date(maxDobAdult)}
                                    // minDate={new Date(minDobAdult)}
                                    className="datePckr"
                                    selected={values.endorsement_received_date}
                                    disabled = {true} 
                                    onChange={(val) => {                                        
                                        setFieldTouched("endorsement_received_date");
                                        setFieldValue("endorsement_received_date", val);
                                    }}
                                />
                                {errors.endorsement_received_date ? (
                                    <span className="errorMsg">{errors.endorsement_received_date}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>

                    <Row className="row formSection">
                        <label className="col-md-3">Old Value:</label>
                        <div className="col-md-4">
                           
                            <div className="formSection">
                            {this.makeEndorsementOldField(values, errors, touched, setFieldTouched, setFieldValue)}
                            </div>
                        </div>
                    </Row>
                    

                    <Row className="row formSection">
                        <label className="col-md-3">New Value:</label>
                        <div className="col-md-4">     
                            <div className="formSection">
                                {this.makeEndorsementNewField(values, errors, touched, setFieldTouched, setFieldValue)}                             
                            </div>
                        </div>
                    </Row>
                </FormGroup>
            )
        return field_array

    }


    additionalEndorsement = (values, errors, touched, setFieldTouched, setFieldValue) => {
        const {endorsementInfo,add_endorsement_received_date, count, product_endorsement_list, endorsement_sub_type_list} = this.state
        let field_array = []
        let request_receive_date = []
        // {console.log("endorsement_sub_type_list ====================== ",  endorsement_sub_type_list)}
        for(let i =1; i<=count; i++){
            field_array.push(
                <FormGroup key = {i}>
                    <Row className="row formSection">
                        <label className="col-md-3">Endorsement Type:</label>
                        <div className="col-md-4">
                            
                            <div className="formSection">
                                <Field
                                    name= {`additionalEndorsement[${i}]add_endorsement_type`}
                                    component="select"
                                    autoComplete="off"
                                    className="formGrp inputfs12"
                                    disabled = {true} 
                                    //  value = {values.add_endorsement_type} 
                                    //  onChange={(e)=>{         
                                    //     setFieldValue(`additionalEndorsement[${i}]add_endorsement_type`,e.target.value)
                                    //      this.getAddEndorsementSubTypeList(e.target.value,values, errors, touched, setFieldTouched, setFieldValue, i)                             
                                    //  }} 
                                                                      
                                >  
                                    <option value="">List Of Endorsement Type </option>
                                    { product_endorsement_list && product_endorsement_list.map(data=>
                                        <option value={data.id} key= {data.id}>{data.endorsement_type_name}</option>      
                                    )}               
                                </Field>
                                {errors.additionalEndorsement && errors.additionalEndorsement[i] && errors.additionalEndorsement[i].add_endorsement_type 
                                && touched.additionalEndorsement && touched.additionalEndorsement[i] && touched.additionalEndorsement[i].add_endorsement_type? (
                                    <span className="errorMsg">{errors.additionalEndorsement[i].add_endorsement_type}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>

                    <Row className="row formSection">
                        <label className="col-md-3">Endorsement Sub type:</label>
                        <div className="col-md-4">
                            
                            <div className="formSection">
                                <Field
                                    name= {`additionalEndorsement[${i}]add_endorsement_sub_type`}
                                    component="select"
                                    autoComplete="off"
                                    className="formGrp inputfs12"
                                    disabled = {true} 
                                    //  value = {values.endorsement_sub_type}  
                                    //  onChange={(e)=>{
                                    //     setFieldValue(`additionalEndorsement[${i}]add_endorsement_sub_type`,e.target.value)
                                    //     this.getAddEndorsementFields(e.target.value,values, errors, touched, setFieldTouched, setFieldValue, i);
                                    //  }}                                                                  
                                >  
                                    <option value="">List Of Endorsement Sub Type </option>                                           
                                    {endorsement_sub_type_list && endorsement_sub_type_list.length>0 && endorsement_sub_type_list[i] && endorsement_sub_type_list[i].length>0 && endorsement_sub_type_list[i].map(data=>
                                        <option value={data.id} key= {data.id}>{data.Sub_Type}</option>
                                    )}
                                </Field>
                                {errors.additionalEndorsement && errors.additionalEndorsement[i] && errors.additionalEndorsement[i].add_endorsement_sub_type
                                && touched.additionalEndorsement && touched.additionalEndorsement[i] && touched.additionalEndorsement[i].add_endorsement_sub_type ? (
                                    <span className="errorMsg">{errors.additionalEndorsement[i].add_endorsement_sub_type}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>

                    <Row className="row formSection">
                        <label className="col-md-3">Request Receive Date:</label>
                        <div className="col-md-4">                                            
                            <div className="formSection">                         
                                <DatePicker
                                    name= {`additionalEndorsement[${i}]add_endorsement_received_date`}
                                    dateFormat="dd MMM yyyy"
                                    placeholderText="Request Receive Date"
                                    peekPreviousMonth
                                    peekPreviousYear
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    // maxDate={new Date(maxDobAdult)}
                                    // minDate={new Date(minDobAdult)}
                                    className="datePckr"
                                    // selected={values.add_endorsement_received_date}
                                    selected={values.additionalEndorsement[i].add_endorsement_received_date}
                                    // onChange={(val) => {  
                                    //     add_endorsement_received_date[i]=val
                                    //     setFieldTouched(`additionalEndorsement[${i}]add_endorsement_received_date`);
                                    //     setFieldValue(`additionalEndorsement[${i}]add_endorsement_received_date`, val);
                                    //     // { console.log("selected date ------------- ",add_endorsement_received_date )}
                                    //     }}
                                />
                                {errors.additionalEndorsement && errors.additionalEndorsement[i] && errors.additionalEndorsement[i].add_endorsement_received_date 
                                && touched.additionalEndorsement && touched.additionalEndorsement[i] && touched.additionalEndorsement[i].add_endorsement_received_date? (
                                    <span className="errorMsg">{errors.additionalEndorsement[i].add_endorsement_received_date}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>
                    
                    <Row className="row formSection">
                        <label className="col-md-3">Old Value:</label>
                        <div className="col-md-4">
                           
                            <div className="formSection">
                            {this.makeAddEndorsementOldField(values, errors, touched, setFieldTouched, setFieldValue,i)}                   
                            {errors.additionalEndorsement && errors.additionalEndorsement[i] && errors.additionalEndorsement[i].add_endorsement_old_value ? (
                                    <span className="errorMsg">{errors.additionalEndorsement[i].add_endorsement_old_value}</span>
                            ) : null}
                            
                            </div>
                        </div>
                    </Row>

                    <Row className="row formSection">
                        <label className="col-md-3">New Value:</label>
                        <div className="col-md-4">
                            
                            <div className="formSection">
                                {this.makeAddEndorsementNewField(values, errors, touched, setFieldTouched, setFieldValue,i)}
                                {errors.additionalEndorsement && errors.additionalEndorsement[i] && errors.additionalEndorsement[i].add_endorsement_new_value ? (
                                    <span className="errorMsg">{errors.additionalEndorsement[i].add_endorsement_new_value}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>
                    <Row className="row formSection">
                        <Button className={`proceedBtn`} type="button" onClick = {this.deleteEndorsement.bind(this,endorsementInfo,i)}>
                            Delete Endorsement
                        </Button>
                    </Row>
                    

                </FormGroup>
            )
        }
        return field_array;
    }


    componentDidMount(){
        this.getProductCategoryList(this.props.endorsementInfo);
    }

    render() {
        const { product_category_list, product_list,count, endorsementDetails,endorsementInfo} = this.state
        const newInitialValues = Object.assign(initialValues,{
            makeEndorsement: this.initClaimDetailsList(),
            additionalEndorsement: this.initAddClaimDetailsList(),
            product_category: endorsementInfo && endorsementInfo.length > 0 && endorsementInfo[0].endorsement_product_category_id ? endorsementInfo[0].endorsement_product_category_id : "",
            product: endorsementInfo && endorsementInfo.length > 0 && endorsementInfo[0].product_id ? endorsementInfo[0].product_id : "",
            policy_no: endorsementDetails && endorsementInfo.length > 0 && endorsementDetails.policy_no ? endorsementDetails.policy_no : "",
            endorsement_type: endorsementInfo && endorsementInfo.length > 0 && endorsementInfo[0].product_endorsement_type_id ? endorsementInfo[0].product_endorsement_type_id : "",
            endorsement_sub_type: endorsementInfo && endorsementInfo.length > 0 && endorsementInfo[0].master_endorsement_id ? endorsementInfo[0].master_endorsement_id : "",
            newCount:count,
            email_id: endorsementDetails && endorsementInfo.length > 0 && endorsementDetails.email ? endorsementDetails.email : "",
            mobile_no: endorsementDetails && endorsementInfo.length > 0 && endorsementDetails.mobile ? endorsementDetails.mobile : "",
            endorsement_received_date: endorsementInfo && endorsementInfo.length > 0 && endorsementInfo[0].req_receive_date ? new Date(endorsementInfo[0].req_receive_date) : "",
        })
        
        return (
            <>
                <div >
                    <section className="brand">
                        <div className="boxpd">
                            <Formik initialValues={newInitialValues} 
                            onSubmit={this.handleSubmit }
                             validationSchema={endorsementValidation}
                            >
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                // console.log("newInitialValues ---------- ", values)
                                // console.log("error=======",errors)
                                
                            return (
                                <Form>    
                                <div className="brandhead"> 
                                    <Row className="row formSection">
                                        <label className="col-md-3">Email Address:</label>
                                        <div className="col-md-4">
                                            
                                            <div className="formSection">
                                                <Field
                                                     name='email_id'
                                                    type="text"
                                                    autoComplete="off"
                                                    placeholder = "Email Address"
                                                    className="formGrp inputfs12"
                                                    value = {values.email_id}      
                                                    // disabled = {true}                                       
                                                >  
                                                </Field>
                                                {errors.email_id && touched.email_id ? (
                                                    <span className="errorMsg">{errors.email_id}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Row>

                                    <Row className="row formSection">
                                        <label className="col-md-3">Mobile Number:</label>
                                        <div className="col-md-4">
                                            
                                            <div className="formSection">
                                                <Field
                                                    name='mobile_no'
                                                    type="text"
                                                    autoComplete="off"
                                                    placeholder = "Mobile Number"
                                                    className="formGrp inputfs12"
                                                    value = {values.mobile_no}          
                                                    // disabled = {true}                                    
                                                >  
                                                </Field>
                                                {errors.mobile_no && touched.mobile_no ? (
                                                    <span className="errorMsg">{errors.mobile_no}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Row>

                                    <Row className="row formSection">
                                        <label className="col-md-3">Product Category:</label>
                                        <div className="col-md-4">
                                            
                                            <div className="formSection">
                                                <Field
                                                    name='product_category'
                                                    component="select"
                                                    autoComplete="off"
                                                    className="formGrp inputfs12"
                                                    value = {values.product_category}     
                                                    disabled = {true}    
                                                    // onChange = {(e) => {
                                                    //     this.getProductList(e.target.value)
                                                    // }}                                      
                                                >  
                                                    <option value="">Select product category</option>
                                                    {product_category_list && product_category_list.map((resource, rindex) => 
                                                    <option value = {resource.id} key= {resource.id}> {resource.category_name}</option>
                                                    )}
                                                   
                                                   
                                                </Field>
                                                {errors.product_category && touched.product_category ? (
                                                    <span className="errorMsg">{errors.product_category}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Row>

                                    <Row className="row formSection">
                                        <label className="col-md-3">Product:</label>
                                        <div className="col-md-4">
                                            
                                            <div className="formSection">
                                                <Field
                                                    name='product'
                                                    component="select"
                                                    autoComplete="off"
                                                    className="formGrp inputfs12"
                                                    value = {values.product}  
                                                    disabled = {true} 
                                                    // onChange={(e)=>{
                                                    //     this.getEndorsmentList(e.target.value)
                                                    // }}                                                                                     
                                                >  
                                                
                                                    <option value="">Select product </option>
                                                    {product_list && product_list.map((resource, rindex) => 
                                                    <option value = {resource.id} key= {resource.id}> {resource.product_name}</option>
                                                    )}
                                                   
                                                </Field>
                                                {errors.product && touched.product ? (
                                                    <span className="errorMsg">{errors.product}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Row>

                                    <Row className="row formSection">
                                        <label className="col-md-3">Policy Number:</label>
                                        <div className="col-md-4">
                                            
                                            <div className="formSection">
                                                <Field
                                                    name='policy_no'
                                                    type="text"
                                                    autoComplete="off"
                                                    placeholder = "Policy Number"
                                                    className="formGrp inputfs12"
                                                    value = {values.policy_no}       
                                                    disabled = {true}                                       
                                                >  
                                                </Field>
                                                {errors.policy_no && touched.policy_no ? (
                                                    <span className="errorMsg">{errors.policy_no}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Row>
                                    {this.endorsement(values, errors, touched, setFieldTouched, setFieldValue)}
                                    

                                    {/* <Row className="row formSection">
                                        <label className="col-md-3">Add another endorsement:</label>
                                        <div className="col-md-4">                                
                                       {<Button type="button" onClick = {()=> {
                                                let newCount = count+1
                                                this.setState({count:newCount})
                                                setFieldValue("newCount", newCount)
                                            }               
                                        } 
                                        >
                                           +
                                        </Button>}

                                        </div>
                                    </Row> */}
                                    {/* {this.state.endorsement_array} */}
                                    {values.newCount > 0 ?
                                        this.additionalEndorsement(values, errors, touched, setFieldTouched, setFieldValue) : null
                                    }
                                    {endorsementDetails && endorsementDetails.endorsement_doc_id ?
                                    
                                     <Row className="row formSection">
                                         <label className="col-md-3">Documents:</label>
                                         <div className="col-md-4">
                                         <span className="description">{endorsementDetails.documents}</span>
                                             {/* <input type="file"  key='1' multiple name="file" onChange={(e)=> this.onFileChange(e)}/> */}
                                         </div>
                                         {/* <Button type="button" onClick={()=>this.upload()}>Upload</Button> */}
                                         <Button type="button" onClick={()=>this.Delete(endorsementDetails)}>Delete</Button>
                                     </Row> : null}

                                    <Button className={`proceedBtn`} type="button" onClick = {this.props.backButton}>
                                        Back
                                    </Button>
                                    <Button className={`proceedBtn`} type="submit">
                                        Update
                                    </Button>
                                    
                                    {/* <Button className={`proceedBtn`} type="submit" disabled={isSubmitting ? true : false}>
                                    {isSubmitting ? "Wait...." : "CREATE"}
                                    </Button> */}
                                    
                                </div>                                           
                                
                            </Form>
                            );
                        }}
                        </Formik>
                        </div>

                    </section>
                </div>        
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
      loading: state.loader.loading,
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop()),
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(UpdateEndorsement));