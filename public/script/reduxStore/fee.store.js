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
                let newData = {
                    rate_bank_b : 0,
                    rate_lt_b : 0,
                    book: response.data
                }
                if(typeof newData.fee_date !== 'undefined'){
                    var date = newData.fee_date.split('T')[0];
                    newData.fee_date = date;
                }else{
                    var dateNow = new Date().toISOString().split('T')[0];
                    newData.fee_date = dateNow;
                }
                // console.log(newData);
                store.dispatch({type:'FEE_CALC_DATA', payload : newData});
            })
            .catch((err) =>{
                console.log(err);
            })
        },
    }
    ]
}