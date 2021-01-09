import React from 'react';
import {
  Route as RRDRoute, // React Router Dom Route
  RouteProps as RRDRouteProps, // React Router Dom Router Props
  Redirect,
} from 'react-router-dom';

import { useAuth } from '../hooks/auth';

interface RouteProps extends RRDRouteProps {
  isPrivate?: boolean;
  component: React.ComponentType;
}

const Route: React.FC<RouteProps> = ({
  isPrivate = false,
  component: Component,
  ...rest
}) => {
  const { user } = useAuth();

  return (
    <RRDRoute
      {...rest}
      render={({ location }) => {
        return isPrivate === !!user ? (
          <Component />
        ) : (
          <Redirect
            to={
              isPrivate
                ? {
                    pathname: '/',
                    search: '?redirect=true',
                    state: { from: location },
                  }
                : {
                    pathname: '/dashboard',
                    state: { from: location },
                  }
            }
          />
        );
      }}
    />
  );
};

export default Route;
