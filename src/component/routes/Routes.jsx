import React, { Component } from 'react';
import { Route, Switch, BrowserRouter, Redirect, withRouter, HashRouter } from "react-router-dom";
import { Formik, Field, Form } from "formik";

import { connect } from "react-redux";
import Loadable from 'react-loadable';
import { authValidate } from "../../store/actions/auth";
import { PrivateRoute } from "../../shared/private-route";
import Loader from "react-loader-spinner";

import LogIn from "../common/login/LogIn";
import Intermediary_LogIn from "../common/intermediary_login/Intermediary_LogIn";
import Reset_Password from "../common/intermediary_login/Reset_Password";

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

const AgentCashDeposit = Loadable({
    loader: () => import(/*webpackChunkName: "Deposits" */"../common/ACD/AgentCashDeposit.jsx"),
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

// ========== HEALTH =============================================

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


// ========== AROGYA SANJEEVANI MICRO =============================================

const Health_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Micro/InformationYourself_Micro.jsx"),
    loading: () => loadingContent
});
const MedicalDetails_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Micro/MedicalDetails_Micro.jsx"),
    loading: () => loadingContent
});
const SelectDuration_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Micro/SelectDuration_Micro.jsx"),
    loading: () => loadingContent
});
const Address_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Micro/Address_Micro.jsx"),
    loading: () => loadingContent
});
const NomineeDetails_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Micro/NomineeDetails_Micro.jsx"),
    loading: () => loadingContent
});
const PolicyDetails_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Micro/PolicyDetails_Micro.jsx"),
    loading: () => loadingContent
});

//========== AROGYA PLUS =============================================

const Health_Arogya = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_Plus/InformationYourself_Arogya.jsx"),
    loading: () => loadingContent
});
const MedicalDetails_Plus = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_Plus/MedicalDetails_Plus.jsx"),
    loading: () => loadingContent
});
const SelectDuration_Plus = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_Plus/SelectDuration_Plus.jsx"),
    loading: () => loadingContent
});
const Address_Plus = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_Plus/Address_Plus.jsx"),
    loading: () => loadingContent
});
const NomineeDetails_Plus = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_Plus/NomineeDetails_Plus.jsx"),
    loading: () => loadingContent
});
const PolicyDetails_Plus = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_Plus/PolicyDetails_Plus.jsx"),
    loading: () => loadingContent
});


// ========== AROGYA SANJEEVANI MICRO GROUP =============================================

const Health_Group = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Group/InformationYourself_Group.jsx"),
    loading: () => loadingContent
});
const MedicalDetails_Group = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Group/MedicalDetails_Group.jsx"),
    loading: () => loadingContent
});
const SelectDuration_Group = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Group/SelectDuration_Group.jsx"),
    loading: () => loadingContent
});
const Address_Group = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Group/Address_Group.jsx"),
    loading: () => loadingContent
});
const NomineeDetails_Group = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Group/NomineeDetails_Group.jsx"),
    loading: () => loadingContent
});
const PolicyDetails_Group = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/Arogya-Sanjeevani-Group/PolicyDetails_Group.jsx"),
    loading: () => loadingContent
});

// =======================================================

const ThankYou = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/ThankYou.jsx"),
    loading: () => loadingContent
});
const ThankYouCCM = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/ThankYouCCM.jsx"),
    loading: () => loadingContent
});

//============================ Motor Comprehensive=============================
const SelectBrand = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../motor/SelectBrand.jsx"),
    loading: () => loadingContent
});

// =================== AROGYA TOPUP =============================== //

const arogya_Health = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_InformationYourself"),
    loading: () => loadingContent
});
const arogya_MedicalDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_MedicalDetails.jsx"),
    loading: () => loadingContent
});
const arogya_SelectDuration = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_SelectDuration.jsx"),
    loading: () => loadingContent
});
const arogya_Address = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_Address"),
    loading: () => loadingContent
});
const arogya_NomineeDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_NomineeDetails.jsx"),
    loading: () => loadingContent
});
const arogya_PolicyDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_PolicyDetails.jsx"),
    loading: () => loadingContent
});

//=====================================================================================

// =================== Hospital Daily Cash =============================== //

const dailycash_Health = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Hospital_dailyCash/dailycash_InformationYourself"),
    loading: () => loadingContent
});
const dailycash_MedicalDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Hospital_dailyCash/dailycash_MedicalDetails.jsx"),
    loading: () => loadingContent
});
const dailycash_FullQuote = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Hospital_dailyCash/dailycash_FullQuote.jsx"),
    loading: () => loadingContent
});
const dailycash_Address = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Hospital_dailyCash/dailycash_Address"),
    loading: () => loadingContent
});
const dailycash_NomineeDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Hospital_dailyCash/dailycash_NomineeDetails.jsx"),
    loading: () => loadingContent
});
const dailycash_PolicyDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Hospital_dailyCash/dailycash_PolicyDetails.jsx"),
    loading: () => loadingContent
});

