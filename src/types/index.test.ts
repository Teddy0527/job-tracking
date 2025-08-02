import { SELECTION_STEPS } from './index';

describe('SELECTION_STEPS', () => {
  test('should have 5 steps', () => {
    expect(SELECTION_STEPS).toHaveLength(5);
  });

  test('should have correct step IDs from 1 to 5', () => {
    const stepIds = SELECTION_STEPS.map(step => step.id);
    expect(stepIds).toEqual([1, 2, 3, 4, 5]);
  });

  test('should have correct step names', () => {
    const expectedNames = [
      '検討中',
      'ES提出済み',
      '選考中（書類・適性検査）',
      '選考中（面接）',
      '内定獲得'
    ];
    
    const stepNames = SELECTION_STEPS.map(step => step.name);
    expect(stepNames).toEqual(expectedNames);
  });

  test('should have correct progress values', () => {
    const expectedProgress = [0, 25, 50, 75, 100];
    const stepProgress = SELECTION_STEPS.map(step => step.progress);
    expect(stepProgress).toEqual(expectedProgress);
  });

  test('progress should be in ascending order', () => {
    const progressValues = SELECTION_STEPS.map(step => step.progress);
    const sortedProgress = [...progressValues].sort((a, b) => a - b);
    expect(progressValues).toEqual(sortedProgress);
  });

  test('should start with 0% progress', () => {
    expect(SELECTION_STEPS[0].progress).toBe(0);
  });

  test('should end with 100% progress', () => {
    expect(SELECTION_STEPS[SELECTION_STEPS.length - 1].progress).toBe(100);
  });
});