export async function onRequestGet(context) {
  const rawKey = context.params.path ? (Array.isArray(context.params.path) ? context.params.path.join('/') : context.params.path) : '';
  const key = decodeURIComponent(rawKey);

  if (context.env && context.env.R2_BUCKET) {
    try {
      let obj = await context.env.R2_BUCKET.get(key);
      if (!obj) {
        obj = await context.env.R2_BUCKET.get(`movanweb/${key}`);
      }
      if (obj) {
        const headers = new Headers();
        obj.writeHttpMetadata(headers);
        headers.set('etag', obj.httpEtag);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        return new Response(obj.body, { headers });
      }
    } catch (e) {}
  }

  return new Response('File not found in R2', { status: 404 });
}
