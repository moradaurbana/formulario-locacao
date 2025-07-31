// script.js

// Seleção de elementos do DOM que sempre existem ao carregar a página
const formCadastro = document.getElementById('form-cadastro');
const tipoPessoa = document.getElementById("tipo-pessoa");
const tipoAtividade = document.getElementById("tipo-atividade");
const estadoCivil = document.getElementById("estado-civil");
const tipoLocacao = document.getElementById("tipo-locacao");
const garantia = document.getElementById("garantia");
const documentosContainer = document.getElementById("documentos-container");
const loadingOverlay = document.getElementById('loading-overlay');

// Seções principais do locatário
const informacoesPessoaisSection = document.getElementById("informacoes-pessoais-section");
const enderecoResidencialSection = document.getElementById("endereco-residencial-section");
const dadosProfissionaisSection = document.getElementById("dados-profissionais-section");

// Seções do fiador
const informacoesFiadorSection = document.getElementById("informacoes-fiador-section");
const enderecoFiadorSection = document.getElementById("endereco-fiador-section");
const dadosProfissionaisFiadorSection = document.getElementById("dados-profissionais-fiador-section");

// Elementos para a lógica de Nacionalidade
const nacionalidadeSelect = document.getElementById('nacionalidade');
const nacionalidadeBrasileiraGroup = document.getElementById('nacionalidade-brasileira-group');
const nacionalidadeEstrangeiraGroup = document.getElementById('nacionalidade-estrangeira-group');
const nacionalidadeDuplaGroup = document.getElementById('nacionalidade-dupla-group');
const nacionalidadeOutraGroup = document.getElementById('nacionalidade-outra-group');

// --- Funções de Utilitário ---

// Limpa os campos de endereço
function clearAddressFields(type) {
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
                return;
            } else {
                throw new Error("Brasil API também falhou ou CEP não encontrado.");
            }
        } catch (brasilApiError) {
            console.error("Erro ao consultar CEP em ambas as APIs:", brasilApiError.message);
            if (cepErrorSpan) cepErrorSpan.textContent = "CEP inválido ou não encontrado.";
            if (inputElement) inputElement.classList.add('error-border');
            clearAddressFields(type);
        }
    }
}

// Formata CEP
function formatCepInput(inputElement) {
    let value = inputElement.value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    }
    inputElement.value = value;
}

// Formata e valida CPF
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
}

// Formata e valida RG
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
}

// Formata e valida Telefone
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
}

// Valida e-mail
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
}

