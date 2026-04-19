import Time "mo:core/Time";
import ItemLib "../lib/items";
import ItemTypes "../types/items";
import Common "../types/common";

mixin (itemState : ItemLib.State) {
  /// Create a new memory item (flashcard)
  public shared func createItem(input : ItemTypes.MemoryItemInput) : async ItemTypes.MemoryItem {
    ItemLib.create(itemState, input, Time.now());
  };

  /// Get a memory item by ID
  public query func getItem(id : Common.Id) : async ?ItemTypes.MemoryItem {
    ItemLib.getById(itemState, id);
  };

  /// List memory items, optionally filtered
  public query func listItems(filter : ItemTypes.ItemFilter) : async [ItemTypes.MemoryItem] {
    ItemLib.listFiltered(itemState, filter);
  };

  /// Update a memory item's content (question, answer, tags)
  public shared func updateItem(id : Common.Id, input : ItemTypes.MemoryItemUpdate) : async ?ItemTypes.MemoryItem {
    ItemLib.update(itemState, id, input, Time.now());
  };

  /// Delete a memory item
  public shared func deleteItem(id : Common.Id) : async Bool {
    ItemLib.delete(itemState, id);
  };

  /// Get today's study queue (overdue + due items)
  public query func getDueItems(todayKey : Common.DateKey) : async [ItemTypes.MemoryItem] {
    ItemLib.getDueItems(itemState, todayKey);
  };
};
