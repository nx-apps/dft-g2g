import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {},
    list_calc: []
}
export function feeReducer(state = initialState, action) {
    switch (action.type) {
        case 'FEE_GET_LIST_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'FEE_GET_ID_DATA':
            return Object.assign({}, state, { list_calc: action.payload });
        case 'FEE_CALC_DATA':
            return Object.assign({}, state, { list_calc: action.payload });
        default:
            return state
    }
}
export function feeAction(store) {
    return [commonAction(),
    {
        FEE_GET_LIST_DATA: function(id){
            axios.get('./fee/contract?id='+id)
            .then((response) => {
                store.dispatch({ type: 'FEE_GET_LIST_DATA', payload: response.data});
            })
            .catch((err) => {
                console.log(err);
            })
        },
        FEE_GET_ID_DATA: function(id){
            axios.get('./fee?id='+id)
            .then((response) => {
                response.data.fee_date = response.data.fee_date.split('T')[0];
                // console.log(response.data);
                store.dispatch({type : 'FEE_GET_ID_DATA', payload : response.data});
            })
            .catch((err) => {
                console.log(err);
            })
        },
        FEE_CALC_DATA: function (data) {
            axios.get('./fee/calc?book_id='+data)
            .then((response) => {
                let newData = {
                    rate_bank_b : 0,
                    rate_lt_b : 0,
                    book: response.data
                }
                if(typeof newData.fee_date !== 'undefined'){
                    var date = newData.fee_date.split('T')[0];
                    newData.fee_date = date;
                }else{
                    var dateNow = new Date().toISOString().split('T')[0];
                    newData.fee_date = dateNow;
                }
                // console.log(newData);
                store.dispatch({type:'FEE_CALC_DATA', payload : newData});
            })
            .catch((err) =>{
                console.log(err);
            })
        },
        FEE_INSERT: function (data){ 
            // console.log(data);
            var contract_id = this.getCookieBhv("contract_id");
            this.fire('toast',{status:'load'});
            axios.post('./fee/insert', data)
            .then((response) =>{
                this.fire('toast', {
                    status: 'success', text: 'บันทึกสำเร็จ',
                    callback: () => {
                        this.INVOICE_GET_LIST_DATA(contract_id);
                        this.BOOK_GET_LIST_DATA(contract_id);
                        this.FEE_GET_LIST_DATA(contract_id);
                        this._flipDrawerClose();
                    }
                });
            })
            .catch((err) => {
                console.log(err);
            })
        },
        FEE_UPDATE: function(data){
            var contract_id = this.getCookieBhv("contract_id");
            this.fire('toast',{status:'load'});
            axios.put('./fee/update',data)
            .then((response) => {
                this.fire('toast', {
                    status: 'success', text: 'บันทึกสำเร็จ',
                    callback: () => {
                        this.INVOICE_GET_LIST_DATA(contract_id);
                        this.BOOK_GET_LIST_DATA(contract_id);
                        this.FEE_GET_LIST_DATA(contract_id);
                        this.SET_STATE({
                            isInsert: false,
                            btnDisabled: true,
                            hiddend: true
                        });
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