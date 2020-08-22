
'use strict';
const State = require('./state.js');

class StateList {

    constructor(ctx, listName) {
        this.ctx = ctx;
        this.name = listName;
        this.supportedClasses = {};

    }

    async addState(state) {
        let key = this.ctx.stub.createCompositeKey(this.name, state.getSplitKey());
        let data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    async getState(key) {
        let ledgerKey = this.ctx.stub.createCompositeKey(this.name, State.splitKey(key));
        let data = await this.ctx.stub.getState(ledgerKey);
        if (data && data.toString('utf8')) {
            let state = State.deserialize(data, this.supportedClasses);
            return state;
        } else {
            return null;
        }
    }

    async updateState(state) {
        let key = this.ctx.stub.createCompositeKey(this.name, state.getSplitKey());
        let data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    async getStatesForQueryString(queryString) {
        let iterator = await this.ctx.stub.getQueryResult(queryString);
        let states = await this.getStatesFromIterator(iterator);
        return states;
    }

    async getStateHistory(key) {
        let ledgerKey = this.ctx.stub.createCompositeKey(this.name, State.splitKey(key));
        let iterator = await this.ctx.stub.getHistoryForKey(ledgerKey);
        let results = await this.getHistoryFromIterator(iterator);
        return results;
    }

    async getStatesFromIterator(iterator) {
        let states = [];
        while (true) {
            let state = await iterator.next();
            if (state.value && state.value.value.toString('utf8'))
                states.push(State.deserialize(state.value.value, this.supportedClasses));
            if (state.done) {
                await iterator.close();
                return states;
            }
        }
    }

    async getHistoryFromIterator(iterator) {
        let results = [];
        while (true) {
            let result = await iterator.next();
            if (result.value && result.value.value.toString('utf8')){
                results.push({
                    'TxId' : result.value.tx_id,
                    'Timestamp' : result.value.timestamp,
                    'IsDelete' : result.value.is_delete,
                    'Value' : State.deserialize(result.value.value, this.supportedClasses)
                });
            }
            if (result.done) {
                await iterator.close();
                return results;
            }
        }
    }

    use(stateClass) {
        this.supportedClasses[stateClass.getClass()] = stateClass;
    }

}

module.exports = StateList;
