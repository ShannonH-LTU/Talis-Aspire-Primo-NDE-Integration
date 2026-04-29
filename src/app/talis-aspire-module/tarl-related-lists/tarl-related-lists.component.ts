import { Component, OnInit, OnDestroy, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { getTalisAspireConfig, TalisAspireConfig, extractMmsIds, extractIsbns } from '../talis-aspire.config';
import { Store, createFeatureSelector, createSelector } from '@ngrx/store';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';

const selectFullDisplayState = createFeatureSelector<any>('full-display');
const selectSelectedRecordId = createSelector(
  selectFullDisplayState,
  (state: any) => state?.selectedRecordId
);

const selectSearchState = createFeatureSelector<any>('Search');
const selectSearchEntities = createSelector(
  selectSearchState,
  (state: any) => state?.entities
);

// select the entity using the current record ID
const selectCurrentFullDisplayRecord = createSelector(
  selectSelectedRecordId,
  selectSearchEntities,
  (recordId: string, entities: any) => {
    if (!recordId || !entities) return null;
    return entities[recordId];
  }
);

@Component({
  selector: 'tarl-related-lists',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './tarl-related-lists.component.html',
  styleUrl: './tarl-related-lists.component.scss',
})
export class TarlRelatedListsComponent implements OnInit, OnDestroy {
  listsFound: { [url: string]: string } | null = null;
  displayLabel = '';
  
  private config!: TalisAspireConfig;  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<any>,
    private http: HttpClient,
    @Optional() @Inject('MODULE_PARAMETERS') private moduleParameters: any,
  ) {}

  ngOnInit(): void {
    // Load configuration from MODULE_PARAMETERS
    try {
      this.config = getTalisAspireConfig(this.moduleParameters);
      this.displayLabel = this.config.relatedListsDisplayLabel!;
    } catch (error) {
      console.error('Failed to load Talis Aspire configuration:', error);
      return;
    }

    this.store.select(selectCurrentFullDisplayRecord)
      .pipe(
        filter(Boolean),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((entity: any) => {
        this.updateReadingListsForEntity(entity);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateReadingListsForEntity(entity: any): void {
    // clear previous results
    this.listsFound = null;

    // Extract MMS IDs for this item
    const mmsIds = extractMmsIds(entity, this.config.mmsIdInstitutionCode);

    if (mmsIds.length > 0) {
      // Fetch lists for each MMS ID
      mmsIds.forEach((mmsId) => {
        this.fetchListsForMmsId(mmsId);
      });
    } else {
      // No MMS ID found, try ISBN as fallback
      const isbns = extractIsbns(entity);
      isbns.forEach((isbn) => {
        this.fetchListsForISBN(isbn);
      });
    }
  }

  private fetchListsForMmsId(mmsId: string): void {
    const url = `${this.config.baseUrl}lcn/${mmsId}/lists.json`;
    this.fetchLists(url, `MMS ID: ${mmsId}`);
  }

  private fetchListsForISBN(isbn: string): void {
    const url = `${this.config.baseUrl}isbn/${isbn}/lists.json`;
    this.fetchLists(url, `ISBN: ${isbn}`);
  }

  private fetchLists(url: string, identifier: string): void {
    // Make the call to Talis Aspire API using JSONP (to bypass CORS)
    this.http.jsonp<{ [url: string]: string }>(url, 'cb').subscribe({
      next: (data: any) => {
        // Update URLs from HTTP to HTTPS
        const updatedData: { [url: string]: string } = {};

        if (data && typeof data === 'object') {
          Object.keys(data).forEach((oldKey) => {
            const newKey = oldKey.replace(
              this.config.httpBaseUrl,
              this.config.baseUrl,
            );
            updatedData[newKey] = data[oldKey];
          });

          // Merge with existing lists (in case multiple identifiers return results)
          this.listsFound = { ...this.listsFound, ...updatedData };
        }
      },
      error: (error) => {
        // Silently fail - don't show lists if API call fails
        console.error(
          `Talis Aspire API request failed for ${identifier}:`,
          error,
        );
      },
    });
  }

  get listEntries(): Array<{ url: string; name: string }> {
    if (!this.listsFound) {
      return [];
    }
    return Object.entries(this.listsFound).map(([url, name]) => ({
      url,
      name,
    }));
  }

  openList(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
