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
  const investmentAmount = document.getElementById("investmentAmount").value;
  const pricePerAcre = document.getElementById("pricePerAcre").value;
  const generateReportButton = document.getElementById("generateReportButton");
  generateReportButton.disabled = !(investmentAmount && pricePerAcre);
}

window.onload = function() {
  validateFields();
  toggleButtons();
};

document.getElementById("investmentAmount").addEventListener("input", validateFields);
document.getElementById("pricePerAcre").addEventListener("input", validateFields);

// You can also call this on page load to ensure the button is initially disabled
window.onload = function() {
  validateFields(); // Check initial state of the form
};

function getCurrentStep() {
  for (let i = 0; i < steps.length; i++) {
    if (!document.getElementById(steps[i]).classList.contains("hidden")) {
      return i + 1;
    }
  }
  return 1;
}

// Automatically check and update button states when the page loads or a field changes
window.onload = function() {
  toggleButtons(); // Ensure buttons are in the correct state when the page loads
};
// Function to open the modal
function openModal() {
  const modal = document.getElementById('messageModal');
  modal.style.display = "flex"; // Show the modal
}

// Function to close the modal
function closeModal() {
  const modal = document.getElementById('messageModal');
  modal.style.display = "none"; // Hide the modal
}

document.getElementById("viewButton").addEventListener("click", function() {
  openModal();
});


function generateReport() {
  document.getElementById("step4").classList.add("hidden");
  document.getElementById("report").classList.remove("hidden");

  const acresPerDay = parseFloat(document.getElementById("acresPerDay").value);
  const sprayDays = parseFloat(document.getElementById("sprayDays").value);
  const pricePerAcre = parseFloat(document.getElementById("pricePerAcre").value);
  const investmentAmount = parseFloat(document.getElementById("investmentAmount").value);
  const funding = document.getElementById("funding").value;
  const nbfcInterest = parseFloat(document.getElementById("nbfcInterest").value) || 0;
  const hirePilot = document.getElementById("hirePilot").value;

  if (isNaN(acresPerDay) || isNaN(sprayDays) || isNaN(pricePerAcre) || isNaN(investmentAmount)) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  let interestRate = masterdata.interestRates[funding];
  if (funding === "nbfc") {
    interestRate = nbfcInterest;
  }

  let totalAcresYear1 = acresPerDay * sprayDays;
  let batterySetsNeeded = Math.ceil((totalAcresYear1 / masterdata.batteryCoveragePerSet) / masterdata.batteryLifeCycles) + masterdata.extraBatterySets;
  let principal = investmentAmount;
  let tenureMonths = 5 * 12;
  let monthlyInterestRate = interestRate / 1200;
  let emi = funding === "self" ? 0 : principal * monthlyInterestRate * (Math.pow(1 + monthlyInterestRate, tenureMonths)) / (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);

  let totalRevenue = 0, totalCost = 0, totalNetIncome = 0, cumulativeAcres = 0;
  let yearlyData = [];
  let cumulativeIncome = 0;
  let paybackPeriod = "N/A";

  let servicePrice = pricePerAcre;
  let acres = totalAcresYear1;

  for (let year = 1; year <= 5; year++) {
    let revenue = acres * servicePrice;
    let pilotSalaryAnnual = (hirePilot === "yes") ? masterdata.pilotMonthlySalary * 12 : 0;
    let operatingCost = (acres * masterdata.laborDailyWage) + masterdata.logisticsAnnual + masterdata.maintenanceCost + masterdata.miscellaneousCost + (emi * 12) + pilotSalaryAnnual;
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

  const roi = ((totalNetIncome / investmentAmount) * 100).toFixed(2);
  const breakEvenYear = yearlyData.find(y => y.revenue >= investmentAmount)?.year || "N/A";
  const totalEMIPaid = funding === "self" ? 0 : Math.round(emi * tenureMonths);
  const totalInterestPaid = funding === "self" ? 0 : Math.round((emi * tenureMonths) - principal);

  document.getElementById("reportTables").innerHTML = `
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
