export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a run in Vertesia - NO FILE UPLOAD NEEDED
    const vertesiaResponse = await fetch('https://studio-server-production.api.vertesia.io/api/v1/runs', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pk-04019274cdfdda9556a81e28addf9754',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        interaction: "6842f295e97f7a20d8c0af43", // Your interaction ID from the screenshot
        data: {
          "document": "user uploaded prospectus" // Simple data
        },
        config: {
          environment: "6819f45fad7c63f44fdd0d3a", // Your environment ID
          model: "your-model-id" // Get this from your Vertesia dashboard
        },
        stream: false
      })
    });

    const result = await vertesiaResponse.json();
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Run created successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create run',
      details: error.message 
    });
  }
}
