import Array     "mo:core/Array";
import Map       "mo:core/Map";
import List      "mo:core/List";
import Float     "mo:core/Float";
import Int       "mo:core/Int";
import Time      "mo:core/Time";
import Principal "mo:core/Principal";
import Text      "mo:core/Text";
import Types     "../types/gamification";
import Common    "../types/common";

module {
  // ── State ─────────────────────────────────────────────────────────────────

  public type State = {
    userProgress  : Map.Map<Principal, UserProgressInternal>;
    xpEvents      : List.List<Types.XpEvent>;
    var nextEventId : Nat;
  };

  type UserProgressInternal = {
    var totalXp    : Nat;
    var level      : Nat;
    unlockedBadges : Map.Map<Text, Common.Timestamp>;
  };

  public func newState() : State = {
    userProgress  = Map.empty<Principal, UserProgressInternal>();
    xpEvents      = List.empty<Types.XpEvent>();
    var nextEventId = 0;
  };

  // ── Badge catalogue ───────────────────────────────────────────────────────

  let BADGE_CATALOGUE : [Types.Badge] = [
    { id = "first_card";      name = "First Card";      description = "Create your first flashcard";                 iconKey = "card";      unlockedAt = null },
    { id = "streak_starter";  name = "Streak Starter";  description = "Achieve a 3-day study streak";                iconKey = "flame";     unlockedAt = null },
    { id = "week_warrior";    name = "Week Warrior";     description = "Achieve a 7-day study streak";                iconKey = "fire";      unlockedAt = null },
    { id = "month_master";    name = "Month Master";     description = "Achieve a 30-day study streak";               iconKey = "crown";     unlockedAt = null },
    { id = "century";         name = "Century";          description = "Complete 100 total reviews";                  iconKey = "hundred";   unlockedAt = null },
    { id = "perfect_session"; name = "Perfect Session";  description = "Finish a session with all Good/Easy ratings"; iconKey = "star";      unlockedAt = null },
    { id = "speed_learner";   name = "Speed Learner";    description = "Complete 50 reviews in a single day";         iconKey = "lightning"; unlockedAt = null },
    { id = "memory_master";   name = "Memory Master";    description = "Complete 500 total reviews";                  iconKey = "brain";     unlockedAt = null },
  ];

  // ── Level formula ─────────────────────────────────────────────────────────

  /// level = floor(sqrt(xp / 100))
  public func computeLevel(xp : Nat) : Nat {
    let ratio = xp.toFloat() / 100.0;
    let root  = Float.sqrt(ratio);
    let fl    = Float.floor(root).toInt();
    Int.abs(fl);
  };

  // ── Core operations ───────────────────────────────────────────────────────

  /// Award XP to a user, persist the event, and recompute their level.
  public func awardXp(state : State, userId : Principal, amount : Nat, reason : Text) : Types.UserProgress {
    let now     = Time.now();
    let upState = getOrCreateUser(state, userId);
    upState.totalXp += amount;
    upState.level    := computeLevel(upState.totalXp);
    let ev : Types.XpEvent = {
      id       = state.nextEventId;
      userId;
      amount;
      reason;
      earnedAt = now;
    };
    state.nextEventId += 1;
    state.xpEvents.add(ev);
    buildProgress(upState, now);
  };

  /// Check badge conditions and unlock newly-earned badges. Returns list of newly-unlocked IDs.
  public func checkAndUnlockBadges(state : State, userId : Principal, stats : Types.ReviewStats) : [Text] {
    let now     = Time.now();
    let upState = getOrCreateUser(state, userId);
    let newlyUnlocked : List.List<Text> = List.empty<Text>();

    let unlock = func(badgeId : Text) {
      if (not upState.unlockedBadges.containsKey(badgeId)) {
        upState.unlockedBadges.add(badgeId, now);
        newlyUnlocked.add(badgeId);
      };
    };

    if (stats.totalCards          >= 1)   unlock("first_card");
    if (stats.currentStreak       >= 3)   unlock("streak_starter");
    if (stats.currentStreak       >= 7)   unlock("week_warrior");
    if (stats.currentStreak       >= 30)  unlock("month_master");
    if (stats.totalReviews        >= 100) unlock("century");
    if (stats.totalReviews        >= 500) unlock("memory_master");
    if (stats.todayReviews        >= 50)  unlock("speed_learner");
    if (stats.lastSessionGoodEasy)        unlock("perfect_session");

    newlyUnlocked.toArray();
  };

  /// Return all XP events for a specific user (most-recent first).
  public func listXpEventsForUser(state : State, userId : Principal) : [Types.XpEvent] {
    let all = state.xpEvents.toArray();
    let filtered = all.filter(func(ev : Types.XpEvent) : Bool { Principal.equal(ev.userId, userId) });
    let size = filtered.size();
    Array.tabulate<Types.XpEvent>(size, func(i) { filtered[size - 1 - i] });
  };

  /// Retrieve a user's current progress (read-only).
  public func getUserProgress(state : State, userId : Principal) : Types.UserProgress {
    let now     = Time.now();
    let upState = getOrCreateUser(state, userId);
    buildProgress(upState, now);
  };

  /// Return the full badge catalogue with unlock timestamps for this user.
  public func listBadgesForUser(state : State, userId : Principal) : [Types.Badge] {
    let upState = getOrCreateUser(state, userId);
    BADGE_CATALOGUE.map<Types.Badge, Types.Badge>(func(b) {
      let ts = upState.unlockedBadges.get(b.id);
      { b with unlockedAt = ts };
    });
  };

  // ── Private helpers ───────────────────────────────────────────────────────

  func getOrCreateUser(state : State, userId : Principal) : UserProgressInternal {
    switch (state.userProgress.get(userId)) {
      case (?up) up;
      case null {
        let fresh : UserProgressInternal = {
          var totalXp    = 0;
          var level      = 0;
          unlockedBadges = Map.empty<Text, Common.Timestamp>();
        };
        state.userProgress.add(userId, fresh);
        fresh;
      };
    };
  };

  func buildProgress(upState : UserProgressInternal, now : Common.Timestamp) : Types.UserProgress {
    let badgeList = BADGE_CATALOGUE.map(func(b) {
      let ts = upState.unlockedBadges.get(b.id);
      { b with unlockedAt = ts };
    });
    {
      totalXp     = upState.totalXp;
      level       = upState.level;
      badges      = badgeList;
      lastUpdated = now;
    };
  };
};
