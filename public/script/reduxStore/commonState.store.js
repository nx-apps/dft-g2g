import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    breadCrumbs: [{ label: 'Overview' },
    { label: 'Subitem1' },
    { label: 'Subitem2' },
    { label: 'Subitem3' }],
    setState: {},
    setPageAndSearch: {},
    contractId: {},
    confirmId: {},
    bookId: {},
    contryNameEn: {}
}
export function commonStateReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_STATE':
            return Object.assign({}, state, { setState: action.payload });
        case 'SET_BREADCRUMBS':
            return Object.assign({}, state, { breadCrumbs: action.payload });
        case 'SET_PAGE_AND_SEARCH':
            return Object.assign({}, state, { setPageAndSearch: action.payload });
        case 'SET_CONTRACT_ID':
            return Object.assign({}, state, { contractId: action.payload });
        case 'SET_CONFIRM_ID':
            return Object.assign({}, state, { confirmId: action.payload });
        case 'SET_BOOK_ID':
            return Object.assign({}, state, { bookId: action.payload });
        case 'SET_COUNTRY_NAME_EN':
            return Object.assign({}, state, { contryNameEn: action.payload });
        default:
            return state
    }
}
export function commonStateAction(store) {
    return [commonAction(),
    {
        SET_STATE: function (data) {
            // console.log(data);
            store.dispatch({ type: 'SET_STATE', payload: data })
            // return axios.get('/external/upload/list/' + ref + '/' + com)
        },
        SET_BREADCRUMBS: function (data) {
            console.log(data);
            store.dispatch({ type: 'SET_BREADCRUMBS', payload: data })
            // return axios.get('/external/upload/list/' + ref + '/' + com)
        },
        SET_PAGE_AND_SEARCH: function (data) {
            // console.log(data);
            store.dispatch({ type: 'SET_PAGE_AND_SEARCH', payload: data })
            // return axios.get('/external/upload/list/' + ref + '/' + com)
        },
        SET_CONTRACT_ID: function (data) {
            // console.log(data);
            store.dispatch({ type: 'SET_CONTRACT_ID', payload: data })
            // return axios.get('/external/upload/list/' + ref + '/' + com)
        },
        SET_CONFIRM_ID: function (data) {
            console.log(data);
            store.dispatch({ type: 'SET_CONFIRM_ID', payload: data })
            // return axios.get('/external/upload/list/' + ref + '/' + com)
        },
        SET_BOOK_ID: function (data) {
            // console.log(data);
            store.dispatch({ type: 'SET_BOOK_ID', payload: data })
            // return axios.get('/external/upload/list/' + ref + '/' + com)
        },
        SET_COUNTRY_NAME_EN: function (data) {
            // console.log(data);
            store.dispatch({ type: 'SET_COUNTRY_NAME_EN', payload: data })
            // return axios.get('/external/upload/list/' + ref + '/' + com)
        },
    }
    ]
}