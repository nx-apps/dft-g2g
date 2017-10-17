import axios from '../axios'
import { commonAction } from '../config'
const cutDataInObject = (data, namePop) => {
    // console.log(1);
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
    confirmLetterlist: [],
    confirmLetterExporterlist: [],
    hamonizeLimitContract: {},
    hamonizeContract: [],
    contractDetail: {},
    exchangeRate: {}
}
export function confirmLetterReducer(state = initialState, action) {
    switch (action.type) {
        case 'GET_CONFIRM_LIST':
            return Object.assign({}, state, { confirmLetterlist: action.payload });
        case 'GET_CONFIRM_EXPORTER_LIST':
            return Object.assign({}, state, { confirmLetterExporterlist: action.payload });
        case 'SET_HAMONIZE_LIMIT_OF_CONTRACT':
            return Object.assign({}, state, { hamonizeLimitContract: action.payload });
        case 'GET_HAMONIZE_OF_CONTRACT':
            return Object.assign({}, state, { hamonizeContract: action.payload });
        case 'GET_CONFIRM_DETAIL':
            return Object.assign({}, state, { contractDetail: action.payload });
        case 'GET_CONFIRM_EXCHANG_RATE':
            return Object.assign({}, state, { exchangeRate: action.payload });
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
                    for (var index = 0; index < response.data.length; index++) {
                        response.data[index].label = 'งวดที่ ' + response.data[index].cl_no + ' ปริมาณ ' + response.data[index].cl_weight + ' ตัน'
                    }
                    let hamonize = response.data
                    let cost_price = Object.keys(hamonize).reduce((previous, current) => previous + hamonize[current].cl_weight, 0)
                    // console.log(cost_price);
                    // cl_weight
                    store.dispatch({ type: 'SET_HAMONIZE_LIMIT_OF_CONTRACT', payload: cost_price })
                    store.dispatch({ type: 'GET_CONFIRM_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log(error);
                });
        },
        GET_CONFIRM_EXPORTER_LIST: function (link = '') {
            axios.get('./confirm/exporter?' + link)
                .then(function (response) {
                    // console.log(response.data);
                    for (var index = 0; index < response.data.length; index++) {
                        response.data[index].label = '[' + response.data[index].company.company_taxno + '] ' + response.data[index].company.company_name_th
                    }
                    store.dispatch({ type: 'GET_CONFIRM_EXPORTER_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log(error);
                });
        },
        GET_HAMONIZE_OF_CONTRACT: function (contract_id) {
            axios.get('./confirm/hamonize?' + contract_id)
                .then(function (response) {
                    response.data.map((item) => {
                        item.label = '[' + item.hamonize.hamonize_code + '] ' + item.hamonize.hamonize_th + ' ปี ' + item.hamonize.hamonize_year 
                    })
                    // console.log(response.data);
                    store.dispatch({ type: 'GET_HAMONIZE_OF_CONTRACT', payload: response.data })
                })
                .catch(function (error) {
                    //console.log(error);
                });
        },
        GET_CONFIRM_DETAIL: function (cl_id) {
            axios.get('./confirm?id=' + cl_id)
                .then(function (response) {
                    // let data = cutDataInObject(response.data, ['cl_date'])
                    store.dispatch({
                        type: 'GET_CONFIRM_DETAIL',
                        payload: cutDataInObject(response.data, ['cl_date'])
                    })
                })
                .catch(function (error) {
                    //console.log(error);
                });
        },
        GET_CONFIRM_FP: function (data) {
            return axios.get('./confirm/fp?' + data)
        },
        GET_CONFIRM_EXCHANG_RATE: function (data) {
            axios.get('https://api.fixer.io/latest?base=USD')
            .then(function (response) {
                    // let data = cutDataInObject(response.data, ['cl_date'])
                    store.dispatch({
                        type: 'GET_CONFIRM_EXCHANG_RATE',
                        payload: response.data
                    })
                })
                .catch(function (error) {
                    //console.log(error);
                });
        },
        // END GET
        // POST
        POST_CONFIRM: function (data) {
            return axios.post('./confirm/insert', data)
        },
        // END POST
        // PUT
        PUT_CONFIRM: function (data) {
            return axios.put('./confirm/update', data)
        },
        // END PUT
        // DELETE
        DELETE_CONFIRM: function (confirmId) {
            return axios.delete('./confirm/delete/' + confirmId)
        },
        // END DELETE
        // CLEAR
        CLEAR_CONFIRM: function (data) {
            let confirm = {
                cl_date: new Date().toISOString().split('T')[0],
                cl_hamonize: [
                    {
                        cost_price: 0,
                        // cost_value: 0,
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
                cl_no: Number(data.cl_no),
                cl_status: false,
                contract_id: data.contract_id,
                contract_no: Number(data.contract_no),
                cl_weight: 0,
                incoterms: [
                    {
                        inct_id: "",
                        inct_name: ""
                    }
                ],
            }
            // console.log(confirm);
            store.dispatch({ type: 'GET_CONFIRM_DETAIL', payload: confirm })
        },
        // CLEAR
    }
    ]
}