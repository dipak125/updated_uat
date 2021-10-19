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
    makeEndorsement: [],
    email_id: "",
    mobile_no: "",
    product_category: "",
    product: "",
    policy_no: "",
    endorsement_type: "",
    endorsement_sub_type: "",
    Old_values: "",
    Document_List: [],
    upload_count: 0

}

const endorsementValidation = Yup.object().shape({

    makeEndorsement: Yup.array().of(
        Yup.object().shape({
            New_values: Yup.string().required('This field is required'),
            // Old_values: Yup.string().required('This field is required')            
        })
    ),

    additionalEndorsement: Yup.array().of(
        Yup.object().shape({
            add_endorsement_sub_type: Yup.string().required('This field is required'),
            add_endorsement_type: Yup.string().required('This field is required'),
            addEndorsementInitValues: Yup.array().of(
                Yup.object().shape({
                    add_endorsement_new_value: Yup.string().required('This field is required'),
                    // add_endorsement_old_value: Yup.string().required('This field is required')            
                })
            )
        })
    ),

    email_id: Yup.string().required('This field is required')
                .test("email checking",
                function(){
                    return "Invalid email"
                },
                
                (value)=>{
                   if(value)
                   {
                    if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value))
                    {
                        return false;
                    }
                    return true;
                   }
                   return true;
                }),
    mobile_no: Yup.string().matches(/^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
    ,"Invalid mobile").required('This field is required')
    .test("length checking",
    function(){
        return "Invalid mobile no"
    },
    (value)=>{
       if(value)
       {
        console.log("mobile no",typeof(value))
        if( value.length!==10)
        {
            return false;
        }
        return true;
       }
       return true;
    }),
    product_category: Yup.string().required('This field is required'),
    product: Yup.string().required('This field is required'),
    policy_no: Yup.string().required('This field is required'),
    endorsement_type: Yup.string().required('This field is required'),
    endorsement_sub_type: Yup.string().required('This field is required'),

    fileData: Yup.array().of(
        Yup.object().shape({
            fileSize: Yup.string().required('This field is required')
                .test(
                    "filesize",
                    function() {
                        return "Max file size below 2MB"
                    },
                    function (value) {
                        if (value && value.size > 2097152) {             
                            return false;
                        }   
                        return true;
                    }
                ),
                fileName: Yup.string().required('This field is required')
                    .test('type', "Only Jpeg, Jpg, Png, Pdf file format is allowed", (value) => {
                        console.log("test Value ------------- ", value)
                        if (value) {
                            let fileType = value.split('.').pop();
                            return (fileType === 'jpeg' || fileType === 'png' || fileType === 'pdf');
                        }
            
                    }),   

        })
    ),


})


