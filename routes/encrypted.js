// File: routes/encrypted.js
import express from 'express';
import { getDB, getDBType } from '../db/connection.js';
import MongoEncrypted from '../models/encrypted.js';

const router = express.Router();

// Create new document (type: send)
router.post('/send', async (req, res) => {
  try {
    const db = getDB();
    const dbType = getDBType();
    const { encryptedData, nonce } = req.body;
    console.log('encryptedData, nonce:',encryptedData, nonce)
    if (!encryptedData || !nonce ) {
      return res.status(400).json({ msg: "Missing 'encryptedData'or 'nonce' "});
    }

    if (dbType === 'mongodb') {
      const data = new MongoEncrypted({ encryptedData, nonce });
      const doc = await data.save();
      return res.status(201).json({ msg: 'Document created', data: doc });

    } else if (dbType === 'mysql') {
      const [result] = await db.execute(
        `INSERT INTO encrypted_data ( encryptedData, nonce, createdAt, updatedAt) 
         VALUES (?, ?, ?, NOW(), NOW())`,
        [ encryptedData, nonce]
      );

      return res.status(201).json({
        msg: 'Document created',
        data: {
          _id: result?.insertId,
          encryptedData,
          nonce,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      });

    } else {
      return res.status(400).json({ msg: 'Unsupported DB type' });
    }
  } catch (error) {
    console.error('error:', error);
    return res.status(500).json({ msg: 'Server error', error });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const dbType = getDBType();

    if (!id) {
      return res.status(400).json({ msg: "Please provide 'id' parameter" });
    }

    if (dbType === 'mongodb') {
      const doc = await MongoEncrypted.findById(id);
      if (!doc) return res.status(404).json({ msg: 'Document not found' });

      return res.status(200).json({ msg: "Encrypted data retrieved successfully", data: doc });

    } else if (dbType === 'mysql') {
      const [rows] = await db.execute('SELECT * FROM encrypted_data WHERE id = ?', [id]);
      if (!rows.length) return res.status(404).json({ msg: 'Document not found' });

      const row = rows[0];

      return res.status(200).json({
        msg: "Encrypted data retrieved successfully",
        data: {
          _id: row.id,
          encryptedData: row.encryptedData,
          nonce: row.nonce,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        }
      });

    } else {
      return res.status(400).json({ msg: 'Unsupported DB type' });
    }

  } catch (error) {
    console.error("Error in GET /:id:", error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
});

// Delete test document by ID
router.delete('/remove/:id', async (req, res) => {
  try {
    const db = getDB();
    const dbType = getDBType();
    const { id } = req.params;

    if (dbType === 'mongodb') {
      const result = await MongoEncrypted.findByIdAndDelete(id);
      if (!result) return res.status(404).json({ msg: 'Document not found' });
      return res.json({ msg: 'Email data deleted successfully' });
    } else if (dbType === 'mysql') {
      const [rows] = await db.execute(`DELETE FROM encrypted_data WHERE id = ?`, [id]);
      return res.json({ msg: 'Email data deleted successfully', result: rows });
    } else {
      return res.status(400).json({ msg: 'Unsupported DB type' });
    }
  } catch (error) {
    return res.status(500).json({ msg: 'Server error', error });
  }
});

// Append to existing document (type: revert)
// router.post('/revert/:id', async (req, res) => {
//   try {
//     const db = getDB();
//     const dbType = getDBType();
//     const { id } = req.params;
//     console.log('id:',id)
//     const { encryptedData, nonce, type = 'revert' } = req.body;

//     if (!encryptedData || !nonce || !type || type !== 'revert') {
//       return res.status(400).json({ msg: "Invalid or missing 'type', 'nonce' or 'encryptedData'" });
//     }

//     const entry = { type, encryptedData, nonce };

//     if (dbType === 'mongodb') {
//       const doc = await MongoEncrypted.findById(id);
//       if (!doc) return res.status(404).json({ msg: 'Document not found' });
//       doc.mail.push(entry);
//       await doc.save();
//       return res.status(200).json({ msg: 'Data reverted', data: doc });
//     } else if (dbType === 'mysql') {
//       const [rows] = await db.execute('SELECT * FROM encrypted_data WHERE id = ?', [id]);
//       if (!rows.length) return res.status(404).json({ msg: 'Document not found' });

//       const existing = rows[0];
//       const currentData = JSON.parse(existing.mail || '[]');
//       currentData.push(entry);

//       await db.execute(
//         'UPDATE encrypted_data SET mail = ?, updatedAt = NOW() WHERE id = ?',
//         [JSON.stringify(currentData), id]
//       );

//       // Fetch updated row to return
//       const [updatedRows] = await db.execute('SELECT * FROM encrypted_data WHERE id = ?', [id]);
//       const updated = updatedRows[0];

//       return res.status(200).json({
//         msg: 'Data reverted',
//         data: {
//           _id: updated.id,
//           mail: JSON.parse(updated.mail || '[]'),
//           createdAt: updated.createdAt,
//           updatedAt: updated.updatedAt,
//         }
//       });
//     } else {
//       return res.status(400).json({ msg: 'Unsupported DB type' });
//     }
//   } catch (error) {
//     console.error("Error in /revert/:id:", error);
//     return res.status(500).json({ msg: 'Server error', error: error.message });
//   }
// });

export default router;