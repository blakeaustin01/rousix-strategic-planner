const tiers = {
  basic: {
    name: "Rousix Basic Tablet",
    shortName: "Basic Tablet",
    price: 1250,
    reason: "a low starting point for people who want to begin small"
  },
  standard: {
    name: "Rousix Standard",
    shortName: "Standard",
    price: 4100,
    reason: "a common starting point for everyday goals"
  },
  standardPlus: {
    name: "Rousix Standard Plus",
    shortName: "Standard Plus",
    price: 8250,
    reason: "a stronger starting point for larger personal or business goals"
  },
  premier: {
    name: "Rousix Premier",
    shortName: "Premier",
    price: 12450,
    reason: "a higher-capacity option for larger roadmap discussions"
  },
  titan: {
    name: "Rousix Titan",
    shortName: "Titan",
    price: 75000,
    reason: "an enterprise-level option for very large goals"
  },
  colossus: {
    name: "Rousix Colossus",
    shortName: "Colossus",
    price: 150000,
    reason: "a larger infrastructure option for advanced or group-level planning"
  },
  olympus: {
    name: "Rousix Olympus",
    shortName: "Olympus",
    price: 300000,
    reason: "the largest infrastructure option for institutional-scale planning"
  }
};

const samples = {
  vehicle: {
    goalType: "Vehicle",
    goalName: "Family vehicle",
    price: 42000,
    startingContribution: 5000,
    monthlyContribution: 500,
    timelineMonths: 36
  },
  home: {
    goalType: "Home",
    goalName: "Starter home",
    price: 300000,
    startingContribution: 5000,
    monthlyContribution: 1527,
    timelineMonths: 36
  },
  equipment: {
    goalType: "Business equipment",
    goalName: "Commercial equipment package",
    price: 85000,
    startingContribution: 8250,
    monthlyContribution: 975,
    timelineMonths: 36
  },
  business: {
    goalType: "Business asset",
    goalName: "Local business expansion",
    price: 150000,
    startingContribution: 12500,
    monthlyContribution: 1400,
    timelineMonths: 36
  }
};

const $ = (id) => document.getElementById(id);

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function money(value) {
  const number = Number.isFinite(value) ? value : 0;
  return currency.format(number);
}

function numberValue(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }
  return number;
}

function percent(value) {
  const safe = Number.isFinite(value) ? value : 0;
  return `${Math.round(safe * 100)}%`;
}

function getInputs() {
  return {
    goalType: $("goalType").value,
    goalName: $("goalName").value.trim() || "Ownership goal",
    price: numberValue($("price").value),
    startingContribution: numberValue($("startingContribution").value),
    monthlyContribution: numberValue($("monthlyContribution").value),
    timelineMonths: numberValue($("timelineMonths").value),
    selectedTier: $("selectedTier").value,
    reserveInfrastructureFirst: $("reserveInfrastructureFirst").checked,
    includePaymentStep: $("includePaymentStep").checked
  };
}

function enforceMinimums(inputs) {
  const corrected = { ...inputs };
  const messages = [];

  if (corrected.startingContribution < 5) {
    corrected.startingContribution = 5;
    $("startingContribution").value = 5;
    messages.push("Starting contribution was raised to the $5 minimum.");
  }

  if (corrected.monthlyContribution < 1) {
    corrected.monthlyContribution = 1;
    $("monthlyContribution").value = 1;
    messages.push("Monthly contribution was raised to the $1 minimum.");
  }

  if (corrected.timelineMonths < 24) {
    corrected.timelineMonths = 24;
    $("timelineMonths").value = 24;
    messages.push("Timeline was raised to the 24-month minimum.");
  }

  return { corrected, messages };
}

function chooseTier(inputs) {
  if (inputs.selectedTier !== "auto") {
    return tiers[inputs.selectedTier];
  }

  const baseNeededForFiveX = inputs.price / 5;

  if (inputs.price <= 15000) {
    return tiers.basic;
  }

  if (inputs.price <= 55000) {
    return tiers.standard;
  }

  if (inputs.price <= 110000) {
    return tiers.standardPlus;
  }

  if (inputs.price <= 300000 || baseNeededForFiveX <= 60000) {
    return tiers.premier;
  }

  if (inputs.price <= 650000) {
    return tiers.titan;
  }

  if (inputs.price <= 1200000) {
    return tiers.colossus;
  }

  return tiers.olympus;
}

