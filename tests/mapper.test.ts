import { MapperAbstract } from "../src/abstracts/mapper.abstract";
import { MappingCondition } from "../src/models/mapping-condition";
import { MappingTransformation } from "../src/models/mapping-tranformation";

class TestObject {
    constructor(public title: string, public values: string[], public otherObject?: TestObject, public optionalValue?: string) { }
}

class TestMapper extends MapperAbstract<object, TestObject> {
    constructor() { super(Object, TestObject) }
}

let sut: any;
const mockObject: any = { title: "me", values: ['myself', 'I'] };
const mockClassObject = new TestObject("me", ["myself", "I"], new TestObject("you", ["yourself"]), "available");


describe("AbstractMapper mapToSource", () => {
    beforeEach(() => {
        sut = new TestMapper();
    })
    it("mapToSource should return source type", () => {
        const result = sut.mapToSource(mockObject, []);
        expect(result).toHaveProperty("title", "me");
        expect(result).toHaveProperty("values", ["myself", "I"]);
        expect(result).toHaveProperty("optionalValue");
        expect(result).toHaveProperty("otherObject", undefined);
    })

    it("mapToSource with excluded keys should not contain keys", () => {
        const result = sut.mapToSource(mockObject, ["title"])
        expect(result).toHaveProperty("title", null);
        expect(result).toHaveProperty("values", ["myself", "I"]);
        expect(result).toHaveProperty("optionalValue");
        expect(result).toHaveProperty("otherObject", undefined);
    })
})


describe("AbstractMapper mapToDestination", () => {
    it("mapToDestination should return source type", () => {
        const result = sut.mapToDestination(mockClassObject);
        expect(result).toHaveProperty("title", "me");
        expect(result).toHaveProperty("values", ["myself", "I"]);
        expect(result).toHaveProperty("optionalValue", "available");
        expect(result).toHaveProperty("otherObject");
        expect(result).toHaveProperty("otherObject.title", "you");
        expect(result).toHaveProperty("otherObject.values", ["yourself"]);
    })

    it("mapToDestination with excluded keys should not contain keys", () => {
        const result = sut.mapToDestination(mockClassObject, ["title"])
        expect(result).toHaveProperty("title", null);
        expect(result).toHaveProperty("values", ["myself", "I"])
        expect(result).toHaveProperty("optionalValue", "available")
        expect(result).toHaveProperty("otherObject");
        expect(result).toHaveProperty("otherObject.title", "you");
        expect(result).toHaveProperty("otherObject.values", ["yourself"]);
    })
})

class KeyfullConditionalTestMapper extends MapperAbstract<object, TestObject> {
    constructor() {
        super(Object, TestObject, [
            new MappingCondition(new MappingTransformation(() => "John"), "title", (root: any) => root.values?.includes("Snow")),
            new MappingCondition(new MappingTransformation((value: any) => ({ title: "Jeff", values: ["goldbloom"] })), "otherObject")
        ])
    }
}

describe("AbstractMapper mapToSource with conditions", () => {
    beforeEach(() => {
        sut = new KeyfullConditionalTestMapper();
    })
    it("mapToSource should return source type", () => {
        const result = sut.mapToSource(mockObject, []);
        expect(result).toHaveProperty("title", "me");
        expect(result).toHaveProperty("values", ["myself", "I"]);
        expect(result).toHaveProperty("optionalValue");
        expect(result).toHaveProperty("otherObject.title", "Jeff");
        expect(result).toHaveProperty("otherObject.values", ["goldbloom"]);
    })

    it("mapToSource with excluded keys should not contain keys", () => {
        const result = sut.mapToSource(mockObject, ["title"])
        expect(result).toHaveProperty("title", null);
        expect(result).toHaveProperty("values", ["myself", "I"]);
        expect(result).toHaveProperty("optionalValue");
        expect(result).toHaveProperty("otherObject.title", "Jeff");
        expect(result).toHaveProperty("otherObject.values", ["goldbloom"]);
    })

    it("mapToSource with matching condition", () => {
        const result = sut.mapToSource({ ...mockObject, values: [...mockObject.values, "Snow"] })
        expect(result).toHaveProperty("title", "John");
        expect(result).toHaveProperty("values", ["myself", "I", "Snow"]);
        expect(result).toHaveProperty("optionalValue");
        expect(result).toHaveProperty("otherObject.title", "Jeff");
        expect(result).toHaveProperty("otherObject.values", ["goldbloom"]);
    })

    it("mapToSource exclude overwrites condition", () => {
        const result = sut.mapToSource({ ...mockObject, values: [...mockObject.values, "Snow"] }, ["title"])
        expect(result).toHaveProperty("title", null);
        expect(result).toHaveProperty("values", ["myself", "I", "Snow"]);
        expect(result).toHaveProperty("optionalValue");
        expect(result).toHaveProperty("otherObject.title", "Jeff");
        expect(result).toHaveProperty("otherObject.values", ["goldbloom"]);
    })
})

