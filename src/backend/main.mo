import CollLib "lib/collections";
import ItemLib "lib/items";
import RevLib "lib/reviews";
import CollMixin "mixins/collections-api";
import ItemMixin "mixins/items-api";
import RevMixin "mixins/reviews-api";

actor {
  // --- Stable state ---
  let collState = CollLib.newState();
  let itemState = ItemLib.newState();
  let revState  = RevLib.newState();

  // --- Mixin composition ---
  include CollMixin(collState, itemState, revState);
  include ItemMixin(itemState);
  include RevMixin(revState, itemState);
};
