// script.js

// Seleção de elementos do DOM que sempre existem ao carregar a página
const formCadastro = document.getElementById('form-cadastro');
const tipoPessoa = document.getElementById("tipo-pessoa");
const tipoAtividade = document.getElementById("tipo-atividade");
const estadoCivil = document.getElementById("estado-civil");
const tipoLocacao = document.getElementById("tipo-locacao");
const garantia = document.getElementById("garantia");
const documentosContainer = document.getElementById("documentos-container");
const loadingOverlay = document.getElementById('loading-overlay'); // Elemento do overlay de carregamento
const progressBar = document.getElementById('progress-bar'); // Novo: Elemento da barra de progresso

// Seções principais do locatário (também sempre existem, mas podem ser hidden/shown)
const informacoesPessoaisSection = document.getElementById("informacoes-pessoais-section");
const enderecoResidencialSection = document.getElementById("endereco-residencial-section");
const dadosProfissionaisSection = document.getElementById("dados-profissionais-section");

// Seções do fiador (também sempre existem, mas podem ser hidden/shown)
const informacoesFiadorSection = document.getElementById("informacoes-fiador-section");
const enderecoFiadorSection = document.getElementById("endereco-fiador-section");
const dadosProfissionaisFiadorSection = document.getElementById("dados-profissionais-fiador-section");

// IDs dos campos que NÃO são obrigatórios (para validação)
const optionalFieldIds = [
    'complemento-residencial',
    'complemento-profissional',
    'fiador-complemento-residencial',
    'fiador-complemento-profissional',
    'nacionalidade',
    'naturalidade'
];

// --- Funções de Utilitário ---

// Limpa os campos de endereço
function clearAddressFields(type) {
    // Busca os elementos de endereço dinamicamente com base no 'type'
    const logradouroInput = document.getElementById("logradouro-" + type);
    const bairroInput = document.getElementById("bairro-" + type);
    const cidadeInput = document.getElementById("cidade-" + type);
    const estadoInput = document.getElementById("estado-" + type);
    const errorSpan = document.getElementById("cep-" + type + "-error");

    if (logradouroInput) logradouroInput.value = "";
    if (bairroInput) bairroInput.value = "";
    if (cidadeInput) cidadeInput.value = "";
    if (estadoInput) estadoInput.value = "";
    if (errorSpan) errorSpan.textContent = "";
}

// Consulta CEP em APIs externas (ViaCEP e Brasil API)
async function consultarCep(inputElement, type) {
    const cep = inputElement.value;
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
        clearAddressFields(type);
        updateProgressBar(); // Atualiza o progresso ao limpar
        return;
    }

    const logradouroInput = document.getElementById("logradouro-" + type);
    const bairroInput = document.getElementById("bairro-" + type);
    const cidadeInput = document.getElementById("cidade-" + type);
    const estadoInput = document.getElementById("estado-" + type);
    const cepErrorSpan = document.getElementById("cep-" + type + "-error");

    if (logradouroInput) logradouroInput.value = "";
    if (bairroInput) bairroInput.value = "";
    if (cidadeInput) cidadeInput.value = "";
    if (estadoInput) estadoInput.value = "";
    if (cepErrorSpan) cepErrorSpan.textContent = "Buscando...";
    if (inputElement) inputElement.classList.remove('error-border');

    try {
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await viaCepResponse.json();

        if (viaCepResponse.ok && !data.erro) {
            if (logradouroInput) logradouroInput.value = data.logradouro;
            if (bairroInput) bairroInput.value = data.bairro;
            if (cidadeInput) cidadeInput.value = data.localidade;
            if (estadoInput) estadoInput.value = data.uf;
            if (cepErrorSpan) cepErrorSpan.textContent = "";
            updateProgressBar(); // Atualiza o progresso após sucesso
            return;
        } else {
            throw new Error("ViaCEP falhou ou CEP não encontrado.");
        }
    } catch (viaCepError) {
        console.warn("ViaCEP erro, tentando Brasil API:", viaCepError.message);
        try {
            const brasilApiResponse = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
            const data = await brasilApiResponse.json();

            if (brasilApiResponse.ok) {
                if (logradouroInput) logradouroInput.value = data.street;
                if (bairroInput) bairroInput.value = data.neighborhood;
                if (cidadeInput) cidadeInput.value = data.city;
                if (estadoInput) estadoInput.value = data.state;
                if (cepErrorSpan) cepErrorSpan.textContent = "";
                updateProgressBar(); // Atualiza o progresso após sucesso
                return;
            } else {
                throw new Error("Brasil API também falhou ou CEP não encontrado.");
            }
        } catch (brasilApiError) {
            console.error("Erro ao consultar CEP em ambas as APIs:", brasilApiError.message);
            if (cepErrorSpan) cepErrorSpan.textContent = "CEP inválido ou não encontrado.";
            if (inputElement) inputElement.classList.add('error-border');
            clearAddressFields(type);
            updateProgressBar(); // Atualiza o progresso após erro
        }
    }
}

