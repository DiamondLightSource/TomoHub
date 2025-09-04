import Keycloak from "keycloak-js";

const keycloakConfig = {
  url: "https://authn.diamond.ac.uk/",
  realm: "master",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
