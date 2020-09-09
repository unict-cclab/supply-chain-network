import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import authHeader from '../services/AuthHeader';
import axios from 'axios';

import ProductType from './ProductType';

export default class ProductTypeList extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      redirect: null,
      userReady: false,
      successful: false,
      message: '',
      currentUser: { username: '' },
      productTypes: []
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) this.setState({ redirect: '/login' });
    else if(currentUser.role === 'rca-admin') this.setState({ redirect: '/' });
    else {
      this.setState({ currentUser: currentUser, userReady: true });
    }
    this.getAllProductTypes();
  }

  getAllProductTypes() {
    axios.post(window.REACT_APP_API_URL + 'transactions/evaluate', {
      args : ['getAllProductTypes']
    },{
      headers: authHeader(),
    })
    .then(response => {
        this.setState({ productTypes: JSON.parse(response.data.message) })
    })
    .catch((error) => {
      console.log(error);
    })
  }

  productTypeList() {
    return this.state.productTypes.map(currentProductType => {
      return <ProductType productType={currentProductType} blockProductType={this.blockProductType} unblockProductType={this.unblockProductType} key={currentProductType.name}/>;
    })
  }

  blockProductType = productTypeName => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['blockProductType', productTypeName]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllProductTypes();
        document.documentElement.scrollTop = 0;
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
        document.documentElement.scrollTop = 0;
        }
    );
  }

  unblockProductType = productTypeName => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['unblockProductType', productTypeName]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllProductTypes();
        document.documentElement.scrollTop = 0;
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
        document.documentElement.scrollTop = 0;
        }
    );
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
                  <th>Name</th>
                  <th>Type</th>
                  <th>ProductType Ingredients</th>
                  <th>Current State</th>
                  <th>Issuer Organization</th>
                  <th>Current Blocker Organization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                { this.productTypeList() }
              </tbody>
            </table>
          </div>
          <div className="col-md-1"></div>
        </div>
        <div className="row mt-5">
          <div className="col-md-5"></div>
          <div className="col-md-2">
            <Link to="/product-types/add" className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}}>Add New ProductType</Link>
          </div>
          <div className="col-md-5"></div>
        </div>
        </>
      )
  }
}