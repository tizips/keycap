import React, {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';

// import 'bundle-loader';

// import NotFound from '../components/error/NotFound';
// import Login from '../components/page/login';
// import OtherRedirect from '../components/page/redirect'
// import App from '../components/layout/Admin';

// import LazyLoad from '../optimization/lazyLoad';


export default () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/dashboard" push/>}/>
        <Route path="/login" component={lazy(() => import('../components/page/login'))}/>
        <Route path="/redirect" component={lazy(() => import('../components/page/redirect'))}/>
        <Route path="/" component={lazy(() => import('../components/layout/Admin'))}/>
        <Route path="/404" component={lazy(() => import('../components/error/NotFound'))}/>
        <Route component={lazy(() => import('../components/error/NotFound'))}/>
      </Switch>
    </Suspense>
  </Router>
)