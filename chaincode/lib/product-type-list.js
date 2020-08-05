'use strict';

const StateList = require('./../ledger-api/state-list');

const ProductType = require('./product-type');

class ProductTypeList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.supplyChain.productTypeList');
        this.use(ProductType);
    }

    async addProductType(productType) {
        return this.addState(productType);
    }

    async getProductType(productTypeKey) {
        return this.getState(productTypeKey);
    }

    async updateProductType(productType) {
        return this.updateState(productType);
    }
}


module.exports = ProductTypeList;