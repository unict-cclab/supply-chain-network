'use strict';

const State = require('./../ledger-api/state.js');

const states = {
    DISABLED: 1,
    ENABLED: 2,
};

class RuleSet extends State {

    constructor(obj) {
        super(RuleSet.getClass(), [obj.id]);
        Object.assign(this, obj);
    }

    getId() {
        return this.id;
    }

    getProductTypeId() {
        return this.productTypeId;
    }

    getValue() {
        return this.value;
    }

    setDisabled() {
        this.currentState = states.DISABLED;
    }

    setEnabled() {
        this.currentState = states.ENABLED;
    }

    isDisabled() {
        return this.currentState === states.DISABLED;
    }

    isEnabled() {
        return this.currentState === states.ENABLED;
    }

    static fromBuffer(buffer) {
        return ProductType.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, RuleSet);
    }

    static createInstance(id, productTypeId, value) {
        return new RuleSet({ id, productTypeId, value});
    }

    static getClass() {
        return 'org.supplyChain.ruleSet';
    }
}

module.exports = RuleSet;