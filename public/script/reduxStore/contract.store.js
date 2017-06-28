import axios from '../axios'
import { commonAction } from '../config'
const cutDataInObject = (data, namePop) => {
    // console.log(data);
    for (var key in data) {
        for (var index = 0; index < namePop.length; index++) {
            if (namePop[index] === key) {
                let time = new Date(data[key])
                // console.log(data[key]);
                data[key] = new Date(time.setHours(time.getHours() + 7)).toISOString()
                data[key] = data[key].split("T")[0]
                // console.log(data[key]);
            }
        }
    }
}
const initialState = {
    buyerList: [],
    contractList: [],
    contractDetail: {}
}
export function contractReducer(state = initialState, action) {
    switch (action.type) {
        case 'GET_BUYER_LIST':
            return Object.assign({}, state, { buyerList: action.payload });
        case 'GET_CONTRACT_OF_BUYER':
            return Object.assign({}, state, { contractList: action.payload });
        case 'GET_CONTRACT':
            return Object.assign({}, state, { contractDetail: action.payload });
        default:
            return state
    }
}
export function contractAction(store) {
    return [commonAction(),
    {
        // GET
        GET_BUYER_LIST: function () {
            axios.get('./contract/list')
                .then(function (response) {
                    // console.log(response.data);
                    store.dispatch({ type: 'GET_BUYER_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
            // console.log(window._config.externalServerCommon);
            // https://localhost:3001/api/contract/list
        },
        // https://localhost:3001/api/contract/buyer?id=44e7a3ae-a7cf-44e3-a9fe-ff8c7a3421cf
        GET_CONTRACT_OF_BUYER: function (buyerId, ) {
            axios.get('./contract/buyer?id=' + buyerId)
                .then(function (response) {
                    // console.log(response);
                    store.dispatch({ type: 'GET_CONTRACT_OF_BUYER', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
            // console.log(window._config.externalServerCommon);
            // https://localhost:3001/api/contract/list
        },
        GET_CONTRACT: function (contractId, ) {
            axios.get('./contract?id=' + contractId)
                .then(function (response) {
                    // console.log(response);
                    store.dispatch({ 
                        type: 'GET_CONTRACT',
                        payload: cutDataInObject(response.data, ['date_created', 'date_updated', 'contract_date'])
                    })
                })
                .catch(function (error) {
                    console.log(error);
                });
            // console.log(window._config.externalServerCommon);
            // https://localhost:3001/api/contract/list
        },
        // END GET
        POST_CONTRACT: function (data) {
            return axios.post('./contract/insert', data)
            // https://localhost:3001/api/contract/list
        },
        // CLEAR
        CLEAR_CONTRACT: function (contractId, ) {
            let data = { contract_status: false, contract_weight: 0, contract_hamonize: [] }
            store.dispatch({ type: 'GET_CONTRACT', payload: data })
        },
        // CLEAR

    }
    ]
}