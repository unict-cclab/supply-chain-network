import React, { Component } from 'react';

export default class Product extends Component {
  render() {
    if(this.props.product.currentState === 1)
        return (
            <tr>
                <td>{this.props.product.name}</td>
                <td>{this.props.product.productTypeName}</td>
                <td>Pending</td>
                <td>{this.props.product.issuerOrgId}</td>
                <td>{"None"}</td>
                <td>{"None"}</td>
                <td>{"None"}</td>
                <td>
                    <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.acceptProductRegistration.bind(this, this.props.product.name)}>Accept Product Registration</button>
                    <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.refuseProductRegistration.bind(this, this.props.product.name)}>Refuse Product Registration</button>
                    <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.blockProduct.bind(this, this.props.product.name)}>Block Product</button>
                </td>
            </tr>
        );
    else if(this.props.product.currentState === 2)
        return (
            <tr>
                <td>{this.props.product.name}</td>
                <td>{this.props.product.productTypeName}</td>
                <td>Unblocked</td>
                <td>{this.props.product.issuerOrgId}</td>
                <td>{"None"}</td>
                <td>{this.props.product.approverOrgId}</td>
                <td>{"None"}</td>
                <td>
                    <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.blockProduct.bind(this, this.props.product.name)}>Block Product</button>
                </td>
            </tr>
        );
    else if(this.props.product.currentState === 3)
        return (
            <tr>
                <td>{this.props.product.name}</td>
                <td>{this.props.product.productTypeName}</td>
                <td>ProductBlocked</td>
                <td>{this.props.product.issuerOrgId}</td>
                <td>{this.props.product.currentBlockerOrgId}</td>
                <td>{this.props.product.approverOrgId}</td>
                <td>{"None"}</td>
                <td>
                    <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.unblockProduct.bind(this, this.props.product.name)}>Unblock Product</button>
                </td>
            </tr>
        );
    else if(this.props.product.currentState === 4)
        return (
            <tr>
                <td>{this.props.product.name}</td>
                <td>{this.props.product.productTypeName}</td>
                <td>ProductType Blocked</td>
                <td>{this.props.product.issuerOrgId}</td>
                <td>{"None"}</td>
                <td>{this.props.product.approverOrgId}</td>
                <td>{"None"}</td>
                <td>
                    <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.blockProduct.bind(this, this.props.product.name)}>Block Product</button>
                </td>
            </tr>
        );
    else if(this.props.product.currentState === 5)
        return (
            <tr>
                <td>{this.props.product.name}</td>
                <td>{this.props.product.productTypeName}</td>
                <td>Product And ProductType Blocked</td>
                <td>{this.props.product.issuerOrgId}</td>
                <td>{this.props.product.currentBlockerOrgId}</td>
                <td>{this.props.product.approverOrgId}</td>
                <td>{"None"}</td>
                <td>
                    <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}} onClick={this.props.unblockProduct.bind(this, this.props.product.name)}>Unblock Product</button>
                </td>
            </tr>
        );
    else if(this.props.product.currentState === 6)
        return (
            <tr>
                <td>{this.props.product.name}</td>
                <td>{this.props.product.productTypeName}</td>
                <td>Refused</td>
                <td>{this.props.product.issuerOrgId}</td>
                <td>{"None"}</td>
                <td>{"None"}</td>
                <td>{this.props.product.refuserOrgId}</td>
                <td>
                    No Action Available
                </td>
            </tr>
        );
    
  }
}