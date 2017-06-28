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
                store.dispatch({type : 'BOOK_GET_LIST_DATA', payload: response.data})
            })
        },
        BOOK_GET_ID_DATA: function(id) {
            axios.get('./invoice/book?id='+id)
            .then((response) => {
                store.dispatch({type : 'BOOK_GET_ID_DATA', payload: response.data})
            })
        },
        BOOK_INSERT: function(data){
            console.log(data);
            axios.put('./invoice/update', data)
            .then((response) =>{
                console.log(response);
            })
            .catch((err) => {
                console.log(err);
            })
        }
    }
    ]
}