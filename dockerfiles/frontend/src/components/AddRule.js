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

export default class AddRule extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChangeProductTypeName = this.onChangeProductTypeName.bind(this);
    this.onChangeRuleString = this.onChangeRuleString.bind(this);
    
    this.state = {
      productTypeName: '',
      ruleString: '',
      successful: false,
      message: ''
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) this.setState({ redirect: '/login' });
    else if(currentUser.role === 'rca-admin') this.setState({ redirect: '/' });
  }

  onChangeProductTypeName(e) {
    this.setState({
        productTypeName: e.target.value
    });
  }

  onChangeRuleString(e) {
    this.setState({
        ruleString: e.target.value
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
            'args': ['addRule', this.state.productTypeName, this.state.ruleString]
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
        <div className="col-md-3"></div>
        <div className="col-md-6">
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
                  <label htmlFor="name">ProductType Name</label>
                  <Input
                    type="text"
                    className="form-control"
                    name="productTypeName"
                    value={this.state.productTypeName}
                    onChange={this.onChangeProductTypeName}
                    validations={[required]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ruleString">Rule String</label>
                  <textarea
                    rows="5"
                    type="text"
                    className="form-control"
                    name="ruleString"
                    value={this.state.ruleString}
                    onChange={this.onChangeRuleString}
                    validations={[required]}
                  />
                </div>
                <div className="form-group">
                  <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}}>Add Rule</button>
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
        <div className="col-md-3"></div>
      </div>
    );
  }
}