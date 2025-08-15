const fs = require('fs');
const csv = require('csv-parser');

// Константы из основного симулятора
const RP_PARAMETR_SA = 10;
const CONVERGENCE_THRESHOLD_PERCENT = 0.0001;
const MIN_SUPPLY_FOR_DISTRIBUTION = 0.001;

// Копируем все необходимые функции из основного файла
const mainCode = fs.readFileSync('market_simulator.js', 'utf8');
const functionsCode = mainCode.split('async function runSimulation')[0];
eval(functionsCode);

async function testDeficitScenario() {
    console.log('=== ТЕСТ СЦЕНАРИЯ С ДЕФИЦИТОМ ПРЕДЛОЖЕНИЯ ===\n');
    
    // Загружаем тестовые данные
    const data = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream('test_deficit.csv')
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

    // Анализ входных данных
    const реальныеИгроки = data.filter(p => p.k !== 0);
    const общийСпрос = реальныеИгроки.reduce((sum, p) => sum + p.спрос_региона, 0);
    const общееПредложение = реальныеИгроки.reduce((sum, p) => sum + p.валовой_выпуск, 0);
    
    console.log('АНАЛИЗ ВХОДНЫХ ДАННЫХ:');
    console.log(`Общий спрос регионов: ${общийСпрос.toLocaleString()}`);
    console.log(`Общее предложение регионов: ${общееПредложение.toLocaleString()}`);
    console.log(`Дефицит предложения: ${(общийСпрос - общееПредложение).toLocaleString()}`);
    console.log(`Процент дефицита: ${((1 - общееПредложение/общийСпрос) * 100).toFixed(1)}%\n`);
    
    console.log('ДЕТАЛИ ПО ИГРОКАМ:');
    console.table(data.map(p => ({
        'Игрок': p.k === 0 ? 'МИР' : `Регион ${p.k}`,
        'Предложение': p.валовой_выпуск.toLocaleString(),
        'Спрос': p.спрос_региона.toLocaleString(),
        'Баланс': (p.валовой_выпуск - p.спрос_региона).toLocaleString(),
        'Уровень НТП': p.уровень_нтп
    })));
    
    console.log('\n=== ЗАПУСК СИМУЛЯЦИИ ===\n');
    
    // Запускаем симуляцию
    const results = simulateIndustryMarket(data);
    
    console.log('\n=== РЕЗУЛЬТАТЫ СИМУЛЯЦИИ ===\n');
    
    // Анализ результатов
    const мир = results.find(p => p.k === 0);
    const суммаИмпорта = реальныеИгроки.reduce((sum, p) => {
        const player = results.find(r => r.k === p.k);
        return sum + (player ? player.импорт_расчетный : 0);
    }, 0);
    
    console.log('КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ:');
    console.log(`Продажи "Мира" на внутреннем рынке: ${мир.спрос_удовл_внутр.toLocaleString()}`);
    console.log(`Суммарный импорт регионов: ${суммаИмпорта.toLocaleString()}`);
    console.log(`Экспорт "Мира": ${мир.экспорт.toLocaleString()}`);
    console.log(`Остаток предложения "Мира": ${мир.предложение_остаток_итог.toLocaleString()}\n`);
    
    console.log('РЕЗУЛЬТАТЫ ПО ИГРОКАМ:');
    console.table(results.map(p => ({
        'Игрок': p.k === 0 ? 'МИР' : `Регион ${p.k}`,
        'Продано внутри': p.спрос_удовл_внутр.toFixed(0),
        'Импорт': p.импорт_расчетный.toFixed(0),
        'Экспорт': p.экспорт.toFixed(0),
        'Удовл. спрос': (p.спрос_удовл_внутр + p.импорт_расчетный - p.экспорт).toFixed(0),
        'Остаток предл.': p.предложение_остаток_итог.toFixed(0),
        'Доля рынка %': (p.доля_идеал * 100).toFixed(1)
    })));
    
    // Проверка баланса
    console.log('\n=== ПРОВЕРКА БАЛАНСА ===');
    const всегоПродано = results.reduce((sum, p) => sum + p.спрос_удовл_внутр, 0);
    const всегоСпроса = общийСпрос;
    console.log(`Всего продано на внутреннем рынке: ${всегоПродано.toFixed(0)}`);
    console.log(`Всего спроса было: ${всегоСпроса.toFixed(0)}`);
    console.log(`Баланс: ${(всегоПродано - всегоСпроса).toFixed(2)} ${Math.abs(всегоПродано - всегоСпроса) < 0.01 ? '✓' : '✗'}`);
}

testDeficitScenario().catch(console.error);