window.supabase = supabase;

window.document.getElementById('id-do-form').addEventListener('submit', async function(e) {
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
                // Simulação de envio para o Supabase
                showMessage('Processando sua assinatura...', 'success');
                // Em um caso real, aqui você faria uma requisição para sua API
                // que se conectaria com o Supabase e enviaria o e-mail via Google
                await simulateSupabaseStorage(email);
                
                showMessage('Inscrição realizada com sucesso! Em breve você receberá um e-mail de confirmação.', 'success');
                emailInput.value = '';
            } catch (error) {
                showMessage('Erro ao processar sua inscrição. Tente novamente mais tarde.', 'error');
                console.error('Erro:', error);
            }
        });
        
        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        function showMessage(message, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = message;
            messageDiv.className = 'message ' + type;
            messageDiv.style.display = 'block';
            
            // Esconder a mensagem após 5 segundos
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
        
        // Função de simulação de armazenamento no Supabase
        async function simulateSupabaseStorage(email) {
            // usaría o SDK do Supabase


            
            // Simulando um delay de rede
            return new Promise(resolve => setTimeout(resolve, 1500));
        }