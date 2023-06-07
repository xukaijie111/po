

export const CREATE_ELEMENT_BLOCK = '_createElementBlock'


export const CREATE_FRAGMENT = '_createFragmentVNode'


export const CREATE_ELEMENT_VNODE ='_createElementVNode'
export const CREATE_COMMENT_VNODE = '_createCommentVNode'
export const CREATE_TEXT_NODE = '_createTextVNode'

export const RESOLVE_COMPONENT = '_resolveComponent'

export const CREATE_COMPONENT_VNODE = `_createComponentVNode`
export const NORMALIZE_CLASS = '_normalizeClass'
export const NORMALIZE_STYLE = '_normalizeStyle'
export const NORMALIZE_PROPS = '_normalizeProps'
export const RENDER_LIST = '_renderList'


export const helperNameMap: any = {

  [CREATE_ELEMENT_BLOCK]: `createElementBlock`,

  [CREATE_ELEMENT_VNODE]: `createElementVNode`,
  [CREATE_COMMENT_VNODE]: `createCommentVNode`,
  [CREATE_TEXT_NODE]: `createTextVNode`,
  [CREATE_FRAGMENT]:`createFragmentVNode`,

  [RESOLVE_COMPONENT]: `resolveComponent`,
  [CREATE_COMPONENT_VNODE]:`createComponentVNode`,

  [NORMALIZE_CLASS]: `normalizeClass`,
  [NORMALIZE_STYLE]: `normalizeStyle`,
  [RENDER_LIST]:'renderList'

}



export const RUNTIME_WEBVIEW_NPM = "@po/runtime-webview"

export const RUNTIME_JSCORE_NPM = "@po/runtime-jscore"

export const JSCORE_COMPONENT_NAME = "Component"
export const JSCORE_PAGE_NAME = "Page"

export const JSCORE_APP_NAME = "App"



export const PACK_APPSERVICE_NAME = "poScriptDistFile.js"
