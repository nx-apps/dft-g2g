import axios from '../axios'
import { commonAction } from '../config'
const cutDataInObject = (data, namePop) => {
    for (var key in data) {
        for (var index = 0; index < namePop.length; index++) {
            if (namePop[index] === key) {
                let time = new Date(data[key])
                data[key] = new Date(time.setHours(time.getHours() - 7)).toISOString()
                data[key] = data[key].split("T")[0]
            }
        }
    }
}
const initialState = {
    confirmLetterlist: [],
    hamonizeContract: [],
    contractDetail: {},
    hamonizeFp: {}
}
export function confirmLetterReducer(state = initialState, action) {
    switch (action.type) {
        case 'GET_CONFIRM_LIST':
            return Object.assign({}, state, { confirmLetterlist: action.payload });
        case 'GET_HAMONIZE_OF_CONTRACT':
            return Object.assign({}, state, { hamonizeContract: action.payload });
        case 'GET_CONFIRM_DETAIL':
            return Object.assign({}, state, { contractDetail: action.payload });
        case 'GET_CONFIRM_FP':
            return Object.assign({}, state, { hamonizeFp: action.payload });
        default:
            return state
    }
}
export function confirmLetterAction(store) {
    return [commonAction(),
    {
        // GET
        GET_CONFIRM_LIST: function (link = '') {
            axios.get('./confirm/contract?' + link)
                .then(function (response) {
                    // console.log(response.data);
                    store.dispatch({ type: 'GET_CONFIRM_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        GET_HAMONIZE_OF_CONTRACT: function (contract_id) {
            axios.get('./confirm/hamonize?' + contract_id)
                .then(function (response) {
                    response.data.map((item) => {
                        item.label = '[' + item.hamonize.hamonize_code + '] ' + item.hamonize.hamonize_th
                    })
                    // console.log(response.data);
                    store.dispatch({ type: 'GET_HAMONIZE_OF_CONTRACT', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        GET_CONFIRM_DETAIL: function (cl_id) {
            axios.get('./confirm?id=' + cl_id)
                .then(function (response) {
                    // console.log(response.data);
                    cutDataInObject(response.data, ['cl_date'])
                    store.dispatch({ type: 'GET_CONFIRM_DETAIL', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        GET_CONFIRM_FP: function (data) {
            axios.get('./confirm/fp', data)
                .then(function (response) {
                    // console.log(response.data);
                    store.dispatch({ type: 'GET_CONFIRM_FP', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        // END GET
        // CLEAR
        CLEAR_CONFIRM: function () {
            let data = {
                cl_date: new Date().toISOString().split('T')[0],
                cl_hamonize: [
                    {
                        cost_price: 0,
                        cost_value: 0,
                        hamonize_id: '',
                        hamonize_weight: 0,
                        package: [
                            {
                                package_id: '',
                                price_d: 0
                            },
                        ],
                        project_en: 0,
                        project_th: 0,
                        tolerance_rate: 0
                    }
                ],
                cl_no: 1,
                cl_status: false,
                cl_weigh: 0,
                incoterms: [
                    {
                        inct_id: "",
                        inct_name: ""
                    }
                ],
            }

            store.dispatch({ type: 'GET_CONFIRM_DETAIL', payload: data })
        },
        // CLEAR
    }
    ]
}