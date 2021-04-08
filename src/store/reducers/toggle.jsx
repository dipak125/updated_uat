import { 
    TOGGLE
} from "../actions/actionTypes";


const initialState = {
    
    logo_toggle:true
}

const toggleStartStop = ( state, {data}) => {
    return {
        ...state,
        logo_toggle: data
    }
}

const Toggle = ( state = initialState, action) => {
    switch( action.type ) {
        case TOGGLE: return toggleStartStop( state, action);
        default: return state;
    }
}


export default Toggle;