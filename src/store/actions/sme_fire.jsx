import { 
    SME_FIRE,
    // SME_FIRE_2
} from "../actions/actionTypes";


export const setSmeData = ( request ) => {
    return dispatch => {
        dispatch({
            type: SME_FIRE,
            payload: {start_date:request.start_date,end_date:request.end_date}
        });
    }
}

// export const setSmeData = ( request ) => {
//     return dispatch => {
//         dispatch({
//             type: SME_FIRE_2,
//             payload: {start_date:request.start_date,end_date:request.end_date}
//         });
//     }
// }