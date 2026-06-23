import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB, dbConnectionInfo } from './config/db.js';

// ⭐ ADD CLERK MIDDLEWARE
import { clerkMiddleware } from "@clerk/express";
import appointmentRouter from './routes/appointmentRouter.js';
import doctorRouter from './routes/doctorRouter.js';
import serviceRouter from './routes/serviceRoutes.js';
import serviceAppointmentRouter from './routes/serviceAppointmentRouter.js';

const app = express();
const port = process.env.PORT || 4000;

// ⭐ IMPORTANT: ENABLE CREDENTIALS FOR CLERK COOKIE SESSION
const allowedOrigins = [
  "http://localhost:5173", // user frontend
  "http://localhost:5174", // admin dashboard
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow any origin for dev/sharing tunnels
      return callback(null, true);
    },
    credentials: true, // ✅ REQUIRED for cookies / Clerk
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ⭐ Use Clerk middleware globally (does NOT protect routes)
app.use(clerkMiddleware());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Database Connection
connectDB();

// Static uploads folder
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

// Routes (unchanged)
app.use("/api/appointments", appointmentRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/services", serviceRouter);
app.use("/api/service-appointments", serviceAppointmentRouter);

// Test route
app.get('/', (req, res) => {
    const uri = process.env.MONGODB_URI || "";
    res.json({
        message: 'API Working ',
        version: '1.0.4',
        dbState: mongoose.connection.readyState,
        dbError: dbConnectionInfo.error,
        hasUri: !!uri,
        uriLength: uri.length,
        uriMasked: uri.slice(0, 20) + "..." + uri.slice(-25),
        uriStartsWithMongo: uri.startsWith("mongodb+srv://") || uri.startsWith("mongodb://"),
        uriHasQuotes: uri.includes('"') || uri.includes("'"),
        uriHasSpaces: uri.includes(' ') || uri.includes('\r') || uri.includes('\n'),
        hasSecret: !!process.env.JWT_SECRET
    });
});

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`);
});
