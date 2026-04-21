import Principal "mo:core/Principal";
import GamLib    "../lib/gamification";
import GamTypes  "../types/gamification";
import Common    "../types/common";

mixin (gamState : GamLib.State) {
  /// Get the calling user's current XP, level, and badge progress
  public shared query ({ caller }) func getProgress() : async ?GamTypes.UserProgress {
    ?GamLib.getUserProgress(gamState, caller);
  };

  /// Award XP for a review action.
  /// rating: 1=Again (+5), 2=Hard (+5), 3=Good (+15), 4=Easy (+20)
  public shared ({ caller }) func awardXpForReview(rating : Common.Rating) : async GamTypes.UserProgress {
    let amount : Nat = switch (rating) {
      case 3 { 15 };
      case 4 { 20 };
      case _ { 5  };
    };
    GamLib.awardXp(gamState, caller, amount, "review");
  };

  /// List all XP events for the calling user (most-recent first).
  public shared query ({ caller }) func listXpEvents() : async [GamTypes.XpEvent] {
    GamLib.listXpEventsForUser(gamState, caller);
  };

  /// List all badge definitions with unlock status for the calling user.
  public shared query ({ caller }) func listBadges() : async [GamTypes.Badge] {
    GamLib.listBadgesForUser(gamState, caller);
  };
};
