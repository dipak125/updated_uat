import React, { Component, Fragment } from 'react';
import HeaderSecond from '../common/header/HeaderSecond';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import TwoWheelerBrandTable from '../common/BrandTable';
import BaseComponent from '../BaseComponent';
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
import fuel from '../common/FuelTypes';
import { setData } from "../../store/actions/data";
import { registrationNumberFirstBlock, registrationNumberSecondBlock, registrationNumberThirdBlock, registrationNumberLastBlock } from "../../shared/validationFunctions";



const initialValues = {
    selectedBrandId: '',
    selectedBrandName: '',
    selectedModelId: '',
    selectedModelName: '',
    selectedVarientId: '',
    regNumber:'',
    reg_number_part_one: '',
    reg_number_part_two: '',
    reg_number_part_three: '',
    reg_number_part_four: '',
    check_registration: 2,
    policy_for: "1",
    lapse_duration: '',
    policy_type: '2'

};


const vehicleValidation = Yup.object().shape({
    policy_type: Yup.string().required("PleasePT"),
    policy_for: Yup.string().required("PleasePIC"),

    reg_number_part_one: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string().required('RegistrationNumber')
        .test(
            "firstDigitcheck",
            function () {
                return "InvalidRegistrationNumber"
            },
            function (value) {         
                return registrationNumberFirstBlock(value);
            }
        ),
        otherwise: Yup.string().nullable()
    }),
    reg_number_part_two: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string()
        .test(
            "secondDigitcheck",
            function () {
                return "InvalidRegistrationNumber"
            },
            function (value) {         
                return registrationNumberSecondBlock(value);
            }
        ),
        otherwise: Yup.string().nullable()
    }),
    reg_number_part_three: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string()
        .test(
            "thirdDigitcheck",
            function () {
                return "InvalidRegistrationNumber"
            },
            function (value) {         
                return registrationNumberThirdBlock(value);
            }
        ),
        otherwise: Yup.string().nullable()
    }),
    reg_number_part_four: Yup.string().when(['check_registration'], {
        is: check_registration => check_registration == '2', 
        then: Yup.string().required('RegistrationNumber')
            .test(
                "last4digitcheck",
                function () {
                    return "InvalidRegistrationNumber"
                },
                function (value) {         
                    return registrationNumberLastBlock(value);
                }
            ),
        otherwise: Yup.string().nullable()
    }),

    lapse_duration: Yup.string().when("policy_type", {
        is: "3",       
        then: Yup.string().required('LapseDuration'),
        otherwise: Yup.string()
    }),
})


class TwoWheelerSelectBrandOD extends Component {

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
            otherBrands: false,
            brandName: '',
            modelName: '',
            fuelType: '',
            vehicleDetails: [],
            error_msg: [],
            length:14,
            fastLaneData: [],
            brandView: '0',
            fastlanelog: [],
            fastlaneLogId: 0
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

    componentDidMount() {
        // this.callFetchBrands();
        this.fetchData();

    }


    change = (text) => {

        this.state.searchitem = [];
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
        let encryption = new Encryption();
        let brandId = vehicleDetails && vehicleDetails.vehiclebrand_id ? vehicleDetails.vehiclebrand_id : ""
        return new Promise(resolve => {
            axios.get(`two-wh-stal/brand-with-image/3`)
                .then(res => {
                    let decryptResp = JSON.parse(encryption.decrypt(res.data));
                    let brandList = decryptResp && decryptResp.data.list ? decryptResp.data.list : []
                    this.setState({
                        brandList,
                        otherBrands: false
                    })
                    this.props.loadingStop();
                    if(localStorage.getItem('newBrandEdit') == '1') {
                        this.setBrandName(brandId)
                    }
                    else if(localStorage.getItem('newBrandEdit') == '2') {
                        this.getOtherBrands()
                    }
                    else if(this.props.data.brandEdit == 1) {
                        this.setState({
                            brandView: '1'
                        })
                    }
                })
                .catch(err => {
                    // handle error
                    // console.log(error);
                    this.props.loadingStop();
                })
        })

    }

    getOtherBrands = () => {
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`two-wh-stal/without-image/3`).then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp_otherBrand', decryptResp)

