const { suggestStaffing } = require('../src/optimizer.js');

describe('suggestStaffing', () => {
  test('uses cheapest role to satisfy coverage', () => {
    const result = suggestStaffing({
      zoneCapacity: 5,
      budgetLimit: 1000,
      rates: { doctor: 100, nurse: 50, assistant: 20 },
    });
    expect(result.day).toEqual({ doctor: 0, nurse: 0, assistant: 5 });
    expect(result.night).toEqual({ doctor: 0, nurse: 0, assistant: 5 });
  });

  test('chooses doctor when doctor rate is lowest', () => {
    const result = suggestStaffing({
      zoneCapacity: 3,
      budgetLimit: 1000,
      rates: { doctor: 10, nurse: 20, assistant: 30 },
    });
    expect(result.day).toEqual({ doctor: 3, nurse: 0, assistant: 0 });
  });
});
