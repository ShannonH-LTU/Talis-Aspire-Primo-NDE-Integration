import { getTalisAspireConfig, TALIS_ASPIRE_DEFAULTS } from './talis-aspire.config';

describe('talis-aspire.config', () => {
  describe('getTalisAspireConfig', () => {
    it('should throw error when MODULE_PARAMETERS is missing', () => {
      expect(() => getTalisAspireConfig(null)).toThrowError('Talis Aspire configuration missing');
      expect(() => getTalisAspireConfig({})).toThrowError('Talis Aspire configuration missing');
    });

    it('should throw error when baseUrl is missing', () => {
      const params = {
        talisAspire: {
          mmsIdInstitutionCode: 1234
        }
      };
      expect(() => getTalisAspireConfig(params)).toThrowError('Talis Aspire baseUrl is required in configuration');
    });

    it('should throw error when mmsIdInstitutionCode is missing', () => {
      const params = {
        talisAspire: {
          baseUrl: 'https://test.rl.talis.com/'
        }
      };
      expect(() => getTalisAspireConfig(params)).toThrowError('Talis Aspire mmsIdInstitutionCode is required in configuration');
    });

    it('should auto-derive httpBaseUrl from baseUrl when not provided', () => {
      const params = {
        talisAspire: {
          baseUrl: 'https://test.rl.talis.com/',
          mmsIdInstitutionCode: 1234
        }
      };

      const config = getTalisAspireConfig(params);

      expect(config.httpBaseUrl).toBe('http://test.rl.talis.com/');
      expect(config.baseUrl).toBe('https://test.rl.talis.com/');
    });

    it('should use provided httpBaseUrl when specified', () => {
      const params = {
        talisAspire: {
          baseUrl: 'https://test.rl.talis.com/',
          httpBaseUrl: 'http://lists.library.test.ac.uk/',
          mmsIdInstitutionCode: 1234
        }
      };

      const config = getTalisAspireConfig(params);

      expect(config.httpBaseUrl).toBe('http://lists.library.test.ac.uk/');
      expect(config.baseUrl).toBe('https://test.rl.talis.com/');
    });

    it('should apply default values for optional fields', () => {
      const params = {
        talisAspire: {
          baseUrl: 'https://test.rl.talis.com/',
          mmsIdInstitutionCode: 1234
        }
      };

      const config = getTalisAspireConfig(params);

      expect(config.relatedListsDisplayLabel).toBe(TALIS_ASPIRE_DEFAULTS.relatedListsDisplayLabel);
      expect(config.displayBookmarkThisButton).toBe(TALIS_ASPIRE_DEFAULTS.displayBookmarkThisButton);
      expect(config.bookmarkThisTitleAttribute).toBe(TALIS_ASPIRE_DEFAULTS.bookmarkThisTitleAttribute);
      expect(config.bookmarkThisButtonText).toBe(TALIS_ASPIRE_DEFAULTS.bookmarkThisButtonText);
    });

    it('should use custom values when provided for optional fields', () => {
      const params = {
        talisAspire: {
          baseUrl: 'https://test.rl.talis.com/',
          mmsIdInstitutionCode: 1234,
          relatedListsDisplayLabel: 'Custom Label',
          displayBookmarkThisButton: false,
          bookmarkThisTitleAttribute: 'Custom Tooltip',
          bookmarkThisButtonText: 'Custom Button'
        }
      };

      const config = getTalisAspireConfig(params);

      expect(config.relatedListsDisplayLabel).toBe('Custom Label');
      expect(config.displayBookmarkThisButton).toBe(false);
      expect(config.bookmarkThisTitleAttribute).toBe('Custom Tooltip');
      expect(config.bookmarkThisButtonText).toBe('Custom Button');
    });

    it('should handle baseUrl without trailing slash when auto-deriving httpBaseUrl', () => {
      const params = {
        talisAspire: {
          baseUrl: 'https://test.rl.talis.com',
          mmsIdInstitutionCode: 1234
        }
      };

      const config = getTalisAspireConfig(params);

      expect(config.httpBaseUrl).toBe('http://test.rl.talis.com');
    });
  });
});
