const STRIPE_START_LINK = "https://buy.stripe.com/REPLACE_WITH_YOUR_1_DOLLAR_VERIFICATION_LINK";

const PROGRAM_MINIMUMS = {
  verificationCharge: 1,
  startingContribution: 5,
  monthlyContribution: 1
};

const tiers = [
  {
    key: "basic",
    name: "Rousix Basic Tablet",
    shortName: "Basic Tablet",
    price: 1250,
    description: "Entry mobile access system"
  },
  {
    key: "standard",
    name: "Rousix Standard",
    shortName: "Standard",
    price: 4100,
    description: "Baseline turnkey system"
  },
  {
    key: "standardPlus",
    name: "Rousix Standard Plus",
    shortName: "Standard Plus",
    price: 8250,
    description: "Enhanced mid-tier system"
  },
  {
    key: "premium",
    name: "Rousix Premium",
    shortName: "Premium",
    price: 12450,
    description: "High-performance workstation"
  },
  {
    key: "titan",
    name: "Rousix Titan",
    shortName: "Titan",
    price: 75000,
    description: "Enterprise workstation"
  },
  {
    key: "colossus",
    name: "Rousix Colossus",
    shortName: "Colossus",
    price: 150000,
    description: "Cluster array system"
  },
  {
    key: "olympus",
    name: "Rousix Olympus",
    shortName: "Olympus",
    price: 300000,
    description: "Data center in a box"
  }
];

