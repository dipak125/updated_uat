import React, { Component } from 'react';
import { Route, Switch, BrowserRouter,Redirect, withRouter, HashRouter } from "react-router-dom";
import { Formik, Field, Form } from "formik";

import { connect } from "react-redux";
import Loadable from 'react-loadable';
import { authValidate } from "../../store/actions/auth";
import { PrivateRoute } from "../../shared/private-route";
import Loader from "react-loader-spinner";

import LogIn from "../common/login/LogIn";

import Registration from '../motor/Registration';
import VehicleDetails from '../motor/VehicleDetails';
import AdditionalDetails from '../motor/AdditionalDetails';
import OtherComprehensive from '../motor/OtherComprehensive';
import Premium from '../motor/Premium';
// import ThankYou_motor from '../motor/ThankYou';


// import TwoWheelerRegistration from '../two-wheeler/TwoWheelerRegistration';
import TwoWheelerSelectBrand from '../two-wheeler/TwoWheelerSelectBrand';
import TwoWheelerVehicleDetails from '../two-wheeler/TwoWheelerVehicleDetails';
import TwoWheelerPolicyPremiumDetails from '../two-wheeler/TwoWheelerPolicyPremiumDetails';
import TwoWheelerOtherComprehensive from '../two-wheeler/TwoWheelerOtherComprehensive';
import TwoWheelerVerify from '../two-wheeler/TwoWheelerVerify';
import TwoWheelerAdditionalDetails from '../two-wheeler/TwoWheelerAdditionalDetails';
// import TwoWheelerThankYou_motor from '../two-wheeler/TwoWheelerThankYou';


import UnderMaintenance from '../UnderMaintenance';


const componentLoader = () => {
    return (
        <div style={{ height: "540px" }}>
            <div className="loading">
                <Loader type="Oval" color="#000000" height="50" width="50" />
            </div>
        </div>
    )
}
const loadingContent = componentLoader();

const Error = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/ErrorPage.jsx"),
    loading: () => loadingContent
});

const Logout = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/Logout.jsx"),
    loading: () => loadingContent
});


const Break_in = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../support/BreakinList.jsx"),
    loading: () => loadingContent
});

const Break_form = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../support/RequestForm.jsx"),
    loading: () => loadingContent
});

const PolicySearch = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/PolicySearch.jsx"),
    loading: () => loadingContent
});

const QuoteSearch = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/QuoteSearch.jsx"),
    loading: () => loadingContent
});


const Products = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../products/Products.jsx"),
    loading: () => loadingContent
});

const Documents = Loadable({
    loader: () => import(/*webpackChunkName: "Documents" */"../products/Documents.jsx"),
    loading: () => loadingContent
});

const Services = Loadable({
    loader: () => import(/*webpackChunkName: "Documents" */"../services/Services.jsx"),
    loading: () => loadingContent
});

const Supports = Loadable({
    loader: () => import(/*webpackChunkName: "Supports" */"../support/Supports.jsx"),
    loading: () => loadingContent
});

const TicketCount = Loadable({
    loader: () => import(/*webpackChunkName: "TicketCount" */"../support/TicketCount.jsx"),
    loading: () => loadingContent
});

const Health = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/InformationYourself.jsx"),
    loading: () => loadingContent
});
const MedicalDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/MedicalDetails.jsx"),
    loading: () => loadingContent
});
const SelectDuration = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/SelectDuration.jsx"),
    loading: () => loadingContent
});
const Address = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/Address.jsx"),
    loading: () => loadingContent
});
const NomineeDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/NomineeDetails.jsx"),
    loading: () => loadingContent
});
const PolicyDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/PolicyDetails.jsx"),
    loading: () => loadingContent
});
const ThankYou = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/ThankYou.jsx"),
    loading: () => loadingContent
});
const SelectBrand = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../motor/SelectBrand.jsx"),
    loading: () => loadingContent
});

// ========== Two-Wheeler TP =============================================

const TwoWheelerSelectBrandTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerSelectBrandTP.jsx"),
    loading: () => loadingContent
});
const TwoWheelerVehicleDetailsTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerVehicleDetailsTP.jsx"),
    loading: () => loadingContent
});
const TwoWheelerPolicyPremiumDetailsTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerPolicyPremiumDetailsTP.jsx"),
    loading: () => loadingContent
});
const TwoWheelerOtherComprehensiveTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerOtherComprehensiveTP.jsx"),
    loading: () => loadingContent
});
const TwoWheelerVerifyTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerVerifyTP.jsx"),
    loading: () => loadingContent
});
const TwoWheelerAdditionalDetailsTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerAdditionalDetailsTP.jsx"),
    loading: () => loadingContent
});

// ======================== Four-Wheeler TP ========================================

const FourWheelerSelectBrandTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerSelectBrandTP.jsx"),
    loading: () => loadingContent
});
const FourWheelerVehicleDetailsTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerVehicleDetailsTP.jsx"),
    loading: () => loadingContent
});
const FourWheelerPolicyPremiumDetailsTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerPolicyPremiumDetailsTP.jsx"),
    loading: () => loadingContent
});
const FourWheelerOtherComprehensiveTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerOtherComprehensiveTP.jsx"),
    loading: () => loadingContent
});
const FourWheelerVerifyTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerVerifyTP.jsx"),
    loading: () => loadingContent
});
const FourWheelerAdditionalDetailsTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerAdditionalDetailsTP.jsx"),
    loading: () => loadingContent
});


// ======================== Motor GCV ========================================

const RegistrationGCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV/RegistrationGCV.jsx"),
    loading: () => loadingContent
});
const SelectBrandGCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV/SelectBrandGCV.jsx"),
    loading: () => loadingContent
});
const VehicleDetailsGCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV/VehicleDetailsGCV.jsx"),
    loading: () => loadingContent
});
const OtherComprehensiveGCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV/OtherComprehensiveGCV.jsx"),
    loading: () => loadingContent
});
const AdditionalDetailsGCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV/AdditionalDetailsGCV.jsx"),
    loading: () => loadingContent
});
const PremiumGCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV/PremiumGCV.jsx"),
    loading: () => loadingContent
});

// ======================== Motor GCV tp ========================================

const RegistrationGCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/RegistrationGCV_TP.jsx"),
    loading: () => loadingContent
});
const SelectBrandGCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/SelectBrandGCV_TP.jsx"),
    loading: () => loadingContent
});
const VehicleDetailsGCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/VehicleDetailsGCV_TP.jsx"),
    loading: () => loadingContent
});
const OtherComprehensiveGCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/OtherComprehensiveGCV_TP.jsx"),
    loading: () => loadingContent
});
const AdditionalDetailsGCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/AdditionalDetailsGCV_TP.jsx"),
    loading: () => loadingContent
});
const PremiumGCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/PremiumGCV_TP.jsx"),
    loading: () => loadingContent
});

// ======================== SME Fire ========================================

const RegistrationSME = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/Registration_sme.jsx"),
    loading: () => loadingContent
});

const RiskDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/RiskDetails.jsx"),
    loading: () => loadingContent
});
const OtherDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/OtherDetails.jsx"),
    loading: () => loadingContent
});
const AdditionalDetailsSME = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/AdditionalDetails_sme.jsx"),
    loading: () => loadingContent
});
const PremiumSME = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/Premium_sme.jsx"),
    loading: () => loadingContent
});

//  =================================== Landing Page ==================================

const Dashboard = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../landing_page/Dashboard"),
    loading: () => loadingContent
});



