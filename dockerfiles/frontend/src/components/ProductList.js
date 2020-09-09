import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import authHeader from '../services/AuthHeader';
import axios from 'axios';

import Product from './Product';

export default class ProductList extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      redirect: null,
      userReady: false,
      successful: false,
      message: '',
      currentUser: { username: '' },
      products: []
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) this.setState({ redirect: '/login' });
    else if(currentUser.role === 'rca-admin') this.setState({ redirect: '/' });
    else {
      this.setState({ currentUser: currentUser, userReady: true });
      this.getAllProducts();
    }
  }

  getAllProducts() {
    axios.post(window.REACT_APP_API_URL + 'transactions/evaluate', {
        args : ['getAllProducts']
      },{
        headers: authHeader(),
      })
      .then(response => {
          this.setState({ products: JSON.parse(response.data.message) })
      })
      .catch((error) => {
        console.log(error);
    })
  }

  productList() {
    return this.state.products.map(currentProduct => {
      return <Product product={currentProduct}
                acceptProductRegistration={this.acceptProductRegistration}
                refuseProductRegistration={this.refuseProductRegistration} 
                blockProduct={this.blockProduct}
                unblockProduct={this.unblockProduct}
                key={currentProduct.name}
            />;
    })
  }

  acceptProductRegistration = productName => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['acceptProductRegistration', productName]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllProducts();
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

  refuseProductRegistration = productName => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['refuseProductRegistration', productName]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllProducts();
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

  blockProduct = productName => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['blockProduct', productName]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllProducts();
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

  unblockProduct = productName => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['unblockProduct', productName]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllProducts();
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
                  <th>ProductTypeName</th>
                  <th>Current State</th>
                  <th>Issuer Organization</th>
                  <th>Current Blocker Organization</th>
                  <th>Approver Organization</th>
                  <th>Refuser Organization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                { this.productList() }
              </tbody>
            </table>
          </div>
          <div className="col-md-1"></div>
        </div>
        <div className="row mt-5">
          <div className="col-md-5"></div>
          <div className="col-md-2">
            <Link to="/products/add" className="btn btn-light btn-block border" style={{backgroundColor: "#e3f2fd"}}>Request New Product Registration</Link>
          </div>
          <div className="col-md-5"></div>
        </div>
        </>
      )
  }
}