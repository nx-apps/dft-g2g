import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list_calc: []
}
export function feeReducer(state = initialState, action) {
    switch (action.type) {
        case 'FEE_CALC_DATA':
            return Object.assign({}, state, { list_calc: action.payload });
        default:
            return state
    }
}
export function feeAction(store) {
    return [commonAction(),
    {
        FEE_CALC_DATA: function (data) {
            axios.get('./fee/calc?book_id='+data)
            .then((response) => {
                store.dispatch({type:'FEE_CALC_DATA', payload : response.data});
            })
            .catch((err) =>{
                console.log(err);
            })
            // return axios.get('/external/upload/list/' + ref + '/' + com)
        },
    }
    ]
}