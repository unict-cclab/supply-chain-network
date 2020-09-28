import React, { Component } from 'react';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route} from 'react-router-dom';

import AuthService from './services/AuthService';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import ProductTypeList from './components/ProductTypeList';
import EnrollAdmins from './components/EnrollAdmins';
import RegisterUser from './components/RegisterUser';
import AddProductType from './components/AddProductType';
import ProductList from './components/ProductList';
import RequestProductRegistration from './components/RequestProductRegistration';
import BatchList from './components/BatchList';
import RegisterBatch from './components/RegisterBatch';
import RoleSetList from './components/RoleSetList';
import RuleList from './components/RuleList';
import AddRoleSet from './components/AddRoleSet';
import AddRule from './components/AddRule';
import BatchHistory from './components/BatchHistory';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: undefined
    };
  }

  componentDidMount() {
    const user = AuthService.getCurrentUser();

    if (user) {
      this.setState({
        currentUser: user,
      });
    }
  }

  logOut() {
    AuthService.logout();
    window.location = '/login'
  }

  render() {
    return (
      <Router>
        <Navbar currentUser={this.state.currentUser} logOut={this.logOut}/>
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/enroll-admins" component={EnrollAdmins} />
        <Route exact path="/register-user" component={RegisterUser} />
        <Route exact path="/product-types" component={ProductTypeList} />
        <Route exact path="/product-types/add" component={AddProductType} />
        <Route exact path="/products" component={ProductList} />
        <Route exact path="/products/add" component={RequestProductRegistration} />
        <Route exact path="/batches" component={BatchList} />
        <Route exact path="/batches/register" component={RegisterBatch} />
        <Route exact path="/role-sets" component={RoleSetList} />
        <Route exact path="/role-sets/add" component={AddRoleSet} />
        <Route exact path="/rules" component={RuleList} />
        <Route exact path="/rules/add" component={AddRule} />
        <Route exact path="/batches/:id/history" component={BatchHistory} />
      </Router>
    );
  }
}

export default App;