// Formata CEP (00000-000)
function formatCepInput(inputElement) {
    let value = inputElement.value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    }
    inputElement.value = value;
}

// Formata CPF (000.000.000-00) e valida
function formatCPFInput(inputElement) {
    let value = inputElement.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d{3})$/, '$1.$2');
    }
    inputElement.value = value;
}

function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) { return false; }
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) { return false; }
    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) { return false; }
    return true;
}

function handleCpfInput(inputElement) {
    formatCPFInput(inputElement);
    const errorElement = inputElement.parentNode.querySelector('.error-message');
    const cleanedCpf = inputElement.value.replace(/\D/g, '');

    if (errorElement) {
        if (cleanedCpf.length === 11) {
            if (validateCPF(cleanedCpf)) {
                errorElement.textContent = "";
                inputElement.classList.remove('error-border');
            } else {
                errorElement.textContent = "CPF inválido";
                inputElement.classList.add('error-border');
            }
        } else if (cleanedCpf.length > 0 && cleanedCpf.length < 11) {
            errorElement.textContent = "CPF incompleto";
            inputElement.classList.add('error-border');
        } else {
            errorElement.textContent = "";
            inputElement.classList.remove('error-border');
        }
    }
    updateProgressBar(); // Atualiza o progresso
}

// Formata RG (00.000.000-0)
function handleRgInput(inputElement) {
    let value = inputElement.value.replace(/\D/g, '');
    if (value.length > 8) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
    } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2.$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{3})$/, '$1.$2');
    }
    inputElement.value = value;

    const errorElement = inputElement.parentNode.querySelector('.error-message');
    const cleanedRg = inputElement.value.replace(/\D/g, '');

    if (errorElement) {
        if (cleanedRg.length > 0 && cleanedRg.length < 7) {
            errorElement.textContent = "RG incompleto";
            inputElement.classList.add('error-border');
        } else {
            errorElement.textContent = "";
            inputElement.classList.remove('error-border');
        }
    }
    updateProgressBar(); // Atualiza o progresso
}

// Formata Telefone ((99) 99999-9999)
function formatPhoneInput(inputElement) {
    let value = inputElement.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 10) {
        value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d*)/, '($1');
    }
    inputElement.value = value;
}

function validatePhone(phoneNumber) {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    return cleanedPhone.length === 10 || cleanedPhone.length === 11;
}

function handlePhoneInput(inputElement) {
    formatPhoneInput(inputElement);
    const errorElement = inputElement.parentNode.querySelector('.error-message');

    if (errorElement) {
        if (inputElement.value.length > 0 && !validatePhone(inputElement.value)) {
            errorElement.textContent = "Número de celular inválido";
            inputElement.classList.add('error-border');
        } else {
            errorElement.textContent = "";
            inputElement.classList.remove('error-border');
        }
    }
    updateProgressBar(); // Atualiza o progresso
}

