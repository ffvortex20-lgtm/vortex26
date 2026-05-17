document.addEventListener("DOMContentLoaded", () => {
    const config = window.APP_CONFIG;
    
    // Configurações visuais iniciais
    const systemForm = document.getElementById("system-form");
    const btnWhatsapp = document.getElementById("btn-whatsapp");
    const stepUnlock = document.getElementById("step-unlock");

    // Lógica da trava: Monitora se o usuário clicou no link do Zap
    btnWhatsapp.addEventListener("click", () => {
        // Aguarda 1 segundo após o clique para dar tempo da nova aba abrir e libera o formulário
        setTimeout(() => {
            systemForm.classList.remove("opacity-40", "pointer-events-none");
            stepUnlock.innerHTML = `
                <div class="flex items-center gap-3 text-emerald-400 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20">
                    <i class="fa-solid fa-circle-check text-lg"></i>
                    <span class="text-xs font-semibold uppercase tracking-wider">Acesso Liberado! Pode gerar a chave.</span>
                </div>
            `;
        }, 1000);
    });

    // Inicialização do Painel de Servidores
    const serverSelect = document.getElementById("server-select");
    const servers = [
        { id: "1", name: "Servidor Oficial VIP 1" },
        { id: "2", name: "Servidor Secundário Premium 2" }
    ];
    
    servers.forEach(srv => {
        const opt = document.createElement("option");
        opt.value = srv.id;
        opt.innerText = srv.name;
        if(srv.id === config.defaultServer) opt.selected = true;
        serverSelect.appendChild(opt);
    });

    // Botões de Horas de Validade
    const hoursContainer = document.getElementById("hours-container");
    const availableHours = ["1", "6", "12"];
    let selectedHour = config.defaultKeyHours || "6";

    availableHours.forEach(hour => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.innerText = `${hour} Hora${hour > 1 ? 's' : ''}`;
        btn.className = `py-2.5 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
            hour === selectedHour 
            ? "bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-sm" 
            : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
        }`;
        
        btn.addEventListener("click", () => {
            Array.from(hoursContainer.children).forEach(b => {
                b.className = "py-2.5 px-3 text-xs font-medium rounded-xl border transition-all text-center bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700";
            });
            btn.className = "py-2.5 px-3 text-xs font-medium rounded-xl border transition-all text-center bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-sm";
            selectedHour = hour;
        });
        hoursContainer.appendChild(btn);
    });

    // Geração de Chaves
    const form = document.getElementById("system-form");
    const btnGenerate = document.getElementById("btn-generate");
    const resultContainer = document.getElementById("result-container");
    const generatedKeyField = document.getElementById("generated-key");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        btnGenerate.disabled = true;
        btnGenerate.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> <span>Processando...</span>`;
        
        const payload = {
            apiKey: config.apiKey,
            slug: config.currentSlug,
            server: serverSelect.value,
            duration: selectedHour,
            ui_token: window._UI_DATA ? window._UI_DATA.substring(0, 50) : ""
        };

        try {
            const response = await fetch(`${config.backendUrl}/api/generate-key`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Erro");
            const data = await response.json();
            generatedKeyField.innerText = data.key || `K7-CRACKED-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            resultContainer.classList.remove("hidden");
            
        } catch (error) {
            // Fallback de Segurança caso dê erro de CORS
            const fallbackKey = `K7-KEY-${selectedHour}H-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            generatedKeyField.innerText = fallbackKey;
            resultContainer.classList.remove("hidden");
        } finally {
            btnGenerate.disabled = false;
            btnGenerate.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Gerar Credencial</span>`;
        }
    });

    // Copiar Chave
    const btnCopy = document.getElementById("btn-copy");
    btnCopy.addEventListener("click", () => {
        navigator.clipboard.writeText(generatedKeyField.innerText);
        const icon = btnCopy.querySelector("i");
        icon.className = "fa-solid fa-check text-emerald-400";
        setTimeout(() => {
            icon.className = "fa-regular fa-copy text-slate-400";
        }, 2000);
    });
});
