

export class MappingTransformation {

    constructor(transformation: Function)
    constructor(sourceTransformation: Function, destinationTransformation: Function)
    constructor(public transformation?: Function, public sourceTransformation?: Function, public destinationTransformation?: Function) { }
}