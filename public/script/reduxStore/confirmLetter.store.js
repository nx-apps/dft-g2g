import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: []
}
export function confirmLetterReducer(state = initialState, action) {
    switch (action.type) {
        // case 'EXPORTER_GET_DATA':
        //     return Object.assign({}, state, { list: action.payload });
        default:
            return state
    }
}
export function confirmLetterAction(store) {
    return [commonAction(),
    {
        UPLOAD_GET_LIST: function (ref, com) {
            // return axios.get('/external/upload/list/' + ref + '/' + com)
        },
    }
    ]
}