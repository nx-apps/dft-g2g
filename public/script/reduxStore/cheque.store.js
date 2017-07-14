import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    dataUrl : [],
    cheque_list_fasle: [],
    cheque_list_true: [],
    cheque_detail_list: [],
    cheque_no:[]
}
export function chequeReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_CHEQUE_DETAIL_LIST':
            return Object.assign({}, state, { dataUrl: action.payload });
        case 'GET_CHEQUE_LIST_FALSE':
            return Object.assign({}, state, { cheque_list_fasle: action.payload });
        case 'GET_CHEQUE_LIST_TRUE':
            return Object.assign({}, state, { cheque_list_true: action.payload });
        case 'GET_CHEQUE_DETAIL_LIST':
            return Object.assign({}, state, { cheque_detail_list: action.payload });
        case 'GET_CHEQUE_NO':
            return Object.assign({}, state, { cheque_no: action.payload });
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
        GET_CHEQUE_LIST: function (contract_idStatus) {
            axios.get('./cheque/contract?'+contract_idStatus)
                .then(function (response) {
                    // console.log(contract_idStatus)
                    // console.log(response.data);
                    response.data.map((item)=>{
                        item.check =  false,
                        item.status =  false
                    })
                    console.log(contract_idStatus.search(String('true')));
                    if(contract_idStatus.search(String('true')) > -1){
                        console.log('รอเซ็น'+ response.data.length);
                        store.dispatch({ type: 'GET_CHEQUE_LIST_TRUE', payload: response.data })
                        // เซ็ตค่าว่าง
                        // store.dispatch({ type: 'GET_CHEQUE_LIST_FALSE', payload: [{cl_no:1}] })
                    }else {
                        store.dispatch({ type: 'GET_CHEQUE_LIST_FALSE', payload: response.data })
                        console.log('ยัง'+ response.data.length);
                        // เซ็ตค่าว่าง
                        // store.dispatch({ type: 'GET_CHEQUE_LIST_TRUE', payload: [{cl_no:1}] })
                    }
                    
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
                        if (item.invoice_company_date !== undefined){
                            item.invoice_company_date = item.invoice_company_date.split('T')[0]
                        }
                        if (item.cheque_status !== true) {
                            item.cheque_status =false
                        }
                        if (item.pay_no === undefined) {
                            item.pay_no =''
                        }
                    })
                    store.dispatch({ type: 'GET_CHEQUE_DETAIL_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        GET_CHEQUE_NO: function () {
            axios.get('./cheque/no')
                .then(function (response) {
                    store.dispatch({ type: 'GET_CHEQUE_NO', payload: response.data })
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