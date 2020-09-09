import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import AuthService from '../services/AuthService';
import authHeader from '../services/AuthHeader';
import axios from 'axios';

import Rule from './Rule';

export default class RuleList extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      redirect: null,
      userReady: false,
      successful: false,
      message: '',
      currentUser: { username: '' },
      rules: []
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();
    
    if (!currentUser) this.setState({ redirect: '/login' });
    else if(currentUser.role === 'rca-admin') this.setState({ redirect: '/' });
    else {
      this.setState({ currentUser: currentUser, userReady: true });
    }
    this.getAllRules();
  }

  getAllRules() {
    axios.post(window.REACT_APP_API_URL + 'transactions/evaluate', {
      args : ['getAllRules']
    },{
      headers: authHeader(),
    })
    .then(response => {
        this.setState({ rules: JSON.parse(response.data.message) })
    })
    .catch((error) => {
      console.log(error);
    })
  }

  ruleList() {
    return this.state.rules.map(currentRule => {
      return <Rule rule={currentRule} disableRule={this.disableRule} enableRule={this.enableRule} key={currentRule.id}/>;
    })
  }

  disableRule = ruleId => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['disableRule', ruleId]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllRules();
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

  enableRule = ruleId => {
    axios.post(window.REACT_APP_API_URL + 'transactions/submit',{
      'args': ['enableRule', ruleId]
    },{
      headers: authHeader(),
    })
    .then(
        response => {
        this.setState({
            message: response.data.message,
            successful: true,
        });
        this.getAllRules();
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
                { this.ruleList() }
            </div>
          </div>
          <div className="col-md-1"></div>
        </div>
        <div className="row mt-5">
          <div className="col-md-5"></div>
          <div className="col-md-2">
            <Link to="/rules/add" className="btn btn-light btn-block border mb-3" style={{backgroundColor: "#e3f2fd"}}>Add New Rule</Link>
          </div>
          <div className="col-md-5"></div>
        </div>
        </>
      )
  }
}