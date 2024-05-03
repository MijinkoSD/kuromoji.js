/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

import Tokenizer from "./Tokenizer";
import BrowserDictionaryLoader from "./loader/BrowserDictionaryLoader";
import NodeDictionaryLoader from "./loader/NodeDictionaryLoader";

export interface TokenizerBuilderOption {
  dicPath?: string;
}

/**
 * Callback used by build
 * @callback TokenizerBuilder~onLoad
 * @param {Object} err Error object
 * @param {Tokenizer} tokenizer Prepared Tokenizer
 */
export type TokenizerBuilderOnLoad = (
  err: (Error | null)[],
  tokenizer?: Tokenizer
) => void;

class TokenizerBuilder {
  dic_path: string;

  /**
   * TokenizerBuilder create Tokenizer instance.
   * @param {Object} option JSON object which have key-value pairs settings
   * @param {string} option.dicPath Dictionary directory path (or URL using in browser)
   * @constructor
   */
  constructor(option: TokenizerBuilderOption = {}) {
    if (option.dicPath == null) {
      this.dic_path = "dict/";
    } else {
      this.dic_path = option.dicPath;
    }
  }

  /**
   * Build Tokenizer instance by asynchronous manner
   * @param {TokenizerBuilder~onLoad} callback Callback function
   */
  async build(callback: TokenizerBuilderOnLoad) {
    const loader = new NodeDictionaryLoader(this.dic_path);
    await loader.load((err, dic) => {
      callback(toErrorArray(err), new Tokenizer(dic));
    });
  }

  async buildBrowser(callback: TokenizerBuilderOnLoad) {
    const loader = new BrowserDictionaryLoader(this.dic_path);
    await loader.load((err, dic) => {
      callback(toErrorArray(err), new Tokenizer(dic));
    });
  }
}

/**
 * To convert an object to an array of error objects.
 * オブジェクトをエラーオブジェクト配列に変換します。
 *
 * I said "To convert", but it works well only from error object or string type.
 * 変換するとは言ってもエラーオブジェクトか文字列しかうまく変換できないけれど。
 *
 * @param obj オブジェクト
 * @returns
 */
const toErrorArray = (obj: Object | null): (Error | null)[] => {
  let _obj: (Object | null)[];
  if (Array.isArray(obj)) {
    _obj = obj;
  } else {
    _obj = [obj];
  }
  const result: (Error | null)[] = [];
  for (const o of _obj) {
    if (o instanceof Error || o === null) {
      result.push(o);
    } else if (typeof o === "string") {
      result.push(new Error(o));
    } else {
      result.push(new Error("unknown error object recieved."));
    }
  }
  return result;
};

export default TokenizerBuilder;
