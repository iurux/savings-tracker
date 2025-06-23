// ==== DOM ELEMENTS ====
const form = document.getElementById('txForm');
const typeSelect = document.getElementById('txType');
const descInput = document.getElementById('txDesc');
const dateInput = document.getElementById('txDate');
const amountInput = document.getElementById('txAmount');

const incomeTable = document.getElementById('incomeTable').querySelector('tbody');
const expenseTable = document.getElementById('expenseTable').querySelector('tbody');
const incomeTotal = document.getElementById('incomeTotal');
const expenseTotal = document.getElementById('expenseTotal');
const netTotal = document.getElementById('netTotal');

const editToggleBtn = document.getElementById('editToggleBtn');
const editSelect = document.getElementById('editSelect');
const editLoadBtn = document.getElementById('editLoadBtn');
const editDeleteBtn = document.getElementById('editDeleteBtn');

const fmt = n => `$${Number(n).toFixed(2)}`;

// ==== GLOBAL STATE ====
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let incomeSum = 0;
let expenseSum = 0;
let editingIndex = null;

// ==== RENDER ====
function clearTables() {
  incomeTable.innerHTML = '';
  expenseTable.innerHTML = '';
  incomeSum = 0;
  expenseSum = 0;
  incomeTotal.textContent = fmt(0);
  expenseTotal.textContent = fmt(0);
  netTotal.textContent = fmt(0);
}

function renderTransaction(tx, index) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${tx.desc}</td>
    <td>${tx.date}</td>
    <td>${fmt(tx.amt)}</td>
  `;

  if (tx.type === 'income') {
    incomeTable.appendChild(tr);
    incomeSum += tx.amt;
    incomeTotal.textContent = fmt(incomeSum);
  } else {
    expenseTable.appendChild(tr);
    expenseSum += tx.amt;
    expenseTotal.textContent = fmt(expenseSum);
  }

  const option = document.createElement('option');
  option.value = index;
  option.textContent = `${tx.date} - ${tx.type.toUpperCase()}: ${tx.desc} ($${tx.amt})`;
  editSelect.appendChild(option);
}

function renderAll() {
  clearTables();
  editSelect.innerHTML = '';
  transactions.forEach((tx, i) => renderTransaction(tx, i));
  updateNetTotal();
  updateChart();
}

function updateNetTotal() {
  const net = incomeSum - expenseSum;
  netTotal.textContent = fmt(net);
}

// ==== FORM SUBMIT ====
form.addEventListener('submit', e => {
  e.preventDefault();

  const tx = {
    type: typeSelect.value,
    desc: descInput.value.trim(),
    date: dateInput.value,
    amt: Number(amountInput.value)
  };

  if (editingIndex !== null) {
    transactions[editingIndex] = tx;
    editingIndex = null;
  } else {
    transactions.push(tx);
  }

  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderAll();
  form.reset();
  typeSelect.value = 'income';
});

// ==== EDITING MODE ====
editToggleBtn.addEventListener('click', () => {
  const visible = editSelect.style.display === 'inline-block';
  editSelect.style.display = visible ? 'none' : 'inline-block';
  editLoadBtn.style.display = visible ? 'none' : 'inline-block';
  editDeleteBtn.style.display = visible ? 'none' : 'inline-block';
});

editLoadBtn.addEventListener('click', () => {
  const index = parseInt(editSelect.value);
  if (!isNaN(index)) {
    const tx = transactions[index];
    typeSelect.value = tx.type;
    descInput.value = tx.desc;
    dateInput.value = tx.date;
    amountInput.value = tx.amt;
    editingIndex = index;
  }
});

editDeleteBtn.addEventListener('click', () => {
  const index = parseInt(editSelect.value);
  if (!isNaN(index)) {
    transactions.splice(index, 1);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderAll();
    form.reset();
    editingIndex = null;
  }
});

// ==== CHART.JS ====
let chart;

function updateChart() {
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amt, 0);

  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amt, 0);

  const ctx = document.getElementById('trendChart').getContext('2d');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{
        data: [totalIncome, totalExpense],
        backgroundColor: ['green', 'red']
      }]
    },
    options: {
      responsive: false, // ⛔ turn off auto-resizing
      plugins: {
        title: {
          display: true,
          text: 'Income vs. Expense Breakdown',
          font: { size: 12 }
        },
        legend: {
          labels: { font: { size: 10 } }
        }
      }
    }
  });
}

// ==== INITIALIZE ====
renderAll();

