const crypto = require('crypto');

// Same format as core/utils/client-secret.js (scrypt$<salt>$<hash>, base64url).
function hashSecret(secret) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(secret, salt, 64);
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

const list = (envName, fallback) => (process.env[envName] ? process.env[envName].split(',').map((s) => s.trim()).filter(Boolean) : fallback);

// Redirect URIs are exact-match. Override via env at migration time, or UPDATE oauth_clients later.
const CLIENTS = [
  { name: 'webapp', redirectUris: list('OAUTH_WEBAPP_REDIRECT_URIS', ['http://localhost:5173/oauth/callback']) },
  { name: 'mcp', redirectUris: list('OAUTH_MCP_REDIRECT_URIS', ['http://localhost:6274/oauth/callback', 'http://127.0.0.1:6274/oauth/callback']) },
];

module.exports = {
  up: async ({ context: queryInterface }) => {
    for (const client of CLIENTS) {
      const clientId = crypto.randomUUID();
      const clientSecret = crypto.randomUUID();
      await queryInterface.sequelize.query(
        'INSERT INTO oauth_clients (client_id, client_name, client_secret_hash, redirect_uris) VALUES (?, ?, ?, ?)',
        { replacements: [clientId, client.name, hashSecret(clientSecret), JSON.stringify(client.redirectUris)] }
      );
      // The secret cannot be recovered later (only its hash is stored): copy it now.
      console.log(`[oauth-client] ${client.name}: client_id=${clientId} client_secret=${clientSecret}`);
    }
  },

  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query("DELETE FROM oauth_clients WHERE client_name IN ('webapp', 'mcp')");
  },
};
