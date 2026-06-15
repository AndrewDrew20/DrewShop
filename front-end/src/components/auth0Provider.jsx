import React from "react";
import { useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

const Auth0ProviderWithHistory = ({ children }) => {
  const domain   = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  // Tiene que coincidir con AUTH0_AUDIENCE del backend y con el "Identifier"
  // de la API en el dashboard de Auth0.
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'http://localhost:3000';

  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;