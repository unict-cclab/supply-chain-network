'use strict';

const StateList = require('./../ledger-api/state-list');

const Product = require('./product');

class ProductList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.supplyChain.productList');
        this.use(Product);
    }

    async addProduct(product) {
        return this.addState(product);
    }

    async getProduct(productKey) {
        return this.getState(productKey);
    }

    async updateProduct(product) {
        return this.updateState(product);
    }

    async getProductsByProductTypeName(productTypeName) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.class = Product.getClass();
        queryString.selector.productTypeName = productTypeName;
        return this.getStatesForQueryString(JSON.stringify(queryString));
    }

    async getAllProducts() {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.class = Product.getClass();
        return this.getStatesForQueryString(JSON.stringify(queryString));
    }
}


module.exports = ProductList;