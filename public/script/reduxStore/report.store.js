import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    tableList: [],
    reportDtail: {},
    reportList: []
}
export function reportReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_REPORT_DETAIL':
            return Object.assign({}, state, { reportDtail: action.payload });
        case 'GET_TABLE_LIST':
            return Object.assign({}, state, { tableList: action.payload });
        case 'GET_REPORT_LIST':
            return Object.assign({}, state, { reportList: action.payload });
        case 'GET_REPORT_DETAIL':
            return Object.assign({}, state, { reportDtail: action.payload });
        default:
            return state
    }
}
export function reportAction(store) {
    return [commonAction(),
    {
        // SET
        SET_REPORT_DETAIL: function () {
            let data = {
                    report_name: "",
                    report_no: 1,
                    report_path: "",
                    report_table: "",
                    report_type: "",
                    report_params: [
                        {
                            label: "",
                            no: 1,
                            redux: false,
                            req: {
                                field: "",
                                value: ""
                            },
                            res: "",
                            type: "",
                            view: ""
                        }
                    ]
                }
            store.dispatch({ type: 'SET_REPORT_DETAIL', payload: data })
        },
        // END SET
        // GET
        GET_TABLE_LIST: function () {
            axios.get('/report/table')
                .then(function (response) {
                    store.dispatch({ type: 'GET_TABLE_LIST', payload: response.data })
                })
                .catch(function (error) {
                    //console.log(error);
                })
        },
        GET_REPORT_LIST: function () {
            axios.get('/report/list')
                .then(function (response) {
                            // console.log(response);

                    store.dispatch({
                        type: 'GET_REPORT_LIST',
                        payload: response.data
                    })
                })
                .catch(function (error) {
                    //console.log(error);
                })
        },
        GET_REPORT_LINK: function (data) {
            return axios.post('/report/get', data)
        },
        GET_REPORT_DETAIL: function (data) {
            store.dispatch({ type: 'SET_REPORT_DETAIL', payload: data })
        },
        // END GET 
        // POST
        POST_REPORT_DETAIL: function (dataReport) {
            return axios.post('/report/insert/',dataReport)
        },
        // END POST
        // PUT
        PUT_REPORT_DETAIL: function (dataReport) {
            // console.log(dataReport);
            return axios.put('/report/update/', dataReport)
        },
        // END PUT
        // DELETE
        DELTE_REPORT_DETAIL: function (reportId) {
            return axios.delete('/report/delete/'+reportId)
        },
        // END DELETE
    }
    ]
}