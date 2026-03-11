import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TarlBookmarkButtonComponent } from './tarl-bookmark-button.component';

describe('TarlBookmarkButtonComponent', () => {
  let component: TarlBookmarkButtonComponent;
  let fixture: ComponentFixture<TarlBookmarkButtonComponent>;

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

  const mockSearchResultWithMMS = {
    pnx: {
      display: {
        mms: ['9912345678901234'], // Matches institution code 1234
      },
      addata: {
        atitle: ['Test Article'],
        jtitle: ['Test Journal'],
        au: ['Test Author'],
        issn: ['1234-5678'],
      },
    },
  };

  const mockSearchResultWithoutMMS = {
    pnx: {
      display: {
        mms: ['9956789012345678'] // Different institution code, won't match
      },
      addata: {
        atitle: ['Test Article'],
        jtitle: ['Test Journal'],
        au: ['Test Author'],
        date: ['2021-01-01'],
        issn: ['1234-5678'],
        doi: ['10.1234/test']
      }
    }
  };

  const mockSearchResultNoData = {
    pnx: {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarlBookmarkButtonComponent],
      providers: [
        { provide: 'MODULE_PARAMETERS', useValue: mockModuleParameters },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TarlBookmarkButtonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when displayButton is false', () => {
    it('should not create bookmarkable items', () => {
      const disabledParams = {
        talisAspire: {
          ...mockModuleParameters.talisAspire,
          displayBookmarkThisButton: false,
        },
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TarlBookmarkButtonComponent],
        providers: [{ provide: 'MODULE_PARAMETERS', useValue: disabledParams }],
      });
      fixture = TestBed.createComponent(TarlBookmarkButtonComponent);
      component = fixture.componentInstance;
      component['hostComponent'] = { searchResult: mockSearchResultWithMMS };

      component.ngOnInit();

      expect(component.bookmarkableItems.length).toBe(0);
    });
  });

  describe('when hostComponent has no searchResult', () => {
    it('should not create bookmarkable items', () => {
      component['hostComponent'] = {};

      component.ngOnInit();

      expect(component.bookmarkableItems.length).toBe(0);
    });
  });

  describe('when MMS ID is found', () => {
    it('should create bookmarkable item with bibid parameter', () => {
      component['hostComponent'] = { searchResult: mockSearchResultWithMMS };

      component.ngOnInit();

      expect(component.bookmarkableItems.length).toBe(1);
      expect(component.bookmarkableItems[0].url).toContain('bibid=9912345678901234');
      expect(component.bookmarkableItems[0].url).toContain('bookmarklet.html');
    });

    it('should use configured button text and title', () => {
      component['hostComponent'] = { searchResult: mockSearchResultWithMMS };

      component.ngOnInit();

      expect(component.bookmarkableItems[0].actionText).toBe(
        'Send To Reading Lists',
      );
      expect(component.bookmarkableItems[0].title).toBe(
        'bookmark this item to reading lists',
      );
    });
  });

  describe('when no MMS ID is found', () => {
    it('should create bookmarkable item with OpenURL parameters', () => {
      component['hostComponent'] = { searchResult: mockSearchResultWithoutMMS };

      component.ngOnInit();

      expect(component.bookmarkableItems.length).toBe(1);
      expect(component.bookmarkableItems[0].url).toContain('bookmarklet.html?');
      expect(component.bookmarkableItems[0].url).toContain('rft.atitle=');
      expect(component.bookmarkableItems[0].url).not.toContain('bibid=');
    });

    it('should include addata fields in OpenURL', () => {
      component['hostComponent'] = { searchResult: mockSearchResultWithoutMMS };

      component.ngOnInit();

      const url = component.bookmarkableItems[0].url;
      expect(url).toContain('rft.atitle=Test%20Article');
      expect(url).toContain('rft.jtitle=Test%20Journal');
      expect(url).toContain('rft.au=Test%20Author');
      expect(url).toContain('rft.issn=1234-5678');
    });
  });

  describe('when no MMS ID or addata is found', () => {
    it('should not create bookmarkable items', () => {
      component['hostComponent'] = { searchResult: mockSearchResultNoData };

      component.ngOnInit();

      expect(component.bookmarkableItems.length).toBe(0);
    });
  });

  describe('onBookmarkClick', () => {
    it('should navigate to the provided URL', () => {
      const testUrl = 'https://example.com/bookmark';
      const originalLocation = window.location.href;

      // Mock window.location.href assignment
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: originalLocation }
      });

      component.onBookmarkClick(testUrl);

      expect(window.location.href).toBe(testUrl);
    });
  });

  describe('button rendering', () => {
    it('should not render buttons when displayButton is false', () => {
      const disabledParams = {
        talisAspire: {
          ...mockModuleParameters.talisAspire,
          displayBookmarkThisButton: false,
        },
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TarlBookmarkButtonComponent],
        providers: [{ provide: 'MODULE_PARAMETERS', useValue: disabledParams }],
      });
      fixture = TestBed.createComponent(TarlBookmarkButtonComponent);
      component = fixture.componentInstance;
      component['hostComponent'] = { searchResult: mockSearchResultWithMMS };

      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });

    it('should render button when bookmarkable items exist', () => {
      component['hostComponent'] = { searchResult: mockSearchResultWithMMS };

      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(1);
    });

    it('should render button with correct text', () => {
      component['hostComponent'] = { searchResult: mockSearchResultWithMMS };

      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.textContent.trim()).toBe('Send To Reading Lists');
    });

    it('should render multiple buttons for multiple MMS IDs', () => {
      const multiMMSResult = {
        pnx: {
          display: {
            mms: ['9912345678901234', '9912345678901235'] // Two matching MMS IDs
          }
        }
      };
      component['hostComponent'] = { searchResult: multiMMSResult };

      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBe(2);
    });
  });
});

