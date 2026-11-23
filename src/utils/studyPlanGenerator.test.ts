import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateStudyPlan } from './studyPlanGenerator.ts';

describe('IELTS Study Plan Generator', () => {
  it('generates exact day counts for 7, 30, 60, and 90-day plans', () => {
    for (const durationDays of [7, 30, 60, 90] as const) {
      const days = generateStudyPlan({
        durationDays,
        currentLevel: 'B2',
        targetBand: 7.5,
        dailyMinutes: 90,
      });
      assert.equal(days.length, durationDays);
      assert.equal(days[0].day, 1);
      assert.equal(days[days.length - 1].day, durationDays);
    }
  });

  it('includes mock exam checkpoint days and unique task IDs', () => {
    const days = generateStudyPlan({
      durationDays: 30,
      currentLevel: 'B1',
      targetBand: 7.0,
      dailyMinutes: 120,
    });
    const allTasks = days.flatMap((d) => d.tasks);
    const uniqueIds = new Set(allTasks.map((t) => t.id));
    assert.equal(uniqueIds.size, allTasks.length);
    assert.ok(allTasks.some((t) => t.skill === 'Mock Exam'));
    assert.ok(allTasks.some((t) => t.targetPage === 'band9-samples'));
  });
});