//=====================================================================================

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

// ======================== Motor GCV Short Term ========================================

const RegistrationGCVST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-ShortTerm/RegistrationGCVST.jsx"),
    loading: () => loadingContent
});
const SelectBrandGCVST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-ShortTerm/SelectBrandGCVST.jsx"),
    loading: () => loadingContent
});
const VehicleDetailsGCVST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-ShortTerm/VehicleDetailsGCVST.jsx"),
    loading: () => loadingContent
});
const OtherComprehensiveGCVST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-ShortTerm/OtherComprehensiveGCVST.jsx"),
    loading: () => loadingContent
});
const AdditionalDetailsGCVST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-ShortTerm/AdditionalDetailsGCVST.jsx"),
    loading: () => loadingContent
});
const PremiumGCVST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GCV-ShortTerm/PremiumGCVST.jsx"),
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

const SummarySME = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/Summary_sme.jsx"),
    loading: () => loadingContent
});

// ======================== Sookshma Fire ========================================

const RegistrationSukhsam = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Sookshma/Registration_sukhsam.jsx"),
    loading: () => loadingContent
});

const RiskDetailsSukhsam = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Sookshma/RiskDetails_sukhsam.jsx"),
    loading: () => loadingContent
});
const OtherDetailsSukhsam = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Sookshma/OtherDetails_sukhsam.jsx"),
    loading: () => loadingContent
});
const AdditionalDetailsSukhsam = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Sookshma/AdditionalDetails_sukhsam.jsx"),
    loading: () => loadingContent
});
const PremiumSukhsam = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Sookshma/Premium_sukhsam.jsx"),
    loading: () => loadingContent
});

const SummarySukhsam = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Sookshma/Summary_sukhsam.jsx"),
    loading: () => loadingContent
});

//  =================================== Landing Page ==================================

const Dashboard = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../landing_page/Dashboard"),
    loading: () => loadingContent
});


// ======================== Motor MISC-D ========================================

const RegistrationMISCD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/RegistrationMISCD.jsx"),
    loading: () => loadingContent
});
const SelectBrandMISCD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/SelectBrandMISCD.jsx"),
    loading: () => loadingContent
});
const VehicleDetailsMISCD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/VehicleDetailsMISCD.jsx"),
    loading: () => loadingContent
});
const OtherComprehensiveMISCD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/OtherComprehensiveMISCD.jsx"),
    loading: () => loadingContent
});
const AdditionalDetailsMISCD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/AdditionalDetailsMISCD.jsx"),
    loading: () => loadingContent
});
const PremiumMISCD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/PremiumMISCD.jsx"),
    loading: () => loadingContent
});


// ======================== Motor MISC-D Short Term ========================================

const RegistrationMISCDST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D ShortTerm/RegistrationMISCDST.jsx"),
    loading: () => loadingContent
});
const SelectBrandMISCDST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D ShortTerm/SelectBrandMISCDST.jsx"),
    loading: () => loadingContent
});
const VehicleDetailsMISCDST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D ShortTerm/VehicleDetailsMISCDST.jsx"),
    loading: () => loadingContent
});
const OtherComprehensiveMISCDST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D ShortTerm/OtherComprehensiveMISCDST.jsx"),
    loading: () => loadingContent
});
const AdditionalDetailsMISCDST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D ShortTerm/AdditionalDetailsMISCDST.jsx"),
    loading: () => loadingContent
});
const PremiumMISCDST = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../MISC-D ShortTerm/PremiumMISCDST.jsx"),
    loading: () => loadingContent
});


// ======================== Motor PCV ========================================

const RegistrationPCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV/RegistrationPCV.jsx"),
    loading: () => loadingContent
});
const SelectBrandPCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV/SelectBrandPCV.jsx"),
    loading: () => loadingContent
});
const VehicleDetailsPCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV/VehicleDetailsPCV.jsx"),
    loading: () => loadingContent
});
const OtherComprehensivePCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV/OtherComprehensivePCV.jsx"),
    loading: () => loadingContent
});
const AdditionalDetailsPCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV/AdditionalDetailsPCV.jsx"),
    loading: () => loadingContent
});
const PremiumPCV = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV/PremiumPCV.jsx"),
    loading: () => loadingContent
});


// ======================KSB Retail =============================================