const samples = {
  starter: {
    goalType: "Custom goal",
    goalName: "Starter trust path",
    goalPrice: 5000,
    startingContribution: 100,
    monthlyContribution: 25,
    timelineMonths: 36,
    multiplierModel: 5
  },
  vehicle: {
    goalType: "Vehicle",
    goalName: "Family vehicle",
    goalPrice: 42000,
    startingContribution: 700,
    monthlyContribution: 215,
    timelineMonths: 36,
    multiplierModel: 5
  },
  home: {
    goalType: "Home",
    goalName: "Starter home",
    goalPrice: 300000,
    startingContribution: 5000,
    monthlyContribution: 1528,
    timelineMonths: 36,
    multiplierModel: 5
  },
  equipment: {
    goalType: "Business equipment",
    goalName: "Commercial equipment package",
    goalPrice: 85000,
    startingContribution: 1500,
    monthlyContribution: 450,
    timelineMonths: 36,
    multiplierModel: 5
  },
  business: {
    goalType: "Business asset",
    goalName: "Local business expansion",
    goalPrice: 150000,
    startingContribution: 2500,
    monthlyContribution: 800,
    timelineMonths: 36,
    multiplierModel: 5
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

function cleanNumber(value) {
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

function roundUpTo(value, increment) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.ceil(value / increment) * increment;
}

function getTierByKey(key) {
  return tiers.find((tier) => tier.key === key) || tiers[1];
}

function getInputs() {
  return {
    goalType: $("goalType").value,
    goalName: $("goalName").value.trim() || "Goal pathway",
    goalPrice: cleanNumber($("goalPrice").value),
    startingContribution: cleanNumber($("startingContribution").value),
    monthlyContribution: cleanNumber($("monthlyContribution").value),
    timelineMonths: cleanNumber($("timelineMonths").value),
    multiplierModel: cleanNumber($("multiplierModel").value),
    autoTier: $("autoTier").checked,
    infrastructureTierKey: $("infrastructureTier").value,
    includeInfrastructureCost: $("includeInfrastructureCost").checked
  };
}

function suggestTierKey(inputs, directTarget, totalPlannedContribution) {
  let index;

  if (inputs.goalPrice <= 15000) {
    index = 0;
  } else if (inputs.goalPrice <= 60000) {
    index = 1;
  } else if (inputs.goalPrice <= 125000) {
    index = 2;
  } else if (inputs.goalPrice <= 350000) {
    index = 3;
  } else if (inputs.goalPrice <= 800000) {
    index = 4;
  } else if (inputs.goalPrice <= 1500000) {
    index = 5;
  } else {
    index = 6;
  }

  const contributionStrength =
    directTarget > 0 ? totalPlannedContribution / directTarget : 0;

  if (contributionStrength < 0.45) {
    index = Math.max(0, index - 1);
  }

  if (contributionStrength > 1.35) {
    index = Math.min(tiers.length - 1, index + 1);
  }

  return tiers[index].key;
}

function calculatePlan() {
  const inputs = getInputs();

  const directTarget =
    inputs.multiplierModel > 0 ? inputs.goalPrice / inputs.multiplierModel : inputs.goalPrice;

  const goalFitStartingPoint = Math.max(
    PROGRAM_MINIMUMS.startingContribution,
    roundUpTo(directTarget / 12, 25)
  );

  const goalFitMonthlyBeforeInfrastructure =
    inputs.timelineMonths > 0
      ? Math.max((directTarget - inputs.startingContribution) / inputs.timelineMonths, 0)
      : 0;

  const totalPlannedContribution =
    inputs.startingContribution + inputs.monthlyContribution * inputs.timelineMonths;

  const suggestedTierKey = suggestTierKey(
    inputs,
    directTarget,
    totalPlannedContribution
  );

  const selectedTierKey = inputs.autoTier ? suggestedTierKey : inputs.infrastructureTierKey;
  const selectedTier = getTierByKey(selectedTierKey);

  if (inputs.autoTier) {
    $("infrastructureTier").value = selectedTierKey;
  }

  $("infrastructureTier").disabled = inputs.autoTier;

  const infrastructureCost = inputs.includeInfrastructureCost ? selectedTier.price : 0;

  const infrastructureCoveredByStart = Math.min(
    inputs.startingContribution,
    infrastructureCost
  );

  const infrastructureBalance = Math.max(
    infrastructureCost - inputs.startingContribution,
    0
  );

  const infrastructureMonths =
    inputs.monthlyContribution > 0
      ? Math.ceil(infrastructureBalance / inputs.monthlyContribution)
      : 0;

  const goalCapitalAvailable = inputs.includeInfrastructureCost
    ? Math.max(totalPlannedContribution - selectedTier.price, 0)
    : totalPlannedContribution;

  const remainingGoalGap = Math.max(directTarget - goalCapitalAvailable, 0);

  const monthlyToFitWithInfrastructure =
    inputs.timelineMonths > 0
      ? Math.max((directTarget + infrastructureCost - inputs.startingContribution) / inputs.timelineMonths, 0)
      : 0;

  const coverageRatio =
    directTarget > 0 ? goalCapitalAvailable / directTarget : 0;

  const plan = {
    inputs,
    directTarget,
    goalFitStartingPoint,
    goalFitMonthlyBeforeInfrastructure,
    totalPlannedContribution,
    suggestedTierKey,
    selectedTier,
    infrastructureCost,
    infrastructureCoveredByStart,
    infrastructureBalance,
    infrastructureMonths,
    goalCapitalAvailable,
    remainingGoalGap,
    monthlyToFitWithInfrastructure,
    coverageRatio
  };

  renderPlan(plan);
}

function getStatus(plan) {
  const { inputs, remainingGoalGap, goalFitStartingPoint, goalFitMonthlyBeforeInfrastructure } = plan;

  if (remainingGoalGap <= 0) {
    return {
      className: "",
      badge: "Goal-fit pathway",
      text:
        "Your planned contributions cover the direct-capital target in this educational example. The next step is to review details with Rousix before making any real commitment."
    };
  }

  if (
    inputs.startingContribution >= goalFitStartingPoint &&
    inputs.monthlyContribution >= goalFitMonthlyBeforeInfrastructure * 0.8
  ) {
    return {
      className: "is-starter",
      badge: "Close pathway",
      text:
        "Your plan is close to the goal-fit path. A small increase, longer timeline, or different infrastructure choice may make the plan easier to understand."
    };
  }

  if (
    inputs.startingContribution >= PROGRAM_MINIMUMS.startingContribution &&
    inputs.monthlyContribution >= PROGRAM_MINIMUMS.monthlyContribution
  ) {
    return {
      className: "is-starter",
      badge: "Starter pathway",
      text:
        "This is a starter path. It lets you begin small, learn the process, and decide later whether to increase the plan."
    };
  }

  return {
    className: "is-gap",
    badge: "Below minimum",
    text:
      "The starting amount or monthly amount is below the minimum idea for this prototype."
  };
}

function renderPlan(plan) {
  const { inputs, selectedTier } = plan;
  const status = getStatus(plan);

  $("resultTitle").textContent = `${inputs.goalName} pathway`;
  $("resultSubtitle").textContent =
    `A ${inputs.timelineMonths}-month example using a ${inputs.multiplierModel}x illustration.`;

  const statusPanel = $("statusPanel");
  statusPanel.className = `status-panel ${status.className}`;
  $("statusBadge").textContent = status.badge;
  $("statusText").textContent = status.text;

  const cappedCoverage = Math.max(0, Math.min(plan.coverageRatio, 1));
  $("coveragePercent").textContent = percent(cappedCoverage);
  $("coverageBar").style.width = percent(cappedCoverage);
  $("coverageNote").textContent =
    `${money(plan.goalCapitalAvailable)} is available toward the direct-capital target after infrastructure is handled.`;

  $("goalPriceOut").textContent = money(inputs.goalPrice);
  $("directTargetOut").textContent = money(plan.directTarget);
  $("directTargetNote").textContent =
    `${money(inputs.goalPrice)} ÷ ${inputs.multiplierModel} = ${money(plan.directTarget)}. This is an illustration, not a promise.`;

  $("startMinOut").textContent = money(plan.goalFitStartingPoint);
  $("monthlyMinOut").textContent = money(plan.goalFitMonthlyBeforeInfrastructure);

  $("tierOut").textContent = selectedTier.shortName;
  $("tierWhyOut").textContent =
    `The suggestion looks at price, timeline, contribution strength, and the ${inputs.multiplierModel}x illustration model.`;

  $("machineCostOut").textContent = inputs.includeInfrastructureCost
    ? money(selectedTier.price)
    : "$0";

  $("machineBalanceOut").textContent = inputs.includeInfrastructureCost
    ? `${money(plan.infrastructureCoveredByStart)} covered by starting contribution; ${money(plan.infrastructureBalance)} remains before goal capital builds.`
    : "Infrastructure cost is shown for discussion only.";

  $("totalContribOut").textContent = money(plan.totalPlannedContribution);
  $("remainingGapOut").textContent = money(plan.remainingGoalGap);

  $("remainingGapNote").textContent =
    plan.remainingGoalGap > 0
      ? "This is the amount still missing from the direct-capital path."
      : "The direct-capital target is covered in this example.";

  $("plainSummary").textContent = buildPlainSummary(plan);
  $("multiplierExplanation").textContent = buildMultiplierExplanation(plan);

  renderOptions(plan);
  renderRoadmap(plan);

  window.latestPlan = {
    ...plan,
    status,
    plainSummary: buildPlainSummary(plan),
    multiplierExplanation: buildMultiplierExplanation(plan)
  };
}

function buildPlainSummary(plan) {
  const { inputs, selectedTier } = plan;

  const infrastructureSentence = inputs.includeInfrastructureCost
    ? `The selected ${selectedTier.shortName} infrastructure costs ${money(selectedTier.price)}. Your starting contribution covers ${money(plan.infrastructureCoveredByStart)} of that first. The remaining infrastructure balance is ${money(plan.infrastructureBalance)}.`
    : `The selected ${selectedTier.shortName} infrastructure is shown for discussion, but its cost is not deducted in this example.`;

  const gapSentence =
    plan.remainingGoalGap > 0
      ? `After your planned contributions and infrastructure cost, you are still short ${money(plan.remainingGoalGap)} from the direct-capital target. In plain English: the plan needs more money, more time, a smaller goal, or a different structure.`
      : `After your planned contributions and infrastructure cost, the direct-capital target is covered in this example.`;

  return (
    `You chose ${inputs.goalName}, with a price of ${money(inputs.goalPrice)}. ` +
    `Using a ${inputs.multiplierModel}x illustration, the direct-capital target is ${money(plan.directTarget)}. ` +
    `You entered ${money(inputs.startingContribution)} to start and ${money(inputs.monthlyContribution)} per month for ${inputs.timelineMonths} months. ` +
    infrastructureSentence + " " +
    gapSentence + " " +
    `This is a planning example only, not a return promise.`
  );
}

function buildMultiplierExplanation(plan) {
  const { inputs } = plan;

  const remainingAfterStart = Math.max(
    plan.directTarget - inputs.startingContribution,
    0
  );

  const monthlyExample =
    inputs.timelineMonths > 0 ? remainingAfterStart / inputs.timelineMonths : 0;

  return (
    `Here is the simple version: if the goal price is ${money(inputs.goalPrice)} and the planner uses a ${inputs.multiplierModel}x illustration, the direct-capital target is ${money(plan.directTarget)}. ` +
    `That means the planner is asking, “What contribution path could support this goal under this example?” ` +
    `If you start with ${money(inputs.startingContribution)}, then ${money(remainingAfterStart)} remains before infrastructure adjustments. ` +
    `Spread across ${inputs.timelineMonths} months, that is about ${money(monthlyExample)} per month before infrastructure cost. ` +
    `As more people participate and more Rousix infrastructure is purchased, the network may become more useful. However, this prototype does not promise 5x, 10x, 15x, 40x, or any guaranteed result.`
  );
}

function renderOptions(plan) {
  const { inputs } = plan;
  const optionList = $("optionList");
  optionList.innerHTML = "";

  const starterTotal =
    PROGRAM_MINIMUMS.startingContribution +
    PROGRAM_MINIMUMS.monthlyContribution * inputs.timelineMonths;

  const longerTimeline = inputs.timelineMonths < 36 ? 36 : inputs.timelineMonths;
  const longerMonthly =
    longerTimeline > 0
      ? Math.max((plan.directTarget + plan.infrastructureCost - inputs.startingContribution) / longerTimeline, 0)
      : 0;

  const options = [
    {
      label: "Current",
      title: `${money(inputs.monthlyContribution)} / month`,
      text:
        `Your current plan contributes ${money(plan.totalPlannedContribution)} over ${inputs.timelineMonths} months.`
    },
    {
      label: "Goal-fit",
      title: `${money(plan.monthlyToFitWithInfrastructure)} / month`,
      text:
        `This is the estimated monthly amount needed to cover the direct-capital target plus infrastructure in this example.`
    },
    {
      label: "Start small",
      title: `$5 + $1 / month`,
      text:
        `A starter path can begin with ${money(starterTotal)} over ${inputs.timelineMonths} months. This is for trust-building, not full goal completion.`
    },
    {
      label: "More time",
      title: `${longerTimeline} months`,
      text:
        `Using ${longerTimeline} months, the monthly amount would be about ${money(longerMonthly)} in this example.`
    }
  ];

  options.forEach((option) => {
    const card = document.createElement("article");
    card.className = "option-card";

    const label = document.createElement("span");
    label.textContent = option.label;

    const title = document.createElement("strong");
    title.textContent = option.title;

    const text = document.createElement("p");
    text.textContent = option.text;

    card.appendChild(label);
    card.appendChild(title);
    card.appendChild(text);

    optionList.appendChild(card);
  });
}

function renderRoadmap(plan) {
  const { inputs, selectedTier } = plan;
  const roadmapList = $("roadmapList");
  roadmapList.innerHTML = "";

  const roadmap = [
    {
      time: "Step 1",
      title: "Start Planning",
      text:
        `You choose the goal: ${inputs.goalName}. The price is ${money(inputs.goalPrice)}. This gives the planner a clear target instead of a vague idea.`,
      note:
        "Simple meaning: pick the thing you want and write down what it costs."
    },
    {
      time: "Step 2",
      title: "Verify and start small",
      text:
        `A live version can use a $1.00 hosted checkout charge to verify payment method data. That $1.00 can be treated as a credit toward the actual plan.`,
      note:
        `Minimum idea: ${money(PROGRAM_MINIMUMS.startingContribution)} to start and ${money(PROGRAM_MINIMUMS.monthlyContribution)} per month. Larger goals need stronger numbers.`
    },
    {
      time: "Step 3",
      title: "Match the goal to infrastructure",
      text:
        `The current infrastructure suggestion is ${selectedTier.name}. The listed cost is ${money(selectedTier.price)} before tax or any other real-world charges.`,
      note:
        inputs.includeInfrastructureCost
          ? `Your contributions handle infrastructure first. After that, the remaining planned contribution can support the goal pathway.`
          : `In this example, infrastructure cost is not deducted. Turn the checkbox on if you want the cost deducted first.`
    },
    {
      time: "Step 4",
      title: "Review the goal gap",
      text:
        `Using the ${inputs.multiplierModel}x illustration, the direct-capital target is ${money(plan.directTarget)}. Your plan has ${money(plan.goalCapitalAvailable)} available toward that target after infrastructure is handled.`,
      note:
        plan.remainingGoalGap > 0
          ? `The remaining goal-path gap is ${money(plan.remainingGoalGap)}. That means the plan needs more money, more time, a smaller goal, or a different structure.`
          : "There is no remaining direct-capital gap in this example."
    },
    {
      time: "Step 5",
      title: "Prepare next steps",
      text:
        "Copy the summary, print the roadmap, and review the numbers with Rousix before taking any real step.",
      note:
        "This is where a person decides whether to start small, adjust the plan, or move forward with a larger commitment."
    }
  ];

  roadmap.forEach((item) => {
    const card = document.createElement("article");
    card.className = "roadmap-card";

    const time = document.createElement("div");
    time.className = "roadmap-time";
    time.textContent = item.time;

    const content = document.createElement("div");
    content.className = "roadmap-content";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const text = document.createElement("p");
    text.textContent = item.text;

    const note = document.createElement("p");
    note.textContent = item.note;

    content.appendChild(title);
    content.appendChild(text);
    content.appendChild(note);

    card.appendChild(time);
    card.appendChild(content);

    roadmapList.appendChild(card);
  });
}

function applySample(sampleKey) {
  const sample = samples[sampleKey];

  if (!sample) {
    return;
  }

  $("goalType").value = sample.goalType;
  $("goalName").value = sample.goalName;
  $("goalPrice").value = sample.goalPrice;
  $("startingContribution").value = sample.startingContribution;
  $("monthlyContribution").value = sample.monthlyContribution;
  $("timelineMonths").value = sample.timelineMonths;
  $("multiplierModel").value = sample.multiplierModel;

  calculatePlan();
}

function buildCopyText() {
  const plan = window.latestPlan;

  if (!plan) {
    return "Rousix Goal Pathway Planner summary is not ready yet.";
  }

  const { inputs, selectedTier, status } = plan;

  return [
    "Rousix Goal Pathway Planner",
    "---------------------------",
    `Goal: ${inputs.goalName}`,
    `Goal type: ${inputs.goalType}`,
    `Price: ${money(inputs.goalPrice)}`,
    `Timeline: ${inputs.timelineMonths} months`,
    `Illustration model: ${inputs.multiplierModel}x`,
    `Starting contribution: ${money(inputs.startingContribution)}`,
    `Monthly contribution: ${money(inputs.monthlyContribution)}`,
    `Total planned contribution: ${money(plan.totalPlannedContribution)}`,
    `Infrastructure tier: ${selectedTier.name}`,
    `Infrastructure cost used in math: ${inputs.includeInfrastructureCost ? money(selectedTier.price) : "$0"}`,
    `Direct-capital target: ${money(plan.directTarget)}`,
    `Available goal capital after infrastructure: ${money(plan.goalCapitalAvailable)}`,
    `Remaining goal-path gap: ${money(plan.remainingGoalGap)}`,
    `Status: ${status.badge}`,
    "",
    "Plain-English summary:",
    plan.plainSummary,
    "",
    "Multiplier explanation:",
    plan.multiplierExplanation,
    "",
    "Disclaimer: This is an educational prototype only. It does not promise returns, profits, liquidity, financing approval, mining output, or ownership outcomes."
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

function startPayment() {
  if (STRIPE_START_LINK.includes("REPLACE_WITH")) {
    showToast("Add your Stripe Payment Link in app.js first.");
    return;
  }

  window.open(STRIPE_START_LINK, "_blank", "noopener,noreferrer");
}

function bindEvents() {
  const inputIds = [
    "goalType",
    "goalName",
    "goalPrice",
    "startingContribution",
    "monthlyContribution",
    "timelineMonths",
    "multiplierModel",
    "autoTier",
    "infrastructureTier",
    "includeInfrastructureCost"
  ];

  inputIds.forEach((id) => {
    const element = $(id);
    element.addEventListener("input", calculatePlan);
    element.addEventListener("change", calculatePlan);
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

  $("startPayment").addEventListener("click", startPayment);
}

function init() {
  $("year").textContent = new Date().getFullYear();
  bindEvents();
  calculatePlan();
}

document.addEventListener("DOMContentLoaded", init);
