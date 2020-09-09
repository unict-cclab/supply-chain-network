import React, { Component } from 'react';

export default class Rule extends Component {
  render() {
    if(this.props.rule.currentState === 1)
      return (
        <>
            <div className="list-group-item list-group-item-action flex-column align-items-start mb-5 border border-dark">
                <label>Id</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.rule.id} disabled></input>
                </div>
                <label>ProductType Name</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.rule.productTypeName} disabled></input>
                </div>
                <label>Current State</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value="Disabled" disabled></input>
                </div>
                <label>Issuer Organization</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.rule.issuerOrgId} disabled></input>
                </div>
                <label>Current Disabler Organization</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3"  value={this.props.rule.currentDisablerOrgId} disabled></input>
                </div>
                <label>String Value</label>
                <div className="input-group mb-3">
                    <textarea className="form-control" aria-describedby="basic-addon3" rows="5" value={this.props.rule.stringValue} disabled></textarea>
                </div>
                <div className="input-group mb-3">
                    <button className="btn btn-light btn-block border mr-5 ml-5" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.enableRule.bind(this, this.props.rule.id)}>Enable</button>
                </div>
            </div>
        </>
      );
    else if(this.props.rule.currentState === 2)
    return (
        <>
            <div className="list-group-item list-group-item-action flex-column align-items-start mb-5 border border-dark">
                <label for="basic-url">Id</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.rule.id} disabled></input>
                </div>
                <label for="basic-url">ProductType Name</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.rule.productTypeName} disabled></input>
                </div>
                <label for="basic-url">Current State</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value="Enabled" disabled></input>
                </div>
                <label for="basic-url">Issuer Organization</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value={this.props.rule.issuerOrgId} disabled></input>
                </div>
                <label for="basic-url">Current Disabler Organization</label>
                <div className="input-group mb-3">
                    <input type="text" className="form-control" aria-describedby="basic-addon3" value="None" disabled></input>
                </div>
                <label for="basic-url">String Value</label>
                <div className="input-group mb-3">
                    <textarea type="text" className="form-control" aria-describedby="basic-addon3" rows="5" value={this.props.rule.stringValue} disabled></textarea>
                </div>
                <div className="input-group mb-3">
                    <button className="btn btn-light btn-block border mr-5 ml-5" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.disableRule.bind(this, this.props.rule.id)}>Disable</button>
                </div>
            </div>
        </>
      );
  }
}