class Routes extends Component {
    render() {
        this.props.onAuthPersist();
        return (
            <>
                <HashRouter>
                    <Switch>
                        <Route exact path="/login" component={LogIn} />                
                        <Route exact path="/logout" component={Logout} /> 
                        <PrivateRoute exact path="/Error" component={Error} />

                        <PrivateRoute exact path="/Products" component={Products} />
                        <PrivateRoute exact path="/Health/:productId" component={Health} />
                        <PrivateRoute exact path="/MedicalDetails/:productId" component={MedicalDetails} />
                        <PrivateRoute exact path="/SelectDuration/:productId" component={SelectDuration} />
                        <PrivateRoute exact path="/Address/:productId" component={Address} />    
                        <PrivateRoute exact path="/NomineeDetails/:productId" component={NomineeDetails} /> 
                        <PrivateRoute exact path="/PolicyDetails/:productId" component={PolicyDetails} />
                        {/* <PrivateRoute exact path="/PolicySummery/:productId" component={PolicySummery} />                  */}
                        <PrivateRoute exact path="/ThankYou/:policyId" component={ThankYou} />
                    
                        
                        <PrivateRoute exact path="/Registration/:productId" component={Registration} />                    
                        <PrivateRoute exact path="/Select-brand/:productId" component={SelectBrand} />
                        <PrivateRoute exact path="/VehicleDetails/:productId" component={VehicleDetails} />
                        <PrivateRoute exact path="/OtherComprehensive/:productId" component={OtherComprehensive} />
                        <PrivateRoute exact path="/Additional_details/:productId" component={AdditionalDetails} />
                        <PrivateRoute exact path="/Premium/:productId" component={Premium} />
                        {/* <PrivateRoute exact path="/ThankYou_motor/:policyId" component={ThankYou_motor} /> */}
                        
                        {/* ********************** LandingPage ***************  */}  RenewalPlanner                  
                        <PrivateRoute exact path="/Dashboard" component={Dashboard} />  


                        {/************ TwoWheeler ******************/}
                        {/* <PrivateRoute exact path="/two_wheeler_Registration/:productId" component={TwoWheelerRegistration} />                     */}
                        <PrivateRoute exact path="/two_wheeler_Select-brand/:productId" component={TwoWheelerSelectBrand} />
                        <PrivateRoute exact path="/two_wheeler_Vehicle_details/:productId" component={TwoWheelerVehicleDetails} />
                        <PrivateRoute exact path="/two_wheeler_OtherComprehensive/:productId" component={TwoWheelerOtherComprehensive} />
                        <PrivateRoute exact path="/two_wheeler_verify/:productId" component={TwoWheelerVerify} />
                        <PrivateRoute exact path="/two_wheeler_additional_details/:productId" component={TwoWheelerAdditionalDetails} />  
                        <PrivateRoute exact path="/two_wheeler_policy_premium_details/:productId" component={TwoWheelerPolicyPremiumDetails} />
                        {/* <PrivateRoute exact path="/two_wheeler_ThankYou_motor/:policyId" component={TwoWheelerThankYou_motor} /> */}

                        {/************ TwoWheelerTP ******************/}
                        <PrivateRoute exact path="/two_wheeler_Select-brandTP/:productId" component={TwoWheelerSelectBrandTP} />
                        <PrivateRoute exact path="/two_wheeler_Vehicle_detailsTP/:productId" component={TwoWheelerVehicleDetailsTP} />
                        <PrivateRoute exact path="/two_wheeler_OtherComprehensiveTP/:productId" component={TwoWheelerOtherComprehensiveTP} />
                        <PrivateRoute exact path="/two_wheeler_verifyTP/:productId" component={TwoWheelerVerifyTP} />
                        <PrivateRoute exact path="/two_wheeler_additional_detailsTP/:productId" component={TwoWheelerAdditionalDetailsTP} />  
                        <PrivateRoute exact path="/two_wheeler_policy_premium_detailsTP/:productId" component={TwoWheelerPolicyPremiumDetailsTP} />
                        {/* <PrivateRoute exact path="/two_wheeler_ThankYou_motorTP/:policyId" component={TwoWheelerThankYou_motorTP} /> */}

                        {/************ FourWheelerTP ******************/}
                        <PrivateRoute exact path="/four_wheeler_Select-brandTP/:productId" component={FourWheelerSelectBrandTP} />
                        <PrivateRoute exact path="/four_wheeler_Vehicle_detailsTP/:productId" component={FourWheelerVehicleDetailsTP} />
                        <PrivateRoute exact path="/four_wheeler_OtherComprehensiveTP/:productId" component={FourWheelerOtherComprehensiveTP} />
                        <PrivateRoute exact path="/four_wheeler_verifyTP/:productId" component={FourWheelerVerifyTP} />
                        <PrivateRoute exact path="/four_wheeler_additional_detailsTP/:productId" component={FourWheelerAdditionalDetailsTP} />  
                        <PrivateRoute exact path="/four_wheeler_policy_premium_detailsTP/:productId" component={FourWheelerPolicyPremiumDetailsTP} />

                         {/************ MotorGCV ******************/}
                         <PrivateRoute exact path="/Registration_GCV/:productId" component={RegistrationGCV} />
                        <PrivateRoute exact path="/SelectBrand_GCV/:productId" component={SelectBrandGCV} />
                        <PrivateRoute exact path="/VehicleDetails_GCV/:productId" component={VehicleDetailsGCV} />
                        <PrivateRoute exact path="/OtherComprehensive_GCV/:productId" component={OtherComprehensiveGCV} />
                        <PrivateRoute exact path="/AdditionalDetails_GCV/:productId" component={AdditionalDetailsGCV} />  
                        <PrivateRoute exact path="/Premium_GCV/:productId" component={PremiumGCV} />

                        {/************ MotorGCV - TP ******************/}
                        <PrivateRoute exact path="/Registration_GCV_TP/:productId" component={RegistrationGCVTP} />
                        <PrivateRoute exact path="/SelectBrand_GCV_TP/:productId" component={SelectBrandGCVTP} />
                        <PrivateRoute exact path="/VehicleDetails_GCV_TP/:productId" component={VehicleDetailsGCVTP} />
                        <PrivateRoute exact path="/OtherComprehensive_GCV_TP/:productId" component={OtherComprehensiveGCVTP} />
                        <PrivateRoute exact path="/AdditionalDetails_GCV_TP/:productId" component={AdditionalDetailsGCVTP} />  
                        <PrivateRoute exact path="/Premium_GCV_TP/:productId" component={PremiumGCVTP} />

                        {/************ SME - Fire ******************/}
                        <PrivateRoute exact path="/Registration_SME/:productId" component={RegistrationSME} />
                        <PrivateRoute exact path="/RiskDetails/:productId" component={RiskDetails} />
                        <PrivateRoute exact path="/OtherDetails/:productId" component={OtherDetails} />
                        <PrivateRoute exact path="/AdditionalDetails_SME/:productId" component={AdditionalDetailsSME} />
                        <PrivateRoute exact path="/Premium_SME/:productId" component={PremiumSME} />  

                        {/************ Support ******************/}
                        <PrivateRoute exact path="/Documents" component={Documents} />
                        <PrivateRoute exact path="/Supports" component={Supports} />
                        <PrivateRoute exact path="/TicketCount" component={TicketCount} /> 

                        {/************ BREAK IN ******************/}
                        <PrivateRoute exact path="/Break_in" component={Break_in} />
                        <PrivateRoute exact path="/Break_form" component={Break_form} /> 

                        {/************ Dashboard ******************/}
                        <PrivateRoute exact path="/PolicySearch" component={PolicySearch} />   
                        <PrivateRoute exact path="/QuoteSearch" component={QuoteSearch} />

                        {/************ Services ******************/}
                        <PrivateRoute exact path="/Services" component={Services} />



                        <PrivateRoute exact path="/UnderMaintenance" component={UnderMaintenance} />
                        <Redirect from="/" to="/Dashboard" />
                    </Switch>
                </HashRouter>
            </>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.auth.token
    }
  
  }
  
  const mapDispatchToProps = dispatch => {
    return {
        onAuthPersist: () => dispatch(authValidate())
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Routes);




