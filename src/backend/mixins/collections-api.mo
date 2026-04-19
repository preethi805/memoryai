import Time "mo:core/Time";
import Nat "mo:core/Nat";
import CollLib "../lib/collections";
import RevLib "../lib/reviews";
import ItemLib "../lib/items";
import CollectionTypes "../types/collections";
import Common "../types/common";

mixin (
  collState : CollLib.State,
  itemState : ItemLib.State,
  revState : RevLib.State
) {
  /// Create a new collection
  public shared func createCollection(input : CollectionTypes.CollectionInput) : async CollectionTypes.Collection {
    CollLib.create(collState, input, Time.now());
  };

  /// Get a collection by ID
  public query func getCollection(id : Common.Id) : async ?CollectionTypes.Collection {
    CollLib.getById(collState, id);
  };

  /// List all collections
  public query func listCollections() : async [CollectionTypes.Collection] {
    CollLib.list(collState);
  };

  /// Update a collection's name/description
  public shared func updateCollection(id : Common.Id, input : CollectionTypes.CollectionInput) : async ?CollectionTypes.Collection {
    CollLib.update(collState, id, input);
  };

  /// Delete a collection by ID
  public shared func deleteCollection(id : Common.Id) : async Bool {
    CollLib.delete(collState, id);
  };

  /// Get stats for a specific collection
  public query func getCollectionStats(id : Common.Id) : async ?CollectionTypes.CollectionStats {
    let allItems = ItemLib.listAll(itemState);
    let allEvents = RevLib.listEvents(revState);

    // Count items and reviews for this collection
    var totalItems : Nat = 0;
    for (item in allItems.values()) {
      if (item.collectionId == id) totalItems += 1;
    };

    var totalReviews : Nat = 0;
    var correctReviews : Nat = 0;
    for (ev in allEvents.values()) {
      if (ev.collectionId == id) {
        totalReviews += 1;
        if (ev.rating >= 3) correctReviews += 1;
      };
    };

    switch (CollLib.getById(collState, id)) {
      case null null;
      case (?_) {
        let averageAccuracy : Float = if (totalReviews == 0) 0.0
          else correctReviews.toFloat() / totalReviews.toFloat() * 100.0;
        ?{
          collectionId = id;
          totalItems;
          averageAccuracy;
          retentionRate = averageAccuracy;
        };
      };
    };
  };
};