class BasicInfo extends Component {
    check=0;
    state = {
        product_category_list: [],
        product_list: [],
        request_receive_date: [],
        selectedFile:[],
        selectedFileName: [],
        endorsement_info_id:"",
        endorsement_data_id:"",
        product_endorsement_list:"",
        endorsement_sub_type_list:"",
        endorsementfields:{},
        addEndorsementFields:[],
        additionalEndorsement_sub_type_list:[],
        endorsement_array:[],
        type2_info_id:"",
        count:0,
        add_endorsement_received_date: [],
        Document_List: []
       
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

    getProductCategoryList = () => {
        this.props.loadingStart();
        axios
            .get(`/dyi-endorsement/product-category-list`)
            .then(res => {
                if(res.data.error == false) {
                    let product_category_list = res.data.data.product_categories ? res.data.data.product_categories : []
                    this.setState({
                        product_category_list
                        
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

    getProductList = (product_category_id) => {
        const formData = new FormData();
        
        let encryption = new Encryption();
        let user_data = sessionStorage.getItem("users") ? JSON.parse(sessionStorage.getItem("users")) : "";    
        if (user_data.user) {
            user_data = JSON.parse(encryption.decrypt(user_data.user));
        }
        
        formData.append('product_category_id', product_category_id)
        formData.append('user_id', user_data.bc_master_id)
      
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
           
        this.props.loadingStart();      
        axios
            .post('dyi-endorsement/product-list', formData)
            .then(res => {
                if(res.data.error == false) {
                    let product_list = res.data.data.products ? res.data.data.products : []
                    this.setState({
                        product_list,
                        endorsement_info_id:res.data.data.endorsementinfo_id,
                        endorsement_data_id:res.data.data.endrosment_data_id
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

    getEndorsementSubtypeList=(product_endorsement_id)=>{
        const formData=new FormData();
        formData.append("endrosment_data_id",this.state.endorsement_data_id);
        formData.append("endorsementinfo_id",this.state.endorsement_info_id)
        formData.append("product_endorsement_id",product_endorsement_id);
        formData.append("additional_index",0);
        formData.append("type",1);
        this.props.loadingStart();
        axios
        .post('dyi-endorsement/endorsement-value',formData)
        .then(res=>{
            this.setState({
                ...this.state,
                endorsement_sub_type_list:res.data.data.endorsement_field_value
            })
            this.props.loadingStop();
        })
        .catch(err=>{
            this.props.loadingStop();
        })
    }

    getEndorsmentList=(product_id)=>{
        let formData=new FormData();
        formData.append("endorsementinfo_id",this.state.endorsement_info_id);
        formData.append("product_id",product_id);
        this.props.loadingStart();
        axios
        .post(`dyi-endorsement/endorsement-type-list`,formData)
        .then(res=>{
            this.setState({
                ...this.state,
                product_endorsement_list:res.data.data.product_endorsement_list
            })
            this.props.loadingStop();
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
            if(res.data.error == false)
            {
                addEndorsementFields[i] = res.data.data.fields
            // this.setState({
            //     addEndorsementFields:res.data.data.fields
            // })
            // this.additionalEndorsement(values, errors, touched, setFieldTouched, setFieldValue)
            this.initAddClaimDetailsList(values,setFieldTouched, setFieldValue, res.data.data.fields, i) 
            }
            else
            {
                swal("Invalid Policy no")
            }
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
                let Document_List = res.data.data.Document_List
                // let Document_List = "RC Copy/Birth Certificate/Aadhar Card"
                this.setState({
                    endorsementfields:res.data.data.fields,
                    Document_List: Document_List.split("/"),
                    upload_count: res.data.data.upload_count
                })         
                this.props.loadingStop();
                this.initEndorsementUpdate(values,setFieldTouched, setFieldValue, res.data.data.fields)   
            }
            else {
                swal("Invalid Policy no")
                this.props.loadingStop();
            }
            
        })
        .catch(err=>{
            this.props.loadingStop();
        })
    }

    makeAddEndorsementOldField=(values, errors, touched, setFieldTouched, setFieldValue,j)=>{
        const arr=[];
        const {addEndorsementFields} =this.state
        // addEndorsementFields && addEndorsementFields[j] && Object.keys(addEndorsementFields[j]).map((item,i)=>
        arr.push(
            <FormGroup key={`oldAdd${j}`}>
                <Field
                    name = {`additionalEndorsement[${j}]add_endorsement_old_value`}
                    type="text"
                    autoComplete="off"
                    placeholder={`Additional Old Values`}
                    className="formGrp inputfs12"
                    onChange={(e)=>{
                        setFieldValue(`additionalEndorsement[${j}]add_endorsement_old_value`,e.target.value)
                    }}
                >
                </Field>
                {errors.additionalEndorsement && errors.additionalEndorsement[j] && errors.additionalEndorsement[j].add_endorsement_old_value 
                && touched.additionalEndorsement && touched.additionalEndorsement[j] && touched.additionalEndorsement[j].add_endorsement_old_value? (
                    <span className="errorMsg">{errors.additionalEndorsement[j].add_endorsement_old_value}</span>
                ) : null}
            </FormGroup>
        ) 
        // )      
       return arr;            
     }
     
     makeAddEndorsementNewField=(values, errors, touched, setFieldTouched, setFieldValue,j)=>{
        const arr=[];
        const {addEndorsementFields} =this.state
        addEndorsementFields && addEndorsementFields[j] && Object.keys(addEndorsementFields[j]).map((item,i)=>
        arr.push(
            <FormGroup key={`newAdd${i}`}>
                <Field
                    name={`additionalEndorsement[${j}]addEndorsementInitValues[${i}]add_endorsement_new_value`}
                    type="text"
                    autoComplete="off"
                    placeholder={`Additional New ${addEndorsementFields[j][item]}`}
                    className="formGrp inputfs12"
                    onChange={(e)=>{                     
                        setFieldValue(`additionalEndorsement[${j}]addEndorsementInitValues[${i}]add_endorsement_new_value`,e.target.value)
                    }}
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
        const {endorsementfields} =this.state
        // endorsementfields && Object.keys(endorsementfields).map((item,i)=>
        arr.push(    
             <FormGroup key={`old0`}>
                 <Field
                    name={`Old_values`}
                    type="text"
                    autoComplete="off"
                    placeholder = {`Old Value`}
                    className="formGrp inputfs12"
                    onChange={(e)=>{
                        setFieldValue(`Old_values`,e.target.value)
                    }}                                             
                >  
                </Field>         
                 {errors.Old_values && touched.Old_values ? (
                        <span className="errorMsg">{errors.Old_values}</span>
                    ) : null}
             </FormGroup>
        ) 
        // )   
       return arr;
             
     }

    makeEndorsementNewField=(values, errors, touched, setFieldTouched, setFieldValue)=>{
       const arr=[];
       const {endorsementfields} =this.state
       endorsementfields && Object.keys(endorsementfields).map((item,i)=>
       arr.push( 
            <FormGroup key={`new${i}`}>
                 <Field
                    name= {`makeEndorsement[${i}].New_values`}
                    type="text"
                    autoComplete="off"
                    placeholder = {`New ${endorsementfields[item]}`}
                    className="formGrp inputfs12"
                        onChange={(e)=>{
                            setFieldValue(`makeEndorsement[${i}].New_values`,e.target.value)
                        }}                                             
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

    initEndorsementUpdate = async (values,setFieldTouched, setFieldValue ,endorsementfields ) => {
        let innicialClaimList = []

        endorsementfields && Object.keys(endorsementfields).map((item,i)=>{
            innicialClaimList.push(
                {
                    // endorsement_type: endorsement_array && endorsement_array[i] && endorsement_array[i].endorsement_type ? endorsement_array[i].endorsement_type : "",
                    // endorsement_sub_type: endorsement_array && endorsement_array[i] && endorsement_array[i].endorsement_sub_type ? endorsement_array[i].endorsement_sub_type : "",
                    // request_receive_date: endorsement_array && endorsement_array[i] && endorsement_array[i].request_receive_date ? endorsement_array[i].request_receive_date : "",
                    // Old_values: "",
                    New_values: "",
                }
                
            )
        })
        setFieldValue("makeEndorsement",innicialClaimList)
    };

    initAddClaimDetailsList = (values,setFieldTouched, setFieldValue ,endorsementfields, j ) => {
        setFieldValue(`additionalEndorsement[${j}]add_endorsement_old_value`,"")
        endorsementfields && Object.keys(endorsementfields).map((item,i)=>{
            // setFieldValue(`additionalEndorsement[${j}]addEndorsementInitValues[${i}]add_endorsement_old_value`,"")
            setFieldValue(`additionalEndorsement[${j}]addEndorsementInitValues[${i}]add_endorsement_new_value`,"")
        })
    };


    onFileChange = async (fileSize,setFieldValue,setFieldTouched, i) => {

        console.log("fileSize ================== ", fileSize
        )
        if (fileSize[0] && fileSize[0].name !== "") {
            let selectedFileSize = fileSize[0].size;
            setFieldTouched(`fileData[${i}]fileSize`)
            setFieldValue(`fileData[${i}]fileSize`, selectedFileSize);
            setFieldTouched(`fileData[${i}]fileName`)
            setFieldValue(`fileData[${i}]fileName`, fileSize[0].name);
            
            if(selectedFileSize <= 2097152) {
                let selectedFile = fileSize[0];
                let selectedFileName = fileSize[0].name;
  
                // await this.setState({
                //     selectedFile,
                //     selectedFileName
                // })         
                this.state.selectedFile[i] = selectedFile
                this.state.selectedFileName[i] = selectedFileName
            }
            else {
                await this.setState({
                    selectedFile: [],
                    selectedFileName: []
                })      
            }
             
        }
    }

    upload=()=>{
        const formData=new FormData();
        formData.append("endorsementinfo_id",this.state.endorsement_info_id);
        formData.append("endrosment_data_id",this.state.endorsement_data_id)
        Object.keys(this.state.selectedFile).map((item,i)=>
           {
            formData.append(`attachment_file[${i}]`,this.state.selectedFile[item])
           }
        )
        this.props.loadingStart();
        axios
        .post('dyi-endorsement/document',formData)
        .then(res=>{
            swal(res.data.msg)
            this.props.loadingStop();
        })
        .catch(err=>{
            swal(err.data.msg)
            this.props.loadingStop();
        })
    }
    
   getAddEndorsementSubTypeList=(product_endorsement_id,values, errors, touched, setFieldTouched, setFieldValue,i)=>{
    const {additionalEndorsement_sub_type_list} = this.state
    const formData=new FormData();
    formData.append("endrosment_data_id",this.state.endorsement_data_id);
    formData.append("endorsementinfo_id",this.state.endorsement_info_id)
    formData.append("product_endorsement_id",product_endorsement_id);
    formData.append("additional_index",i+1);
    formData.append("type",2);
    this.props.loadingStart();
    axios
    .post('dyi-endorsement/endorsement-value',formData)
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
    // formData.append("endorsementinfo_id",this.state.endorsement_info_id)
    let newValues = []
    // let oldValues = []
    values.makeEndorsement && values.makeEndorsement.length > 0 && values.makeEndorsement.map((item,i)=>{
        newValues.push(item.New_values)
        // oldValues.push(item.Old_values)
    } )
    formData.append(`new_endrosment_values`,JSON.stringify(newValues))
    formData.append(`old_endrosment_values`,values.Old_values)

    
    values.additionalEndorsement && values.additionalEndorsement.length > 0 && values.additionalEndorsement.map((item,i)=>{
        let addNewValues = []
        // let addOldValues = []
        item.addEndorsementInitValues && item.addEndorsementInitValues.length > 0 && item.addEndorsementInitValues.map((subItem,j)=>{
            addNewValues.push(subItem.add_endorsement_new_value)
            // addOldValues.push(subItem.add_endorsement_old_value)
        } )

        formData.append(`new_additional_endrosment_values[${i}]`,JSON.stringify(addNewValues))
        formData.append(`old_additional_endrosment_values[${i}]`,item.add_endorsement_old_value)     
    })
   
    this.props.loadingStart();
    axios
    .post("dyi-endorsement/create",formData)
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
                    this.setState({product_category_list:[], addEndorsementFields:[], endorsementfields:[] })   
                    this.props.history.push("/ViewEndorsement")               
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
                                     onChange={(e)=>{
                                         this.getEndorsementSubtypeList(e.target.value)
                                         setFieldValue("endorsement_type",e.target.value)
                                         setFieldTouched("endorsement_type")
                                     }} 
                                                                      
                                >  
                                    <option value="">List Of Endorsement Type </option>
                                    {product_endorsement_list && product_endorsement_list.map(data=>                            
                                        <option value={data.id} key= {data.id}>{data.endorsement_type_name}</option>   
                                    )}
                                    
                                </Field>
                                {errors.endorsement_type && touched.endorsement_type ? (
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
                                     onChange={(e)=>{
                                       
                                        this.getEndorsementFields(e.target.value,values, setFieldTouched, setFieldValue);    
                                         
                                        setFieldValue("endorsement_sub_type",e.target.value);
                                        setFieldTouched("endorsement_sub_type")
                                     }} 
                                                                           
                                >  
                                    <option value="">List Of Endorsement Sub Type </option>
                                    {endorsement_sub_type_list && endorsement_sub_type_list.map(data=>
                                        <option value={data.id} key= {data.id}>{data.Sub_Type}</option>
                                    )}
                                    
                                </Field>
                                {errors.endorsement_sub_type && touched.endorsement_sub_type ? (
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
                                    disabled = {true}
                                    selected = {new Date()}
                                    // selected={values.endorsement_received_date}
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
                    {endorsementfields && Object.keys(endorsementfields).length > 0 ?
                    <Row className="row formSection">
                        <label className="col-md-3">Old Value:</label>
                        <div className="col-md-4">
                           
                            <div className="formSection">
                            {this.makeEndorsementOldField(values, errors, touched, setFieldTouched, setFieldValue)}
                            </div>
                        </div>
                    </Row> : null }
                    
                    {endorsementfields && Object.keys(endorsementfields).length > 0 ?
                    <Row className="row formSection">
                        <label className="col-md-3">New Value:</label>
                        <div className="col-md-4">     
                            <div className="formSection">
                                {this.makeEndorsementNewField(values, errors, touched, setFieldTouched, setFieldValue)}                             
                            </div>
                        </div>
                    </Row> : null }
                </FormGroup>
            )
        return field_array

    }


    additionalEndorsement = (values, errors, touched, setFieldTouched, setFieldValue) => {
        const {addEndorsementFields,add_endorsement_received_date, count, product_endorsement_list, additionalEndorsement_sub_type_list} = this.state
        let field_array = []
        let request_receive_date = []
        for(let i =0; i<count; i++){
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
                                    //  value = {values.add_endorsement_type} 
                                     onChange={(e)=>{         
                                        setFieldValue(`additionalEndorsement[${i}]add_endorsement_type`,e.target.value)
                                         this.getAddEndorsementSubTypeList(e.target.value,values, errors, touched, setFieldTouched, setFieldValue, i)                             
                                     }} 
                                                                      
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
                                    //  value = {values.endorsement_sub_type}  
                                     onChange={(e)=>{
                                        setFieldValue(`additionalEndorsement[${i}]add_endorsement_sub_type`,e.target.value)
                                        this.getAddEndorsementFields(e.target.value,values, errors, touched, setFieldTouched, setFieldValue, i);
                                     }}                                                                  
                                >  
                                    <option value="">List Of Endorsement Sub Type </option>                                           
                                    {additionalEndorsement_sub_type_list && additionalEndorsement_sub_type_list[i] && additionalEndorsement_sub_type_list[i].map(data=>
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
                                    disabled = {true}
                                    selected = {new Date()}
                                    // selected={add_endorsement_received_date[i]}
                                    onChange={(val) => {  
                                        add_endorsement_received_date[i]=val
                                        setFieldTouched(`additionalEndorsement[${i}]add_endorsement_received_date`);
                                        setFieldValue(`additionalEndorsement[${i}]add_endorsement_received_date`, val);
                                        }}
                                />
                                {errors.additionalEndorsement && errors.additionalEndorsement[i] && errors.additionalEndorsement[i].add_endorsement_received_date 
                                && touched.additionalEndorsement && touched.additionalEndorsement[i] && touched.additionalEndorsement[i].add_endorsement_received_date? (
                                    <span className="errorMsg">{errors.additionalEndorsement[i].add_endorsement_received_date}</span>
                                ) : null}
                            </div>
                        </div>
                    </Row>

                    {addEndorsementFields && addEndorsementFields[i] && Object.keys(addEndorsementFields[i]).length > 0 ?
                    <Row className="row formSection">
                        <label className="col-md-3">Old Value:</label>
                        <div className="col-md-4">
                           
                            <div className="formSection">
                            {this.makeAddEndorsementOldField(values, errors, touched, setFieldTouched, setFieldValue,i)}                    
                            </div>
                        </div>
                    </Row> : null }

                    {addEndorsementFields && addEndorsementFields[i] && Object.keys(addEndorsementFields[i]).length > 0 ?
                    <Row className="row formSection">
                        <label className="col-md-3">New Value:</label>
                        <div className="col-md-4">
                            
                            <div className="formSection">
                                {this.makeAddEndorsementNewField(values, errors, touched, setFieldTouched, setFieldValue,i)}
                            </div>
                        </div>
                    </Row> : null }

                </FormGroup>
            )
        }
        return field_array;
    }


    componentDidMount(){
        this.getProductCategoryList();
       
    }

    render() {
        const { product_category_list, product_list,count, Document_List, upload_count} = this.state
        const newInitialValues = Object.assign(initialValues,{
            makeEndorsement: [],
            additionalEndorsement: []
        }
        )
        console.log("Document_List ============= ", this.state.selectedFile)

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
                                console.log("values ---------- ", values)
                                console.log("error=======",errors)
                                
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
                                                    onChange = {(e) => {
                                                        this.getProductList(e.target.value)
                                                        setFieldValue("product_category",e.target.value)
                                                    }}                                      
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
                                                    onChange={(e)=>{
                                                        this.getEndorsmentList(e.target.value)
                                                        setFieldValue("product",e.target.value)
                                                    }}                                                                                     
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
                                                >  
                                                </Field>
                                                {errors.policy_no && touched.policy_no ? (
                                                    <span className="errorMsg">{errors.policy_no}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Row>
                                    {this.endorsement(values, errors, touched, setFieldTouched, setFieldValue)}
                                    

                                    <Row className="row formSection">
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
                                    </Row>
                                    {/* {this.state.endorsement_array} */}
                                    {values.newCount > 0 ?
                                        this.additionalEndorsement(values, errors, touched, setFieldTouched, setFieldValue) : null
                                    }

                                    {Document_List && Document_List.length > 0 ?
                                    <Row className="row formSection">
                                        <label className="col-md-3">Attach Documents:</label>
                                    </Row> : null }

                                    {Document_List && Document_List.length > 0 && Document_List.map((item,i)=> 
                                        <Row className="row formSection" key = {i}>
                                            <label className="col-md-3">{item}:</label>
                                            <div className="col-md-4">
                                                <input type="file" key={i} name="file"
                                                accept=".png, .jpeg, .jpg, .pdf"
                                                onChange={(e) => {
                                                    const { target } = e
                                                    if (target.value.length > 0) {           
                                                        this.onFileChange(e.target.files, setFieldValue,setFieldTouched, i)
                                                    } 
                                                }}
                                            />
                                            {errors.fileData && errors.fileData[i] && errors.fileData[i].fileSize ? (
                                                <span className="errorMsg">{errors.fileData[i].fileSize}</span>
                                            ) : null}
                                             {errors.fileData && errors.fileData[i] && errors.fileData[i].fileName ? (
                                                <span className="errorMsg">{errors.fileData[i].fileName}</span>
                                            ) : null}
                                            </div>
                                            
                                        </Row> )
                                    }
                                    
                                    
                                    <Button className={`proceedBtn`} type="submit">
                                        Submit
                                    </Button>
                                    {Document_List && Document_List.length > 0 ?
                                        <Button type="button" onClick={()=>this.upload()}>Upload Document</Button>
                                    : null }
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(BasicInfo));