/*
  TESS AI - Calculadora de Créditos
  JavaScript para cálculos em tempo real, validações e interatividade
*/

// ========================================
// STATE MANAGEMENT
// ========================================
const calculatorState = {
  selectedPlan: null,
  users: 5,
  conversations: 1000,
  selectedModels: ['gpt4o'],
  hoursPerDay: 2,
  costPerHour: 150,
  months: 12,
  estimatedCredits: 1250,
  monthlyCost: 249,
  monthlySavings: 7200,
  roi: 380,
  paybackMonths: 0.4,
  efficiencyTier: 'platinum'
};

// ========================================
// PLAN DATA
// ========================================
const plans = {
  basic: {
    name: 'Basic',
    minPrice: 79,
    maxPrice: 299,
    avgPrice: 189,
    creditsPerMonth: 200,
    creditsPerUser: 40
  },
  pro: {
    name: 'Pro',
    minPrice: 249,
    maxPrice: 599,
    avgPrice: 424,
    creditsPerMonth: 500,
    creditsPerUser: 100
  },
  team: {
    name: 'Team',
    minPrice: 599,
    maxPrice: 2499,
    avgPrice: 1549,
    creditsPerMonth: 1000,
    creditsPerUser: 200
  },
  enterprise: {
    name: 'Enterprise',
    minPrice: 2500,
    maxPrice: 10000,
    avgPrice: 5000,
    creditsPerMonth: 5000,
    creditsPerUser: 1000
  }
};

// ========================================
// MODEL MULTIPLIERS
// ========================================
const modelMultipliers = {
  'gpt4o': 1.0,
  'claude': 0.95,
  'gemini': 0.9,
  'deepseek': 0.85,
  'dalle': 1.5,
  'sora': 2.0
};

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
  // Plan cards
  planCards: document.querySelectorAll('.plan-card'),
  btnNext1: document.getElementById('btn-next-1'),
  
  // Usage sliders
  usersSlider: document.getElementById('users-slider'),
  usersInput: document.getElementById('users-input'),
  conversationsSlider: document.getElementById('conversations-slider'),
  conversationsInput: document.getElementById('conversations-input'),
  modelCheckboxes: document.querySelectorAll('input[name="model"]'),
  estimatedCredits: document.getElementById('estimated-credits'),
  estimateDetail: document.getElementById('estimate-detail'),
  
  // ROI inputs
  hoursSlider: document.getElementById('hours-slider'),
  hoursInput: document.getElementById('hours-input'),
  costSlider: document.getElementById('cost-slider'),
  costInput: document.getElementById('cost-input'),
  monthsSlider: document.getElementById('months-slider'),
  monthsInput: document.getElementById('months-input'),
  
  // ROI results
  roiPercentage: document.getElementById('roi-percentage'),
  monthlyCost: document.getElementById('monthly-cost'),
  monthlySavings: document.getElementById('monthly-savings'),
  paybackMonths: document.getElementById('payback-months'),
  efficiencyBadge: document.getElementById('efficiency-badge'),
  efficiencyProgress: document.getElementById('efficiency-progress'),
  
  // Summary
  summaryPlan: document.getElementById('summary-plan'),
  summaryUsers: document.getElementById('summary-users'),
  summaryConversations: document.getElementById('summary-conversations'),
  summaryCredits: document.getElementById('summary-credits'),
  summaryRoi: document.getElementById('summary-roi'),
  summarySavings: document.getElementById('summary-savings'),
  
  // Sections
  sections: document.querySelectorAll('.section'),
  steps: document.querySelectorAll('.step')
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  initializeEventListeners();
  calculateEstimatedCredits();
  calculateROI();
  updateSummary();
});

// ========================================
// EVENT LISTENERS
// ========================================
function initializeEventListeners() {
  // Plan selection
  elements.planCards.forEach(card => {
    card.addEventListener('click', () => selectPlan(card.dataset.plan));
  });
  
  // Users slider/input sync
  syncSliderInput(elements.usersSlider, elements.usersInput, (value) => {
    calculatorState.users = parseInt(value);
    calculateEstimatedCredits();
  });
  
  // Conversations slider/input sync
  syncSliderInput(elements.conversationsSlider, elements.conversationsInput, (value) => {
    calculatorState.conversations = parseInt(value);
    calculateEstimatedCredits();
  });
  
  // Model checkboxes
  elements.modelCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateSelectedModels();
      calculateEstimatedCredits();
    });
  });
  
  // ROI sliders/inputs sync
  syncSliderInput(elements.hoursSlider, elements.hoursInput, (value) => {
    calculatorState.hoursPerDay = parseFloat(value);
    calculateROI();
  });
  
  syncSliderInput(elements.costSlider, elements.costInput, (value) => {
    calculatorState.costPerHour = parseFloat(value);
    calculateROI();
  });
  
  syncSliderInput(elements.monthsSlider, elements.monthsInput, (value) => {
    calculatorState.months = parseInt(value);
    calculateROI();
  });
}

