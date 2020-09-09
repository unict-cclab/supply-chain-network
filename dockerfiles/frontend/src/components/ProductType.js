import React, { Component } from 'react';

export default class ProductType extends Component {
  render() {
    if(this.props.productType.currentState === 1)
      return (
        <tr>
            <td>{this.props.productType.name}</td>
            <td>{this.props.productType.type}</td>
            <td>{this.props.productType.productTypeIngredientNames.length > 0 ? (this.props.productType.productTypeIngredientNames.join()) : ("None")}</td>
            <td>Blocked</td>
            <td>{this.props.productType.issuerOrgId}</td>
            <td>{this.props.productType.currentBlockerOrgId}</td>
            <td>
              <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.unblockProductType.bind(this, this.props.productType.name)}>Unblock</button>
            </td>
        </tr>
      );
    else if(this.props.productType.currentState === 2)
      return (
        <tr>
            <td>{this.props.productType.name}</td>
            <td>{this.props.productType.type}</td>
            <td>{this.props.productType.productTypeIngredientNames.length > 0 ? (this.props.productType.productTypeIngredientNames.join()) : ("None")}</td>
            <td>Unblocked</td>
            <td>{this.props.productType.issuerOrgId}</td>
            <td>{"None"}</td>
            <td>
              <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.blockProductType.bind(this, this.props.productType.name)}>Block</button>
            </td>
        </tr>
      );
  }
}