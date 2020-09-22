import React from 'react'
import Menu from './core/Menu'
import { Route, Switch } from 'react-router-dom'
import Home from './core/Home'
import Users from './user/Users'
import Signup from './user/Signup'
import Signin from './auth/Signin'
import PrivateRoute from './auth/PrivateRoute'
import EditProfile from './user/EditProfile'
import Profile from './user/Profile'

const MainRouter = () => {
  return (<>
    <Menu/>
    <Switch>
      <Route exact path="/" component={Home}/>
      <Route path="/users" component={Users}/>
      <Route path="/signup" component={Signup}/>
      <Route path="/signin" component={Signin}/>
      <PrivateRoute path="/user/edit/:userId" component={EditProfile}/>
      <Route path="/user/:userId" component={Profile}/>
    </Switch>
  </>)
}

export default MainRouter
