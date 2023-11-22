

import { NO, delimiters, isNil } from '@po/shared'

import {

    InterpolationNode,
    TemplateNode,
    NodeTypes,
    RootNode,
    ElementNode,
    ElementTypes,
    AttributeNode,
    TextNode,
    CommentNode,
    AttributeConstantNode
} from './ast'



import _ from "lodash"
import { ResolveOptions } from './helper'



export interface ParseOptions extends ResolveOptions{

    isIgnoreTag: (tag: string) => boolean

}


export type ParseContext = {
    code: string,
    options: ParseOptions,

    children: TemplateNode[],
    currentNode?: ElementNode | undefined | RootNode,
    stack: TemplateNode[],
    imports: any[],
    methods: string[],
    data:string[],
    recordImports: (key: string, value: string) => unknown
    recordMethods: (name: string) => unknown
    reacordData: (name: string) => unknown

    helper: (node: TemplateNode) => void
    start: (tag: string, props: AttributeNode[], unary: boolean) => unknown
    end: (tag: string) => unknown
    chars: (text: string) => unknown
    comment: (text: string) => unknown
}


var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
    endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
    attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;


let defaultOptions: ParseOptions = {
    isIgnoreTag: NO
}


export function createParseContext(template: string, options: ParseOptions): ParseContext {


    let context: ParseContext = {
        code: template,
        options,


        children: [],
        currentNode: undefined,
        stack: [],
        imports: [],
        methods: [],
        data:[],

        reacordData(name: string) {
            let { data } = context;
            if (data.includes(name)) return;
            data.push(name)
        },


        recordMethods(name: string) {
            let { methods } = context;
            if (methods.includes(name)) return;
            methods.push(name)
        },

        // 导入wxs的记录
        recordImports(key: string, value: string) {
            let { imports } = context;
            if (_.find(imports, { key })) return;
            imports.push({ key, value })
        },

        helper(node: TemplateNode) {
            if (!context.currentNode) {
                if (node.type === NodeTypes.ELEMENT)
                    context.currentNode = node;

                context.children.push(node)
            } else {
                context.currentNode.children?.push(node)
                node.parent = context.currentNode
            }

        },

        start(tag: string, props: AttributeNode[], unary: boolean) {
            if (options.isIgnoreTag(tag)) return;
            let element: ElementNode = {
                type: NodeTypes.ELEMENT,
                tagType: ElementTypes.ELEMENT,
                tag,
                props,
                unary,
                children: [],
            };

            // 记录for变量
            if (props && props.length) {
                let hasFor = _.find(props, { dirname: "for" })

                if (hasFor) {

                    let itemName = _.find(props, { dirname: "for-item" })?.value ?? "item"
                    let indexName = _.find(props, { dirname: "for-index" })?.value ?? "index"

                    element.forInfo = {
                        itemName,
                        indexName,
                        
                    }
                }
            }


            // 记录wxs
            if (tag === "wxs") {
                let key = _.find(props, { key: "src" }).value;
                let value = _.find(props, { key: "module" }).value;
                context.recordImports(key, value)
            }

            context.helper(element)
            // 没有tag结束符
            if (!unary) {
                context.currentNode = element;
            }
        },

        end: function end(tag: string) {
            if (options.isIgnoreTag(tag)) return;
            context.currentNode = context.currentNode?.parent
        }
        ,

        chars: function chars(text: string) {

            let el: TextNode | InterpolationNode = {
                type: text && text.indexOf(delimiters[0]) !== -1 ? NodeTypes.INTERPOLATION : NodeTypes.TEXT,
                value: text,
                codegenNode: undefined
            };

            context.helper(el);
        },
        comment: function comment(text: string) {

            let el: CommentNode = {
                type: NodeTypes.COMMENT,
                value: text,
                parent: context.currentNode as ElementNode,
                codegenNode: undefined
            };

            context.helper(el);

        },
    }


    return context;

}


export function createParseRoot(context:ParseContext): RootNode {



    let root: RootNode = {
        type: NodeTypes.ROOT,
        children:context.children,
        helpers: {},
        imports: context.imports,
        methods: context.methods,
        codegenNode: undefined,
        components: [],
        data: context.data,
        hoists: [],
        code:context.code
    }

    context.children.forEach((child) => child.parent = root)

    return root;
}


