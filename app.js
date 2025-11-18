/* ================================
   STATE MANAGEMENT
   ================================ */

const state = {
    currentStep: 1,
    selectedPlan: null,
    selectedAddons: [],
    planPrices: {
        basic: 79,
        pro: 249,
        team: 599
    },
    planCredits: {
        basic: '1.000',
        pro: '5.000',
        team: '25.000'
    }
};

/* ================================
   INITIALIZATION
   ================================ */

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateStepperUI();
});

function initializeEventListeners() {
    // Plan selection
    document.querySelectorAll('.plan-select-btn').forEach(btn => {
        btn.addEventListener('click', handlePlanSelection);
    });

    // Next buttons
    document.getElementById('btn-next-1').addEventListener('click', () => {
        if (state.selectedPlan) nextStep();
    });

    document.getElementById('btn-next-2').addEventListener('click', nextStep);

    // Support options
    document.getElementById('support-users').addEventListener('change', (e) => {
        const btn = document.getElementById('btn-add-support');
        btn.disabled = !e.target.value;
        if (e.target.value) {
            btn.setAttribute('data-price', e.target.value);
        }
    });

    document.getElementById('btn-add-support').addEventListener('click', (e) => {
        const selectEl = document.getElementById('support-users');
        const selectedOption = selectEl.options[selectEl.selectedIndex];
        if (selectedOption.value) {
            handleAddonSelection(
                'support-premium',
                parseInt(selectedOption.value),
                `Premium Support - ${selectedOption.text}`
            );
            selectEl.value = '';
            e.target.disabled = true;
        }
    });

    // Training options
    ['intensive', 'extended'].forEach(type => {
        const selectId = `training-format-${type}`;
        const btnId = `btn-add-${type}-training`;

        document.getElementById(selectId).addEventListener('change', (e) => {
            const btn = document.getElementById(btnId);
            btn.disabled = !e.target.value;
            if (e.target.value) {
                btn.setAttribute('data-price', e.target.value);
            }
        });

        document.getElementById(btnId).addEventListener('click', (e) => {
            const selectEl = document.getElementById(selectId);
            const selectedOption = selectEl.options[selectEl.selectedIndex];
            if (selectedOption.value) {
                const addonName = type === 'intensive' 
                    ? 'Treinamento 8h (Intensivo)' 
                    : 'Treinamento 18h (Estendido)';
                handleAddonSelection(
                    `training-${type}`,
                    parseInt(selectedOption.value),
                    `${addonName} - ${selectedOption.text}`
                );
                selectEl.value = '';
                e.target.disabled = true;
            }
        });
    });

    // Onboarding options
    document.querySelectorAll('[data-addon="onboarding-initial"], [data-addon="onboarding-strategic"]').forEach(card => {
        const btn = card.querySelector('.addon-select-btn');
        btn.addEventListener('click', (e) => {
            const price = parseInt(e.target.getAttribute('data-price'));
            const addonName = card.querySelector('h4').textContent;
            handleAddonSelection(card.getAttribute('data-addon'), price, addonName);
            e.target.disabled = true;
            e.target.textContent = 'Adicionado ✓';
        });
    });

    // Standard support
    document.querySelector('[data-addon="support-standard"] .addon-select-btn').addEventListener('click', (e) => {
        handleAddonSelection('support-standard', 0, 'Standard Support');
        e.target.disabled = true;
        e.target.textContent = 'Adicionado ✓';
    });
}

/* ================================
   PLAN SELECTION
   ================================ */

function handlePlanSelection(e) {
    // Remove previous selection
    document.querySelectorAll('.plan-card').forEach(card => {
        card.classList.remove('selected');
        card.querySelector('.plan-select-btn').disabled = false;
        card.querySelector('.plan-select-btn').textContent = 'Selecionar';
    });

    // Select current
    const card = e.target.closest('.plan-card');
    card.classList.add('selected');
    e.target.disabled = true;
    e.target.textContent = 'Selecionado ✓';

    // Update state
    state.selectedPlan = card.getAttribute('data-plan');

    // Update confirmation
    const planName = card.querySelector('h3').textContent;
    const confirmation = document.getElementById('plan-confirmation');
    confirmation.querySelector('#selected-plan-name').textContent = planName;
    confirmation.classList.remove('hidden');

    // Enable next button
    document.getElementById('btn-next-1').disabled = false;
}

/* ================================
   ADDON SELECTION
   ================================ */

function handleAddonSelection(addonId, price, label) {
    // Check if addon already exists
    const existingIndex = state.selectedAddons.findIndex(a => a.id === addonId);
    
    if (existingIndex > -1) {
        // Replace if same addon type
        state.selectedAddons[existingIndex] = { id: addonId, price, label };
    } else {
        state.selectedAddons.push({ id: addonId, price, label });
    }

    updateAddonsUI();
}