const Health_KSB = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/InformationYourself_KSB.jsx"),
    loading: () => loadingContent
});
const PreExistingDisease_KSB = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/PreExistingDisease_KSB.jsx"),
    loading: () => loadingContent
});
const SelectDuration_KSB = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/SelectDuration_KSB.jsx"),
    loading: () => loadingContent
});
const Address_KSB = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/Address_KSB.jsx"),
    loading: () => loadingContent
});
const NomineeDetails_KSB = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/NomineeDetails_KSB.jsx"),
    loading: () => loadingContent
});
const PolicyDetails_KSB = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/PolicyDetails_KSB.jsx"),
    loading: () => loadingContent
});

// ======================KSB Retail Micro =============================================

const Health_KSB_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/KSB-retail-Micro/InformationYourself_KSB_Micro.jsx"),
    loading: () => loadingContent
});
const Health_KSB_Micro_Group = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/KSB-retail-Micro-Group/KSB_File_Micro.jsx"),
    loading: () => loadingContent
});
const PreExistingDisease_KSB_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/KSB-retail-Micro/PreExistingDisease_KSB_Micro.jsx"),
    loading: () => loadingContent
});
const SelectDuration_KSB_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/KSB-retail-Micro/SelectDuration_KSB_Micro.jsx"),
    loading: () => loadingContent
});
const Address_KSB_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/KSB-retail-Micro/Address_KSB_Micro.jsx"),
    loading: () => loadingContent
});
const NomineeDetails_KSB_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/KSB-retail-Micro/NomineeDetails_KSB_Micro.jsx"),
    loading: () => loadingContent
});
const PolicyDetails_KSB_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/KSB-retail-Micro/PolicyDetails_KSB_Micro.jsx"),
    loading: () => loadingContent
});


// =================== INDIVIDUAL PERSONAL ACCIDENT  =============================== //

const AccidentSelectPlan = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../IndividualPersonalAccident/IPA_SelectPlan"),
    loading: () => loadingContent
});
const AccidentAddDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../IndividualPersonalAccident/IPA_AddDetails"),
    loading: () => loadingContent
});
const AccidentAdditionalDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../IndividualPersonalAccident/IPA_CommunicationalDetails"),
    loading: () => loadingContent
});
const IPA_Premium = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../IndividualPersonalAccident/IPA_Premium"),
    loading: () => loadingContent
});

// =================== INDIVIDUAL PERSONAL ACCIDENT  Micro Group =============================== //

const AccidentSelectPlan_Micro_Group = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/IndividualPersonalAccident-Micro-Group/IPA_File_Micro"),
    loading: () => loadingContent
});

// =================== INDIVIDUAL PERSONAL ACCIDENT  Micro =============================== //

const AccidentSelectPlan_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/IndividualPersonalAccident-Micro/IPA_SelectPlan_Micro"),
    loading: () => loadingContent
});
const AccidentAddDetails_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/IndividualPersonalAccident-Micro/IPA_AddDetails_Micro"),
    loading: () => loadingContent
});
const AccidentAdditionalDetails_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/IndividualPersonalAccident-Micro/IPA_CommunicationalDetails_Micro"),
    loading: () => loadingContent
});
const IPA_Premium_Micro = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Micro Products/IndividualPersonalAccident-Micro/IPA_Premium_Micro"),
    loading: () => loadingContent
});


// ========== Two-Wheeler OD =============================================

const TwoWheelerSelectBrandOD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-OD/TwoWheelerSelectBrandOD.jsx"),
    loading: () => loadingContent
});
const TwoWheelerVehicleDetailsOD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-OD/TwoWheelerVehicleDetailsOD.jsx"),
    loading: () => loadingContent
});
const TwoWheelerPolicyPremiumDetailsOD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-OD/TwoWheelerPolicyPremiumDetailsOD.jsx"),
    loading: () => loadingContent
});
const TwoWheelerOtherComprehensiveOD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-OD/TwoWheelerOtherComprehensiveOD.jsx"),
    loading: () => loadingContent
});
const TwoWheelerAdditionalDetailsOD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-OD/TwoWheelerAdditionalDetailsOD.jsx"),
    loading: () => loadingContent
});


// =================== GRAMIN SAMRIDDHI BIMA =============================== //

const SelectPlan_GSB = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GSB/SelectPlan_GSB"),
    loading: () => loadingContent
});
const AdditionalDetails_GSB = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GSB/AdditionalDetails_GSB"),
    loading: () => loadingContent
});
const PolicyDetails_GSB = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../GSB/PolicyDetails_GSB"),
    loading: () => loadingContent
});
// ====================================================================

// ========== Four-Wheeler OD =============================================

