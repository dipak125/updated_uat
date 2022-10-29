import React, { Component } from 'react';
import "./../node_modules/bootstrap/dist/css/bootstrap.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/style.css';
import './assets/css/mediastyle.css';
import './App.css';
import Routes from './component/routes/Routes';
import { connect } from "react-redux";

function App(props) {
  return (
    <div className={props.logo_toggle ? "App" : "App mini-sidebar"}>
      <Routes />
    </div>
  );
}

const mapStateToProps = state => {
  return {
      logo_toggle: state.toggle.logo_toggle
  };
};

export default connect(mapStateToProps)(App);


