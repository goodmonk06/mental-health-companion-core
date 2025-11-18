import { describe, it, expect } from 'vitest';
import { SafetyService } from '../../services/safety.service';

describe('SafetyService', () => {
  describe('checkContent', () => {
    it('should flag critical keywords', () => {
      const result = SafetyService.checkContent('死にたい気持ちがあります');

      expect(result.isSafe).toBe(false);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].severity).toBe('critical');
      expect(result.flags[0].type).toBe('self_harm');
    });

    it('should flag high severity keywords', () => {
      const result = SafetyService.checkContent('自傷行為をしてしまいました');

      expect(result.isSafe).toBe(true); // high is not critical
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].severity).toBe('high');
    });

    it('should flag medium severity keywords', () => {
      const result = SafetyService.checkContent('今日はとてもつらい一日でした');

      expect(result.isSafe).toBe(true);
      expect(result.flags).toHaveLength(1);
      expect(result.flags[0].severity).toBe('medium');
      expect(result.flags[0].keyword).toBe('つらい');
    });

    it('should return safe for normal content', () => {
      const result = SafetyService.checkContent('今日は良い天気でした');

      expect(result.isSafe).toBe(true);
      expect(result.flags).toHaveLength(0);
    });

    it('should detect multiple keywords', () => {
      const result = SafetyService.checkContent('つらいし苦しいです');

      expect(result.isSafe).toBe(true);
      expect(result.flags.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getCrisisResponse', () => {
    it('should return crisis response message', () => {
      const response = SafetyService.getCrisisResponse();

      expect(response).toContain('いのちの電話');
      expect(response).toContain('0570-783-556');
      expect(response).toContain('医療行為ではない');
    });
  });
});
