import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    listPayment: [],
    paymentDetail:[],
    dataSetPayment:{},
}
export function paymentReducer(state = initialState, action) {
    switch (action.type) {
        case 'PAYMENT_GET_LIST_DATA':
            return Object.assign({}, state, { listPayment: action.payload });
        case 'PAYMENT_GET_DETAIL_DATA':
            return Object.assign({}, state, { paymentDetail: action.payload });
        case 'SET_DATE_PAYMENY':
            return Object.assign({}, state, { dataSetPayment: action.payload });
        default:
            return state
    }
}
export function paymentAction(store) {
    return [commonAction(),
    {
        PAYMENT_GET_LIST_DATA: function (id) {
            axios.get('./payment/contract?id='+id)
            .then((response) => {
                // response.data.map((val) => {
                //     return val.check = false
                // })
                store.dispatch({type: 'PAYMENT_GET_LIST_DATA', payload: response.data})
            })
        },
        PAYMENT_GET_DETAIL_DATA: function (contractTaxno) {
            axios.get('./payment/company?'+contractTaxno)
            .then((response) => {
                // response.data.map((val) => {
                //     return val.check = false
                // })
                store.dispatch({type: 'PAYMENT_GET_DETAIL_DATA', payload: response.data})
            })
        },
        SET_DATE_PAYMENY: function (){
            let set = {
                pay_value_b:0,
                bank_id:'KTB',
                bank:{},
                pay_status:true,
                bank_branch:'กระทรวงพาณิชย์',
                paid_date: new Date().toISOString().split('T')[0]
            }
            console.log(set);
            store.dispatch({type: 'SET_DATE_PAYMENY', payload: set})
        }
    }
    ]
}