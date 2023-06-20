
import {
    isObject,
    hasOwn
} from './object'

export function diffAndClone(a: any, b: any) {
    let diffData = null;
    let curPath = "";
    let diff = false;
  
    function deepdiffAndClone(a: any, b: any, currentDiff: any) {
      const setDiff = (val) => {
        if (val) {
          currentDiff = val;
          if (curPath) {
            diffData = diffData || {};
            diffData[curPath] = clone;
          }
        }
      };
      let clone = a;
      if (typeof a !== "object" || a === null) {
        if (!currentDiff) setDiff(a !== b);
      } else {
        const toString = Object.prototype.toString;
        const className = toString.call(a);
        const sameClass = className === toString.call(b);
        let length;
        let lastPath;
        if (isObject(a)) {
          const keys = Object.keys(a);
          length = keys.length;
          clone = {};
          if (!currentDiff)
            setDiff(
              !sameClass ||
                length < Object.keys(b).length ||
                !Object.keys(b).every((key) => hasOwn(a, key))
            );
          lastPath = curPath;
          for (let i = 0; i < length; i++) {
            const key = keys[i];
            curPath += `.${key}`;
            clone[key] = deepdiffAndClone(
              a[key],
              sameClass ? b[key] : undefined,
              currentDiff
            );
            curPath = lastPath;
          }
          // 继承原始对象的freeze/seal/preventExtensions操作
          if (Object.isFrozen(a)) {
            Object.freeze(clone);
          } else if (Object.isSealed(a)) {
            Object.seal(clone);
          } else if (!Object.isExtensible(a)) {
            Object.preventExtensions(clone);
          }
        } else if (Array.isArray(a)) {
          length = a.length;
          clone = [];
          if (!currentDiff) setDiff(!sameClass || length < b.length);
          lastPath = curPath;
          for (let i = 0; i < length; i++) {
            curPath += `[${i}]`;
            clone[i] = deepdiffAndClone(
              a[i],
              sameClass ? b[i] : undefined,
              currentDiff
            );
            curPath = lastPath;
          }
          // 继承原始数组的freeze/seal/preventExtensions操作
          if (Object.isFrozen(a)) {
            Object.freeze(clone);
          } else if (Object.isSealed(a)) {
            Object.seal(clone);
          } else if (!Object.isExtensible(a)) {
            Object.preventExtensions(clone);
          }
        } else if (a instanceof RegExp) {
          if (!currentDiff) setDiff(!sameClass || "" + a !== "" + b);
        } else if (a instanceof Date) {
          if (!currentDiff) setDiff(!sameClass || +a !== +b);
        } else {
          if (!currentDiff) setDiff(!sameClass || a !== b);
        }
      }
      if (currentDiff) {
        diff = currentDiff;
      }
      return clone;
    }
  
    return {
      clone: deepdiffAndClone(a, b, diff),
      diff,
      diffData,
    };
  }