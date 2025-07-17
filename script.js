// script.js

// Seleção de elementos do DOM
const tipoPessoa = document.getElementById("tipo-pessoa");
const tipoAtividade = document.getElementById("tipo-atividade");
const estadoCivil = document.getElementById("estado-civil");
const tipoLocacao = document.getElementById("tipo-locacao");
const garantia = document.getElementById("garantia");
const documentosContainer = document.getElementById("documentos-container");

// Seções principais do locatário
const informacoesPessoaisSection = document.getElementById("informacoes-pessoais-section");
const enderecoResidencialSection = document.getElementById("endereco-residencial-section");
const dadosProfissionaisSection = document.getElementById("dados-profissionais-section");

// Seções do fiador
const informacoesFiadorSection = document.getElementById("informacoes-fiador-section");
const enderecoFiadorSection = document.getElementById("endereco-fiador-section");
const dadosProfissionaisFiadorSection = document.getElementById("dados-profissionais-fiador-section");

// Inputs de CEP e erros
const cepResidencialInput = document.getElementById("cep-residencial");
const logradouroResidencialInput = document.getElementById("logradouro-residencial");
const bairroResidencialInput = document.getElementById("bairro-residencial");
const cidadeResidencialInput = document.getElementById("cidade-residencial");
const estadoResidencialInput = document.getElementById("estado-residencial");
const cepResidencialError = document.getElementById("cep-residencial-error");

const cepProfissionalInput = document.getElementById("cep-profissional");
const logradouroProfissionalInput = document.getElementById("logradouro-profissional");
const bairroProfissionalInput = document.getElementById("bairro-profissional");
const cidadeProfissionalInput = document.getElementById("cidade-profissional");
const estadoProfissionalInput = document.getElementById("estado-profissional");
const cepProfissionalError = document.getElementById("cep-profissional-error");

const cepFiadorResidencialInput = document.getElementById("cep-fiador-residencial");
const logradouroFiadorResidencialInput = document.getElementById("logradouro-fiador-residencial");
const bairroFiadorResidencialInput = document.getElementById("bairro-fiador-residencial");
const cidadeFiadorResidencialInput = document.getElementById("cidade-fiador-residencial");
const estadoFiadorResidencialInput = document.getElementById("estado-fiador-residencial");
const cepFiadorResidencialError = document.getElementById("cep-fiador-residencial-error");

const cepFiadorProfissionalInput = document.getElementById("cep-fiador-profissional");
const logradouroFiadorProfissionalInput = document.getElementById("logradouro-fiador-profissional");
const bairroFiadorProfissionalInput = document.getElementById("bairro-fiador-profissional");
const cidadeFiadorProfissionalInput = document.getElementById("cidade-fiador-profissional");
const estadoFiadorProfissionalInput = document.getElementById("estado-fiador-profissional");
const cepFiadorProfissionalError = document.getElementById("cep-fiador-profissional-error");

// Inputs e erros para CPF, RG, Celular, Email
const cpfInput = document.getElementById("cpf");
const cpfError = document.getElementById("cpf-error");
const fiadorCpfInput = document.getElementById("fiador-cpf");
const fiadorCpfError = document.getElementById("fiador-cpf-error");

const rgInput = document.getElementById("rg");
const rgError = document.getElementById("rg-error");
const fiadorRgInput = document.getElementById("fiador-rg");
const fiadorRgError = document.getElementById("fiador-rg-error");

const celularInput = document.getElementById("celular");
const celularError = document.getElementById("celular-error");
const fiadorCelularInput = document.getElementById("fiador-celular");
const fiadorCelularError = document.getElementById("fiador-celular-error");

const emailInput = document.getElementById("email");
const emailError = document.getElementById("email-error");
const fiadorEmailInput = document.getElementById("fiador-email");
const fiadorEmailError = document.getElementById("fiador-email-error");

// Inputs para Remuneração Mensal
const remuneracaoMensalInput = document.getElementById("remuneracao-mensal");
const fiadorRemuneracaoMensalInput = document.getElementById("fiador-remuneracao-mensal");

// --- Funções de Utilitário ---