// Valida formato de e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function handleEmailInput(inputElement) {
    const errorElement = inputElement.parentNode.querySelector('.error-message');

    if (errorElement) {
        if (inputElement.value.length > 0 && !validateEmail(inputElement.value)) {
            errorElement.textContent = "Formato de e-mail inválido";
            inputElement.classList.add('error-border');
        } else {
            errorElement.textContent = "";
            inputElement.classList.remove('error-border');
        }
    }
    updateProgressBar(); // Atualiza o progresso
}

// Formata valores monetários (R$ 0.000,00) com máscara automática e casas decimais dinâmicas
function formatCurrencyInput(inputElement) {
    let value = inputElement.value.replace(/\D/g, '');

    if (value === '') {
        inputElement.value = '';
        inputElement.classList.remove('error-border');
        updateProgressBar(); // Atualiza o progresso
        return;
    }

    while (value.length < 2) {
        value = '0' + value;
    }

    let numberValue = parseFloat(value.slice(0, -2) + '.' + value.slice(-2));

    inputElement.value = numberValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    inputElement.classList.remove('error-border');
    updateProgressBar(); // Atualiza o progresso
}

// --- Lógica de Exibição Dinâmica das Seções e Documentos ---

// Nova função para habilitar/desabilitar inputs em uma seção
function toggleSectionInputs(section, enable) {
    section.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.id !== 'tipo-locacao' && input.id !== 'tipo-pessoa' && input.id !== 'tipo-atividade' && input.id !== 'estado-civil' && input.id !== 'garantia') {
            input.disabled = !enable;
            if (!enable) {
                input.value = '';
                input.classList.remove('error-border');
                const errorSpan = input.parentNode.querySelector('.error-message');
                if (errorSpan) {
                    errorSpan.textContent = '';
                }
            }
        }
    });
}

function resetPjLabels() {
    document.querySelector('label[for="nome-completo"]').textContent = 'Nome Completo';
    document.querySelector('label[for="cpf"]').textContent = 'CPF';
    document.querySelector('label[for="rg"]').textContent = 'RG';
    document.querySelector('label[for="data-nascimento"]').textContent = 'Data de Nascimento';
    document.querySelector('label[for="celular"]').textContent = 'Celular (WhatsApp)';
    document.querySelector('label[for="email"]').textContent = 'Email';
    document.querySelector('label[for="cep-residencial"]').textContent = 'CEP';

    document.querySelector('label[for="nome-empresa"]').textContent = 'Nome da Empresa';
    document.querySelector('label[for="cargo"]').textContent = 'Cargo';
    document.querySelector('label[for="remuneracao-mensal"]').textContent = 'Remuneração Mensal';
    document.querySelector('label[for="cep-profissional"]').textContent = 'CEP Profissional';
    document.querySelector('label[for="logradouro-profissional"]').textContent = 'Logradouro Profissional';
    document.querySelector('label[for="numero-profissional"]').textContent = 'Número Profissional';
    document.querySelector('label[for="complemento-profissional"]').textContent = 'Complemento Profissional';
    document.querySelector('label[for="bairro-profissional"]').textContent = 'Bairro Profissional';
    document.querySelector('label[for="cidade-profissional"]').textContent = 'Cidade Profissional';
    document.querySelector('label[for="estado-profissional"]').textContent = 'Estado Profissional';

    informacoesPessoaisSection.querySelector('h2').textContent = 'Informações Pessoais';
    enderecoResidencialSection.querySelector('h2').textContent = 'Endereço Residencial';
    dadosProfissionaisSection.querySelector('h2').textContent = 'Dados Profissionais';
}

