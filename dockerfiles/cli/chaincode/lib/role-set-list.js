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

    async getAllRoleSets() {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.class = RoleSet.getClass();
        return this.getStatesForQueryString(JSON.stringify(queryString));
    }
}


module.exports = RoleSetList;