// Formata valores monetários
function formatCurrencyInput(inputElement) {
    let value = inputElement.value.replace(/\D/g, '');
    if (value === '') {
        inputElement.value = '';
        inputElement.classList.remove('error-border');
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
}

// --- Lógica de Exibição Dinâmica das Seções e Documentos ---

function toggleSectionInputs(section, enable) {
    section.querySelectorAll('input, select, textarea').forEach(input => {
        if (['tipo-locacao', 'tipo-pessoa', 'tipo-atividade', 'estado-civil', 'garantia', 'nacionalidade'].includes(input.id)) {
            return;
        }
        input.disabled = !enable;
        if (!enable) {
            input.value = '';
            input.classList.remove('error-border');
            input.removeAttribute('required');
            const errorSpan = input.parentNode.querySelector('.error-message');
            if (errorSpan) {
                errorSpan.textContent = '';
            }
        }
    });
}

function hideAllNacionalidadeGroups() {
    [nacionalidadeBrasileiraGroup, nacionalidadeEstrangeiraGroup, nacionalidadeDuplaGroup, nacionalidadeOutraGroup].forEach(group => {
        group.classList.add('hidden');
        toggleSectionInputs(group, false);
    });
}

function toggleNacionalidadeFields() {
    hideAllNacionalidadeGroups();
    const selectedNacionalidade = nacionalidadeSelect.value;
    switch (selectedNacionalidade) {
        case 'brasileira':
            nacionalidadeBrasileiraGroup.classList.remove('hidden');
            toggleSectionInputs(nacionalidadeBrasileiraGroup, true);
            document.getElementById('uf_nascimento').setAttribute('required', 'true');
            document.getElementById('cidade_nascimento').setAttribute('required', 'true');
            break;
        case 'estrangeira':
            nacionalidadeEstrangeiraGroup.classList.remove('hidden');
            toggleSectionInputs(nacionalidadeEstrangeiraGroup, true);
            document.getElementById('pais_nascimento').setAttribute('required', 'true');
            document.getElementById('cidade_origem').removeAttribute('required');
            break;
        case 'dupla':
            nacionalidadeDuplaGroup.classList.remove('hidden');
            toggleSectionInputs(nacionalidadeDuplaGroup, true);
            document.getElementById('pais_principal').setAttribute('required', 'true');
            document.getElementById('cidade_principal').setAttribute('required', 'true');
            document.getElementById('segundo_pais').removeAttribute('required');
            document.getElementById('segunda_cidade').removeAttribute('required');
            break;
        case 'outra':
            nacionalidadeOutraGroup.classList.remove('hidden');
            toggleSectionInputs(nacionalidadeOutraGroup, true);
            document.getElementById('naturalidade_texto_livre').setAttribute('required', 'true');
            break;
        default:
            break;
    }
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
    document.getElementById("informacoes-conjuge-section").classList.add("hidden");
    toggleSectionInputs(document.getElementById("informacoes-conjuge-section"), false);
    document.getElementById("dados-profissionais-conjuge-section").classList.add("hidden");
    toggleSectionInputs(document.getElementById("dados-profissionais-conjuge-section"), false);

    const filtrosPreenchidos = tipoLocacao.value && tipoPessoa.value && tipoAtividade.value && estadoCivil.value && garantia.value;

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
                    "Comprovante de renda familiar",
                    "Comprovante de residência atual"
                );
            }
        } else if (isPessoaJuridica) {
            docs.push(
                "Contrato Social da Empresa e Última Alteração Contratual Consolidada",
                "CNPJ",
                "Comprovante de Faturamento (DRE - Declaração de Renda e Despesas)",
                "Documentos dos Sócios (RG e CPF)",
                "Declaração de IR da Empresa",
                "Comprovante de endereço da empresa"
            );
            document.querySelector('label[for="nome-completo"]').textContent = 'Nome do Sócio/Representante';
            document.querySelector('label[for="cpf"]').textContent = 'CPF do Sócio/Representante';
            document.querySelector('label[for="rg"]').textContent = 'RG do Sócio/Representante';
            document.querySelector('label[for="data-nascimento"]').textContent = 'Data de Nascimento do Sócio/Representante';
            document.querySelector('label[for="celular"]').textContent = 'Celular do Sócio/Representante';
            document.querySelector('label[for="email"]').textContent = 'Email do Sócio/Representante';
            document.querySelector('label[for="cep-residencial"]').textContent = 'CEP Residencial do Sócio/Representante';
            informacoesPessoaisSection.querySelector('h2').textContent = 'Informações do Sócio/Representante';
            enderecoResidencialSection.querySelector('h2').textContent = 'Endereço Residencial do Sócio/Representante';
            dadosProfissionaisSection.querySelector('h2').textContent = 'Dados Profissionais do Sócio/Representante';
            document.querySelector('label[for="nome-empresa"]').textContent = 'Nome da Empresa (Sócio)';
            document.querySelector('label[for="cargo"]').textContent = 'Cargo (Sócio)';
            document.querySelector('label[for="remuneracao-mensal"]').textContent = 'Pró-labore Mensal (Sócio)';
        }
    }

    if (estadoCivilCasadoUniaoEstavel) {
        document.getElementById("informacoes-conjuge-section").classList.remove("hidden");
        toggleSectionInputs(document.getElementById("informacoes-conjuge-section"), true);

        if (isPessoaFisica) {
            docs.push(
                "RG do Cônjuge",
                "CPF do Cônjuge"
            );
            const tipoAtividadeConjuge = document.getElementById("tipo-atividade-conjuge").value;
            if (tipoAtividadeConjuge && !["desempregado", "do-lar"].includes(tipoAtividadeConjuge)) {
                document.getElementById("dados-profissionais-conjuge-section").classList.remove("hidden");
                toggleSectionInputs(document.getElementById("dados-profissionais-conjuge-section"), true);
                docs.push("Comprovante de Renda do Cônjuge", "Declaração de IR do Cônjuge");
            }
        }
    }

    if (garantiaFiador) {
        informacoesFiadorSection.classList.remove("hidden");
        toggleSectionInputs(informacoesFiadorSection, true);
        enderecoFiadorSection.classList.remove("hidden");
        toggleSectionInputs(enderecoFiadorSection, true);
        dadosProfissionaisFiadorSection.classList.remove("hidden");
        toggleSectionInputs(dadosProfissionaisFiadorSection, true);

        docs.push(
            "RG do(s) Fiador(es)",
            "CPF do(s) Fiador(es)",
            "Comprovante de Renda do(s) Fiador(es)",
            "Extrato bancário do(s) Fiador(es) (últimos 90 dias)",
            "Declaração de IR do(s) Fiador(es)",
            "Comprovante de residência atual do(s) Fiador(es)",
            "Matrícula atualizada de imóvel(is) para comprovação da fiança"
        );
    }

    if (docs.length > 0) {
        document.getElementById("documentos-section").classList.remove("hidden");
        docs.forEach(doc => {
            const sanitizedName = doc.replace(/[^\w\s]/gi, '').replace(/\s/g, '-').toLowerCase();
            documentosContainer.appendChild(criaCampoDocumento(doc, sanitizedName));
        });
    } else {
        document.getElementById("documentos-section").classList.add("hidden");
    }
}

