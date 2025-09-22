export declare function objectToQuery<Object extends Record<any, any> = Record<string, any>>(obj: Object, replaceKey?: Partial<Record<keyof Object, string>>, jsonFormatItems?: (keyof Object)[], ignoreItems?: (keyof Object)[]): string;
/** v1 < v2 */
export declare function lt(v1: string, v2: string): boolean;