            let selectedBrandDetails = decryptResp && decryptResp.data.list ? decryptResp.data.list : {};
            let brandModelList = decryptResp && decryptResp.data.list ? decryptResp.data.list : [];

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
                brandName: "",
                brandView: '1'
                // selectedBrandId: brand_id
            })

            this.props.loadingStop();
        })
            .catch(err => {
                // handle error
                // console.log(error);
                this.props.loadingStop();
            })

    }


    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`two-wh-stal/policy-holder/motor-saod/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log('decryptResp', decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                this.setState({
                    motorInsurance, vehicleDetails
                })
                this.getBrands();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }


    registration = (productId) => {
        this.props.history.push(`/two_wheeler_Select-brandOD/${productId}`);
    }
    selectVehicle = (productId) => {
        this.setState({
            brandView: '1'
        })
        // this.props.history.push(`/two_wheeler_Select-brand/${productId}`);
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

    }


    setBrandName = (brand_id) => {
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`two-wh-stal/model-with-varient/3/${brand_id}`).then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp',decryptResp)
            let selectedBrandDetails = decryptResp && decryptResp.data.list ? decryptResp.data.list : {};
            let brandModelList = decryptResp && decryptResp.data.list.brand_models ? decryptResp.data.list.brand_models : [];

            this.setState({
                selectedBrandDetails,
                brandModelList,
                show: true,
                otherBrands: false,
                selectedBrandId: brand_id,
                brandName: selectedBrandDetails.name,
                searchitem: [],
                modelName: "",
                vehicleDetails: [],
                brandView: '1'
            })

            this.props.loadingStop();
        })
            .catch(err => {
                // handle error
                // console.log(error);
                this.props.loadingStop();
            })

    }

    setVarient = (varient, model_Id, modelName, fuelType) => {        
        this.setState({
            selectedVarientId: varient,
            selectedModelId: model_Id,
            modelName: modelName,
            fuelType: Math.floor(fuelType)
        })
    }

    setOtherVarient = (varient, model_Id, brand_Id, brandName, modelName, fuelType) => {
        // brandEdit = 1 for model, 2 for other Varient
        this.setState({
            selectedVarientId: varient,
            selectedModelId: model_Id,
            selectedBrandId: brand_Id,
            brandName: brandName,
            modelName: modelName,
            fuelType: Math.floor(fuelType)
        })
    }


    handleSubmit = (values) => {
        const { productId } = this.props.match.params
        const { selectedVarientId, selectedModelId, selectedBrandId, brandView, fastLaneData, fastlanelog } = this.state
        let post_data = {}
        var registration_part_numbers  = {}
	var regNumber = values.reg_number_part_one+values.reg_number_part_two+values.reg_number_part_three+values.reg_number_part_four
	    registration_part_numbers  = {
	        reg_number_part_one: values.reg_number_part_one,
	        reg_number_part_two: values.reg_number_part_two,
	        reg_number_part_three: values.reg_number_part_three,
	        reg_number_part_four: values.reg_number_part_four
	    } 
	    

        const formData = new FormData();
        let encryption = new Encryption();
        let policyHolder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') :0
        localStorage.setItem('check_registration', values.check_registration)

        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }

        if(policyHolder_id > 0) {
            if(sessionStorage.getItem('csc_id')) {
                post_data = {
                    'menumaster_id': 3,
                    'brand_id': selectedBrandId ? selectedBrandId : fastLaneData && fastLaneData.brand_id ? fastLaneData.brand_id : values.selectedBrandId ? values.selectedBrandId : "",
                    'brand_model_id': selectedModelId ? selectedModelId : fastLaneData && fastLaneData.brand_model_id ? fastLaneData.brand_model_id : values.selectedModelId ? values.selectedModelId : "",
                    'model_varient_id': selectedVarientId ? selectedVarientId : fastLaneData && fastLaneData.model_varient_id ? fastLaneData.model_varient_id : values.selectedVarientId ? values.selectedVarientId : "",
                    'vehicle_type_id':this.props.match.params.productId,
                    'product_id': this.props.match.params.productId,
                    'registration_no': regNumber,
                    'registration_part_numbers': JSON.stringify(registration_part_numbers),
                    'policy_type_id':values.policy_type,
                    'policy_holder_id': policyHolder_id,
                    'check_registration': values.check_registration,
                    'csc_id':sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                    'agent_name':sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                    // 'product_id':sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                    'bcmaster_id': "5",
                    'lapse_duration': values.lapse_duration,
                    'policy_for': values.policy_for,
                    'fastlaneLog_id': this.state.fastlaneLogId ? this.state.fastlaneLogId : fastlanelog && fastlanelog.id ? fastlanelog.id : 0,
                    'page_name': `two_wheeler_Select-brandOD/${productId}`,
                }
            }
            else {
                post_data = {
                    'menumaster_id': 3,
                    'brand_id': selectedBrandId ? selectedBrandId : fastLaneData && fastLaneData.brand_id ? fastLaneData.brand_id : values.selectedBrandId ? values.selectedBrandId : "",
                    'brand_model_id': selectedModelId ? selectedModelId : fastLaneData && fastLaneData.brand_model_id ? fastLaneData.brand_model_id : values.selectedModelId ? values.selectedModelId : "",
                    'model_varient_id': selectedVarientId ? selectedVarientId : fastLaneData && fastLaneData.model_varient_id ? fastLaneData.model_varient_id : values.selectedVarientId ? values.selectedVarientId : "",
                    'vehicle_type_id':this.props.match.params.productId,
                    'product_id': this.props.match.params.productId,
                    'registration_no': regNumber,
                    'registration_part_numbers': JSON.stringify(registration_part_numbers),
                    'policy_type_id':values.policy_type,
                    'policy_holder_id': policyHolder_id,
                    'check_registration': values.check_registration,
                    'bcmaster_id': bc_data ? bc_data.agent_id : "",
                    'bc_token': bc_data ? bc_data.token : "",
                    'lapse_duration': values.lapse_duration,
                    'policy_for': values.policy_for,
                    'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                    'fastlaneLog_id': this.state.fastlaneLogId ? this.state.fastlaneLogId : fastlanelog && fastlanelog.id ? fastlanelog.id : 0,
                    'page_name': `two_wheeler_Select-brandOD/${productId}`,
                }
            }
            console.log('post_data-----', post_data)
            formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
            this.props.loadingStart();
            axios.post('two-wh-stal/update-registration', formData).then(res => {
                this.props.loadingStop();
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log('decryptResp-----', decryptResp)

                if (decryptResp.error == false) {
                    if(this.state.otherBrands) {
                        localStorage.setItem('brandEdit', 2)
                        localStorage.removeItem('newBrandEdit')
                    }
                    else {
                        localStorage.setItem('brandEdit', 1)
                        localStorage.removeItem('newBrandEdit')
                    }
                    this.props.history.push(`/two_wheeler_Vehicle_detailsOD/${productId}`);
                }
                else {
                    swal(decryptResp.msg)
                }
    
            })
                .catch(err => {
                    let decryptErr = JSON.parse(encryption.decrypt(err.data));
                    console.log('decryptResp--err---', decryptErr)
                    // handle error
                    this.setState({error_msg: decryptErr})
                    this.props.loadingStop();
                })
        }
        else {
            if(sessionStorage.getItem('csc_id')) {
                post_data = {
                    'menumaster_id': 3,
                    'brand_id':  brandView == '1' ? selectedBrandId : fastLaneData ? fastLaneData.brand_id : "",
                    'brand_model_id': brandView == '1' ? selectedModelId : fastLaneData ? fastLaneData.brand_model_id : "",
                    'model_varient_id': brandView == '1' ? selectedVarientId : fastLaneData ? fastLaneData.model_varient_id : "",
                    'vehicle_type_id':this.props.match.params.productId,
                    'product_id': this.props.match.params.productId,
                    'registration_no': regNumber,
                    'registration_part_numbers': JSON.stringify(registration_part_numbers),
                    'policy_type_id':values.policy_type,
                    'check_registration': values.check_registration,
                    'csc_id':sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                    'agent_name':sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                    // 'product_id':sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                    'bcmaster_id': "5",
                    'lapse_duration': values.lapse_duration,
                    'policy_for': values.policy_for,
                    'fastlaneLog_id': this.state.fastlaneLogId ? this.state.fastlaneLogId : fastlanelog && fastlanelog.id ? fastlanelog.id : 0,
                    'page_name': `two_wheeler_Select-brandOD/${productId}`,
                }
            }
            else{
                post_data = {
                    'menumaster_id': 3,
                    'brand_id': brandView == '1' ? selectedBrandId : fastLaneData ? fastLaneData.brand_id : "",
                    'brand_model_id': brandView == '1' ? selectedModelId : fastLaneData ? fastLaneData.brand_model_id : "",
                    'model_varient_id': brandView == '1' ? selectedVarientId : fastLaneData ? fastLaneData.model_varient_id : "",
                    'vehicle_type_id':this.props.match.params.productId,
                    'product_id': this.props.match.params.productId,
                    'registration_no': regNumber,
                    'registration_part_numbers': JSON.stringify(registration_part_numbers),
                    'policy_type_id':values.policy_type,
                    'check_registration': values.check_registration,
                    'bcmaster_id': bc_data ? bc_data.agent_id : "",
                    'bc_token': bc_data ? bc_data.token : "",
                    'lapse_duration': values.lapse_duration,
                    'policy_for': values.policy_for,
                    'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                    'fastlaneLog_id': this.state.fastlaneLogId ? this.state.fastlaneLogId : fastlanelog && fastlanelog.id ? fastlanelog.id : 0,
                    'page_name': `two_wheeler_Select-brandOD/${productId}`,
                }
            }
            console.log('post_data-----', post_data)

            formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
            this.props.loadingStart();
            axios.post('two-wh-stal/registration', formData).then(res => {
                this.props.loadingStop();
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log('decryptResp-----', decryptResp)
                if (decryptResp.error == false) {
                    localStorage.setItem('policyHolder_id', decryptResp.data.policyHolder_id);
                    localStorage.setItem('policyHolder_refNo', decryptResp.data.policyHolder_refNo);
                    if(this.state.otherBrands) {
                        localStorage.setItem('brandEdit', 2)
                        localStorage.removeItem('newBrandEdit')
                    }
                    else {
                        localStorage.setItem('brandEdit', 1)
                        localStorage.removeItem('newBrandEdit')
                    }
                    this.props.history.push(`/two_wheeler_Vehicle_detailsOD/${productId}`);
                }
                else {
                    swal(decryptResp.msg)
                }
    
            })
                .catch(err => {
                    let decryptErr = JSON.parse(encryption.decrypt(err.data));
                    console.log('decryptResp--err---', decryptErr)
                    // handle error
                    this.setState({error_msg: decryptErr})
                    this.props.loadingStop();
                })
        }
        
    }

    setValueData = () => {
        var checkBoxAll = document.getElementsByClassName('user-self');
        for(const a in checkBoxAll){
            if(checkBoxAll[a].checked){            
                return true
            }
        }
        return false
    }

    handleChange = (values, setFieldTouched, setFieldValue) => {
        if(values.regNumber == "NEW"){
            // setFieldTouched('check_registration')
            setFieldValue('regNumber', "");
        }
    }

    fetchFastlane = (values) => {
        const formData = new FormData();
        var regNumber = values.reg_number_part_one+values.reg_number_part_two+values.reg_number_part_three+values.reg_number_part_four
        formData.append('registration_no', regNumber)
        formData.append('menumaster_id', '3')
        this.props.loadingStart();
        axios.post('fastlane', formData).then(res => {

            if(res.data.error == false) {
                this.props.loadingStop();
                this.setState({fastLaneData: res.data.data, brandView: '0', fastlaneLogId: res.data.data.fastlaneLog_id})
            } 
            else {
                this.props.loadingStop();
                this.setState({fastLaneData: [], brandView: '1', vehicleDetails: [], fastlaneLogId: res.data.data.fastlaneLog_id })
            }       
        })
            .catch(err => {
                this.props.loadingStop();
                this.setState({fastLaneData: [], brandView: '1', vehicleDetails: [], fastlaneLogId: 0 })
            })
    }

    regnoFormat = (e, setFieldTouched, setFieldValue) => {
        
        let regno = e.target.value
        this.setState({fastLaneData: [], brandView: '0', vehicleDetails: []})
        let brandEdit = {'brandEdit' : 1}
        this.props.setData(brandEdit)       
        e.target.value = regno.toUpperCase()

    }



    render() {
        const { brandList, motorInsurance, selectedBrandDetails, brandModelList, selectedBrandId,fuelType,fastLaneData, brandView,
            selectedModelId, selectedVarientId, otherBrands, vehicleDetails, error_msg, brandName, modelName } = this.state
        const { productId } = this.props.match.params
        var tempRegNo = motorInsurance && motorInsurance.registration_part_numbers ? JSON.parse(motorInsurance.registration_part_numbers) : []
        const newInitialValues = Object.assign(initialValues, {
            selectedBrandId: selectedBrandId ? selectedBrandId : (vehicleDetails && vehicleDetails.vehiclebrand_id ? vehicleDetails.vehiclebrand_id : ""),
            selectedModelId:  selectedModelId ? selectedModelId : (selectedBrandId ? "" : vehicleDetails && vehicleDetails.vehiclemodel_id ? vehicleDetails.vehiclemodel_id : ""),
            selectedBrandName: '',
            selectedModelName: '',
            selectedVarientId: selectedVarientId ? selectedVarientId : (selectedBrandId ? "" :  vehicleDetails && vehicleDetails.varientmodel_id ? vehicleDetails.varientmodel_id : ""),
            policy_type: motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : "2",
            regNumber: motorInsurance && motorInsurance.registration_no ? motorInsurance.registration_no : "",
            check_registration: "2",
            lapse_duration: motorInsurance && motorInsurance.lapse_duration ? motorInsurance.lapse_duration : "",
            policy_for: motorInsurance && motorInsurance.policy_for ? motorInsurance.policy_for : "1",
            reg_number_part_one: tempRegNo && tempRegNo.reg_number_part_one ? tempRegNo.reg_number_part_one : "",
            reg_number_part_two: tempRegNo && tempRegNo.reg_number_part_two ? tempRegNo.reg_number_part_two : "",
            reg_number_part_three: tempRegNo && tempRegNo.reg_number_part_three ? tempRegNo.reg_number_part_three : "",
            reg_number_part_four: tempRegNo && tempRegNo.reg_number_part_four ? tempRegNo.reg_number_part_four : "",
        })
        let phrases = localStorage.getItem("phrases") ? JSON.parse(localStorage.getItem("phrases")) : null

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
		
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 infobox twowheelBrand">
                                <h4 className="text-center mt-3 mb-3">{phrases['SBIGICL']}</h4>

                            <Formik initialValues={newInitialValues} 
                                onSubmit={ this.handleSubmit} 
                                validationSchema={vehicleValidation}
                                >
                                {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                    
                                    return (
                                        <Form>
                                            <section className="brand">
                                                <div className="brand-bg">
                                                <Row>
                                                <div className="col-md-9 col-sm-12">
                                                <div className="d-flex justify-content-left">
                                                    <div className="brandhead"> 
                                                        <p>{phrases['TakingTwoPolicy']}</p>
                                                            <div className="d-inline-flex m-b-15">
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='policy_for'
                                                                            value='1'
                                                                            key='1'
                                                                            checked = {values.policy_for == '1' ? true : false}
                                                                            onChange = {() =>{
                                                                                setFieldTouched('policy_for')
                                                                                setFieldValue('policy_for', '1');
                                                                                this.handleChange(values,setFieldTouched, setFieldValue)
                                                                            }  
                                                                            }
                                                                        />
                                                                        <span className="checkmark " /><span className="fs-14"> {phrases['Individual']}</span>
                                                                    </label>
                                                                </div>
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='policy_for'
                                                                            value='2'
                                                                            key='1'
                                                                            checked = {values.policy_for == '2' ? true : false}
                                                                            onChange = {() =>{
                                                                                setFieldTouched('policy_for')
                                                                                setFieldValue('policy_for', '2');
                                                                                this.handleChange(values,setFieldTouched, setFieldValue)
                                                                            }  
                                                                            }
                                                                        />
                                                                        <span className="checkmark " /><span className="fs-14"> {phrases['Corporate']}</span>
                                                                    </label>
                                                                    {errors.policy_for && touched.policy_for ? (
                                                                        <span className="errorMsg">{phrases[errors.policy_for]}</span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex justify-content-left">
                                                        <div className="brandhead"> 
                                                            <p>{phrases['TellAboutPolicy']}</p>

                                                            <div className="d-inline-flex m-b-15">
                                                                {/* <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='policy_type'
                                                                            value='1'
                                                                            key='1'
                                                                            checked = {values.policy_type == '1' ? true : false}
                                                                            onChange = {() =>{
                                                                                setFieldTouched('policy_type')
                                                                                setFieldValue('policy_type', '1');
                                                                                this.handleChange(values,setFieldTouched, setFieldValue)
                                                                            }  
                                                                            }
                                                                        />
                                                                        <span className="checkmark " /><span className="fs-14"> {phrases['NewPolicy']}</span>
                                                                    </label>
                                                                </div> */}
                                                                
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='policy_type'
                                                                            value='2'
                                                                            key='1'
                                                                            checked = {values.policy_type == '2' ? true : false}
                                                                            onChange = {() =>{
                                                                                setFieldTouched('policy_type')
                                                                                setFieldValue('policy_type', '2'); 
                                                                                setFieldValue('lapse_duration', '');
                                                                                this.handleChange(values,setFieldTouched, setFieldValue)
                                                                            }  
                                                                            }
                                                                        />
                                                                        <span className="checkmark " /><span className="fs-14"> {phrases['RollOver']}</span>
                                                                    </label>
                                                                </div>

                                                                {/* <div>
                                                                    <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='policy_type'
                                                                            value='3'
                                                                            key='1'
                                                                            checked = {values.policy_type == '3' ? true : false}
                                                                            onChange = {() =>{
                                                                                setFieldTouched('policy_type')
                                                                                setFieldValue('policy_type', '3');
                                                                                this.handleChange(values,setFieldTouched, setFieldValue)
                                                                            }  
                                                                            }
                                                                        />
                                                                        <span className="checkmark" />
                                                                        <span className="fs-14">{phrases['LapsedPolicy']}</span>
                                                                    </label>
                                                                    {errors.policy_type && touched.policy_type ? (
                                                                        <span className="errorMsg">{phrases[errors.policy_type]}</span>
                                                                    ) : null}
                                                                </div> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* {values.policy_type == '3' ? 
                                                    <div className="d-flex justify-content-left">
                                                        <div className="brandhead"> 
                                                        <p>{phrases['LapseDuration']}</p>
                                                            <div className="d-inline-flex m-b-15">
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='lapse_duration'
                                                                            value='1'
                                                                            key='1'
                                                                            checked = {values.lapse_duration == '1' ? true : false}
                                                                        />
                                                                        <span className="checkmark " /><span className="fs-14"> {phrases['BeforeNinety']}</span>
                                                                    </label>
                                                                </div>
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='lapse_duration'
                                                                            value='2'
                                                                            key='1'
                                                                            checked = {values.lapse_duration == '2' ? true : false}
                                                                        />
                                                                        <span className="checkmark " /><span className="fs-14"> {phrases['OverNinety']}</span>
                                                                    </label>
                                                                    {errors.lapse_duration && touched.lapse_duration ? (
                                                                        <span className="errorMsg">{phrases[errors.lapse_duration]}</span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div> : null } */}

                                                    <div className="brandhead">
                                                    <h4 className="m-b-30">{phrases['AboutVehicle']}</h4></div>
                                                    <Row className="m-b-15">
                                                        <Col sm={12}>
                                                        
                                                        <div className="row formSection">
                                                            <label className="col-md-4">{phrases['RegName']} </label>
                                                            <div className="col-md-1">

                                                                <Field
                                                                    name="reg_number_part_one"
                                                                    type="text"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.reg_number_part_one}
                                                                    disabled= {values.check_registration == '1' ? true : false}
                                                                    maxLength="3"
                                                                    onInput={e => {
                                                                        this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                                        setFieldTouched('check_registration')
                                                                        setFieldValue('check_registration', '2');
                                                                    }}

                                                                />
                                                            </div>
                                                            <div className="col-md-1">

                                                                <Field
                                                                    name="reg_number_part_two"
                                                                    type="text"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.reg_number_part_two}
                                                                    disabled= {values.check_registration == '1' ? true : false}
                                                                    maxLength="2"
                                                                    onInput={e => {
                                                                        this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                                        setFieldTouched('check_registration')
                                                                        setFieldValue('check_registration', '2');
                                                                    }}

                                                                />         
                                                            </div>
                                                            <div className="col-md-1">

                                                                <Field
                                                                    name="reg_number_part_three"
                                                                    type="text"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.reg_number_part_three}
                                                                    disabled= {values.check_registration == '1' ? true : false}
                                                                    maxLength="3"
                                                                    onInput={e => {
                                                                        this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                                        setFieldTouched('check_registration')
                                                                        setFieldValue('check_registration', '2');
                                                                    }}

                                                                />
                                                            </div>
                                                            <div className="col-md-2">

                                                                <Field
                                                                    name="reg_number_part_four"
                                                                    type="text"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.reg_number_part_four}
                                                                    disabled= {values.check_registration == '1' ? true : false}
                                                                    maxLength="4"
                                                                    onInput={e => {
                                                                        this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                                        setFieldTouched('check_registration')
                                                                        setFieldValue('check_registration', '2');
                                                                    }}

                                                                />
                                                            </div>
                                                            {brandView == '0' && fastLaneData.length == '0' ?
                                                                <Button  type="button"  onClick = {this.fetchFastlane.bind(this,values)} >
                                                                    {phrases['FetchDetails']}
                                                            </Button> : null }
                                                            {(errors.reg_number_part_one || errors.reg_number_part_two || errors.reg_number_part_three || errors.reg_number_part_four) 
                                                            && (touched.reg_number_part_one || touched.reg_number_part_two || touched.reg_number_part_three || touched.reg_number_part_four) ? (
                                                                    <span className="errorMsg">{phrases["InvalidRegistrationNumber"]}</span>
                                                                ) : null}
                                                        </div>                                                           
                                                        </Col>
                                                    </Row>

                                                    {brandView == '1' ?
                                                    <div className="brandhead">
                                                        <h4>{phrases['VechicleBrandTp']}</h4>
                                                        {error_msg.brand_id || error_msg.brand_model_id || error_msg.model_varient_id ? 
                                                            <span className="errorMsg">{phrases['BrandVarient']}</span> : ""
                                                        }
                                                    </div> : null }

                                                    
                                                        <Col sm={12} md={12} className="two-wheeler">
                                                        {brandView == '1' ?
                                                            <Fragment>
                                                                <TwoWheelerBrandTable brandList={brandList && brandList.length > 0 ? brandList : []} selectBrandFunc={this.setBrandName} otherBrandFunc={this.getOtherBrands} />
                                                            </Fragment> : null }

                                                            <div className="d-flex justify-content-left resmb">
                                                            {brandView == '1' || (fastLaneData && fastLaneData.brand_text) ?
                                                                <Button className={`proceedBtn`} type="submit"  >
                                                                    {phrases['Continue']}
                                                            </Button> : null }
                                                            </div>
                                                        </Col>
                                                        </div>

                                                        <div className= "col-md-3 col-sm-12">
                                                        {brandView == '1' ?
                                                        <Fragment>
                                                            <div className="regisBox">
                                                                <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">

                                                                    <div className="txtRegistr resmb-15">{phrases['RegNo']}.<br />
                                                                        {motorInsurance && motorInsurance.registration_no}</div>

                                                                    <div> <button type="button" className="rgistrBtn" onClick={this.registration.bind(this, productId)}>{phrases['Edit']}</button></div>
                                                                </div>

                                                                <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                    <div className="txtRegistr resmb-15">{phrases['TwoWheelBrand']}
                                                                        - <strong>{brandName ? brandName : (vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : "")}</strong>
                                                                    </div>

                                                                    <div> <button type="button" className="rgistrBtn" onClick={this.selectVehicle.bind(this, productId)}>{phrases['Edit']}</button></div>
                                                                </div>

                                                                <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                    <div className="txtRegistr resmb-15">{phrases['TwoWheelModel']}
                                                                        - <strong>{modelName ? modelName : (selectedBrandId ? "" : vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : "")}</strong></div>

                                                                    <div> <button type="button" className="rgistrBtn" onClick={this.selectBrand.bind(this, productId)}>{phrases['Edit']}</button></div>
                                                                </div>

                                                                <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                    <div className="txtRegistr">{phrases['Fuel']}<br />
                                                                    <strong>{fuel[fuelType] ? fuel[fuelType] : (vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fuel_type ? fuel[Math.floor(vehicleDetails.varientmodel.fuel_type)] : null)} </strong></div>

                                                                </div>
                                                            </div>
                                                        </Fragment> : 
                                                        <Fragment>
                                                        <div className="regisBox">
                                                            <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">

                                                                <div className="txtRegistr resmb-15">{phrases['RegNo']}.<br />
                                                                    {motorInsurance && motorInsurance.registration_no}</div>

                                                                <div> <button type="button" className="rgistrBtn" onClick={this.registration.bind(this, productId)}>{phrases['Edit']}</button></div>
                                                            </div>

                                                            <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                <div className="txtRegistr resmb-15">{phrases['TwoWheelBrand']}
                                                                    -  <strong>{fastLaneData && fastLaneData.brand_text ? fastLaneData.brand_text  : vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : ""}</strong>
                                                                </div>

                                                                {/* <div> <button type="button" className="rgistrBtn" onClick={this.selectVehicle.bind(this, productId)}>{phrases['Edit']}</button></div> */}
                                                            </div>

                                                            <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                <div className="txtRegistr">{phrases['TwoWheelModel']}
                                                                    -  <strong>{fastLaneData && fastLaneData.model_text ? fastLaneData.model_text+" "+fastLaneData.varient_text : vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : "" }</strong></div>

                                                                <div> <button type="button" className="rgistrBtn" onClick={this.selectBrand.bind(this, productId)}>{phrases['Edit']}</button></div>
                                                            </div>

                                                            <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                <div className="txtRegistr">{phrases['Fuel']}<br />
                                                                <strong>{fastLaneData && fastLaneData.fuel ? fastLaneData.fuel : vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fuel_type ? fuel[Math.floor(vehicleDetails.varientmodel.fuel_type)] : null } </strong></div>

                                                            </div>
                                                        </div>
                                                    </Fragment> }
                                                    </div>
                                                    
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
                                <img src={`${process.env.REACT_APP_PAYMENT_URL}/core/public/image/car_brand_image/` + selectedBrandDetails.image} alt={selectedBrandDetails.name} /> : null
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
                                {this.state.searchitem && this.state.searchitem.length > 0 ?

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
                                                                        this.setVarient(e.target.value, brand.id, brand.name+" "+varient.varient, 
                                                                            varient.fuel_type)
                                                                    }
                                                                />
                                                                <span className="checkmark mL-0"></span>
                                                                <span className="error-message"></span>
                                                            </div>         
                                                    </label>
                                                </div>
                                            )))
                                        ))
                                    : 
                                    (brandModelList && brandModelList.length > 0 && brandModelList.map((brand, brandIndex) => (
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
                                                                    varient.fuel_type)
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
                            {this.state.searchitem && this.state.searchitem.length > 0 ?

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
                                                                        brand.name, model.name+" "+varient.varient, varient.fuel_type )
                                                                }
                                                            />
                                                            <span className="checkmark mL-0"></span>
                                                            <span className="error-message"></span>
                                                        </div>
                                                </label>
                                            </div>
                                        )))
                                    ))))
                                :
                                (this.state.brandModelList && this.state.brandModelList.length > 0 && this.state.brandModelList.map((brand, brandIndex) => (
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
                                                                    brand.name, model.name+" "+varient.varient, varient.fuel_type )
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TwoWheelerSelectBrandOD));