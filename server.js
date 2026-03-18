require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Mengambil API Key dari sistem rahasia (Secrets) di Replit
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Instruksi Sistem (Kepribadian AI)
// Instruksi ini memastikan AI hanya menjawab seputar LootSaku dan mengambil referensi dari web
const systemInstruction = `Kamu adalah AI Customer Service yang asik untuk "LootSaku". Layanan: Top up game (ML, FF, PUBG, Valorant), Voucher, PPOB (PLN, Pulsa). Bayar: QRIS, VA, Minimarket. WA: 081275623551. Jawab santai, pakai emoji. Jawab dengan singkat padat. WAJIB mengambil semua saran top up game dan menjawab pertanyaan dasar menggunakan informasi dari link utama: https://lootsaku.com/`;

app.post('/api/chat', async (req, res) => {
    try {
        const { history, message } = req.body;

        // Menggunakan model gemini-1.5-flash (lebih cepat dan cerdas untuk chatbot)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction,
        });

        // Menyusun format riwayat obrolan agar sesuai dengan aturan Google SDK
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: formattedHistory,
        });

        // Mengirim pesan user ke Gemini
        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // Mengirim balasan kembali ke frontend
        res.json({ reply: responseText });
    } catch (error) {
        console.error("Error dari server:", error);
        res.status(500).json({ error: 'Waduh, server AI lagi sibuk nih. Coba lagi ya!' });
    }
});

// Menjalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});