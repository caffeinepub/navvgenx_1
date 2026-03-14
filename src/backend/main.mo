import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  //////////////////////////
  // Type Declarations
  //////////////////////////

  type HealthEntry = {
    bp : Text;
    steps : Nat;
    sleepHours : Float;
    waterIntake : Float;
    weight : Float;
    timestamp : Int;
  };

  type Message = {
    role : Text;
    content : Text;
    category : Text;
    timestamp : Int;
  };

  type Reminder = {
    id : Nat;
    title : Text;
    time : Text;
    active : Bool;
    createdAt : Int;
  };

  type Profile = {
    userId : Principal;
    age : Nat;
    ageGroup : Text; // "genz", "millennial", "senior"
    interests : [Text];
    createdAt : Int;
  };

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : Order.Order {
      Int.compare(profile1.createdAt, profile2.createdAt);
    };
  };

  // Global state
  let profiles = Map.empty<Principal, Profile>();
  let healthEntries = Map.empty<Principal, List.List<HealthEntry>>();
  let chatHistory = Map.empty<Principal, List.List<Message>>();
  let reminders = Map.empty<Principal, List.List<Reminder>>();
  var nextReminderId = 0;

  //////////////////////////
  // Authorization
  //////////////////////////

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  //////////////////////////
  // Feature 1: Profile Management
  //////////////////////////

  public shared ({ caller }) func createOrUpdateProfile(age : Nat, ageGroup : Text, interests : [Text], createdAt : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify profiles");
    };

    let profile : Profile = {
      userId = caller;
      age;
      ageGroup;
      interests;
      createdAt;
    };
    profiles.add(caller, profile);
  };

  // Required by frontend: get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  // Required by frontend: save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Ensure the profile userId matches the caller
    let updatedProfile : Profile = {
      userId = caller;
      age = profile.age;
      ageGroup = profile.ageGroup;
      interests = profile.interests;
      createdAt = profile.createdAt;
    };
    profiles.add(caller, updatedProfile);
  };

  // Required by frontend: get any user's profile (with authorization)
  public query ({ caller }) func getUserProfile(userId : Principal) : async ?Profile {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(userId);
  };

  // Legacy function - kept for backward compatibility but with proper authorization
  public query ({ caller }) func getProfile(userId : Principal) : async ?Profile {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(userId);
  };

  //////////////////////////
  // Feature 2: Health Tracker
  //////////////////////////

  public shared ({ caller }) func addHealthEntry(entry : HealthEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add health entries");
    };

    let existingEntries = switch (healthEntries.get(caller)) {
      case (null) { List.empty<HealthEntry>() };
      case (?entries) { entries };
    };

    existingEntries.add(entry);
    if (existingEntries.size() > 30) {
      let lastThirty = existingEntries.toArray().sliceToArray(0, 30);
      healthEntries.add(caller, List.fromArray<HealthEntry>(lastThirty));
    } else {
      healthEntries.add(caller, existingEntries);
    };
  };

  public query ({ caller }) func getHealthEntries() : async [HealthEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view health entries");
    };
    switch (healthEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public query ({ caller }) func computeHealthScore() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can compute health score");
    };

    let entries = switch (healthEntries.get(caller)) {
      case (null) { return 0 };
      case (?e) { e };
    };

    if (entries.isEmpty()) { return 0 };

    let latestEntry = entries.at(0);

    var score : Float = 0;

    // BP check
    if (latestEntry.bp == "120/80") { score += 30 } else { score += 15 };

    // Steps
    if (latestEntry.steps >= 8000) { score += 20 } else { score += 10 };

    // Sleep
    if (latestEntry.sleepHours >= 7 and latestEntry.sleepHours <= 9) {
      score += 20;
    } else { score += 10 };

    // Water
    if (latestEntry.waterIntake >= 2.0) { score += 15 } else { score += 5 };

    // Weight (very simplified)
    score += 15;

    score.toInt().toNat();
  };

  //////////////////////////
  // Feature 3: Chat History
  //////////////////////////

  public shared ({ caller }) func addMessage(message : Message) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add messages");
    };

    let existingMessages = switch (chatHistory.get(caller)) {
      case (null) { List.empty<Message>() };
      case (?msgs) { msgs };
    };

    existingMessages.add(message);
    if (existingMessages.size() > 50) {
      let lastFifty = existingMessages.toArray().sliceToArray(0, 50);
      chatHistory.add(caller, List.fromArray<Message>(lastFifty));
    } else {
      chatHistory.add(caller, existingMessages);
    };
  };

  public query ({ caller }) func getChatHistory() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view chat history");
    };
    switch (chatHistory.get(caller)) {
      case (null) { [] };
      case (?messages) { messages.toArray() };
    };
  };

  public shared ({ caller }) func clearChatHistory() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear messages");
    };
    chatHistory.remove(caller);
  };

  //////////////////////////
  // Feature 4: Reminder System
  //////////////////////////

  public shared ({ caller }) func addReminder(title : Text, time : Text, createdAt : Int) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reminders");
    };

    let reminder : Reminder = {
      id = nextReminderId;
      title;
      time;
      active = true;
      createdAt;
    };

    let existingReminders = switch (reminders.get(caller)) {
      case (null) { List.empty<Reminder>() };
      case (?rem) { rem };
    };

    existingReminders.add(reminder);
    reminders.add(caller, existingReminders);

    nextReminderId += 1;
    nextReminderId - 1;
  };

  public query ({ caller }) func getReminders() : async [Reminder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reminders");
    };
    switch (reminders.get(caller)) {
      case (null) { [] };
      case (?rem) { rem.toArray() };
    };
  };

  public shared ({ caller }) func toggleReminder(reminderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle reminders");
    };

    let existingReminders = switch (reminders.get(caller)) {
      case (null) { [] };
      case (?rem) { rem.toArray() };
    };

    let updatedReminders = existingReminders.map(
      func(r) {
        if (r.id == reminderId) {
          { r with active = not r.active };
        } else { r };
      }
    );

    reminders.add(caller, List.fromArray<Reminder>(updatedReminders));
  };

  public shared ({ caller }) func deleteReminder(reminderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete reminders");
    };

    let existingReminders = switch (reminders.get(caller)) {
      case (null) { List.empty<Reminder>() };
      case (?rem) { rem };
    };

    let filtered = existingReminders.filter(
      func(r) { r.id != reminderId }
    );

    reminders.add(caller, filtered);
  };
};
