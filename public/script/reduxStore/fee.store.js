import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {},
    unallocated_fees: [],
    allocate_fees: [],
    list_calc: [],
    list_id: []
}
export function feeReducer(state = initialState, action) {
    switch (action.type) {
        case 'FEE_GET_LIST_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'FEE_GET_LIST_UNALLOCATED_FEES':
            return Object.assign({}, state, { unallocated_fees: action.payload });
        case 'FEE_GET_LIST_ALLOCATED_FEES':
            return Object.assign({}, state, { allocate_fees: action.payload });
        case 'FEE_GET_ID_DATA':
            return Object.assign({}, state, { list_calc: action.payload });
        case 'FEE_CALC_DATA':
            return Object.assign({}, state, { list_calc: action.payload });
        case 'FEE_INSERT':
            return Object.assign({}, state, { list_id: action.payload });
        default:
            return state
    }
}
export function feeAction(store) {
    return [commonAction(),
    {
        FEE_GET_LIST_DATA: function (data) {
            // console.log(data.view,data.status);
            // fin 
            // unallocated_fees  false
            // allocate_fees true

            axios.get('./fee/contract?id=' + data.contract_id + '&view=' + data.view + '&status=' + data.status)
                .then((response) => {
                    // console.log(data.view , data.status);
                    if (data.view === 'fin' && data.status === 'false') {
                        // console.log(1);
                        // console.log( response.data);
                        store.dispatch({ type: 'FEE_GET_LIST_UNALLOCATED_FEES', payload: response.data });
                    } else if (data.view === 'fin' && data.status === 'true') {
                        // console.log(2);
                        // console.log( response.data);
                        store.dispatch({ type: 'FEE_GET_LIST_ALLOCATED_FEES', payload: response.data });
                    }
                    store.dispatch({ type: 'FEE_GET_LIST_DATA', payload: response.data });
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        FEE_GET_ID_DATA: function (id) {
            axios.get('./fee?id=' + id)
                .then((response) => {
                    response.data.fee_date = response.data.fee_date.split('T')[0];
                    // console.log(response.data);
                    store.dispatch({ type: 'FEE_GET_ID_DATA', payload: response.data });
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        FEE_CALC_DATA: function (data) {
            axios.post('./fee/calc', data)
                // axios.get('./fee/calc?book_id='+data)
                .then((response) => {
                    let newData = {
                        rate_bank_b: 0,
                        rate_tt_b: 0,
                        fee_ex_d: 0,
                        fee_in_b: 0,
                        book: response.data
                    }
                    if (typeof newData.fee_date !== 'undefined') {
                        var date = newData.fee_date.split('T')[0];
                        newData.fee_date = date;
                    } else {
                        var dateNow = new Date().toISOString().split('T')[0];
                        newData.fee_date = dateNow;
                    }
                    // console.log(newData);
                    store.dispatch({ type: 'FEE_CALC_DATA', payload: newData });
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        FEE_INSERT: function (data) {
            // console.log(data);
            var contract_id = this.getCookieBhv("contract_id");
            this.fire('toast', { status: 'load' });
            axios.post('./fee/insert', data)
                .then((response) => {
                    var fee_id = response.data.fee.generated_keys;
                    store.dispatch({ type: 'FEE_INSERT', payload: fee_id });
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ',
                        callback: () => {
                            this.INVOICE_GET_LIST_DATA(contract_id);
                            // this.BOOK_GET_LIST_DATA(contract_id);
                            this.FEE_GET_LIST_DATA({ contract_id: contract_id, view: 'fin', status: 'false' });
                            // this.FEE_GET_ID_DATA(fee_id);
                            this.SET_STATE({
                                isInsert: false,
                                btnDisabled: true,
                                inputRice: true,
                                btnRice: true
                            });
                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        FEE_UPDATE: function (data) {
            var contract_id = this.getCookieBhv("contract_id");
            this.fire('toast', { status: 'load' });
            axios.put('./fee/update', data)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ',
                        callback: () => {
                            this.INVOICE_GET_LIST_DATA(contract_id);
                            // this.BOOK_GET_LIST_DATA(contract_id);
                            this.FEE_GET_LIST_DATA({ contract_id: contract_id, view: 'fin', status: 'false' });
                            this.SET_STATE({
                                isInsert: false,
                                btnDisabled: true,
                                inputRice: true
                            });
                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        FEE_DELETE: function (id) {
            var contract_id = this.getCookieBhv("contract_id");
            this.fire('toast', { status: 'load' });
            axios.delete('./fee/delete/' + id)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'ลบข้อมูลสำเร็จ',
                        callback: () => {
                            this.INVOICE_GET_LIST_DATA(contract_id);
                            // this.BOOK_GET_LIST_DATA(contract_id);
                            this.FEE_GET_LIST_DATA({ contract_id: contract_id, view: 'fin', status: 'false' });
                            this._flipDrawerClose();
                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        FEE_APPROVE: function (data) {
            var contract_id = this.getCookieBhv("contract_id");
            axios.put('./fee/approve', data)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ',
                        callback: () => {
                            // this.INVOICE_GET_LIST_DATA(contract_id);
                            // this.BOOK_GET_LIST_DATA(contract_id);
                            this.FEE_GET_LIST_DATA({ contract_id: contract_id, view: 'fin', status: 'false' });
                            this._flipDrawerClose();
                        }
                    })
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        FEE_RICE_UPDATE: function (data) {
            var contract_id = this.getCookieBhv("contract_id");
            this.fire('toast', { status: 'load' });
            axios.put('./fee/update', data)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ',
                        callback: () => {
                            this.INVOICE_GET_LIST_DATA(contract_id);
                            // this.BOOK_GET_LIST_DATA(contract_id);
                            this.FEE_GET_LIST_DATA({ contract_id: contract_id, view: 'rice' });
                            this.SET_STATE({
                                isInsert: false,
                                btnDisabled: true,
                                inputRice: true,
                                btnRice: false
                            });
                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        FEE_RICE_APPROVE: function (data) {
            // console.log(data.contract_id);
            var contract_id = data.contract_id || this.getCookieBhv("contract_id");
            // console.log(contract_id);
            // console.log(contract_id);
            this.fire('toast', { status: 'load' });
            axios.put('./fee/approve', data)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ',
                        callback: () => {
                            this.INVOICE_GET_LIST_DATA(contract_id);
                            // this.BOOK_GET_LIST_DATA(contract_id);
                            this.FEE_GET_LIST_DATA({ contract_id: contract_id, view: 'rice' });
                            this.backPageFee();
                            // this._flipDrawerClose();
                        }
                    })
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        FEE_REJECT: function (data) {
            var contract_id = this.getCookieBhv("contract_id");
            axios.put('./fee/approve', data)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ',
                        callback: () => {
                            this.INVOICE_GET_LIST_DATA(contract_id);
                            // this.BOOK_GET_LIST_DATA(contract_id);
                            this.FEE_GET_LIST_DATA({ contract_id: contract_id, view: 'fin', status: 'true' });
                            this._flipDrawerClose();
                        }
                    })
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        FEE_APPROVE_FINSH: function (data) {
            var contract_id = this.getCookieBhv("contract_id");
            axios.put('./fee/approve', data)
                .then((response) => {
                    this.fire('toast', {
                        status: 'success', text: 'บันทึกสำเร็จ',
                        callback: () => {
                            // this.INVOICE_GET_LIST_DATA(contract_id);
                            // this.BOOK_GET_LIST_DATA(contract_id);
                            this.FEE_GET_LIST_DATA({ contract_id: contract_id, view: 'fin', status: 'true' });
                            this.dispatchAction('FEE_GET_LIST_DATA', { contract_id: contract_id, view: 'fin', status: 'false' })
                            this._flipDrawerClose();
                            let chequeTrue = { id: contract_id, status: true }
                            let chequeFasle = { id: contract_id, status: false }
                            this.dispatchAction('GET_CHEQUE_LIST', this.genUrl(chequeTrue))
                            // console.log(chequeFasle);
                            this.dispatchAction('GET_CHEQUE_LIST', this.genUrl(chequeFasle))
                        }
                    })
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }
    ]
}