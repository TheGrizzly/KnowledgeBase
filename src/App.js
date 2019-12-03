import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { Route, Switch, withRouter, Redirect, NavLink } from 'react-router-dom';
import {createStore, applyMiddleware, compose, combineReducers} from 'redux';
import { Provider } from 'react-redux';
import Button from './components/UI/Button/Button'

import './App.css';
import Input from './components/UI/Input/Input';
import Atoms from './containers/Atoms/Atoms';
import AtomAdd from './containers/AtomAdd/AtomAdd';
import RuleAdd from './containers/RuleAdd/RuleAdd';
import FwrdChain from './containers/ForwardChaining/ForwardChaining';
import Reglas from './components/Reglas/Reglas';
import BacksChain from './containers/BackwardsChaining/BackwardsChaining';
import ObjectiveChain from './containers/ObjectiveChaining/ObjectiveChaining';
import TautologyCheck from './containers/TatutologicCheck/TautologicCheck';
import Rules from './containers/Rules/Rules';
import './Shared/utility';
import Axios from 'axios';

class App extends Component {
  constructor (){
    super();
    this.state ={
      ...this.props,
      red: false,
      at: ''
    }
  }


  Redirect = (aT) =>{
    this.setState({...this.state, red: true, at: aT })
  }

  render() {

    let routes = (
      <Switch>
        <Route path="/" exact />
        <Route path="/atoms" exact component={Atoms} />
        <Route path="/rules" exact component={Rules} />
        <Route path="/AddAtoms" exact component={AtomAdd} />
        <Route path="/AddRules" exact component={RuleAdd} />
        <Route path="/ForwardChain" exact component={FwrdChain} />
        <Route path="/BacksChain" exact component={BacksChain} />
        <Route path="/ObjectiveChain" exact component={ObjectiveChain}/>
        <Route path="/Tautology" exact component={TautologyCheck} />
        <Redirect to="/" />
      </Switch>
    );

    let Red = null;

    if (this.state.red){
      Red = (
        <Redirect to={this.state.at} exact/>
      );
    }
    
    return (
      <div className="App">
        <div className="App-header">
          <h1 className="title">Base de Conocimiento</h1>
        </div>
        <div className="body">
          <span><NavLink exact to="/atoms">Atomo</NavLink></span>
          <span><NavLink exact to="/rules">Reglas</NavLink></span>
          <span><NavLink exact to="/AddAtoms">Atomo</NavLink></span>
          <span><NavLink exact to="/AddRules">Reglas</NavLink></span>
          <span><NavLink extact to="/ForwardChain">Encadenamiento hacia adelante</NavLink></span>
          <span><NavLink exact to="/BacksChain">Encadenamiento hacia atras</NavLink></span>
          <span><NavLink exact to="/ObjectiveChain">Encadenamiento por Objetivos</NavLink></span>
          <span><NavLink exact to="/Tautology">Revisar Tautologia</NavLink></span>
        </div>
        {routes}
        {Red}
        {/* <AtomAdd />
        <RuleAdd />
        <Rules />
        <Atoms /> */}
        {/* <Atoms></Atoms> */}
      </div>
    );
  }
}

export default withRouter(App);