function atualizarDocumentos() {
    documentosContainer.innerHTML = "";
    informacoesPessoaisSection.classList.add("hidden");
    toggleSectionInputs(informacoesPessoaisSection, false);
    enderecoResidencialSection.classList.add("hidden");
    toggleSectionInputs(enderecoResidencialSection, false);
    dadosProfissionaisSection.classList.add("hidden");
    toggleSectionInputs(dadosProfissionaisSection, false);
    informacoesFiadorSection.classList.add("hidden");
    toggleSectionInputs(informacoesFiadorSection, false);
    enderecoFiadorSection.classList.add("hidden");
    toggleSectionInputs(enderecoFiadorSection, false);
    dadosProfissionaisFiadorSection.classList.add("hidden");
    toggleSectionInputs(dadosProfissionaisFiadorSection, false);

    const filtrosPreenchidos =
        tipoLocacao.value &&
        tipoPessoa.value &&
        tipoAtividade.value &&
        estadoCivil.value &&
        garantia.value;

    if (!filtrosPreenchidos) {
        resetPjLabels();
        updateProgressBar(); // Atualiza o progresso
        return;
    }

    const estadoCivilCasadoUniaoEstavel = ["casado", "uniao-estavel"].includes(estadoCivil.value);
    const garantiaFiador = garantia.value === "fiador";
    const isPessoaFisica = tipoPessoa.value === "pf";
    const isPessoaJuridica = tipoPessoa.value === "pj";
    const isCLT = tipoAtividade.value === "clt";
    const isLiberalOrEmpresario = ["liberal", "empresario"].includes(tipoAtividade.value);

    let docs = [];

    const showPrimaryApplicantSections = (isPessoaFisica && (isCLT || isLiberalOrEmpresario || tipoAtividade.value === "aposentado" || tipoAtividade.value === "estudante")) || isPessoaJuridica;

    if (showPrimaryApplicantSections) {
        informacoesPessoaisSection.classList.remove("hidden");
        toggleSectionInputs(informacoesPessoaisSection, true);
        enderecoResidencialSection.classList.remove("hidden");
        toggleSectionInputs(enderecoResidencialSection, true);
        dadosProfissionaisSection.classList.remove("hidden");
        toggleSectionInputs(dadosProfissionaisSection, true);

        if (isPessoaFisica) {
            resetPjLabels();
            if (isCLT) {
                docs.push(
                    "RG do Locatário(a)",
                    "CPF do Locatário(a)",
                    "Comprovante de Renda Locatário(a) (últimos 3 holerites)",
                    "Extrato bancário (últimos 90 dias)",
                    "Declaração de IR Locatário(a)",
                    "Comprovante de residência atual"
                );
            } else if (isLiberalOrEmpresario) {
                docs.push(
                    "RG do Locatário(a)",
                    "CPF do Locatário(a)",
                    "Contrato social da empresa ou comprovante de autônomo",
                    "Extrato bancário (últimos 90 dias)",
                    "Declaração de IR Locatário(a)",
                    "Comprovante de residência atual"
                );
            } else if (tipoAtividade.value === "aposentado") {
                docs.push(
                    "RG do Locatário(a)",
                    "CPF do Locatário(a)",
                    "Comprovante de Renda Locatário(a) (extrato de benefício)",
                    "Extrato bancário (últimos 90 dias)",
                    "Declaração de IR Locatário(a)",
                    "Comprovante de residência atual"
                );
            } else if (tipoAtividade.value === "estudante") {
                docs.push(
                    "RG do Locatário(a)",
                    "CPF do Locatário(a)",
                    "Comprovante de Matrícula/Vínculo com a Instituição de Ensino",
                    "Comprovante de residência atual"
                );
            }

            if (estadoCivilCasadoUniaoEstavel) {
                docs.push(
                    "RG do Cônjuge",
                    "CPF do Cônjuge",
                    "Comprovante de Renda Cônjuge",
                    "Declaração de IR Cônjuge"
                );
            }
        } else if (isPessoaJuridica) {
            informacoesPessoaisSection.querySelector('h2').textContent = 'Informações do Sócio/Representante';
            enderecoResidencialSection.querySelector('h2').textContent = 'Endereço do Sócio/Representante';
            dadosProfissionaisSection.querySelector('h2').textContent = 'Dados Profissionais da Empresa';

            document.querySelector('label[for="nome-completo"]').textContent = 'Nome Completo do Sócio/Representante';
            document.querySelector('label[for="cpf"]').textContent = 'CPF do Sócio/Representante';
            document.querySelector('label[for="rg"]').textContent = 'RG do Sócio/Representante';
            document.querySelector('label[for="data-nascimento"]').textContent = 'Data de Nascimento do Sócio/Representante';
            document.querySelector('label[for="celular"]').textContent = 'Celular do Sócio/Representante';
            document.querySelector('label[for="email"]').textContent = 'Email do Sócio/Representante';
            document.querySelector('label[for="cep-residencial"]').textContent = 'CEP Residencial do Sócio/Representante';

            document.querySelector('label[for="nome-empresa"]').textContent = 'Razão Social da Empresa';
            document.querySelector('label[for="cargo"]').textContent = 'Área de Atuação da Empresa';
            document.querySelector('label[for="remuneracao-mensal"]').textContent = 'Faturamento Mensal da Empresa';
            document.querySelector('label[for="cep-profissional"]').textContent = 'CEP da Empresa';
            document.querySelector('label[for="logradouro-profissional"]').textContent = 'Logradouro da Empresa';
            document.querySelector('label[for="numero-profissional"]').textContent = 'Número da Empresa';
            document.querySelector('label[for="complemento-profissional"]').textContent = 'Complemento da Empresa';
            document.querySelector('label[for="bairro-profissional"]').textContent = 'Bairro da Empresa';
            document.querySelector('label[for="cidade-profissional"]').textContent = 'Cidade da Empresa';
            document.querySelector('label[for="estado-profissional"]').textContent = 'Estado da Empresa';

            docs.push(
                "Cartão CNPJ",
                "Contrato Social ou Estatuto (última alteração)",
                "Documentos dos Sócios (RG, CPF)",
                "Comprovante de Endereço da Empresa",
                "Último Balanço Patrimonial e DRE (se aplicável)",
                "Comprovante de Faturamento (extratos bancários dos últimos 6 meses da PJ)",
                "Declaração de IR da Pessoa Jurídica"
            );
        }
    } else {
        resetPjLabels();
    }

    if (garantiaFiador && showPrimaryApplicantSections) {
        informacoesFiadorSection.classList.remove("hidden");
        toggleSectionInputs(informacoesFiadorSection, true);
        enderecoFiadorSection.classList.remove("hidden");
        toggleSectionInputs(enderecoFiadorSection, true);
        dadosProfissionaisFiadorSection.classList.remove("hidden");
        toggleSectionInputs(dadosProfissionaisFiadorSection, true);

        docs.push(
            "RG do Fiador",
            "CPF do Fiador",
            "Comprovante de residência do Fiador",
            "Comprovante de Renda do Fiador",
            "Declaração de IR do Fiador",
            "Certidão de matrícula atualizada do imóvel do Fiador (deve ser quitado)",
            "IPTU do imóvel do Fiador"
        );
        if (estadoCivilCasadoUniaoEstavel) {
            docs.push(
                "RG do Cônjuge do Fiador",
                "CPF do Cônjuge do Fiador",
                "Comprovante de Renda do Cônjuge do Fiador",
                "Declaração de IR do Cônjuge do Fiador"
            );
        }
    }

    // Adiciona os campos de upload de documentos com instruções
    docs.forEach(doc => {
        const div = document.createElement("div");
        div.classList.add("input-group");
        const fieldName = doc.toLowerCase().normalize('NFD').replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
        div.innerHTML = `
            <label class="required">${doc}:</label>
            <input type="file" name="${fieldName}">
            <span class="file-instructions">Formatos: PDF, JPG, PNG. Tamanho máximo: 5MB.</span>
            <span class="error-message"></span>
        `;
        documentosContainer.appendChild(div);
    });
    updateProgressBar(); // Atualiza o progresso após a atualização dos documentos
}

