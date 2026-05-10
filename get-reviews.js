exports.handler = async function() {
  const TOKEN   = process.env.NETLIFY_API_TOKEN;
  const SITE_ID = process.env.NETLIFY_SITE_ID;

  if (!TOKEN || !SITE_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing env vars' }) };
  }

  try {
    // Get list of forms to find the 'reviews' form ID
    const formsRes = await fetch(
      `https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const forms = await formsRes.json();
    const form  = Array.isArray(forms) && forms.find(f => f.name === 'reviews');
    if (!form) return { statusCode: 200, body: JSON.stringify([]) };

    // Get submissions for that form
    const subsRes = await fetch(
      `https://api.netlify.com/api/v1/forms/${form.id}/submissions`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    const subs = await subsRes.json();
    if (!Array.isArray(subs)) return { statusCode: 200, body: JSON.stringify([]) };

    const reviews = subs
      .filter(s => s.data && s.data.review && s.data.name)
      .map(s => ({
        name:    s.data.name,
        review:  s.data.review,
        service: s.data.service || '',
        rating:  s.data.rating  || '',
      }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviews),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
