
import {
    GenerateJsCorePlugin
} from './GenerateJsCorePlugin'

import {
    GenerateWebviewEntryPlugin
} from './GenerateWebviewEntryPlugin'

import {
    GenerateWebviewPlugin
} from './GenrateWebviewPlugin'

// import {

// } from "./GenerateHtmlPlugin"
export default [
    GenerateWebviewEntryPlugin,
    GenerateWebviewPlugin,
    GenerateJsCorePlugin
]