// --- Funções de Validação Global e por Campo ---

// Valida um único campo e atualiza o feedback visual
function validateField(inputElement) {
    let isValid = true;
    const errorSpan = inputElement.parentNode.querySelector('.error-message');
    
    // Limpa mensagens de erro anteriores
    if (errorSpan) errorSpan.textContent = '';
    inputElement.classList.remove('error-border');

    // Se o campo estiver desabilitado ou for somente leitura, não valida
    if (inputElement.disabled || inputElement.readOnly) {
        return true;
    }

    // Validação para campos de seleção inicial (sempre obrigatórios)
    if (['tipo-locacao', 'tipo-pessoa', 'tipo-atividade', 'estado-civil', 'garantia'].includes(inputElement.id)) {
        if (!inputElement.value.trim()) {
            isValid = false;
            if (errorSpan) errorSpan.textContent = 'Campo obrigatório.';
            inputElement.classList.add('error-border');
        }
    } 
    // Validação para outros campos obrigatórios (não opcionais)
    else if (!optionalFieldIds.includes(inputElement.id)) {
        // Verifica se o campo está visível (não dentro de uma seção hidden)
        const parentSection = inputElement.closest('section');
        const isVisible = !parentSection || !parentSection.classList.contains('hidden');

        if (isVisible && inputElement.value.trim() === '') {
            isValid = false;
            if (errorSpan) errorSpan.textContent = 'Campo obrigatório.';
            inputElement.classList.add('error-border');
        }
    }

    // Validações específicas para formatos
    switch (inputElement.id) {
        case 'cpf':
        case 'fiador-cpf':
            // A validação de CPF já é tratada em handleCpfInput, que também define a mensagem de erro
            // Se handleCpfInput já setou um erro, isValid será false
            if (inputElement.value.length > 0 && !validateCPF(inputElement.value.replace(/\D/g, ''))) {
                isValid = false;
            }
            break;
        case 'rg':
        case 'fiador-rg':
            // A validação de RG já é tratada em handleRgInput
            if (inputElement.value.length > 0 && inputElement.value.replace(/\D/g, '').length < 7) {
                isValid = false;
            }
            break;
        case 'celular':
        case 'fiador-celular':
            // A validação de telefone já é tratada em handlePhoneInput
            if (inputElement.value.length > 0 && !validatePhone(inputElement.value)) {
                isValid = false;
            }
            break;
        case 'email':
        case 'fiador-email':
            // A validação de e-mail já é tratada em handleEmailInput
            if (inputElement.value.length > 0 && !validateEmail(inputElement.value)) {
                isValid = false;
            }
            break;
        case 'cep-residencial':
        case 'cep-profissional':
        case 'cep-fiador-residencial':
        case 'fiador-cep-profissional':
            // Para CEP, se o campo não está vazio e o logradouro está vazio, indica erro na consulta
            const associatedLogradouro = document.getElementById(inputElement.id.replace('cep', 'logradouro'));
            if (inputElement.value.trim() !== '' && associatedLogradouro && associatedLogradouro.value.trim() === '') {
                 isValid = false;
                 if (errorSpan) errorSpan.textContent = 'CEP inválido ou não encontrado.';
                 inputElement.classList.add('error-border');
            }
            break;
        case 'remuneracao-mensal':
        case 'fiador-remuneracao-mensal':
            // Se o campo monetário é obrigatório e está vazio, ou se tem valor mas não é um número válido (após formatação)
            if (inputElement.value.trim() === '' && !optionalFieldIds.includes(inputElement.id)) {
                isValid = false;
                if (errorSpan) errorSpan.textContent = 'Campo obrigatório.';
                inputElement.classList.add('error-border');
            } else if (inputElement.value.trim() !== '' && parseFloat(inputElement.value.replace('R$', '').replace(/\./g, '').replace(',', '.')) === 0) {
                 // Se o valor é "R$ 0,00" e é obrigatório
                 isValid = false;
                 if (errorSpan) errorSpan.textContent = 'Valor deve ser maior que R$ 0,00.';
                 inputElement.classList.add('error-border');
            }
            break;
        case 'data-nascimento':
            if (inputElement.value.trim() === '') {
                isValid = false;
                if (errorSpan) errorSpan.textContent = 'Campo obrigatório.';
                inputElement.classList.add('error-border');
            }
            break;
    }

    // Para inputs de arquivo, verifica se é obrigatório e se está vazio
    if (inputElement.type === 'file') {
        const parentDiv = inputElement.closest('.input-group');
        const isRequiredFile = parentDiv && parentDiv.querySelector('label.required'); // Verifica se a label tem a classe 'required'
        
        if (isRequiredFile && inputElement.files.length === 0) {
            isValid = false;
            if (errorSpan) errorSpan.textContent = 'Documento obrigatório.';
            inputElement.classList.add('error-border');
        }
    }

    // Garante que a borda de erro seja removida se o campo for válido
    if (isValid) {
        inputElement.classList.remove('error-border');
        if (errorSpan) errorSpan.textContent = '';
    } else {
        inputElement.classList.add('error-border');
    }

    return isValid;
}


