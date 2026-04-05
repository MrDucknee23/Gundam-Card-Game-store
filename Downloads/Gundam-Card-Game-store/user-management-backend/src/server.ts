import dns from 'dns';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';

dotenv.config();

// Use a public DNS resolver for SRV lookup if the local resolver refuses requests.
// This fixes Atlas `mongodb+srv` resolution when Node's default DNS server is 127.0.0.1.
dns.setServers(['1.1.1.1', '8.8.8.8']);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI as string)
.then(() => {
  console.log('Database connected successfully');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})
.catch((error) => {
  console.error('Database connection failed:', error);
});