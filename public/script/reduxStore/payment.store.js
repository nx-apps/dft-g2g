import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    listPayment: [],
    payRunning:{},
    paymentDetail: [],
    dataSetPayment: {},
    siloDetail: []
}
export function paymentReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_DATE_PAYMENY':
            return Object.assign({}, state, { dataSetPayment: action.payload });
        case 'PAYMENT_GET_RUNNING_NO':
            return Object.assign({}, state, { payRunning: action.payload });
        case 'PAYMENT_GET_LIST_DATA':
            return Object.assign({}, state, { listPayment: action.payload });
        case 'PAYMENT_GET_DETAIL_DATA':
            return Object.assign({}, state, { paymentDetail: action.payload });
        case 'PAYMENT_GET_SILO_DATA':
            return Object.assign({}, state, { siloDetail: action.payload });
        default:
            return state
    }
}
export function paymentAction(store) {
    return [commonAction(),
    {
        // SET DATA
        SET_DATE_PAYMENY: function () {
            let set = {
                pay_value_b: 0,
                pay_running:0,
                bank_id: 'KTB',
                bank: {},
                pay_status: true,
                pay_remark :'',
                bank_branch: 'กระทรวงพาณิชย์',
                paid_date: new Date().toISOString().split('T')[0]
            }
            // console.log(set);
            store.dispatch({ type: 'SET_DATE_PAYMENY', payload: set })
        },
        // END SET DATA
        // GET DATA
        
        PAYMENT_GET_RUNNING_NO: function () {
            axios.get('./payment/running')
                .then((response) => {
                    // response.data.map((val) => {
                    //     return val.check = false
                    // })
                    store.dispatch({ type: 'PAYMENT_GET_RUNNING_NO', payload: response.data })
                })
        },
        PAYMENT_GET_LIST_DATA: function (id) {
            axios.get('./payment/contract?id=' + id)
                .then((response) => {
                    // response.data.map((val) => {
                    //     return val.check = false
                    // })
                    store.dispatch({ type: 'PAYMENT_GET_LIST_DATA', payload: response.data })
                })
        },
        PAYMENT_GET_DETAIL_DATA: function (contractTaxno) {
            axios.get('./payment/company?' + contractTaxno)
                .then((response) => {
                    response.data.map((val) => {
                        if (val.pay_status !== true) {
                            val.pay_status = false
                        }
                        if (val.pay_running === undefined) {
                            val.pay_running = ''
                        }
                        val.check = false
                        return val
                    })
                    store.dispatch({ type: 'PAYMENT_GET_DETAIL_DATA', payload: response.data })
                })
        },
        PAYMENT_GET_SILO_DATA: function () {
            axios.get('./payment/silo')
                .then((response) => {
                    store.dispatch({ type: 'PAYMENT_GET_SILO_DATA', payload: response.data })
                })
        },
        // END DATA
        // PUT DATA
        PAYMENT_PUT_PAID: function (data) {
            return axios.put('./payment/update',data)
        },
        // END PUT DATA
    }
    ]
}