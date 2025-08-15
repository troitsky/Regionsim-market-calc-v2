const fs = require('fs');

// Создаем временный файл, заменив input_data.csv
const originalData = fs.readFileSync('input_data.csv', 'utf8');
const testData = fs.readFileSync('test_deficit.csv', 'utf8');

// Временно подменяем файл данных
fs.writeFileSync('input_data_backup.csv', originalData);
fs.writeFileSync('input_data.csv', testData);

console.log('=== ЗАПУСК ТЕСТА С ДЕФИЦИТОМ ПРЕДЛОЖЕНИЯ ===\n');
console.log('Сценарий: Общий спрос = 860,000, Общее предложение регионов = 200,000');
console.log('Ожидание: Регионы должны импортировать 660,000 от "Мира"\n');

// Запускаем основной симулятор
require('./market_simulator.js');

// Восстанавливаем оригинальный файл после задержки
setTimeout(() => {
    fs.writeFileSync('input_data.csv', originalData);
    fs.unlinkSync('input_data_backup.csv');
    console.log('\n(Оригинальные данные восстановлены)');
}, 1000);