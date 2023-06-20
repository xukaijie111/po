

export const isArray = Array.isArray



let toString = Object.prototype.toString
export const isPlainObject = (val: unknown): val is object =>
    toString.call(val) === '[object Object]' || toString.call(val) === '[object Array]'


export const isObject = (value: any) => {
    if (value === null || toString.call(value) !== '[object Object]') return false
    return true
}



const hasOwnProperty = Object.prototype.hasOwnProperty

export function hasOwn(obj: any, key: string | number) {
    return hasOwnProperty.call(obj, key)
}


export function isFunction(val: any): boolean {
    return typeof val === 'function';
}



export function isNil(value: any) {
    return value === undefined || value === null
}


export function readPropFromProto(source: any, prop: PropertyKey) {
	const desc = getDescriptorFromProto(source, prop)
	return desc
		? `value` in desc
			? desc.value
			: 
			  desc.get?.call(source)
		: undefined
}

export function getDescriptorFromProto(
	source: any,
	prop: PropertyKey
): PropertyDescriptor | undefined {
	if (!(prop in source)) return undefined
	let proto = Object.getPrototypeOf(source)
	while (proto) {
		const desc = Object.getOwnPropertyDescriptor(proto, prop)
		if (desc) return desc
		proto = Object.getPrototypeOf(proto); // 父级查找
	}
	return undefined
}


export function isEmptyObject (obj) {
	if (!obj) {
	  return true
	}
	for (let key in obj) {
	  return false
	}
	return true
  }



export function deepArrayEqual(prev:Array<any>, next:Array<any>) {
	const prevLen = prev.length;
	const nextLen = next.length;
	if (prevLen !== nextLen) return false;
	for (var i = 0; i < prevLen; i++) {
	  const prevValue = prev[i];
	  const nextValue = next[i];
	  if (!deepEqual(prevValue, nextValue)) return false;
	}
	return true;
  }
  
  export function deepObjectEqual(prev:Record<any,any>, next:Record<any,any>) {
	const prevKeys = Object.keys(prev);
	const nextKeys = Object.keys(next);
	if (prevKeys.length !== nextKeys.length) return false;
  
	for (var key in prev) {
	  if (!hasOwnProperty.call(next, key)) return false;
	  const prevValue = prev[key];
	  const nextValue = next[key];
	  if (!deepEqual(prevValue, nextValue)) return false;
	}
  
	return true;
  }
  
  // 是否相等
  export function deepEqual(prev:any, next:any) {
	const prevTag = toString.call(prev);
	const nextTag = toString.call(next);
	if (prevTag !== nextTag) return false;
	if (isArray(prev)) {
	  return deepArrayEqual(prev, next);
	}
	if (isObject(prev)) {
	  return deepObjectEqual(prev, next);
	}
	return prev === next;
  }


  export function fill(source:any, name:string, replacement:any) {
	const original = source[name];
	const wrapped = replacement(original);
  
	source[name] = wrapped;
  }



export function getDataByPath(value: Record<string, any>, path: string) {
	let paths = path.split(".");
  
	let data: any = value;

	for (let key of paths) {
		try {
			data = data[key];
		} catch (error) {
			return undefined
		}
	}
  
  
	return data;
  }