function calculate(inputs, tier) {
  const totalMonthly = inputs.monthlyContribution * inputs.timelineMonths;
  const totalDirect = inputs.startingContribution + totalMonthly;

  const simpleGap = Math.max(inputs.price - totalDirect, 0);
  const directCoverage = inputs.price > 0 ? totalDirect / inputs.price : 0;

  const infrastructureBalance = inputs.reserveInfrastructureFirst
    ? Math.max(tier.price - inputs.startingContribution, 0)
    : 0;

  const monthsToCoverInfrastructure =
    inputs.monthlyContribution > 0
      ? Math.ceil(infrastructureBalance / inputs.monthlyContribution)
      : 0;

  const remainingMonthsAfterInfrastructure = Math.max(
    inputs.timelineMonths - monthsToCoverInfrastructure,
    0
  );

  const amountAfterInfrastructure =
    inputs.reserveInfrastructureFirst
      ? Math.max(totalDirect - tier.price, 0)
      : totalDirect;

  const fiveXBaseNeeded = inputs.price / 5;
  const tenXBaseNeeded = inputs.price / 10;

  const fiveXRemainingBase = Math.max(
    fiveXBaseNeeded - inputs.startingContribution,
    0
  );

  const tenXRemainingBase = Math.max(
    tenXBaseNeeded - inputs.startingContribution,
    0
  );

  const fiveXMonthlyNeeded =
    inputs.timelineMonths > 0 ? fiveXRemainingBase / inputs.timelineMonths : 0;

  const tenXMonthlyNeeded =
    inputs.timelineMonths > 0 ? tenXRemainingBase / inputs.timelineMonths : 0;

  const cashOnlyMonthlyNeeded =
    inputs.timelineMonths > 0
      ? Math.max(inputs.price - inputs.startingContribution, 0) /
        inputs.timelineMonths
      : 0;

  return {
    totalMonthly,
    totalDirect,
    simpleGap,
    directCoverage,
    infrastructureBalance,
    monthsToCoverInfrastructure,
    remainingMonthsAfterInfrastructure,
    amountAfterInfrastructure,
    fiveXBaseNeeded,
    tenXBaseNeeded,
    fiveXRemainingBase,
    tenXRemainingBase,
    fiveXMonthlyNeeded,
    tenXMonthlyNeeded,
    cashOnlyMonthlyNeeded
  };
}

function render(inputs, tier, totals, minMessages) {
  const cappedCoverage = Math.max(0, Math.min(totals.directCoverage, 1));

  $("resultTitle").textContent = `${inputs.goalName} plan`;
  $("resultSubtitle").textContent =
    `A simple ${inputs.timelineMonths}-month strategic planning example.`;

  if (minMessages.length > 0) {
    $("ruleAlert").innerHTML =
      `<strong>Minimums applied:</strong> ${minMessages.join(" ")}`;
  } else {
    $("ruleAlert").innerHTML =
      "<strong>Minimums:</strong> Starting contribution must be at least $5. Monthly contribution must be at least $1. The timeline starts at 24 months.";
  }

  $("directCoveragePercent").textContent = percent(cappedCoverage);
  $("directCoverageBar").style.width = percent(cappedCoverage);

  $("directCoverageNote").textContent =
    `Your direct contribution path is ${money(totals.totalDirect)} toward a ${money(inputs.price)} price. This is simple contribution math only.`;

  $("totalDirectContribution").textContent = money(totals.totalDirect);
  $("simpleGap").textContent = money(totals.simpleGap);
  $("suggestedInfrastructure").textContent = tier.shortName;
  $("suggestedInfrastructureReason").textContent =
    `${tier.name} is suggested as ${tier.reason}.`;
  $("infrastructureBalance").textContent = money(totals.infrastructureBalance);

  $("plainSummary").textContent = buildPlainSummary(inputs, tier, totals);

  $("cashOnlyTitle").textContent = `${money(totals.cashOnlyMonthlyNeeded)} / month`;
  $("cashOnlyText").textContent =
    `If there were no multiplier scenario and you tried to reach the full ${money(inputs.price)} price with contributions only, you would need about ${money(totals.cashOnlyMonthlyNeeded)} per month for ${inputs.timelineMonths} months after your starting contribution.`;

  $("fiveXTitle").textContent = `${money(totals.fiveXBaseNeeded)} base`;
  $("fiveXText").textContent =
    `In a 5x what-if example, a ${money(inputs.price)} goal would require a base of about ${money(totals.fiveXBaseNeeded)}. With your starting contribution, that leaves about ${money(totals.fiveXRemainingBase)} to build over ${inputs.timelineMonths} months, or about ${money(totals.fiveXMonthlyNeeded)} per month. This is not a promise.`;

  $("tenXTitle").textContent = `${money(totals.tenXBaseNeeded)} base`;
  $("tenXText").textContent =
    `In a 10x what-if example, a ${money(inputs.price)} goal would require a base of about ${money(totals.tenXBaseNeeded)}. With your starting contribution, that leaves about ${money(totals.tenXRemainingBase)} to build over ${inputs.timelineMonths} months, or about ${money(totals.tenXMonthlyNeeded)} per month. This is not a promise.`;

  $("networkText").textContent = buildNetworkText(inputs);

  renderRoadmap(inputs, tier, totals);

  window.latestSummary = {
    inputs,
    tier,
    totals
  };
}