// NOVO CÓDIGO - Função para criar campo de documento com novo visual e UX aprimorada
function criaCampoDocumento(label, name) {
    const div = document.createElement("div");
    div.classList.add("file-input-group");

    const labelElement = document.createElement("label");
    labelElement.classList.add("file-label", "required");
    labelElement.textContent = `${label}:`;
    labelElement.setAttribute('for', name);

    const fileContainer = document.createElement("div");
    fileContainer.classList.add("file-container");

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("id", name);
    input.setAttribute("name", name);
    input.setAttribute("required", true);
    input.setAttribute("accept", ".jpg, .jpeg, .pdf");

    const buttonLabel = document.createElement("label");
    buttonLabel.classList.add("file-button-label");
    buttonLabel.setAttribute('for', name);
    buttonLabel.innerHTML = '<i class="fas fa-paperclip"></i> Anexar Arquivo';

    const fileNameSpan = document.createElement("span");
    fileNameSpan.classList.add("file-name");

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-file-btn");
    removeBtn.setAttribute('type', 'button');
    removeBtn.innerHTML = '<i class="fas fa-times-circle"></i>';

    fileContainer.appendChild(input); // Input escondido
    fileContainer.appendChild(buttonLabel);
    fileContainer.appendChild(fileNameSpan);
    fileContainer.appendChild(removeBtn);

    div.appendChild(labelElement);
    div.appendChild(fileContainer);

    input.addEventListener('change', function(e) {
        const maxSizeMB = 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const acceptedTypes = ['image/jpeg', 'application/pdf'];

        if (this.files.length > 0) {
            const file = this.files[0];
            if (file.size > maxSizeBytes || !acceptedTypes.includes(file.type)) {
                alert(`O arquivo "${file.name}" não é válido. Verifique o tamanho (máx. ${maxSizeMB}MB) e o formato (JPG, JPEG, PDF).`);
                this.value = ''; // Limpa o input
                buttonLabel.classList.add('error');
                buttonLabel.classList.remove('success');
                fileNameSpan.classList.remove('visible');
                removeBtn.classList.remove('visible');
            } else {
                buttonLabel.classList.remove('error');
                buttonLabel.classList.add('success');
                fileNameSpan.textContent = file.name;
                fileNameSpan.classList.add('visible');
                removeBtn.classList.add('visible');
            }
        } else {
            buttonLabel.classList.remove('success', 'error');
            fileNameSpan.textContent = '';
            fileNameSpan.classList.remove('visible');
            removeBtn.classList.remove('visible');
        }
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        input.value = null; // Limpa o valor do input
        buttonLabel.classList.remove('success', 'error');
        fileNameSpan.textContent = '';
        fileNameSpan.classList.remove('visible');
        removeBtn.classList.remove('visible');
    });

    return div;
}

