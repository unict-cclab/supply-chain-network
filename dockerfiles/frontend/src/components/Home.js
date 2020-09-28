import React, { Component } from 'react';
import logo from '../logo.svg';

export default class Home extends Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p className="mt-5">
            A traceability system for agri-food supply chain management
          </p>
        </header>
      </div>
    );
  }
}