function buildPlainSummary(inputs, tier, totals) {
  const infrastructureSentence =
    inputs.reserveInfrastructureFirst
      ? `The suggested infrastructure is ${tier.name}, listed at ${money(tier.price)} or more. Your starting contribution is applied to that first. If it does not cover the full infrastructure amount, the remaining infrastructure balance is ${money(totals.infrastructureBalance)}.`
      : `The suggested infrastructure is ${tier.name}, listed at ${money(tier.price)} or more. In this view, the infrastructure amount is shown for discussion but is not subtracted first.`;

  const gapSentence =
    totals.simpleGap > 0
      ? `After adding your starting contribution and your monthly contributions, you are still ${money(totals.simpleGap)} short of the full price. In plain English, that is the part of the goal that your current contribution plan does not cover by itself.`
      : `Your direct contribution plan reaches the full price in the selected timeline before any hypothetical scenario is considered.`;

  return (
    `Your goal is ${inputs.goalName}, with a price of ${money(inputs.price)}. ` +
    `You are starting with ${money(inputs.startingContribution)} and adding ${money(inputs.monthlyContribution)} per month for ${inputs.timelineMonths} months. ` +
    `${infrastructureSentence} ` +
    `${gapSentence} ` +
    `The 5x and 10x examples below are only what-if examples to explain the math. They are not promises, predictions, or guarantees.`
  );
}

function buildNetworkText(inputs) {
  return (
    "A simple way to understand the network idea is this: a larger system can do more than a smaller system. " +
    "If only a few people contribute very small amounts, the system has less room to operate. " +
    "If more people join, contribute, and purchase infrastructure, the network may have more utility and more possible pathways. " +
    "That does not guarantee any result for one person. It only explains why participation, infrastructure, time, and scale matter. " +
    `For this ${inputs.goalType.toLowerCase()} goal, the planner keeps the explanation focused on what you entered and what would need to change.`
  );
}

function renderRoadmap(inputs, tier, totals) {
  const list = $("roadmapList");
  list.innerHTML = "";

  const steps = [
    {
      number: "01",
      title: "Start Planning",
      text:
        `Choose the goal and enter the price. Here, the goal is ${inputs.goalName}, and the price is ${money(inputs.price)}.`
    },
    {
      number: "02",
      title: "Build Roadmap",
      text:
        `Add the starting contribution and monthly contribution. Here, the plan starts with ${money(inputs.startingContribution)} and adds ${money(inputs.monthlyContribution)} per month for ${inputs.timelineMonths} months.`
    },
    {
      number: "03",
      title: "Infrastructure Suggestion",
      text:
        `The planner suggests ${tier.name}. If infrastructure is reserved first, your starting contribution is applied to the ${money(tier.price)} infrastructure amount before the broader goal plan continues.`
    },
    {
      number: "04",
      title: "Understand the Gap",
      text:
        `Your direct contribution path totals ${money(totals.totalDirect)}. The price is ${money(inputs.price)}. The simple remaining gap is ${money(totals.simpleGap)}. That means your current contribution plan does not cover that part of the price by itself.`
    },
    {
      number: "05",
      title: "Compare What-If Examples",
      text:
        `The planner shows a cash-only path, a 5x what-if example, and a 10x what-if example. These examples help you understand the math. They do not promise that any multiplier will happen.`
    },
    {
      number: "06",
      title: "Prepare Next Steps",
      text:
        inputs.includePaymentStep
          ? "A live version could verify a payment method with a $1 charge and credit that $1 toward the actual plan. From there, a person could start small, build trust, and increase participation only if the process makes sense to them."
          : "The next step would be to review the roadmap, ask questions, and decide whether to start small or redesign the goal before moving forward."
    },
    {
      number: "07",
      title: "Conclude",
      text:
        "This roadmap gives a clearer way to talk about surplus-based planning. It does not replace a real conversation, professional advice, or a formal Rousix review."
    }
  ];

  steps.forEach((step) => {
    const article = document.createElement("article");
    article.className = "roadmap-step";

    const number = document.createElement("div");
    number.className = "roadmap-step-number";
    number.textContent = step.number;

    const content = document.createElement("div");
    content.className = "roadmap-step-content";

    const title = document.createElement("h3");
    title.textContent = step.title;

    const text = document.createElement("p");
    text.textContent = step.text;

    content.appendChild(title);
    content.appendChild(text);

    article.appendChild(number);
    article.appendChild(content);

    list.appendChild(article);
  });
}

