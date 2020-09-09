import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import authHeader from '../services/AuthHeader';
import axios from 'axios';

import Batch from './Batch';

export default class BatchList extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      redirect: null,
      userReady: false,
      successful: false,
      message: '',
      currentUser: { username: '' },
      batches: []
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) this.setState({ redirect: '/login' });
    else if(currentUser.role === 'rca-admin') this.setState({ redirect: '/' });
    else {
      this.setState({ currentUser: currentUser, userReady: true });
    }
    this.getAllBatches();
  }

  getAllBatches() {
    axios.post(window.REACT_APP_API_URL + 'transactions/evaluate', {
      args : ['getAllBatches']
    },{
      headers: authHeader(),
    })
    .then(response => {
        this.setState({ batches: JSON.parse(response.data.message) })
    })
    .catch((error) => {
      console.log(error);
    })
  }

  batchList() {
    return this.state.batches.map(currentBatch => {
      return <Batch batch={currentBatch} 
        blockBatch={this.blockBatch} 
        unblockBatch={this.unblockBatch} 
        requestBatchTransfer={this.requestBatchTransfer} 
        acceptBatchTransfer={this.acceptBatchTransfer}
        refuseBatchTransfer={this.refuseBatchTransfer} 
        key={currentBatch.id}
      />;
    })
  }

  blockBatch = batchId => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['blockBatch', batchId]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllBatches();
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

  unblockBatch = batchId => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['unblockBatch', batchId]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllBatches();
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

  requestBatchTransfer = batchId => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['requestBatchTransfer', batchId]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllBatches();
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

  acceptBatchTransfer = batchId => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['acceptBatchTransfer', batchId]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllBatches();
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

  refuseBatchTransfer = batchId => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['refuseBatchTransfer', batchId]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllBatches();
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
            <div className="list-group">
                { this.batchList() }
            </div>
          </div>
          <div className="col-md-1"></div>
        </div>
        <div className="row mt-5">
          <div className="col-md-5"></div>
          <div className="col-md-2">
            <Link to="/batches/register" className="btn btn-light btn-block border mb-3" style={{backgroundColor: "#e3f2fd"}}>Register New Batch</Link>
          </div>
          <div className="col-md-5"></div>
        </div>
        </>
      )
  }
}