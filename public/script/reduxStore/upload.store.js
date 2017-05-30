import axios from '../axios'
import { commonAction } from '../config'
const initialState = {
    list: []
}
export function uploadReducer(state = initialState, action) {
    switch (action.type) {
        // case 'EXPORTER_GET_DATA':
        //     return Object.assign({}, state, { list: action.payload });
        default:
            return state
    }
}
export function uploadAction(store) {
    return [commonAction(),
    {
        UPLOAD_GET_LIST: function (ref, com) {
            return axios.get('/external/upload/list/' + ref + '/' + com)
        },
        UPLOAD_FILE_CHANGE: function (key) {
            return axios.get('/external/document_file/id/' + key)
        },
        UPLOAD_DELETE: function (id, com_id) {
            this.fire('toast', { status: 'load', text: 'กำลังบันทึกข้อมูล...' })
            axios.delete('/external/upload/file/' + id)
                .then((response) => {
                    //console.log(response);
                    this.fire('toast', {
                        status: 'success', text: 'ลบไฟล์สำเร็จ', callback:  () => {
                            this.dispatchAction('EXPORTER_GET_FILE_DELETE',com_id);
                            // console.log('success');
                        }
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        UPLOAD_RECOVERY: function(id, com_id){
            this.fire('toast',{status:'load',text:'กำลังบันทึกข้อมูล...'})
            axios.put('/external/upload/update/'+id)
            .then( (response)=>{
                // console.log(response);
                this.fire('toast',{status:'success',text:'กู้คืนไฟล์สำเร็จ',callback:() => {
                    this.dispatchAction('EXPORTER_GET_FILE_DELETE',com_id);
                    this.dispatchAction('EXPORTER_GET_DATA');
                    // this.fire('refresh-exporter');
                    // this.fire('getFiles');
                }});
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    }
    ]
}