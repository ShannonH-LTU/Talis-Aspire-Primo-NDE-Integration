import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { TarlRelatedListsComponent } from './tarl-related-lists.component';
import * as config from '../talis-aspire.config';

describe('TarlRelatedListsComponent', () => {
  let component: TarlRelatedListsComponent;
  let fixture: ComponentFixture<TarlRelatedListsComponent>;
  let httpClient: HttpClient;

  const mockModuleParameters = {
    talisAspire: {
      baseUrl: 'https://test.rl.talis.com/',
      httpBaseUrl: 'http://test.library.ac.uk/',
      mmsIdInstitutionCode: 1234,
      relatedListsDisplayLabel: 'Cited on reading lists:',
      displayBookmarkThisButton: true,
      bookmarkThisTitleAttribute: 'bookmark this item to reading lists',
      bookmarkThisButtonText: 'Send To Reading Lists',
    },
  };

  const mockMmsItem = {
    pnx: {
      display: {
        mms: ['991234567891234']
      }
    }
  };

  const mockIsbnItem = {
    pnx: {
      addata: {
        isbn: ['978-0-123456-78-9', '0123456789']
      }
    }
  };

  const mockApiResponse = {
    'http://test.library.ac.uk/lists/ABC123':
      'Introduction to Computer Science',
    'http://test.library.ac.uk/lists/DEF456': 'Advanced Programming',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarlRelatedListsComponent, HttpClientTestingModule],
      providers: [
        { provide: 'MODULE_PARAMETERS', useValue: mockModuleParameters },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TarlRelatedListsComponent);
    component = fixture.componentInstance;
    httpClient = TestBed.inject(HttpClient);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with config display label after ngOnInit', () => {
    component['hostComponent'] = { searchResult: mockMmsItem };
    component.ngOnInit();
    expect(component.displayLabel).toBe('Cited on reading lists:');
  });

  describe('ngOnInit', () => {
    it('should not fetch lists when hostComponent is missing', () => {
      spyOn(console, 'warn');
      component['hostComponent'] = undefined;

      component.ngOnInit();

      expect(console.warn).toHaveBeenCalledWith('No searchResult found from hostComponent');
    });

    it('should not fetch lists when searchResult is missing', () => {
      spyOn(console, 'warn');
      component['hostComponent'] = {};

      component.ngOnInit();

      expect(console.warn).toHaveBeenCalledWith('No searchResult found from hostComponent');
    });

    it('should fetch lists using MMS ID when available', () => {
      spyOn(config, 'extractMmsIds').and.returnValue(['991234567891234']);
      spyOn<any>(component, 'fetchListsForMmsId');
      component['hostComponent'] = { searchResult: mockMmsItem };

      component.ngOnInit();

      expect(config.extractMmsIds).toHaveBeenCalledWith(mockMmsItem, 1234);
      expect(component['fetchListsForMmsId']).toHaveBeenCalledWith('991234567891234');
    });

    it('should fetch lists for multiple MMS IDs', () => {
      spyOn(config, 'extractMmsIds').and.returnValue(['991234567891234', '991234567895678']);
      spyOn<any>(component, 'fetchListsForMmsId');
      component['hostComponent'] = { searchResult: mockMmsItem };

      component.ngOnInit();

      expect(component['fetchListsForMmsId']).toHaveBeenCalledTimes(2);
      expect(component['fetchListsForMmsId']).toHaveBeenCalledWith('991234567891234');
      expect(component['fetchListsForMmsId']).toHaveBeenCalledWith('991234567895678');
    });

    it('should fall back to ISBN when no MMS ID available', () => {
      spyOn(config, 'extractMmsIds').and.returnValue([]);
      spyOn(config, 'extractIsbns').and.returnValue(['9780123456789', '0123456789']);
      spyOn<any>(component, 'fetchListsForISBN');
      component['hostComponent'] = { searchResult: mockIsbnItem };

      component.ngOnInit();

      expect(config.extractIsbns).toHaveBeenCalledWith(mockIsbnItem);
      expect(component['fetchListsForISBN']).toHaveBeenCalledTimes(2);
      expect(component['fetchListsForISBN']).toHaveBeenCalledWith('9780123456789');
      expect(component['fetchListsForISBN']).toHaveBeenCalledWith('0123456789');
    });
  });

  describe('fetchListsForMmsId', () => {
    it('should call fetchLists with correct MMS ID URL', () => {
      component['hostComponent'] = { searchResult: mockMmsItem };
      component.ngOnInit(); // Initialize config
      spyOn<any>(component, 'fetchLists');

      component['fetchListsForMmsId']('991234567891234');

      expect(component['fetchLists']).toHaveBeenCalledWith(
        'https://test.rl.talis.com/lcn/991234567891234/lists.json',
        'MMS ID: 991234567891234',
      );
    });
  });

  describe('fetchListsForISBN', () => {
    it('should call fetchLists with correct ISBN URL', () => {
      component['hostComponent'] = { searchResult: mockIsbnItem };
      component.ngOnInit(); // Initialize config
      spyOn<any>(component, 'fetchLists');

      component['fetchListsForISBN']('9780123456789');

      expect(component['fetchLists']).toHaveBeenCalledWith(
        'https://test.rl.talis.com/isbn/9780123456789/lists.json',
        'ISBN: 9780123456789',
      );
    });
  });

  describe('fetchLists', () => {
    beforeEach(() => {
      component['hostComponent'] = { searchResult: mockMmsItem };
      component.ngOnInit(); // Initialize config
    });

    it('should fetch and store lists with HTTPS URLs', (done) => {
      spyOn(httpClient, 'jsonp').and.returnValue(of(mockApiResponse));

      component['fetchLists']('https://example.com/lists.json', 'Test ID');

      // Give async operation time to complete
      setTimeout(() => {
        expect(httpClient.jsonp).toHaveBeenCalledWith('https://example.com/lists.json', 'cb');
        expect(component.listsFound).toEqual({
          'https://test.rl.talis.com/lists/ABC123':
            'Introduction to Computer Science',
          'https://test.rl.talis.com/lists/DEF456': 'Advanced Programming',
        });
        done();
      }, 10);
    });

    it('should merge lists from multiple API calls', (done) => {
      const firstResponse = {
        'http://test.library.ac.uk/lists/ABC123': 'First List',
      };
      const secondResponse = {
        'http://test.library.ac.uk/lists/DEF456': 'Second List',
      };

      spyOn(httpClient, 'jsonp').and.returnValues(of(firstResponse), of(secondResponse));

      component['fetchLists']('https://example.com/first.json', 'First ID');

      setTimeout(() => {
        component['fetchLists']('https://example.com/second.json', 'Second ID');

        setTimeout(() => {
          expect(component.listsFound).toEqual({
            'https://test.rl.talis.com/lists/ABC123': 'First List',
            'https://test.rl.talis.com/lists/DEF456': 'Second List',
          });
          done();
        }, 10);
      }, 10);
    });

    it('should handle API errors gracefully', (done) => {
      spyOn(console, 'error');
      spyOn(httpClient, 'jsonp').and.returnValue(throwError(() => new Error('API Error')));

      component['fetchLists']('https://example.com/lists.json', 'Test ID');

      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Talis Aspire API request failed for Test ID:',
          jasmine.any(Error)
        );
        expect(component.listsFound).toBeNull();
        done();
      }, 10);
    });

    it('should handle null or undefined API response', (done) => {
      spyOn(httpClient, 'jsonp').and.returnValue(of(null));

      component['fetchLists']('https://example.com/lists.json', 'Test ID');

      setTimeout(() => {
        expect(component.listsFound).toBeNull();
        done();
      }, 10);
    });

    it('should handle empty object API response', (done) => {
      spyOn(httpClient, 'jsonp').and.returnValue(of({}));

      component['fetchLists']('https://example.com/lists.json', 'Test ID');

      setTimeout(() => {
        expect(component.listsFound).toEqual({});
        done();
      }, 10);
    });
  });

  describe('listEntries getter', () => {
    it('should return empty array when listsFound is null', () => {
      component.listsFound = null;

      expect(component.listEntries).toEqual([]);
    });

    it('should return empty array when listsFound is empty object', () => {
      component.listsFound = {};

      expect(component.listEntries).toEqual([]);
    });

    it('should transform listsFound object into array of entries', () => {
      component.listsFound = {
        'https://example.com/list1': 'List One',
        'https://example.com/list2': 'List Two',
        'https://example.com/list3': 'List Three'
      };

      const result = component.listEntries;

      expect(result.length).toBe(3);
      expect(result).toContain({ url: 'https://example.com/list1', name: 'List One' });
      expect(result).toContain({ url: 'https://example.com/list2', name: 'List Two' });
      expect(result).toContain({ url: 'https://example.com/list3', name: 'List Three' });
    });
  });
});
