import express, { json } from 'express';
import connectDB from './config/db.js'; 
import userRoutes from './routes/user.routes.js';

const app = express();
const port = 3000;

app.use(json());
app.use('/api/users', userRoutes);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});
