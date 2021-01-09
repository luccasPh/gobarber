import React from 'react';
import { Switch } from 'react-router-dom';

import Route from './Route';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Forgot from '../pages/Forgot';
import Reset from '../pages/Reset';
import Activate from '../pages/Activate';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';

const Routes: React.FC = () => (
  <Switch>
    <Route path="/" exact component={SignIn} />
    <Route path="/signup" component={SignUp} />
    <Route path="/forgot" component={Forgot} />
    <Route path="/reset" component={Reset} />
    <Route path="/activate" component={Activate} />

    <Route path="/dashboard" isPrivate component={Dashboard} />
    <Route path="/profile" isPrivate component={Profile} />
  </Switch>
);

export default Routes;
