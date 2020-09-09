import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Form from 'react-validation/build/form';
import CheckButton from 'react-validation/build/button';
import axios from 'axios';

import authHeader from '../services/AuthHeader';
import AuthService from '../services/AuthService';

export default class EnrollAdmins extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    
    this.state = {
      successful: false,
      message: ''
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) this.setState({ redirect: '/login' });
    else if(currentUser.role !== 'rca-admin') this.setState({ redirect: '/' });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.setState({
      message: '',
      successful: false
    });

    if (this.checkBtn.context._errors.length === 0) {
        axios.post(window.REACT_APP_API_URL + 'users/enroll-admins',{},{
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
                    <button className="btn btn-light btn-block" style={{backgroundColor: "#e3f2fd"}}>Enroll Admins</button>
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