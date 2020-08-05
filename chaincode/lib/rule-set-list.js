'use strict';

const StateList = require('../ledger-api/state-list');

const RuleSet = require('./rule-set');

class RuleSetList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.supplyChain.ruleSetList');
        this.use(RuleSet);
    }

    async addRuleSet(ruleSet) {
        return this.addState(ruleSet);
    }

    async getRuleSet(ruleSetKey) {
        return this.getState(ruleSetKey);
    }

    async updateRuleSet(ruleSet) {
        return this.updateState(ruleSet);
    }
}


module.exports = RuleSetList;