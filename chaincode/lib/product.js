'use strict';

const State = require('./../ledger-api/state.js');

const states = {
    PENDING: 1,
    UNBLOCKED: 2,
    PRODUCTBLOCKED: 3,
    PRODUCTTYPEBLOCKED: 4,
    PRODUCTANDPRODUCTTYPEBLOCKED: 5,
    REFUSED: 6,
};

class Product extends State {

    constructor(obj) {
        super(Product.getClass(), [obj.name]);
        Object.assign(this, obj);
    }

    getName() {
        return this.name;
    }

    getProductTypeName() {
        return this.productTypeName;
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
    
    setApproverOrgId(approverOrgId) {
        this.approverOrgId = approverOrgId;
    }

    getApproverOrgId() {
        return this.approverOrgId;
    }

    setRefuserOrgId(refuserOrgId) {
        this.refuserOrgId = refuserOrgId;
    }

    getRefuserOrgId() {
        return this.refuserOrgId;
    }

    setPending() {
        this.currentState = states.PENDING;
    }

    setUnblocked() {
        this.currentState = states.UNBLOCKED;
    }

    setProductBlocked() {
        this.currentState = states.PRODUCTBLOCKED;
    }

    setProductTypeBlocked() {
        this.currentState = states.PRODUCTTYPEBLOCKED;
    }

    setProductAndProductTypeBlocked() {
        this.currentState = states.PRODUCTANDPRODUCTTYPEBLOCKED;
    }
    
    setRefused(){
        this.currentState = states.REFUSED;
    }

    isPending() {
        return this.currentState === states.PENDING;
    }

    isUnblocked() {
        return this.currentState === states.UNBLOCKED;
    }

    isProductBlocked() {
        return this.currentState === states.PRODUCTBLOCKED;
    }

    isProductTypeBlocked() {
        return this.currentState === states.PRODUCTTYPEBLOCKED;
    }

    isProductAndProductTypeBlocked() {
        return this.currentState === states.PRODUCTANDPRODUCTTYPEBLOCKED;
    }

    isRefused() {
        return this.currentState === states.REFUSED;
    }

    blockProductType(blockerOrgId) {
        if(this.isPending()){
            this.setRefused();
            this.setRefuserOrgId(blockerOrgId);
            return;
        }
        if(this.isUnblocked()){
            this.setProductTypeBlocked();
        }
        else if(this.isProductBlocked())
            this.setProductAndProductTypeBlocked();
    }

    unblockProductType() {
        if(this.isProductTypeBlocked()){
            this.setUnblocked();
        }
        if(this.isProductAndProductTypeBlocked())
            this.setProductBlocked();
    }

    blockProduct(blockerOrgId) {
        if(this.isPending()){
            this.setRefused();
            this.setRefuserOrgId(blockerOrgId);
            return;
        }
        if(this.isUnblocked()){
            this.setProductBlocked();
            this.setCurrentBlockerOrgId(blockerOrgId);
        }
    }

    unblockProduct() {
        if(this.isProductBlocked()){
            this.setUnblocked();
            this.setCurrentBlockerOrgId(null);
        }
        if(this.isProductAndProductTypeBlocked()){
            this.setProductTypeBlocked();
            this.setCurrentBlockerOrgId(null);
        }
    }

    static fromBuffer(buffer) {
        return Product.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, Product);
    }

    static createInstance(name, productTypeName, issuerOrgId) {
        return new Product({ name, productTypeName, issuerOrgId});
    }

    static getClass() {
        return 'org.supplyChain.product';
    }
}

module.exports = Product;