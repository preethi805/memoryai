module {
  /// Unique identifier for any entity
  public type Id = Nat;

  /// Unix timestamp in nanoseconds (from Time.now())
  public type Timestamp = Int;

  /// Rating for a reviewed memory item: 1=Again, 2=Hard, 3=Good, 4=Easy
  public type Rating = Nat; // 1..4

  /// A calendar date represented as YYYYMMDD integer for easy comparison
  public type DateKey = Nat; // e.g. 20260418
};
