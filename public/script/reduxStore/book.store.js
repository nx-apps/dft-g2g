import axios from '../axios'
import { commonAction } from '../config'
const cutDataInObject = (data, namePop) => {
    for (var key in data) {
        for (var index = 0; index < namePop.length; index++) {
            if (namePop[index] === key) {
                let time = new Date(data[key])
                data[key] = new Date(time.setHours(time.getHours() + 7)).toISOString()
                data[key] = data[key].split("T")[0]
            }
        }
    }
}
const initialState = {
    list: [],
    bookList: [],
    bookDetail: {},
    bookHamonizeList:[],
    bookExporterList:[],
    bookExporterDetail:[],
    data: {}
}
export function bookReducer(state = initialState, action) {
    switch (action.type) {
        case 'GET_BOOK_LIST':
            return Object.assign({}, state, { bookList: action.payload });
        case 'GET_BOOK_DETAIL':
            return Object.assign({}, state, { bookDetail: action.payload });
        case 'GET_BOOK_EXPORTER_LIST':
            return Object.assign({}, state, { bookExporterList: action.payload });
        case 'GET_BOOK_HAMONIZE_LIST':
            return Object.assign({}, state, { bookHamonizeList: action.payload });
        case 'GET_BOOK_EXPORTER_DETAIL':
            return Object.assign({}, state, { bookExporterDetail: action.payload });
        case 'BOOK_GET_LIST_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'BOOK_GET_ID_DATA':
            return Object.assign({}, state, { data: action.payload });
        default:
            return state
    }
}
export function bookAction(store) {
    return [commonAction(),
    {
        //     app.get('/detail/list', controller.listDetail);
        // app.get('/detail', controller.getDetailById);
        // app.post('/detail/insert', controller.insertDetail);
        // app.put('/detail/update', controller.updateDetail);
        // app.delete('/detail/delete/:id', controller.deleteDetail);
        // GET
        GET_BOOK_LIST: function (cl_id) {
            axios.get('./book/confirm?' + cl_id)
                .then(function (response) {
                    // console.log(response.data);
                    store.dispatch({ type: 'GET_BOOK_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        GET_BOOK_DETAIL: function (book_id) {
            axios.get('./book?' + book_id)
                .then(function (response) {
                    // console.log(response.data);
                    cutDataInObject(response.data, ['packing_date', 'product_date', 'etd_date', 'eta_date', 'cut_date'])
                    store.dispatch({ type: 'GET_BOOK_DETAIL', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        GET_BOOK_EXPORTER_LIST: function (booking_id) {
            axios.get('./book/detail/list?' + booking_id)
                .then(function (response) {
                    // console.log(response.data);
                    store.dispatch({ type: 'GET_BOOK_EXPORTER_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        GET_BOOK_HAMONIZE_LIST: function (cl_id) {
            axios.get('./book/hamonize?' + cl_id)
                .then(function (response) {
                    for (var index = 0; index < response.data.length; index++) {
                        // response.data[index].label = ''
                        response.data[index].label = '['+response.data[index].hamonize.hamonize_code+'] '+response.data[index].hamonize.hamonize_en
                        // console.log(response.data[index].hamonize.hamonize_en );
                    }
                    store.dispatch({ type: 'GET_BOOK_HAMONIZE_LIST', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        GET_BOOK_EXPORTER_DETAIL: function (booking_exporter_id) {
            axios.get('./book/detail?' + booking_exporter_id)
                .then(function (response) {
                    // console.log(response.data);
                    store.dispatch({ type: 'GET_BOOK_EXPORTER_DETAIL', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        // BOOK_GET_LIST_DATA: function (id) {

        //     axios.get('./bl/contract?id=' + id)
        //         .then((response) => {
        //             store.dispatch({ type: 'BOOK_GET_LIST_DATA', payload: response.data })
        //         })
        // },
        // BOOK_GET_ID_DATA: function (id) {
        //     axios.get('./invoice/book?id=' + id)
        //         .then((response) => {
        //             store.dispatch({ type: 'BOOK_GET_ID_DATA', payload: response.data })
        //         })
        // },
        // BOOK_INSERT: function (data) {
        //     console.log(data);
        //     axios.put('./invoice/update', data)
        //         .then((response) => {
        //             console.log(response);
        //         })
        //         .catch((err) => {
        //             console.log(err);
        //         })
        // },
        // END GET
        // POST
        POST_BOOK: function (data) {
            return axios.post('./book/insert', data)
        },
        // END POST
        // PUT
        PUT_BOOK: function (data) {
            return axios.put('./book/update', data)
        },
        // END PUT
        // DELETE
        DELETE_BOOK: function (confirmId) {
            return axios.delete('./book/delete/' + confirmId)
        },
        // END DELETE
        // CLEAR
        CLEAR_BOOK_LIST: function (cl_no) {
            let data = []
            store.dispatch({ type: 'GET_BOOK_LIST', payload: data })
        },
        CLEAR_BOOK_DETAIL: function (data) {
            let date = new Date().toISOString().split('T')[0]
            // console.log(date);
            let BookDetail = {
                bl_no: "",
                book_no: "",
                book_remark: "",
                book_status: false,
                cl_id: data.cl_id,
                cl_no: Number(data.cl_no),
                contract_id: data.contract_id,
                contract_no: Number(data.contract_no),
                cut_date: date,
                cut_time: "12:00",
                deli_port: {},
                deli_port_id: "",
                dest_port: {},
                dest_port_id: "",
                eta_date: date,
                etd_date: date,
                gross_weight: 0,
                invoice_status: false,
                load_port: {},
                load_port_id: "",
                net_weight: 0,
                notify_party: {},
                package_amount: 0,
                packing_date: date,
                product_date: date,
                ship: [
                    {
                        ship_name: "",
                        ship_voy: ""
                    }
                ],
                ship_lot: data.ship_lot,
                shipline: {},
                shipline_id: "",
                surveyor: [
                    {
                        "surveyor_id": "",
                        "surveyor_name": ""
                    }
                ],
                tare_weight: 0,
                value_d: 0,
                weight_container: 25
            }
            store.dispatch({ type: 'GET_BOOK_DETAIL', payload: BookDetail })
        },
        BOOK_GET_LIST_DATA: function (id) {
            axios.get('./bl/contract?id=' + id)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'โหลดข้อมูลสำเร็จ',
                        callback: () => {
                            store.dispatch({ type: 'BOOK_GET_LIST_DATA', payload: response.data })
                        }
                    });
                })
        },
        BOOK_GET_ID_DATA: function (id) {
            axios.get('./invoice/book?id=' + id)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'โหลดข้อมูลสำเร็จ',
                        callback: () => {
                            store.dispatch({ type: 'BOOK_GET_ID_DATA', payload: response.data })
                        }
                    });
                })
        },
        BOOK_INSERT: function (data) {
            // console.log(data);
            this.fire('toast', { status: 'load' });
            axios.put('./invoice/update', data)
                .then((response) => {
                    // console.log(response);
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ',
                        callback: () => {
                            this.INVOICE_GET_LIST_DATA(data.contract_id);
                            this.BOOK_GET_LIST_DATA(data.contract_id);
                            this.FEE_GET_LIST_DATA(data.contract_id);
                            this._flipDrawerClose();
                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        BOOK_DELETE: function (data) {
            // console.log(data)
            this.fire('toast', { status: 'load' });
            axios.put('./book/approve', data)
            .then((response) => {
                this.fire('toast', {
                    status: 'success', text: 'บันทึกสำเร็จ',
                    callback: () => {
                        this.INVOICE_GET_LIST_DATA(data.contract_id);
                        this.BOOK_GET_LIST_DATA(data.contract_id);
                        this.FEE_GET_LIST_DATA(data.contract_id);
                        this._flipDrawerClose();
                    }
                });
            })
            .catch((err) => {
                console.log(err);
            })
        }
    }
    ]
}