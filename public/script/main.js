import {createStore,combineReducers} from 'redux'
import PolymerRedux from 'polymer-redux'
import {dispatchActionBehavior} from './config'
import {handleAuth} from './auth'
import {i18nReducer,i18nAction} from './i18n'

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}
const modules = requireAll(require.context("./", true, /^\.\/.*\.store.js$/));

let preReducer = {i18n:i18nReducer};
modules.map(function(row){
	for (var prop in row) {
		var arrSplit = prop.split('Reducer');
		if(arrSplit.length==2){
			preReducer[arrSplit[0]] = row[prop]
		}
	}
})

const rootReducer = combineReducers(preReducer);
const storeApp = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
window.preReduxBehavior = PolymerRedux(storeApp)
window.preDispatchActionBehavior = dispatchActionBehavior()
window.dispatchActionBehavior = dispatchActionBehavior()

handleAuth(storeApp);
window.prei18nAction = i18nAction(storeApp);
modules.map(function(row){
	for (var prop in row) {
		var arrSplit = prop.split('Action');
		if(arrSplit.length==2){
			window['pre'+prop] = row[prop](storeApp);
		}
	}
})