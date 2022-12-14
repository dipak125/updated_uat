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
import ScrollArea from 'react-scrollbar';
import Encryption from '../../shared/payload-encryption';
import fuel from "../common/FuelTypes";
import { setData } from "../../store/actions/data";



const initialValues = {
    selectedBrandId: '',
    selectedBrandName: '',
    selectedModelId: '',
    selectedModelName: '',
    selectedVarientId: ''

};


const vehicleValidation = Yup.object().shape({
    selectedBrandId: Yup.string().required("Please enter the brand name"),
    selectedModelId: Yup.string().required("Please enter the model name"),
    // selectedVarientId : Yup.string().required("Please enter the varient name"),
})


class SelectBrandGCV extends Component {

    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            brandList: [],
            motorInsurance: {},
            selectedBrandId: '',
            selectedBrandName: '',
            selectedModelId: '',
            selectedModelName: '',
            selectedBrandDetails: {},
            brandModelList: [],
            selectedVarientId: '',
            searchitem: [],
            search: "",
            otherBrands: localStorage.getItem("brandEdit") == "2" ? true : false,
            brandName: '',
            modelName: '',
            fuelType: '',
            vehicleDetails: [],
            gross_vechicle_weight : '',
            seating : '',
            searchText: "",
            check:0
        };
    }

    handleClose() {
        this.setState({ show: false, searchText: "", searchitem: [] });
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

    componentDidMount() {
        // this.callFetchBrands();
        this.fetchData();
    }


    change = (text) => {

        this.state.searchitem = [];
        this.setState({ searchText: text });
        this.state.brandModelList.map((item, index) => {

            var rgxp = new RegExp(text.toUpperCase(), "g");
            if (item.name.toUpperCase().match(rgxp) && item.name.toUpperCase().match(rgxp) != null) {

                this.state.searchitem.push(item);
            }
        });

        if (this.state.searchitem && this.state.searchitem.length > 0) {
            this.setState({
                searchitem: this.state.searchitem,
                search: text

            });
        }

    }

    getBrands = () => {
        const { productId } = this.props.match.params
        const {vehicleDetails} = this.state
        let brandId = vehicleDetails && vehicleDetails.vehiclebrand_id ? vehicleDetails.vehiclebrand_id : ""
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        return new Promise(resolve => {
            axios.get(`gcv/vehicle/brand-with-image/4/${policyHolder_id}`)
                .then(res => {
                    let decryptResp = JSON.parse(encryption.decrypt(res.data));
                    console.log('decryptResp', decryptResp)

                    let brandList = res && decryptResp.data.list ? decryptResp.data.list : []
                    this.setState({
                        brandList,
                        otherBrands: localStorage.getItem("brandEdit") == "2" ? true : false
                    })
                    this.props.loadingStop();
                    if(localStorage.getItem('newBrandEdit') == '1') {
                        this.setBrandName(brandId)
                    }
                    else if(localStorage.getItem('newBrandEdit') == '2') {
                        this.getOtherBrands()
                    }
                })
                .catch(err => {
                    let decryptResp = JSON.parse(encryption.decrypt(err.data));
                    console.log('decryptErr-- ', decryptResp)
                    // handle error
                    // console.log(error);
                    this.props.loadingStop();
                })
        })

    }

    getOtherBrands = () => {
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        this.props.loadingStart();
        let encryption = new Encryption();
        axios.get(`gcv/vehicle/brand-without-image/${policyHolder_id}`).then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp', decryptResp)

            let selectedBrandDetails = decryptResp && decryptResp.data ? decryptResp.data : {};
            let brandModelList = decryptResp && decryptResp.data ? decryptResp.data.list : [];

            this.setState({
                selectedBrandDetails,
                brandModelList,
                show: true,
                otherBrands: true,
                searchitem: [],
                modelName: [],
                vehicleDetails: [],
                selectedBrandId: "",
                selectedModelId: [], 
                selectedVarientId: [],
                brandName: ""
                // selectedBrandId: brand_id
            })

            this.props.loadingStop();
        })
            .catch(err => {
                let decryptResp = JSON.parse(encryption.decrypt(err.data));
                    console.log('decryptErr-- ', decryptResp)
                // handle error
               // console.log(error);
                this.props.loadingStop();
            })

    }

    fetchData = async() => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`gcv/policy-holder/details/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log("decrypt", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let fastlanelog = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.fastlanelog : {};
                this.setState({
                    motorInsurance, vehicleDetails,fastlanelog
                })
                console.log("props1",this.props.data)
                if(this.props.data == null) {
                    this.setState({pageLoad: '1' })
                    this.getBrands();
                }             
                else {
                    
                    if( this.props.data.fastLaneData || this.props.data.brandEdit && this.props.data.brandEdit == '0' ) {
                        this.setState({pageLoad: '0', fastLaneData: this.props.data.fastLaneData})
                        // this.props.loadingStop();
                        this.setState({
                            check:1
                        })
                        this.handleSubmit(this.props.data.fastLaneData, '0')
                    }
                    else {
    
                        this.setState({pageLoad: '1' })
                        
                        if(this.state.vehicleDetails && this.state.vehicleDetails.vehiclemodel && this.state.vehicleDetails.vehiclemodel.brand_id)
                        {
                            if(this.props.location && this.props.location.appState &&  this.props.location.appState.flag ==1) 
                            {

                            }
                            else
                            {
                                this.update();
                            }
                           
                        }
                    
                         this.getBrands();

                    }
                }
            })
            .catch(err => {
                let decryptResp = JSON.parse(encryption.decrypt(err.data));
                console.log('decryptErr-- ', decryptResp)
                // handle error
                this.props.loadingStop();
            })
    }
    update= ()=>{

        const { productId } = this.props.match.params
        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        post_data = {
            'policy_holder_id': localStorage.getItem('policyHolder_id'),
            'menumaster_id': 4,
            'brand_id': this.state.vehicleDetails.vehiclemodel.brand_id,
            'brand_model_id':0 ,
            'model_varient_id': 0,
            'page_name': `Select-brand/${productId}`,
        }
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('gcv/insert-brand-model-varient', formData).then(res => {
            this.props.loadingStop();
            // if (res.data.error == false) {
            //     if(this.state.otherBrands) {
            //         localStorage.setItem('brandEdit', 2)
            //         localStorage.removeItem('newBrandEdit')
            //     }
            //     else {
            //         localStorage.setItem('brandEdit', 1)
            //         localStorage.removeItem('newBrandEdit')
            //     }
                
            // }

        })
            .catch(err => {
                // handle error
                if(err.status == '422') {
                    // swal(phrases.PleaseVehicleMmodel)
                }
                this.props.loadingStop();
            })
            this.updatedFetchData();

    }

    updatedFetchData=()=>{
        let encryption = new Encryption();
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        axios.get(`gcv/policy-holder/details/${policyHolder_id}`).then(res=>{

            let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log("decrypt1", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let fastlanelog = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.fastlanelog : {};
                //console.log("check0",vehicleDetails.vehiclemodel.brand_id)
                this.setState({
                    motorInsurance, vehicleDetails, fastlanelog
                })

        }).catch(err=>{

        }) 
    }


    registration = (productId) => {
        this.props.history.push(`/Registration_GCV/${productId}`);
    }

    selectBrand = (productId) => {
        const {selectedBrandId , vehicleDetails, otherBrands} = this.state
        let brandId= selectedBrandId ? selectedBrandId : (vehicleDetails && vehicleDetails.vehiclebrand_id ? vehicleDetails.vehiclebrand_id : "")
        if(localStorage.getItem('brandEdit') == '1') {
            this.setBrandName(brandId)
        }
        else if(localStorage.getItem('brandEdit') == '2') {
            this.getOtherBrands()
        }
        else if(otherBrands == false) {
            this.setBrandName(brandId)
        }
        else {
            this.getOtherBrands()
        }
    }

    selectVehicle = (productId) => {
        this.props.history.push(`/SelectBrand_GCV/${productId}`);
    }


    setBrandName = (brand_id) => {
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        const formData = new FormData();
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`gcv/vehicle/model-with-varient/${brand_id}/${policyHolder_id}`).then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp', decryptResp)

            let selectedBrandDetails = decryptResp && decryptResp.data ? decryptResp.data : {};
            let brandModelList = decryptResp && decryptResp.data.brand_models ? decryptResp.data.brand_models : [];

            this.setState({
                selectedBrandDetails,
                brandModelList,
                show: true,
                otherBrands: false,
                selectedBrandId: brand_id,
                brandName: selectedBrandDetails.name,
                searchitem: [],
                modelName: "",
                vehicleDetails: []
            })

            this.props.loadingStop();
        })
            .catch(err => {
                // handle error
                // console.log(error);
                this.props.loadingStop();
            })

    }

    setVarient = (varient, model_Id, modelName, fuelType, seating, gross_vechicle_weight) => {        
        this.setState({
            selectedVarientId: varient,
            selectedModelId: model_Id,
            modelName: modelName,
            fuelType: fuelType,
            gross_vechicle_weight : gross_vechicle_weight,
            seating : seating
        })
    }

    setOtherVarient = (varient, model_Id, brand_Id, brandName, modelName, fuelType, seating, gross_vechicle_weight) => {
        // brandEdit = 1 for model, 2 for other Varient
        this.setState({
            selectedVarientId: varient,
            selectedModelId: model_Id,
            selectedBrandId: brand_Id,
            brandName: brandName,
            modelName: modelName,
            fuelType: fuelType,
            gross_vechicle_weight : gross_vechicle_weight,
            seating : seating
        })
    }

    handleSubmit = (values) => {
        console.log("check",values)
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        const { productId } = this.props.match.params
        const { selectedVarientId, selectedModelId, selectedBrandId, modelName, vehicleDetails,check } = this.state
        let vehicleModel = modelName ? modelName : (selectedBrandId ? "" : vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : "")
       
        if (check === 0 && (vehicleModel == "" || vehicleModel == null || vehicleModel == undefined)) {
            swal(phrases.PleaseVBrand,
                {button: phrases.OK})
            return false
        }
        const formData = new FormData();
        let encryption = new Encryption();
        let post_data={}
        let url=""
        if(check ===1){
            url='gcv/insert-brand-model-varient'
           
             post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 4,
                'brand_id': values.brand_id,
                'brand_model_id': values.brand_model_id,
                'model_varient_id': values.model_varient_id,
                'page_name': `SelectBrand_GCV/${productId}`
            }
        }
        else{
            url='gcv/insert-brand-model-varient' 
         post_data = {
            'policy_holder_id': localStorage.getItem('policyHolder_id'),
            'menumaster_id': 4,
            'brand_id': values.selectedBrandId,
            'brand_model_id': values.selectedModelId,
            'model_varient_id': values.selectedVarientId,
            'page_name': `SelectBrand_GCV/${productId}`
        }
    }
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        console.log("Post Date---------- ", post_data) 
        this.props.loadingStart();
        axios.post(url, formData).then(res => {
            this.props.loadingStop();
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)

            if (decryptResp.error == false) {
                if(this.state.otherBrands) {
                    localStorage.setItem('brandEdit', 2)
                    localStorage.removeItem('newBrandEdit')
                }
                else {
                    localStorage.setItem('brandEdit', 1)
                    localStorage.removeItem('newBrandEdit')
                }
                this.props.history.push(`/VehicleDetails_GCV/${productId}`);
            }

        })
            .catch(err => {
                // handle error
                let decryptResp = JSON.parse(encryption.decrypt(err.data))
                console.log("decrypt", decryptResp)
                if (err.status == '422') {
                    swal("Please select vehicle model")
                }
                this.props.loadingStop();
            })
    }


    render() {
        const { brandList, motorInsurance, selectedBrandDetails, brandModelList, selectedBrandId,
             selectedModelId, selectedVarientId, otherBrands, brandName, modelName, fuelType, vehicleDetails, gross_vechicle_weight, seating } = this.state
        const { productId } = this.props.match.params
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null
        const newInitialValues = Object.assign(initialValues, {
            selectedBrandId: selectedBrandId ? selectedBrandId : (vehicleDetails && vehicleDetails.vehiclebrand_id ? vehicleDetails.vehiclebrand_id : ""),
            selectedModelId:  selectedModelId ? selectedModelId : (selectedBrandId ? "" : vehicleDetails && vehicleDetails.vehiclemodel_id ? vehicleDetails.vehiclemodel_id : ""),
            selectedBrandName: '',
            selectedModelName: '',
            selectedVarientId: selectedVarientId ? selectedVarientId : (selectedBrandId ? "" :  vehicleDetails && vehicleDetails.varientmodel_id ? vehicleDetails.varientmodel_id : ""),

        })

        // console.log("vehicleDetails", newInitialValues)

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
								
					 {/*<div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">        
						<SideNav />
             		 </div>*/}
							
							
							
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox selctGcv">
                                <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>

                                <Formik initialValues={newInitialValues}
                                    onSubmit={this.handleSubmit}
                                // validationSchema={vehicleValidation}
                                >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                        // console.log("aaaaaa=GHHH====>", values)
                                        return (
                                            <Form>
                                                <section className="brand">
                                                    <div className="brand-bg">
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h4>{phrases['GCVBrand']} </h4>
                                                                <p>{phrases['GCVDetails']}</p>
                                                            </div>
                                                        </div>

                                                        <Row>
                                                            <Col sm={12} md={9}>
                                                                <BrandTable brandList={brandList && brandList.length > 0 ? brandList : []} selectBrandFunc={this.setBrandName} otherBrandFunc={this.getOtherBrands}/>



                                                                <div className="d-flex justify-content-left resmb">
                                                                    <Button className={`backBtn`} type="button" onClick={this.registration.bind(this, productId)}>
                                                                        {phrases['Back']}
                                                                </Button>
                                                                    <Button className={`proceedBtn`} type="submit" >
                                                                        {phrases['Continue']}
                                                                </Button>
                                                                </div>


                                                            </Col>

                                                            <Col sm={12} md={3}>
                                                                <div className="regisBox">
                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">

                                                                        <div className="txtRegistr resmb-15">{phrases['RegNo']}.<br />
                                                                            {motorInsurance && motorInsurance.registration_no}</div>

                                                                        <div> <button type="button" className="rgistrBtn" onClick={this.registration.bind(this, productId)}>{phrases['Edit']}</button></div>
                                                                    </div>



                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr resmb-15">{phrases['GcvBrand']}
                                                                            - <strong>{brandName ? brandName : (vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : "")}</strong>
                                                                        </div>

                                                                        {/* <div> <button type="button" className="rgistrBtn" onClick={this.selectVehicle.bind(this, productId)}>{phrases['Edit']}</button></div> */}
                                                                    </div>

                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr">{phrases['GCVModel']}<br />
                                                                            <strong>{modelName ? modelName : (selectedBrandId ? "" : vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : "")}</strong></div>

                                                                        <div> <button type="button" className="rgistrBtn" onClick={this.selectBrand.bind(this, productId)}>{phrases['Edit']}</button></div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr">{phrases['Seating']}<br />
                                                                            <strong>{seating ? seating : (selectedBrandId ? "" : vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.seating ? vehicleDetails.varientmodel.seating: "")}</strong></div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr">{phrases['GVW']}<br />
                                                                            <strong>{gross_vechicle_weight ? gross_vechicle_weight : (selectedBrandId ? "" : vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.gross_vechicle_weight ? vehicleDetails.varientmodel.gross_vechicle_weight : "")}</strong></div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr">{phrases['Fuel']}<br />
                                                                            <strong>{fuel[fuelType] ? fuel[fuelType] : (vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fueltype ? fuel[vehicleDetails.varientmodel.fueltype.id] : null)} </strong></div>

                                                                    </div>
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
					</div>
                </BaseComponent>

                <Modal className="customModal brandModal" bsSize="md"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <Modal.Header closeButton className="custmModlHead">
                        <div className="cntrbody">
                            <h3>{phrases['SelectModel']} </h3>
                            {selectedBrandDetails.image ?
                                <img src={`${process.env.REACT_APP_PAYMENT_URL}/core/public/image/car_brand_image/` + selectedBrandDetails.image} alt={selectedBrandDetails.name} /> :
                                <img src={require('../../assets/images/car.svg')} alt="" />
                            }
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="modalForm">
                            <FormGroup>
                                <div className="main">
                                    <input
                                        name="search"
                                        type="search"
                                        className="srchimg"
                                        placeholder={phrases['SearchYourVariant']}
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        onChange={e => this.change(e.target.value)}
                                    />
                                </div>
                            </FormGroup>
                            {otherBrands == false ? 
                            <ScrollArea
                                speed={0.8}
                                className="area"
                                contentClassName="content"
                                horizontal={false}
                            >
                                {this.state.searchitem && this.state.searchitem.length > 0 && this.state.searchText.length > 0 ?

                                    (
                                        this.state.searchitem && this.state.searchitem.length > 0 && this.state.searchitem.map((brand, brandIndex) => (
                                            brand.varientmodel && brand.varientmodel.length > 0 && brand.varientmodel.map((varient, varientIndex) => (
                                                <div key= {varientIndex} className="brdrbottom">
                                                    <label className="d-flex justify-content-between">
                                                        <div className="modalboxInfo">{brand.name}
                                                            <span className="grey ml-5">{varient.varient + " " + varient.cc + "cc"}</span>
                                                        </div>
                                                            <div className="customCheckBox formGrp formGrp">
                                                                <input type="radio"
                                                                    name="varient"
                                                                    className="user-self"
                                                                    id="varient"
                                                                    value={varient.id}
                                                                    aria-invalid="false"
                                                                    onClick={(e) =>
                                                                        // console.log("varient--------------- ", varient)
                                                                        this.setVarient(e.target.value, brand.id, brand.name+" "+varient.varient, 
                                                                            varient.fuel_type, varient.seating, varient.gross_vechicle_weight )
                                                                    }
                                                                />
                                                                <span className="checkmark mL-0"></span>
                                                                <span className="error-message"></span>
                                                            </div>                                                       
                                                    </label>
                                                </div>
                                            )))
                                        ))
                                    : (this.state.searchitem && this.state.searchitem.length == 0 && this.state.searchText.length > 0  ? 
                                        <div key= "1" className="brdrbottom">
                                            <label className="d-flex justify-content-between">
                                                <div className="modalboxInfo">
                                                    <span className="grey ml-5">No such variant found</span>
                                                </div>       
                                            </label>
                                        </div>
                                    : 
                                    brandModelList && brandModelList.length > 0 && brandModelList.map((brand, brandIndex) => (
                                        brand.varientmodel && brand.varientmodel.length > 0 && brand.varientmodel.map((varient, varientIndex) => (
                                            
                                            <div key= {varientIndex} className="brdrbottom">
                                                <label className="d-flex justify-content-between">
                                                    <div className="modalboxInfo">{brand.name}
                                                        <span className="grey ml-5">{varient.varient + " " + varient.cc + "cc"}</span>
                                                    </div>   
                                                        <div className="customCheckBox formGrp formGrp">
                                                            <input type="radio"
                                                                name="varient"
                                                                className="user-self"
                                                                id="varient"
                                                                value={varient.id}
                                                                aria-invalid="false"
                                                                onClick={(e) =>
                                                                    this.setVarient(e.target.value, brand.id, brand.name+" "+varient.varient, 
                                                                    varient.fuel_type, varient.seating, varient.gross_vechicle_weight)
                                                                }
                                                            />
                                                            <span className="checkmark mL-0"></span>
                                                            <span className="error-message"></span>
                                                        </div>    
                                                </label>
                                            </div>
                                        ))
                                    ))
                                    )
                                }

                            </ScrollArea> : 
                            <ScrollArea
                            speed={0.8}
                            className="area"
                            contentClassName="content"
                            horizontal={false}
                        >
                            {this.state.searchitem && this.state.searchitem.length > 0 && this.state.searchText.length > 0 ?

                                (
                                    this.state.searchitem && this.state.searchitem.length > 0 && this.state.searchitem.map((brand, brandIndex) => (
                                        brand.brand_models && brand.brand_models.length > 0 && brand.brand_models.map((model, modelIndex) => (
                                            model.varientmodel && model.varientmodel.length > 0 && model.varientmodel.map((varient, varientIndex) => (
                                            <div key= {varientIndex} className="brdrbottom">
                                                <label className="d-flex justify-content-between">
                                                    <div className="modalboxInfo">{brand.name}
                                                        <span className="grey ml-5">{model.name+" "+varient.varient+ " "+varient.cc+"cc" }</span>
                                                    </div>        
                                                        <div className="customCheckBox formGrp formGrp">
                                                            <input type="radio"
                                                                name="varient"
                                                                className="user-self"
                                                                id="varient"
                                                                value={varient.id}
                                                                aria-invalid="false"
                                                                onClick={(e) =>
                                                                    this.setOtherVarient(e.target.value, model.id, model.brand_id,
                                                                        brand.name, model.name+" "+varient.varient, varient.fuel_type, varient.seating, varient.gross_vechicle_weight )
                                                                }
                                                            />
                                                            <span className="checkmark mL-0"></span>
                                                            <span className="error-message"></span>
                                                        </div>        
                                                </label>
                                            </div>
                                        )))
                                    ))))
                                :  (this.state.searchitem && this.state.searchitem.length == 0 && this.state.searchText.length > 0  ? 
                                    <div key= "1" className="brdrbottom">
                                        <label className="d-flex justify-content-between">
                                            <div className="modalboxInfo">
                                                <span className="grey ml-5">No such variant found</span>
                                            </div>       
                                        </label>
                                    </div>
                                :  
                                this.state.brandModelList && this.state.brandModelList.length > 0 && this.state.brandModelList.map((brand, brandIndex) => (
                                    brand.brand_models && brand.brand_models.length > 0 && brand.brand_models.map((model, modelIndex) => (
                                        model.varientmodel && model.varientmodel.length > 0 && model.varientmodel.map((varient, varientIndex) => (

                                        <div key= {varientIndex} className="brdrbottom">
                                            <label className="d-flex justify-content-between">
                                                <div className="modalboxInfo">{brand.name}
                                                    <span className="grey ml-5">{model.name+" "+varient.varient+ " "+varient.cc+"cc"}</span>
                                                </div>
                                                    <div className="customCheckBox formGrp formGrp">
                                                        <input type="radio"
                                                            name="varient"
                                                            className="user-self"
                                                            id="varient"
                                                            value={varient.id}
                                                            aria-invalid="false"
                                                            onClick={(e) =>
                                                                this.setOtherVarient(e.target.value, model.id, model.brand_id,
                                                                    brand.name, model.name+" "+varient.varient, varient.fuel_type, varient.seating, varient.gross_vechicle_weight )
                                                            }
                                                        />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </div>                                 
                                            </label>
                                        </div>
                                    ))))
                                ))
                                )}

                        </ScrollArea>}
                        </div>
                        {selectedVarientId ?
                            <button className="proceedBtn" href={'#'}
                                onClick={(e) =>
                                    this.handleClose()
                                }
                            >
                                {phrases['Continue']}</button> : null}
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}
const mapStateToProps = state => {
    return {
        loading: state.loader.loading,
        data: state.processData.data
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
        setData: (data) => dispatch(setData(data))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectBrandGCV));