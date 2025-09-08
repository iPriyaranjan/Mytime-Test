import mongoose from 'mongoose';

const EncryptedSchema = new mongoose.Schema({
    encryptedData: {
        type: String
    },
    nonce: {
        type: String
    }
},
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.models.EncryptedData || mongoose.model('EncryptedData', EncryptedSchema);