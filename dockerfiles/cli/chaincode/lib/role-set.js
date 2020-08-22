'use strict';

const State = require('./../ledger-api/state.js');

class RoleSet extends State {

    constructor(obj) {
        super(RoleSet.getClass(), [obj.orgId]);
        Object.assign(this, obj);
    }

    getOrgId() {
        return this.orgId;
    }

    setRoles(roles) {
        this.roles = roles;
    }

    getRoles() {
        return this.roles;
    }

    static fromBuffer(buffer) {
        return RoleSet.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, RoleSet);
    }

    static createInstance(orgId, roles) {
        return new RoleSet({orgId, roles});
    }

    static getClass() {
        return 'org.supplyChain.roleSet';
    }
}

module.exports = RoleSet;