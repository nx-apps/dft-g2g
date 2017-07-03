import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: []
}
export function invoiceReducer(state = initialState, action) {
    switch (action.type) {
        case 'INVOICE_GET_LIST_DATA':
            return Object.assign({}, state, { list: action.payload });
        default:
            return state
    }
}
export function invoiceAction(store) {
    return [commonAction(),
    {
        INVOICE_GET_LIST_DATA: function (id) {
            axios.get('./invoice/contract?id='+id)
            .then((response) => {
                response.data.map((val) => {
                    return val.check = false
                })
                store.dispatch({type: 'INVOICE_GET_LIST_DATA', payload: response.data})
            })
        },
        INVOICE_SAVE: function (data){
            this.fire('toast',{status:'load'});
            axios.put('./invoice/update', data)
            .then((response) =>{
                this.fire('toast', {
                    status: 'success', text: 'บันทึกสำเร็จ',
                    callback: () => {
                        this.INVOICE_GET_LIST_DATA(data.contract_id);
                        this.BOOK_GET_LIST_DATA(data.contract_id);
                        this.FEE_GET_LIST_DATA(data.contract_id);
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
        },
        INVOICE_DELETE: function(data){
            this.fire('toast',{status:'load'});
            axios.delete('./invoice/reject/'+data.id)
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
        }
    }
    ]
}