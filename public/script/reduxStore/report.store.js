import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    reportDetail: {},
    reportList: []
}
export function reportReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_REPORT_DETAIL':
            return Object.assign({}, state, { reportDtail: action.payload });
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
        SET_REPORT_DETAIL: function (data) {
            store.dispatch({ type: 'SET_CHEQUE_DETAIL_LIST', payload: data })
        },
        // END SET
        // GET
        GET_REPORT_LIST: function () {
             axios.get(window._config.reportServer+'/api/report/list')
                .then(function (response) {
            //         // console.log(response);

            store.dispatch({
                type: 'GET_REPORT_LIST',
                payload:response.data })
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
           return axios.post(window._config.reportServer+'/api/report/get',data)
            //     .then(function (response) {
            //         // console.log(response);

            //         store.dispatch({
            //             type: 'GET_CONTRACT',
            //             payload: cutDataInObject(response.data, ['contract_date'])
            //         })
            //     })
            //     .catch(function (error) {
            //         console.log(error);
            //     });
        },
        GET_REPORT_DETAIL: function (reportId) {
            // axios.get('./contract?id=' + contractId)
            //     .then(function (response) {
            //         // console.log(response);

            //         store.dispatch({
            //             type: 'GET_CONTRACT',
            //             payload: cutDataInObject(response.data, ['contract_date'])
            //         })
            //     })
            //     .catch(function (error) {
            //         console.log(error);
            //     });
            console.log(reportId);
            // return axios.get('/external/upload/list/' + ref + '/' + com)
        },
        // END GET 
        // POST
        POST_REPORT_DETAIL: function (dataReport) {
            console.log(dataReport);
            // store.dispatch({
            //     type: 'GET_CONTRACT',
            //     payload: dataReport
            // })
            // return axios.post('/external/upload/list/' + ref + '/' + com)
        },
        // END POST
        // PUT
        PUT_REPORT_DETAIL: function (dataReport) {
            console.log(dataReport);
            // return axios.put('/external/upload/list/' + ref + '/' + com)
        },
        // END PUT
        // DELETE
        DELTE_REPORT_DETAIL: function (reportId) {
            console.log(reportId);
            // return axios.delete('/external/upload/list/' + ref + '/' + com)
        },
        // END DELETE
    }
    ]
}