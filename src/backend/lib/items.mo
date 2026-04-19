import Map "mo:core/Map";
import Int "mo:core/Int";
import Types "../types/common";
import ItemTypes "../types/items";

module {
  public type State = {
    items : Map.Map<Types.Id, ItemTypes.MemoryItem>;
    var nextId : Types.Id;
  };

  public func newState() : State {
    {
      items = Map.empty<Types.Id, ItemTypes.MemoryItem>();
      var nextId = 1;
    };
  };

  /// Convert nanosecond timestamp to YYYYMMDD DateKey
  public func dateKeyFromNs(ns : Types.Timestamp) : Types.DateKey {
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

  /// Default initial FSRS state for a new card
  func initialFsrs() : ItemTypes.FsrsState {
    { stability = 1.0; difficulty = 5.0; retrievability = 1.0 };
  };

  public func create(state : State, input : ItemTypes.MemoryItemInput, nowNs : Types.Timestamp) : ItemTypes.MemoryItem {
    let id = state.nextId;
    state.nextId += 1;
    let todayKey = dateKeyFromNs(nowNs);
    let item : ItemTypes.MemoryItem = {
      id;
      collectionId = input.collectionId;
      question = input.question;
      answer = input.answer;
      tags = input.tags;
      state = #new_;
      fsrs = initialFsrs();
      nextReviewDate = todayKey; // due immediately
      createdAt = nowNs;
      updatedAt = nowNs;
    };
    state.items.add(id, item);
    item;
  };

  public func getById(state : State, id : Types.Id) : ?ItemTypes.MemoryItem {
    state.items.get(id);
  };

  public func listAll(state : State) : [ItemTypes.MemoryItem] {
    state.items.values().toArray();
  };

  public func listFiltered(state : State, filter : ItemTypes.ItemFilter) : [ItemTypes.MemoryItem] {
    state.items.values()
      .filter(func(item) {
        let collOk = switch (filter.collectionId) {
          case null true;
          case (?cid) item.collectionId == cid;
        };
        let dueOk = switch (filter.dueBefore) {
          case null true;
          case (?d) item.nextReviewDate <= d;
        };
        let tagOk = if (filter.tags.size() == 0) true
          else filter.tags.any(func(t) { item.tags.contains(t) });
        collOk and dueOk and tagOk;
      })
      .toArray();
  };

  public func update(state : State, id : Types.Id, input : ItemTypes.MemoryItemUpdate, nowNs : Types.Timestamp) : ?ItemTypes.MemoryItem {
    switch (state.items.get(id)) {
      case null null;
      case (?existing) {
        let updated : ItemTypes.MemoryItem = { existing with
          question = input.question;
          answer = input.answer;
          tags = input.tags;
          updatedAt = nowNs;
        };
        state.items.add(id, updated);
        ?updated;
      };
    };
  };

  public func delete(state : State, id : Types.Id) : Bool {
    switch (state.items.get(id)) {
      case null false;
      case (?_) {
        state.items.remove(id);
        true;
      };
    };
  };

  /// FSRS-4 simplified scheduling after a review rating.
  /// Rating: 1=Again, 2=Hard, 3=Good, 4=Easy
  public func applyReview(state : State, id : Types.Id, rating : Types.Rating, nowNs : Types.Timestamp) : ?ItemTypes.MemoryItem {
    switch (state.items.get(id)) {
      case null null;
      case (?item) {
        let oldFsrs = item.fsrs;

        // Difficulty update: D' = D - 0.8 + 0.28*(rating-1) clamped [1,10]
        let ratingF : Float = rating.toFloat();
        var newD = oldFsrs.difficulty - 0.8 + 0.28 * (ratingF - 1.0);
        if (newD < 1.0) newD := 1.0;
        if (newD > 10.0) newD := 10.0;

        // Stability update based on rating
        let newS : Float = switch (rating) {
          case 1 { 0.4 }; // Again — reset stability
          case 2 { oldFsrs.stability * 1.2 }; // Hard
          case 3 { oldFsrs.stability * 2.0 }; // Good
          case _ { oldFsrs.stability * 3.0 }; // Easy (4+)
        };

        // Next review interval in days (min 1)
        let intervalDays : Nat = switch (rating) {
          case 1 { 1 };
          case 2 {
            let d = Int.abs(newS.toInt());
            if (d < 1) 1 else d;
          };
          case 3 {
            let d = Int.abs(newS.toInt());
            if (d < 1) 1 else d;
          };
          case _ {
            let raw = newS * 1.3;
            let d = Int.abs(raw.toInt());
            if (d < 1) 1 else d;
          };
        };

        // Compute next review date key from today + intervalDays
        let todaySecs : Nat = (nowNs / 1_000_000_000).toNat();
        let nextSecs : Int = (todaySecs + intervalDays * 86400).toInt();
        let nextKey = dateKeyFromNs(nextSecs * 1_000_000_000);

        let newItemState : ItemTypes.Difficulty = switch (rating) {
          case 1 #relearning;
          case 2 #learning;
          case _ #review;
        };

        let updated : ItemTypes.MemoryItem = { item with
          state = newItemState;
          fsrs = { stability = newS; difficulty = newD; retrievability = 0.9 };
          nextReviewDate = nextKey;
          updatedAt = nowNs;
        };
        state.items.add(id, updated);
        ?updated;
      };
    };
  };

  public func getDueItems(state : State, todayKey : Types.DateKey) : [ItemTypes.MemoryItem] {
    state.items.values()
      .filter(func(item) { item.nextReviewDate <= todayKey })
      .toArray();
  };
};