// Valida o formulário inteiro no momento da submissão
function validateForm() {
    let formIsValid = true;
    const allInputs = formCadastro.querySelectorAll('input:not([type="hidden"]), select, textarea');

    allInputs.forEach(input => {
        // Apenas valida campos que estão visíveis e não desabilitados
        const parentSection = input.closest('section');
        const isVisible = !parentSection || !parentSection.classList.contains('hidden');

        if (isVisible && !input.disabled) {
            // Chama validateField para cada input e atualiza o estado geral do formulário
            if (!validateField(input)) {
                formIsValid = false;
            }
        }
    });

    if (!formIsValid) {
        // Se houver erros, rola para o primeiro campo com erro
        const firstInvalid = document.querySelector('.error-border');
        if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus();
        }
    }
    return formIsValid;
}

// NOVO: Função para calcular e atualizar a barra de progresso
function updateProgressBar() {
    const allInputs = formCadastro.querySelectorAll('input:not([type="hidden"]), select, textarea');
    let totalRequiredVisibleFields = 0;
    let filledRequiredVisibleFields = 0;

    allInputs.forEach(input => {
        const parentSection = input.closest('section');
        const isVisible = !parentSection || !parentSection.classList.contains('hidden');
        const isOptional = optionalFieldIds.includes(input.id);
        const isReadOnly = input.readOnly; // Campos somente leitura (CEP)

        // Considera apenas campos visíveis, não desabilitados, não somente leitura e não opcionais
        if (isVisible && !input.disabled && !isOptional && !isReadOnly) {
            // Para inputs de arquivo, verifica se a label tem a classe 'required'
            const isRequiredFile = input.type === 'file' && input.closest('.input-group')?.querySelector('label.required');

            if (input.type !== 'file' || isRequiredFile) { // Inclui todos os tipos de input obrigatórios e inputs de arquivo obrigatórios
                totalRequiredVisibleFields++;
                if (input.value.trim() !== '') {
                    filledRequiredVisibleFields++;
                } else if (input.type === 'file' && input.files.length > 0) {
                    filledRequiredVisibleFields++;
                }
            }
        }
    });

    let progress = 0;
    if (totalRequiredVisibleFields > 0) {
        progress = (filledRequiredVisibleFields / totalRequiredVisibleFields) * 100;
    }
    
    progressBar.style.width = `${progress}%`;
}


