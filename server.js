// 1. Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// 2. Importa as bibliotecas necessárias
const express = require('express');         // Framework web
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
// Permite que o seu frontend (em um domínio diferente, como GitHub Pages)
// faça requisições para este backend.
app.use(cors({
    origin: FRONTEND_URL, // Define qual URL pode acessar este backend
    methods: ['GET', 'POST'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type'] // Cabeçalhos permitidos
}));

// --- Configuração do Multer para upload de arquivos ---
// 'dest: uploads/' diz ao Multer para salvar os arquivos recebidos na pasta 'uploads/'
// ATENÇÃO: Em produção (Heroku), arquivos salvos localmente são temporários e podem ser perdidos.
// Para uma solução robusta em produção, você deve usar um serviço de armazenamento em nuvem (AWS S3, Google Cloud Storage)
// e salvar as URLs dos arquivos no MongoDB, em vez dos caminhos locais.
const upload = multer({ dest: 'uploads/' });

// --- Configuração do Nodemailer para envio de e-mails ---
const transporter = nodemailer.createTransport({
    service: 'gmail', // Você pode usar 'outlook', 'sendgrid', etc., dependendo do seu provedor
    auth: {
        user: EMAIL_USER, // Seu email de envio
        pass: EMAIL_PASS  // Sua senha de email ou senha de aplicativo (se for Gmail com 2FA)
    }
});

// --- Middlewares Essenciais ---
// app.use(express.json()); // Para parsear (interpretar) requisições com corpo JSON (não é o principal para formulários, mas é bom ter)
app.use(express.urlencoded({ extended: true })); // Para parsear dados de formulário enviados via URL-encoded (formato padrão do formulário HTML)

// --- Rota de Teste (opcional) ---
// Se você acessar a URL do seu backend no navegador, verá esta mensagem
app.get('/', (req, res) => {
    res.send('Servidor do formulário está online e funcionando!');
});

// --- Rota Principal para Receber e Processar o Formulário ---
// 'upload.fields' é usado quando você tem múltiplos campos de upload de arquivo com nomes diferentes
app.post('/submit-locacao', upload.fields([
    // Define os campos de arquivo que o Multer deve esperar
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
    const formData = req.body; // Contém todos os campos de texto do formulário
    const uploadedFiles = req.files; // Contém os arquivos enviados, organizados por nome do campo

    // Log para depuração: veja o que o formulário enviou
    console.log('Dados do formulário recebidos:', formData);
    console.log('Arquivos recebidos:', uploadedFiles);

    // 1. Mapear os dados do formulário para o nosso modelo do MongoDB
    // Os nomes das chaves aqui devem corresponder aos nomes definidos no models/Locacao.js
    // Os valores vêm de formData (campos de texto) ou uploadedFiles (caminhos dos arquivos)
    const newLocacao = new Locacao({
        nome: formData.nome,
        cpf: formData.cpf,
        rg: formData.rg,
        nascimento: formData.nascimento,
        estadoCivil: formData['estado-civil'], // Nome do campo no HTML é 'estado-civil'
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

        // Aqui, armazenamos o 'path' (caminho temporário) do arquivo que o Multer salvou.
        // Se o arquivo não foi enviado (campo opcional), será 'null'.
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
        // 2. Salvar os dados do formulário no MongoDB
        await newLocacao.save();
        console.log('Dados do formulário salvos no MongoDB.');

        // 3. Preparar o corpo do e-mail em HTML
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
        // Adicionar dados do cônjuge se o estado civil for "casado" ou "uniao-estavel"
        if (formData['estado-civil'] === 'casado' || formData['estado-civil'] === 'uniao-estavel') {
            emailBody += `
                <hr>
                <h2>Dados do Cônjuge</h2>
                <p>Documentos do cônjuge anexados, se fornecidos.</p>
            `;
        }

        // 4. Preparar os anexos do e-mail
        const attachments = [];
        // Itera sobre todos os campos de upload que o Multer processou
        for (const fieldName in uploadedFiles) {
            uploadedFiles[fieldName].forEach(file => {
                attachments.push({
                    filename: file.originalname, // Nome original do arquivo
                    path: file.path // Caminho temporário onde o Multer salvou o arquivo
                });
            });
        }

        const mailOptions = {
            from: EMAIL_USER, // Seu e-mail de envio (configurado no .env)
            to: 'email_para_receber_fichas@dominio.com', // <<--- Mude para o e-mail de destino real!
            subject: `Nova Ficha Cadastral: ${formData.nome} - ${formData.cpf}`, // Assunto do e-mail
            html: emailBody, // Corpo do e-mail em HTML
            attachments: attachments // Anexos
        };

        // 5. Enviar o e-mail
        await transporter.sendMail(mailOptions);
        console.log('E-mail enviado com sucesso.');

        // 6. Remover arquivos temporários (MUITO IMPORTANTE para não acumular arquivos no servidor)
        // Isso deve ser feito APÓS o envio do e-mail.
        attachments.forEach(attachment => {
            fs.unlink(attachment.path, (err) => {
                if (err) console.error(`Erro ao remover arquivo temporário ${attachment.filename}:`, err);
            });
        });

        // 7. Envia uma resposta de sucesso para o frontend
        res.status(200).send('Formulário enviado e dados armazenados com sucesso!');

    } catch (error) {
        console.error('Erro no processamento do formulário:', error);
        // Trata o erro de CPF duplicado (código 11000 é para duplicidade de índice único no MongoDB)
        if (error.code === 11000) {
             return res.status(409).send('Erro: O CPF informado já possui uma ficha cadastral. Por favor, verifique ou entre em contato.');
        }
        // Para outros erros, envia uma mensagem genérica
        res.status(500).send('Erro interno do servidor ao processar sua solicitação. Tente novamente mais tarde.');
    }
});

// --- Iniciar o Servidor ---
// Faz o servidor "ouvir" requisições na porta especificada
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});