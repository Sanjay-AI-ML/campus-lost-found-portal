import _Map "mo:core/Map";
import _Text "mo:core/Text";
import _Nat "mo:core/Nat";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type Category = {
    #electronics;
    #clothing;
    #documents;
    #jewelry;
    #pets;
    #others;
  };

  public type ItemType = { #lost; #found };
  public type Status = { #active; #resolved; #claim_pending };

  public type Item = {
    id : Text;
    title : Text;
    description : Text;
    category : Category;
    location : Text;
    itemType : ItemType;
    contact : Text;
    status : Status;
    timestamp : Time.Time;
  };

  public type Claim = {
    id : Text;
    itemId : Text;
    name : Text;
    contact : Text;
    clue1 : Text;
    clue2 : Text;
    clue3 : Text;
    timestamp : Time.Time;
  };

  public type Finder = {
    name : Text;
    contact : Text;
    totalReturned : Nat;
    creditScore : Nat;
  };

  public type ItemWithFinder = {
    item : Item;
    creditScore : Nat;
    badgeTier : Text;
  };

  module Item {
    public func compareByTimestamp(item1 : Item, item2 : Item) : Order.Order {
      if (item1.timestamp > item2.timestamp) { return #less };
      if (item1.timestamp < item2.timestamp) { return #greater };
      #equal;
    };
  };

  module Finder {
    public func compareByCreditScore(f1 : Finder, f2 : Finder) : Order.Order {
      _Nat.compare(f2.creditScore, f1.creditScore);
    };
  };

  module ItemWithFinder {
    public func compareByCreditScore(first : ItemWithFinder, second : ItemWithFinder) : Order.Order {
      _Nat.compare(second.creditScore, first.creditScore);
    };
  };

  let items = _Map.empty<Text, Item>();
  let claims = _Map.empty<Text, Claim>();
  let finders = _Map.empty<Text, Finder>();

  public shared ({ caller }) func addItem(
    id : Text,
    title : Text,
    description : Text,
    category : Category,
    location : Text,
    itemType : ItemType,
    contact : Text,
  ) : async () {
    let item : Item = {
      id;
      title;
      description;
      category;
      location;
      itemType;
      contact;
      status = #active;
      timestamp = Time.now();
    };
    items.add(id, item);
  };

  func splitItemsByType(items : [Item]) : ([Item], [Item]) {
    let lostItems = List.empty<Item>();
    let foundItems = List.empty<Item>();

    for (item in items.values()) {
      if (item.itemType == #lost) {
        lostItems.add(item);
      } else {
        foundItems.add(item);
      };
    };

    (lostItems.toArray(), foundItems.toArray());
  };

  public query ({ caller }) func getAllItems() : async [Item] {
    items.values().toArray().sort(Item.compareByTimestamp);
  };

  public query ({ caller }) func getItemsWithFinder() : async [Item] {
    let activeItems = items.values().toArray();
    let (lostItems, foundItems) = splitItemsByType(activeItems);

    let sortedLostItems = lostItems.sort(Item.compareByTimestamp);

    let foundItemsWithCredit = foundItems.map(func(item) {
      let (creditScore, badgeTier) = switch (finders.get(item.contact)) {
        case (?finder) {
          (finder.creditScore, getBadgeTier(finder.creditScore));
        };
        case (null) { (0, "Bronze") };
      };
      {
        item;
        creditScore;
        badgeTier;
      };
    });

    let sortedFoundItems = foundItemsWithCredit.sort(ItemWithFinder.compareByCreditScore);
    sortedLostItems.concat(sortedFoundItems.map(func(iwf) { iwf.item }));
  };

  public shared ({ caller }) func resolveItem(id : Text) : async () {
    switch (items.get(id)) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?item) {
        if (item.status == #resolved) {
          Runtime.trap("Item already resolved");
        };
        let updatedItem : Item = {
          id = item.id;
          title = item.title;
          description = item.description;
          category = item.category;
          location = item.location;
          itemType = item.itemType;
          contact = item.contact;
          status = #resolved;
          timestamp = item.timestamp;
        };
        items.add(id, updatedItem);
      };
    };
  };

  public query ({ caller }) func getActiveItems() : async [Item] {
    let activeItems = List.empty<Item>();
    for (item in items.values()) {
      if (item.status == #active) {
        activeItems.add(item);
      };
    };
    activeItems.toArray();
  };

  public shared ({ caller }) func submitClaim(
    itemId : Text,
    name : Text,
    contact : Text,
    clue1 : Text,
    clue2 : Text,
    clue3 : Text,
  ) : async () {
    let claimId = itemId # "_" # Time.now().toText();
    let timestamp = Time.now();
    let claim : Claim = {
      id = claimId;
      itemId;
      name;
      contact;
      clue1;
      clue2;
      clue3;
      timestamp;
    };

    claims.add(claimId, claim);

    let item = switch (items.get(itemId)) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?item) { item };
    };

    if (item.status != #active) {
      Runtime.trap("Item is not in active status");
    };

    let updatedItem : Item = {
      id = item.id;
      title = item.title;
      description = item.description;
      category = item.category;
      location = item.location;
      itemType = item.itemType;
      contact = item.contact;
      status = #claim_pending;
      timestamp = item.timestamp;
    };

    items.add(itemId, updatedItem);
  };

  public shared ({ caller }) func approveClaim(claimId : Text) : async () {
    switch (claims.get(claimId)) {
      case (null) {
        Runtime.trap("Claim not found");
      };
      case (?claim) {
        let item = switch (items.get(claim.itemId)) {
          case (null) {
            Runtime.trap("Linked item not found");
          };
          case (?item) { item };
        };

        if (item.status != #claim_pending) {
          Runtime.trap("Item is not in claim pending status");
        };

        let updatedItem : Item = {
          id = item.id;
          title = item.title;
          description = item.description;
          category = item.category;
          location = item.location;
          itemType = item.itemType;
          contact = item.contact;
          status = #resolved;
          timestamp = item.timestamp;
        };

        items.add(claim.itemId, updatedItem);
        updateFinderProfile(claim.contact, claim.name);
      };
    };
  };

  public shared ({ caller }) func rejectClaim(claimId : Text) : async () {
    switch (claims.get(claimId)) {
      case (null) {
        Runtime.trap("Claim not found");
      };
      case (?claim) {
        let item = switch (items.get(claim.itemId)) {
          case (null) {
            Runtime.trap("Linked item not found");
          };
          case (?item) { item };
        };

        if (item.status != #claim_pending) {
          Runtime.trap("Item is not in claim pending status");
        };

        let updatedItem : Item = {
          id = item.id;
          title = item.title;
          description = item.description;
          category = item.category;
          location = item.location;
          itemType = item.itemType;
          contact = item.contact;
          status = #active;
          timestamp = item.timestamp;
        };

        items.add(claim.itemId, updatedItem);
      };
    };
  };

  func updateFinderProfile(contact : Text, name : Text) {
    switch (finders.get(contact)) {
      case (?finder) {
        let updatedFinder : Finder = {
          name = finder.name;
          contact = finder.contact;
          totalReturned = finder.totalReturned + 1;
          creditScore = finder.creditScore + 10;
        };
        finders.add(contact, updatedFinder);
      };
      case (null) {
        let newFinder : Finder = {
          name;
          contact;
          totalReturned = 1;
          creditScore = 10;
        };
        finders.add(contact, newFinder);
      };
    };
  };

  func getBadgeTier(creditScore : Nat) : Text {
    if (creditScore >= 100) { return "Platinum" };
    if (creditScore >= 50) { return "Gold" };
    if (creditScore >= 20) { return "Silver" };
    "Bronze";
  };

  public query ({ caller }) func getAllClaims() : async [Claim] {
    claims.values().toArray();
  };

  public query ({ caller }) func getClaimsByItem(itemId : Text) : async [Claim] {
    claims.values().toArray().filter(
      func(claim) {
        claim.itemId == itemId;
      }
    );
  };

  public query ({ caller }) func getFinders() : async [Finder] {
    finders.values().toArray().sort(Finder.compareByCreditScore);
  };
};
