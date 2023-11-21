


import {
    NodePath
} from '@babel/core'
export class Node {


    getLastImportPath(path): NodePath {

        let lastPath = path
            .get('body')
            .filter((p) => p.isImportDeclaration())
            .pop();

        return lastPath || path
    }
}