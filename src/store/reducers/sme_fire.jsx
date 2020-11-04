import { 
    SME_FIRE,
    // SME_FIRE_2
} from "../actions/actionTypes";

const initialState = {
    sme_data: {
        start_date:null,
        end_date:null    
    }
}

const sme = ( state = initialState, action) => {
    switch( action.type ) {
        case SME_FIRE: return {...state, sme_data: action.payload}
        // case SME_FIRE_2: return {...state, sme_data: action.payload}
        default: return state;
    }
}

export default sme;