import axios from '../axios'
import { commonAction } from '../config'
const cutDataInObject = (data, namePop) => {
    data = JSON.parse(JSON.stringify(data))
    for (var key in data) {
        for (var index = 0; index < namePop.length; index++) {
            if (namePop[index] === key) {
                let time = new Date(data[key])
                data[key] = new Date(time.setHours(time.getHours() + 7)).toISOString()
                data[key] = data[key].split("T")[0]
            }
        }
    }
    return data
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
        },
        GET_CONTRACT_OF_BUYER: function (buyerId, ) {
            axios.get('./contract/buyer?id=' + buyerId)
                .then(function (response) {
                    // console.log(response);
                    store.dispatch({ type: 'GET_CONTRACT_OF_BUYER', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        GET_CONTRACT: function (contractId, ) {
            axios.get('./contract?id=' + contractId)
                .then(function (response) {
                    // console.log(response);
                    
                    store.dispatch({ 
                        type: 'GET_CONTRACT',
                        payload: cutDataInObject(response.data, [ 'contract_date'])
                    })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        // END GET
        // POST
        POST_CONTRACT: function (data) {
            // cutDeDataInObject(data, [ 'contract_date'])
            return axios.post('./contract/insert', data)
        },
        // END POST
        // PUT
        PUT_CONTRACT: function (data) {
            // cutDeDataInObject(data, [ 'contract_date'])
            return axios.put('./contract/update', data)
        },
        // END PUT
        // DELETE
        DELETE_CONTRACT: function (contractId) {
            return axios.delete('./contract/delete/'+contractId)
        },
        // END DELETE
        // CLEAR
        CLEAR_CONTRACT: function (contractId, ) {
            let data = { contract_status: false,
                 contract_weight: 0, 
                 contract_hamonize: [],
                contract_date: new Date().toISOString().split('T')[0] }
            store.dispatch({ type: 'GET_CONTRACT', payload: data })
        },
        // CLEAR

    }
    ]
}