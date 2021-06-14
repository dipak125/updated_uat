import { 
    SUKHSAM_FIRE,
    SUKHSAM_FIRE_UPDATE,
    SUKHSAM_FIRE_RISK,
    SUKHSAM_FIRE_OTHER_DETAILS,
    SUKHSAM_FIRE_PROPOSER_DETAILS,
    SUKHSAM_COMM_ADDRESS,
    SUKHSAM_TRANSACTION_ID
} from "../actions/actionTypes";

const initialState = {
    
        policy_holder_id:null,
        policy_holder_ref_no:null,
        request_data_id:null,
        menumaster_id:null,
        completed_step:null,
        payment_link_status: null,
        paymentgateway: [],

        start_date:null,
        end_date:null,
        
        shop_building_name: null,
        house_building_name:null,
        block_no:null,
        house_flat_no:null,
        pincode:null,
        pincode_id:null,
        street_name:null,
        buildings_si:null,
        content_sum_insured:null,
        stock_sum_insured:null, 
        plant_machinary_si: null,
        furniture_fixture_si: null,
        stock_raw_mat: null,
        finish_goods: null,
        stock_wip: null,

        previous_start_date:null,
        previous_end_date:null,
        Previous_Policy_No:null,
        insurance_company_id:null,
        address:'',
        Commercial_consideration:null,
        financial_party: null,
        is_claim: null,
        previous_policy_check: null,
        financial_modgaged: null,
        financer_name: null,

        first_name:null,
        last_name:null,
        salutation_id:null,
        date_of_birth:null,
        email_id:null,
        mobile:null,
        gender:null,
        com_building_name:null,
        com_street_name:null,
        plot_no:null,
        pan_no:'',
        gstn_no:'',
        com_block_no:null,
        com_house_flat_no:null,
        com_pincode:null,
        com_pincode_id:null,
        receipt_no:null,
        quoteNo:null

    
}

const sukhsam = ( state = initialState, action) => {
    switch( action.type ) {
        case SUKHSAM_FIRE: return {...state, 
            start_date:action.payload.start_date,
            end_date:action.payload.end_date,
            policy_holder_id:action.payload.policy_holder_id,
            policy_holder_ref_no:action.payload.policy_holder_ref_no,
            request_data_id:action.payload.request_data_id,
            completed_step:action.payload.completed_step,
            menumaster_id:action.payload.menumaster_id,
            payment_link_status: action.payload.payment_link_status}

        case SUKHSAM_FIRE_UPDATE: return {...state, 
            start_date:action.payload.start_date,
            end_date:action.payload.end_date}

        case SUKHSAM_FIRE_RISK: return {...state, 
            shop_building_name:action.payload.shop_building_name,
            block_no:action.payload.block_no,
            house_flat_no:action.payload.house_flat_no,
            pincode:action.payload.pincode,
            pincode_id:action.payload.pincode_id,
            buildings_si:action.payload.buildings_si,
            plant_machinary_si: action.payload.plant_machinary_si,
            furniture_fixture_si: action.payload.furniture_fixture_si,
            stock_raw_mat: action.payload.stock_raw_mat,
            finish_goods: action.payload.finish_goods,
            stock_wip: action.payload.stock_wip,
            content_sum_insured: action.payload.content_sum_insured,
            stock_sum_insured : action.payload.stock_sum_insured      
        }
            
        case SUKHSAM_FIRE_OTHER_DETAILS: return {...state, 
            previous_start_date:action.payload.previous_start_date,
            previous_end_date:action.payload.previous_end_date,
            Previous_Policy_No:action.payload.Previous_Policy_No,
            insurance_company_id:action.payload.insurance_company_id,
            address:action.payload.address,
            Commercial_consideration:action.payload.Commercial_consideration,
            financial_party: action.payload.financial_party,
            is_claim: action.payload.is_claim,
            previous_policy_check: action.payload.previous_policy_check,
            financial_modgaged: action.payload.financial_modgaged,
            financer_name: action.payload.financer_name,
        }
            
        case SUKHSAM_FIRE_PROPOSER_DETAILS: return {...state, 
            first_name:action.payload.first_name,
            last_name:action.payload.last_name,
            salutation_id:action.payload.salutation_id,
            date_of_birth:action.payload.date_of_birth,
            email_id:action.payload.email_id,
            mobile:action.payload.mobile,
            gender:action.payload.gender,
            pan_no:action.payload.pan_no,
            gstn_no:action.payload.gstn_no,
            com_building_name:action.payload.com_building_name,
            com_pincode:action.payload.com_pincode,
            com_pincode_id:action.payload.com_pincode_id,
            com_block_no:action.payload.com_block_no,
            com_house_flat_no:action.payload.com_house_flat_no,
            com_street_name:action.payload.com_street_name,
            com_plot_no:action.payload.com_plot_no,
        }

        case SUKHSAM_COMM_ADDRESS: return {...state, 
            com_building_name:action.payload.com_building_name,
            com_pincode:action.payload.com_pincode,
            com_pincode_id:action.payload.com_pincode_id,
            com_block_no:action.payload.com_block_no,
            com_house_flat_no:action.payload.com_house_flat_no,
            com_street_name:action.payload.com_street_name,
            com_plot_no:action.payload.com_plot_no
        }

        case SUKHSAM_TRANSACTION_ID: return {...state, 
            receipt_no:action.payload.receipt_no,
            quoteNo: action.payload.quoteNo
        }

        default: return state;
    }
}

export default sukhsam;