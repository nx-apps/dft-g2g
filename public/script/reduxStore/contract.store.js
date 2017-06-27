import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    buyerList: []
}
export function contractReducer(state = initialState, action) {
    switch (action.type) {
        case 'GET_BUYER_LIST':
            return Object.assign({}, state, { buyerList: action.payload });
        default:
            return state
    }
}
export function contractAction(store) {
    return [commonAction(),
    {
        GET_BUYER_LIST: function (ref, com) {
            axios.get('./contract/list')
                .then(function (response) {
                    console.log(response.data);
                    store.dispatch({ type: 'GET_BUYER_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
            console.log(window._config);
            // https://localhost:3001/api/contract/list
            // return axios.get('/external/upload/list/' + ref + '/' + com)
        },
    }
    ]
}