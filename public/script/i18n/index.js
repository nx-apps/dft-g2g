import { commonAction } from '../config'

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}
const modules = requireAll(require.context("./", true, /^\.\/.*\.i18n.js$/));

let languagePack = {};
modules.map((row, i) => {
    languagePack = Object.assign({}, languagePack, row)
})

const initialState = {}

export function i18nReducer(state = initialState, action) {
  switch (action.type) {
    case 'I18N_SELECT_LANGUAGE':
      return Object.assign({}, state, action.payload,{lang:action.lang});
    default:
      return state
  }
}

export function i18nAction(store) {
  return [commonAction(),
  {
    I18N_SELECT_LANGUAGE: function (lang) {
      let preLang = {};
      for (var prop in languagePack) {
        preLang[prop] = languagePack[prop][lang]
      }
      store.dispatch({ type: 'I18N_SELECT_LANGUAGE', payload: preLang,lang: lang})
    }
  }]
}