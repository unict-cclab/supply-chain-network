'use strict';

const State = require('./../ledger-api/state.js');

const states = {
    UNBLOCKED: 1,
    BATCHBLOCKED: 2,
    PRODUCTBLOCKED: 3,
    BATCHANDPRODUCTBLOCKED: 4,
    PENDING: 5,
    PROCESSED: 6,
};

class Batch extends State {

    constructor(obj) {
        super(Batch.getClass(), [obj.id]);
        Object.assign(this, obj);
    }

    getId() {
        return this.id;
    }

    getProductName() {
        return this.productName;
    }

    getProduct() {
        return this.product;
    }

    setProduct(product) {
        this.product = product; 
    }

    setCurrentOwnerOrgId(currentOwnerOrgId) {
        this.currentOwnerOrgId = currentOwnerOrgId;
    }

    getCurrentOwnerOrgId() {
        return this.currentOwnerOrgId;
    }

    setCurrentBlockerOrgId(blockerOrgId) {
        this.currentBlockerOrgId = blockerOrgId;
    }

    getCurrentBlockerOrgId() {
        return this.currentBlockerOrgId;
    }

    setCurrentReceiverOrgId(receiverOrgId) {
        this.currentReceiverOrgId = receiverOrgId;
    }

    getCurrentReceiverOrgId() {
        return this.currentReceiverOrgId;
    }

    getBatchIngredientIds() {
        return this.batchIngredientIds;
    }

    getParams() {
        return this.params;
    }

    getBatchIngredients() {
        return this.batchIngredients;
    }

    setBatchIngredients(batchIngredients) {
        this.batchIngredients = batchIngredients;
    }

    setOutputBatchId(outputBatchId) {
        this.outputBatchId = outputBatchId;
    }

    getOutputBatchId() {
        return this.outputBatchId;
    }

    setUnblocked() {
        this.currentState = states.UNBLOCKED;
    }

    setBatchBlocked() {
        this.currentState = states.BATCHBLOCKED;
    }

    setProductBlocked() {
        this.currentState = states.PRODUCTBLOCKED;
    }

    setBatchAndProductBlocked() {
        this.currentState = states.BATCHANDPRODUCTBLOCKED;
    }

    setPending() {
        this.currentState = states.PENDING;
    }

    setProcessed() {
        this.currentState = states.PROCESSED;
    }

    isUnblocked() {
        return this.currentState === states.UNBLOCKED;
    }

    isBatchBlocked() {
        return this.currentState === states.BATCHBLOCKED;
    }

    isProductBlocked() {
        return this.currentState === states.PRODUCTBLOCKED;
    }

    isBatchAndProductBlocked() {
        return this.currentState === states.BATCHANDPRODUCTBLOCKED;
    }

    isPending() {
        return this.currentState === states.PENDING;
    }

    isProcessed() {
        return this.currentState === states.PROCESSED;
    }

    blockProduct() {
        if(this.isPending()){
            this.setProductBlocked();
            this.setCurrentReceiverOrgId(null);
        }
        if(this.isUnblocked()){
            this.setProductBlocked();
        }
        else if(this.isBatchBlocked())
            this.setBatchAndProductBlocked();
    }

    unblockProduct() {
        if(this.isProductBlocked()){
            this.setUnblocked();
        }
        if(this.isBatchAndProductBlocked())
            this.setBatchBlocked();
    }

    blockBatch(blockerOrgId) {
        if(this.isPending()){
            this.setBatchBlocked();
            this.setCurrentBlockerOrgId(blockerOrgId);
            this.setCurrentReceiverOrgId(null);
        }
        if(this.isUnblocked()){
            this.setBatchBlocked();
            this.setCurrentBlockerOrgId(blockerOrgId);
        }
    }

    unblockBatch() {
        if(this.isBatchBlocked()){
            this.setUnblocked();
            this.setCurrentBlockerOrgId(null);
        }
        if(this.isBatchAndProductBlocked()){
            this.setProductBlocked();
            this.setCurrentBlockerOrgId(null);
        }
    }

    static fromBuffer(buffer) {
        return Batch.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, Batch);
    }

    static createInstance(id, productName, batchIngredientIds, params) {
        return new Batch({ id, productName, batchIngredientIds, params});
    }

    static getClass() {
        return 'org.supplyChain.batch';
    }
}

module.exports = Batch;
