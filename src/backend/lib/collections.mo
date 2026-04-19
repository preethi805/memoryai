import Map "mo:core/Map";
import Types "../types/common";
import CollectionTypes "../types/collections";

module {
  public type State = {
    collections : Map.Map<Types.Id, CollectionTypes.Collection>;
    var nextId : Types.Id;
  };

  public func newState() : State {
    {
      collections = Map.empty<Types.Id, CollectionTypes.Collection>();
      var nextId = 1;
    };
  };

  public func create(state : State, input : CollectionTypes.CollectionInput, nowNs : Types.Timestamp) : CollectionTypes.Collection {
    let id = state.nextId;
    state.nextId += 1;
    let coll : CollectionTypes.Collection = {
      id;
      name = input.name;
      description = input.description;
      createdAt = nowNs;
    };
    state.collections.add(id, coll);
    coll;
  };

  public func getById(state : State, id : Types.Id) : ?CollectionTypes.Collection {
    state.collections.get(id);
  };

  public func list(state : State) : [CollectionTypes.Collection] {
    state.collections.values().toArray();
  };

  public func update(state : State, id : Types.Id, input : CollectionTypes.CollectionInput) : ?CollectionTypes.Collection {
    switch (state.collections.get(id)) {
      case null null;
      case (?existing) {
        let updated : CollectionTypes.Collection = { existing with
          name = input.name;
          description = input.description;
        };
        state.collections.add(id, updated);
        ?updated;
      };
    };
  };

  public func delete(state : State, id : Types.Id) : Bool {
    switch (state.collections.get(id)) {
      case null false;
      case (?_) {
        state.collections.remove(id);
        true;
      };
    };
  };
};
