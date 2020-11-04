import { 
    SME_FIRE,
    SME_FIRE_RISK,
    SME_FIRE_UPDATE,
    SME_FIRE_OTHER_DETAILS,
    SME_FIRE_PROPOSER_DETAILS
} from "../actions/actionTypes";


export const setSmeData = ( request ) => {
    return dispatch => {
        dispatch({
            type: SME_FIRE,
            payload: {
                start_date:request.start_date,
                end_date:request.end_date,
                policy_holder_id:request.policy_holder_id,
                policy_holder_ref_no:request.policy_holder_ref_no,
                request_data_id:request.request_data_id,
                completed_step:request.completed_step,
                menumaster_id:request.menumaster_id
            }
        });
    }
}

export const setSmeUpdateData = ( request ) => {
    return dispatch => {
        dispatch({
            type: SME_FIRE_UPDATE,
            payload: {
                start_date:request.start_date,
                end_date:request.end_date
            }
        });
    }
}



export const setSmeRiskData = ( request ) => {
    return dispatch => {
        dispatch({
            type: SME_FIRE_RISK,
            payload: {
                house_building_name:request.house_building_name,
                block_no:request.block_no,
                street_name:request.street_name,
                content_sum_insured:request.content_sum_insured,
                house_flat_no:request.house_flat_no,
                pincode:request.pincode,
                pincode_id:request.pincode_id,
                buildings_sum_insured:request.buildings_sum_insured,
                content_sum_insured:request.content_sum_insured,
                stock_sum_insured:request.stock_sum_insured
            }
        });
    }
}

export const setSmeOthersDetailsData = ( request ) => {
    return dispatch => {
        dispatch({
            type: SME_FIRE_OTHER_DETAILS,
            payload: {
            previous_start_date:request.previous_start_date,
            previous_end_date:request.previous_end_date,
            Previous_Policy_No:request.Previous_Policy_No,
            insurance_company_id:request.insurance_company_id,
            previous_city:request.previous_city
            }
        });
    }
}

export const setSmeProposerDetailsData = ( request ) => {
    return dispatch => {
        dispatch({
            type: SME_FIRE_PROPOSER_DETAILS,
            payload: {
                first_name:request.first_name,
                last_name:request.last_name,
                salutation_id:request.salutation_id,
                date_of_birth:request.date_of_birth,
                email_id:request.email_id,
                mobile:request.mobile,
                gender:request.gender,
                pan_no:request.pan_no,
                gstn_no:request.gstn_no,
                com_street_name:request.com_street_name,
                plot_no:request.plot_no,
                com_building_name:request.com_building_name,
                com_pincode:request.com_pincode,
                com_pincode_id:request.com_pincode_id,
                com_block_no:request.com_block_no,
                com_house_flat_no:request.com_house_flat_no,
            }
        });
    }
}