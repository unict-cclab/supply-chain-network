'use strict';

const StateList = require('../ledger-api/state-list');

const {Rule, ruleStates} = require('./rule');

class RuleList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.supplyChain.ruleList');
        this.use(Rule);
    }

    async addRule(rule) {
        return this.addState(rule);
    }

    async getRule(ruleKey) {
        return this.getState(ruleKey);
    }

    async updateRule(rule) {
        return this.updateState(rule);
    }

    async getEnabledRulesByProductTypeName(productTypeName) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.class = Rule.getClass();
        queryString.selector.productTypeName = productTypeName;
        queryString.selector.currentState = ruleStates.ENABLED;
        return this.getStatesForQueryString(JSON.stringify(queryString));
    }
}


module.exports = RuleList;