import Common "common";

module {
  /// A named collection (deck) of memory items
  public type Collection = {
    id : Common.Id;
    name : Text;
    description : Text;
    createdAt : Common.Timestamp;
  };

  /// Input for creating or updating a collection
  public type CollectionInput = {
    name : Text;
    description : Text;
  };

  /// Aggregate statistics for a collection
  public type CollectionStats = {
    collectionId : Common.Id;
    totalItems : Nat;
    averageAccuracy : Float;
    retentionRate : Float;
  };
};
