// 1. Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// 2. Importa as bibliotecas necessárias
const express = require('express');        // Framework web
const multer = require('multer');           // Lida com upload de arquivos
const nodemailer = require('nodemailer');   // Envia e-mails
const mongoose = require('mongoose');       // Interage com MongoDB
const cors = require('cors');               // Habilita CORS para comunicação entre domínios
const fs = require('fs');                   // Módulo nativo do Node para manipular o sistema de arquivos (remover arquivos temporários)
const path = require('path');               // Módulo nativo do Node para lidar com caminhos de arquivos/diretórios

// 3. Importa o modelo de dados que definimos para o MongoDB
const Locacao = require('./models/Locacao');

// 4. Inicializa o aplicativo Express
const app = express();

// 5. Define a porta do servidor, usando a variável de ambiente PORT ou 3000 como padrão
const PORT = process.env.PORT || 3000;

// 6. Obtém as credenciais e URLs das variáveis de ambiente
const MONGO_URI = process.env.MONGO_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL;

// --- Conexão com o MongoDB Atlas ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado ao MongoDB Atlas'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// --- Configuração do CORS (Cross-Origin Resource Sharing) ---
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// --- Adicionar middleware para servir arquivos estáticos ---
// Isso faz com que a pasta 'public' seja acessível diretamente via URL.
// Por exemplo, se success.html estiver em 'public/success.html', você poderá acessá-lo em /success.html
app.use(express.static(path.join(__dirname, 'public')));

// --- Configuração do Multer para upload de arquivos ---
const upload = multer({ dest: 'uploads/' });

// --- Configuração do Nodemailer para envio de e-mails ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// --- Middlewares Essenciais ---
app.use(express.urlencoded({ extended: true }));

