// script.js

// Seleção de elementos do DOM que sempre existem ao carregar a página
const formCadastro = document.getElementById('form-cadastro');
const tipoPessoa = document.getElementById("tipo-pessoa");
const tipoAtividade = document.getElementById("tipo-atividade");
const estadoCivil = document.getElementById("estado-civil");
const tipoLocacao = document.getElementById("tipo-locacao");
const garantia = document.getElementById("garantia");
const documentosContainer = document.getElementById("documentos-container");

// Seções principais do locatário (também sempre existem, mas podem ser hidden/shown)
const informacoesPessoaisSection = document.getElementById("informacoes-pessoais-section");
const enderecoResidencialSection = document.getElementById("endereco-residencial-section");
const dadosProfissionaisSection = document.getElementById("dados-profissionais-section");

// Seções do fiador (também sempre existem, mas podem ser hidden/shown)
const informacoesFiadorSection = document.getElementById("informacoes-fiador-section");
const enderecoFiadorSection = document.getElementById("endereco-fiador-section");
const dadosProfissionaisFiadorSection = document.getElementById("dados-profissionais-fiador-section");

// --- Funções de Utilitário ---

// Limpa os campos de endereço
function clearAddressFields(type) {
    // Busca os elementos de endereço dinamicamente com base no 'type'
    const logradouroInput = document.getElementById("logradouro-" + type); // Corrigido aqui
    const bairroInput = document.getElementById("bairro-" + type);         // Corrigido aqui
    const cidadeInput = document.getElementById("cidade-" + type);         // Corrigido aqui
    const estadoInput = document.getElementById("estado-" + type);         // Corrigido aqui
    const errorSpan = document.getElementById("cep-" + type + "-error");   // Corrigido aqui

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
        // Limpa e sai se o CEP não tem 8 dígitos
        clearAddressFields(type);
        return;
    }

    // Busca os elementos de endereço e erro dinamicamente (IDs corrigidos aqui)
    const logradouroInput = document.getElementById("logradouro-" + type);
    const bairroInput = document.getElementById("bairro-" + type);
    const cidadeInput = document.getElementById("cidade-" + type);
    const estadoInput = document.getElementById("estado-" + type);
    const cepErrorSpan = document.getElementById("cep-" + type + "-error");

    // Pre-limpa os campos e erros antes da consulta para evitar dados antigos
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
            return; // Sai se ViaCEP for bem-sucedido
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
                return; // Sai se Brasil API for bem-sucedido
            } else {
                throw new Error("Brasil API também falhou ou CEP não encontrado.");
            }
        } catch (brasilApiError) {
            console.error("Erro ao consultar CEP em ambas as APIs:", brasilApiError.message);
            if (cepErrorSpan) cepErrorSpan.textContent = "CEP inválido ou não encontrado.";
            if (inputElement) inputElement.classList.add('error-border');
            clearAddressFields(type); // Limpa os campos em caso de erro
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
    const errorElement = inputElement.parentNode.querySelector('.error-message'); // Busca o erro dinamicamente
    const cleanedCpf = inputElement.value.replace(/\D/g, '');

    if (errorElement) { // Garante que o span de erro existe
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

    const errorElement = inputElement.parentNode.querySelector('.error-message'); // Busca o erro dinamicamente
    const cleanedRg = inputElement.value.replace(/\D/g, '');

    if (errorElement) { // Garante que o span de erro existe
        if (cleanedRg.length > 0 && cleanedRg.length < 7) {
            errorElement.textContent = "RG incompleto";
            inputElement.classList.add('error-border');
        } else {
            errorElement.textContent = "";
            inputElement.classList.remove('error-border');
        }
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

function handlePhoneInput(inputElement) {
    formatPhoneInput(inputElement); // Aplica a formatação
    const errorElement = inputElement.parentNode.querySelector('.error-message'); // Busca o erro dinamicamente

    if (errorElement) { // Garante que o span de erro existe
        if (inputElement.value.length > 0 && !validatePhone(inputElement.value)) {
            errorElement.textContent = "Número de celular inválido";
            inputElement.classList.add('error-border');
        } else {
            errorElement.textContent = "";
            inputElement.classList.remove('error-border');
        }
    }
}

// Valida formato de e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function handleEmailInput(inputElement) {
    const errorElement = inputElement.parentNode.querySelector('.error-message'); // Busca o erro dinamicamente

    if (errorElement) { // Garante que o span de erro existe
        if (inputElement.value.length > 0 && !validateEmail(inputElement.value)) {
            errorElement.textContent = "Formato de e-mail inválido";
            inputElement.classList.add('error-border');
        } else {
            errorElement.textContent = "";
            inputElement.classList.remove('error-border');
        }
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

// Nova função para habilitar/desabilitar inputs em uma seção
function toggleSectionInputs(section, enable) {
    section.querySelectorAll('input, select, textarea').forEach(input => {
        // Exclui os selects da seleção inicial, pois eles controlam a lógica de exibição
        if (input.id !== 'tipo-locacao' && input.id !== 'tipo-pessoa' && input.id !== 'tipo-atividade' && input.id !== 'estado-civil' && input.id !== 'garantia') {
            input.disabled = !enable;
            if (!enable) {
                // Limpa o valor e o estado de erro quando o campo é desabilitado
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
    // Labels do Locatário/Sócio/Representante
    document.querySelector('label[for="nome-completo"]').textContent = 'Nome Completo';
    document.querySelector('label[for="cpf"]').textContent = 'CPF';
    document.querySelector('label[for="rg"]').textContent = 'RG';
    document.querySelector('label[for="data-nascimento"]').textContent = 'Data de Nascimento';
    document.querySelector('label[for="celular"]').textContent = 'Celular (WhatsApp)';
    document.querySelector('label[for="email"]').textContent = 'Email';
    document.querySelector('label[for="cep-residencial"]').textContent = 'CEP';

    // Labels da Empresa/Profissional (locatário)
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

    // Títulos das Seções
    informacoesPessoaisSection.querySelector('h2').textContent = 'Informações Pessoais';
    enderecoResidencialSection.querySelector('h2').textContent = 'Endereço Residencial';
    dadosProfissionaisSection.querySelector('h2').textContent = 'Dados Profissionais';
}

function atualizarDocumentos() {
    documentosContainer.innerHTML = "";
    // Esconder todas as seções e desabilitar seus inputs inicialmente
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
            resetPjLabels(); // Garante que labels de PJ não fiquem ativas
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
            // Ajusta labels para PJ
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
        resetPjLabels(); // Garante que labels de PF/PJ estejam resetadas se as seções principais não são mostradas
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

    docs.forEach(doc => {
        const div = document.createElement("div");
        div.classList.add("input-group");
        const fieldName = doc.toLowerCase().normalize('NFD').replace(/[^\w\s]/g, '').replace(/\s+/g, '_');
        // Removido o atributo 'required' dos inputs de arquivo
        div.innerHTML = `<label class="required">${doc}:</label><input type="file" name="${fieldName}">`;
        documentosContainer.appendChild(div);
    });
}

// --- Funções de Validação Global ---
function validateForm() {
    let isValid = true;

    // Limpa mensagens de erro e bordas de validações anteriores
    document.querySelectorAll('.input-group .error-message').forEach(msg => {
        if (msg.textContent === 'Campo obrigatório.') {
            msg.remove();
        }
    });
    document.querySelectorAll('.error-border').forEach(el => el.classList.remove('error-border'));

    // Valida os campos da primeira seção de seleção (que sempre são visíveis e required no HTML)
    const initialSelects = document.querySelectorAll('#tipo-locacao, #tipo-pessoa, #tipo-atividade, #estado-civil, #garantia');
    initialSelects.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error-border');
            const errorMessageSpan = document.createElement('span');
            errorMessageSpan.classList.add('error-message');
            errorMessageSpan.textContent = 'Campo obrigatório.';
            input.parentNode.insertBefore(errorMessageSpan, input.nextSibling);
        }
    });


    // Valida dinamicamente todos os inputs dentro das seções visíveis e não desabilitadas
    const dynamicSections = [
        informacoesPessoaisSection,
        enderecoResidencialSection,
        dadosProfissionaisSection,
        informacoesFiadorSection,
        enderecoFiadorSection,
        dadosProfissionaisFiadorSection,
        documentosContainer // Para os inputs de arquivo
    ];

    dynamicSections.forEach(section => {
        // Apenas processa se a seção não estiver oculta
        if (!section.classList.contains('hidden')) {
            section.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
                // Se o input não estiver desabilitado (ou seja, é visível e ativo)
                if (!input.disabled) {
                    // Valida se o campo está vazio. Adicione esta verificação para campos que não têm validação específica (CPF, RG, etc.)
                    if (input.value.trim() === '' && !input.readOnly) { // Ignora campos readonly (CEP preenchido pela API)
                        isValid = false;
                        input.classList.add('error-border');
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
        }
    });


    // Re-verifica validações específicas para campos que podem ter erros de formato (CPF, RG, Celular, Email)
    document.querySelectorAll('[id$="-cpf"], [id$="-rg"], [id$="-celular"], [id$="-email"], [id$="-remuneracao-mensal"]').forEach(input => {
        // Verifica se o input está visível e habilitado antes de validar seu estado
        const parentSection = input.closest('section');
        const isVisibleAndEnabled = (!parentSection || !parentSection.classList.contains('hidden')) && !input.disabled;

        if (isVisibleAndEnabled) {
            const errorSpan = input.parentNode.querySelector('.error-message');
            if (errorSpan && errorSpan.textContent !== '') {
                isValid = false; // Indica que há um erro de validação de formato
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

// Listeners para os selects iniciais (sempre presentes)
[tipoPessoa, tipoAtividade, estadoCivil, tipoLocacao, garantia].forEach(el =>
    el.addEventListener("change", atualizarDocumentos)
);

window.addEventListener("DOMContentLoaded", atualizarDocumentos);


// Delegação de eventos para inputs que podem ser adicionados/removidos/habilitados/desabilitados
formCadastro.addEventListener('input', function(event) {
    const target = event.target;
    if (target.disabled) return; // Não processa eventos de campos desabilitados

    switch (target.id) {
        case 'cep-residencial':
            formatCepInput(target);
            consultarCep(target, 'residencial');
            break;
        case 'cep-profissional':
            formatCepInput(target);
            consultarCep(target, 'profissional');
            break;
        case 'cep-fiador-residencial':
            formatCepInput(target);
            consultarCep(target, 'fiador-residencial');
            break;
        case 'fiador-cep-profissional': // Notei que este ID está um pouco diferente 'fiador-cep-profissional' vs 'cep-fiador-profissional'
            formatCepInput(target);
            consultarCep(target, 'fiador-profissional');
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
    }
});


formCadastro.addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário para validação customizada

    if (!validateForm()) {
        return; // Para a submissão se a validação falhar
    }

    const form = event.target;
    const formData = new FormData(form);

    const backendUrl = 'https://formulario-locacao-app.herokuapp.com'; // Lembre-se de substituir pela URL do seu backend

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