// Limpa os campos de endereço
function clearAddressFields(type) {
    const fieldsMap = {
        'residencial': {
            logradouro: logradouroResidencialInput,
            bairro: bairroResidencialInput,
            cidade: cidadeResidencialInput,
            estado: estadoResidencialInput,
            error: cepResidencialError
        },
        'profissional': {
            logradouro: logradouroProfissionalInput,
            bairro: bairroProfissionalInput,
            cidade: cidadeProfissionalInput,
            estado: estadoProfissionalInput,
            error: cepProfissionalError
        },
        'fiador-residencial': {
            logradouro: logradouroFiadorResidencialInput,
            bairro: bairroFiadorResidencialInput,
            cidade: cidadeFiadorResidencialInput,
            estado: estadoFiadorResidencialInput,
            error: cepFiadorResidencialError
        },
        'fiador-profissional': {
            logradouro: logradouroFiadorProfissionalInput,
            bairro: bairroFiadorProfissionalInput,
            cidade: cidadeFiadorProfissionalInput,
            estado: estadoFiadorProfissionalInput,
            error: cepFiadorProfissionalError
        }
    };

    const fields = fieldsMap[type];
    if (fields) {
        fields.logradouro.value = "";
        fields.bairro.value = "";
        fields.cidade.value = "";
        fields.estado.value = "";
        fields.error.textContent = "";
    }
}

// Consulta CEP em APIs externas (ViaCEP e Brasil API)
async function consultarCep(cep, type) {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
        return;
    }

    let targetFields;
    let targetError;

    if (type === 'residencial') {
        targetFields = { logradouro: logradouroResidencialInput, bairro: bairroResidencialInput, cidade: cidadeResidencialInput, estado: estadoResidencialInput };
        targetError = cepResidencialError;
    } else if (type === 'profissional') {
        targetFields = { logradouro: logradouroProfissionalInput, bairro: bairroProfissionalInput, cidade: cidadeProfissionalInput, estado: estadoProfissionalInput };
        targetError = cepProfissionalError;
    } else if (type === 'fiador-residencial') {
        targetFields = { logradouro: logradouroFiadorResidencialInput, bairro: bairroFiadorResidencialInput, cidade: cidadeFiadorResidencialInput, estado: estadoFiadorResidencialInput };
        targetError = cepFiadorResidencialError;
    } else if (type === 'fiador-profissional') {
        targetFields = { logradouro: logradouroFiadorProfissionalInput, bairro: bairroFiadorProfissionalInput, cidade: cidadeFiadorProfissionalInput, estado: estadoFiadorProfissionalInput };
        targetError = cepFiadorProfissionalError;
    } else {
        return;
    }

    try {
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await viaCepResponse.json();

        if (viaCepResponse.ok && !data.erro) {
            targetFields.logradouro.value = data.logradouro;
            targetFields.bairro.value = data.bairro;
            targetFields.cidade.value = data.localidade;
            targetFields.estado.value = data.uf;
            targetError.textContent = "";
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
                targetFields.logradouro.value = data.street;
                targetFields.bairro.value = data.neighborhood;
                targetFields.cidade.value = data.city;
                targetFields.estado.value = data.state;
                targetError.textContent = "";
                return;
            } else {
                throw new Error("Brasil API também falhou ou CEP não encontrado.");
            }
        } catch (brasilApiError) {
            console.error("Erro ao consultar CEP em ambas as APIs:", brasilApiError.message);
            targetError.textContent = "CEP inválido ou não encontrado.";
            clearAddressFields(type);
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

function handleCpfInput(inputElement, errorElement) {
    formatCPFInput(inputElement);
    const cleanedCpf = inputElement.value.replace(/\D/g, '');
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
    }
    else {
        errorElement.textContent = "";
        inputElement.classList.remove('error-border');
    }
}

// Formata RG (00.000.000-0)
function handleRgInput(inputElement, errorElement) {
    let value = inputElement.value.replace(/\D/g, '');
    if (value.length > 8) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
    } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2.$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{3})$/, '$1.$2');
    }
    inputElement.value = value;
    const cleanedRg = inputElement.value.replace(/\D/g, '');
    if (cleanedRg.length > 0 && cleanedRg.length < 7) {
        errorElement.textContent = "RG incompleto";
        inputElement.classList.add('error-border');
    } else {
        errorElement.textContent = "";
        inputElement.classList.remove('error-border');
    }
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

function handlePhoneInput(inputElement, errorElement) {
    formatPhoneInput(inputElement);
    if (inputElement.value.length > 0 && !validatePhone(inputElement.value)) {
        errorElement.textContent = "Número de celular inválido";
        inputElement.classList.add('error-border');
    } else {
        errorElement.textContent = "";
        inputElement.classList.remove('error-border');
    }
}

