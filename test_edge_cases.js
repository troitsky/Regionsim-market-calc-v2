const fs = require('fs');
const { execSync } = require('child_process');

const testFiles = [
    {
        name: 'test_equal_ntp.csv',
        description: 'Все игроки с одинаковым НТП',
        expected: 'Доли должны зависеть только от начального предложения'
    },
    {
        name: 'test_monopoly.csv',
        description: 'Один доминирующий игрок',
        expected: 'Игрок 1 должен захватить большую часть рынка'
    },
    {
        name: 'test_oversupply.csv',
        description: 'Избыток предложения',
        expected: 'Большие остатки предложения, низкий импорт'
    },
    {
        name: 'test_extreme_ntp.csv',
        description: 'Экстремальные различия в НТП',
        expected: 'Игрок 1 (НТП=2.0) должен доминировать'
    },
    {
        name: 'test_deficit.csv',
        description: 'Дефицит предложения',
        expected: 'Высокий импорт от Мира'
    }
];

console.log('=== ТЕСТИРОВАНИЕ EDGE-КЕЙСОВ ===\n');

testFiles.forEach(test => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`ТЕСТ: ${test.description}`);
    console.log(`Файл: ${test.name}`);
    console.log(`Ожидание: ${test.expected}`);
    console.log('='.repeat(60));
    
    // Обновляем файл симулятора для использования тестового файла
    const simulatorContent = fs.readFileSync('market_simulator.js', 'utf8');
    const updatedContent = simulatorContent.replace(
        /const allData = await loadDataFromCSV\('.*?'\);/,
        `const allData = await loadDataFromCSV('${test.name}');`
    );
    fs.writeFileSync('market_simulator.js', updatedContent);
    
    try {
        // Запускаем симуляцию
        const output = execSync('node market_simulator.js 2>/dev/null', { encoding: 'utf8' });
        
        // Извлекаем ключевые метрики
        const lines = output.split('\n');
        
        // Ищем результаты
        const resultsStart = lines.findIndex(line => line.includes('Результаты для отрасли'));
        if (resultsStart !== -1) {
            console.log('\nКЛЮЧЕВЫЕ РЕЗУЛЬТАТЫ:');
            
            // Парсим таблицу результатов
            const tableStart = lines.findIndex((line, idx) => idx > resultsStart && line.includes('│'));
            if (tableStart !== -1) {
                // Выводим заголовок и первые несколько строк
                for (let i = tableStart; i < Math.min(tableStart + 10, lines.length); i++) {
                    if (lines[i].includes('│')) {
                        // Упрощаем вывод - только ключевые колонки
                        const parts = lines[i].split('│').map(p => p.trim());
                        if (parts[1] && parts[1] !== 'index') {
                            const player = parts[2];
                            const балл = parts[5];
                            const доля = parts[6];
                            const реализованный = parts[9];
                            const потенциальный = parts[10];
                            
                            if (player && player !== 'Игрок (k)') {
                                console.log(`  ${player}: Балл=${балл}, Доля=${доля}%, Реализ=${реализованный}, Потенц=${потенциальный}`);
                            }
                        }
                    }
                }
            }
        }
        
        // Проверяем баланс импорта/экспорта
        const balanceMatch = output.match(/Баланс.*?: ([\d.-]+)/);
        if (balanceMatch) {
            const balance = parseFloat(balanceMatch[1]);
            console.log(`\nБаланс импорта/экспорта: ${balance.toFixed(4)} ${Math.abs(balance) < 0.01 ? '✓' : '✗'}`);
        }
        
    } catch (error) {
        console.error('Ошибка при выполнении теста:', error.message);
    }
});

// Восстанавливаем оригинальный файл
const simulatorContent = fs.readFileSync('market_simulator.js', 'utf8');
const restoredContent = simulatorContent.replace(
    /const allData = await loadDataFromCSV\('.*?'\);/,
    `const allData = await loadDataFromCSV('input_data.csv');`
);
fs.writeFileSync('market_simulator.js', restoredContent);

console.log('\n=== ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===');