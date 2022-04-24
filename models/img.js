var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    name: String,
    desc: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});
  
// Image is a modl which has a schema imageSchema
  
module.exports = new mongoose.model('Image', imageSchema);

