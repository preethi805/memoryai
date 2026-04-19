import Time "mo:core/Time";
import RevLib "../lib/reviews";
import ItemLib "../lib/items";
import ReviewTypes "../types/reviews";
import Common "../types/common";

mixin (revState : RevLib.State, itemState : ItemLib.State) {
  /// Submit a review rating for a memory item; updates FSRS state and records event
  public shared func submitReview(itemId : Common.Id, rating : Common.Rating) : async ?ReviewTypes.ReviewEvent {
    let nowNs = Time.now();
    switch (ItemLib.getById(itemState, itemId)) {
      case null null;
      case (?item) {
        ignore ItemLib.applyReview(itemState, itemId, rating, nowNs);
        let event = RevLib.recordEvent(revState, itemId, item.collectionId, rating, nowNs);
        ?event;
      };
    };
  };

  /// Get all review events (for analytics)
  public query func listReviewEvents() : async [ReviewTypes.ReviewEvent] {
    RevLib.listEvents(revState);
  };

  /// Get daily study activity (reviews per day)
  public query func getDailyActivity() : async [ReviewTypes.DailyActivity] {
    RevLib.getDailyActivity(revState);
  };

  /// Get global dashboard statistics
  public query func getDashboardStats(todayKey : Common.DateKey) : async ReviewTypes.DashboardStats {
    let totalItems = itemState.items.size();
    let itemsDueToday = ItemLib.getDueItems(itemState, todayKey).size();
    RevLib.getDashboardStats(revState, totalItems, itemsDueToday, todayKey);
  };
};
