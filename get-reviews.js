const TOKEN = "nfp_BfmVyYGG79An3Bv8X1S9tcYYEsWkVgMa753d";
const SITE_ID = "7d562fa3-758c-4b06-a91f-c93ac9c751f5";

exports.handler = async function(event, context) {
  try {
    // Get all forms
    const formsRes = await fetch(`https://api.netlify.com/api/v1/forms?site_id=${SITE_ID}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const forms = await formsRes.json();
    const form = forms.find(f => f.name === 'reviews');
    if (!form) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify([])
      };
    }

    // Get submissions
    const subsRes = await fetch(`https://api.netlify.com/api/v1/forms/${form.id}/submissions?per_page=100`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const submissions = await subsRes.json();
    
    const reviews = submissions
      .filter(s => s.data && s.data.review && s.data.name)
      .map(s => ({
        name: s.data.name,
        rating: s.data.rating || '',
        service: s.data.service || '',
        review: s.data.review,
        date: s.created_at
      }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(reviews)
    };
  } catch(err) {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify([])
    };
  }
};
