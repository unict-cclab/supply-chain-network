import React, { Component } from 'react';
import { Redirect} from 'react-router-dom';
import AuthService from '../services/AuthService';
import authHeader from '../services/AuthHeader';
import axios from 'axios';

import BatchHistoryItem from './BatchHistoryItem';

export default class BatchHistory extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      redirect: null,
      userReady: false,
      successful: false,
      message: '',
      currentUser: { username: '' },
      batchHistory: []
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) this.setState({ redirect: '/login' });
    else if(currentUser.role === 'rca-admin') this.setState({ redirect: '/' });
    else {
      this.setState({ currentUser: currentUser, userReady: true });
      this.getBatchHistory();
    }
  }

  getBatchHistory() {
    axios.post(window.REACT_APP_API_URL + 'transactions/evaluate', {
        args : ['getBatchHistory', this.props.match.params.id]
      },{
        headers: authHeader(),
      })
      .then(response => {
          this.setState({ batchHistory: JSON.parse(response.data.message) })
      })
      .catch((error) => {
        console.log(error);
    })
  }

  batchHistory() {
    return this.state.batchHistory.map(currentBatchHistoryItem => {
      return <BatchHistoryItem batchHistoryItem={currentBatchHistoryItem}
                key={currentBatchHistoryItem.Timestamp.seconds.low}
            />;
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
            <h6>{this.props.match.params.id}</h6>
            <table className="table table-bordered">
              <thead className="thead-light" style={{backgroundColor: "#e3f2fd"}}>
                <tr>
                  <th>Current State</th>
                  <th>Current Owner Organization</th>
                  <th>Current Blocker Organization</th>
                  <th>Current Receiver Organization</th>
                  <th>Output Batch</th>
                </tr>
              </thead>
              <tbody>
                { this.batchHistory() }
              </tbody>
            </table>
          </div>
          <div className="col-md-1"></div>
        </div>
        </>
      )
  }
}