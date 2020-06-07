import React, { Component } from 'react';
import HeaderSecond from '../common/header/HeaderSecond';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import BrandTable from '../common/BrandTable';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import swal from 'sweetalert';



const initialValues = {
    selectedBrandId:'',
    selectedBrandName:'',
    selectedModelId:'',
    selectedModelName:'',
    selectedVarientId:''

};

const vehicleValidation =  Yup.object().shape({        
    selectedBrandId: Yup.string().required( "Please enter the brand name"),
    selectedModelId: Yup.string().required("Please enter the model name"),
   // selectedVarientId : Yup.string().required("Please enter the varient name"),
})


class SelectBrand extends Component {

    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            brandList:[],
            motorInsurance:{},
            selectedBrandId:'',
            selectedBrandName:'',
            selectedModelId:'',
            selectedModelName:'',
            selectedBrandDetails:{},
            brandModelList:[],
            selectedVarientId:'',
            varientmodel:[]
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

    componentDidMount(){
        this.callFetchBrands();
        this.fetchData();
    
    }

    callFetchBrands = async() => {
        const result = await this.getBrands();
    }
	
	getBrands = () => {
        const {productId } = this.props.match.params       
       return new Promise(resolve => {setTimeout(() => {      
                console.log("aaasssssss======>",productId)
                axios.get(`vehicle/brands`)
                .then(res=>{
                    //console.log("aaaaaabbbbbir========>",response.data.data.policyHolder.request_data.family_members)
                    let brandList = res && res.data ? res.data.data :[]                
                    this.setState({ 
                        brandList
                    })                
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);
                })
            }
            ,2000)
        })       
    }

    fetchData=()=>{
        const {productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id"):0;
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res=>{
                //console.log("aaaaaabbbbbir========>",response.data.data.policyHolder.request_data.family_members)
                let motorInsurance = res.data.data.policyHolder.motorinsurance
               
                this.setState({ 
                    motorInsurance
                })
               
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
    }





    fetchVarient=(model_id)=>{
       /// const {productId } = this.props.match.params
       /// let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id"):0;
        axios.get(`brand-model/${model_id}`)
            .then(res=>{
                //console.log("aaaaaabbbbbir========>",response.data.data.policyHolder.request_data.family_members)
                let varientmodel = res.data.data.varientmodel               
                this.setState({ 
                    varientmodel
                })
               
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
    }

    buy_policy=(productId)=>{
        this.props.history.push(`/Registration/${productId}`);
    }   



    setBrandName=(brand_id)=>{
        axios.get(`vehicle/brand/${brand_id}`).then(res=>{
            //console.log("aaaaaabbbbbir========>",response.data.data.policyHolder.request_data.family_members)
            let selectedBrandDetails = res.data && res.data.data.brand ?  res.data.data.brand:{};
            let brandModelList = res.data && res.data.data.brand ? res.data.data.brandModel:[];
           
            this.setState({ 
                selectedBrandDetails,
                brandModelList
            })
            
           
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })

        //this.handleShow()

    }

    handleSubmit=(values)=>{        
        const {productId} = this.props.match.params    
        const selectedBrandId = values.selectedBrandId
        const selectedModelId = values.selectedModelId
        const selectedVarientId = values.selectedModelId
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id"):0;
        const formData = new FormData();
        formData.append('vehicle_type_id',productId);
        formData.append('menumaster_id',1);
        formData.append('policy_holder_id',policyHolder_id);
        const formDataBrand = new FormData();
        const formDataModel = new FormData();
        const formDataVarient = new FormData();
        this.props.loadingStart();
        axios
        .post(`/update-vehicle-type`, formData)
        .then(res => {
                formDataBrand.append('brand_id',selectedBrandId);
                formDataBrand.append('menumaster_id',1);
                formDataBrand.append('policy_holder_id',policyHolder_id);
                axios
                .post(`/vehicle-brand`, formDataBrand)
                .then(res => {
                    formDataModel.append('brand_model_id',selectedModelId);
                    formDataModel.append('menumaster_id',1);
                    formDataModel.append('policy_holder_id',policyHolder_id);
                    axios
                    .post(`/brand-model`, formDataModel)
                    .then(res => {
                        formDataVarient.append('model_varient_id',selectedVarientId);
                        formDataVarient.append('menumaster_id',1);
                        formDataVarient.append('policy_holder_id',policyHolder_id);
                        axios
                        .post(`/model-varient`, formDataVarient)
                        .then(res => {
                            this.props.history.push(`/Additional_details/${productId}`);
                        })
                        .catch(err => {
                            console.log('Errors==============>',err.data);
                            if(err && err.data){
                                swal('Please check..something went wrong!!');
                            }
                            this.props.loadingStop();
                        });  
                    })
                    .catch(err => {
                    console.log('Errors==============>',err.data);
                    if(err && err.data){
                        swal('Please check..something went wrong!!');
                    }
                   // this.props.loadingStop();
                    });     
                })
                .catch(err => {
                console.log('Errors==============>',err.data);
                if(err && err.data){
                    swal('Please check..something went wrong!!');
                }
               // this.props.loadingStop();
                });                 
        })
        .catch(err => {
          console.log('Errors==============>',err.data);
          if(err && err.data){
             swal('Please check..something went wrong!!');
          }
         // this.props.loadingStop();
        });
    }
    

    render() {
        const {brandList,varientmodel,motorInsurance,selectedBrandDetails,brandModelList,selectedBrandId,selectedModelId,selectedVarientId} = this.state
        const {productId} = this.props.match.params
        const newInitialValues = Object.assign(initialValues,{
            selectedBrandId: selectedBrandId ? selectedBrandId:'' ,
            selectedModelId: selectedModelId ? selectedModelId:'' ,
            selectedBrandName:'',
            selectedModelName:'',
            selectedVarientId: selectedVarientId ? selectedVarientId:'' ,

        })


        console.log("BRAND ssss ID====>",selectedBrandDetails);
        //console.log("MODEL ID====>",selectedModelId);
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
                            
                            <Formik initialValues={newInitialValues} 
                             onSubmit={this.handleSubmit} 
                             validationSchema={vehicleValidation}
                            >
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                console.log("aaaaaa=GHHH====>",values)
                            return (
                            <Form>
                            <section className="brand">
                                <div className="brand-bg pd-30">
                                    <div className="d-flex justify-content-left">
                                        <div className="brandhead">
                                            <h4>Please select  your car brand </h4>
                                            <p>Lets start with your car details</p>
                                        </div>
                                    </div>

                                    <Row>
                                        <Col sm={12} md={9}>
                                            {/*<BrandTable />*/}
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="selectedBrandId"
                                                        component="select"
                                                        className="formGrp"                                                       
                                                        onChange={e => {      
                                                            console.log("aaaaaaa========>",e.target.value)                                                                                                                  
                                                            setFieldValue('selectedBrandId', e.target.value);
                                                            
                                                            this.setBrandName(e.target.value);
                                                            this.setState({
                                                                selectedBrandId:e.target.value
                                                            })
                                                        }}
                                                        value = {values.selectedBrandId}
                                                    >
                                                       <option value="">Select Brand</option>
                                                       {brandList && brandList.map((v,i)=>
                                                            <option value={v.id}>{v.name}</option>
                                                       )}
                                                    </Field>     
                                                    {errors.selectedBrandId  ? (
                                                    <span className="errorMsg">{errors.selectedBrandId}</span>
                                                ) : null}                   
                                                </div>
                                            </FormGroup> 

                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="selectedModelId"
                                                        component="select"
                                                        autoComplete="off"                                                                        
                                                        className="formGrp"
                                                        onChange={(e) => {
                                                            setFieldValue(`selectedModelId`, e.target.value);
                                                            this.fetchVarient(e.target.value)
                                                           // this.setBrandName(e.target.value);
                                                            //this.showEIAText(1);
                                                            this.setState({
                                                                selectedModelId:e.target.value
                                                            })
                                                        }}
                                                        value = {values.selectedModelId}
                                                    >
                                                        <option value="">Select Model</option>
                                                        {brandModelList && brandModelList.length > 0 ? brandModelList.map((v,i)=>
                                                            <option value={v.id}>{v.name}</option>
                                                        ):''}
                                                        
                                                        
                                                    </Field>     
                                                    {errors.selectedModelId  ? (
                                                    <span className="errorMsg">{errors.selectedModelId}</span>
                                                ) : null}                   
                                                </div>
                                            </FormGroup>
                                            {varientmodel && varientmodel.length>0 ?            
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="selectedVarientId"
                                                        component="select"
                                                        autoComplete="off"                                                                        
                                                        className="formGrp"
                                                        onChange={(e) => {
                                                            setFieldValue(`selectedVarientId`, e.target.value);
                                                           // this.setBrandName(e.target.value);
                                                            //this.showEIAText(1);
                                                            this.setState({
                                                                selectedVarientId:e.target.value
                                                            })
                                                        }}
                                                        value = {values.selectedVarientId}
                                                    >
                                                        <option value="">Select Model</option>
                                                        {varientmodel && varientmodel.length > 0 ? varientmodel.map((v,i)=>
                                                            <option value={v.id}>{v.varient+'-'+v.body_style}</option>
                                                        ):''}
                                                        
                                                        
                                                    </Field>     
                                                    {errors.selectedVarientId  ? (
                                                    <span className="errorMsg">{errors.selectedVarientId}</span>
                                                ) : null}                   
                                                </div>
                                            </FormGroup>:''}
                                                
                                            <div className="d-flex justify-content-left resmb">
                                                <button className="backBtn" onClick = {this.buy_policy.bind(this,productId)}>Back</button>
                                                <button className="proceedBtn" type = "submit" >Continue</button>
                                            </div>
                                        </Col>

                                        <Col sm={12} md={3}>
                                            <div className="regisBox">
                                                <Row className="no-gutters m-b-25">
                                                    <Col sm={12} md={6}>
                                                        <div className="txtRegistr resmb-15">Registration No.
                                                        {motorInsurance && motorInsurance.registration_no}</div>
                                                    </Col>

                                                    <Col sm={12} md={6}>
                                                        <button className="rgistrBtn" onClick = {this.buy_policy.bind(this,productId)}>Edit</button>
                                                    </Col>
                                                </Row>

                                                <Row className="no-gutters">
                                                    <Col sm={12} md={6}>
                                                        <div className="txtRegistr resmb-15">Car Brand
                                                           - {selectedBrandDetails && selectedBrandDetails.name}</div>
                                                    </Col>

                                                    {/*<Col sm={12} md={6}>
                                                        <button className="rgistrBtn">Edit</button>
                                                    </Col>*/}
                                                </Row>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </section>
                            
                            
                            </Form>
                                );
                            }}
                            </Formik>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(SelectBrand));