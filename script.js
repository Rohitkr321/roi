// --- Masterdata ---
const masterdata = {
  droneCost: 495000,
  batterySetCost: 56640,
  gnssDeviceCost: 77000,
  markingSubscription: 25000,
  pilotLicenseCost: 25000,
  pilotMonthlySalary: 20000,
  labourwageperacre: 192,
  laborDailyWage: 500,
  chargingInfrastructure: 1750 + 5000,
  logisticsAnnual: 33000,
  logisticCost: 13,
  electricCharge: 3,
  gaCloud: 2,
  insurance: 20,
  maintaince: 40,
  miss: 10,
  insuranceCost: 22425 * 1.18,
  maintenanceCost: 0,
  miscellaneousCost: 1000,
  batteryCoveragePerSet: 4,
  batteryLifeCycles: 500,
  extraBatterySets: 1,
  annualAcreGrowthPercent: 25,
  servicePriceInflation: 25,
  interestRates: { self: 0, aif: 6, nbfc: 0 },
  bikeMountCost: 10000,
  threewheelerMountCost: 10000,
  fourwheelerMountCost: 10000,
  financePrecentage: 0.75,
  tenureMonths: 60,
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
function toggleLicenseQuestion() {
  const licenseAvailable = document.getElementById("licenseAvailable").value;
  const needLicenseContainer = document.getElementById("needLicenseContainer");

  if (licenseAvailable === "yes") {
    needLicenseContainer.style.display = "none";
  } else {
    needLicenseContainer.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  toggleLicenseQuestion();
});


function validateFields() {
  const funding = document.getElementById("funding").value;
  // const investmentAmount = document.getElementById("investmentAmount")?.value;
  const pricePerAcre = document.getElementById("pricePerAcre").value;
  const generateReportButton = document.getElementById("generateReportButton");
  generateReportButton.disabled = (funding !== "self") && !(pricePerAcre);
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
    if (this.value > 200) this.value = 200;
  });

  // document.getElementById("investmentAmount")?.addEventListener("input", validateFields);
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
  const needLicense = document.getElementById("needLicense")?.value;
  const highAccuracyValue = document.getElementById("mappingDevice")?.value;

  if (isNaN(acresPerDay) || isNaN(sprayDays) || isNaN(pricePerAcre)) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  if (acresPerDay > 30 || sprayDays > 365) {
    alert("Input limits exceeded.");
    return;
  }

  let investmentAmount = 0;
  // if (funding === "self") {
  investmentAmount = masterdata.droneCost;
  console.log(investmentAmount, 'Default')
  if (vehicleType === "2wheeler" && bikeMount === "yes") {
    investmentAmount += masterdata.bikeMountCost;
    console.log(investmentAmount, 'after vehicleType')
  }
  if (vehicleType === "3wheeler" && bikeMount === "yes") {
    investmentAmount += masterdata.threewheelerMountCost;
    console.log(investmentAmount, 'after vehicleType')
  }
  if (vehicleType === "4wheeler" && bikeMount === "yes") {
    investmentAmount += masterdata.fourwheelerMountCost;
    console.log(investmentAmount, 'after vehicleType')
  }
  if (needLicense == 'No') {
    console.log('needLicense')
    investmentAmount = investmentAmount + masterdata.pilotLicenseCost
    console.log(investmentAmount, 'after needLicense')
  };
  if (highAccuracyValue == 'highAccuracy') {
    investmentAmount = investmentAmount + masterdata.gnssDeviceCost
    console.log(investmentAmount, 'After highAccuracyValue')
  };
  // } else {
  //   investmentAmount = parseFloat(document.getElementById("investmentAmount").value);
  // }
  // if (vehicleType === "2wheeler" && bikeMount === "yes") {
  //   investmentAmount += masterdata.bikeMountCost;
  // }


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
    let revenue = Math.round(acres)* servicePrice;
    let acrePerday = Math.round(acres) / sprayDays;
    let pilotSalaryAnnual = (hirePilot === "yes") ? masterdata.pilotMonthlySalary * 12 : 0;
    let peraAcreCost = ((masterdata.labourwageperacre / acrePerday) * acresPerDay);
    let logisticsPerAcreCost = ((masterdata.logisticCost / acrePerday) * acresPerDay);
    let electricPerAcreCost = ((masterdata.electricCharge / acrePerday) * acresPerDay);
    let gaCloudPerAcreCost = masterdata.gaCloud;
    let insurance = ((masterdata.insurance / acrePerday) * acresPerDay);
    let maintaince = ((masterdata.maintaince / acrePerday) * acresPerDay);
    let miss = ((masterdata.miss / acrePerday) * acresPerDay);
    let lowOperatingCost = (peraAcreCost + logisticsPerAcreCost + electricPerAcreCost + gaCloudPerAcreCost + insurance + maintaince + miss) * Math.round(acres);
    let operatingCost = (acres * masterdata.laborDailyWage) + masterdata.logisticsAnnual + masterdata.maintenanceCost + masterdata.miscellaneousCost + (emi * 12) + pilotSalaryAnnual + depreciationPerYear;
    let netIncome = revenue - lowOperatingCost;
    let returnOfInvestement = netIncome/revenue
    let totalCostForROI = Math.round(acres)*peraAcreCost;
    let totalRevenueROI = Math.round(acres)*servicePrice;
    let incomeROI = totalRevenueROI - totalCostForROI;
    let return_on_investemnt =( incomeROI/totalCostForROI)*100;
    yearlyData.push({ year, acres, revenue, cost: lowOperatingCost, netIncome, roi: Number(return_on_investemnt.toFixed(2)) });

    totalRevenue += revenue;
    totalCost += lowOperatingCost;
    totalNetIncome += netIncome;
    cumulativeAcres += acres;
    cumulativeIncome += netIncome;
    if (paybackPeriod === "N/A" && cumulativeIncome >= investmentAmount) {
      paybackPeriod = `${year} Years`;
    }
    acres *= (1 + masterdata.annualAcreGrowthPercent / 100);
  }

  let batterySetsNeeded = Math.ceil((cumulativeAcres / masterdata.batteryCoveragePerSet) / masterdata.batteryLifeCycles) + masterdata.extraBatterySets;
  investmentAmount = investmentAmount + (batterySetsNeeded * masterdata.batterySetCost);
  let roi = ((totalNetIncome / investmentAmount) * 100).toFixed(2);
  let loanAmout = investmentAmount * masterdata.financePrecentage;
  let emiPerMonth = funding === "self" ? 0 : loanAmout * monthlyInterestRate * (Math.pow(1 + monthlyInterestRate, tenureMonths)) / (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);
  let totalIntreset = emiPerMonth * tenureMonths - loanAmout;
  let equatedIntresetPerYear = totalIntreset / tenureMonths * 12

  const breakEvenYearObj = yearlyData.find(y => Math.round(y.revenue - y.cost) >= investmentAmount);
  const breakEvenYear = breakEvenYearObj ? breakEvenYearObj.year : "N/A";
  const totalEMIPaid = funding === "self" ? 0 : Math.round(emi * tenureMonths);
  const totalInterestPaid = funding === "self" ? 0 : Math.round((emi * tenureMonths) - principal);
  if (funding !== 'self') {
    yearlyData.map(y => {
      let acre_per_days = Math.round(y.acres) / sprayDays;
      let intresetrate = (totalIntreset / y.acres / acre_per_days) * acresPerDay;
      y.cost = y.cost + intresetrate;
    })
  }
  yearlyData.map(y => {
      let anualDeprication = investmentAmount/5;
      let depreciationPerAcre = anualDeprication/y.acres;
      y.cost = y.cost + depreciationPerAcre;
    })
  const reportTables = document.getElementById("reportTables");
  let html = `<table>
  <tr><th colspan="2">Business Summary</th></tr>
  <tr><td>Total Acres Covered</td><td>${Math.round(cumulativeAcres)}</td></tr>
  <tr><td>Capital Cost</td><td>${Math.round(investmentAmount)}</td></tr>
  <tr><td>Total Water Saved (liters)</td><td>${Math.round(cumulativeAcres * 92).toLocaleString()}</td></tr>
  <tr><td>Battery Sets Required</td><td>${batterySetsNeeded}</td></tr>
</table>`
  if (funding !== 'self') {
    html += `<table>
  <tr><th colspan="2">Financial Summary</th></tr>
  <tr><td>Loan Amount</td><td>₹ ${Math.round(loanAmout).toLocaleString()}</td></tr>
  <tr><td>Loan Component</td><td>₹ ${Math.round(principal).toLocaleString()}</td></tr>
  <tr><td>Total EMI Per Month</td><td>₹ ${emiPerMonth.toLocaleString()}</td></tr>
  <tr><td>Total Intreset</td><td>₹ ${totalIntreset.toLocaleString()}</td></tr>
   <tr><td>Equated Intreset Per Year</td><td>₹ ${equatedIntresetPerYear.toLocaleString()}</td></tr>
   <tr><td>Payback Period</td><td>60 Months</td></tr>
</table>`
  }
  reportTables.innerHTML = html;

  let breakdownRows = yearlyData.map(y => `
    <tr>
      <td>${y.year}</td>
      <td>${Math.round(y.acres)}</td>
      <td>₹ ${Math.round(y.revenue).toLocaleString()}</td>
      <td>₹ ${Math.round(y.cost).toLocaleString()}</td>
      <td>₹ ${Math.round(y.netIncome).toLocaleString()}</td>
      <td>% ${Math.round(y.roi).toLocaleString()}</td>
    </tr>
  `).join('');

  reportTables.innerHTML += `
    <table>
      <tr><th colspan="6">5-Year Financial Breakdown</th></tr>
      <tr>
        <th>Year</th>
        <th>Acres</th>
        <th>Revenue (₹)</th>
        <th>Cost (₹)</th>
        <th>Net Income (₹)</th>
        <th>ROI (%)</th>
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
