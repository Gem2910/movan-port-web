export async function onRequestGet(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // 1. Try reading from R2 bucket if bound
  if (context.env && context.env.R2_BUCKET) {
    try {
      const obj = await context.env.R2_BUCKET.get('movanweb/site-content.json') || await context.env.R2_BUCKET.get('site-content.json');
      if (obj) {
        const text = await obj.text();
        return new Response(text, { headers: corsHeaders });
      }
    } catch (e) {}
  }

  // 2. Fallback to site's static json file
  try {
    const staticUrl = new URL('/data/site-content.json', context.request.url);
    const res = await context.env.ASSETS.fetch(staticUrl);
    if (res.ok) {
      const text = await res.text();
      return new Response(text, { headers: corsHeaders });
    }
  } catch (e) {}

  return new Response(JSON.stringify({ error: 'Data not found' }), { status: 404, headers: corsHeaders });
}

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    const body = await context.request.json();
    const jsonStr = JSON.stringify(body, null, 2);

    if (context.env && context.env.R2_BUCKET) {
      await context.env.R2_BUCKET.put('movanweb/site-content.json', jsonStr, {
        httpMetadata: { contentType: 'application/json' }
      });
      await context.env.R2_BUCKET.put('site-content.json', jsonStr, {
        httpMetadata: { contentType: 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Đã lưu thành công lên Cloudflare' }), {
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
