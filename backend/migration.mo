import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";

module {
  type Category = {
    #electronics;
    #clothing;
    #documents;
    #jewelry;
    #pets;
    #others;
  };

  type ItemType = { #lost; #found };
  type Status = { #active; #resolved; #claim_pending };

  type Item = {
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

  type Claim = {
    id : Text;
    itemId : Text;
    name : Text;
    contact : Text;
    clue1 : Text;
    clue2 : Text;
    clue3 : Text;
    timestamp : Time.Time;
  };

  type Finder = {
    name : Text;
    contact : Text;
    totalReturned : Nat;
    creditScore : Nat;
  };

  type OldActor = {
    items : Map.Map<Text, Item>;
    claims : Map.Map<Text, Claim>;
  };

  type NewActor = {
    items : Map.Map<Text, Item>;
    claims : Map.Map<Text, Claim>;
    finders : Map.Map<Text, Finder>;
  };

  public func run(old : OldActor) : NewActor {
    let finders = Map.empty<Text, Finder>();
    { old with finders };
  };
};
