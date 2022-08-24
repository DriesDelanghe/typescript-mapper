"use strict";
class TestParent {
    constructor(name, children, parent) {
        this.name = name;
        this.children = children;
        this.parent = parent;
    }
}
class TestChild {
    constructor(name, aliasses) {
        this.name = name;
        this.aliasses = aliasses;
    }
}
const source = {
    "name": "parent1",
    "children": [
        {
            "name": "child1"
        },
        {
            "name": "child2",
            "aliasses": [
                "foo",
                "bar"
            ]
        }
    ],
    "parent": {
        "name": "parent2",
        "children": [
            {
                "name": "child3"
            }
        ]
    }
};
const testObject = new TestParent('parent1', [
    new TestChild('child1'),
    new TestChild('child2', ['foo', 'bar'])
], new TestParent('parent2', [new TestChild('child3')]));
const mutation = () => {
    const result = Object.assign({}, source);
    console.log(result.constructor.name, result["children"] instanceof (Array));
    return result;
};
console.log(mutation() instanceof TestParent);
