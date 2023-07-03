
import {
    GenerateJsCorePlugin
} from './GenerateJsCorePlugin'

import {
    GenerateWebviewEntryPlugin
} from './GenerateWebviewEntryPlugin'

import {
    GenerateWebviewPlugin
} from './GenrateWebviewPlugin'

export default [
    GenerateWebviewEntryPlugin,
    GenerateWebviewPlugin,
    GenerateJsCorePlugin
]