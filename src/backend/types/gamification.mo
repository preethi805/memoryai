import Common "common";

module {
  /// A single XP earning event for a user
  public type XpEvent = {
    id       : Common.Id;
    userId   : Principal;
    amount   : Nat;
    reason   : Text;
    earnedAt : Common.Timestamp;
  };

  /// A badge/achievement (with optional unlock timestamp)
  public type Badge = {
    id          : Text;
    name        : Text;
    description : Text;
    iconKey     : Text;
    unlockedAt  : ?Common.Timestamp;
  };

  /// Snapshot of a user's gamification progress (shared-safe)
  public type UserProgress = {
    totalXp     : Nat;
    level       : Nat;
    badges      : [Badge];
    lastUpdated : Common.Timestamp;
  };

  /// Stats passed into badge-check logic from the reviews domain
  public type ReviewStats = {
    totalReviews        : Nat;
    todayReviews        : Nat;
    currentStreak       : Nat;
    totalCards          : Nat;
    lastSessionGoodEasy : Bool;
  };
};
