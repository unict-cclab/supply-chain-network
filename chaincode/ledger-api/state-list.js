
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

    use(stateClass) {
        this.supportedClasses[stateClass.getClass()] = stateClass;
    }

}

module.exports = StateList;