// --- Event Listeners ---
tipoPessoa.addEventListener("change", atualizarDocumentos);
tipoAtividade.addEventListener("change", atualizarDocumentos);
estadoCivil.addEventListener("change", atualizarDocumentos);
tipoLocacao.addEventListener("change", atualizarDocumentos);
garantia.addEventListener("change", atualizarDocumentos);

const tipoAtividadeConjuge = document.getElementById("tipo-atividade-conjuge");
if (tipoAtividadeConjuge) {
    tipoAtividadeConjuge.addEventListener("change", atualizarDocumentos);
}

if (nacionalidadeSelect) {
    nacionalidadeSelect.addEventListener('change', toggleNacionalidadeFields);
}
const nacionalidadeConjugeSelect = document.getElementById('nacionalidade-conjuge');
const nacionalidadeConjugeBrasileiraGroup = document.getElementById('nacionalidade-conjuge-brasileira-group');
const nacionalidadeConjugeEstrangeiraGroup = document.getElementById('nacionalidade-conjuge-estrangeira-group');
if (nacionalidadeConjugeSelect) {
    nacionalidadeConjugeSelect.addEventListener('change', function() {
        if (this.value === 'brasileira') {
            nacionalidadeConjugeBrasileiraGroup.classList.remove('hidden');
            nacionalidadeConjugeEstrangeiraGroup.classList.add('hidden');
            toggleSectionInputs(nacionalidadeConjugeBrasileiraGroup, true);
            toggleSectionInputs(nacionalidadeConjugeEstrangeiraGroup, false);
            document.getElementById('uf_nascimento_conjuge').setAttribute('required', 'true');
            document.getElementById('cidade_nascimento_conjuge').setAttribute('required', 'true');
        } else if (this.value === 'estrangeira') {
            nacionalidadeConjugeEstrangeiraGroup.classList.remove('hidden');
            nacionalidadeConjugeBrasileiraGroup.classList.add('hidden');
            toggleSectionInputs(nacionalidadeConjugeEstrangeiraGroup, true);
            toggleSectionInputs(nacionalidadeConjugeBrasileiraGroup, false);
            document.getElementById('pais_nascimento_conjuge').setAttribute('required', 'true');
        } else {
            nacionalidadeConjugeEstrangeiraGroup.classList.add('hidden');
            nacionalidadeConjugeBrasileiraGroup.classList.add('hidden');
            toggleSectionInputs(nacionalidadeConjugeEstrangeiraGroup, false);
            toggleSectionInputs(nacionalidadeConjugeBrasileiraGroup, false);
        }
    });
}
const fiadorNacionalidadeSelect = document.getElementById('fiador-nacionalidade');
const fiadorNacionalidadeBrasileiraGroup = document.getElementById('fiador-nacionalidade-brasileira-group');
const fiadorNacionalidadeEstrangeiraGroup = document.getElementById('fiador-nacionalidade-estrangeira-group');
const fiadorNacionalidadeDuplaGroup = document.getElementById('fiador-nacionalidade-dupla-group');
const fiadorNacionalidadeOutraGroup = document.getElementById('fiador-nacionalidade-outra-group');
if(fiadorNacionalidadeSelect){
    fiadorNacionalidadeSelect.addEventListener('change', function(){
        [fiadorNacionalidadeBrasileiraGroup, fiadorNacionalidadeEstrangeiraGroup, fiadorNacionalidadeDuplaGroup, fiadorNacionalidadeOutraGroup].forEach(group => {
            group.classList.add('hidden');
            toggleSectionInputs(group, false);
        });
        const selectedNacionalidade = this.value;
        switch(selectedNacionalidade) {
            case 'brasileira':
                fiadorNacionalidadeBrasileiraGroup.classList.remove('hidden');
                toggleSectionInputs(fiadorNacionalidadeBrasileiraGroup, true);
                document.getElementById('fiador-uf_nascimento').setAttribute('required', 'true');
                document.getElementById('fiador-cidade_nascimento').setAttribute('required', 'true');
                break;
            case 'estrangeira':
                fiadorNacionalidadeEstrangeiraGroup.classList.remove('hidden');
                toggleSectionInputs(fiadorNacionalidadeEstrangeiraGroup, true);
                document.getElementById('fiador-pais_nascimento').setAttribute('required', 'true');
                document.getElementById('fiador-cidade_origem').removeAttribute('required');
                break;
            case 'dupla':
                fiadorNacionalidadeDuplaGroup.classList.remove('hidden');
                toggleSectionInputs(fiadorNacionalidadeDuplaGroup, true);
                document.getElementById('fiador-pais_principal').setAttribute('required', 'true');
                document.getElementById('fiador-cidade_principal').setAttribute('required', 'true');
                document.getElementById('fiador-segundo_pais').removeAttribute('required');
                document.getElementById('fiador-segunda_cidade').removeAttribute('required');
                break;
            case 'outra':
                fiadorNacionalidadeOutraGroup.classList.remove('hidden');
                toggleSectionInputs(fiadorNacionalidadeOutraGroup, true);
                document.getElementById('fiador-naturalidade_texto_livre').setAttribute('required', 'true');
                break;
        }
    });
}
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', () => handlePhoneInput(input));
});
document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('input', () => handleEmailInput(input));
});
document.querySelectorAll('input[name*="cep"]').forEach(input => {
    input.addEventListener('input', () => formatCepInput(input));
    input.addEventListener('blur', () => {
        const type = input.id.includes('residencial') ? 'residencial' : (input.id.includes('profissional') ? 'profissional' : 'fiador-residencial');
        consultarCep(input, type);
    });
});
document.querySelectorAll('input[name*="cpf"]').forEach(input => {
    input.addEventListener('input', () => handleCpfInput(input));
    input.addEventListener('blur', () => handleCpfInput(input));
});
document.querySelectorAll('input[name*="rg"]').forEach(input => {
    input.addEventListener('input', () => handleRgInput(input));
    input.addEventListener('blur', () => handleRgInput(input));
});
document.querySelectorAll('input[name*="remuneracao-mensal"]').forEach(input => {
    input.addEventListener('input', () => formatCurrencyInput(input));
});

