export default function handler(req,res) {
  const origin=req.headers.origin;
  const allowed=new Set(['https://paksights.com','https://www.paksights.com','https://mshahrooz.github.io']);
  if(origin && allowed.has(origin)){
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Vary','Origin');
  }
  res.setHeader('Cache-Control','no-store');
  res.status(200).json({
    ok:true, service:'PakSights original character portrait API',
    model:'google/gemini-3.1-flash-image',
    configured:Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || req.headers['x-vercel-oidc-token']),
    authSources:{
      gatewayApiKey:Boolean(process.env.AI_GATEWAY_API_KEY),
      runtimeOidcEnv:Boolean(process.env.VERCEL_OIDC_TOKEN),
      runtimeOidcHeader:Boolean(req.headers['x-vercel-oidc-token'])
    },
    disclaimer:'Independent fan portrait generator, not affiliated with Rockstar Games'
  });
}
