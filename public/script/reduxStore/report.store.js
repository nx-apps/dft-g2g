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
            axios.get('./report/table')
                .then(function (response) {
                    store.dispatch({ type: 'GET_TABLE_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        GET_REPORT_LIST: function () {
            axios.get(window._config.reportServer + '/api/report/list')
                .then(function (response) {
                    //         // console.log(response);

                    store.dispatch({
                        type: 'GET_REPORT_LIST',
                        payload: response.data
                    })
                    // [
                    //     {
                    //         report_id: 1,
                    //         report_name: 'รายงานการส่งมอบข้าวให้รัฐบาล',
                    //         report_link: '/rice/report1',
                    //         report_type: "rice",
                    //         report_params: [
                    //             {
                    //                 param_field: "contract_id",
                    //                 param_name: "ชื่อสัญญา",
                    //                 param_table: "contract",
                    //                 param_type: "combobox",
                    //                 param_no: 1
                    //             },
                    //             {
                    //                 param: "cl_id",
                    //                 param_name: "งวด",
                    //                 param_table: "confirm",
                    //                 param_type: "combobox",
                    //                 param_no: 2
                    //             },
                    //             {
                    //                 param: "book_id",
                    //                 param_name: "Booking ",
                    //                 param_table: "book",
                    //                 param_type: "combobox",
                    //                 param_no: 3
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         report_id: 2,
                    //         report_name: 'แบบร่าง BL',
                    //         report_link: '/rice/report2',
                    //         report_type: "rice",
                    //     },
                    //     {
                    //         report_id: 3,
                    //         report_name: 'หนังสือการส่งมอบข้าวรัฐบาล',
                    //         report_link: '/rice/report3',
                    //         report_type: "rice",
                    //     },
                    //     {
                    //         report_id: 4,
                    //         report_name: 'ใบรายการลำเรือ',
                    //         report_link: '/rice/report4',
                    //         report_type: "rice",
                    //     },
                    //     {
                    //         report_id: 5,
                    //         report_name: 'ออกใบแจ้งหนี้ (Invoice)',
                    //         report_link: '/finance/report1',
                    //         report_type: "finance",
                    //     },
                    //     {
                    //         report_id: 6,
                    //         report_name: 'ทะเบียนคุมการส่งมอบข้าว',
                    //         report_link: '/finance/report2',
                    //         report_type: "finance",
                    //     },
                    //     {
                    //         report_id: 7,
                    //         report_name: 'เอกสารที่ได้รับเงินการส่งออกข้าว',
                    //         report_link: '/finance/report3',
                    //         report_type: "finance",
                    //     },
                    //     {
                    //         report_id: 8,
                    //         report_name: 'รายละเอียดการรับเงินค่าข้าว',
                    //         report_link: '/finance/report4',
                    //         report_type: "finance",
                    //     },
                    //     {
                    //         report_id: 9,
                    //         report_name: 'การเงิน 5',
                    //         report_link: '/finance/report5',
                    //         report_type: "finance",
                    //     },
                    //     {
                    //         report_id: 10,
                    //         report_name: 'การเงิน 6',
                    //         report_link: '/finance/report6',
                    //         report_type: "finance",
                    //     },
                    //     {
                    //         report_id: 11,
                    //         report_name: 'หนังสือรับรองการหักภาษี ณ ที่จ่าย',
                    //         report_link: '/finance/report7',
                    //         report_type: "finance",
                    //     },
                    //     {
                    //         report_id: 12,
                    //         report_name: 'รายการจ่ายเงินค่าข้าวโครงการขายข้าว',
                    //         report_link: '/finance/report8',
                    //         report_type: "finance",
                    //     },
                    // ]
                })
                .catch(function (error) {
                    console.log(error);
                })
        },
        GET_REPORT_LINK: function (data) {
            return axios.post(window._config.reportServer + '/api/report/get', data)
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