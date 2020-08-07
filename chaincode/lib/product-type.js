'use strict';

const State = require('./../ledger-api/state.js');

const states = {
    BLOCKED: 1,
    UNBLOCKED: 2,
};

class ProductType extends State {

    constructor(obj) {
        super(ProductType.getClass(), [obj.name]);
        Object.assign(this, obj);
    }

    getName() {
        return this.name;
    }

    isPrimary() {
        return this.type === 'primary';
    }

    isDerived() {
        return this.type === 'derived';
    }

    getProductTypeIngredientNames() {
        return this.productTypeIngredientNames;
    }

    getProductTypeIngredients() {
        return this.productTypeIngredients;
    }

    setProductTypeIngredients(productTypeIngredients) {
        this.productTypeIngredients = productTypeIngredients;
    }

    getIssuerOrgId() {
        return this.issuerOrgId;
    }

    setCurrentBlockerOrgId(blockerOrgId) {
        this.currentBlockerOrgId = blockerOrgId;
    }

    getCurrentBlockerOrgId() {
        return this.currentBlockerOrgId;
    }

    setBlocked() {
        this.currentState = states.BLOCKED;
    }

    setUnblocked() {
        this.currentState = states.UNBLOCKED;
    }

    isBlocked() {
        return this.currentState === states.BLOCKED;
    }

    isUnblocked() {
        return this.currentState === states.UNBLOCKED;
    }

    static fromBuffer(buffer) {
        return ProductType.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, ProductType);
    }

    static createInstance(name, type, productTypeIngredientNames, issuerOrgId) {
        return new ProductType({ name, type, productTypeIngredientNames, issuerOrgId});
    }

    static getClass() {
        return 'org.supplyChain.productType';
    }
}

module.exports = ProductType;