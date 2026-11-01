const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.get('/pessoas', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM pessoas');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/pessoas', async (req, res) => {
    const { nome, resumo } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO pessoas (nome, resumo) VALUES ($1, $2) RETURNING *',
            [nome, resumo]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/pessoas/:id', async (req, res) => {
    const { nome, resumo } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE pessoas SET nome = $1, resumo = $2 WHERE id = $3 RETURNING *',
            [nome, resumo, req.params.id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/pessoas/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM pessoas WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/profissionais', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM experiencias_profissionais');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Criar nova
app.post('/profissionais', async (req, res) => {
    const { pessoa_id, empresa, cargo, descricao } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO experiencias_profissionais (pessoa_id, empresa, cargo, descricao) VALUES ($1, $2, $3, $4) RETURNING *',
            [pessoa_id, empresa, cargo, descricao]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/profissionais/:id', async (req, res) => {
    const { empresa, cargo, descricao } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE experiencias_profissionais SET empresa = $1, cargo = $2, descricao = $3 WHERE id = $4 RETURNING *',
            [empresa, cargo, descricao, req.params.id]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/profissionais/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM experiencias_profissionais WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar o servidor localmente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Exportar o app para o Vercel
module.exports = app;
