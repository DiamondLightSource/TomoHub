import Keycloak from "keycloak-js";

const keycloakConfig = {
  url: "https://authn.diamond.ac.uk/",
  realm: "master",
  clientId: "tomohub",
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
