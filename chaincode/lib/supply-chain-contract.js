'use strict';

const { Contract, Context } = require('fabric-contract-api');

const RoleSet = require('./role-set');
const RoleSetList = require('./role-set-list');
const ProductType = require('./product-type');
const ProductTypeList = require('./product-type-list');
const Rule = require('./rule');
const RuleList = require('./rule-list');
const Product = require('./product');
const ProductList = require('./product-list');
const Batch = require('./batch');
const BatchList = require('./batch-list');
const RuleEngine = require('./rule-engine');

async function validateRulesForBatch(ctx, batch){

    let batchIngredients = [];

    for (let batchIngredientId of batch.getBatchIngredientIds()){
        let batchIngredient = await getBatch(ctx, batchIngredientId);
        batchIngredients.push(batchIngredient);
    }

    batch.setBatchIngredients(batchIngredients);

    let product = await getProduct(ctx, batch.getProductName());
    batch.setProduct(product);

    let rules = await ctx.ruleList.getEnabledRulesByProductTypeName(product.getProductTypeName());

    for (let rule of rules){
        if(!RuleEngine.verifyJsonRule(rule.getJsonValue(), batch))
            return false;
    }

    return true;
}

async function getProductType(ctx, productTypeName) {

    let productTypeKey = ProductType.makeKey([productTypeName]);
    let productType = await ctx.productTypeList.getProductType(productTypeKey);

    if(!productType)
        throw new Error('Product type with name ' +  productTypeName  + ' does not exist.');

    let productTypeIngredients = [];

    for (let productTypeIngredientName of productType.getProductTypeIngredientNames()){
        let productTypeIngredient = await getProductType(ctx, productTypeIngredientName);
        productTypeIngredients.push(productTypeIngredient);
    }

    productType.setProductTypeIngredients(productTypeIngredients);

    return productType;
}

async function getProduct(ctx, productName) {

    let productKey = Product.makeKey([productName]);
    let product = await ctx.productList.getProduct(productKey);

    if(!product)
        throw new Error('Product with name ' +  productName  + ' does not exist.');
    
    let productType = await getProductType(ctx, product.getProductTypeName());

    product.setProductType(productType);

    return product;
}

async function getBatch(ctx, batchId) {

    let batchKey = Batch.makeKey([batchId]);
    let batch = await ctx.batchList.getBatch(batchKey);

    if(!batch)
        throw new Error('Batch with id ' +  batchId  + ' does not exist.');

    let batchIngredients = [];

    for (let batchIngredientId of batch.getBatchIngredientIds()){
        let batchIngredient = await getBatch(ctx, batchIngredientId);
        batchIngredients.push(batchIngredient);
    }

    batch.setBatchIngredients(batchIngredients);

    let product = await getProduct(ctx, batch.getProductName());
    batch.setProduct(product);
    
    return batch;
}

class SupplyChainContext extends Context {

    constructor() {
        super();
        this.roleSetList = new RoleSetList(this);
        this.productTypeList = new ProductTypeList(this);
        this.ruleList = new RuleList(this);
        this.productList = new ProductList(this);
        this.batchList = new BatchList(this);
    }

}

class SupplyChainContract extends Contract {

    constructor() {
        super('org.supplyChain.supplyChainContract');
    }

    createContext() {
        return new SupplyChainContext();
    }

