import express, { json } from 'express';
import connectDB from './config/db.js'; 
import customerRoutes from './routes/customer.routes.js';
import companyRoutes from './routes/company.routes.js';


const app = express();
const port = 3000;

app.use(json());
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/company', companyRoutes);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});
