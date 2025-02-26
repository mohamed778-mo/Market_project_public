const setLanguage = (req, res, next) => {
    req.language = req.headers['accept-language'] || 'en';
    next();
  };
  
  module.exports = {setLanguage};
  