import mongoose from 'mongoose';

const verbSchema = new mongoose.Schema({
  v1: {
    type: String,
    required: true,
    unique: true
  },
  v2: {
    type: String,
    required: true
  },
  v3: {
    type: String,
    required: true
  },
  meaning: {
    type: String,
    required: true
  },
  pronunciation: {
    type: String
  },
  examples: {
    present: String,
    past: String,
    perfect: String
  },
  hindiTranslations: {
    present: String,
    past: String,
    perfect: String
  },
  day: {
    type: Number,
    required: true
  },
  difficulty: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  }
});

const Verb = mongoose.model('Verb', verbSchema);
export default Verb;