function updateAddonsUI() {
    const confirmationDiv = document.getElementById('addons-confirmation');
    const addonsList = document.getElementById('addons-list');

    if (state.selectedAddons.length > 0) {
        confirmationDiv.classList.remove('hidden');
        addonsList.innerHTML = state.selectedAddons
            .map(addon => `<li>${addon.label} - <strong>R$ ${addon.price.toLocaleString('pt-BR')}</strong></li>`)
            .join('');
    } else {
        confirmationDiv.classList.add('hidden');
        addonsList.innerHTML = '';
    }
}

/* ================================
   STEP NAVIGATION
   ================================ */

function nextStep() {
    if (state.currentStep < 3) {
        state.currentStep++;
        updateStepperUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // If moving to step 3, update summary
        if (state.currentStep === 3) {
            updateSummary();
        }
    }
}

function previousStep() {
    if (state.currentStep > 1) {
        state.currentStep--;
        updateStepperUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateStepperUI() {
    // Update stepper
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.toggle('active', stepNum === state.currentStep);
    });

    // Update content
    document.querySelectorAll('.step-content').forEach((content, index) => {
        const stepNum = index + 1;
        content.classList.toggle('active', stepNum === state.currentStep);
    });
}

/* ================================
   SUMMARY
   ================================ */

function updateSummary() {
    const plan = state.selectedPlan;
    const planPrice = state.planPrices[plan];
    const planCredits = state.planCredits[plan];
    const planNames = { basic: 'Basic', pro: 'PRO', team: 'Team' };

    // Update plan summary
    document.getElementById('summary-plan').textContent = planNames[plan];
    document.getElementById('summary-plan-price').textContent = `R$ ${planPrice.toLocaleString('pt-BR')}`;
    document.getElementById('summary-plan-credits').textContent = planCredits + ' créditos/mês';

    // Update addons summary
    const addonsList = document.getElementById('summary-addons-list');
    if (state.selectedAddons.length > 0) {
        addonsList.innerHTML = state.selectedAddons
            .map(addon => `
                <div style="margin-bottom: var(--space-md); padding-bottom: var(--space-md); border-bottom: 1px solid var(--color-border-light);">
                    <p class="summary-label">${addon.label}</p>
                    <p class="summary-value">R$ ${addon.price.toLocaleString('pt-BR')}</p>
                </div>
            `)
            .join('');
    } else {
        addonsList.innerHTML = '<p class="summary-empty">Nenhum serviço adicional</p>';
    }

    // Calculate totals
    const addonsTotal = state.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const planTotal = planPrice;
    const grandTotal = planTotal + addonsTotal;

    document.getElementById('summary-addons-total').textContent = `R$ ${addonsTotal.toLocaleString('pt-BR')}`;
    document.getElementById('total-plan').textContent = `R$ ${planTotal.toLocaleString('pt-BR')}`;
    document.getElementById('total-addons').textContent = `R$ ${addonsTotal.toLocaleString('pt-BR')}`;
    document.getElementById('total-final').textContent = `R$ ${grandTotal.toLocaleString('pt-BR')}`;
}

/* ================================
   FINISH CALCULATOR
   ================================ */

function finishCalculator() {
    const plan = state.selectedPlan;
    const planNames = { basic: 'Basic', pro: 'PRO', team: 'Team' };
    const planPrice = state.planPrices[plan];
    const addonsTotal = state.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const grandTotal = planPrice + addonsTotal;

    // Build summary text
    let summaryText = `Plano: ${planNames[plan]} (R$ ${planPrice.toLocaleString('pt-BR')}/mês)`;
    
    if (state.selectedAddons.length > 0) {
        summaryText += `\nServiços Adicionais:\n`;
        state.selectedAddons.forEach(addon => {
            summaryText += `- ${addon.label}: R$ ${addon.price.toLocaleString('pt-BR')}\n`;
        });
    }
    
    summaryText += `\nTotal Mensal: R$ ${grandTotal.toLocaleString('pt-BR')}`;

    // Update success message
    document.getElementById('success-summary').textContent = summaryText;

    // Show success message
    document.getElementById('success-message').classList.remove('hidden');

    // Simular envio para servidor (aqui você pode fazer a chamada real)
    console.log('Proposta finalizada:', {
        plan,
        selectedAddons: state.selectedAddons,
        totalMensal: grandTotal
    });
}

/* ================================
   UTILITIES
   ================================ */

function resetCalculator() {
    // Reset state
    state.currentStep = 1;
    state.selectedPlan = null;
    state.selectedAddons = [];

    // Reset UI
    document.querySelectorAll('.plan-card').forEach(card => {
        card.classList.remove('selected');
    });

    document.querySelectorAll('.plan-select-btn').forEach(btn => {
        btn.disabled = false;
        btn.textContent = 'Selecionar';
    });

    document.getElementById('plan-confirmation').classList.add('hidden');
    document.getElementById('addons-confirmation').classList.add('hidden');
    document.getElementById('btn-next-1').disabled = true;

    updateStepperUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToHome() {
    // Redirecionar para página inicial
    window.location.href = '/';
}
