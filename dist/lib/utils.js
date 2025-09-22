import { InvalidInput } from "./error";
export function objectToQuery(obj, replaceKey = {}, jsonFormatItems = [], ignoreItems = []) {
    const queryStrings = [];
    for (const [key, value] of Object.entries(obj))
        if (key in obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "" && !ignoreItems.includes(key))
            queryStrings.push((key in replaceKey && !!replaceKey[key] ? replaceKey[key] : key) +
                "=" +
                (jsonFormatItems.includes(key) ? JSON.stringify(value) : value));
    return queryStrings.join("&");
}
/** v1 < v2 */
export function lt(v1, v2) {
    const v1Split = v1.split('.');
    const v2Split = v2.split('.');
    if (!v1Split.length || !v2Split.length || v1Split.length != v2Split.length)
        throw new InvalidInput();
    for (let index = 0; index < v1Split.length; index++) {
        const partV1 = parseInt(v1Split[index] || "");
        const partV2 = parseInt(v2Split[index] || "");
        if (!partV1 || !partV2)
            throw new InvalidInput();
        if (partV1 < partV2)
            return true;
        else if (partV1 > partV2)
            return false;
    }
    return false;
}
//# sourceMappingURL=utils.js.map