'use strict';

const StateList = require('./../ledger-api/state-list');

const RoleSet = require('./role-set');

class RoleSetList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.supplyChain.roleSetList');
        this.use(RoleSet);
    }

    async addRoleSet(roleSet) {
        return this.addState(roleSet);
    }

    async getRoleSet(roleSetKey) {
        return this.getState(roleSetKey);
    }

    async updateRoleSet(roleSet) {
        return this.updateState(roleSet);
    }
}


module.exports = RoleSetList;