// --- Masterdata ---
const masterdata = {
  droneCost: 575000 * 1.05,
  batterySetCost: 56640,
  gnssDeviceCost: 103250,
  markingSubscription: 25000,
  pilotLicenseCost: 35000,
  pilotMonthlySalary: 20000,
  laborDailyWage: 500,
  chargingInfrastructure: 1750 + 5000,
  logisticsAnnual: 33000,
  insuranceCost: 22425 * 1.18,
  maintenanceCost: 0,
  miscellaneousCost: 1000,
  batteryCoveragePerSet: 4,
  batteryLifeCycles: 500,
  extraBatterySets: 1,
  annualAcreGrowthPercent: 25,
  servicePriceInflation: 25,
  interestRates: { self: 0, aif: 6, nbfc: 0 },
  bikeMountCost: 8500,
};

const steps = ["step1", "step2", "step3", "step4"];

function nextStep(currentStep) {
  if (validateStep(currentStep)) {
    document.getElementById(steps[currentStep - 1]).classList.add("hidden");
    document.getElementById(steps[currentStep]).classList.remove("hidden");
    toggleButtons();
  }
}

function previousStep(currentStep) {
  document.getElementById(steps[currentStep - 1]).classList.add("hidden");
  document.getElementById(steps[currentStep - 2]).classList.remove("hidden");
  toggleButtons();
}

function validateStep(currentStep) {
  let isValid = true;
  const inputs = document.querySelectorAll(`#${steps[currentStep - 1]} input, #${steps[currentStep - 1]} select`);
  inputs.forEach(input => {
    if (!input.value) {
      input.classList.add("error");
      isValid = false;
    } else {
      input.classList.remove("error");
    }
  });
  return isValid;
}

function toggleButtons() {
  const nextButton = document.querySelector('.next-button');
  const prevButton = document.querySelector('.back-button');
  if (nextButton && prevButton) {
    nextButton.disabled = !validateStep(getCurrentStep());
    prevButton.disabled = getCurrentStep() === 1;
  }
}

function validateFields() {
  const funding = document.getElementById("funding").value;
  const investmentAmount = document.getElementById("investmentAmount")?.value;
  const pricePerAcre = document.getElementById("pricePerAcre").value;
  const generateReportButton = document.getElementById("generateReportButton");
  generateReportButton.disabled = (funding !== "self") && !(investmentAmount && pricePerAcre);
}

function toggleBikeMount() {
  const vehicleType = document.getElementById("vehicleType").value;
  document.getElementById("bikeMountContainer").classList.toggle("hidden", vehicleType !== "2wheeler");
}

function toggleNBFCInterest() {
  const funding = document.getElementById("funding").value;
  const nbfcField = document.getElementById("nbfcInterestContainer");
  const loanHelpField = document.getElementById("loanHelpLabel");
  const investmentField = document.getElementById("investmentField");

  nbfcField.classList.toggle("hidden", funding !== "nbfc");
  loanHelpField.classList.toggle("hidden", funding === "self");
  investmentField.classList.toggle("hidden", funding === "self");
}

function getCurrentStep() {
  for (let i = 0; i < steps.length; i++) {
    if (!document.getElementById(steps[i]).classList.contains("hidden")) {
      return i + 1;
    }
  }
  return 1;
}

window.onload = function () {
  validateFields();
  toggleButtons();
  toggleNBFCInterest();

  document.getElementById("acresPerDay").addEventListener("input", function () {
    if (this.value > 30) this.value = 30;
  });
  document.getElementById("sprayDays").addEventListener("input", function () {
    if (this.value > 365) this.value = 365;
  });

  document.getElementById("investmentAmount")?.addEventListener("input", validateFields);
  document.getElementById("pricePerAcre")?.addEventListener("input", validateFields);
};

