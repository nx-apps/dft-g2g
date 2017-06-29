import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {}
}
export function bookReducer(state = initialState, action) {
    switch (action.type) {
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
        BOOK_GET_LIST_DATA: function (id) {
            axios.get('./bl/contract?id='+id)
            .then((response) => {
                this.fire('toast', {
                    status: 'success', text: 'โหลดข้อมูลสำเร็จ',
                    callback: () => {
                        store.dispatch({type : 'BOOK_GET_LIST_DATA', payload: response.data})
                    }
                });
            })
        },
        BOOK_GET_ID_DATA: function(id) {
            axios.get('./invoice/book?id='+id)
            .then((response) => {
                this.fire('toast', {
                    status: 'success', text: 'โหลดข้อมูลสำเร็จ',
                    callback: () => {
                        store.dispatch({type : 'BOOK_GET_ID_DATA', payload: response.data})
                    }
                });
            })
        },
        BOOK_INSERT: function(data){
            // console.log(data);
            this.fire('toast',{status:'load'});
            axios.put('./invoice/update', data)
            .then((response) =>{
                // console.log(response);
                this.fire('toast', {
                    status: 'success', text: 'บันทึกสำเร็จ',
                    callback: () => {
                        this.INVOICE_GET_LIST_DATA(data.contract_id);
                        this.BOOK_GET_LIST_DATA(data.contract_id);
                        this._flipDrawerClose();
                    }
                });
            })
            .catch((err) => {
                console.log(err);
            })
        },
        BOOK_DELETE: function(data){
            // console.log(data)
            axios.put('./book/approve',data)
            .then((response) => {
                console.log(response);
            })
            .catch((err) => {
                console.log(err);
            })
        }
    }
    ]
}