formCadastro.addEventListener('submit', async function(event) {
    event.preventDefault();

    // Resetar estilos de erro
    formCadastro.querySelectorAll('.error-border, .error').forEach(el => {
        el.classList.remove('error-border', 'error');
    });

    let isValid = true;
    const requiredInputs = formCadastro.querySelectorAll('input[required]:not(:disabled), select[required]:not(:disabled)');
    requiredInputs.forEach(input => {
        if (!input.value.trim() && input.type !== 'file') {
            isValid = false;
            input.classList.add('error-border');
            const errorSpan = input.parentNode.querySelector('.error-message');
            if (errorSpan) errorSpan.textContent = "Campo obrigatório";
        } else if (input.type === 'file' && input.files.length === 0) {
            isValid = false;
            const fileContainer = input.closest('.file-container');
            if (fileContainer) {
                const buttonLabel = fileContainer.querySelector('.file-button-label');
                if(buttonLabel) buttonLabel.classList.add('error');
            }
        } else {
            input.classList.remove('error-border');
            const fileContainer = input.closest('.file-container');
            if (fileContainer) {
                const buttonLabel = fileContainer.querySelector('.file-button-label');
                if(buttonLabel) buttonLabel.classList.remove('error');
            }
            const errorSpan = input.parentNode.querySelector('.error-message');
            if (errorSpan) errorSpan.textContent = "";
        }
    });

    if (!isValid) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    loadingOverlay.classList.add('visible');

    const formData = new FormData(formCadastro);
    try {
        const response = await fetch("https://formulario-locacao-app.herokuapp.com/", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            window.location.href = "sucesso.html";
        } else {
            alert("Ocorreu um erro ao enviar a ficha. Por favor, tente novamente.");
            console.error("Erro no servidor:", response.status, response.statusText);
        }
    } catch (error) {
        alert("Não foi possível conectar com o servidor. Verifique sua conexão e tente novamente.");
        console.error("Erro ao enviar o formulário:", error);
    } finally {
        loadingOverlay.classList.remove('visible');
    }
});

document.addEventListener("DOMContentLoaded", () => {
    atualizarDocumentos();
});