import Common "common";

module {
  /// Difficulty level of a memory item
  public type Difficulty = { #new_; #learning; #review; #relearning };

  /// FSRS scheduling state for spaced repetition
  public type FsrsState = {
    stability : Float;   // S – how stable the memory is
    difficulty : Float;  // D – item difficulty (1..10)
    retrievability : Float; // R – estimated recall probability
  };

  /// A single flashcard / memory item
  public type MemoryItem = {
    id : Common.Id;
    collectionId : Common.Id;
    question : Text;
    answer : Text;
    tags : [Text];
    state : Difficulty;
    fsrs : FsrsState;
    nextReviewDate : Common.DateKey; // YYYYMMDD
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  /// Input for creating a new memory item
  public type MemoryItemInput = {
    collectionId : Common.Id;
    question : Text;
    answer : Text;
    tags : [Text];
  };

  /// Input for updating an existing memory item's content
  public type MemoryItemUpdate = {
    question : Text;
    answer : Text;
    tags : [Text];
  };

  /// Filter criteria for listing memory items
  public type ItemFilter = {
    collectionId : ?Common.Id;
    dueBefore : ?Common.DateKey; // only items with nextReviewDate <= this
    tags : [Text];               // empty = no tag filter
  };
};