function toggleAssumptions() {
  const el = document.getElementById("assumptions");
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function generateReport() {
  document.getElementById("step4").classList.add("hidden");
  document.getElementById("report").classList.remove("hidden");

  const acresPerDay = parseFloat(document.getElementById("acresPerDay").value);
  const sprayDays = parseFloat(document.getElementById("sprayDays").value);
  const pricePerAcre = parseFloat(document.getElementById("pricePerAcre").value);
  const funding = document.getElementById("funding").value;
  const nbfcInterest = parseFloat(document.getElementById("nbfcInterest")?.value) || 0;
  const hirePilot = document.getElementById("hirePilot").value;
  const vehicleType = document.getElementById("vehicleType").value;
  const bikeMount = document.getElementById("bikeMount")?.value || "no";

  if (isNaN(acresPerDay) || isNaN(sprayDays) || isNaN(pricePerAcre)) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  if (acresPerDay > 30 || sprayDays > 365) {
    alert("Input limits exceeded.");
    return;
  }

  let investmentAmount = 0;
  if (funding === "self") {
    investmentAmount =
      masterdata.droneCost +
      masterdata.pilotLicenseCost +
      masterdata.chargingInfrastructure +
      masterdata.insuranceCost;

    if (vehicleType === "2wheeler" && bikeMount === "yes") {
      investmentAmount += masterdata.bikeMountCost;
    }
  } else {
    investmentAmount = parseFloat(document.getElementById("investmentAmount").value);
  }
  if (vehicleType === "2wheeler" && bikeMount === "yes") {
    investmentAmount += masterdata.bikeMountCost;
  }


  let interestRate = masterdata.interestRates[funding];
  if (funding === "nbfc") {
    interestRate = nbfcInterest;
  }

  let totalAcresYear1 = acresPerDay * sprayDays;
  let principal = investmentAmount;
  let tenureMonths = 5 * 12;
  let monthlyInterestRate = interestRate / 1200;
  let emi = funding === "self" ? 0 : principal * monthlyInterestRate * (Math.pow(1 + monthlyInterestRate, tenureMonths)) / (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);

  let totalRevenue = 0, totalCost = 0, totalNetIncome = 0, cumulativeAcres = 0;
  let yearlyData = [], cumulativeIncome = 0, paybackPeriod = "N/A";
  let servicePrice = pricePerAcre;
  let acres = totalAcresYear1;

  const depreciationPerYear = (
  masterdata.droneCost +
  masterdata.batterySetCost +
  masterdata.chargingInfrastructure +
  masterdata.insuranceCost
) / 5;

for (let year = 1; year <= 5; year++) {
  let revenue = acres * servicePrice;
  let pilotSalaryAnnual = (hirePilot === "yes") ? masterdata.pilotMonthlySalary * 12 : 0;
  let operatingCost = (acres * masterdata.laborDailyWage) + masterdata.logisticsAnnual + masterdata.maintenanceCost + masterdata.miscellaneousCost + (emi * 12) + pilotSalaryAnnual + depreciationPerYear;
    let netIncome = revenue - operatingCost;
    yearlyData.push({ year, acres, revenue, cost: operatingCost, netIncome });

    totalRevenue += revenue;
    totalCost += operatingCost;
    totalNetIncome += netIncome;
    cumulativeAcres += acres;
    cumulativeIncome += netIncome;

    if (paybackPeriod === "N/A" && cumulativeIncome >= investmentAmount) {
      paybackPeriod = `${year} Years`;
    }

    acres *= (1 + masterdata.annualAcreGrowthPercent / 100);
    servicePrice *= (1 + masterdata.servicePriceInflation / 100);
  }

  let batterySetsNeeded = Math.ceil((cumulativeAcres / masterdata.batteryCoveragePerSet) / masterdata.batteryLifeCycles) + masterdata.extraBatterySets;

  let roi = ((totalNetIncome / investmentAmount) * 100).toFixed(2);

  const breakEvenYearObj = yearlyData.find(y => Math.round(y.revenue - y.cost) >= investmentAmount);
  const breakEvenYear = breakEvenYearObj ? breakEvenYearObj.year : "N/A";
  const totalEMIPaid = funding === "self" ? 0 : Math.round(emi * tenureMonths);
  const totalInterestPaid = funding === "self" ? 0 : Math.round((emi * tenureMonths) - principal);

  const reportTables = document.getElementById("reportTables");
  reportTables.innerHTML = `
<table>
  <tr><th colspan="2">Business Summary</th></tr>
  <tr><td>Total Acres Covered</td><td>${Math.round(cumulativeAcres)}</td></tr>
  <tr><td>Total Water Saved (liters)</td><td>${Math.round(cumulativeAcres * 92).toLocaleString()}</td></tr>
  <tr><td>Battery Sets Required</td><td>${batterySetsNeeded}</td></tr>
</table>
<table>
  <tr><th colspan="2">Financial Summary</th></tr>
  <tr><td>Cumulative Revenue</td><td>₹ ${Math.round(totalRevenue).toLocaleString()}</td></tr>
  <tr><td>Cumulative Cost</td><td>₹ ${Math.round(totalCost).toLocaleString()}</td></tr>
  <tr><td>Cumulative Net Income</td><td>₹ ${Math.round(totalNetIncome).toLocaleString()}</td></tr>
  <tr><td>Initial Investment</td><td>₹ ${Math.round(investmentAmount).toLocaleString()}</td></tr>
  <tr><td>Loan Component</td><td>₹ ${Math.round(principal).toLocaleString()}</td></tr>
  <tr><td>Total EMI Paid</td><td>₹ ${totalEMIPaid.toLocaleString()}</td></tr>
  <tr><td>Total Interest Paid</td><td>₹ ${totalInterestPaid.toLocaleString()}</td></tr>
</table>
<table>
  <tr><th colspan="2">ROI & Cost Metrics</th></tr>
  <tr><td>ROI</td><td>${roi} %</td></tr>
  <tr><td>Payback Period</td><td>${paybackPeriod}</td></tr>
  <tr><td>Break-even Point</td><td>Year ${breakEvenYear}</td></tr>
</table>
  `;

  let breakdownRows = yearlyData.map(y => `
    <tr>
      <td>${y.year}</td>
      <td>${Math.round(y.acres)}</td>
      <td>₹ ${Math.round(y.revenue).toLocaleString()}</td>
      <td>₹ ${Math.round(y.cost).toLocaleString()}</td>
      <td>₹ ${Math.round(y.netIncome).toLocaleString()}</td>
    </tr>
  `).join('');

  reportTables.innerHTML += `
    <table>
      <tr><th colspan="5">5-Year Financial Breakdown</th></tr>
      <tr>
        <th>Year</th>
        <th>Acres</th>
        <th>Revenue (₹)</th>
        <th>Cost (₹)</th>
        <th>Net Income (₹)</th>
      </tr>
      ${breakdownRows}
    </table>
    <div style="text-align:center; margin-top: 20px;">
      <button onclick="toggleAssumptions()" 
              style="padding: 10px 20px; font-size: 14px; background-color: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">
        View Assumptions
      </button>
    </div>
    <div id="assumptions" style="display:none; margin-top: 20px; border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #f9f9f9;">
      <h3>Assumptions & Declarations</h3>
      <ul>
        <li>Pilot salary is considered as 20000 per month</li>
        <li>Capital investment for transport vehicles (2W/3W/4W) is not included</li>
        <li>State-specific subsidy schemes are not considered</li>
      </ul>
    </div>
  `;

  const monthlyLabour = (masterdata.laborDailyWage * sprayDays) / 12;

  new Chart(document.getElementById('pieChart').getContext('2d'), {
    type: 'pie',
    data: {
      labels: ['Labour Wages', 'Logistics Cost', 'Electricity Charges', 'EMI', 'Insurance', 'Maintenance', 'Miscellaneous'],
      datasets: [{
        data: [
          Math.round(monthlyLabour),
          Math.round(masterdata.logisticsAnnual / 12),
          1000,
          Math.round(emi),
          Math.round(masterdata.insuranceCost / 12),
          Math.round(masterdata.maintenanceCost / 12),
          Math.round(masterdata.miscellaneousCost / 12)
        ],
        backgroundColor: ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22'],
        borderWidth: 1
      }]
    },
    options: { responsive: true }
  });

  new Chart(document.getElementById('lineChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: yearlyData.map(y => `Year ${y.year}`),
      datasets: [{
        label: 'Annual Net Profit (₹)',
        data: yearlyData.map(y => Math.round(y.netIncome)),
        fill: false,
        borderColor: '#2ecc71',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}
