import { 
    SUKHSAM_FIRE,
    SUKHSAM_FIRE_RISK,
    SUKHSAM_FIRE_UPDATE,
    SUKHSAM_FIRE_OTHER_DETAILS,
    SUKHSAM_FIRE_PROPOSER_DETAILS,
    SUKHSAM_COMM_ADDRESS,
    SUKHSAM_TRANSACTION_ID
} from "../actions/actionTypes";

//add registration type
export const setSmeData = ( request ) => {
    return dispatch => {
        dispatch({
            type: SUKHSAM_FIRE,
            payload: {
                start_date:request.start_date,
                end_date:request.end_date,
		registration_type : request.registration_type,
                policy_holder_id:request.policy_holder_id,
                policy_holder_ref_no:request.policy_holder_ref_no,
                request_data_id:request.request_data_id,
                completed_step:request.completed_step,
                menumaster_id:request.menumaster_id,
                payment_link_status: request.payment_link_status
            }
        });
    }
}

//add registration type
export const setSmeUpdateData = ( request ) => {
    return dispatch => {
        dispatch({
            type: SUKHSAM_FIRE_UPDATE,
            payload: {
                start_date:request.start_date,
                end_date:request.end_date,
		registration_type : request.registration_type
            }
        });
    }
}


//Add policy type
export const setSmeRiskData = ( request ) => {
    return dispatch => {
        dispatch({
            type: SUKHSAM_FIRE_RISK,
            payload: {
                shop_building_name:request.shop_building_name,
                block_no:request.block_no,
                house_flat_no:request.house_flat_no,
                pincode:request.pincode,
                pincode_id:request.pincode_id,
                policy_type : request.policy_type,
                multipleAddress : request.multipleAddress,
                buildings_si:request.buildings_si,
                plant_machinary_si: request.plant_machinary_si,
                furniture_fixture_si: request.furniture_fixture_si,
                stock_raw_mat: request.stock_raw_mat,
                finish_goods: request.finish_goods,
                stock_wip: request.stock_wip,
                content_sum_insured: request.content_sum_insured,
                stock_sum_insured : request.stock_sum_insured,
		multiple_fire_sum_insured : request.multiple_fire_sum_insured
            }
        });
    }
}

export const setSmeOthersDetailsData = ( request ) => {
    return dispatch => {
        dispatch({
            type: SUKHSAM_FIRE_OTHER_DETAILS,
            payload: {
            Commercial_consideration:request.Commercial_consideration,
            previous_start_date:request.previous_start_date,
            previous_end_date:request.previous_end_date,
            Previous_Policy_No:request.Previous_Policy_No,
            insurance_company_id:request.insurance_company_id,
            address:request.address,
            financial_party: request.financial_party,
            is_claim: request.is_claim,
            previous_policy_check: request.previous_policy_check,
            financial_modgaged: request.financial_modgaged,
            financer_name: request.financer_name,
            }
        });
    }
}

export const setSmeProposerDetailsData = ( request ) => {
    return dispatch => {
        dispatch({
            type: SUKHSAM_FIRE_PROPOSER_DETAILS,
            payload: {
                first_name:request.first_name,
                last_name:request.last_name,
                salutation_id:request.salutation_id,
                date_of_birth:request.date_of_birth,
                email_id:request.email_id,
                mobile:request.mobile,
                gender:request.gender,
                gstn_no:request.gstn_no,
                pan_no:request.pan_no,
                com_street_name:request.com_street_name,
                com_plot_no:request.com_plot_no,
                com_building_name:request.com_building_name,
                com_pincode:request.com_pincode,
                com_pincode_id:request.com_pincode_id,
                com_block_no:request.com_block_no,
                com_house_flat_no:request.com_house_flat_no,
            }
        });
    }
}

export const setCommunicationAddress = ( request ) => {
    return dispatch => {
        dispatch({
            type: SUKHSAM_COMM_ADDRESS,
            payload: {
                // com_street_name:request.street_name,
                // com_plot_no:request.plot_no,
                // com_building_name:request.building_name,
                com_pincode:request.pincode,
                com_pincode_id:request.pincode_id,
                // com_block_no:request.block_no,
                // com_house_flat_no:request.house_flat_no,
            }
        });
    }
}

export const setTransactionId = ( request ) => {
    return dispatch => {
        dispatch({
            type: SUKHSAM_TRANSACTION_ID,
            payload: {
                receipt_no:request.receipt_no, 
                quoteNo: request.quoteNo
            }
        });
    }
}

