import { Base } from "./base";

import postcss from "postcss";
import postcssLess from "postcss-less";

import less from "less";
import { createResolver } from "@po/cjs-utils";
import { RUNTIME_JSCORE_NPM } from "@po/shared";

let lessImportReg = /(?<!(?:\/\/|\/\*)\s*)@import\s+(["'][a-z0-9./\-_@]+(\.(less|scss))?(["'].*))/gi;


export class StyleModule extends Base {


    imports: string[] = []

    init() {
        this.resolver = createResolver({
            extensions:['.less'],
            alias:this.compilation.getAlias() || {}
        })
        this.dist = this.dist.replace(/\.less/, '.less.js')
    }


    async load(): Promise<void> {
        await super.load()
        this.parseImports();
    }



    async transform(): Promise<void> {
        let { code } = this

        let plugin = postcss.plugin("process", () => {
            return (root) => {
                root.walkDecls((node) => {
                    // rpx->px
                    let pxReg = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)px/g;
                    if (!node.value.includes("rpx")) return;
                    node.value = node.value.replace(pxReg, (m, $1) => {
                        if (!$1) return m;
                        return parseFloat($1) ? `${$1}px` : "0px"; // 转换*1
                    });
                });

            };
        });

        let res = await postcss([plugin()]).process(code, {
            from: undefined,
            syntax: postcssLess
        });

        this.code = res.css
    }


    async generate(): Promise<void> {
        let { code,imports } = this;
        let res;

        let reg = lessImportReg;
        reg.lastIndex = 0;
        let matches = code.match(reg);
        if (matches) {
            matches.forEach((match) => {
                /* eslint-disable-next-line */
                code = code.replace(match, function ($0, $1) {
                    reg.lastIndex = 0;
                    /* eslint-disable-next-line */
                    return $0.replace(reg, function ($0, $1) {
                        return `@import (reference) ${$1}`;
                    });
                });
            });
        }

        try {
            res = await less.render(code, { filename: undefined, compress: true });
        } catch (err) {
            console.error(err);
            throw new Error(err);
        }

        let currentCode = ""

        imports.forEach((file) => {

            let rel = this.compilation.getDistRelativePath(this.dist,file)
            currentCode += `import ${rel};\n`

        })


        this.code = `
        import { injectStyle } from "${RUNTIME_JSCORE_NPM};"
        ${currentCode}
            let style = "${res.css}";
            injectStyle(style,"${this.shareInfo? this.shareInfo.id : this.id}")
        `
    }



    async parseImports() {

        let { code } = this
        let plugin = postcss.plugin('findDependency', () => {
            return (root, result) => {
                root.walkAtRules((rule) => {
                    if (rule.name === 'import') {
                        let relPath = rule.params;
                        relPath = relPath.replace(/(?:\'|\")(.*)(?:\'|\")/, '$1'); // 这个婆解析，把引号都拿来了

                        let absPath = this.resolver(this.context,relPath) as string;
                        this.imports.push(absPath)
                        this.compilation.createModule(absPath)
                    }
                });
            };
        });

        await postcss([plugin()]).process(code, { from: undefined, syntax: postcssLess });

    }





}