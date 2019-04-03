import React from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import NotFound from '../components/error/NotFound';
import Login from '../components/page/login';
import OtherRedirect from '../components/page/redirect'
import App from '../components/layout/Admin';

export default () => (
  <Router>
    <Switch>
      <Route exact path="/" render={() => <Redirect to="/dashboard" push/>}/>
      <Route path="/login" component={Login}/>
      <Route path="/redirect" component={OtherRedirect}/>
      <Route path="/" component={App}/>
      <Route path="/404" component={NotFound}/>
      <Route component={NotFound}/>
    </Switch>
  </Router>
)