// ========================================
// PLAN SELECTION
// ========================================
function selectPlan(planKey) {
  calculatorState.selectedPlan = planKey;
  
  // Update UI
  elements.planCards.forEach(card => {
    if (card.dataset.plan === planKey) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
  
  // Enable next button
  elements.btnNext1.disabled = false;
  
  // Update stepper
  updateStepper(1, true);
  
  // Calculate cost
  calculatorState.monthlyCost = plans[planKey].avgPrice;
  calculateROI();
  updateSummary();
}

// ========================================
// SLIDER/INPUT SYNC
// ========================================
function syncSliderInput(slider, input, callback) {
  slider.addEventListener('input', (e) => {
    input.value = e.target.value;
    callback(e.target.value);
  });
  
  input.addEventListener('input', (e) => {
    slider.value = e.target.value;
    callback(e.target.value);
  });
}

// ========================================
// UPDATE SELECTED MODELS
// ========================================
function updateSelectedModels() {
  calculatorState.selectedModels = Array.from(elements.modelCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
}

// ========================================
// CALCULATE ESTIMATED CREDITS
// ========================================
function calculateEstimatedCredits() {
  const { users, conversations, selectedModels } = calculatorState;
  
  // Base credits calculation
  let baseCredits = (users * 50) + (conversations * 0.5);
  
  // Apply model multipliers
  const avgMultiplier = selectedModels.reduce((sum, model) => {
    return sum + (modelMultipliers[model] || 1.0);
  }, 0) / (selectedModels.length || 1);
  
  const estimatedCredits = Math.round(baseCredits * avgMultiplier);
  calculatorState.estimatedCredits = estimatedCredits;
  
  // Update UI
  if (elements.estimatedCredits) {
    elements.estimatedCredits.textContent = formatNumber(estimatedCredits);
  }
  
  if (elements.estimateDetail) {
    const modelCount = selectedModels.length;
    const modelText = modelCount === 1 ? '1 modelo' : `${modelCount} modelos`;
    elements.estimateDetail.textContent = `${users} usuários, ${formatNumber(conversations)} conversas, ${modelText}`;
  }
  
  // Recalculate ROI if plan is selected
  if (calculatorState.selectedPlan) {
    calculateROI();
  }
  
  updateSummary();
}

// ========================================
// CALCULATE ROI
// ========================================
function calculateROI() {
  const { hoursPerDay, costPerHour, months, monthlyCost, users } = calculatorState;
  
  // Monthly savings calculation
  const workingDaysPerMonth = 22;
  const monthlySavings = hoursPerDay * costPerHour * workingDaysPerMonth * users;
  calculatorState.monthlySavings = monthlySavings;
  
  // ROI calculation
  const totalCost = monthlyCost * months;
  const totalSavings = monthlySavings * months;
  const netBenefit = totalSavings - totalCost;
  const roi = (netBenefit / totalCost) * 100;
  calculatorState.roi = Math.round(roi);
  
  // Payback period (months)
  const payback = monthlyCost / monthlySavings;
  calculatorState.paybackMonths = payback;
  
  // Efficiency tier
  let efficiencyTier = 'bronze';
  let efficiencyPercentage = 25;
  
  if (roi >= 500) {
    efficiencyTier = 'platinum';
    efficiencyPercentage = 95;
  } else if (roi >= 300) {
    efficiencyTier = 'gold';
    efficiencyPercentage = 75;
  } else if (roi >= 150) {
    efficiencyTier = 'silver';
    efficiencyPercentage = 50;
  }
  
  calculatorState.efficiencyTier = efficiencyTier;
  
  // Update UI
  if (elements.roiPercentage) {
    const sign = roi >= 0 ? '+' : '';
    elements.roiPercentage.textContent = `${sign}${roi}%`;
  }
  
  if (elements.monthlyCost) {
    elements.monthlyCost.textContent = formatCurrency(monthlyCost);
  }
  
  if (elements.monthlySavings) {
    elements.monthlySavings.textContent = formatCurrency(monthlySavings);
  }
  
  if (elements.paybackMonths) {
    elements.paybackMonths.textContent = `${payback.toFixed(1)} meses`;
  }
  
  if (elements.efficiencyBadge) {
    elements.efficiencyBadge.textContent = efficiencyTier.charAt(0).toUpperCase() + efficiencyTier.slice(1);
  }
  
  if (elements.efficiencyProgress) {
    elements.efficiencyProgress.style.width = `${efficiencyPercentage}%`;
  }
  
  // Update tier active state
  const tierElements = document.querySelectorAll('.efficiency-tiers .tier');
  tierElements.forEach(el => {
    el.classList.remove('active');
    if (el.textContent.toLowerCase() === efficiencyTier) {
      el.classList.add('active');
    }
  });
  
  updateSummary();
}

// ========================================
// UPDATE SUMMARY
// ========================================
function updateSummary() {
  const { selectedPlan, users, conversations, estimatedCredits, roi, monthlySavings } = calculatorState;
  
  if (elements.summaryPlan && selectedPlan) {
    elements.summaryPlan.textContent = plans[selectedPlan].name;
  }
  
  if (elements.summaryUsers) {
    elements.summaryUsers.textContent = `${users} usuários`;
  }
  
  if (elements.summaryConversations) {
    elements.summaryConversations.textContent = formatNumber(conversations);
  }
  
  if (elements.summaryCredits) {
    elements.summaryCredits.textContent = `${formatNumber(estimatedCredits)}/mês`;
  }
  
  if (elements.summaryRoi) {
    const sign = roi >= 0 ? '+' : '';
    elements.summaryRoi.textContent = `${sign}${roi}%`;
  }
  
  if (elements.summarySavings) {
    elements.summarySavings.textContent = formatCurrency(monthlySavings);
  }
}

// ========================================
// STEPPER MANAGEMENT
// ========================================
function updateStepper(stepNumber, completed = false) {
  elements.steps.forEach((step, index) => {
    const stepNum = index + 1;
    
    // Remove all states
    step.classList.remove('active', 'completed');
    
    // Set completed for previous steps
    if (stepNum < stepNumber) {
      step.classList.add('completed');
    }
    
    // Set active for current step
    if (stepNum === stepNumber) {
      step.classList.add('active');
      if (completed) {
        step.classList.add('completed');
      }
    }
  });
}

// ========================================
// SECTION NAVIGATION
// ========================================
function goToSection(sectionNumber) {
  // Hide all sections
  elements.sections.forEach(section => {
    section.classList.remove('active');
  });
  
  // Show target section
  const targetSection = document.getElementById(`section-${sectionNumber}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // Update stepper
  updateStepper(sectionNumber);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Recalculate when entering ROI section
  if (sectionNumber === 3) {
    calculateROI();
  }
  
  // Update summary when entering final section
  if (sectionNumber === 5) {
    updateSummary();
  }
}

// ========================================
// FORMATTING UTILITIES
// ========================================
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

// ========================================
// ANIMATION UTILITIES
// ========================================
function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.round(current);
  }, 16);
}

// ========================================
// VALIDATION
// ========================================
function validateSection(sectionNumber) {
  switch (sectionNumber) {
    case 1:
      return calculatorState.selectedPlan !== null;
    case 2:
      return calculatorState.selectedModels.length > 0;
    case 3:
      return true;
    default:
      return true;
  }
}

// ========================================
// KEYBOARD NAVIGATION
// ========================================
document.addEventListener('keydown', (e) => {
  // Get current active section
  const activeSection = document.querySelector('.section.active');
  if (!activeSection) return;
  
  const currentSectionId = activeSection.id;
  const currentNumber = parseInt(currentSectionId.split('-')[1]);
  
  // Arrow right or Enter: next section
  if (e.key === 'ArrowRight' || e.key === 'Enter') {
    if (validateSection(currentNumber) && currentNumber < 5) {
      goToSection(currentNumber + 1);
    }
  }
  
  // Arrow left or Backspace: previous section
  if ((e.key === 'ArrowLeft' || e.key === 'Backspace') && currentNumber > 1) {
    e.preventDefault();
    goToSection(currentNumber - 1);
  }
});

// ========================================
// ACCESSIBILITY ENHANCEMENTS
// ========================================
// Announce section changes to screen readers
function announceSection(sectionNumber) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Navegou para a seção ${sectionNumber}`;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================
// Debounce function for expensive calculations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced calculation functions
const debouncedCalculateCredits = debounce(calculateEstimatedCredits, 300);
const debouncedCalculateROI = debounce(calculateROI, 300);

// ========================================
// PRINT SUPPORT
// ========================================
window.addEventListener('beforeprint', () => {
  // Show all sections for printing
  elements.sections.forEach(section => {
    section.style.display = 'block';
  });
});

window.addEventListener('afterprint', () => {
  // Hide non-active sections after printing
  elements.sections.forEach(section => {
    if (!section.classList.contains('active')) {
      section.style.display = 'none';
    }
  });
});

// ========================================
// ANALYTICS (Placeholder)
// ========================================
function trackEvent(eventName, eventData = {}) {
  // Placeholder for analytics tracking
  console.log('Track Event:', eventName, eventData);
  
  // Example: Google Analytics
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', eventName, eventData);
  // }
}

// Track plan selection
const originalSelectPlan = selectPlan;
selectPlan = function(planKey) {
  trackEvent('plan_selected', { plan: planKey });
  return originalSelectPlan(planKey);
};

// Track section navigation
const originalGoToSection = goToSection;
goToSection = function(sectionNumber) {
  trackEvent('section_viewed', { section: sectionNumber });
  announceSection(sectionNumber);
  return originalGoToSection(sectionNumber);
};

// ========================================
// EXPORTS (for testing)
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculatorState,
    plans,
    modelMultipliers,
    selectPlan,
    calculateEstimatedCredits,
    calculateROI,
    formatCurrency,
    formatNumber,
    goToSection
  };
}

// ========================================
// CONSOLE WELCOME MESSAGE
// ========================================
console.log('%c🚀 TESS AI Calculator', 'font-size: 20px; font-weight: bold; color: #0052CC;');
console.log('%cVersão 1.0.0 - Desenvolvido com ❤️ para TESS', 'color: #9CA3AF;');
console.log('%cDocumentação: https://docs.tess.ai', 'color: #0052CC;');

