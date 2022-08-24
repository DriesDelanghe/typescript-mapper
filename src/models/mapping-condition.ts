import { MappingTransformation } from "./mapping-tranformation";


export class MappingCondition {

    constructor(
        public transformation: MappingTransformation,
        public key?: string,
        public condition?: Function,
    ) { }

}