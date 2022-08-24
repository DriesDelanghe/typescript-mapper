"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapperAbstract = void 0;
//T = source class
//U = destination class
class MapperAbstract {
    mapToSource(data, exludeKeys) {
        const source = Object.assign({}, data);
        return source;
    }
}
exports.MapperAbstract = MapperAbstract;
