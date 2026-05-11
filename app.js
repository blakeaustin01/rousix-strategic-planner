const tiers = {
  basic: {
    name: "Basic Tablet",
    fullName: "Rousix Basic Tablet",
    price: 1250,
    minimumBase: 0,
    maximumBase: 4999
  },
  standard: {
    name: "Standard",
    fullName: "Rousix Standard",
    price: 4100,
    minimumBase: 5000,
    maximumBase: 14999
  },
  standardPlus: {
    name: "Standard Plus",
    fullName: "Rousix Standard Plus",
    price: 8250,
    minimumBase: 15000,
    maximumBase: 29999
  },
  premium: {
    name: "Premier",
    fullName: "Rousix Premier",
    price: 12450,
    minimumBase: 30000,
    maximumBase: 74999
  },
  titan: {
    name: "Titan",
    fullName: "Rousix Titan",
    price: 75000,
    minimumBase: 75000,
    maximumBase: 149999
  },
  colossus: {
    name: "Colossus",
    fullName: "Rousix Colossus",
    price: 150000,
    minimumBase: 150000,
    maximumBase: 299999
  },
  olympus: {
    name: "Olympus",
    fullName: "Rousix Olympus",
    price: 300000,
    minimumBase: 300000,
    maximumBase: Infinity
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
    monthlyContribution: 1528,
    timelineMonths: 36
  },
  equipment: {
    goalType: "Equipment",
    goalName: "Commercial equipment",
    price: 85000,
    startingContribution: 8500,
    monthlyContribution: 250,
    timelineMonths: 36
  },
  business: {
    goalType: "Business Asset",
    goalName: "Business expansion",
    price: 150000,
    startingContribution: 15000,
    monthlyContribution: 417,
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
  const safe = Number.isFinite(value) ? value : 0;
  return currency.format(safe);
}

function number(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function getPlanFromForm() {
  return {
    goalType: $("goalType").value,
    goalName: $("goalName").value.trim() || "Ownership goal",
    price: number($("price").value),
    startingContribution: Math.max(number($("startingContribution").value), 5),
    monthlyContribution: Math.max(number($("monthlyContribution").value), 1),
    timelineMonths: number($("timelineMonths").value)
  };
}

function calculatePlan(plan) {
  const directTotal =
    plan.startingContribution + plan.monthlyContribution * plan.timelineMonths;

  const remainingGap = Math.max(plan.price - directTotal, 0);

  const fiveXBase = plan.price / 5;
  const tenXBase = plan.price / 10;

  const neededAfterStartFor5x = Math.max(fiveXBase - plan.startingContribution, 0);
  const neededMonthlyFor5x = neededAfterStartFor5x / plan.timelineMonths;

  const neededAfterStartFor10x = Math.max(tenXBase - plan.startingContribution, 0);
  const neededMonthlyFor10x = neededAfterStartFor10x / plan.timelineMonths;

  const suggestedTier = chooseTier(fiveXBase);

  return {
    ...plan,
    directTotal,
    remainingGap,
    fiveXBase,
    tenXBase,
    neededAfterStartFor5x,
    neededMonthlyFor5x,
    neededAfterStartFor10x,
    neededMonthlyFor10x,
    suggestedTier
  };
}

function chooseTier(planBase) {
  const allTiers = Object.values(tiers);

  return allTiers.find((tier) => {
    return planBase >= tier.minimumBase && planBase <= tier.maximumBase;
  }) || tiers.standard;
}

function savePlan(calc) {
  localStorage.setItem("rousixPlannerPlan", JSON.stringify(calc));
}

function loadPlan() {
  const raw = localStorage.getItem("rousixPlannerPlan");

  if (!raw) {
    return calculatePlan(samples.home);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return calculatePlan(samples.home);
  }
}

function renderPlanner() {
  if (!$("plannerForm")) return;

  const plan = getPlanFromForm();
  const calc = calculatePlan(plan);
  savePlan(calc);

  $("resultTitle").textContent = `${calc.goalName} pathway`;

  $("directContribution").textContent = money(calc.directTotal);
  $("remainingGap").textContent = money(calc.remainingGap);
  $("fiveXBase").textContent = money(calc.fiveXBase);
  $("suggestedTier").textContent = calc.suggestedTier.name;

  $("tierReason").textContent =
    `Suggested because a 5x scenario for this goal uses a plan base of about ${money(calc.fiveXBase)}.`;

  $("simpleSummary").textContent =
    `You want to pursue a ${calc.goalType.toLowerCase()} goal with a price of ${money(calc.price)} over ${calc.timelineMonths} months.`;

  $("plainEnglish").textContent =
    buildPlainEnglish(calc);

  $("fiveXText").textContent =
    `In a hypothetical 5x scenario, a ${money(calc.price)} goal would need a planning base of about ${money(calc.fiveXBase)}. If you start with ${money(calc.startingContribution)}, the remaining 5x base is ${money(calc.neededAfterStartFor5x)}. Over ${calc.timelineMonths} months, that equals about ${money(calc.neededMonthlyFor5x)} per month.`;

  $("tenXText").textContent =
    `In a hypothetical 10x scenario, the same ${money(calc.price)} goal would need a planning base of about ${money(calc.tenXBase)}. If you start with ${money(calc.startingContribution)}, the remaining 10x base is ${money(calc.neededAfterStartFor10x)}. Over ${calc.timelineMonths} months, that equals about ${money(calc.neededMonthlyFor10x)} per month.`;

  window.currentRousixPlan = calc;
}

function buildPlainEnglish(calc) {
  return (
    `You want to pursue ${calc.goalName}, priced at ${money(calc.price)}. ` +
    `You plan to start with ${money(calc.startingContribution)} and add ${money(calc.monthlyContribution)} per month for ${calc.timelineMonths} months. ` +
    `By direct contribution alone, that adds up to ${money(calc.directTotal)}. ` +
    `If you compare that direct total to the full price, the amount still not covered is ${money(calc.remainingGap)}. ` +
    `That missing amount is the gap. The roadmap helps you understand that gap, compare possible scenarios, and decide whether to start small or increase your commitment later.`
  );
}

function bindPlanner() {
  if (!$("plannerForm")) return;

  [
    "goalType",
    "goalName",
    "price",
    "startingContribution",
    "monthlyContribution",
    "timelineMonths"
  ].forEach((id) => {
    $(id).addEventListener("input", renderPlanner);
    $(id).addEventListener("change", renderPlanner);
  });

  document.querySelectorAll(".sample-button").forEach((button) => {
    button.addEventListener("click", () => {
      const sample = samples[button.dataset.sample];

      $("goalType").value = sample.goalType;
      $("goalName").value = sample.goalName;
      $("price").value = sample.price;
      $("startingContribution").value = sample.startingContribution;
      $("monthlyContribution").value = sample.monthlyContribution;
      $("timelineMonths").value = sample.timelineMonths;

      renderPlanner();
    });
  });

  $("copySummary").addEventListener("click", copySummary);

  $("saveAndRoadmap").addEventListener("click", () => {
    renderPlanner();
    window.location.href = "roadmap.html";
  });

  $("printPlan").addEventListener("click", () => {
    window.print();
  });

  renderPlanner();
}

function buildCopyText() {
  const calc = window.currentRousixPlan || loadPlan();

  return [
    "Rousix Surplus Ownership Planner",
    "--------------------------------",
    `Goal: ${calc.goalName}`,
    `Goal Type: ${calc.goalType}`,
    `Price: ${money(calc.price)}`,
    `Starting Contribution: ${money(calc.startingContribution)}`,
    `Monthly Contribution: ${money(calc.monthlyContribution)}`,
    `Timeline: ${calc.timelineMonths} months`,
    `Direct Contribution Total: ${money(calc.directTotal)}`,
    `Remaining Gap: ${money(calc.remainingGap)}`,
    `5x Scenario Base: ${money(calc.fiveXBase)}`,
    `10x Scenario Base: ${money(calc.tenXBase)}`,
    `Suggested Infrastructure: ${calc.suggestedTier.fullName}`,
    "",
    "Plain-English Summary:",
    buildPlainEnglish(calc),
    "",
    "Disclaimer:",
    "This is an educational prototype. It does not promise returns, profit, appreciation, liquidity, approval, financing, purchase, or ownership."
  ].join("\n");
}

async function copySummary() {
  const text = buildCopyText();

  try {
    await navigator.clipboard.writeText(text);
    showToast("Summary copied.");
  } catch (error) {
    showToast("Copy failed. Try printing instead.");
  }
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(window.toastTimer);
  window.toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function renderRoadmapPage() {
  if (!$("roadmapTitle")) return;

  const calc = loadPlan();

  $("roadmapTitle").textContent = `${calc.goalName} roadmap`;

  $("roadmapSummary").textContent =
    `${calc.goalType} goal. ${money(calc.price)} price. ${calc.timelineMonths}-month planning timeline.`;

  $("sidePrice").textContent = money(calc.price);
  $("sideDirect").textContent = money(calc.directTotal);
  $("sideGap").textContent = money(calc.remainingGap);
  $("sideTier").textContent = calc.suggestedTier.name;

  $("stageOneText").textContent =
    `You choose the goal: ${calc.goalName}. The price is ${money(calc.price)}. This gives the plan a clear target.`;

  $("stageTwoText").textContent =
    `You start with ${money(calc.startingContribution)} and plan to add ${money(calc.monthlyContribution)} per month. Over ${calc.timelineMonths} months, your direct contribution total is ${money(calc.directTotal)}.`;

  $("stageThreeText").textContent =
    `The gap is the part of the price not covered by direct contributions. For this plan, the gap is ${money(calc.remainingGap)}. In simple terms: this is the amount that still needs a strategy.`;

  $("stageFourText").textContent =
    `You can compare options by changing the price, timeline, starting contribution, or monthly contribution. A larger starting contribution lowers the monthly pressure. A longer timeline gives more time. A smaller goal is easier to reach.`;

  $("stageFiveText").textContent =
    `A real next step could be a small activation payment, simple onboarding, and a clear explanation of what happens next. Start small if you want to build trust first.`;

  $("laymanExplanation").innerHTML = buildRoadmapExplanation(calc);

  $("printRoadmap").addEventListener("click", () => window.print());
}

function buildRoadmapExplanation(calc) {
  return `
    <article>
      <h3>1. What the price means</h3>
      <p>
        Your selected price is <strong>${money(calc.price)}</strong>. This is the
        amount connected to your goal. The planner uses that number to build a
        simple roadmap.
      </p>
    </article>

    <article>
      <h3>2. What direct contribution means</h3>
      <p>
        Your direct contribution is the money you plan to add yourself. You start
        with <strong>${money(calc.startingContribution)}</strong> and add
        <strong>${money(calc.monthlyContribution)}</strong> per month. Over
        <strong>${calc.timelineMonths} months</strong>, that equals
        <strong>${money(calc.directTotal)}</strong>.
      </p>
    </article>

    <article>
      <h3>3. What the gap means</h3>
      <p>
        The gap is the part not covered by your direct contributions. Your gap is
        <strong>${money(calc.remainingGap)}</strong>. Said another way: if you
        only used your direct contributions, this is what would still be missing.
      </p>
    </article>

    <article>
      <h3>4. What the 5x example means</h3>
      <p>
        In a hypothetical 5x scenario, Rousix would use a planning base of about
        <strong>${money(calc.fiveXBase)}</strong> to pursue a
        <strong>${money(calc.price)}</strong> goal. If you start with
        <strong>${money(calc.startingContribution)}</strong>, then the remaining
        5x base is <strong>${money(calc.neededAfterStartFor5x)}</strong>. Over
        <strong>${calc.timelineMonths} months</strong>, that is about
        <strong>${money(calc.neededMonthlyFor5x)}</strong> per month.
      </p>
    </article>

    <article>
      <h3>5. What the 10x example means</h3>
      <p>
        In a hypothetical 10x scenario, the plan base would be about
        <strong>${money(calc.tenXBase)}</strong>. That would require less direct
        contribution than the 5x example. But it should also be treated as a more
        aggressive hypothetical scenario, not as a promise.
      </p>
    </article>

    <article>
      <h3>6. Why the infrastructure suggestion appears</h3>
      <p>
        The suggested infrastructure is based mainly on the size of the planning
        base. Larger goals usually require a larger infrastructure conversation.
        For this plan, the suggested discussion tier is
        <strong>${calc.suggestedTier.fullName}</strong>.
      </p>
    </article>

    <article>
      <h3>7. What happens if more people join</h3>
      <p>
        A larger network may create more utility and more flexibility. More
        participants and more infrastructure can make the overall system more
        useful. But this does not guarantee a specific result for any one person.
      </p>
    </article>

    <article>
      <h3>8. What to do next</h3>
      <p>
        If the plan feels too large, start small. If it makes sense, you can
        increase later. The goal is to understand the process before making a
        larger commitment.
      </p>
    </article>
  `;
}

function init() {
  bindPlanner();
  renderRoadmapPage();
}

document.addEventListener("DOMContentLoaded", init);
