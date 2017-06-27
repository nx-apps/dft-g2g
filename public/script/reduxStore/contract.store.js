import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    buyerList: [],
    contractList: []
}
export function contractReducer(state = initialState, action) {
    switch (action.type) {
        case 'GET_BUYER_LIST':
            return Object.assign({}, state, { buyerList: action.payload });
        case 'GET_CONTRACT_OF_BUYER':
            return Object.assign({}, state, { contractList: action.payload });
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
        GET_CONTRACT_OF_BUYER: function (buyerId,) {
            axios.get('./contract/buyer?id='+buyerId)
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
        // END GET
    }
    ]
}