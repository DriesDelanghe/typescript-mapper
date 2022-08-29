import { MappingCondition } from "../models/mapping-condition"

enum MappingDirection {
    SOURCE,
    DESTINATION
}
/**
 * @param T source class
 * @param U destination class
 */
//T = source class
//U = destination class
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
            (resultObject, condition) => this.constructValue(resultObject, direction, condition),
            data)

        let result = { ...transformedData, ...modifiedData }

        excludedKeys?.forEach((key) => {
            result = { ...result, [key]: null }
        });
        console.log(JSON.stringify(result, null, 2))
        return { ...result }

    }

    private constructConditionalValue(data: any, direction: MappingDirection, key?: string, excludedKeys?: string[]): U | T | null {
        if (key != null && excludedKeys?.includes(key)) {
            return null;
        }
        const condition = this.keyfullConditions?.find((condition) => condition.key === key)
        return this.constructValue(data, direction, condition, key);
    }

    private constructValue(data: any, direction: MappingDirection, condition?: MappingCondition, key?: string) {

        if (condition != null && (!condition.condition || condition.condition(Object.assign({}, data)))) {
            console.log("running transformation using conditional")
            if (condition.transformation.transformation != null) {
                console.log("running basic transformation")
                return condition.transformation.transformation(key != null ? data[key] : Object.assign({}, data))
            }
            if (direction === MappingDirection.SOURCE && condition.transformation.sourceTransformation != null) {
                console.log("executing source transformation")
                const result = condition.transformation.sourceTransformation(key != null ? data[key] : Object.assign({}, data))
                console.log("result", result)
                return result
            }
            if (direction === MappingDirection.DESTINATION && condition.transformation.destinationTransformation != null) {
                console.log("executing destination transformation")
                return condition.transformation.destinationTransformation(key != null ? data[key] : Object.assign({}, data))
            }
        }
        console.log("returning unmodified data")
        return key != null ? data[key] : data
    }
}