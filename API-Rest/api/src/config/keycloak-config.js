var session = require('express-session')
var Keycloak = require('keycloak-connect')
let _keycloak

var keycloakConfig = {
    clientId: process.env.KEYCLOAKCLIENT,
    bearerOnly: true,
    serverUrl: 'http://'+process.env.KEYCLOAKIPADDR+'/',
    realm: process.env.KEYCLOAKREALM,
    realmPublicKey: process.env.KEYCLOACKPUBLICKEY
}
function initKeycloak() {
    if (_keycloak) {
        console.warn("Trying to init Keycloak again!");
        return _keycloak;
    } 
    else {
        console.log("Initializing Keycloak...");
        var memoryStore = new session.MemoryStore();
        _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
        return _keycloak;
    }
}
function getKeycloak() {
    if (!_keycloak){
        console.error('Keycloak has not been initialized. Please called init first.');
    } 
    return _keycloak;
}
module.exports = {
    initKeycloak,
    getKeycloak
}
