// Vercel evaluates this at configuration time; these are not browser variables.
const backend = process.env.BACKEND_URL;
if (!backend || new URL(backend).protocol !== 'https:' || new URL(backend).origin !== backend) {
  throw new Error('Set BACKEND_URL in Vercel to the HTTPS Render origin, without a trailing slash.');
}
if (!process.env.PROXY_SECRET || process.env.PROXY_SECRET.length < 32) {
  throw new Error('Set PROXY_SECRET in Vercel to the same private value configured on Render.');
}
const proxyRoute = (prefix) => ({
  src: `^/${prefix}(?:/(.*))?$`,
  dest: `${backend}/${prefix}/$1`,
  // Native Vercel routing transform resolves the secret on the platform.
  // "set" replaces any incoming client header rather than trusting it.
  transforms: [{
    type: 'request.headers',
    op: 'set',
    target: { key: 'x-pawfolio-proxy-secret' },
    args: '$PROXY_SECRET',
    env: ['PROXY_SECRET'],
  }],
});
export const config = {
  framework: 'vite',
  installCommand: 'npm ci --include=dev',
  buildCommand: 'npm run build -w client',
  outputDirectory: 'client/dist',
  routes: [
    proxyRoute('api'),
    proxyRoute('uploads'),
    { handle: 'filesystem' },
    { src: '/.*', dest: '/index.html' },
  ],
};
