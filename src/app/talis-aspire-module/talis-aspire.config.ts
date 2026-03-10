// Talis Aspire Configuration
export interface TalisAspireConfig {
  httpBaseUrl: string;
  baseUrl: string;
  mmsIdInstitutionCode: number;
  relatedListsDisplayLabel: string;
  displayBookmarkThisButton: boolean;
  bookmarkThisTitleAttribute: string;
  bookmarkThisButtonText: string;
}

export const TALIS_ASPIRE_CONFIG: TalisAspireConfig = {
  // === You have to set these up! ===
  httpBaseUrl: 'http://lists.library.youruni.ac.uk/', // Your http base URL or the same as baseUrl
  baseUrl: 'https://youruni.rl.talis.com/', // Your Readinglists tenancy base url with a trailing slash
  mmsIdInstitutionCode: 1234, // The last four digits of your MMS_IDs

  // === customise the related lists ===
  relatedListsDisplayLabel: 'Cited on reading lists:', // Text to display to users

  // === customise the bookmark this button ===
  displayBookmarkThisButton: true, // set to false to hide the button
  bookmarkThisTitleAttribute: 'bookmark this item to reading lists', // tooltip for the bookmark this button
  bookmarkThisButtonText: 'Send To Reading Lists', // Clickable text for the bookmark this button
};

/**
 * Helper function to check if an MMS ID matches the institution code
 */
export function checkMMSIDcontainsInstitutionCode(mmsId: string, institutionCode: number): string | undefined {
  const mmsidCheck = new RegExp('^99[0-9]*' + institutionCode + '$');
  if (mmsidCheck.test(mmsId)) {
    return mmsId;
  }
  return undefined;
}

/**
 * Extract MMS IDs from an item's PNX data
 */
export function extractMmsIds(item: any, institutionCode: number): string[] {
  const mmsIdArr: string[] = [];

  // Check if the nested properties exist before accessing
  if (item?.pnx?.display?.mms) {
    item.pnx.display.mms.forEach((mmsID: string) => {
      const result = checkMMSIDcontainsInstitutionCode(mmsID, institutionCode);
      if (result) {
        mmsIdArr.push(result);
      }
    });
  }

  return mmsIdArr;
}

/**
 * Extract ISBNs from an item's PNX data
 */
export function extractIsbns(item: any): string[] {
  const isbnArr: string[] = [];

  // Check for ISBNs in addata section
  if (item?.pnx?.addata?.isbn && Array.isArray(item.pnx.addata.isbn)) {
    item.pnx.addata.isbn.forEach((isbn: string) => {
      // Clean ISBN: remove hyphens and spaces
      const cleanIsbn = isbn.replace(/[-\s]/g, '');
      if (cleanIsbn && cleanIsbn.length >= 10) {
        isbnArr.push(cleanIsbn);
      }
    });
  }

  return isbnArr;
}

/**
 * Build OpenURL query parameters from addata section
 * Used when no MMS ID is available
 */
export function buildOpenUrlParams(addata: any): string {
  if (!addata) {
    return '';
  }

  const params: Record<string, string> = {};

  // Helper to add first value from array
  const addParam = (key: string, addataKey: string) => {
    if (addata[addataKey] && Array.isArray(addata[addataKey]) && addata[addataKey][0]) {
      params[key] = addata[addataKey][0];
    }
  };

  // Map addata fields to OpenURL parameters
  addParam('rft.atitle', 'atitle'); // article title
  addParam('rft.jtitle', 'jtitle'); // journal title
  addParam('rft.au', 'au'); // author
  addParam('rft.date', 'date'); // date
  addParam('rft.volume', 'volume'); // volume
  addParam('rft.issue', 'issue'); // issue
  addParam('rft.spage', 'spage'); // start page
  addParam('rft.epage', 'epage'); // end page
  addParam('rft.pages', 'pages'); // pages
  addParam('rft.issn', 'issn'); // ISSN
  addParam('rft.eissn', 'eissn'); // eISSN
  addParam('rft.isbn', 'isbn'); // ISBN
  addParam('rft.doi', 'doi'); // DOI
  addParam('rft.genre', 'genre'); // genre (article, book, etc.)
  addParam('rft.pub', 'pub'); // publisher
  addParam('rft.btitle', 'btitle'); // book title

  // Build query string
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

