'use strict';

const StateList = require('./../ledger-api/state-list');

const Batch = require('./batch');

class BatchList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.supplyChain.batchList');
        this.use(Batch);
    }

    async addBatch(batch) {
        return this.addState(batch);
    }

    async getBatch(batchKey) {
        return this.getState(batchKey);
    }

    async updateBatch(batch) {
        return this.updateState(batch);
    }

    async getBatchesByProductName(productName) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.class = Batch.getClass();
        queryString.selector.productName = productName;
        return this.getStatesForQueryString(JSON.stringify(queryString));
    }

    async getBatchHistory(batchKey) {
        return this.getStateHistory(batchKey);
    }

    async getAllBatches() {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.class = Batch.getClass();
        return this.getStatesForQueryString(JSON.stringify(queryString));
    }
}


module.exports = BatchList;