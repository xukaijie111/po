





export enum NodeTypes {
    ROOT,
    ELEMENT,
    COMMENT,
    TEXT,
    COMPONENT,
    PROPS,
    INTERPOLATION, // 文本的数据绑定
    ATTRIBUTE_DIRECTIVE,
    ATTRIBUTE_CONSTANT,
    IF,
    FOR
}

export enum ElementTypes {
    ELEMENT,
    COMPONENT,
    SLOT,
    TEMPLATE
}

export type Position = {
    column: number,
    line: number,
    offset: number,
}


export type Location = {
    start: Position,
    end: Position,
    source: string
}

export interface Node {
    type: NodeTypes,
    parent?: ElementNode | RootNode,
    codegenNode?: CodegenNode, // codegenNode, transform 的时候计算，用于生成代码
    children?: TemplateNode[] | undefined,
    isRemoved?: boolean // else if 分支，不参与codegen 
}

export type AttributeNode = AttributeConstantNode | AttributeDirectiveNode

export interface AttributeConstantNode extends Node {
    type: NodeTypes.ATTRIBUTE_CONSTANT
    key: string,
    value?: string
}

export interface AttributeDirectiveNode extends Node {
    type: NodeTypes.ATTRIBUTE_DIRECTIVE,
    dirname: string,
    key: string,
    value?: string
}



export interface InterpolationNode extends Node {
    type: NodeTypes.INTERPOLATION,
    value: string,
    codegenNode: TextCodegenNode | undefined
}

export interface CommentNode extends Node {
    type: NodeTypes.COMMENT,
    value: string,
    codegenNode: CommentCodegenNode | undefined
}

export interface TextNode extends Node {
    type: NodeTypes.TEXT,
    value: string,
    codegenNode: TextCodegenNode | undefined
}

export type forInfo = {
    itemName: string,
    indexName: string
}

// 元素节点
export interface PlaiElement extends Node {
    type: NodeTypes.ELEMENT,
    tag: string,
    tagType: ElementTypes,
    children?: Array<TemplateNode>,
    props?: Array<AttributeNode>,
    unary?: boolean,
    forInfo?: forInfo | undefined
}

export type TemplateNode = PlaiElement | TextNode | CommentNode | InterpolationNode



export type CodegenNode =
 ElementCodegenNode
    | TextCodegenNode |
    PropsCodegenNode | RootCodeGen
    | CommentCodegenNode | IfBranchCodegenNode 
    | ForBranchCodeGenNode
    | ComponentCodegenNode

export type BaseCodegenNode = {
    type: NodeTypes,
    hosited?: string | undefined,
    hostiedDefined?: boolean,
    children?: CodegenNode[] | undefined | string,
    tagKey?: string
}

export interface RootCodeGen extends BaseCodegenNode {
    type: NodeTypes.ROOT,
    tag: 'div',
}

export interface ElementCodegenNode extends BaseCodegenNode {
    type: NodeTypes.ELEMENT,
    tag: string,
    propcodegenNode?: PropsCodegenNode,

}


export interface ComponentCodegenNode extends BaseCodegenNode {
    type: NodeTypes.COMPONENT,
    tag: string,
    propcodegenNode?: PropsCodegenNode,
    options:string, // 自定义组件导出的配置
}


export interface IfBranchCodegenNode extends BaseCodegenNode {
    type: NodeTypes.IF,
    condition: string,
    trueBranch: ElementCodegenNode,
    falseBranch?: IfBranchCodegenNode | ElementCodegenNode | ForBranchCodeGenNode | ComponentCodegenNode
}

export interface ForBranchCodeGenNode extends BaseCodegenNode {
    type: NodeTypes.FOR,
    itemName: string,
    indexName: string,
    list: string,
    item: ElementCodegenNode | ComponentCodegenNode
}


export interface TextCodegenNode extends BaseCodegenNode {
    type: NodeTypes.TEXT | NodeTypes.INTERPOLATION,
    children: string
}

export interface CommentCodegenNode extends BaseCodegenNode {
    type: NodeTypes.COMMENT,
    children: string
}

export interface PropsCodegenNode extends BaseCodegenNode {
    type: NodeTypes.PROPS,
    props: CodeGenProp[]
}

export type CodeGenProp = {
    type: NodeTypes,
    key: string,
    value: string | undefined
}

export type ElementNode = PlaiElement


export interface RootNode extends Node {
    type: NodeTypes.ROOT
    children: TemplateNode[]
    helpers: Record<string,Array<string>>
    components: any[] // 引入的组件
    imports: any[], // 引入wxs的
    methods: string[],
    data: string[],
    hoists: CodegenNode[],
    codegenNode?: any
}


export enum TagType {
    Start,
    End
}


