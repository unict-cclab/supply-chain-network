import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-light" style={{backgroundColor: "#e3f2fd"}} >
        <Link to="/" className="navbar-brand">SupplyChain</Link>
        <div className="collpase navbar-collapse">
        <ul className="navbar-nav mr-auto">
            {this.props.currentUser ? (
                <>
                    {this.props.currentUser.role === 'rca-admin' ? (
                        <>
                            <li className="navbar-item">
                                <Link to="/enroll-admins" className="nav-link">Enroll Admins</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/register-user" className="nav-link">Register User</Link>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="navbar-item">
                                <Link to="/product-types" className="nav-link">Product Types</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/products" className="nav-link">Products</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/batches" className="nav-link">Batches</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/role-sets" className="nav-link">Role Sets</Link>
                            </li>
                            <li className="navbar-item">
                                <Link to="/rules" className="nav-link">Rules</Link>
                            </li>
                        </>
                    )}
                    <li className="nav-item">
                        <a href="#" className="nav-link" onClick={this.props.logOut}>
                            Logout
                        </a>
                    </li>
                </>
            ) : (
                <li className="nav-item">
                    <Link to={"/login"} className="nav-link">
                        Login
                    </Link>
                </li>
            )}
        </ul>
        </div>
      </nav>
    );
  }
}