const RegistrationOD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../motor-OD/RegistrationOD.jsx"),
    loading: () => loadingContent
});
const SelectBrandOD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../motor-OD/SelectBrandOD.jsx"),
    loading: () => loadingContent
});
const VehicleDetailsOD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../motor-OD/VehicleDetailsOD.jsx"),
    loading: () => loadingContent
});
const OtherComprehensiveOD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../motor-OD/OtherComprehensiveOD.jsx"),
    loading: () => loadingContent
});
const AdditionalDetailsOD = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../motor-OD/AdditionalDetailsOD.jsx"),
    loading: () => loadingContent
});
const PremiumOD = Loadable({
    loader: () => import("../motor-OD/PremiumOD.jsx"),
    loading: () => loadingContent
});
/**/


//  ************ Vedvag Payment Gateway ******************

const VedvagGateway = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/Vedvag_gateway.jsx"),
    loading: () => loadingContent
});

//  ************ Sahipay Payment Gateway ******************

const SahipayGateway = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/Sahipay_gateway.jsx"),
    loading: () => loadingContent
});

//  ************ Transcrop Payment Gateway ******************

const TranscropGateway = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/Transcrop_gateway.jsx"),
    loading: () => loadingContent
});

//  ************ Fia Payment Gateway ******************

const FiaGateway = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/Fia_gateway.jsx"),
    loading: () => loadingContent
});

// **************** AISECT Pyment Gateway ***********************

const AisectGateway = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/Aisect_gateway.jsx"),
    loading: () => loadingContent
});


//  ************ Renewal ******************

const Renewal = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Renewal/Renewal.jsx"),
    loading: () => loadingContent
});

const MotorSummery = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Renewal/Motor/MotorSummery.jsx"),
    loading: () => loadingContent
});

const MotorCoverages = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Renewal/Motor/MotorCoverages.jsx"),
    loading: () => loadingContent
});

const HealthSummery = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Renewal/Health/HealthSummery.jsx"),
    loading: () => loadingContent
});

const ThankYouRenewal = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Renewal/ThankYouRenewal.jsx"),
    loading: () => loadingContent
});

//  ************ Claim Intimation ******************

const ClaimIntimation = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Claim_Intimation/ClaimIntimation.jsx"),
    loading: () => loadingContent
});

const ClaimStatus = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../Claim_Intimation/ClaimStatus/ClaimStatus.jsx"),
    loading: () => loadingContent
})
    ;

//  ************ DIY Endorsement ******************

const NewEndorsement = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../DIY-Endorsement/NewEndorsement.jsx"),
    loading: () => loadingContent
});
const ViewEndorsement = Loadable({
    loader: () => import("../DIY-Endorsement/ViewStatus.jsx"),
    loading: () => loadingContent
})


//========================PCV TP================================================

const RegistrationPCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV-TP/RegistrationPCV_TP.jsx"),
    loading: () => loadingContent
});
const SelectBrandPCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV-TP/SelectBrandPCV_TP.jsx"),
    loading: () => loadingContent
});
const VehicleDetailsPCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV-TP/VehicleDetailsPCV_TP.jsx"),
    loading: () => loadingContent
});
const OtherComprehensivePCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV-TP/OtherComprehensivePCV_TP.jsx"),
    loading: () => loadingContent
});
const AdditionalDetailsPCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV-TP/AdditionalDetailsPCV_TP.jsx"),
    loading: () => loadingContent
});
const PremiumPCVTP = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../PCV-TP/PremiumPCV_TP.jsx"),
    loading: () => loadingContent
});
//================================ACD statement=======================================
const ACD =Loadable({
    loader: ()=> import("../common/ACD/ACD.jsx"),
    loading: ()=> loadingContent
})