// Valida formato de e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function handleEmailInput(inputElement, errorElement) {
    if (inputElement.value.length > 0 && !validateEmail(inputElement.value)) {
        errorElement.textContent = "Formato de e-mail inválido";
        inputElement.classList.add('error-border');
    } else {
        errorElement.textContent = "";
        inputElement.classList.remove('error-border');
    }
}

// Formata valores monetários (R$ 0.000,00) com máscara automática e casas decimais dinâmicas
function formatCurrencyInput(inputElement) {
    let value = inputElement.value.replace(/\D/g, ''); // Remove todos os não-dígitos

    if (value === '') {
        inputElement.value = ''; // Limpa o campo se não houver dígitos
        inputElement.classList.remove('error-border');
        return;
    }

    // Garante que o valor tenha pelo menos 2 dígitos para as casas decimais (Ex: "5" vira "05")
    while (value.length < 2) {
        value = '0' + value;
    }

    // Adiciona o ponto decimal antes dos últimos dois dígitos para representar os centavos
    // Ex: "12345" vira "123.45", "05" vira "0.05"
    let numberValue = parseFloat(value.slice(0, -2) + '.' + value.slice(-2));

    // Formata o número como moeda brasileira
    inputElement.value = numberValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2, // Garante sempre duas casas decimais
        maximumFractionDigits: 2  // Impede mais de duas casas decimais
    });
    inputElement.classList.remove('error-border'); // Remove a borda de erro se o valor for válido
}

// --- Lógica de Exibição Dinâmica das Seções e Documentos ---

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
    enderecoResidencialSection.classList.add("hidden");
    dadosProfissionaisSection.classList.add("hidden");
    informacoesFiadorSection.classList.add("hidden");
    enderecoFiadorSection.classList.add("hidden");
    dadosProfissionaisFiadorSection.classList.add("hidden");

    const filtrosPreenchidos =
        tipoLocacao.value &&
        tipoPessoa.value &&
        tipoAtividade.value &&
        estadoCivil.value &&
        garantia.value;

    if (!filtrosPreenchidos) {
        resetPjLabels();
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
        enderecoResidencialSection.classList.remove("hidden");
        dadosProfissionaisSection.classList.remove("hidden");

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
        enderecoFiadorSection.classList.remove("hidden");
        dadosProfissionaisFiadorSection.classList.remove("hidden");

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

    docs.forEach(doc => {
        const div = document.createElement("div");
        div.classList.add("input-group");
        const fieldName = doc.toLowerCase().normalize('NFD').replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
        div.innerHTML = `<label class="required">${doc}:</label><input type="file" name="${fieldName}">`; // Anexos não obrigatórios
        documentosContainer.appendChild(div);
    });
}

// --- Funções de Validação Global ---
function validateForm() {
    let isValid = true;
    const allRequiredInputs = document.querySelectorAll('#form-cadastro [required]');

    // Limpa mensagens de erro e bordas de validações anteriores
    document.querySelectorAll('.input-group .error-message').forEach(msg => {
        if (msg.textContent === 'Campo obrigatório.') {
            msg.remove();
        }
    });
    document.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));

    allRequiredInputs.forEach(input => {
        // Verifica se o campo está dentro de uma seção visível
        const parentSection = input.closest('section');
        const isVisible = !parentSection || !parentSection.classList.contains('hidden');

        if (isVisible) {
            if (input.type === 'file') {
                // Campos de arquivo não são obrigatórios por design (já ajustado)
                // Não adicionamos borda vermelha nem mensagem genérica para files vazios
            } else if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error-border');
                // Adiciona mensagem de "Campo obrigatório" apenas se não houver outra mensagem de erro específica
                const existingErrorMessage = input.parentNode.querySelector('.error-message');
                if (!existingErrorMessage || existingErrorMessage.textContent === '') {
                    const errorMessageSpan = document.createElement('span');
                    errorMessageSpan.classList.add('error-message');
                    errorMessageSpan.textContent = 'Campo obrigatório.';
                    input.parentNode.insertBefore(errorMessageSpan, input.nextSibling);
                }
            } else {
                input.classList.remove('error-border');
            }
        }
    });

    // Re-verifica validações específicas para campos que podem ter erros de formato (CPF, RG, Celular, Email)
    // As funções handleXxxInput já aplicam a classe 'error-border' e a mensagem específica
    const specificValidationInputs = [
        cpfInput, fiadorCpfInput, rgInput, fiadorRgInput, celularInput, fiadorCelularInput,
        emailInput, fiadorEmailInput, remuneracaoMensalInput, fiadorRemuneracaoMensalInput
    ];

    specificValidationInputs.forEach(input => {
        const parentSection = input.closest('section');
        const isVisible = !parentSection || !parentSection.classList.contains('hidden');
        if (isVisible) {
            const errorSpan = input.parentNode.querySelector('.error-message');
            if (errorSpan && errorSpan.textContent !== '') {
                isValid = false; // Indica que há um erro de validação
                input.classList.add('error-border'); // Garante a borda vermelha
            } else {
                input.classList.remove('error-border'); // Remove a borda se o campo estiver válido
            }
        }
    });

    if (!isValid) {
        alert('Por favor, preencha todos os campos obrigatórios e corrija os erros indicados.');
        const firstInvalid = document.querySelector('.error-border');
        if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus();
        }
    }

    return isValid;
}


