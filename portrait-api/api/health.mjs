export default function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.status(200).json({
    ok:true, service:'PakSights original character portrait API',
    model:'google/gemini-3.1-flash-image',
    configured:Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN),
    disclaimer:'Independent fan portrait generator, not affiliated with Rockstar Games'
  });
}