// NOVO: Função para limpar todos os campos do formulário
function clearFormFields() {
    formCadastro.querySelectorAll('input, select, textarea').forEach(input => {
        if (input.type === 'file') {
            input.value = '';
        } else if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
        } else {
            input.value = '';
        }

        input.classList.remove('error-border');
        const errorSpan = input.parentNode.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = '';
        }
    });

    informacoesPessoaisSection.classList.add("hidden");
    enderecoResidencialSection.classList.add("hidden");
    dadosProfissionaisSection.classList.add("hidden");
    informacoesFiadorSection.classList.add("hidden");
    enderecoFiadorSection.classList.add("hidden");
    dadosProfissionaisFiadorSection.classList.add("hidden");

    atualizarDocumentos(); // Re-executa para redefinir os campos de anexo e suas instruções
    updateProgressBar(); // Reseta o progresso
}


// --- Event Listeners ---

// Listeners para os selects iniciais (sempre presentes)
[tipoPessoa, tipoAtividade, estadoCivil, tipoLocacao, garantia].forEach(el =>
    el.addEventListener("change", () => {
        atualizarDocumentos(); // Atualiza seções e documentos
        updateProgressBar();   // Atualiza o progresso
    })
);

// Adiciona listeners 'blur' e 'input' para validação em tempo real e atualização do progresso
formCadastro.addEventListener('input', function(event) {
    const target = event.target;
    if (target.disabled) return;

    switch (target.id) {
        case 'cep-residencial':
            formatCepInput(target);
            // consultaCEP é async, updateProgressBar é chamado dentro dela
            break;
        case 'cep-profissional':
            formatCepInput(target);
            break;
        case 'cep-fiador-residencial':
            formatCepInput(target);
            break;
        case 'fiador-cep-profissional':
            formatCepInput(target);
            break;
        case 'cpf':
        case 'fiador-cpf':
            handleCpfInput(target);
            break;
        case 'rg':
        case 'fiador-rg':
            handleRgInput(target);
            break;
        case 'celular':
        case 'fiador-celular':
            handlePhoneInput(target);
            break;
        case 'email':
        case 'fiador-email':
            handleEmailInput(target);
            break;
        case 'remuneracao-mensal':
        case 'fiador-remuneracao-mensal':
            formatCurrencyInput(target);
            break;
        default:
            // Para outros campos de texto/data/número, apenas valida e atualiza progresso
            validateField(target);
            updateProgressBar();
            break;
    }
});

