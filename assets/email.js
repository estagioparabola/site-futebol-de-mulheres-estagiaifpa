window.supabase = supabase;

window.document.getElementById('id-do-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const emailInput = document.getElementById('email');
    const messageDiv = document.getElementById('message');
    const email = emailInput.value.trim();

    // Validação simples de e-mail
    if (!validateEmail(email)) {
        showMessage('Por favor, insira um e-mail válido.', 'error');
        return;
    }

    try {
        showMessage('Processando sua assinatura...', 'loading');
       
        // Inserir e-mail diretamente no Supabase
        const { data, error } = await window.supabase
            .from('subscribers')
            .insert([{ email: email, created_at: new Date() }]);

        // Verificar se houve erro na inserção
        if (error) {
            if (error.code === '23505') {
                showMessage('Este e-mail já está inscrito na newsletter.', 'error');
            } else {
                console.error('Erro do Supabase:', error);
                showMessage('Erro ao processar sua inscrição. Tente novamente mais tarde.', 'error');
            }
            return;
        }

        // Se chegou aqui, a inserção foi bem-sucedida
        showMessage('Inscrição realizada com sucesso! Em breve você receberá nossas atualizações.', 'success');
        emailInput.value = '';

    } catch (error) {
        console.error('Erro ao inscrever:', error);
        showMessage('Erro ao processar sua inscrição. Tente novamente mais tarde.', 'error');
    }
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = 'message ' + type;
        messageDiv.style.display = 'block';

        // Esconder a mensagem após 5 segundos
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}