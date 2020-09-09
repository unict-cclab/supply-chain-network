import React, { Component } from 'react';

export default class RoleSet extends Component {
  render() {
   return (
    <tr>
        <td>{this.props.roleSet.orgId}</td>
        <td>{this.props.roleSet.roles.join()}</td>
    </tr>
    );
   
  }
}