    async init(ctx) {
        console.log('Chaincode initialized');
        let roleSetKey = RoleSet.makeKey(['RegulatoryDepartmentMSP']);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);
        if(!roleSet){
            roleSet = RoleSet.createInstance('RegulatoryDepartmentMSP',['admin']);
            await ctx.roleSetList.addRoleSet(roleSet);
        }
        return 'Chaincode initialized'
    }

    async addRoleSet(ctx, orgId, roles) {
        roles = JSON.parse(roles);

        if((new Set(roles)).size != roles.length)
            throw new Error('There are duplicates in roles array');

        if(roles.length === 0)
            throw new Error('Roles array cannot be empty');

        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(roleSet && roleSet.roles.includes('admin')) {
            roleSetKey = RoleSet.makeKey([orgId]);
            roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

            if(roleSet)
                throw new Error('Role set for org ' + orgId  + ' just exists.');

            roleSet = RoleSet.createInstance(orgId,roles);
            await ctx.roleSetList.addRoleSet(roleSet);
            return roleSet;
        }
        else {
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        }
    }

    async addProductType(ctx, productTypeName, type, productTypeIngredientNames) {
        productTypeIngredientNames = JSON.parse(productTypeIngredientNames);
        if((new Set(productTypeIngredientNames)).size != productTypeIngredientNames.length)
            throw new Error('There are duplicates in productTypeIngredientNames array');

        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(roleSet && roleSet.roles.includes('admin')) {
            let productTypeKey = ProductType.makeKey([productTypeName]);
            let productType = await ctx.productTypeList.getProductType(productTypeKey);

            if(productType)
                throw new Error('Product type with name ' +  productType.name  + ' just exists.');

            if(type === 'primary' && productTypeIngredientNames.length > 0)
                throw new Error('A primary product type cannot have ingredients');

            if(type === 'derived' && productTypeIngredientNames.length <= 0)
                throw new Error('A derived product must have ingredients');

            if(type != 'primary' && type != 'derived')
                throw new Error('Type must be primary or derived');

            for (const productTypeIngredientName of productTypeIngredientNames) {
                productTypeKey = ProductType.makeKey([productTypeIngredientName]);
                productType = await ctx.productTypeList.getProductType(productTypeKey);
                if(!productType)
                    throw new Error('Product type with name ' +  productTypeIngredientName  + ' does not exist.');
            }

            productType = ProductType.createInstance(productTypeName, type, productTypeIngredientNames, ctx.clientIdentity.getMSPID());
            productType.setBlocked();
            productType.setCurrentBlockerOrgId(ctx.clientIdentity.getMSPID());
            await ctx.productTypeList.addProductType(productType);
            return productType;
        }
        else {
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        }
    }

    async blockProductType(ctx, productTypeName) {

        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(roleSet && roleSet.roles.includes('admin')) {

            let productTypeKey = ProductType.makeKey([productTypeName]);
            let productType = await ctx.productTypeList.getProductType(productTypeKey);

            if(!productType)
                throw new Error('Product type with name ' +  productTypeName  + ' does not exist.');
            
            if(productType.isBlocked())
                throw new Error('Product type with name ' +  productType.name  + ' is just blocked.');
            
            productType.setBlocked();
            productType.setCurrentBlockerOrgId(ctx.clientIdentity.getMSPID());

            let products = await ctx.productList.getProductsByProductTypeName(productTypeName);

            for (let product of products) {
                product.blockProductType(ctx.clientIdentity.getMSPID());
                let batches = await ctx.batchList.getBatchesByProductName(product.getName());
                for (let batch of batches) {
                    batch.blockProduct(ctx.clientIdentity.getMSPID());
                    await ctx.batchList.updateBatch(batch);
                }
                await ctx.productList.updateProduct(product);
            }

            await ctx.productTypeList.updateProductType(productType);
            return productType;
        }
        else {
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        }
    }

    async unblockProductType(ctx, productTypeName) {

        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(roleSet && roleSet.roles.includes('admin')) {

            let productTypeKey = ProductType.makeKey([productTypeName]);
            let productType = await ctx.productTypeList.getProductType(productTypeKey);

            if(!productType)
                throw new Error('Product type with name ' +  productTypeName  + ' does not exist.');
            
            if(productType.isUnblocked())
                throw new Error('Product type with name ' +  productType.name  + ' is just unblocked.');
            
            productType.setUnblocked();
            productType.setCurrentBlockerOrgId(null);

            let products = await ctx.productList.getProductsByProductTypeName(productTypeName);
            
            for (let product of products) {
                product.unblockProductType();
                let batches = await ctx.batchList.getBatchesByProductName(product.getName());
                for (let batch of batches) {
                    batch.unblockProduct(ctx.clientIdentity.getMSPID());
                    await ctx.batchList.updateBatch(batch);
                }
                await ctx.productList.updateProduct(product);
            }
            
            await ctx.productTypeList.updateProductType(productType);
        }
        else {
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        }
    }

    async requestProductRegistration(ctx, productTypeName, productName) {

        let productTypeKey = ProductType.makeKey([productTypeName]);
        let productType = await ctx.productTypeList.getProductType(productTypeKey);

        if(!productType)
            throw new Error('Product type with name ' +  productTypeName  + ' does not exist.');

        if(productType.isBlocked())
            throw new Error('Product type ' +  productType.name  + ' is actually blocked.');

        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(productType.isPrimary() && (!roleSet || !roleSet.roles.includes('producer')))
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        
        if(productType.isDerived() && (!roleSet || !roleSet.roles.includes('manufacturer')))
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        
        let productKey = Product.makeKey([productName]);
        let product = await ctx.productList.getProduct(productKey);

        if(product)
            throw new Error('Product with name ' +  product.name  + ' just exists.');

        product = Product.createInstance(productName, productTypeName, ctx.clientIdentity.getMSPID());
        product.setPending();
        await ctx.productList.addProduct(product);
        return product;
    }

    async acceptProductRegistration(ctx, productName) {

        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(roleSet && roleSet.roles.includes('admin')) {

            let productKey = Product.makeKey([productName]);
            let product = await ctx.productList.getProduct(productKey);
            
            if(!product)
                throw new Error('Product with name ' +  productName  + ' does not exist.');

            if(!product.isPending())
                throw new Error('Product with name ' +  productName  + ' is not in pending state.');
            
            product.setUnblocked();
            product.setApproverOrgId(ctx.clientIdentity.getMSPID());
            await ctx.productList.updateProduct(product);
            return product;
        }
        else {
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        }
    }

    async refuseProductRegistration(ctx, productName) {

        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(roleSet && roleSet.roles.includes('admin')) {

            let productKey = Product.makeKey([productName]);
            let product = await ctx.productList.getProduct(productKey);
            
            if(!product)
                throw new Error('Product with name ' +  productName  + ' does not exist.');

            if(!product.isPending())
                throw new Error('Product with name ' +  productName  + ' is not in pending state.');
            
            product.setRefused();
            product.setRefuserOrgId(ctx.clientIdentity.getMSPID());
            await ctx.productList.updateProduct(product);
            return product;
        }
        else {
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        }
    }

    async blockProduct(ctx, productName) {

        let productKey = Product.makeKey([productName]);
        let product = await ctx.productList.getProduct(productKey);

        if(!product)
            throw new Error('Product with name ' +  productName  + ' does not exist.');
        
        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(product.getIssuerOrgId() != ctx.clientIdentity.getMSPID() && (!roleSet || !roleSet.roles.includes('admin')))
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');

        if(product.isProductBlocked() || product.isProductTypeBlocked() || product.isProductAndProductTypeBlocked())
            throw new Error('Product ' +  productName  + ' is just blocked.');
            
        product.blockProduct(ctx.clientIdentity.getMSPID());

        let batches = await ctx.batchList.getBatchesByProductName(productName);
        for (let batch of batches) {
            batch.blockProduct();
            await ctx.batchList.updateBatch(batch);
        }

        await ctx.productList.updateProduct(product);
        return product;
        
    }

    async unblockProduct(ctx, productName) {
        
        let productKey = Product.makeKey([productName]);
        let product = await ctx.productList.getProduct(productKey);

        if(!product)
            throw new Error('Product with name ' +  productName  + ' does not exist.');
        
        if(!product.isProductBlocked() && !product.isProductAndProductTypeBlocked())
            throw new Error('This product is not blocked.');

        if(product.getCurrentBlockerOrgId() != ctx.clientIdentity.getMSPID())
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        
        product.unblockProduct();

        let batches = await ctx.batchList.getBatchesByProductName(productName);
        for (let batch of batches) {
            batch.unblockProduct();
            await ctx.batchList.updateBatch(batch);
        }
    
        await ctx.productList.updateProduct(product);
        return product;
            
    }

    async registerBatch(ctx, productName, batchIngredientIds, params) {

        batchIngredientIds = JSON.parse(batchIngredientIds);
        if((new Set(batchIngredientIds)).size != batchIngredientIds.length)
            throw new Error('There are duplicates in productTypeIngredientNames array');

        params = JSON.parse(params);

        let productKey = Product.makeKey([productName]);
        let product = await ctx.productList.getProduct(productKey);

        if(!product)
            throw new Error('Product with name ' +  productName  + ' does not exist.');
        
        if(product.getIssuerOrgId() != ctx.clientIdentity.getMSPID())
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');

        if(product.isProductBlocked() || product.isProductTypeBlocked() || product.isProductAndProductTypeBlocked())
            throw new Error('Product with name ' +  productName  + ' is blocked.');

        let productTypeKey = ProductType.makeKey([product.getProductTypeName()]);
        let productType = await ctx.productTypeList.getProductType(productTypeKey);
        
        if(productType.isPrimary() && batchIngredientIds.length > 0)
            throw new Error('Batches of product with name ' +  productName  + ' cannot have ingredients');

        if(productType.isDerived()){

            let productTypeIngredientNames = productType.getProductTypeIngredientNames();
            let missingProductTypeIngredientNames = new Set(productTypeIngredientNames);
            
            for (let batchIngredientId of batchIngredientIds) {
                
                let batchIngredientKey = Batch.makeKey([batchIngredientId]);
                let batchIngredient = await ctx.batchList.getBatch(batchIngredientKey);

                if(!batchIngredient)
                    throw new Error('Batch with id ' +  batchIngredientId  + ' does not exist.');
                
                productKey = Product.makeKey([batchIngredient.getProductName()]);
                product = await ctx.productList.getProduct(productKey);
                
                if(!productTypeIngredientNames.includes(product.getProductTypeName()))
                    throw new Error('Batch with id ' +  batchIngredientId  + ' cannot be used as ingredient for this batch.');

                if(batchIngredient.getCurrentOwnerOrgId() != ctx.clientIdentity.getMSPID())
                    throw new Error('Batch with id ' +  batchIngredientId  + ' is not owned currently by org with id ' + ctx.clientIdentity.getMSPID() + '.');

                if(!batchIngredient.isUnblocked())
                    throw new Error('Batch with id ' +  batchIngredientId  + ' cannot be processed.');

                batchIngredient.setOutputBatchId(productName.concat(':', ctx.stub.getTxID()));
                batchIngredient.setProcessed();

                ctx.batchList.updateBatch(batchIngredient);

                missingProductTypeIngredientNames.delete(product.getProductTypeName());
            }

            if(missingProductTypeIngredientNames.size > 0)
                throw new Error('Not all ingredients necessary to build this batch have been specified.');
        }

        let batch = Batch.createInstance(productName.concat(':', ctx.stub.getTxID()), productName, batchIngredientIds, params);
        batch.setUnblocked();
        batch.setCurrentOwnerOrgId(ctx.clientIdentity.getMSPID());

        let result = await validateRulesForBatch(ctx, new Batch(batch));
        if(!result)
            throw new Error('Not all rules for this batch have been satisfied.');

        await ctx.batchList.addBatch(batch);
        return batch;
    }

    async blockBatch(ctx, batchId) {

        let batchKey = Batch.makeKey([batchId]);
        let batch = await ctx.batchList.getBatch(batchKey);

        if(!batch)
            throw new Error('Batch with id ' +  batchId  + ' does not exist.');
        
        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(batch.getCurrentOwnerOrgId() != ctx.clientIdentity.getMSPID() && (!roleSet || !roleSet.roles.includes('admin')))
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');

        if(batch.isBatchBlocked() || batch.isProductBlocked() || batch.isBatchAndProductBlocked())
            throw new Error('Batch with id ' +  batchId  + ' is just blocked.');
            
        if(batch.isProcessed())
            throw new Error('Batch with id ' +  batchId  + ' has been just processed.');
        
        batch.blockBatch(ctx.clientIdentity.getMSPID());

        await ctx.batchList.updateBatch(batch);
        return batch;
        
    }

    async unblockBatch(ctx, batchId) {
        
        let batchKey = Batch.makeKey([batchId]);
        let batch = await ctx.batchList.getBatch(batchKey);

        if(!batch)
            throw new Error('Batch with id ' +  batchId  + ' does not exist.');
        
        if(!batch.isBatchBlocked() && !batch.isBatchAndProductBlocked())
            throw new Error('Batch with id ' +  batchId  + ' is not blocked.');

        if(batch.getCurrentBlockerOrgId() != ctx.clientIdentity.getMSPID())
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        
        batch.unblockBatch();

        await ctx.batchList.updateBatch(batch);
        return batch;
            
    }

    async requestBatchTransfer(ctx, batchId) {

        let batchKey = Batch.makeKey([batchId]);
        let batch = await ctx.batchList.getBatch(batchKey);

        if(!batch)
            throw new Error('Batch with id ' +  batchId  + ' does not exist.');

        if(!batch.isUnblocked())
            throw new Error('It is not possible to request transfer for batch with id' +  batchId  + '.');

        if(batch.getCurrentOwnerOrgId() === ctx.clientIdentity.getMSPID())
            throw new Error('Batch with id' +  batchId  + ' is just owned by org with id ' + ctx.clientIdentity.getMSPID() + '.');

        batch.setPending();
        batch.setCurrentReceiverOrgId(ctx.clientIdentity.getMSPID());
        await ctx.batchList.updateBatch(batch);
        return batch;
        
    }

    async acceptBatchTransfer(ctx, batchId) {

        let batchKey = Batch.makeKey([batchId]);
        let batch = await ctx.batchList.getBatch(batchKey);

        if(!batch)
            throw new Error('Batch with id ' +  batchId  + ' does not exist.');

        if(batch.getCurrentOwnerOrgId() != ctx.clientIdentity.getMSPID())
            throw new Error('Batch with id' +  batchId  + ' is not owned by org with id ' + ctx.clientIdentity.getMSPID() + '.');

        if(!batch.isPending())
            throw new Error('Batch with id ' +  batchId  + ' is not in pending state.');
        
        batch.setUnblocked();
        batch.setCurrentOwnerOrgId(batch.getCurrentReceiverOrgId());
        batch.setCurrentReceiverOrgId(null);
        await ctx.batchList.updateBatch(batch);
        return batch;
        
    }

    async refuseBatchTransfer(ctx, batchId) {

        let batchKey = Batch.makeKey([batchId]);
        let batch = await ctx.batchList.getBatch(batchKey);

        if(!batch)
            throw new Error('Batch with id ' +  batchId  + ' does not exist.');

        if(batch.getCurrentOwnerOrgId() != ctx.clientIdentity.getMSPID())
            throw new Error('Batch with id' +  batchId  + ' is not owned by org with id ' + ctx.clientIdentity.getMSPID() + '.');

        if(!batch.isPending())
            throw new Error('Batch with id ' +  batchId  + ' is not in pending state.');
        
        batch.setUnblocked();
        batch.setCurrentReceiverOrgId(null);
        await ctx.batchList.updateBatch(batch);
        return batch;
        
    }

    async getBatchHistory(ctx, batchId) {

        let batchKey = Batch.makeKey([batchId]);
        let batch = await ctx.batchList.getBatch(batchKey);

        if(!batch)
            throw new Error('Batch with id ' +  batchId  + ' does not exist.');

        let results = await ctx.batchList.getBatchHistory(batchKey);
        return results;
    }
    
    async addRule(ctx, productTypeName, ruleString) {

        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(roleSet && roleSet.roles.includes('admin')) {
            let productTypeKey = ProductType.makeKey([productTypeName]);
            let productType = await ctx.productTypeList.getProductType(productTypeKey);

            if(!productType)
                throw new Error('Product type with name ' +  productTypeName  + ' does not exist.');
            
            let jsonRule = RuleEngine.getJsonRuleFromRuleString(ruleString);

            if(!jsonRule)
                throw new Error('Error in parsing rule');
            
            let rule = Rule.createInstance(productTypeName.concat(':', ctx.stub.getTxID()), productTypeName, jsonRule, ctx.clientIdentity.getMSPID());
            rule.setDisabled();
            rule.setCurrentDisablerOrgId(ctx.clientIdentity.getMSPID());
            await ctx.ruleList.addRule(rule);
            return rule;
            
        }
        else {
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        }

    }

    async enableRule(ctx, ruleId) {

        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(roleSet && roleSet.roles.includes('admin')) {
            let ruleKey = Rule.makeKey([ruleId]);
            let rule = await ctx.ruleList.getRule(ruleKey);

            if(!rule)
                throw new Error('Rule with id ' +  ruleId  + ' does not exist.');
            
            if(rule.isEnabled()) 
                throw new Error('Rule with id ' +  ruleId  + ' is just enabled.');

            rule.setEnabled();
            rule.setCurrentDisablerOrgId(null);
            await ctx.ruleList.updateRule(rule);
            return rule;
        }
        else {
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        }

    }

    async disableRule(ctx, ruleId) {

        let roleSetKey = RoleSet.makeKey([ctx.clientIdentity.getMSPID()]);
        let roleSet = await ctx.roleSetList.getRoleSet(roleSetKey);

        if(roleSet && roleSet.roles.includes('admin')) {
            let ruleKey = Rule.makeKey([ruleId]);
            let rule = await ctx.ruleList.getRule(ruleKey);

            if(!rule)
                throw new Error('Rule with id ' +  ruleId  + ' does not exist.');
            
            if(rule.isDisabled()) 
                throw new Error('Rule with id ' +  ruleId  + ' is just disabled.');

            rule.setDisabled();
            rule.setCurrentDisablerOrgId(ctx.clientIdentity.getMSPID());
            await ctx.ruleList.updateRule(rule);
            return rule;
        }
        else {
            throw new Error('Org id ' +  ctx.clientIdentity.getMSPID()  + ' does not have permission to execute this operation.');
        }
    }
}

module.exports = SupplyChainContract;