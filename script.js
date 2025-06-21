document.addEventListener('DOMContentLoaded', () => {

    // Tabs logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    // Glossary Accordion
    const glossaryItems = document.querySelectorAll('.glossary-item button');
    glossaryItems.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const isOpen = !content.classList.contains('hidden');
            
            // Close all others
            document.querySelectorAll('.glossary-item div').forEach(div => div.classList.add('hidden'));
            document.querySelectorAll('.glossary-item button span:last-child').forEach(span => span.textContent = '+');

            if (!isOpen) {
                content.classList.remove('hidden');
                button.querySelector('span:last-child').textContent = '-';
            }
        });
    });

    // Progress Chart
    const progressCtx = document.getElementById('progressChart').getContext('2d');
    new Chart(progressCtx, {
        type: 'doughnut',
        data: {
            labels: ['مكتمل', 'متبقي'],
            datasets: [{
                data: [45, 55],
                backgroundColor: ['#3b82f6', '#e5e7eb'],
                borderWidth: 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });

    // Trading Simulator Chart
    const tradingCtx = document.getElementById('tradingChart').getContext('2d');
    const initialData = Array.from({length: 40}, () => 1.0750 + (Math.random() - 0.5) * 0.005);
    const tradingChart = new Chart(tradingCtx, {
        type: 'line',
        data: {
            labels: Array(40).fill(''),
            datasets: [{
                label: 'EUR/USD',
                data: initialData,
                borderColor: '#3b82f6',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    return gradient;
                },
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(200, 200, 200, 0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Live update for chart and price
    const currentPriceEl = document.getElementById('current-price');
    setInterval(() => {
        const lastPrice = tradingChart.data.datasets[0].data[tradingChart.data.datasets[0].data.length - 1];
        const newPrice = lastPrice + (Math.random() - 0.5) * 0.0005;
        
        tradingChart.data.labels.push('');
        tradingChart.data.labels.shift();
        tradingChart.data.datasets[0].data.push(newPrice);
        tradingChart.data.datasets[0].data.shift();
        
        tradingChart.update('quiet');
        
        currentPriceEl.textContent = newPrice.toFixed(5);
        if (newPrice > lastPrice) {
            currentPriceEl.classList.remove('bg-red-200', 'text-red-800');
            currentPriceEl.classList.add('bg-green-200', 'text-green-800');
        } else {
            currentPriceEl.classList.remove('bg-green-200', 'text-red-800');
            currentPriceEl.classList.add('bg-red-200', 'text-red-800');
        }

    }, 1500);


    // Toast notification logic
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    function showToast(message, isSuccess = true) {
        toastMessage.textContent = message;
        toast.className = 'toast fixed bottom-5 right-5 text-white py-3 px-6 rounded-lg shadow-xl opacity-0 transform translate-y-10'; // reset
        toast.classList.add(isSuccess ? 'bg-green-600' : 'bg-red-600');
        toast.classList.remove('opacity-0', 'translate-y-10');
        
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-10');
        }, 3000);
    }

    // Simulator buy/sell logic
    const buyBtn = document.getElementById('buy-btn');
    const sellBtn = document.getElementById('sell-btn');
    const balanceEl = document.getElementById('balance');
    let balance = 10000;

    const pnlEl = document.getElementById('pnl');
    let pnl = 0;
    
    function handleTrade(isBuy) {
        const amount = parseFloat(document.getElementById('amount').value);
        if (isNaN(amount) || amount <= 0) {
            showToast('الرجاء إدخال كمية صحيحة.', false);
            return;
        }

        const tradePnl = (Math.random() - 0.45) * 50 * (amount / 0.01);
        pnl += tradePnl;

        pnlEl.textContent = pnl.toFixed(2);
        if (pnl > 0) {
            pnlEl.className = 'font-bold text-green-600';
        } else if (pnl < 0) {
            pnlEl.className = 'font-bold text-red-600';
        } else {
             pnlEl.className = 'font-bold text-gray-500';
        }

        const message = isBuy ? 'تم تنفيذ أمر الشراء بنجاح!' : 'تم تنفيذ أمر البيع بنجاح!';
        showToast(message, true);
    }
    
    buyBtn.addEventListener('click', () => handleTrade(true));
    sellBtn.addEventListener('click', () => handleTrade(false));

});
