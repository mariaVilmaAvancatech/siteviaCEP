document.addEventListener('DOMContentLoaded', () => {
  const cepInput = document.getElementById('cep');
  const logradouroInput = document.getElementById('logradouro');
  const bairroInput = document.getElementById('bairro');
  const cidadeInput = document.getElementById('cidade');
  const ufInput = document.getElementById('uf');
  const numeroInput = document.getElementById('numero');
  const cepErro = document.getElementById('cep-erro');
  const form = document.getElementById('form-endereco');

  // Máscara dinâmica de CEP (00000-000)
  cepInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    e.target.value = value;
  });

  // Dispara busca ao perder o foco (blur)
  cepInput.addEventListener('blur', () => {
    const cepLimpo = cepInput.value.replace(/\D/g, '');

    if (cepLimpo.length === 8) {
      consultarViaCEP(cepLimpo);
    } else if (cepLimpo.length > 0) {
      exibirErro('CEP inválido. Deve conter 8 dígitos.');
    }
  });

  async function consultarViaCEP(cep) {
    limparErro();
    preencherCamposLoading();

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro na requisição da rede');
      }

      const data = await response.json();

      if (data.erro) {
        exibirErro('CEP não encontrado na base de dados.');
        limparFormularioEndereco();
        return;
      }

      preencherFormulario(data);
    } catch (error) {
      exibirErro('Não foi possível buscar o CEP. Tente novamente.');
      limparFormularioEndereco();
    } finally {
      removerLoading();
    }
  }

  function preencherFormulario(data) {
    logradouroInput.value = data.logradouro || '';
    bairroInput.value = data.bairro || '';
    cidadeInput.value = data.localidade || '';
    ufInput.value = data.uf || '';

    // Se o logradouro vier vazio (comum em CEPs de cidades pequenas), libera o campo para edição manual
    if (!data.logradouro) {
      logradouroInput.removeAttribute('readonly');
      logradouroInput.focus();
    } else {
      numeroInput.focus();
    }
  }

  function preencherCamposLoading() {
    logradouroInput.value = 'Carregando...';
    bairroInput.value = 'Carregando...';
    cidadeInput.value = 'Carregando...';
    ufInput.value = '...';
  }

  function removerLoading() {
    if (logradouroInput.value === 'Carregando...') logradouroInput.value = '';
    if (bairroInput.value === 'Carregando...') bairroInput.value = '';
    if (cidadeInput.value === 'Carregando...') cidadeInput.value = '';
    if (ufInput.value === '...') ufInput.value = '';
  }

  function limparFormularioEndereco() {
    logradouroInput.value = '';
    bairroInput.value = '';
    cidadeInput.value = '';
    ufInput.value = '';
  }

  function exibirErro(mensagem) {
    cepErro.textContent = mensagem;
    cepInput.classList.add('input-erro');
  }

  function limparErro() {
    cepErro.textContent = '';
    cepInput.classList.remove('input-erro');
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    console.log('Dados prontos para envio ao backend:', payload);
    alert('Formulário enviado com sucesso! Confira o console.');
  });
});