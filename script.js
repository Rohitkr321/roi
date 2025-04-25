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
  maintenanceCost: 0, // Editable
  miscellaneousCost: 1000,
  batteryCoveragePerSet: 4,
  batteryLifeCycles: 500,
  extraBatterySets: 1,
  annualAcreGrowthPercent: 25,
  servicePriceInflation: 25,
  interestRates: {
    self: 0,
    aif: 6,
    nbfc: 0,
  },
};

// --- Navigation between steps ---
const steps = ["step1", "step2", "step3", "step4"];

function nextStep(currentStep) {
  document.getElementById(steps[currentStep - 1]).classList.add("hidden");
  document.getElementById(steps[currentStep]).classList.remove("hidden");
}

function toggleNBFCInterest() {
  const funding = document.getElementById("funding").value;
  document.getElementById("nbfcInterestContainer").classList.toggle("hidden", funding !== "nbfc");
}

// --- Main Calculation and Report Generation ---
function generateReport() {
  alert("Congratulations! You seem to be on great ground to start your profitable business.");
  document.getElementById("step4").classList.add("hidden");
  document.getElementById("report").classList.remove("hidden");

  // Inputs
  const acresPerDay = parseFloat(document.getElementById("acresPerDay").value);
  const sprayDays = parseFloat(document.getElementById("sprayDays").value);
  const pricePerAcre = parseFloat(document.getElementById("pricePerAcre").value);
  const investmentAmount = parseFloat(document.getElementById("investmentAmount").value);
  const funding = document.getElementById("funding").value;
  const nbfcInterest = parseFloat(document.getElementById("nbfcInterest").value) || 0;
  const hirePilot = document.getElementById("hirePilot").value;

  // Determine interest rate
  let interestRate = masterdata.interestRates[funding];
  if (funding === "nbfc") {
    interestRate = nbfcInterest;
  }

  // Initial Calculations
  let totalAcresYear1 = acresPerDay * sprayDays;
  let totalBatteryCycles = totalAcresYear1 / masterdata.batteryCoveragePerSet;
  let batterySetsNeeded = Math.ceil(totalBatteryCycles / masterdata.batteryLifeCycles) + masterdata.extraBatterySets;

  let equipmentCost = masterdata.droneCost + (batterySetsNeeded * masterdata.batterySetCost)
    + masterdata.gnssDeviceCost + masterdata.markingSubscription + masterdata.pilotLicenseCost
    + masterdata.chargingInfrastructure + masterdata.insuranceCost + masterdata.miscellaneousCost;

  // EMI calculation (if loan taken)
  let principal = investmentAmount;
  let tenureYears = 5;
  let tenureMonths = tenureYears * 12;
  let monthlyInterestRate = interestRate / 1200;
  let emi = principal * monthlyInterestRate * (Math.pow(1 + monthlyInterestRate, tenureMonths)) / (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);
  if (funding === "self") emi = 0;

  // 5 Year Cumulative Data
  let totalRevenue = 0;
  let totalCost = 0;
  let totalNetIncome = 0;
  let cumulativeAcres = 0;
  let yearlyData = [];

  let servicePrice = pricePerAcre;
  let acres = totalAcresYear1;

  for (let year = 1; year <= 5; year++) {
    let revenue = acres * servicePrice;
    let pilotSalaryAnnual = (hirePilot === "yes") ? masterdata.pilotMonthlySalary * 12 : 0;
    let operatingCost = (acres * masterdata.laborDailyWage) + masterdata.logisticsAnnual +
      masterdata.maintenanceCost + masterdata.miscellaneousCost + (emi * 12) + pilotSalaryAnnual;

    yearlyData.push({
      year,
      acres,
      revenue,
      cost: operatingCost,
      netIncome: revenue - operatingCost
    });

    totalRevenue += revenue;
    totalCost += operatingCost;
    totalNetIncome += revenue - operatingCost;
    cumulativeAcres += acres;

    acres *= (1 + masterdata.annualAcreGrowthPercent / 100);
    servicePrice *= (1 + masterdata.servicePriceInflation / 100);
  }

  const roi = (totalNetIncome / investmentAmount) * 100;
  const paybackPeriod = investmentAmount / (yearlyData[0].netIncome || 1);
  const breakEvenYear = yearlyData.find(y => y.revenue >= investmentAmount)?.year || "N/A";

  // --- Report Table HTML ---
  document.getElementById("reportTables").innerHTML = `
    <table>
      <tr><th colspan="2">Business Summary</th></tr>
      <tr><td>Total Acres Covered</td><td>${cumulativeAcres.toFixed(0)}</td></tr>
      <tr><td>Total Water Saved (liters)</td><td>${(cumulativeAcres * 92).toLocaleString()}</td></tr>
      <tr><td>Battery Sets Required</td><td>${batterySetsNeeded}</td></tr>
    </table>

    <table>
      <tr><th colspan="2">Financial Summary</th></tr>
      <tr><td>Cumulative Revenue</td><td>₹ ${totalRevenue.toLocaleString()}</td></tr>
      <tr><td>Cumulative Cost</td><td>₹ ${totalCost.toLocaleString()}</td></tr>
      <tr><td>Cumulative Net Income</td><td>₹ ${totalNetIncome.toLocaleString()}</td></tr>
      <tr><td>Initial Investment</td><td>₹ ${investmentAmount.toLocaleString()}</td></tr>
      <tr><td>Loan Component</td><td>₹ ${principal.toLocaleString()}</td></tr>
      <tr><td>Total EMI Paid</td><td>₹ ${(emi * tenureMonths).toLocaleString()}</td></tr>
      <tr><td>Total Interest Paid</td><td>₹ ${((emi * tenureMonths) - principal).toLocaleString()}</td></tr>
    </table>

    <table>
      <tr><th colspan="2">ROI & Cost Metrics</th></tr>
      <tr><td>ROI</td><td>${roi.toFixed(2)} %</td></tr>
      <tr><td>Payback Period</td><td>${paybackPeriod.toFixed(1)} years</td></tr>
      <tr><td>Break-even Point</td><td>Year ${breakEvenYear}</td></tr>
    </table>
  `;

  // --- PIE CHART ---
  const monthlyLabour = (masterdata.laborDailyWage * sprayDays) / 12;
  const ctxPie = document.getElementById('pieChart').getContext('2d');
  new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: [
        'Labour Wages',
        'Logistics Cost',
        'Electricity Charges',
        'EMI',
        'Insurance',
        'Maintenance',
        'Miscellaneous'
      ],
      datasets: [{
        data: [
          monthlyLabour,
          masterdata.logisticsAnnual / 12,
          1000,
          emi,
          masterdata.insuranceCost / 12,
          masterdata.maintenanceCost / 12,
          masterdata.miscellaneousCost / 12
        ],
        backgroundColor: [
          '#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true
    }
  });

  // --- LINE CHART ---
  const ctxLine = document.getElementById('lineChart').getContext('2d');
  new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: yearlyData.map(y => `Year ${y.year}`),
      datasets: [{
        label: 'Annual Net Profit (₹)',
        data: yearlyData.map(y => y.netIncome),
        fill: false,
        borderColor: '#2ecc71',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
