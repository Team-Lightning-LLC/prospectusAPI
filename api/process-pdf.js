export default async function handler(req, res) {
  // Just return success for now - we'll connect the real processing later
  res.status(200).json({
    success: true,
    message: "PDF received and processed successfully!",
    data: {
      filename: "demo-prospectus.pdf",
      analysis: "Demo analysis complete"
    }
  });
}
