import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import authHeader from '../services/AuthHeader';
import axios from 'axios';

import RoleSet from './RoleSet';

export default class RoleSetList extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      redirect: null,
      userReady: false,
      successful: false,
      message: '',
      currentUser: { username: '' },
      roleSets: []
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) this.setState({ redirect: '/login' });
    else if(currentUser.role === 'rca-admin') this.setState({ redirect: '/' });
    else {
      this.setState({ currentUser: currentUser, userReady: true });
      this.getAllRoleSets();
    }
  }

  getAllRoleSets() {
    axios.post(window.REACT_APP_API_URL + 'transactions/evaluate', {
        args : ['getAllRoleSets']
      },{
        headers: authHeader(),
      })
      .then(response => {
          this.setState({ roleSets: JSON.parse(response.data.message) })
      })
      .catch((error) => {
        console.log(error);
    })
  }

  roleSetList() {
    return this.state.roleSets.map(currentRoleSet => {
      return <RoleSet roleSet={currentRoleSet} key={currentRoleSet.orgId} />;
    })
  }

  

  render() {
    if (this.state.redirect)
      return <Redirect to={this.state.redirect} />
    
    return (
        <>
        <div className="row mt-5">
          <div className="col-md-1"></div>
          <div className="col-md-10">
            {this.state.message && (
              <div className="form-group">
                <div
                  className={
                    this.state.successful
                      ? "alert alert-success"
                      : "alert alert-danger"
                  }
                  role="alert"
                >
                  {this.state.message}
                </div>
              </div>
            )}
            <table className="table table-bordered">
              <thead className="thead-light" style={{backgroundColor: "#e3f2fd"}}>
                <tr>
                  <th>Organization</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                { this.roleSetList() }
              </tbody>
            </table>
          </div>
          <div className="col-md-1"></div>
        </div>
        <div className="row mt-5">
          <div className="col-md-5"></div>
          <div className="col-md-2">
            <Link to="/role-sets/add" className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}}>Add New Role Set</Link>
          </div>
          <div className="col-md-5"></div>
        </div>
        </>
      )
  }
}