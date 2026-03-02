/**
 * ARQUIVO: script.js
 * CLIENTE: Caroline Bispo - Especialista em Google Ads
 * FUNÇÃO: Controle de interatividade, navegação suave e métricas de conversão.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. GERENCIAMENTO DA NAVBAR (EFEITO SCROLL)
    const navbar = document.querySelector('nav');
    
    window.addEventListener('scroll', () => {
        // Adiciona sombra e fundo sólido ao rolar a página
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-lg', 'bg-white');
            navbar.classList.remove('bg-white/90');
        } else {
            navbar.classList.remove('shadow-lg', 'bg-white');
            navbar.classList.add('bg-white/90');
        }
    });

    // 2. NAVEGAÇÃO SUAVE (SMOOTH SCROLL)
    // Faz com que os links 'Início', 'Sobre Mim' e 'Contato' deslizem suavemente
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offset = 80; // Compensação da altura da navbar fixa
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. EFEITOS NOS BOTÕES DE AGENDAMENTO (CALENDLY)
    // Garante que o clique nos botões de diagnóstico abra em nova aba e registre a intenção
    const btnAgendamento = document.querySelectorAll('a[href*="calendly.com"]');
    
    btnAgendamento.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log("Lead interessado em Diagnóstico Estratégico iniciado.");
            // Aqui você poderia inserir uma tag de conversão do Google Ads no futuro
        });
    });

    // 4. BOTÃO FLUTUANTE WHATSAPP
    // Animação extra ao carregar a página para atrair o olhar
    const whatsappBtn = document.querySelector('.whatsapp-float');
    if (whatsappBtn) {
        setTimeout(() => {
            whatsappBtn.classList.add('animate-bounce');
        }, 3000);
    }

    // 5. OBSERVER PARA ANIMAÇÕES AO ROLAR (REVEAL)
    // Faz com que os cartões de "Dor" e "Solução" apareçam conforme o usuário desce a página
    const revealElements = document.querySelectorAll('.card-red, .card-green');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.1
    });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        revealObserver.observe(el);
    });

});

/**
 * DICA DE MANUTENÇÃO:
 * Se você mudar o link do Calendly ou o número do WhatsApp, 
 * altere diretamente no HTML. Este script cuida apenas do comportamento visual.
 */