import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: [],
    data: {},
    typeLic : [],
    docType : [],
    files : []
}
export function exporterReducer(state = initialState, action) {
    switch (action.type) {
        case 'EXPORTER_GET_DATA':
            return Object.assign({}, state, { list: action.payload });
        case 'EXPORTER_GET_DATA_ID':
            return Object.assign({}, state, { data: action.payload });
        case 'EXPORTER_GET_TYPE_LIC':
            return Object.assign({}, state, { typeLic: action.payload });
        case 'EXPORTER_GET_DOC_TYPE':
            return Object.assign({}, state, { docType: action.payload });
        case 'EXPORTER_GET_FILE_DELETE':
            return Object.assign({}, state, { files: action.payload });
        case 'EXPORTER_SEARCH':
            return Object.assign({}, state, { list: action.payload });
        default:
            return state
    }
}
export function exporterAction(store) {
    return [commonAction(),
        {
            EXPORTER_GET_DATA: function () {
                axios.get('./external/exporter')
                    .then(function (response) {
                        response.data.map((item) => {
                            for (var key in item) {
                                if(item[key] === ""){
                                    item[key] = '-';
                                }
                            }
                            return item.company_name = '('+item.company_taxno+ ') ' + item.company_name_th +' '+ item.company_name_en;
                        })
                        // console.log(response.data);
                        store.dispatch({ type: 'EXPORTER_GET_DATA', payload: response.data })
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            },
            EXPORTER_GET_DATA_ID: function (id) {
                axios.get('./external/exporter/id/'+id)
                    .then(function (response) {
                        response.data.map((item) => {
                            for (var key in item) {
                                if(item[key] === ""){
                                    item[key] = '-';
                                }
                            }
                        })
                        // console.log(response.data);
                        store.dispatch({ type: 'EXPORTER_GET_DATA_ID', payload: response.data[0] })
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            },
            EXPORTER_GET_FILE_DELETE: function (id) {
                axios.get('./external/upload/list/'+id)
                .then(function (response) {
                    // console.log(response.data);
                    store.dispatch({ type: 'EXPORTER_GET_FILE_DELETE', payload: response.data })
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            EXPORTER_GET_TYPE_LIC: function(){
                axios.get('./external/type_license')
                .then(function(response){
                    // console.log(response.data);
                    store.dispatch({ type: 'EXPORTER_GET_TYPE_LIC', payload: response.data })
                })
                .catch(function (error){
                    console.log(error);
                })
            },
            EXPORTER_GET_DOC_TYPE: function(){
                axios.get('./external/document_type')
                .then(function(response){
                    store.dispatch({ type: 'EXPORTER_GET_DOC_TYPE', payload: response.data })
                })
                .catch(function (error){
                    console.log(error);
                })
            },
            EXPORTER_SEARCH: function(val){
                // this.fire('toast', { status: 'load' })
                axios.get('./external/exporter'+ val)
                .then(function(response){
                    response.data.map((item) => {
                        for (var key in item) {
                            if (item[key] === '') {
                                item[key] = '-';
                            }
                        }
                        return item.company_name = '('+item.company_taxno+ ') ' + item.company_name_th +' '+ item.company_name_en;
                    })
                    store.dispatch({ type: 'EXPORTER_SEARCH', payload: response.data })
                });
                this.fire('toast', { status: 'success', text: 'ค้นหาข้อมูลสำเร็จ', callback:function(){} })
            }
        }
    ]
}