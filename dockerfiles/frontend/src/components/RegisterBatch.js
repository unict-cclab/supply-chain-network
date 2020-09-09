import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Textarea from 'react-validation/build/textarea';
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

const isJson = value => {
    try {
        JSON.parse(value);
    }catch(e) {
        return (
            <div className="alert alert-danger" role="alert">
              This field must be a valid JSON!
            </div>
         );
    }
};

export default class RegisterBatch extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChangeProductName = this.onChangeProductName.bind(this);
    this.onChangeBatchIngredientIds = this.onChangeBatchIngredientIds.bind(this);
    this.onChangeParams = this.onChangeParams.bind(this);
    
    this.state = {
      productName: '',
      batchIngredientIds: '',
      params: '',
      successful: false,
      message: ''
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) this.setState({ redirect: '/login' });
    else if(currentUser.role === 'rca-admin') this.setState({ redirect: '/' });
  }

  onChangeProductName(e) {
    this.setState({
        productName: e.target.value
    });
  }

  onChangeBatchIngredientIds(e) {
    this.setState({
        batchIngredientIds: e.target.value
    });
  }

  onChangeParams(e) {
    this.setState({
        params: e.target.value
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
            'args': ['registerBatch', this.state.productName,
                this.state.batchIngredientIds.trim() !== '' ? this.state.batchIngredientIds.trim().split('\n') : [],
                JSON.parse(this.state.params)    
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
                  <label htmlFor="name">Product Name</label>
                  <Input
                    type="text"
                    className="form-control"
                    name="productName"
                    value={this.state.productName}
                    onChange={this.onChangeProductName}
                    validations={[required]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Batch Ingredients</label>
                  <Textarea
                    type="text"
                    className="form-control"
                    name="batchIngredientIds"
                    value={this.state.batchIngredientIds}
                    rows="5"
                    onChange={this.onChangeBatchIngredientIds}
                  ></Textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="type">Params</label>
                  <Textarea
                    type="textarea"
                    className="form-control"
                    name="params"
                    value={this.state.params}
                    rows="5"
                    onChange={this.onChangeParams}
                    validations={[isJson]}
                  ></Textarea>
                </div>
                <div className="form-group">
                  <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}}>Register Batch</button>
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