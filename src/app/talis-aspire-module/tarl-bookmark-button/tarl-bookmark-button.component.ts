import { Component, Input, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  getTalisAspireConfig,
  TalisAspireConfig,
  extractMmsIds,
  buildOpenUrlParams,
} from '../talis-aspire.config';

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
  displayButton = true;
  private config!: TalisAspireConfig;

  constructor(
    @Optional() @Inject('MODULE_PARAMETERS') private moduleParameters: any,
  ) {}

  ngOnInit(): void {
    // Load configuration from MODULE_PARAMETERS
    try {
      this.config = getTalisAspireConfig(this.moduleParameters);
      this.displayButton = this.config.displayBookmarkThisButton ?? true;
    } catch (error) {
      console.error('Failed to load Talis Aspire configuration:', error);
      return;
    }

    if (!this.displayButton) {
      return;
    }

    // Get search result from host component
    const item = this.hostComponent?.searchResult;
    if (!item) {
      return;
    }

    // Extract MMS IDs for this item
    const mmsIds = extractMmsIds(item, this.config.mmsIdInstitutionCode);

    if (mmsIds.length > 0) {
      // Create bookmarkable items for each MMS ID
      this.bookmarkableItems = mmsIds.map((mmsId) => ({
        url: `${this.config.baseUrl}ui/forms/bookmarklet.html?bibid=${mmsId}`,
        title: this.config.bookmarkThisTitleAttribute!,
        actionText: this.config.bookmarkThisButtonText!,
      }));
    } else {
      // No MMS ID found, try to build OpenURL from addata
      const addata = item?.pnx?.addata;
      if (addata) {
        const openUrlParams = buildOpenUrlParams(addata);
        if (openUrlParams) {
          this.bookmarkableItems = [
            {
              url: `${this.config.baseUrl}ui/forms/bookmarklet.html?${openUrlParams}`,
              title: this.config.bookmarkThisTitleAttribute!,
              actionText: this.config.bookmarkThisButtonText!,
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