export function baseParse(template: string, options?: ParseOptions) {

    let mergedOptions = Object.assign(defaultOptions, options || {})
    let context = createParseContext(template, mergedOptions)


    parseHTML(context)


    return createParseRoot(context);


}




function parseHTML(context: ParseContext) {
    var index,
        chars,
        match

    let html = context.code;

    while (html) {
        chars = true;

        advanceSpaces()

        // Comment
        if (html.indexOf('<!--') == 0) {
            index = html.indexOf('-->');

            if (index >= 0) {
                if (context.comment) context.comment(html.substring(4, index));
                advanceBy(index + 3);
                chars = false;
            }

            // end tag
        } else if (html.indexOf('</') == 0) {
            match = html.match(endTag);

            if (match) {
                advanceBy(match[0].length)
                //@ts-ignore
                match[0].replace(endTag, parseEndTag);
                chars = false;
            }

            // start tag
        } else if (html.indexOf('<') == 0) {
            match = html.match(startTag);

            if (match) {
                advanceBy(match[0].length)
                //@ts-ignore
                match[0].replace(startTag, parseStartTag);
                chars = false;
            }
        }

        if (chars) {
            index = html.indexOf('<');
            var text = '';
            while (index === 0) {
                text += '<';
                advanceBy(1)
                index = html.indexOf('<');
            }
            text += index < 0 ? html : html.substring(0, index);
            html = index < 0 ? '' : html.substring(index);

            if (context.chars) context.chars(text);
        }


        advanceSpaces()
    }



    function parseStartTag(tag: string, tagName: string, rest: any, unary: boolean) {
        //fix 小程序无需进行小写转换
        // tagName = tagName.toLowerCase();
        var props: AttributeNode[] = [];
        //@ts-ignore
        rest.replace(attr, function (match, key: string) {
            // fix scroll-y
            var value = arguments[2]
                ? arguments[2]
                : arguments[3]
                    ? arguments[3]
                    : arguments[4]
                        ? arguments[4]
                        : arguments[4];


            let prop: AttributeNode

            if (!isNil(value)) value = value.replace(/\"/g, "'");

            let policies = [
                {

                    // po:xxx = ""
                    match:(key:string,value:any) => {
                        return /(?:^po:([a-z0-9-]+))/i.exec(key)
                    },

                    exec:(key:string,value:any,res:any) => {
                        return {
                                type: NodeTypes.ATTRIBUTE_DIRECTIVE,
                                dirname: res[1],
                                key,
                                value,
                        }

                    }
                }, 
                // catch/bind
                {
                    match:(key:string,value:any) => {

                        return key.startsWith("catch") || key.startsWith("bind")
                    },

                    exec:(key:string,value:any) => {

                        context.recordMethods(value);
                        return {
                                type: NodeTypes.ATTRIBUTE_DIRECTIVE,
                                dirname: "on",
                                key,
                                value,
                        }

                    }

                },
                // value = {{}}组件属性
                {
                    match:(key:string,value:any) => {
                        return value && value.indexOf(delimiters[0]) !== -1
                    },

                    exec:(key:string,value:any) => {

                        return {
                            type: NodeTypes.ATTRIBUTE_DIRECTIVE,
                            dirname: "bind",
                            key,
                            value,
                    }
                    }
                },
                // 常量属性
                {
                    match:(key:string,value:any) => {

                        return true
                    },

                    exec:(key:string,value:any) => {
                       return  {
                            type: NodeTypes.ATTRIBUTE_CONSTANT,
                            key,
                            value,
                        }

                    }
                }
            ]
            
            for (let i = 0; i < policies.length;i++) {
                let { match , exec } = policies[i]
                let res = match(key,value)
                if (res) {
                    prop = exec(key,value,res) as AttributeConstantNode
                    props.push(prop)
                    break;
                }
            }

          

        });


        unary = !!unary;
        if (context.start) {
            context.start(tagName, props, unary);
        }
    }

    //@ts-ignore
    function parseEndTag(tag, tagName: string) {
        if (context.end) context.end(tagName);
    }

    function advanceBy(numberOfCharacters: number): void {
        html = html.substring(numberOfCharacters)
    }

    function advanceSpaces(): void {
        const match = /^[\t\r\n\f ]+/.exec(html)
        if (match) {
            advanceBy(match[0].length)
        }

    }

}