// --- Rota de Teste (opcional) ---
app.get('/', (req, res) => {
    // Redireciona para o index.html quando a rota raiz for acessada
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Rota Principal para Receber e Processar o Formulário ---
app.post('/submit-locacao', upload.fields([
    { name: 'doc-rg-locatario', maxCount: 1 },
    { name: 'doc-cpf-locatario', maxCount: 1 },
    { name: 'doc-comp-renda-locatario', maxCount: 1 },
    { name: 'doc-ir-locatario', maxCount: 1 },
    { name: 'doc-extrato', maxCount: 1 },
    { name: 'doc-comp-residencia', maxCount: 1 },
    { name: 'doc-rg-conjuge', maxCount: 1 },
    { name: 'doc-cpf-conjuge', maxCount: 1 },
    { name: 'doc-comp-renda-conjuge', maxCount: 1 },
    { name: 'doc-ir-conjuge', maxCount: 1 }
]), async (req, res) => {
    const formData = req.body;
    const uploadedFiles = req.files;

    console.log('Dados do formulário recebidos:', formData);
    console.log('Arquivos recebidos:', uploadedFiles);

    const newLocacao = new Locacao({
        nome: formData.nome,
        cpf: formData.cpf,
        rg: formData.rg,
        nascimento: formData.nascimento,
        estadoCivil: formData['estado-civil'],
        profissao: formData.profissao,
        celular: formData.celular,
        email: formData.email,

        cepRes: formData['cep-res'],
        logradouroRes: formData['logradouro-res'],
        numeroRes: formData['numero-res'],
        complementoRes: formData['complemento-res'],
        bairroRes: formData['bairro-res'],
        cidadeRes: formData['cidade-res'],
        estadoRes: formData['estado-res'],

        empresaNome: formData['empresa-nome'],
        cargo: formData.cargo,
        remuneracao: formData.remuneracao,
        cepCom: formData['cep-com'],
        logradouroCom: formData['logradouro-com'],
        numeroCom: formData['numero-com'],
        complementoCom: formData['complemento-com'],
        bairroCom: formData['bairro-com'],
        cidadeCom: formData['cidade-com'],
        estadoCom: formData['estado-com'],

        docRgLocatario: uploadedFiles['doc-rg-locatario'] ? uploadedFiles['doc-rg-locatario'][0].path : null,
        docCpfLocatario: uploadedFiles['doc-cpf-locatario'] ? uploadedFiles['doc-cpf-locatario'][0].path : null,
        docCompRendaLocatario: uploadedFiles['doc-comp-renda-locatario'] ? uploadedFiles['doc-comp-renda-locatario'][0].path : null,
        docIrLocatario: uploadedFiles['doc-ir-locatario'] ? uploadedFiles['doc-ir-locatario'][0].path : null,
        docExtrato: uploadedFiles['doc-extrato'] ? uploadedFiles['doc-extrato'][0].path : null,
        docCompResidencia: uploadedFiles['doc-comp-residencia'] ? uploadedFiles['doc-comp-residencia'][0].path : null,
        docRgConjuge: uploadedFiles['doc-rg-conjuge'] ? uploadedFiles['doc-rg-conjuge'][0].path : null,
        docCpfConjuge: uploadedFiles['doc-cpf-conjuge'] ? uploadedFiles['doc-cpf-conjuge'][0].path : null,
        docCompRendaConjuge: uploadedFiles['doc-comp-renda-conjuge'] ? uploadedFiles['doc-comp-renda-conjuge'][0].path : null,
        docIrConjuge: uploadedFiles['doc-ir-conjuge'] ? uploadedFiles['doc-ir-conjuge'][0].path : null,
    });

    try {
        await newLocacao.save();
        console.log('Dados do formulário salvos no MongoDB.');

        let emailBody = `
            <h1>Nova Ficha Cadastral para Locação</h1>
            <p>Recebida em: ${new Date().toLocaleString('pt-BR')}</p>
            <hr>
            <h2>1. Informações Pessoais</h2>
            <ul>
                <li><strong>Nome Completo:</strong> ${formData.nome || 'Não informado'}</li>
                <li><strong>CPF:</strong> ${formData.cpf || 'Não informado'}</li>
                <li><strong>RG:</strong> ${formData.rg || 'Não informado'}</li>
                <li><strong>Data de Nascimento:</strong> ${formData.nascimento || 'Não informado'}</li>
                <li><strong>Estado Civil:</strong> ${formData['estado-civil'] || 'Não informado'}</li>
                <li><strong>Profissão:</strong> ${formData.profissao || 'Não informado'}</li>
                <li><strong>Celular:</strong> ${formData.celular || 'Não informado'}</li>
                <li><strong>E-mail:</strong> ${formData.email || 'Não informado'}</li>
            </ul>
            <hr>
            <h2>2. Endereço Residencial Atual</h2>
            <ul>
                <li><strong>CEP:</strong> ${formData['cep-res'] || 'Não informado'}</li>
                <li><strong>Logradouro:</strong> ${formData['logradouro-res'] || 'Não informado'}</li>
                <li><strong>Número:</strong> ${formData['numero-res'] || 'Não informado'}</li>
                <li><strong>Complemento:</strong> ${formData['complemento-res'] || 'Não informado'}</li>
                <li><strong>Bairro:</strong> ${formData['bairro-res'] || 'Não informado'}</li>
                <li><strong>Cidade:</strong> ${formData['cidade-res'] || 'Não informado'}</li>
                <li><strong>Estado:</strong> ${formData['estado-res'] || 'Não informado'}</li>
            </ul>
            <hr>
            <h2>3. Dados Profissionais</h2>
            <ul>
                <li><strong>Nome da Empresa:</strong> ${formData['empresa-nome'] || 'Não informado'}</li>
                <li><strong>Cargo:</strong> ${formData.cargo || 'Não informado'}</li>
                <li><strong>Remuneração:</strong> ${formData.remuneracao || 'Não informado'}</li>
                <li><strong>CEP Empresa:</strong> ${formData['cep-com'] || 'Não informado'}</li>
                <li><strong>Logradouro Empresa:</strong> ${formData['logradouro-com'] || 'Não informado'}</li>
                <li><strong>Número Empresa:</strong> ${formData['numero-com'] || 'Não informado'}</li>
                <li><strong>Complemento Empresa:</strong> ${formData['complemento-com'] || 'Não informado'}</li>
                <li><strong>Bairro Empresa:</strong> ${formData['bairro-com'] || 'Não informado'}</li>
                <li><strong>Cidade Empresa:</strong> ${formData['cidade-com'] || 'Não informado'}</li>
                <li><strong>Estado Empresa:</strong> ${formData['estado-com'] || 'Não informado'}</li>
            </ul>
        `;
        if (formData['estado-civil'] === 'casado' || formData['estado-civil'] === 'uniao-estavel') {
            emailBody += `
                <hr>
                <h2>Dados do Cônjuge</h2>
                <p>Documentos do cônjuge anexados, se fornecidos.</p>
            `;
        }

        const attachments = [];
        for (const fieldName in uploadedFiles) {
            uploadedFiles[fieldName].forEach(file => {
                attachments.push({
                    filename: file.originalname,
                    path: file.path
                });
            });
        }

        const mailOptions = {
            from: EMAIL_USER,
            to: 'email_para_receber_fichas@dominio.com', // <<--- Mude para o e-mail de destino real!
            subject: `Nova Ficha Cadastral: ${formData.nome} - ${formData.cpf}`,
            html: emailBody,
            attachments: attachments
        };

        await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso.');

        attachments.forEach(attachment => {
            fs.unlink(attachment.path, (err) => {
                if (err) console.error(`Erro ao remover arquivo temporário ${attachment.filename}:`, err);
            });
        });

        // --- ALTERAÇÃO AQUI: Redirecionar para a página de sucesso ---
        res.redirect('/success.html'); // Redireciona para a página de sucesso após processamento

    } catch (error) {
        console.error('Erro no processamento do formulário:', error);
        if (error.code === 11000) {
             // Redireciona ou renderiza uma página de erro específica para CPF duplicado
             return res.status(409).send('Erro: O CPF informado já possui uma ficha cadastral. Por favor, verifique ou entre em contato.');
        }
        // Para outros erros, envia uma mensagem de erro genérica ou redireciona para uma página de erro
        res.status(500).send('Erro interno do servidor ao processar sua solicitação. Tente novamente mais tarde.');
    }
});

// --- Iniciar o Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});