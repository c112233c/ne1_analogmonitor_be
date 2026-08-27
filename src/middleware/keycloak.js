const { createRemoteJWKSet, jwtVerify } = require("jose");

const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;

if (!KEYCLOAK_URL || !KEYCLOAK_REALM) {
    throw new Error("Missing KEYCLOAK_URL or KEYCLOAK_REALM");
}

const issuer = `${KEYCLOAK_URL.replace(/\/$/, "")}/realms/${KEYCLOAK_REALM}`;
const jwks = createRemoteJWKSet(
    new URL(`${issuer}/protocol/openid-connect/certs`)
);

async function requireKeycloakAuth(req, res, next) {
    try {
        const authorization = req.headers.authorization || "";
        const [scheme, token] = authorization.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const { payload } = await jwtVerify(token, jwks, {
            issuer
        });

        // The FE access token does not need to be bound to a specific
        // frontend client (`azp`) or audience. Authentication is established
        // by the JWT signature, Keycloak issuer and standard JWT time claims.
        // jwtVerify also validates `exp`/`nbf` when present.
        req.auth = payload;
        next();
    } catch (error) {
        console.error("Keycloak JWT validation failed:", error.message);

        return res.status(401).json({
            message: "Invalid or expired access token"
        });
    }
}

module.exports = requireKeycloakAuth;
