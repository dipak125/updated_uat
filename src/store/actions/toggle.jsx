import { 
    TOGGLE
} from "../actions/actionTypes";


export const logoToggle = (data) => {
    return {
        type: TOGGLE,
        data
    }
}