export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  try {
    const { image, ext } = await context.request.json();
    if (!image) {
      return new Response(JSON.stringify({ success: false, error: 'No image provided' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const cleanExt = (ext || 'jpg').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml'
    };
    const contentType = mimeTypes[cleanExt] || 'image/jpeg';

    const base64Data = image.includes(';base64,') ? image.split(';base64,')[1] : image;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
    const key = `movanweb/uploads/${fileName}`;

    if (context.env && context.env.R2_BUCKET) {
      await context.env.R2_BUCKET.put(key, bytes.buffer, {
        httpMetadata: { contentType }
      });
      // also put directly in uploads/
      await context.env.R2_BUCKET.put(`uploads/${fileName}`, bytes.buffer, {
        httpMetadata: { contentType }
      });
    }

    const fileUrl = `/r2/file/${encodeURIComponent(key)}`;
    return new Response(JSON.stringify({ success: true, url: fileUrl, key }), {
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
