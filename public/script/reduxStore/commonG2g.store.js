import axios from '../axios'
import { commonAction } from '../config'
import groupArray from '../../../node_modules/group-array'
// var groupArray = require('group-array');
const initialState = {
    bankList: [],
    buyerList: [],
    hamonizeList: [],
    hamonizeListNoGroup:[],
    hamonizeYear: {},
    carrierList: [],
    incotermsList: [],
    notifyList: [],
    packageList: [],
    portList: [],
    shipList: [],
    shiplineList: [],
    surveyorList: [],
    exporterList: []
}
export function commonG2gReducer(state = initialState, action) {
    switch (action.type) {
        case 'GET_COMMON_BANK_LIST':
            return Object.assign({}, state, { bankList: action.payload });
        case 'GET_COMMON_BUYER_LIST':
            return Object.assign({}, state, { buyerList: action.payload });
        case 'GET_COMMON_HAMONIZE_LIST':
            return Object.assign({}, state, { hamonizeList: action.payload });
        case 'GET_COMMON_HAMONIZE_LIST_NO_GROUP':
            return Object.assign({}, state, { hamonizeListNoGroup: action.payload});
        case 'GET_COMMON_HAMONIZE_YEAR':
            return Object.assign({}, state, { hamonizeYear: action.payload });
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
        case 'GET_COMMON_EXPORTER_LIST':
            return Object.assign({}, state, { exporterList: action.payload });
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
                    // console.log(response);
                    // console.log(1);
                    store.dispatch({ type: 'GET_COMMON_BANK_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_BUYER_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/buyer')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_BUYER_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_HAMONIZE_LIST: function (data) {
            axios.get(window._config.externalServerCommon + '/api/groupItem?group_id=1a324474-0940-4aa9-b4fd-0b98b9e4ce5c')
                .then(function (response) {
                    // console.log(response.data);
                    var hamonizeList = response.data.reduce(function (prev, curr) {
                        return [...prev, ...curr.sub];
                    },[]);
                    for (var index = 0; index < hamonizeList.length; index++) {
                        // response.data[index].label = ''
                        hamonizeList[index].label = '[' + hamonizeList[index].hamonize_code + '] ' + hamonizeList[index].hamonize_th
                        // console.log(response.data[index].hamonize.hamonize_en );
                    }
                    let lisyYear = []
                    let groupYear = groupArray(hamonizeList, 'hamonize_year')
                    for (var variable in groupYear) {
                        if (groupYear.hasOwnProperty(variable)) {
                            lisyYear.push({label:variable,value:variable})
                        }
                    }
                    let xData =  { year :lisyYear ,hamonize:hamonizeList}
                    
                    store.dispatch({ type: 'GET_COMMON_HAMONIZE_YEAR', payload: xData })
                    store.dispatch({ type: 'GET_COMMON_HAMONIZE_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_HAMONIZE_LIST_NO_GROUP: function () {
            axios.get(window._config.externalServerCommon + '/api/hamonize')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_HAMONIZE_LIST_NO_GROUP', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_CARRIER_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/carrier')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_CARRIER_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_INCOTERMS_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/incoterms')
                .then(function (response) {


                    store.dispatch({ type: 'GET_COMMON_INCOTERMS_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_NOTIFY_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/notify_party')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_NOTIFY_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_PACKAGE_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/package')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_PACKAGE_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_PORT_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/port')
                .then(function (response) {
                    let group = groupArray(response.data, 'country_name_en')
                    store.dispatch({ type: 'GET_COMMON_PORT_LIST', payload: group })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_SHIP_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/ship')
                .then(function (response) {
                    for (var index = 0; index < response.data.length; index++) {
                        response.data[index].text = response.data[index].ship_name
                        response.data[index].value = response.data[index].ship_name

                    }
                    store.dispatch({ type: 'GET_COMMON_SHIP_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_SHIPLINE_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/shipline')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_SHIPLINE_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_SURVEYOR_LIST: function () {
            axios.get(window._config.externalServerCommon + '/api/surveyor')
                .then(function (response) {
                    store.dispatch({ type: 'GET_COMMON_SURVEYOR_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
        GET_COMMON_EXPORTER_LIST: function () {
            axios.get(window._config.externalServer + '/api/external/exporter/search?type_lic_id=NORMAL')
                .then(function (response) {
                    for (var index = 0; index < response.data.length; index++) {
                        response.data[index].label = '[' + response.data[index].company_taxno + '] ' + response.data[index].company.company_name_th
                    }
                    // console.log(response.data);
                    store.dispatch({ type: 'GET_COMMON_EXPORTER_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log('error');
                    //console.log(error);
                });
        },
    }
    ]
}