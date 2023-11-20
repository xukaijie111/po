import path from "path";


let fse = require('fs-extra')


const relative = require("relative");





const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|/])/;

 function isAbsolute(path) {
	return absolutePath.test(path);
}

export function relativeId(id:string,rootPath?:string) {
	if (typeof process === 'undefined' || !isAbsolute(id)) return id;
	return path.relative(rootPath || process.cwd(), id);
}



export function readFileSync(file:string):string {
    return fse.readFileSync(file,'utf-8')
}


// 查找同级其他后缀的文件
export function GetSameDirectoryFile(path: string, replace: string) {
    return path.replace(/(.*)\..+$/, function ($0, $1) {
      return `${$1}${replace}`;
    });
  }
  
  export function fileIsExist(path: string) {
    return fse.existsSync(path);
  }
  
  export function getRelativePath(src: string, dist: string) {
    let rel = relative(src, dist);
    if (!/^\./.test(rel)) rel = `./${rel}`;

    /\.ts$/.test(rel);
    rel = ignoreExt(rel);
    return rel;
  }
  

  export function getAbsPathByRelative(srcPath:string,relPath:string) {

    let context = getContext(srcPath);

    return path.resolve(context,relPath);

  }


  export function isComponentScriptFile(path: string) {
    if (!/\.(t|j)s$/.test(path)) return false;
    let is = false;
    let htmlFile = GetSameDirectoryFile(path, ".pxml");
    is = fileIsExist(htmlFile);
    if (is) return true;
    return is;
  }
  
  export function isComponentFile(path: string) {
    let jsFile = GetSameDirectoryFile(path, ".js");
    let tsFile = GetSameDirectoryFile(path, ".ts");
    let pxmlFile = GetSameDirectoryFile(path, ".pxml");
    let jsonFile = GetSameDirectoryFile(path, ".json");
    return (
      fileIsExist(jsonFile) &&
      (fileIsExist(jsFile) || fileIsExist(tsFile)) &&
      (fileIsExist(pxmlFile))
    );
  }
  
export function removeFile(path:string) {
  fse.removeSync(path);
}

  export function emitFile(path: string, code: string) {

    fse.removeSync(path);
    fse.outputFileSync(path, code);
  }


  export function getContext(path: string) {
    if (!path) return "";
    return path.replace(/(.*)\/(.+)/, function ($0, $1) {
      return $1;
    });
  }
  
  export function getBaseName(request: string) {
    return request.replace(/.*\/(.+)\..*/, "$1");
  }
  
  export function getExtName(request: string) {
    return request.replace(/.*\.(.+)/, "$1");
  }

  export function getDirectoryName(request: string) {

    return request.replace(/.*\/(.+)\/.+\..*/, "$1");
  }

  export function getFileInfo(request: string) {
    return {
      basename: getBaseName(request),
      extname: getExtName(request),
      distPath:"",
      directory:getDirectoryName(request)
    };
  }


export function isPxsFile(path: string) {
    return /\.(pxs)$/.test(path);
  }
  
  
  export function isStyleFile(path: string) {
    return isLessFile(path)
  }
  
  export function isLessFile(path: string) {
    return /\.less$/.test(path);
  }
  

  
  
  export function isTsJsFile(path: string) {
    return /\.(j|t)s$/.test(path);
  }
  
  export function isJsonFile(path: string) {
    return /\.json$/.test(path);
  }
  
  export function isTemplateFile(path: string) {
    return /\.pxml$/.test(path);
  }
  

  export function isNpmModule(path: string) {
    return /node_modules/.test(path);
  }


  export function copyFile(src:string,dest:string) {
    fse.copySync(src,dest)
  }


  export function ignoreExt(file:string) {
    let { dir , name } = path.parse(file)

    return `${dir}/${name}`
  }


  export function getJsonContent(file:string) {

    let content = fse.readFileSync(file);

    return JSON.parse(content)
  }