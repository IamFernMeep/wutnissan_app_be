import express, { json } from 'express';
import connectDB from './config/db.js'; 
import customerRoutes from './routes/customer.routes.js';

const app = express();
const port = 3000;

app.use(json());
app.use('/api/v1/customers', customerRoutes);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});
