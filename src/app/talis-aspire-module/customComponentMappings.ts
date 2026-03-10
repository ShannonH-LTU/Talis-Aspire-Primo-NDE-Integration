import { TarlBookmarkButtonComponent } from './tarl-bookmark-button/tarl-bookmark-button.component';
import { TarlRelatedListsComponent } from './tarl-related-lists/tarl-related-lists.component';
// Define the map
export const selectorComponentMap = new Map<string, any>([
  ['nde-record-availability-bottom', TarlBookmarkButtonComponent],
  ['nde-full-display-details-after', TarlRelatedListsComponent],
]);
