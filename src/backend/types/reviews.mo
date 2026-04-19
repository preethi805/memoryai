import Common "common";

module {
  /// A single review event stored for analytics
  public type ReviewEvent = {
    id : Common.Id;
    itemId : Common.Id;
    collectionId : Common.Id;
    rating : Common.Rating;
    reviewedAt : Common.Timestamp;
  };

  /// Daily activity summary (reviews per day)
  public type DailyActivity = {
    dateKey : Common.DateKey; // YYYYMMDD
    reviewCount : Nat;
    correctCount : Nat; // rating >= 3
  };

  /// Global dashboard statistics
  public type DashboardStats = {
    totalItems : Nat;
    itemsDueToday : Nat;
    studyStreak : Nat;      // consecutive days with at least 1 review
    accuracyPercent : Float; // percentage of ratings >= 3
  };
};
