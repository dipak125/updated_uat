import React, { Component } from 'react';
import HeaderSecond from '../common/header/HeaderSecond';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import TwoWheelerBrandTable from '../common/TwoWheelerBrandTable';
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



const initialValues = {
    selectedBrandId: '',
    selectedBrandName: '',
    selectedModelId: '',
    selectedModelName: '',
    selectedVarientId: ''

};

const fuel = {
    1: 'Petrol',
    2: 'Diesel'
}


const vehicleValidation = Yup.object().shape({
    selectedBrandId: Yup.string().required("Please enter the brand name"),
    selectedModelId: Yup.string().required("Please enter the model name"),
    // selectedVarientId : Yup.string().required("Please enter the varient name"),
})


class TwoWheelerSelectBrand extends Component {

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
            fuelType: ''
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
        return new Promise(resolve => {
            axios.get(`vehicle/brand-with-image`)
                .then(res => {
                    let brandList = res && res.data.data.list ? res.data.data.list : []
                    this.setState({
                        brandList,
                        otherBrands: false
                    })
                    this.props.loadingStop();
                })
                .catch(err => {
                    // handle error
                    // console.log(error);
                    this.props.loadingStop();
                })
        })

    }

    getOtherBrands = () => {
        this.props.loadingStart();
        axios.get(`vehicle/brand-without-image`).then(res => {
            let selectedBrandDetails = res.data && res.data.data ? res.data.data : {};
            let brandModelList = res.data && res.data.data ? res.data.data.list : [];
            console.log("brandModelList", brandModelList)
            this.setState({
                selectedBrandDetails,
                brandModelList,
                show: true,
                otherBrands: true
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
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        this.props.loadingStart();
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                let motorInsurance = res.data.data.policyHolder ? res.data.data.policyHolder.motorinsurance : {}
                this.setState({
                    motorInsurance
                })
                this.getBrands();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }


    registration = (productId) => {
        this.props.history.push(`/Registration/${productId}`);
    }


    setBrandName = (brand_id) => {
        this.props.loadingStart();
        axios.get(`vehicle/model-with-varient/${brand_id}`).then(res => {
            let selectedBrandDetails = res.data && res.data.data ? res.data.data : {};
            let brandModelList = res.data && res.data.data.brand_models ? res.data.data.brand_models : [];

            this.setState({
                selectedBrandDetails,
                brandModelList,
                show: true,
                selectedBrandId: brand_id,
                brandName: selectedBrandDetails.name,
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
            fuelType: fuelType
        })
    }

    setOtherVarient = (varient, model_Id, brand_Id, brandName, modelName, fuelType) => {
        this.setState({
            selectedVarientId: varient,
            selectedModelId: model_Id,
            selectedBrandId: brand_Id,
            brandName: brandName,
            modelName: modelName,
            fuelType: fuelType
        })
    }

    handleSubmit = (values) => {
        const { productId } = this.props.match.params
        const { selectedVarientId, selectedModelId, selectedBrandId } = this.state
        const formData = new FormData();
        let encryption = new Encryption();
        const post_data = {
            'policy_holder_id': localStorage.getItem('policyHolder_id'),
            'menumaster_id': 1,
            'brand_id': selectedBrandId,
            'brand_model_id': selectedModelId,
            'model_varient_id': selectedVarientId,
        }
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('insert-brand-model-varient', formData).then(res => {
            this.props.loadingStop();
            if (res.data.error == false) {
                this.props.history.push(`/VehicleDetails/${productId}`);
            }

        })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }


    render() {
        const { brandList, motorInsurance, selectedBrandDetails, brandModelList, selectedBrandId,
            selectedModelId, selectedVarientId, otherBrands, brandName, modelName, fuelType } = this.state
        const { productId } = this.props.match.params
        const newInitialValues = Object.assign(initialValues, {
            selectedBrandId: selectedBrandId ? selectedBrandId : '',
            selectedModelId: selectedModelId ? selectedModelId : '',
            selectedBrandName: '',
            selectedModelName: '',
            selectedVarientId: selectedVarientId ? selectedVarientId : '',

        })

        console.log("selectedBrandDetails", selectedBrandDetails)
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
                                    onSubmit={ this.handleSubmit} 
                                    // validationSchema={ComprehensiveValidation}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                        // console.log("aaaaaa=GHHH====>", values)
                                        return (
                                            <Form>
                                                <section className="brand">
                                                    <div className="brand-bg">
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <p>Tell us about your policy details</p>

                                                                <div className="d-inline-flex m-b-15">
                                                                    {/* <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='policy_type'
                                                                                value='1'
                                                                                key='1'
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"> New Policy</span>
                                                                        </label>
                                                                    </div> */}
                                                                    
                                                                    <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='policy_type'
                                                                                value='2'
                                                                                key='1'
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"> Roll Over</span>
                                                                        </label>
                                                                    </div>

                                                                    <div>
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='policy_type'
                                                                                value='3'
                                                                                key='1'
                                                                            />
                                                                            <span className="checkmark" />
                                                                            <span className="fs-14">Lapse Policy</span>
                                                                        </label>
                                                                        {errors.policy_type && touched.policy_type ? (
                                                                            <span className="errorMsg">{errors.policy_type}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="brandhead">
                                                        <h4 className="m-b-30">Help us with some information about yourself</h4></div>
                                                        <Row className="m-b-15">
                                                            <Col sm={12}>
                                                            
                                                                        <div className="row formSection">
                                                                            <label className="col-md-4">Enter Vehicle Registration Number:</label>
                                                                            <div className="col-md-4">

                                                                                <Field
                                                                                    name="regNumber"
                                                                                    type="text"
                                                                                    placeholder="Registration Number"
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        {/* <div className="cntrbtn">
                                                                            <Button className={`btnPrimary`} type="submit" >
                                                                                Go
                                                                            </Button>


                                                                        </div> */}                                                             
                                                            </Col>
                                                        </Row>
                                                        <div className="brandhead">
                                                            <h4>Please select your Vehicle brand</h4>
                                                        </div>

                                                        <Row>
                                                            <Col sm={12} md={12}>
                                                                <TwoWheelerBrandTable brandList={brandList && brandList.length > 0 ? brandList : []} selectBrandFunc={this.setBrandName} otherBrandFunc={this.getOtherBrands} />



                                                                <div className="d-flex justify-content-left resmb">
                                                                    <Button className={`backBtn`} type="button" onClick={this.registration.bind(this, productId)}>
                                                                        Back
                                                                </Button>
                                                                    <Button className={`proceedBtn`} type="submit" onClick={this.handleShow} href={'#'} >
                                                                        Continue
                                                                </Button>
                                                                </div>


                                                            </Col>

                                                            {/* <Col sm={12} md={3}>
                                                                <div className="regisBox">
                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">

                                                                        <div className="txtRegistr resmb-15">Registration No.<br />
                                                                            {motorInsurance && motorInsurance.registration_no}</div>

                                                                        <div> <button className="rgistrBtn" onClick={this.registration.bind(this, productId)}>Edit</button></div>
                                                                    </div>



                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr resmb-15">Car Brand
                                                                            - {brandName}
                                                                        </div>

                                                                        <div> <button className="rgistrBtn">Edit</button></div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr">Car Model<br />
                                                                            <strong>{modelName}</strong></div>

                                                                        <div> <button className="rgistrBtn">Edit</button></div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr">Fuel Type<br />
                                                                            <strong>{fuel[fuelType]} </strong></div>

                                                                    </div>
                                                                </div>
                                                            </Col> */}
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
                    <Modal.Header closeButton className="custmModlHead">
                        <div className="cntrbody">
                            <h3>Select Model </h3>
                            {selectedBrandDetails.image ?
                                <img src={'http://14.140.119.44/sbig-csc/core/public/image/car_brand_image/' + selectedBrandDetails.image} alt={selectedBrandDetails.name} /> :
                                <img src={require('../../assets/images/two-wheeler-01.svg')} alt="" />
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
                                        placeholder="Search your variant "
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
                                            this.state.searchitem.length > 0 && this.state.searchitem.map((brand, brandIndex) => (
                                                brand.varientmodel.length > 0 && brand.varientmodel.map((varient, varientIndex) => (
                                                    <div className="brdrbottom">
                                                        <div className="d-flex justify-content-between">
                                                            <div className="modalboxInfo">{brand.name}
                                                                <span className="grey ml-5">{varient.varient + " " + varient.cc + "cc"}</span>
                                                            </div>
                                                            <div>
                                                                <label className="customCheckBox formGrp formGrp">
                                                                    <input type="radio"
                                                                        name="varient"
                                                                        className="user-self"
                                                                        id="varient"
                                                                        value={varient.id}
                                                                        aria-invalid="false"
                                                                        onClick={(e) =>
                                                                            this.setVarient(e.target.value, brand.id, brand.name + " " + varient.varient,
                                                                                varient.fuel_type)
                                                                        }
                                                                    />
                                                                    <span className="checkmark mL-0"></span>
                                                                    <span className="error-message"></span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )))
                                            ))
                                        :
                                        (brandModelList.length > 0 && brandModelList.map((brand, brandIndex) => (
                                            brand.varientmodel.length > 0 && brand.varientmodel.map((varient, varientIndex) => (

                                                <div className="brdrbottom">
                                                    <div className="d-flex justify-content-between">
                                                        <div className="modalboxInfo">{brand.name}
                                                            <span className="grey ml-5">{varient.varient + " " + varient.cc + "cc"}</span>
                                                        </div>
                                                        <div>
                                                            <label className="customCheckBox formGrp formGrp">
                                                                <input type="radio"
                                                                    name="varient"
                                                                    className="user-self"
                                                                    id="varient"
                                                                    value={varient.id}
                                                                    aria-invalid="false"
                                                                    onClick={(e) =>
                                                                        this.setVarient(e.target.value, brand.id, brand.name + " " + varient.varient,
                                                                            varient.fuel_type)
                                                                    }
                                                                />
                                                                <span className="checkmark mL-0"></span>
                                                                <span className="error-message"></span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ))
                                        )}

                                </ScrollArea> :
                                <ScrollArea
                                    speed={0.8}
                                    className="area"
                                    contentClassName="content"
                                    horizontal={false}
                                >
                                    {this.state.searchitem && this.state.searchitem.length > 0 ?

                                        (
                                            this.state.searchitem.length > 0 && this.state.searchitem.map((brand, brandIndex) => (
                                                brand.brand_models.length > 0 && brand.brand_models.map((model, modelIndex) => (
                                                    model.varientmodel.length > 0 && model.varientmodel.map((varient, varientIndex) => (
                                                        <div className="brdrbottom">
                                                            <div className="d-flex justify-content-between">
                                                                <div className="modalboxInfo">{brand.name}
                                                                    <span className="grey ml-5">{model.name + " " + varient.varient}</span>
                                                                </div>
                                                                <div>
                                                                    <label className="customCheckBox formGrp formGrp">
                                                                        <input type="radio"
                                                                            name="varient"
                                                                            className="user-self"
                                                                            id="varient"
                                                                            value={varient.id}
                                                                            aria-invalid="false"
                                                                            onClick={(e) =>
                                                                                this.setOtherVarient(e.target.value, model.id, model.brand_id,
                                                                                    brand.name, model.name + " " + varient.varient, varient.fuel_type)
                                                                            }
                                                                        />
                                                                        <span className="checkmark mL-0"></span>
                                                                        <span className="error-message"></span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )))
                                                ))))
                                        :
                                        (this.state.brandModelList.length > 0 && this.state.brandModelList.map((brand, brandIndex) => (
                                            brand.brand_models.length > 0 && brand.brand_models.map((model, modelIndex) => (
                                                model.varientmodel.length > 0 && model.varientmodel.map((varient, varientIndex) => (

                                                    <div className="brdrbottom">
                                                        <div className="d-flex justify-content-between">
                                                            <div className="modalboxInfo">{brand.name}
                                                                <span className="grey ml-5">{model.name + " " + varient.varient}</span>
                                                            </div>
                                                            <div>
                                                                <label className="customCheckBox formGrp formGrp">
                                                                    <input type="radio"
                                                                        name="varient"
                                                                        className="user-self"
                                                                        id="varient"
                                                                        value={varient.id}
                                                                        aria-invalid="false"
                                                                        onClick={(e) =>
                                                                            this.setOtherVarient(e.target.value, model.id, model.brand_id,
                                                                                brand.name, model.name + " " + varient.varient, varient.fuel_type)
                                                                        }
                                                                    />
                                                                    <span className="checkmark mL-0"></span>
                                                                    <span className="error-message"></span>
                                                                </label>
                                                            </div>
                                                        </div>
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
                                Continue</button> : null}
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TwoWheelerSelectBrand));