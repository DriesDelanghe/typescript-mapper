import { transform } from "typescript";
import { MappingCondition } from "../models/mapping-condition"

//T = source class
//U = destination class
enum MappingDirection {
    SOURCE,
    DESTINATION
}


export abstract class MapperAbstract<T extends object, U extends object> {

    private keylessConditions: MappingCondition[] = [];
    private keyfullConditions: MappingCondition[] = [];
    private TSourceHasKeys: boolean;
    private USourceHasKeys: boolean;

    constructor(private TSource: new (...args: any) => T, private USource: new (...args: any) => U,
        conditions?: MappingCondition[]) {
        conditions?.forEach((condition) => {
            (condition.key != null ? this.keyfullConditions : this.keylessConditions).push(condition);
        })
        this.TSourceHasKeys = Object.keys(new TSource())?.length > 0;
        this.USourceHasKeys = Object.keys(new USource())?.length > 0;
    }

    mapToSource(data: T, excludedKeys?: string[]): U {
        const keys = this.USourceHasKeys ? Object.keys(new this.USource()) : Object.keys(data);
        return Object.assign(new this.USource(), this.mapObject(keys, data, MappingDirection.SOURCE, excludedKeys));
    }

    mapToDestination(data: U, excludedKeys?: string[]): T {
        const keys = this.TSourceHasKeys ? Object.keys(new this.TSource()) : Object.keys(data);
        return Object.assign(new this.TSource(), this.mapObject(keys, data, MappingDirection.DESTINATION, excludedKeys));
    }



    private mapObject(keys: string[], data: any, direction: MappingDirection, excludedKeys?: string[]): any {
        const dataObject = Object.assign(data);
        const transformedData = keys.reduce(
            (resultObject, key) => {
                const value = this.constructConditionalValue(dataObject, direction, key, excludedKeys)
                return { ...resultObject, [key]: value }
            },
            {}
        )

        if (this.keylessConditions == null || this.keylessConditions?.length === 0) {
            return transformedData
        }
        let modifiedData = this.keylessConditions.reduce(
            (resultObject, condition) => this.constructValue(resultObject, direction, condition, undefined, excludedKeys),
            transformedData)

        excludedKeys?.forEach((key) => {
            modifiedData = { ...modifiedData, [key]: null }
        });
        return { ...modifiedData }

    }

    private constructConditionalValue(data: any, direction: MappingDirection, key?: string, excludedKeys?: string[]) {
        if (key != null && excludedKeys?.includes(key)) {
            return null;
        }
        const condition = this.keyfullConditions?.find((condition) => condition.key === key)
        return this.constructValue(data, direction, condition, key, excludedKeys);
    }

    private constructValue(data: any, direction: MappingDirection, condition?: MappingCondition, key?: string, excludedKeys?: string[]) {

        if (condition != null && (!condition.condition || condition.condition(Object.assign({}, data)))) {
            if (condition.transformation.transformation != null) {
                return condition.transformation.transformation(key != null ? data[key] : Object.assign({}, data))
            }
            if (direction === MappingDirection.SOURCE && condition.transformation.sourceTransformation != null) {
                return condition.transformation.sourceTransformation(key != null ? data[key] : Object.assign({}, data))
            }
            if (direction === MappingDirection.DESTINATION && condition.transformation.destinationTransformation != null) {
                return condition.transformation.destinationTransformation(key != null ? data[key] : Object.assign({}, data))
            }
        }
        return key != null ? data[key] : data
    }
}