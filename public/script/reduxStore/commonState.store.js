import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    setState:{}
}
export function commonStateReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_STATE':
            return Object.assign({}, state, { setState: action.payload });
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
    }
    ]
}