// --- Event Listeners ---

[tipoPessoa, tipoAtividade, estadoCivil, tipoLocacao, garantia].forEach(el =>
    el.addEventListener("change", atualizarDocumentos)
);

cepResidencialInput.addEventListener("input", (event) => {
    formatCepInput(event.target);
    const cep = event.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
        consultarCep(cep, 'residencial');
    } else {
        clearAddressFields('residencial');
        cepResidencialError.textContent = "";
        event.target.classList.remove('error-border');
    }
});

cepProfissionalInput.addEventListener("input", (event) => {
    formatCepInput(event.target);
    const cep = event.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
        consultarCep(cep, 'profissional');
    } else {
        clearAddressFields('profissional');
        cepProfissionalError.textContent = "";
        event.target.classList.remove('error-border');
    }
});

cepFiadorResidencialInput.addEventListener("input", (event) => {
    formatCepInput(event.target);
    const cep = event.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
        consultarCep(cep, 'fiador-residencial');
    } else {
        clearAddressFields('fiador-residencial');
        cepFiadorResidencialError.textContent = "";
        event.target.classList.remove('error-border');
    }
});

cepFiadorProfissionalInput.addEventListener("input", (event) => {
    formatCepInput(event.target);
    const cep = event.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
        consultarCep(cep, 'fiador-profissional');
    } else {
        clearAddressFields('fiador-profissional');
        cepFiadorProfissionalError.textContent = "";
        event.target.classList.remove('error-border');
    }
});

cpfInput.addEventListener("input", () => handleCpfInput(cpfInput, cpfError));
fiadorCpfInput.addEventListener("input", () => handleCpfInput(fiadorCpfInput, fiadorCpfError));

rgInput.addEventListener("input", () => handleRgInput(rgInput, rgError));
fiadorRgInput.addEventListener("input", () => handleRgInput(fiadorRgInput, fiadorRgError));

celularInput.addEventListener("input", () => handlePhoneInput(celularInput, celularError));
fiadorCelularInput.addEventListener("input", () => handlePhoneInput(fiadorCelularInput, fiadorCelularError));

emailInput.addEventListener("input", () => handleEmailInput(emailInput, emailError));
fiadorEmailInput.addEventListener("input", () => handleEmailInput(fiadorEmailInput, fiadorEmailError));

remuneracaoMensalInput.addEventListener("input", () => formatCurrencyInput(remuneracaoMensalInput));
fiadorRemuneracaoMensalInput.addEventListener("input", () => formatCurrencyInput(fiadorRemuneracaoMensalInput));

window.addEventListener("DOMContentLoaded", atualizarDocumentos);

document.getElementById('form-cadastro').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário para validação customizada

    if (!validateForm()) {
        return; // Para a submissão se a validação falhar
    }

    const form = event.target;
    const formData = new FormData(form);

    const backendUrl = 'https://SUA-APLICACAO-HEROKU.herokuapp.com/submit-form'; // Lembre-se de substituir pela URL do seu backend

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            alert('Formulário enviado com sucesso!');
            // Redireciona para uma página de sucesso, se necessário
            // window.location.href = 'sucesso.html';
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido no servidor.' }));
            alert(`Erro ao enviar formulário: ${errorData.message || 'Ocorreu um problema ao processar sua solicitação.'}`);
            console.error('Detalhes do erro do backend:', errorData);
        }
    } catch (error) {
        alert('Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.');
        console.error('Erro na requisição fetch:', error);
    }
});