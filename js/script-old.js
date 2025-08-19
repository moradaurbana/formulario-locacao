console.log('Script.js foi carregado com sucesso!');
document.addEventListener('DOMContentLoaded', () => {
    // Definindo as variáveis dos elementos HTML
    const tipoPessoaSelect = document.getElementById('tipoPessoa');
    const tipoAtividadeSelect = document.getElementById('tipoAtividade');
    const estadoCivilSelect = document.getElementById('estadoCivil');
    const tipoGarantiaSelect = document.getElementById('tipoGarantia');
    const formSections = document.getElementById('form-sections');
    const atividadeGroup = document.getElementById('atividade-group');
    const estadoCivilGroup = document.getElementById('estadoCivil-group');
    const garantiaGroup = document.getElementById('garantia-group');
    const pfSection = document.getElementById('pf-comum-section');
    const conjugePFSection = document.getElementById('conjuge-pf-section');
    const fiadorPFSection = document.getElementById('fiador-pf-section');
    const dadosProfissionaisPFSection = document.getElementById('dadosProfissionais-pf-section');
    const anexosPFSection = document.getElementById('anexos-pf-section');
    const anexosPFList = document.getElementById('anexos-pf-list');
    const pjSection = document.getElementById('pj-section');
    const conjugePJSection = document.getElementById('conjuge-pj-section');
    const fiadorPJSection = document.getElementById('fiador-pj-section');
    const anexosPJSection = document.getElementById('anexos-pj-section');
    const anexosPJList = document.getElementById('anexos-pj-list');
    const empresaPFGroup = document.getElementById('empresa-pf-group');
    const cargoPFGroup = document.getElementById('cargo-pf-group');
    const tempoEmpresaPFGroup = document.getElementById('tempo-empresa-pf-group');
    const remuneracaoPFGroup = document.getElementById('remuneracao-pf-group');
    const cepEmpresaPFGroup = document.getElementById('cep-empresa-pf-group');
    const logradouroEmpresaPFGroup = document.getElementById('logradouro-empresa-pf-group');
    const numeroEmpresaPFGroup = document.getElementById('numero-empresa-pf-group');
    const complementoEmpresaPFGroup = document.getElementById('complemento-empresa-pf-group');
    const bairroEmpresaPFGroup = document.getElementById('bairro-empresa-pf-group');
    const cidadeEmpresaPFGroup = document.getElementById('cidade-empresa-pf-group');
    const estadoEmpresaPFGroup = document.getElementById('estado-empresa-pf-group');

    // Funções para mostrar/esconder seções
    const showSection = (section) => { section.style.display = 'block'; };
    const hideSection = (section) => { section.style.display = 'none'; };
    const clearSectionInputs = (section) => {
        section.querySelectorAll('input, select').forEach(input => {
            if (input.type === 'file') {
                input.value = '';
            } else {
                input.value = '';
            }
        });
    };

    // Função para renderizar campos de anexo com base na regra
    const renderAnexosPF = (rule) => {
        anexosPFList.innerHTML = '';
        const documents = [];

        // Regras para Pessoa Física - Documentos comuns
        documents.push({ name: 'RG e CPF do Locatário(a)', id: 'docRGCpfLocatario', multiple: false });
        documents.push({ name: 'Extrato bancário (últimos 90 dias)', id: 'docExtratoBancario', multiple: false });
        documents.push({ name: 'Declaração de IR Locatário(a)', id: 'docIRLocatario', multiple: false });
        documents.push({ name: 'Comprovante de residência atual', id: 'docComprovanteResidencia', multiple: false });

        // Regras específicas por atividade e garantia
        if (rule.tipoPessoa === 'Pessoa Física') {
            if (rule.tipoAtividade === 'CLT') {
                documents.push({ name: 'Comprovante de Renda Locatário(a) (últimos 3 holerites)', id: 'docHolerites', multiple: true });
            } else if (rule.tipoAtividade === 'Aposentado/pensionista') {
                documents.push({ name: 'Comprovante de Renda Locatário(a) (extrato de benefício)', id: 'docExtratoBeneficio', multiple: false });
            } else if (rule.tipoAtividade === 'Profissional liberal' || rule.tipoAtividade === 'Empresário') {
                documents.push({ name: 'Contrato social da empresa ou comprovante de autônomo', id: 'docContratoSocial', multiple: false });
            }

            if (rule.estadoCivil === 'Casado(a)' || rule.estadoCivil === 'União estável') {
                documents.push({ name: 'RG e CPF do Cônjuge', id: 'docRGCpfConjuge', multiple: false });
            }

            if (rule.tipoGarantia === 'Fiador') {
                documents.push({ name: 'RG e CPF do(s) Fiador(es)', id: 'docRGCpfFiador', multiple: false });
                documents.push({ name: 'Comprovante de Renda do(s) Fiador(es)', id: 'docRendaFiador', multiple: true });
                documents.push({ name: 'Extrato bancário do(s) Fiador(es) (últimos 90 dias)', id: 'docExtratoBancarioFiador', multiple: false });
                documents.push({ name: 'Declaração de IR do(s) Fiador(es)', id: 'docIRFiador', multiple: false });
                documents.push({ name: 'Comprovante de residência atual do(s) Fiador(es)', id: 'docResidenciaFiador', multiple: false });
                documents.push({ name: 'Matrícula atualizada de imóvel(eis) para comprovação da fiança', id: 'docMatriculaImovel', multiple: true });
            }
        }
        
        documents.forEach(doc => {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `
                <label for="${doc.id}">${doc.name}:</label>
                <input type="file" id="${doc.id}" name="${doc.id}" ${doc.multiple ? 'multiple' : ''}>
            `;
            anexosPFList.appendChild(div);
        });
    };

    const renderAnexosPJ = (rule) => {
        anexosPJList.innerHTML = '';
        const documents = [];

        // Documentos Padrão para PJ
        documents.push({ name: 'Contrato Social da Empresa e Última Alteração Contratual Consolidada', id: 'docContratoSocialEmpresa', multiple: false });
        documents.push({ name: 'CNPJ', id: 'docCnpj', multiple: false });
        documents.push({ name: 'Comprovante de Faturamento (DRE)', id: 'docFaturamento', multiple: false });
        documents.push({ name: 'RG e CPF dos Sócios', id: 'docRGCpfSocios', multiple: true });
        documents.push({ name: 'Declaração de IR da Empresa', id: 'docIREmpresa', multiple: false });
        documents.push({ name: 'Comprovante de endereço da empresa', id: 'docEnderecoEmpresa', multiple: false });

        if (rule.tipoGarantia === 'Fiador') {
            documents.push({ name: 'RG e CPF do(s) Fiador(es)', id: 'docRGCpfFiador', multiple: false });
            // Documentos do fiador para PJ são os mesmos de PF
            documents.push({ name: 'Comprovante de Renda do(s) Fiador(es)', id: 'docRendaFiador', multiple: true });
            documents.push({ name: 'Extrato bancário do(s) Fiador(es) (últimos 90 dias)', id: 'docExtratoBancarioFiador', multiple: false });
            documents.push({ name: 'Declaração de IR do(s) Fiador(es)', id: 'docIRFiador', multiple: false });
            documents.push({ name: 'Comprovante de residência atual do(s) Fiador(es)', id: 'docResidenciaFiador', multiple: false });
            documents.push({ name: 'Matrícula atualizada de imóvel(eis) para comprovação da fiança', id: 'docMatriculaImovel', multiple: true });
        }

        documents.forEach(doc => {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `
                <label for="${doc.id}">${doc.name}:</label>
                <input type="file" id="${doc.id}" name="${doc.id}" ${doc.multiple ? 'multiple' : ''}>
            `;
            anexosPJList.appendChild(div);
        });
    };

    // Função principal para atualizar a exibição do formulário
    const updateFormDisplay = () => {
        const tipoPessoa = tipoPessoaSelect.value;
        const tipoAtividade = tipoAtividadeSelect.value;
        const estadoCivil = estadoCivilSelect.value;
        const tipoGarantia = tipoGarantiaSelect.value;

        // Limpa todas as seções antes de renderizar
        hideSection(formSections);
        hideSection(atividadeGroup);
        hideSection(estadoCivilGroup);
        hideSection(garantiaGroup);
        
        hideSection(pfSection);
        hideSection(conjugePFSection);
        hideSection(fiadorPFSection);
        hideSection(dadosProfissionaisPFSection);
        hideSection(anexosPFSection);

        hideSection(pjSection);
        hideSection(conjugePJSection);
        hideSection(fiadorPJSection);
        hideSection(anexosPJSection);

        clearSectionInputs(formSections);
        
        if (tipoPessoa) {
            showSection(formSections);
            showSection(atividadeGroup);
        } else {
            return;
        }

        // Lógica para Pessoa Física
        if (tipoPessoa === 'Pessoa Física') {
            showSection(pfSection);
            if (tipoAtividade) {
                showSection(estadoCivilGroup);
                showSection(dadosProfissionaisPFSection);
                
                // Exibe campos de dados profissionais específicos
                if (tipoAtividade === 'CLT') {
                    showSection(empresaPFGroup);
                    showSection(cargoPFGroup);
                    showSection(tempoEmpresaPFGroup);
                    showSection(remuneracaoPFGroup);
                    showSection(cepEmpresaPFGroup);
                    showSection(logradouroEmpresaPFGroup);
                    showSection(numeroEmpresaPFGroup);
                    showSection(complementoEmpresaPFGroup);
                    showSection(bairroEmpresaPFGroup);
                    showSection(cidadeEmpresaPFGroup);
                    showSection(estadoEmpresaPFGroup);
                } else {
                    hideSection(empresaPFGroup);
                    hideSection(cargoPFGroup);
                    hideSection(tempoEmpresaPFGroup);
                    hideSection(remuneracaoPFGroup);
                    hideSection(cepEmpresaPFGroup);
                    hideSection(logradouroEmpresaPFGroup);
                    hideSection(numeroEmpresaPFGroup);
                    hideSection(complementoEmpresaPFGroup);
                    hideSection(bairroEmpresaPFGroup);
                    hideSection(cidadeEmpresaPFGroup);
                    hideSection(estadoEmpresaPFGroup);
                }
            } else {
                return;
            }

            if (estadoCivil) {
                showSection(garantiaGroup);
                if (estadoCivil === 'Casado(a)' || estadoCivil === 'União estável') {
                    showSection(conjugePFSection);
                } else {
                    hideSection(conjugePFSection);
                }
            } else {
                return;
            }

            if (tipoGarantia) {
                showSection(anexosPFSection);
                renderAnexosPF({ tipoPessoa, tipoAtividade, estadoCivil, tipoGarantia });
                if (tipoGarantia === 'Fiador') {
                    showSection(fiadorPFSection);
                } else {
                    hideSection(fiadorPFSection);
                }
            }

        } else if (tipoPessoa === 'Pessoa Jurídica') {
            // Lógica para Pessoa Jurídica
            showSection(pjSection);
            showSection(estadoCivilGroup); // Assume que o sócio/representante terá estado civil
            if (estadoCivil) {
                showSection(garantiaGroup);
                if (estadoCivil === 'Casado(a)' || estadoCivil === 'União estável') {
                    showSection(conjugePJSection);
                } else {
                    hideSection(conjugePJSection);
                }
            } else {
                return;
            }

            if (tipoGarantia) {
                showSection(anexosPJSection);
                renderAnexosPJ({ tipoPessoa, tipoAtividade, estadoCivil, tipoGarantia });
                if (tipoGarantia === 'Fiador') {
                    showSection(fiadorPJSection);
                } else {
                    hideSection(fiadorPJSection);
                }
            }
        }
    };

    // Adicionar listeners para os campos de filtro
    tipoPessoaSelect.addEventListener('change', updateFormDisplay);
    tipoAtividadeSelect.addEventListener('change', updateFormDisplay);
    estadoCivilSelect.addEventListener('change', updateFormDisplay);
    tipoGarantiaSelect.addEventListener('change', updateFormDisplay);

    // Ocultar a seção de formulário ao carregar a página
    hideSection(formSections);

    // ====================================================================
    // CÓDIGO MELHORADO: MÁSCARAS E INTEGRAÇÃO VIACEP
    // ====================================================================

    // Aplica as máscaras aos campos de entrada
    const applyMasks = () => {
        // Campos de Pessoa Física
        $('#cpfPF').mask('000.000.000-00');
        $('#rgPF').mask('00.000.000-0');
        $('#dataNascimentoPF').mask('00/00/0000');
        $('#celularPF').mask('(00) 00000-0000');
        $('#cepPF').mask('00000-000');
        $('#remuneracaoPF').mask('#.##0,00', { reverse: true });
        $('#cepEmpresaPF').mask('00000-000');

        // Campos do Cônjuge PF
        $('#cpfConjugePF').mask('000.000.000-00');
        $('#rgConjugePF').mask('00.000.000-0');
        $('#dataNascimentoConjugePF').mask('00/00/0000');
        $('#celularConjugePF').mask('(00) 00000-0000');

        // Campos de Fiador PF
        $('#cpfFiadorPF').mask('000.000.000-00');
        $('#rgFiadorPF').mask('00.000.000-0');
        $('#dataNascimentoFiadorPF').mask('00/00/0000');
        $('#celularFiadorPF').mask('(00) 00000-0000');
        $('#cepFiadorPF').mask('00000-000');
        $('#remuneracaoFiadorPF').mask('#.##0,00', { reverse: true });

        // Campos de Pessoa Jurídica
        $('#cnpjPJ').mask('00.000.000/0000-00');
        $('#cepEmpresaPJ').mask('00000-000');

        // Campos do Sócio PJ
        $('#cpfSocioPJ').mask('000.000.000-00');
        $('#rgSocioPJ').mask('00.000.000-0');
        $('#dataNascimentoSocioPJ').mask('00/00/0000');
        $('#celularSocioPJ').mask('(00) 00000-0000');
        $('#cepSocioPJ').mask('00000-000');

        // Campos do Cônjuge PJ
        $('#cpfConjugePJ').mask('000.000.000-00');
        $('#rgConjugePJ').mask('00.000.000-0');
    };

    // Função para consultar o ViaCEP
    const consultarCep = (cepInput, logradouroInput, bairroInput, cidadeInput, estadoInput, proximoCampoId) => {
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            return;
        }

        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    logradouroInput.value = data.logradouro;
                    bairroInput.value = data.bairro;
                    cidadeInput.value = data.localidade;
                    estadoInput.value = data.uf;

                    // Mover o foco para o próximo campo
                    const proximoCampo = document.getElementById(proximoCampoId);
                    if (proximoCampo) {
                        proximoCampo.focus();
                    }
                } else {
                    console.log('CEP não encontrado.');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar o CEP:', error);
            });
    };

    // Adicionar listeners para a consulta do ViaCEP no evento keyup
    $('#cepPF').on('keyup', function() {
        if ($(this).val().length === 9) {
            consultarCep(
                this,
                document.getElementById('logradouroPF'),
                document.getElementById('bairroPF'),
                document.getElementById('cidadePF'),
                document.getElementById('estadoPF'),
                'numeroPF'
            );
        }
    });

    $('#cepEmpresaPF').on('keyup', function() {
        if ($(this).val().length === 9) {
            consultarCep(
                this,
                document.getElementById('logradouroEmpresaPF'),
                document.getElementById('bairroEmpresaPF'),
                document.getElementById('cidadeEmpresaPF'),
                document.getElementById('estadoEmpresaPF'),
                'numeroEmpresaPF'
            );
        }
    });

    $('#cepFiadorPF').on('keyup', function() {
        if ($(this).val().length === 9) {
            consultarCep(
                this,
                document.getElementById('logradouroFiadorPF'),
                document.getElementById('bairroFiadorPF'),
                document.getElementById('cidadeFiadorPF'),
                document.getElementById('estadoFiadorPF'),
                'numeroFiadorPF'
            );
        }
    });

    $('#cepEmpresaPJ').on('keyup', function() {
        if ($(this).val().length === 9) {
            consultarCep(
                this,
                document.getElementById('logradouroEmpresaPJ'),
                document.getElementById('bairroEmpresaPJ'),
                document.getElementById('cidadeEmpresaPJ'),
                document.getElementById('estadoEmpresaPJ'),
                'numeroEmpresaPJ'
            );
        }
    });

    $('#cepSocioPJ').on('keyup', function() {
        if ($(this).val().length === 9) {
            consultarCep(
                this,
                document.getElementById('logradouroSocioPJ'),
                document.getElementById('bairroSocioPJ'),
                document.getElementById('cidadeSocioPJ'),
                document.getElementById('estadoSocioPJ'),
                'numeroSocioPJ'
            );
        }
    });

    // Chama a função para aplicar as máscaras
    applyMasks();

    // ====================================================================
    // NOVO CÓDIGO: ENVIO DO FORMULÁRIO PARA O BACKEND
    // ====================================================================

    const rentalForm = document.getElementById('rentalForm');
    const loadingIndicator = document.getElementById('loading-indicator');
    const submitBtn = document.getElementById('submitBtn');

    rentalForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Mostrar indicador de carregamento e desabilitar o botão
        loadingIndicator.style.display = 'block';
        submitBtn.disabled = true;

        // Coletar dados do formulário
        const formData = new FormData(rentalForm);

        try {
            const response = await fetch('http://localhost:3000/enviar-ficha', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                console.log('Sucesso:', result.message);
                window.location.href = 'sucesso.html';
            } else {
                console.error('Erro no backend:', result.message);
                window.location.href = 'erro.html';
            }
        } catch (error) {
            console.error('Erro de rede ou no servidor:', error);
            window.location.href = 'erro.html';
        } finally {
            // Esconder o indicador e habilitar o botão novamente
            loadingIndicator.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
});