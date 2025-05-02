import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: "https://authn.diamond.ac.uk/", 
    realm: "master",           
    clientId: "vre14731",   
  });
  
  export default keycloak;