describe("AbstractMapper mapToDestionation with conditions", () => {
    beforeEach(() => {
        sut = new KeyfullConditionalTestMapper();
    })
    it("mapToSource should return source type", () => {
        const result = sut.mapToDestination(mockClassObject, []);
        expect(result).toHaveProperty("title", "me");
        expect(result).toHaveProperty("values", ["myself", "I"]);
        expect(result).toHaveProperty("optionalValue");
        expect(result).toHaveProperty("otherObject.title", "Jeff");
        expect(result).toHaveProperty("otherObject.values", ["goldbloom"]);
    })

    it("mapToSource with excluded keys should not contain keys", () => {
        const result = sut.mapToDestination(mockClassObject, ["title"])
        expect(result).toHaveProperty("title", null);
        expect(result).toHaveProperty("values", ["myself", "I"]);
        expect(result).toHaveProperty("optionalValue");
        expect(result).toHaveProperty("otherObject.title", "Jeff");
        expect(result).toHaveProperty("otherObject.values", ["goldbloom"]);
    })

    it("mapToSource with matching condition", () => {
        const result = sut.mapToDestination(new TestObject("me", ["myself", "I", "Snow"], new TestObject("you", ["yourself"]), "available"))
        expect(result).toHaveProperty("title", "John");
        expect(result).toHaveProperty("values", ["myself", "I", "Snow"]);
        expect(result).toHaveProperty("optionalValue");
        expect(result).toHaveProperty("otherObject.title", "Jeff");
        expect(result).toHaveProperty("otherObject.values", ["goldbloom"]);
    })

    it("mapToSource exclude overwrites condition", () => {
        const result = sut.mapToDestination(new TestObject("me", ["myself", "I", "Snow"], new TestObject("you", ["yourself"]), "available"), ["title"])
        expect(result).toHaveProperty("title", null);
        expect(result).toHaveProperty("values", ["myself", "I", "Snow"]);
        expect(result).toHaveProperty("optionalValue");
        expect(result).toHaveProperty("otherObject.title", "Jeff");
        expect(result).toHaveProperty("otherObject.values", ["goldbloom"]);
    })
})


class KeylessConditionalTestMapper extends MapperAbstract<any, TestObject> {
    constructor() {
        super(Object, TestObject, [
            new MappingCondition(new MappingTransformation((root: any) => ({ ...root, title: "John" })), undefined, (root: any) => root.values?.includes("Snow")),
            new MappingCondition(new MappingTransformation((root: any) => {
                return ({ ...root, optionalValue: "updated" })
            }))
        ])
    }
}

describe("AbstractMapper mapToSource with keyless conditions", () => {
    beforeEach(() => {
        sut = new KeylessConditionalTestMapper();
    })
    it("mapToSource should return source type", () => {
        const result = sut.mapToSource(mockObject, []);
        expect(result).toHaveProperty("title", "me");
        expect(result).toHaveProperty("values", ["myself", "I"]);
        expect(result).toHaveProperty("optionalValue", "updated");
    })

    it("mapToSource with excluded keys should not contain keys", () => {
        const result = sut.mapToSource(mockObject, ["title"])
        expect(result).toHaveProperty("title", null);
        expect(result).toHaveProperty("values", ["myself", "I"]);
        expect(result).toHaveProperty("optionalValue", "updated");
    })

    it("mapToSource with matching condition", () => {
        const result = sut.mapToSource({ ...mockObject, values: [...mockObject.values, "Snow"] })
        expect(result).toHaveProperty("title", "John");
        expect(result).toHaveProperty("values", ["myself", "I", "Snow"]);
        expect(result).toHaveProperty("optionalValue", "updated");
    })

    it("mapToSource exclude overwrites condition", () => {
        const result = sut.mapToSource({ ...mockObject, values: [...mockObject.values, "Snow"] }, ["title"])
        expect(result).toHaveProperty("title", null);
        expect(result).toHaveProperty("values", ["myself", "I", "Snow"]);
        expect(result).toHaveProperty("optionalValue", "updated");
    })
})

describe("AbstractMapper mapToDestination with keyless conditions", () => {
    beforeEach(() => {
        sut = new KeylessConditionalTestMapper();
    })
    it("mapToSource should return source type", () => {
        const result = sut.mapToDestination(mockClassObject, []);
        expect(result).toHaveProperty("title", "me");
        expect(result).toHaveProperty("values", ["myself", "I"]);
        expect(result).toHaveProperty("optionalValue", "updated");
        expect(result).toHaveProperty("otherObject.title", "you");
        expect(result).toHaveProperty("otherObject.values", ["yourself"]);

    })

    it("mapToSource with excluded keys should not contain keys", () => {
        const result = sut.mapToDestination(mockClassObject, ["title"])
        expect(result).toHaveProperty("title", null);
        expect(result).toHaveProperty("values", ["myself", "I"]);
        expect(result).toHaveProperty("optionalValue", "updated");
        expect(result).toHaveProperty("otherObject.title", "you");
        expect(result).toHaveProperty("otherObject.values", ["yourself"]);

    })

    it("mapToSource with matching condition", () => {
        const result = sut.mapToDestination(new TestObject("me", ["myself", "I", "Snow"], new TestObject("you", ["yourself"]), "available"))
        expect(result).toHaveProperty("title", "John");
        expect(result).toHaveProperty("values", ["myself", "I", "Snow"]);
        expect(result).toHaveProperty("optionalValue"), "updated";
        expect(result).toHaveProperty("otherObject.title", "you");
        expect(result).toHaveProperty("otherObject.values", ["yourself"]);

    })

    it("mapToSource exclude overwrites condition", () => {
        const result = sut.mapToDestination(new TestObject("me", ["myself", "I", "Snow"], new TestObject("you", ["yourself"]), "available"), ["title"])
        expect(result).toHaveProperty("title", null);
        expect(result).toHaveProperty("values", ["myself", "I", "Snow"]);
        expect(result).toHaveProperty("optionalValue", "updated");
        expect(result).toHaveProperty("otherObject.title", "you");
        expect(result).toHaveProperty("otherObject.values", ["yourself"]);
    })
})