class Routes extends Component {
    render() {
        this.props.onAuthPersist();
        return (
            <>
                <HashRouter>
                    <Switch>
                        <Route exact path="/login" component={LogIn} />
                        <Route exact path="/Intermediary_LogIn" component={Intermediary_LogIn} />
                        <Route exact path="/logout" component={Logout} />
                        <Route exact path="/Reset_Password" component={Reset_Password} />
                        <PrivateRoute exact path="/Error" component={Error} />

                        <PrivateRoute exact path="/Products" component={Products} />

                        <PrivateRoute exact path="/Health/:productId" component={Health} />
                        <PrivateRoute exact path="/MedicalDetails/:productId" component={MedicalDetails} />
                        <PrivateRoute exact path="/SelectDuration/:productId" component={SelectDuration} />
                        <PrivateRoute exact path="/Address/:productId" component={Address} />
                        <PrivateRoute exact path="/NomineeDetails/:productId" component={NomineeDetails} />
                        <PrivateRoute exact path="/PolicyDetails/:productId" component={PolicyDetails} />
                        {/* <PrivateRoute exact path="/PolicySummery/:productId" component={PolicySummery} /> */}
                        <PrivateRoute exact path="/ThankYou/:policyId" component={ThankYou} />
                        <PrivateRoute exact path="/ThankYouCCM" component={ThankYouCCM} />

                        {/* ============================ Arogya Plus================================ */}

                        <PrivateRoute exact path="/Arogya_Plus/:productId" component={Health_Arogya} />
                        <PrivateRoute exact path="/MedicalDetails_Plus/:productId" component={MedicalDetails_Plus} />
                        <PrivateRoute exact path="/SelectDuration_Plus/:productId" component={SelectDuration_Plus} />
                        <PrivateRoute exact path="/Address_Plus/:productId" component={Address_Plus} />
                        <PrivateRoute exact path="/NomineeDetails_Plus/:productId" component={NomineeDetails_Plus} />
                        <PrivateRoute exact path="/PolicyDetails_Plus/:productId" component={PolicyDetails_Plus} />

                        {/* ============================ Arogya Sanjeevani Micro================================ */}

                        <PrivateRoute exact path="/Health_Micro/:productId" component={Health_Micro} />
                        <PrivateRoute exact path="/MedicalDetails_Micro/:productId" component={MedicalDetails_Micro} />
                        <PrivateRoute exact path="/SelectDuration_Micro/:productId" component={SelectDuration_Micro} />
                        <PrivateRoute exact path="/Address_Micro/:productId" component={Address_Micro} />
                        <PrivateRoute exact path="/NomineeDetails_Micro/:productId" component={NomineeDetails_Micro} />
                        <PrivateRoute exact path="/PolicyDetails_Micro/:productId" component={PolicyDetails_Micro} />

                        {/* ============================ Arogya Sanjeevani Micro Group ================================ */}

                        <PrivateRoute exact path="/Health_Group/:productId" component={Health_Group} />
                        <PrivateRoute exact path="/MedicalDetails_Group/:productId" component={MedicalDetails_Group} />
                        <PrivateRoute exact path="/SelectDuration_Group/:productId" component={SelectDuration_Group} />
                        <PrivateRoute exact path="/Address_Group/:productId" component={Address_Group} />
                        <PrivateRoute exact path="/NomineeDetails_Group/:productId" component={NomineeDetails_Group} />
                        <PrivateRoute exact path="/PolicyDetails_Group/:productId" component={PolicyDetails_Group} />


                        {/* ======================================== M4W Comprehensive ===================================================== */}

                        <PrivateRoute exact path="/Registration/:productId" component={Registration} />
                        <PrivateRoute exact path="/Select-brand/:productId" component={SelectBrand} />
                        <PrivateRoute exact path="/VehicleDetails/:productId" component={VehicleDetails} />
                        <PrivateRoute exact path="/OtherComprehensive/:productId" component={OtherComprehensive} />
                        <PrivateRoute exact path="/Additional_details/:productId" component={AdditionalDetails} />
                        <PrivateRoute exact path="/Premium/:productId" component={Premium} />
                        {/* <PrivateRoute exact path="/ThankYou_motor/:policyId" component={ThankYou_motor} /> */}

                        {/* ********************** LandingPage ***************  */}
                        <PrivateRoute exact path="/Dashboard" component={Dashboard} />

                        {/* ******************* Individual Personal Accident ************* */}
                        <PrivateRoute exact path="/AccidentSelectPlan/:productId" component={AccidentSelectPlan} />
                        <PrivateRoute exact path="/AccidentAddDetails/:productId" component={AccidentAddDetails} />
                        <PrivateRoute exact path="/AccidentAdditionalDetails/:productId" component={AccidentAdditionalDetails} />
                        <PrivateRoute exact path="/AccidentAdditionalPremium/:productId" component={IPA_Premium} />

                        {/* ******************* Individual Personal Accident Micro ************* */}
                        <PrivateRoute exact path="/AccidentSelectPlan_Micro/:productId" component={AccidentSelectPlan_Micro} />
                        <PrivateRoute exact path="/AccidentAddDetails_Micro/:productId" component={AccidentAddDetails_Micro} />
                        <PrivateRoute exact path="/AccidentAdditionalDetails_Micro/:productId" component={AccidentAdditionalDetails_Micro} />
                        <PrivateRoute exact path="/AccidentAdditionalPremium_Micro/:productId" component={IPA_Premium_Micro} />

                        {/* ******************* Individual Personal Accident Micro Group ************* */}
                        <PrivateRoute exact path="/AccidentSelectPlan_Micro_Group/:productId" component={AccidentSelectPlan_Micro_Group} />

                        {/* ********************* AROGYA TOPUP ***************** */}

                        <PrivateRoute exact path="/arogya_Health/:productId" component={arogya_Health} />
                        <PrivateRoute exact path="/arogya_MedicalDetails/:productId" component={arogya_MedicalDetails} />
                        <PrivateRoute exact path="/arogya_SelectDuration/:productId" component={arogya_SelectDuration} />
                        <PrivateRoute exact path="/arogya_Address/:productId" component={arogya_Address} />
                        <PrivateRoute exact path="/arogya_NomineeDetails/:productId" component={arogya_NomineeDetails} />
                        <PrivateRoute exact path="/arogya_PolicyDetails/:productId" component={arogya_PolicyDetails} />

                        {/* ********************* Hospital Daily Cash ***************** */}

                        <PrivateRoute exact path="/dailycash_Health/:productId" component={dailycash_Health} />
                        <PrivateRoute exact path="/dailycash_MedicalDetails/:productId" component={dailycash_MedicalDetails} />
                        <PrivateRoute exact path="/dailycash_FullQuote/:productId" component={dailycash_FullQuote} />
                        <PrivateRoute exact path="/dailycash_Address/:productId" component={dailycash_Address} />
                        <PrivateRoute exact path="/dailycash_NomineeDetails/:productId" component={dailycash_NomineeDetails} />
                        <PrivateRoute exact path="/dailycash_PolicyDetails/:productId" component={dailycash_PolicyDetails} />


                        

                        {/************ TwoWheeler ******************/}
                        {/* <PrivateRoute exact path="/two_wheeler_Registration/:productId" component={TwoWheelerRegistration} />  */}
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

                        {/************ TwoWheelerOD ******************/}
                        {/* <PrivateRoute exact path="/two_wheeler_Registration/:productId" component={TwoWheelerRegistration} />  */}
                        <PrivateRoute exact path="/two_wheeler_Select-brandOD/:productId" component={TwoWheelerSelectBrandOD} />
                        <PrivateRoute exact path="/two_wheeler_Vehicle_detailsOD/:productId" component={TwoWheelerVehicleDetailsOD} />
                        <PrivateRoute exact path="/two_wheeler_OtherComprehensiveOD/:productId" component={TwoWheelerOtherComprehensiveOD} />
                        <PrivateRoute exact path="/two_wheeler_additional_detailsOD/:productId" component={TwoWheelerAdditionalDetailsOD} />
                        <PrivateRoute exact path="/two_wheeler_policy_premium_detailsOD/:productId" component={TwoWheelerPolicyPremiumDetailsOD} />

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

                        {/************ MotorGCV Short Term******************/}
                        <PrivateRoute exact path="/Registration_GCVST/:productId" component={RegistrationGCVST} />
                        <PrivateRoute exact path="/SelectBrand_GCVST/:productId" component={SelectBrandGCVST} />
                        <PrivateRoute exact path="/VehicleDetails_GCVST/:productId" component={VehicleDetailsGCVST} />
                        <PrivateRoute exact path="/OtherComprehensive_GCVST/:productId" component={OtherComprehensiveGCVST} />
                        <PrivateRoute exact path="/AdditionalDetails_GCVST/:productId" component={AdditionalDetailsGCVST} />
                        <PrivateRoute exact path="/Premium_GCVST/:productId" component={PremiumGCVST} />

                        {/************ MotorGCV - TP ******************/}
                        <PrivateRoute exact path="/Registration_GCV_TP/:productId" component={RegistrationGCVTP} />
                        <PrivateRoute exact path="/SelectBrand_GCV_TP/:productId" component={SelectBrandGCVTP} />
                        <PrivateRoute exact path="/VehicleDetails_GCV_TP/:productId" component={VehicleDetailsGCVTP} />
                        <PrivateRoute exact path="/OtherComprehensive_GCV_TP/:productId" component={OtherComprehensiveGCVTP} />
                        <PrivateRoute exact path="/AdditionalDetails_GCV_TP/:productId" component={AdditionalDetailsGCVTP} />
                        <PrivateRoute exact path="/Premium_GCV_TP/:productId" component={PremiumGCVTP} />

                        {/************ SME - Fire ******************/}
                        {/* <PrivateRoute exact path="/Registration_SME/:productId" component={RegistrationSME} />
                        <PrivateRoute exact path="/RiskDetails/:productId" component={RiskDetails} />
                        <PrivateRoute exact path="/OtherDetails/:productId" component={OtherDetails} />
                        <PrivateRoute exact path="/AdditionalDetails_SME/:productId" component={AdditionalDetailsSME} />
                        <PrivateRoute exact path="/Summary_SME/:productId" component={SummarySME} />  
                        <PrivateRoute exact path="/Premium_SME/:productId" component={PremiumSME} />   */}

                        {/************ Sookshma - Fire ******************/}
                        <PrivateRoute exact path="/Registration_Sookshma/:productId" component={RegistrationSukhsam} />
                        <PrivateRoute exact path="/RiskDetails_Sookshma/:productId" component={RiskDetailsSukhsam} />
                        <PrivateRoute exact path="/OtherDetails_Sookshma/:productId" component={OtherDetailsSukhsam} />
                        <PrivateRoute exact path="/AdditionalDetails_Sookshma/:productId" component={AdditionalDetailsSukhsam} />
                        <PrivateRoute exact path="/Summary_Sookshma/:productId" component={SummarySukhsam} />
                        <PrivateRoute exact path="/Premium_Sookshma/:productId" component={PremiumSukhsam} />

                        {/************ Support ******************/}
                        <PrivateRoute exact path="/Documents" component={Documents} />
                        <PrivateRoute exact path="/Supports" component={Supports} />
                        <PrivateRoute exact path="/TicketCount" component={TicketCount} />

                        {/************ BREAK IN ******************/}
                        <PrivateRoute exact path="/Break_in" component={Break_in} />
                        <PrivateRoute exact path="/Break_form" component={Break_form} />

                        {/************ Dashboard ******************/}
                        <PrivateRoute exact path="/PolicySearch" component={PolicySearch} />
                        <PrivateRoute exact path="/QuoteHistory" component={QuoteSearch} />

                        {/************ Agent Cash Deposit ******************/}
                        <PrivateRoute exact path="/AgentCashDeposit" component={AgentCashDeposit} />

                        {/************ Services ******************/}
                        <PrivateRoute exact path="/Services" component={Services} />

                        {/************ Motor MISC-D ******************/}
                        <PrivateRoute exact path="/Registration_MISCD/:productId" component={RegistrationMISCD} />
                        <PrivateRoute exact path="/SelectBrand_MISCD/:productId" component={SelectBrandMISCD} />
                        <PrivateRoute exact path="/VehicleDetails_MISCD/:productId" component={VehicleDetailsMISCD} />
                        <PrivateRoute exact path="/OtherComprehensive_MISCD/:productId" component={OtherComprehensiveMISCD} />
                        <PrivateRoute exact path="/AdditionalDetails_MISCD/:productId" component={AdditionalDetailsMISCD} />
                        <PrivateRoute exact path="/Premium_MISCD/:productId" component={PremiumMISCD} />

                        {/************ Motor MISC-D Short Term******************/}
                        <PrivateRoute exact path="/Registration_MISCDST/:productId" component={RegistrationMISCDST} />
                        <PrivateRoute exact path="/SelectBrand_MISCDST/:productId" component={SelectBrandMISCDST} />
                        <PrivateRoute exact path="/VehicleDetails_MISCDST/:productId" component={VehicleDetailsMISCDST} />
                        <PrivateRoute exact path="/OtherComprehensive_MISCDST/:productId" component={OtherComprehensiveMISCDST} />
                        <PrivateRoute exact path="/AdditionalDetails_MISCDST/:productId" component={AdditionalDetailsMISCDST} />
                        <PrivateRoute exact path="/Premium_MISCDST/:productId" component={PremiumMISCDST} />

                        {/************ Motor PCV ******************/}
                        <PrivateRoute exact path="/Registration_PCV/:productId" component={RegistrationPCV} />
                        <PrivateRoute exact path="/SelectBrand_PCV/:productId" component={SelectBrandPCV} />
                        <PrivateRoute exact path="/VehicleDetails_PCV/:productId" component={VehicleDetailsPCV} />
                        <PrivateRoute exact path="/OtherComprehensive_PCV/:productId" component={OtherComprehensivePCV} />
                        <PrivateRoute exact path="/AdditionalDetails_PCV/:productId" component={AdditionalDetailsPCV} />
                        <PrivateRoute exact path="/Premium_PCV/:productId" component={PremiumPCV} />

                        {/************ KSB-Retail ******************/}
                        <PrivateRoute exact path="/Health_KSB/:productId" component={Health_KSB} />
                        <PrivateRoute exact path="/PreExistingDisease_KSB/:productId" component={PreExistingDisease_KSB} />
                        <PrivateRoute exact path="/SelectDuration_KSB/:productId" component={SelectDuration_KSB} />
                        <PrivateRoute exact path="/Address_KSB/:productId" component={Address_KSB} />
                        <PrivateRoute exact path="/NomineeDetails_KSB/:productId" component={NomineeDetails_KSB} />
                        <PrivateRoute exact path="/PolicyDetails_KSB/:productId" component={PolicyDetails_KSB} />

                        {/************ KSB-Retail Micro ******************/}
                        <PrivateRoute exact path="/Health_KSB_Micro/:productId" component={Health_KSB_Micro} />
                        <PrivateRoute exact path="/PreExistingDisease_KSB_Micro/:productId" component={PreExistingDisease_KSB_Micro} />
                        <PrivateRoute exact path="/SelectDuration_KSB_Micro/:productId" component={SelectDuration_KSB_Micro} />
                        <PrivateRoute exact path="/Address_KSB_Micro/:productId" component={Address_KSB_Micro} />
                        <PrivateRoute exact path="/NomineeDetails_KSB_Micro/:productId" component={NomineeDetails_KSB_Micro} />
                        <PrivateRoute exact path="/PolicyDetails_KSB_Micro/:productId" component={PolicyDetails_KSB_Micro} />

                        {/************ KSB-Retail Micro GROUP ******************/}
                        <PrivateRoute exact path="/Health_KSB_Micro_Group/:productId" component={Health_KSB_Micro_Group} />

                        {/************ GSB ******************/}
                        <PrivateRoute exact path="/SelectPlan_GSB/:productId" component={SelectPlan_GSB} />
                        <PrivateRoute exact path="/AdditionalDetails_GSB/:productId" component={AdditionalDetails_GSB} />
                        <PrivateRoute exact path="/PolicyDetails_GSB/:productId" component={PolicyDetails_GSB} />

                        {/************ Vedvag Payment Gateway ******************/}
                        <PrivateRoute exact path="/Vedvag_gateway/:productId" component={VedvagGateway} />

                        {/************ Sahipay Payment Gateway ******************/}
                        <PrivateRoute exact path="/Sahipay_gateway/:productId" component={SahipayGateway} />

                        {/************ Transcrop Payment Gateway ******************/}
                        <PrivateRoute exact path="/Transcrop_gateway/:productId" component={TranscropGateway} />

                        {/************ FIA Payment Gateway ******************/}
                        <PrivateRoute exact path="/Fia_gateway/:productId" component={FiaGateway} />

                        {/************ AISECT Payment Gateway ******************/}
                        <PrivateRoute exact path="/Aisect_gateway/:productId" component={AisectGateway} />


                        <PrivateRoute exact path="/UnderMaintenance" component={UnderMaintenance} />

                        {/************ Four-Wheeler OD ******************/}
                        <PrivateRoute exact path="/RegistrationOD/:productId" component={RegistrationOD} />
                        <PrivateRoute exact path="/Select-brandOD/:productId" component={SelectBrandOD} />
                        <PrivateRoute exact path="/VehicleDetailsOD/:productId" component={VehicleDetailsOD} />
                        <PrivateRoute exact path="/OtherComprehensiveOD/:productId" component={OtherComprehensiveOD} />
                        <PrivateRoute exact path="/Additional_detailsOD/:productId" component={AdditionalDetailsOD} />
                        <PrivateRoute exact path="/PremiumOD/:productId" component={PremiumOD} />
                        {/* <PrivateRoute exact path="/ThankYou_motor/:policyId" component={ThankYou_motor} /> */}

                        {/************ Claim Intimation ******************/}
                        <PrivateRoute exact path="/ClaimIntimation" component={ClaimIntimation} />
                        <PrivateRoute exact path="/ClaimStatus" component={ClaimStatus} />


                        {/************ Renewal ******************/}
                        <PrivateRoute exact path="/Renewal" component={Renewal} />
                        <PrivateRoute exact path="/MotorSummery" component={MotorSummery} />
                        <PrivateRoute exact path="/MotorCoverages" component={MotorCoverages} />
                        <PrivateRoute exact path="/HealthSummery" component={HealthSummery} />
                        <PrivateRoute exact path="/ThankYouRenewal" component={ThankYouRenewal} />

                        {/************ DIY Endorsement ******************/}
                        <PrivateRoute exact path="/NewEndorsement" component={NewEndorsement} />
                        <PrivateRoute exact path="/ViewEndorsement" component={ViewEndorsement} />

                        {/************ PCV - TP ******************/}
                        <PrivateRoute exact path="/Registration_PCV_TP/:productId" component={RegistrationPCVTP} />
                        <PrivateRoute exact path="/SelectBrand_PCV_TP/:productId" component={SelectBrandPCVTP} />
                        <PrivateRoute exact path="/VehicleDetails_PCV_TP/:productId" component={VehicleDetailsPCVTP} />
                        <PrivateRoute exact path="/OtherComprehensive_PCV_TP/:productId" component={OtherComprehensivePCVTP} />
                        <PrivateRoute exact path="/AdditionalDetails_PCV_TP/:productId" component={AdditionalDetailsPCVTP} />
                        <PrivateRoute exact path="/Premium_PCV_TP/:productId" component={PremiumPCVTP} />
                        {/*==================ACD Statement========================*/ }
                        <PrivateRoute exact path="/Acd" component={ACD}/>


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




