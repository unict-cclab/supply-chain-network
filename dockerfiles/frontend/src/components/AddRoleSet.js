import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import CheckButton from 'react-validation/build/button';
import axios from 'axios';

import authHeader from '../services/AuthHeader';
import AuthService from '../services/AuthService';

const required = value => {
  if (!value) {
    return (
      <div className="alert alert-danger" role="alert">
        This field is required!
      </div>
    );
  }
};

export default class AddRoleSet extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChangeOrgId = this.onChangeOrgId.bind(this);
    this.onChangeRoles = this.onChangeRoles.bind(this);

    this.state = {
      orgId: '',
      roles: '',
      successful: false,
      message: ''
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) this.setState({ redirect: '/login' });
    else if(currentUser.role === 'rca-admin') this.setState({ redirect: '/' });
  }

  onChangeOrgId(e) {
    this.setState({
        orgId: e.target.value
    });
  }

  onChangeRoles(e) {
    this.setState({
        roles: e.target.value
    });
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    this.setState({
      message: '',
      successful: false
    });

    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {
        axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
            'args': ['addRoleSet', this.state.orgId,
                this.state.roles.trim() !== '' ? this.state.roles.trim().split(',') : [] 
            ]
        },{
            headers: authHeader(),
        })
        .then(
            response => {
            this.setState({
                message: response.data.message,
                successful: true
            });
            },
            error => {
            const resMessage =
                (error.response &&
                error.response.data &&
                error.response.data.error.message.split("Error:")[1]) ||
                error.message ||
                error.toString();

            this.setState({
                successful: false,
                message: resMessage
            });
            }
        );
    }
  }

  render() {
    if (this.state.redirect)
      return <Redirect to={this.state.redirect} />

    return (
      <div className="row mt-5">
        <div className="col-md-4"></div>
        <div className="col-md-4">
          <div>
            <Form
              onSubmit={this.handleSubmit}
              ref={c => {
                this.form = c;
              }}
            >
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
              <div>
                <div className="form-group">
                  <label htmlFor="orgId">Organization MSPID</label>
                  <Input
                    type="text"
                    className="form-control"
                    name="orgId"
                    value={this.state.orgId}
                    onChange={this.onChangeOrgId}
                    validations={[required]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Roles</label>
                  <Input
                    type="text"
                    className="form-control"
                    name="roles"
                    value={this.roles}
                    onChange={this.onChangeRoles}
                    validations={[required]}
                  />
                </div>
                <div className="form-group">
                  <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}}>Add Role Set</button>
                </div>
              </div>
              <CheckButton
                style={{ display: "none" }}
                ref={c => {
                  this.checkBtn = c;
                }}
              />
            </Form>
          </div>
        </div>
        <div className="col-md-4"></div>
      </div>
    );
  }
}