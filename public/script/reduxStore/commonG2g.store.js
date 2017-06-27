import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    bankList: [],
    buyerList: [],
    hamonizeList: [],
    carrierList: [],
    incotermsList: [],
    notifyList: [],
    packageList: [],
    portList: [],
    shipList: [],
    shiplineList: [],
    surveyorList: [],

}
export function commonG2gReducer(state = initialState, action) {
    switch (action.type) {
        case 'GET_COMMON_BANK_LIST':
            return Object.assign({}, state, { bankList: action.payload });
        case 'GET_COMMON_BUYER_LIST':
            return Object.assign({}, state, { buyerList: action.payload });
        case 'GET_COMMON_HAMONIZE_LIST':
            return Object.assign({}, state, { hamonizeList: action.payload });
        case 'GET_COMMON_CARRIER_LIST':
            return Object.assign({}, state, { carrierList: action.payload });
        case 'GET_COMMON_INCOTERMS_LIST':
            return Object.assign({}, state, { incotermsList: action.payload });
        case 'GET_COMMON_NOTIFY_LIST':
            return Object.assign({}, state, { notifyList: action.payload });
        case 'GET_COMMON_PACKAGE_LIST':
            return Object.assign({}, state, { packageList: action.payload });
        case 'GET_COMMON_PORT_LIST':
            return Object.assign({}, state, { portList: action.payload });
        case 'GET_COMMON_SHIP_LIST':
            return Object.assign({}, state, { shipList: action.payload });
        case 'GET_COMMON_SHIPLINE_LIST':
            return Object.assign({}, state, { shiplineList: action.payload });
        case 'GET_COMMON_SURVEYOR_LIST':
            return Object.assign({}, state, { surveyorList: action.payload });
        default:
            return state
    }
}
export function commonG2gAction(store) {
    return [commonAction(),
    {

        GET_COMMON_BANK_LIST: function () {
            // console.log(window._config.externalServerCommon);
            axios.get(window._config.externalServerCommon + '/api/bank')
                .then(function (response) {
                    console.log(response);
                    console.log(1);
                    store.dispatch({ type: 'GET_COMMON_BANK_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        GET_COMMON_BUYER_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/buyer')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_BUYER_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        GET_COMMON_HAMONIZE_LIST: function (data) {
            axios.get(window._config.externalServerCommon + '/api/groupItem?group_id=9c5514af-407f-4a07-b2c9-8e97f951dd16')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_HAMONIZE_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        GET_COMMON_CARRIER_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/carrier')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_CARRIER_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        GET_COMMON_INCOTERMS_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/incoterms')
                .then(function (response) {


                    store.dispatch({ type: 'GET_COMMON_INCOTERMS_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        GET_COMMON_NOTIFY_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/notify_party')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_NOTIFY_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        GET_COMMON_PACKAGE_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/package')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_PACKAGE_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        GET_COMMON_PORT_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/port')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_PORT_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        GET_COMMON_SHIP_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/ship')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_SHIP_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        GET_COMMON_SHIPLINE_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/shipline')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_SHIPLINE_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
        GET_COMMON_SURVEYOR_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/surveyor')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_SURVEYOR_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log('error');
                    console.log(error);
                });
        },
    }
    ]
}