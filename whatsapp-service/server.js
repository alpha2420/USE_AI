require('dotenv').config();
const express = require('express');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

// In-memory store for WhatsApp socket instances
const sessions = new Map();

async function startWhatsAppSession(orgId) {
    if (sessions.has(orgId)) {
        return sessions.get(orgId);
    }

    const sessionDir = path.join(__dirname, 'auth_info', orgId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    let qrUrl = null;

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ['useAI System', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            qrUrl = await qrcode.toDataURL(qr);
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`Connection closed for org ${orgId}. Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                startWhatsAppSession(orgId);
            } else {
                console.log(`Connection closed for org ${orgId}. Logged out.`);
                fs.rmSync(sessionDir, { recursive: true, force: true });
                sessions.delete(orgId);
            }
        } else if (connection === 'open') {
            console.log(`WhatsApp connection opened for org ${orgId}`);
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        const msg = m.messages[0];
        
        if (!msg.message || msg.key.fromMe) return;

        const customerPhone = msg.key.remoteJid.replace('@s.whatsapp.net', '');
        const content = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (!content) return;

        try {
            // Forward to Python backend webhook
            await axios.post(`${BACKEND_URL}/chat/webhook`, {
                org_id: orgId,
                customer_phone: customerPhone,
                content: content
            });
        } catch (error) {
            console.error(`Failed to trigger webhook for org ${orgId}:`, error.message);
        }
    });

    sessions.set(orgId, { sock, getQr: () => qrUrl });
    return sessions.get(orgId);
}

// POST /connect
app.post('/connect', async (req, res) => {
    const { org_id } = req.body;
    if (!org_id) return res.status(400).json({ error: 'org_id is required' });

    try {
        const session = await startWhatsAppSession(org_id);
        const qr = session.getQr();
        // Wait a small delay to allow QR code generation if needed
        setTimeout(() => {
            res.json({ message: 'Session starting', qr: session.getQr() });
        }, 1500);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /status/:org_id
app.get('/status/:org_id', (req, res) => {
    const orgId = req.params.org_id;
    if (sessions.has(orgId)) {
        res.json({ status: 'connected' });
    } else {
        res.json({ status: 'disconnected' });
    }
});

// POST /send
app.post('/send', async (req, res) => {
    const { org_id, phone, text } = req.body;
    if (!org_id || !phone || !text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = sessions.get(org_id);
    if (!session || !session.sock?.user) {
        return res.status(400).json({ error: 'WhatsApp session not connected for this org_id' });
    }

    try {
        await session.sock.sendMessage(`${phone}@s.whatsapp.net`, { text });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`WhatsApp service running on port ${PORT}`);
});
