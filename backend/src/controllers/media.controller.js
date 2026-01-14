/**
 * Media Controller
 * Streams post media stored in MongoDB GridFS.
 */

import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

const getBucket = () => {
  const db = mongoose.connection?.db;
  if (!db) {
    throw new Error('Database not connected');
  }
  return new GridFSBucket(db, { bucketName: 'postMedia' });
};

/**
 * Stream a media file by GridFS id
 * GET /api/media/:id
 */
export const streamMedia = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid media id' });
    }

    const fileId = new ObjectId(id);
    const bucket = getBucket();

    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const file = files[0];
    const contentType = file.contentType || 'application/octet-stream';
    const filename = (file.filename || 'media').toString().replace(/\"/g, '');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Accept-Ranges', 'bytes');

    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/i.exec(range);
      if (!match) {
        return res.status(416).setHeader('Content-Range', `bytes */${file.length}`).end();
      }

      const start = Number(match[1]);
      const end = match[2] ? Math.min(Number(match[2]), file.length - 1) : file.length - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= file.length) {
        return res.status(416).setHeader('Content-Range', `bytes */${file.length}`).end();
      }

      const chunkSize = end - start + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${file.length}`);
      res.setHeader('Content-Length', chunkSize);

      const downloadStream = bucket.openDownloadStream(fileId, { start, end: end + 1 });
      downloadStream.on('error', (err) => {
        console.error('GridFS download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Server error while streaming media' });
        }
      });
      downloadStream.pipe(res);
      return;
    }

    res.setHeader('Content-Length', file.length);

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', (err) => {
      console.error('GridFS download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Server error while streaming media' });
      }
    });
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Stream media error:', error);
    res.status(500).json({ message: 'Server error while streaming media' });
  }
};
