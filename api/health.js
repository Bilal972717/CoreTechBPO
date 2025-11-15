module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  res.json({ 
    status: 'OK', 
    message: 'CoreTech BPO API is running',
    timestamp: new Date().toISOString()
  });
};
