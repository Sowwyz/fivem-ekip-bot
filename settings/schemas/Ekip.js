const mongoose = require('mongoose');

const EkipSchema = new mongoose.Schema({
    ekipKodu: { type: Number, unique: true }, 
    ekipIsmi: String,
    liderID: String,
    uyeler: { type: Array, default: [] },
    limit: { type: Number, default: 15 },
    rolID: String,
    kanalID: String,
    kilitli: { type: Boolean, default: false }
});

module.exports = mongoose.model("Ekip", EkipSchema);