const jsonLogic = require('json-logic-js');
const transformJS = require('js-to-json-logic');

function getType(variable) {
    return typeof variable;
}

function isDefined(variable) {
    return variable !== null && getType(variable) !== 'undefined'; 
}

jsonLogic.add_operation('getType', getType);
jsonLogic.add_operation('isDefined', isDefined)

class RuleEngine {
    
    static getJsonRuleFromRuleString(ruleString) {
        try{
            return transformJS(ruleString);
        } catch (err){
            return null;
        }
    }

    static verifyJsonRule(jsonRule, data) {
        return jsonLogic.apply(jsonRule, data);
    }
}

module.exports = RuleEngine;