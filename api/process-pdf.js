import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tempFilePath = null;

  try {
    // Parse the uploaded file
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    tempFilePath = uploadedFile.filepath;

    // Step 1: Get upload URL from Vertesia
    const uploadUrlResponse = await fetch('https://zeno-server-production.api.vertesia.io/api/v1/objects/upload-url', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pk-04019274cdfdda9556a81e28addf9754',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: uploadedFile.originalFilename,
        mime_type: 'application/pdf'
      })
    });

    const uploadUrlData = await uploadUrlResponse.json();
    console.log('Upload URL obtained:', uploadUrlData);

    // Step 2: Upload file to that URL
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    
    const uploadResponse = await fetch(uploadUrlData.url, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': 'application/pdf'
      }
    });

    console.log('File uploaded, status:', uploadResponse.status);

    // Step 3: Create a Run with the uploaded file
    const runResponse = await fetch('https://studio-server-production.api.vertesia.io/api/v1/runs', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pk-04019274cdfdda9556a81e28addf9754',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        interaction: "6842f295e97f7a20d8c0af43", // Your interaction ID
        data: {
          document: uploadUrlData.id // Use the uploaded file ID
        },
        config: {
          environment: "6819f45fad7c63f44fdd0d3a" // Your environment ID
        },
        stream: false
      })
    });

    const runResult = await runResponse.json();
    console.log('Run created:', runResult);

    res.status(200).json({
      success: true,
      data: runResult,
      message: 'PDF uploaded and processed successfully'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Processing failed',
      details: error.message 
    });
  } finally {
    // Cleanup
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}
