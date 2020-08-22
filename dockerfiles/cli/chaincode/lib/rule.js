'use strict';

const State = require('../ledger-api/state.js');

const states = {
    DISABLED: 1,
    ENABLED: 2,
};

class Rule extends State {

    constructor(obj) {
        super(Rule.getClass(), [obj.id]);
        Object.assign(this, obj);
    }

    getId() {
        return this.id;
    }

    getProductTypeName() {
        return this.productTypeName;
    }

    getJsonValue() {
        return this.jsonValue;
    }

    getIssuerOrgId() {
        return this.issuerOrgId;
    }

    getCurrentDisablerOrgId() {
        return this.currentDisablerOrgId;
    }

    setCurrentDisablerOrgId(currentDisablerOrgId) {
        this.currentDisablerOrgId = currentDisablerOrgId;
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

    static createInstance(id, productTypeName, jsonValue, issuerOrgId) {
        return new Rule({ id, productTypeName, jsonValue, issuerOrgId});
    }

    static getClass() {
        return 'org.supplyChain.rule';
    }
}

module.exports.Rule = Rule;
module.exports.ruleStates = states;