function applySample(sampleKey) {
  const sample = samples[sampleKey];

  if (!sample) {
    return;
  }

  $("goalType").value = sample.goalType;
  $("goalName").value = sample.goalName;
  $("price").value = sample.price;
  $("startingContribution").value = sample.startingContribution;
  $("monthlyContribution").value = sample.monthlyContribution;
  $("timelineMonths").value = sample.timelineMonths;
  $("selectedTier").value = "auto";

  updatePlan();
}

function updatePlan() {
  const rawInputs = getInputs();
  const { corrected, messages } = enforceMinimums(rawInputs);
  const tier = chooseTier(corrected);
  const totals = calculate(corrected, tier);
  render(corrected, tier, totals, messages);
}

function buildCopyText() {
  const summary = window.latestSummary;

  if (!summary) {
    return "Rousix Strategic Ownership Planner summary is not available yet.";
  }

  const { inputs, tier, totals } = summary;

  return [
    "Rousix Strategic Ownership Planner",
    "----------------------------------",
    `Goal Type: ${inputs.goalType}`,
    `Goal Name: ${inputs.goalName}`,
    `Price: ${money(inputs.price)}`,
    `Starting Contribution: ${money(inputs.startingContribution)}`,
    `Monthly Contribution: ${money(inputs.monthlyContribution)}`,
    `Timeline: ${inputs.timelineMonths} months`,
    `Total Direct Contribution: ${money(totals.totalDirect)}`,
    `Simple Remaining Gap: ${money(totals.simpleGap)}`,
    `Suggested Infrastructure: ${tier.name}`,
    `Infrastructure Price: ${money(tier.price)}`,
    `Infrastructure Balance After Starting Contribution: ${money(totals.infrastructureBalance)}`,
    "",
    "Cash-only path:",
    `${money(totals.cashOnlyMonthlyNeeded)} per month after starting contribution.`,
    "",
    "5x what-if example:",
    `Base needed: ${money(totals.fiveXBaseNeeded)}.`,
    `Monthly base needed after starting contribution: ${money(totals.fiveXMonthlyNeeded)}.`,
    "This is not a promise.",
    "",
    "10x what-if example:",
    `Base needed: ${money(totals.tenXBaseNeeded)}.`,
    `Monthly base needed after starting contribution: ${money(totals.tenXMonthlyNeeded)}.`,
    "This is not a promise.",
    "",
    "Disclaimer:",
    "This is an educational prototype. It does not predict or guarantee returns, liquidity, appreciation, mining output, profit, financing approval, or ownership outcomes."
  ].join("\n");
}

async function copySummary() {
  const text = buildCopyText();

  try {
    await navigator.clipboard.writeText(text);
    showToast("Summary copied.");
  } catch (error) {
    showToast("Copy failed. Use print instead.");
  }
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(window.toastTimer);

  window.toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function bindEvents() {
  const ids = [
    "goalType",
    "goalName",
    "price",
    "startingContribution",
    "monthlyContribution",
    "timelineMonths",
    "selectedTier",
    "reserveInfrastructureFirst",
    "includePaymentStep"
  ];

  ids.forEach((id) => {
    const element = $(id);
    element.addEventListener("input", updatePlan);
    element.addEventListener("change", updatePlan);
  });

  document.querySelectorAll(".sample-button").forEach((button) => {
    button.addEventListener("click", () => {
      applySample(button.dataset.sample);
    });
  });

  $("copySummary").addEventListener("click", copySummary);

  $("printRoadmap").addEventListener("click", () => {
    window.print();
  });
}

function init() {
  $("year").textContent = new Date().getFullYear();
  bindEvents();
  updatePlan();
}

document.addEventListener("DOMContentLoaded", init);
