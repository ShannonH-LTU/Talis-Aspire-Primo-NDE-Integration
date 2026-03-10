import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TALIS_ASPIRE_CONFIG, extractMmsIds, buildOpenUrlParams } from '../talis-aspire.config';

interface BookmarkableItem {
  url: string;
  title: string;
  actionText: string;
}

@Component({
  selector: 'custom-tarl-bookmark-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './tarl-bookmark-button.component.html',
  styleUrl: './tarl-bookmark-button.component.scss',
})
export class TarlBookmarkButtonComponent implements OnInit {
  @Input() private hostComponent!: any; // Provided by Primo NDE

  bookmarkableItems: BookmarkableItem[] = [];
  displayButton = TALIS_ASPIRE_CONFIG.displayBookmarkThisButton;

  ngOnInit(): void {
    if (!this.displayButton) {
      return;
    }

    // Get search result from host component
    const item = this.hostComponent?.searchResult;
    if (!item) {
      return;
    }

    // Extract MMS IDs for this item
    const mmsIds = extractMmsIds(
      item,
      TALIS_ASPIRE_CONFIG.mmsIdInstitutionCode,
    );

    if (mmsIds.length > 0) {
      // Create bookmarkable items for each MMS ID
      this.bookmarkableItems = mmsIds.map((mmsId) => ({
        url: `${TALIS_ASPIRE_CONFIG.baseUrl}ui/forms/bookmarklet.html?bibid=${mmsId}`,
        title: TALIS_ASPIRE_CONFIG.bookmarkThisTitleAttribute,
        actionText: TALIS_ASPIRE_CONFIG.bookmarkThisButtonText,
      }));
    } else {
      // No MMS ID found, try to build OpenURL from addata
      const addata = item?.pnx?.addata;
      if (addata) {
        const openUrlParams = buildOpenUrlParams(addata);
        if (openUrlParams) {
          this.bookmarkableItems = [
            {
              url: `${TALIS_ASPIRE_CONFIG.baseUrl}ui/forms/bookmarklet.html?${openUrlParams}`,
              title: TALIS_ASPIRE_CONFIG.bookmarkThisTitleAttribute,
              actionText: TALIS_ASPIRE_CONFIG.bookmarkThisButtonText,
            },
          ];
        }
      }
    }
  }

  onBookmarkClick(url: string): void {
    window.location.href = url;
  }
}

