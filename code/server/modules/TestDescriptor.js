"use strict";

class TestDescriptor {
    constructor(
        id,
        name,
        procedureDescription,
        SKUID
    ) {
        this.id = id;
        this.name = name;
        this.procedureDescription = procedureDescription;
        this.SKUID = SKUID;
    }

    toJson() {
        return {
            id: this.id,
            name: this.name,
            procedureDescription: this.procedureDescription,
            idSKU: this.SKUID
        }
    } 

}

module.exports = TestDescriptor;