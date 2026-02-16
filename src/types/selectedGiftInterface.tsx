import { GiftOption } from "./giftOptionInterface";

export type QuotaSelectionType = "full" | "quotas";

export interface SelectedGift {
  furnitureId: string;
  furnitureName: string;
  option: GiftOption;
  quotaSelectionType?: QuotaSelectionType;
  quotasSelected?: number;
}
