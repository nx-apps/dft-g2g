import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    dataUrl : [],
    cheque_list: [],
    cheque_detail_list: [],
}
export function chequeReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_CHEQUE_DETAIL_LIST':
            return Object.assign({}, state, { dataUrl: action.payload });
        case 'GET_CHEQUE_LIST':
            return Object.assign({}, state, { cheque_list: action.payload });
        case 'GET_CHEQUE_DETAIL_LIST':
            return Object.assign({}, state, { cheque_detail_list: action.payload });
        default:
            return state
    }
}
export function chequeAction(store) {
    return [commonAction(),
    {
        // SET
        SET_CHEQUE_DETAIL_LIST : function (data) {
            store.dispatch({ type: 'SET_CHEQUE_DETAIL_LIST', payload: data })
        },
        // END SET
        // GET
        GET_CHEQUE_LIST: function (contract_id) {
            axios.get('./cheque/contract?id='+contract_id)
                .then(function (response) {
                    // console.log(response.data);
                    response.data.map((item)=>{
                        item.check =  false,
                        item.status =  false
                    })
                    store.dispatch({ type: 'GET_CHEQUE_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        GET_CHEQUE_DETAIL_LIST: function (fee) {
            axios.post('./cheque/fee',fee)
                .then(function (response) {
                    response.data.map((item)=>{
                        item.check =  false
                        if (item.cheque_status !== true) {
                            item.cheque_status =false

                        }
                        if (item.invoice_company_no === undefined) {
                            item.invoice_company_no =''
                        }
                    })
                    store.dispatch({ type: 'GET_CHEQUE_DETAIL_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        // END GET
        // PUT
        PUT_CHEQUE_DETAIL_LIST: function (fee) {
            return axios.put('./cheque/update',fee)
        },
        // PUT
    }
    ]
}