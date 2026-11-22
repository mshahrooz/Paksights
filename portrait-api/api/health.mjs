import { gateway } from 'ai';

// Small in-memory cache avoids sending a credit status query on every page view.
// No customer balance, credential, or payment details are exposed publicly.
let creditCache = { expires: 0, state: 'unknown' };

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowed = new Set(['https://paksights.com','https://www.paksights.com','https://mshahrooz.github.io']);
  if (origin && allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Cache-Control', 'no-store');
  const authenticated = Boolean(
    process.env.AI_GATEWAY_API_KEY ||
    process.env.VERCEL_OIDC_TOKEN ||
    req.headers['x-vercel-oidc-token']
  );
  let creditState = 'unknown';
  if (authenticated) {
    if (Date.now() < creditCache.expires) {
      creditState = creditCache.state;
    } else {
      try {
        const info = await gateway.getCredits();
        creditState = Number(info.balance) > 0.01 ? 'available' : 'unavailable';
        creditCache = { state: creditState, expires: Date.now() + 120_000 };
      } catch (err) {
        // A failed balance lookup is not proof of no credit.
        creditState = 'unknown';
        creditCache = { state: creditState, expires: Date.now() + 30_000 };
      }
    }
  }
  res.status(200).json({
    ok: true,
    service: 'PakSights original character portrait API',
    model: 'google/gemini-3.1-flash-image',
    configured: authenticated,
    generationAvailable: authenticated && creditState === 'available' ? true : (creditState === 'unavailable' ? false : null),
    status: !authenticated ? 'setup_required' : creditState === 'available' ? 'ready' : creditState === 'unavailable' ? 'credits_unavailable' : 'unknown',
    disclaimer: 'Independent fan portrait generator, not affiliated with Rockstar Games'
  });
}
