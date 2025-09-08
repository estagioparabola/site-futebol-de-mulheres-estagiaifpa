const express = require('express');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const crypto = require('crypto'); // Para gerar token aleatório

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('site-futebol-de-mulheres-estagiaifpa')); // Servir HTML e JS

// ---- CONFIGURAÇÕES DO GOOGLE ----
const OAuth2 = google.auth.OAuth2;

const oAuth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });


// ---- SUPABASE ----
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ---- FUNÇÃO PARA ENVIAR EMAIL ----
async function sendConfirmationEmail(email, confirmLink) {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.GMAIL_USER,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken.token,
        }
    });

    const message = `
        <h2>🎉 Obrigado!</h2>
        <p>Você foi inscrito com sucesso. Clique no link abaixo para confirmar seu e-mail:</p>
        <a href="${confirmLink}">Confirmar e-mail</a>
    `;

    await transporter.sendMail({
        from: `"Minha Newsletter" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Confirmação de inscrição',
        text: `Confirme seu e-mail: ${confirmLink}`,
        html: message,
    });
}

// ---- ROTA DE  ENVIO DE CONFIRMAÇÃO ----
app.post('/enviar-confirmacao', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-mail é obrigatório' });

    // Gerar token único para confirmação
    const token = crypto.randomBytes(16).toString('hex');

    // Salvar no Supabase
    const { error } = await supabase
    .from('subscribers')
    .insert([{ email, token, confirmado: false }]);
    if (error) return res.status(500).json({ error: error.message });
    
    // Link de confirmação
    const confirmLink = `http://localhost:3000/confirmar?token=${token}`;

    try {
        await sendConfirmationEmail(email, confirmLink);
        res.json({ success: true, message: 'E-mail de confirmação enviado com sucesso!' });

    } catch (err) {
        console.error('Erro ao enviar e-mail:', err);
        res.status(500).send('Erro ao enviar o e-mail.');
    }
});

// ---- ROTA DE CONFIRMAÇÃO ----
app.get('/confirmar', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send('Token é obrigatório.');

    // Atualizar usuário confirmado no Supabase
    const { data, error } = await supabase
        .from('subscribers')
        .update({ confirmado: true })
        .eq('token', token)
        .select();

    if (error) return res.status(500).send('Erro ao confirmar o e-mail.');
    if (!data.length) return res.status(400).send('Token inválido.');

    res.send(`✅ E-mail confirmado com sucesso! Token: ${token}`);

});

// ---- INICIAR SERVIDOR ----
app.listen(3000, () => console.log('🚀 Servidor rodando em http://localhost:3000'));