formCadastro.addEventListener('blur', function(event) {
    const target = event.target;
    // Evita validar selects que já disparam 'change' e causam 'input'
    if (target.tagName === 'SELECT' || target.disabled || target.type === 'file') return; 

    // Chama a validação para o campo ao perder o foco (blur)
    validateField(target);
    updateProgressBar();
}, true); // Use 'true' para fase de captura, para pegar o evento antes de elementos internos

// Listener para campos de arquivo para atualização do progresso
formCadastro.addEventListener('change', function(event) {
    const target = event.target;
    if (target.type === 'file') {
        validateField(target); // Valida o campo de arquivo ao selecionar
        updateProgressBar();
    }
});


window.addEventListener("DOMContentLoaded", () => {
    atualizarDocumentos(); // Inicializa as seções e documentos
    updateProgressBar();   // Inicializa a barra de progresso
});


formCadastro.addEventListener('submit', async function(event) {
    event.preventDefault();

    // Valida todo o formulário antes de tentar enviar
    if (!validateForm()) {
        return;
    }

    showLoadingOverlay();

    const form = event.target;
    const formData = new FormData(form);

    const backendUrl = 'https://formulario-locacao-app-16f3a36a3730.herokuapp.com'; 

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            clearFormFields(); 
            hideLoadingOverlay();
            window.location.href = 'sucesso.html'; 
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido no servidor.' }));
            // Em caso de erro, não redireciona, apenas mostra o alerta e esconde o overlay
            alert(`Erro ao enviar formulário: ${errorData.message || 'Ocorreu um problema ao processar sua solicitação.'}`);
            console.error('Detalhes do erro do backend:', errorData);
        }
    } catch (error) {
        alert('Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.');
        console.error('Erro na requisição fetch:', error);
    } finally {
        hideLoadingOverlay();
    }
});

// Funções para mostrar e esconder o overlay de carregamento
function showLoadingOverlay() {
    loadingOverlay.classList.add('visible');
}

function hideLoadingOverlay() {
    loadingOverlay.classList.remove('visible');
}
