import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Types "../types/common";
import ReviewTypes "../types/reviews";

module {
  public type State = {
    events : List.List<ReviewTypes.ReviewEvent>;
    var nextId : Types.Id;
  };

  public func newState() : State {
    {
      events = List.empty<ReviewTypes.ReviewEvent>();
      var nextId = 1;
    };
  };

  public func recordEvent(
    state : State,
    itemId : Types.Id,
    collectionId : Types.Id,
    rating : Types.Rating,
    nowNs : Types.Timestamp
  ) : ReviewTypes.ReviewEvent {
    let id = state.nextId;
    state.nextId += 1;
    let event : ReviewTypes.ReviewEvent = {
      id;
      itemId;
      collectionId;
      rating;
      reviewedAt = nowNs;
    };
    state.events.add(event);
    event;
  };

  public func listEvents(state : State) : [ReviewTypes.ReviewEvent] {
    state.events.toArray();
  };

  /// Aggregate review events into per-day activity buckets (YYYYMMDD)
  public func getDailyActivity(state : State) : [ReviewTypes.DailyActivity] {
    // Map from dateKey -> (reviewCount, correctCount)
    let actMap = Map.empty<Types.DateKey, (Nat, Nat)>();
    state.events.forEach(func(ev) {
      let dayKey : Types.DateKey = nsToDateKey(ev.reviewedAt);
      let (rc, cc) = switch (actMap.get(dayKey)) {
        case null (0, 0);
        case (?v) v;
      };
      let newCc = if (ev.rating >= 3) cc + 1 else cc;
      actMap.add(dayKey, (rc + 1, newCc));
    });
    let result = List.empty<ReviewTypes.DailyActivity>();
    for ((dayKey, (rc, cc)) in actMap.entries()) {
      result.add({ dateKey = dayKey; reviewCount = rc; correctCount = cc });
    };
    result.toArray();
  };

  public func getDashboardStats(
    state : State,
    totalItems : Nat,
    itemsDueToday : Nat,
    todayKey : Types.DateKey
  ) : ReviewTypes.DashboardStats {
    let total = state.events.size();
    let correct = state.events.foldLeft(
      0,
      func(acc, ev) { if (ev.rating >= 3) acc + 1 else acc }
    );
    let accuracyPercent : Float = if (total == 0) 0.0
      else correct.toFloat() / total.toFloat() * 100.0;

    let streak = computeStreak(state, todayKey);
    { totalItems; itemsDueToday; studyStreak = streak; accuracyPercent };
  };

  public func getCollectionAccuracy(state : State, collectionId : Types.Id) : Float {
    var total : Nat = 0;
    var correct : Nat = 0;
    state.events.forEach(func(ev) {
      if (ev.collectionId == collectionId) {
        total += 1;
        if (ev.rating >= 3) correct += 1;
      };
    });
    if (total == 0) 0.0 else correct.toFloat() / total.toFloat() * 100.0;
  };

  public func getCollectionRetentionRate(state : State, collectionId : Types.Id) : Float {
    getCollectionAccuracy(state, collectionId);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  /// Convert nanoseconds timestamp to YYYYMMDD DateKey
  func nsToDateKey(ns : Types.Timestamp) : Types.DateKey {
    let secondsTotal : Nat = (ns / 1_000_000_000).toNat();
    let days = secondsTotal / 86400;
    let z = days + 719468;
    let era = z / 146097;
    let doe = z % 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if (mp < 10) mp + 3 else mp - 9;
    let yr = if (m <= 2) y + 1 else y;
    yr * 10000 + m * 100 + d;
  };

  /// Decrement a YYYYMMDD key by one calendar day
  func prevDayKey(dk : Types.DateKey) : Types.DateKey {
    let yr = dk / 10000;
    let mo = (dk % 10000) / 100;
    let dy = dk % 100;
    if (dy > 1) {
      yr * 10000 + mo * 100 + (dy - 1);
    } else if (mo > 1) {
      let newM = mo - 1;
      let lastDay = daysInMonth(yr, newM);
      yr * 10000 + newM * 100 + lastDay;
    } else {
      let newY = yr - 1;
      newY * 10000 + 12 * 100 + 31;
    };
  };

  /// Count consecutive days (ending today) with at least one review
  func computeStreak(state : State, todayKey : Types.DateKey) : Nat {
    let daysSet = Map.empty<Types.DateKey, Bool>();
    state.events.forEach(func(ev) {
      daysSet.add(nsToDateKey(ev.reviewedAt), true);
    });

    var streak : Nat = 0;
    var current = todayKey;
    label streakLoop loop {
      if (daysSet.containsKey(current)) {
        streak += 1;
        current := prevDayKey(current);
      } else {
        break streakLoop;
      };
    };
    streak;
  };

  func daysInMonth(year : Nat, month : Nat) : Nat {
    switch (month) {
      case 1 31; case 3 31; case 5 31; case 7 31;
      case 8 31; case 10 31; case 12 31;
      case 4 30; case 6 30; case 9 30; case 11 30;
      case 2 { if (isLeapYear(year)) 29 else 28 };
      case _ 30;
    };
  };

  func isLeapYear(y : Nat) : Bool {
    (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0);
  };
};
