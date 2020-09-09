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

export default class AddProductType extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeProductTypeIngredientNames = this.onChangeProductTypeIngredientNames.bind(this);

    this.state = {
      name: '',
      type: '',
      productTypeIngredientNames: '',
      successful: false,
      message: ''
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) this.setState({ redirect: '/login' });
    else if(currentUser.role === 'rca-admin') this.setState({ redirect: '/' });
  }

  onChangeName(e) {
    this.setState({
        name: e.target.value
    });
  }

  onChangeType(e) {
    this.setState({
        type: e.target.value
    });
  }

  onChangeProductTypeIngredientNames(e) {
    this.setState({
        productTypeIngredientNames: e.target.value
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
            'args': ['addProductType', this.state.name, this.state.type,
                this.state.productTypeIngredientNames.trim() !== '' ? this.state.productTypeIngredientNames.trim().split(',') : [] 
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
                  <label htmlFor="name">Name</label>
                  <Input
                    type="text"
                    className="form-control"
                    name="name"
                    value={this.state.name}
                    onChange={this.onChangeName}
                    validations={[required]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <Input
                    type="text"
                    className="form-control"
                    name="type"
                    value={this.state.type}
                    onChange={this.onChangeType}
                    validations={[required]}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">ProductType Ingredients</label>
                  <Input
                    type="text"
                    className="form-control"
                    name="productTypeIngredientNames"
                    value={this.state.productTypeIngredientNames}
                    onChange={this.onChangeProductTypeIngredientNames}
                  />
                </div>
                <div className="form-group">
                  <button className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}}>Add Product Type</button>
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