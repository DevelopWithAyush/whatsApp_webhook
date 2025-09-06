import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
    const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('WEBHOOK VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.status(403).end();
    }
}); 

app.post('/',async (req, res) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    console.log(`\n\nWebhook received ${timestamp}\n`);
    console.log(JSON.stringify(req.body, null, 2));

    try {
        // Extract the payload
        const entry = req.body?.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];

        if (message && message.type === "text") {
            const from = message.from; // Sender's WhatsApp number
            const text = message.text.body; // The actual text message

            console.log(`📩 Message from: ${from}`);
            console.log(`💬 Text: ${text}`);
        } else {
            console.log("⚠️ No text message found in webhook payload");
        }

        res.sendStatus(200);
    } catch (err) {
        console.error("❌ Error handling WhatsApp webhook:", err);
        res.sendStatus(500);
    }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});