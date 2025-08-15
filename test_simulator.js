const fs = require('fs');
const csv = require('csv-parser');

// Копируем константы из основного файла
const RP_PARAMETR_SA = 10;
const CONVERGENCE_THRESHOLD_PERCENT = 0.0001;
const MIN_SUPPLY_FOR_DISTRIBUTION = 0.001;

// Загружаем функции из основного файла
eval(fs.readFileSync('market_simulator.js', 'utf8').split('runSimulation')[0]);

async function testSimulation() {
    // Загружаем тестовые данные
    const data = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream('test_input.csv')
            .pipe(csv())
            .on('data', (row) => {
                for (const key in row) {
                    if (key !== 'a') {
                        row[key] = parseFloat(row[key]);
                    }
                }
                data.push(row);
            })
            .on('end', resolve)
            .on('error', reject);
    });

    console.log('\n=== ТЕСТОВАЯ СИМУЛЯЦИЯ ===');
    console.log('Входные данные:');
    console.table(data.map(p => ({
        'Игрок': p.k === 0 ? 'Мир' : p.k,
        'Валовой выпуск': p.валовой_выпуск,
        'Спрос региона': p.спрос_региона,
        'Уровень НТП': p.уровень_нтп
    })));

    const results = simulateIndustryMarket(data);
    
    console.log('\nРезультаты симуляции:');
    console.table(results.map(p => ({
        'Игрок': p.k === 0 ? 'Мир' : p.k,
        'Продано внутри': p.спрос_удовл_внутр.toFixed(2),
        'Импорт': p.импорт_расчетный.toFixed(2),
        'Экспорт': p.экспорт.toFixed(2),
        'Балл качества': p.балл_са.toFixed(2),
        'Доля идеальная': (p.доля_идеал * 100).toFixed(2) + '%'
    })));
}

testSimulation().catch(console.error);