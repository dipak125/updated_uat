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
import DatePicker from "react-datepicker";



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
                    console.log("aaaaaabbbbbirssssss========>",res.data.data.list)
                    let brandList = res && res.data.data.list ? res.data.data.list :[]                
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

    registration=(productId)=>{
        this.props.history.push(`/Registration/${productId}`);
    }   



    setBrandName=(brand_id)=>{
        console.log('POP=================>',brand_id)
        axios.get(`vehicle/brand/${brand_id}`).then(res=>{
            //console.log("aaaaaabbbbbir========>",response.data.data.policyHolder.request_data.family_members)
            let selectedBrandDetails = res.data && res.data.data.brand ?  res.data.data.brand:{};
            let brandModelList = res.data && res.data.data.brand ? res.data.data.brandModel:[];
           
            this.setState({ 
                selectedBrandDetails,
                brandModelList,
                show:true
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
        this.props.history.push(`/OtherComprehensive/${productId}`);        
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
                            // validationSchema={vehicleValidation}
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
                                            <BrandTable brandList = {brandList && brandList.length>0 ? brandList:[]} selectBrandFunc={this.setBrandName}/>

                                                <Row>
                                                    <Col sm={12} md={5} lg={5}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                                First Purchase/Registration Date
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='fPurchaseDate'
                                                                component="select"
                                                                autoComplete="off"                                                                        
                                                                className="formGrp"
                                                                value = {values.fPurchaseDate}
                                                            >
                                                                <option value="">Select Year</option>
                                                                <option value="male">2020</option>
                                                                <option value="female">2019</option>
                                                                <option value="female">2018</option>
                                                                <option value="female">2017</option>
                                                                <option value="female">2016</option>
                                                                <option value="female">2015</option>
                                                                <option value="female">2014</option>
                                                                <option value="female">2013</option>
                                                                <option value="female">2012</option>
                                                                <option value="female">2011</option>
                                                                <option value="female">2010</option>
                                                                <option value="female">2009</option>
                                                            </Field>     
                                                            {errors.fPurchaseDate && touched.fPurchaseDate ? (
                                                            <span className="errorMsg">{errors.fPurchaseDate}</span>
                                                            ) : null}          
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='fPurchaseMnt'
                                                                component="select"
                                                                autoComplete="off"                                                                        
                                                                className="formGrp"
                                                                value = {values.fPurchaseMnt}
                                                            >
                                                                <option value="">Select Month</option>
                                                                <option value="male">January</option>
                                                                <option value="female">February</option>
                                                                <option value="female">March</option>
                                                                <option value="female">April</option>
                                                                <option value="female">May</option>
                                                                <option value="female">June</option>
                                                                <option value="female">July</option>
                                                                <option value="female">August</option>
                                                                <option value="female">September</option>
                                                                <option value="female">October</option>
                                                                <option value="female">November</option>
                                                                <option value="female">December</option>
                                                            </Field>     
                                                            {errors.fPurchaseMnt && touched.fPurchaseMnt ? (
                                                            <span className="errorMsg">{errors.gender}</span>
                                                            ) : null}       
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                                Registration City
                                                         </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="Registration City"
                                                                    type="text"
                                                                    placeholder="Registration City"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                />
                                                                {errors.eia_account_no && touched.eia_account_no ? (
                                                                    <span className="errorMsg">{errors.eia_account_no}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={12}>
                                                        <FormGroup>
                                                            <div className="carloan">
                                                                <h4> Previous Policy Details</h4>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            
                                                            <DatePicker
                                                                name="prevStartDate"
                                                                minDate={new Date('1/1/1900')}
                                                                maxDate={new Date()}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Previous policy start date"
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr"
                                                                selected={values.prevStartDate}
                                                                onChange={(val) => {
                                                                    setFieldTouched('prevStartDate');
                                                                    setFieldValue('prevStartDate', val);
                                                                }}
                                                            />
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                        <DatePicker
                                                                name="prevEndDate"
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Previous policy end date"
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr"
                                                                selected={values.prevEndDate}
                                                                onChange={(val) => {
                                                                    setFieldTouched('prevEndDate');
                                                                    setFieldValue('prevEndDate', val);
                                                                }}      
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='policyType'
                                                                component="select"
                                                                autoComplete="off"                                                                        
                                                                className="formGrp"
                                                                value = {values.policyType}
                                                            >
                                                                <option value="">Select Policy Type</option>
                                                                <option value="male">Liability Policy</option>
                                                                <option value="female">Package Policy</option>
                                                            </Field>     
                                                            {errors.policyType && touched.policyType ? (
                                                            <span className="errorMsg">{errors.policyType}</span>
                                                            ) : null}            
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='policyCompany'
                                                                component="select"
                                                                autoComplete="off"                                                                        
                                                                className="formGrp"
                                                            >
                                                                <option value="">Select Insurer Company</option>
                                                                    <option>Agriculture Insurance Co. of India Ltd.</option>
                                                                    <option>Apollo Munich Health Insurance Company Limited</option>
                                                                    <option>Bajaj Allianz General Insurance Co. Ltd</option>
                                                                    <option>Bharti AXA General Insurance Company Limited</option>
                                                                    <option>Cholamandalam MS General Insurance Co. Ltd</option>
                                                                    <option>Cigna TTK Health Insurance Company Limited</option>
                                                                    <option>Export Credit Guarantee Corporation of India Ltd.</option>
                                                                    <option>Future Generali India Insurance Company Limited</option>
                                                                    <option>HDFC ERGO General Insurance Co. Ltd.</option>
                                                                    <option>ICICI Lombard General Insurance Co. Ltd</option>
                                                                    <option>ICICI Prudential LIC Ltd.</option>
                                                                    <option>IFFCO Tokio General Insurance Co. Ltd</option>
                                                                    <option>L T General Insurance Company</option>
                                                                    <option>Liberty Videocon General Insurance Company Ltd.</option>
                                                                    <option>Magma HDI General Insurance Co</option>
                                                                    <option>Max Bupa Health Insurance Company Ltd.</option>
                                                                    <option>National Insurance Co.Ltd.</option>
                                                                    <option>Raheja QBE General Insurance Company Limited,</option>
                                                                    <option>Reliance General Insurance Co. Ltd</option>
                                                                    <option>Royal Sundaram Alliance Insurance Co. Ltd</option>
                                                                    <option>Shriram General Insurance Company Limited,</option>
                                                                    <option>Star Health and Allied Insurance Company Limited</option>
                                                                    <option>Tata AIG General Insurance Co. Ltd</option>
                                                                    <option>The New India Assurance Co. Ltd</option>
                                                                    <option>The Oriental Insurance Co. Ltd</option>
                                                                    <option>United India Insurance Co. Ltd</option>
                                                                    <option>Universal Sompo General Insurance Co. Ltd.</option>
                                                            </Field>     
                                                            {errors.policyCompany && touched.policyCompany ? (
                                                            <span className="errorMsg">{errors.policyCompany}</span>
                                                            ) : null}          
                                                            </div>
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="prevInsurerAddress"
                                                                    type="text"
                                                                    placeholder="Previous Insurer Address"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                />
                                                                {errors.prevInsurerAddress && touched.prevInsurerAddress ? (
                                                                    <span className="errorMsg">{errors.prevInsurerAddress}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={12}>
                                                        <FormGroup>
                                                            <div className="carloan">
                                                                <h4>Have you made a claim in your existing Policy</h4>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={6}>
                                                        <FormGroup>
                                                            <div className="d-inline-flex m-b-35">
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='loan'                                            
                                                                        value='1'
                                                                        key='1'  
                                                                        onChange={(e) => {
                                                                            setFieldValue(`loan`, e.target.value);
                                                                        }}
                                                                        checked={values.loan == '1' ? true : false}
                                                                    />
                                                                        <span className="checkmark " /><span className="fs-14"> No, I haven't</span>
                                                                    </label>
                                                                </div>

                                                                <div className="">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='loan'                                            
                                                                        value='0'
                                                                        key='1'  
                                                                        onChange={(e) => {
                                                                            setFieldValue(`loan`, e.target.value);
                                                                        }}
                                                                        checked={values.loan == '0' ? true : false}
                                                                    />
                                                                        <span className="checkmark" />
                                                                        <span className="fs-14">Yes I have</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row className="m-b-30">
                                                    <Col sm={12} md={5} lg={5}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                                Current No Claim Bonus
                                                       </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name='noClaimBonus'
                                                                    component="select"
                                                                    autoComplete="off"                                                                        
                                                                    className="formGrp"
                                                                    value = {values.noClaimBonus}
                                                                >
                                                                    <option value="">--Select--</option>
                                                                    <option>0</option>
                                                                    <option>20</option>
                                                                    <option>25</option>
                                                                    <option>35</option>
                                                                    <option>45</option>
                                                                    <option>50</option>
                                                                </Field>     
                                                                {errors.noClaimBonus && touched.noClaimBonus ? (
                                                                <span className="errorMsg">{errors.noClaimBonus}</span>
                                                                ) : null}       
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex justify-content-left resmb">
                                                    <button className="backBtn" onClick = {this.registration.bind(this,productId)}>Back</button>
                                                    <button className="proceedBtn" type = "submit" >Continue</button>
                                                </div>                       
                                            
                                            {/*<FormGroup>
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
                                                    </FormGroup> */}

                                          {/*  <FormGroup>
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
                                                
                                                    */}
                                        </Col>

                                        <Col sm={12} md={3}>
                                            <div className="regisBox">
                                                <Row className=" m-b-25">
                                                    <Col sm={12} md={6}>
                                                        <div className="txtRegistr resmb-15">Registration No.
                                                        {motorInsurance && motorInsurance.registration_no}</div>
                                                    </Col>

                                                    <Col sm={12} md={6} className="text-right">
                                                        <button className="rgistrBtn" onClick = {this.registration.bind(this,productId)}>Edit</button>
                                                    </Col>
                                                    
                                                </Row>

                                                <Row className="m-b-25">
                                                    <Col sm={12} md={6}>
                                                        <div className="txtRegistr resmb-15">Car Brand
                                                           - {selectedBrandDetails && selectedBrandDetails.name}</div>
                                                    </Col>
                                                    <Col sm={12} md={6} className="text-right">
                                                            <button className="rgistrBtn">Edit</button>
                                                        </Col>

                                                    {/*<Col sm={12} md={6}>
                                                        <button className="rgistrBtn">Edit</button>
                                                    </Col>*/}
                                                </Row>
                                                
                                                <Row className=" m-b-25">
                                                        <Col sm={12} md={6}>
                                                            <div className="txtRegistr">Car Model<br/>
                                                                <strong>4S CHAMPION</strong></div>
                                                        </Col>

                                                        <Col sm={12} md={6} className="text-right">
                                                            <button className="rgistrBtn">Edit</button>
                                                        </Col>
                                                    </Row>

                                                <Row className="m-b-25">
                                                    <Col sm={12} md={6}>
                                                        <div className="txtRegistr">Fuel Type<br/>
                                                            <strong>PETROL </strong></div>
                                                    </Col>
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

                <Modal className="customModal" bsSize="md"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <Modal.Body>
                        <h3>Select Model </h3>
                        <div><img src={require('../../assets/images/image-02.svg')} alt="" /></div>

                        <div className="modalForm">
                            <FormGroup>
                                <div className="main">
                                    <input
                                        name="search"
                                        type="text"
                                        placeholder="Search your variant "
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                    />
                                </div>
                            </FormGroup>
                            <div className="brdrbottom">
                            <div className="d-flex justify-content-between">
                                    <div className="modalboxInfo">Accord
                                        <span className="grey ml-5">1.2 E I-VTEC 1198CC</span>
                                    </div>
                                    <div>
                                        <label className="customCheckBox formGrp formGrp">
                                            <input type="checkbox"
                                                name="family[Self][check]"
                                                className="user-self"
                                                id="family[Self][check]"
                                                value="1"
                                                aria-invalid="false" />
                                            <span className="checkmark mL-0"></span>
                                            <span className="error-message"></span>
                                        </label>
                                    </div>
                            </div>
                            </div>

                            <div className="brdrbottom">
                            <div className="d-flex justify-content-between">
                                    <div className="modalboxInfo">Honda City
                                        <span className="grey ml-5">1.2 E MT 1198CC</span>
                                    </div>
                                    <div>
                                        <label className="customCheckBox formGrp formGrp">
                                            <input type="checkbox"
                                                name="family[Self][check]"
                                                className="user-self"
                                                id="family[Self][check]"
                                                value="1"
                                                aria-invalid="false" />
                                            <span className="checkmark mL-0"></span>
                                            <span className="error-message"></span>
                                        </label>
                                    </div>
                            </div>
                            </div>

                            <div className="brdrbottom">
                            <div className="d-flex justify-content-between">
                                    <div className="modalboxInfo">NEON
                                        <span className="grey ml-5">1.2 EX MT 1198CC</span>
                                    </div>
                                    <div>
                                        <label className="customCheckBox formGrp formGrp">
                                            <input type="checkbox"
                                                name="family[Self][check]"
                                                className="user-self"
                                                id="family[Self][check]"
                                                value="1"
                                                aria-invalid="false" />
                                            <span className="checkmark mL-0"></span>
                                            <span className="error-message"></span>
                                        </label>
                                    </div>
                            </div>
                            </div>

                            <div className="brdrbottom">
                            <div className="d-flex justify-content-between">
                                    <div className="modalboxInfo">BRIO
                                        <span className="grey ml-5">1.2 S AT 1198CC</span>
                                    </div>
                                    <div>
                                        <label className="customCheckBox formGrp formGrp">
                                            <input type="checkbox"
                                                name="family[Self][check]"
                                                className="user-self"
                                                id="family[Self][check]"
                                                value="1"
                                                aria-invalid="false" />
                                            <span className="checkmark mL-0"></span>
                                            <span className="error-message"></span>
                                        </label>
                                    </div>
                            </div>
                            </div>

                            <div className="brdrbottom">
                            <div className="d-flex justify-content-between">
                                    <div className="modalboxInfo">Accord
                                        <span className="grey ml-5">1.2 E I-VTEC 1198CC</span>
                                    </div>
                                    <div>
                                        <label className="customCheckBox formGrp formGrp">
                                            <input type="checkbox"
                                                name="family[Self][check]"
                                                className="user-self"
                                                id="family[Self][check]"
                                                value="1"
                                                aria-invalid="false" />
                                            <span className="checkmark mL-0"></span>
                                            <span className="error-message"></span>
                                        </label>
                                    </div>
                            </div>
                            </div>

                            <div className="brdrbottom">
                            <div className="d-flex justify-content-between">
                                    <div className="modalboxInfo">Honda City
                                        <span className="grey ml-5">1.2 E MT 1198CC</span>
                                    </div>
                                    <div>
                                        <label className="customCheckBox formGrp formGrp">
                                            <input type="checkbox"
                                                name="family[Self][check]"
                                                className="user-self"
                                                id="family[Self][check]"
                                                value="1"
                                                aria-invalid="false" />
                                            <span className="checkmark mL-0"></span>
                                            <span className="error-message"></span>
                                        </label>
                                    </div>
                            </div>
                            </div>



                        </div>
                        <button className="proceedBtn" href={'#'}>Continue</button>
                    </Modal.Body>
                </Modal>
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