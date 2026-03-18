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
    ageGroup : Text;
    interests : [Text];
    createdAt : Int;
  };

  type UserAccount = {
    userId : Principal;
    name : Text;
    mobile : Text;
    gender : Text;
    language : Text;
    age : Nat;
    ageGroup : Text;
    interests : [Text];
    photoUrl : Text;
    createdAt : Int;
  };

  module Profile {
    public func compare(p1 : Profile, p2 : Profile) : Order.Order {
      Int.compare(p1.createdAt, p2.createdAt);
    };
  };

  // Global state
  let profiles = Map.empty<Principal, Profile>();
  let userAccounts = Map.empty<Principal, UserAccount>();
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
  // Feature 1: Legacy Profile
  //////////////////////////

  public shared ({ caller }) func createOrUpdateProfile(age : Nat, ageGroup : Text, interests : [Text], createdAt : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let profile : Profile = { userId = caller; age; ageGroup; interests; createdAt };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    profiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let updatedProfile : Profile = {
      userId = caller;
      age = profile.age;
      ageGroup = profile.ageGroup;
      interests = profile.interests;
      createdAt = profile.createdAt;
    };
    profiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getUserProfile(userId : Principal) : async ?Profile {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    profiles.get(userId);
  };

  public query ({ caller }) func getProfile(userId : Principal) : async ?Profile {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    profiles.get(userId);
  };

  //////////////////////////
  // Feature 1b: Extended User Account
  //////////////////////////

  public shared ({ caller }) func saveUserAccount(name : Text, mobile : Text, gender : Text, language : Text, age : Nat, ageGroup : Text, interests : [Text], photoUrl : Text, createdAt : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let account : UserAccount = {
      userId = caller;
      name;
      mobile;
      gender;
      language;
      age;
      ageGroup;
      interests;
      photoUrl;
      createdAt;
    };
    userAccounts.add(caller, account);
    let profile : Profile = { userId = caller; age; ageGroup; interests; createdAt };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getUserAccount() : async ?UserAccount {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    userAccounts.get(caller);
  };

  //////////////////////////
  // Feature 2: Health Tracker
  //////////////////////////

  public shared ({ caller }) func addHealthEntry(entry : HealthEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
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
      Runtime.trap("Unauthorized");
    };
    switch (healthEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public query ({ caller }) func computeHealthScore() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let entries = switch (healthEntries.get(caller)) {
      case (null) { return 0 };
      case (?e) { e };
    };
    if (entries.isEmpty()) { return 0 };
    let latestEntry = entries.at(0);
    var score : Float = 0;
    if (latestEntry.bp == "120/80") { score += 30 } else { score += 15 };
    if (latestEntry.steps >= 8000) { score += 20 } else { score += 10 };
    if (latestEntry.sleepHours >= 7 and latestEntry.sleepHours <= 9) { score += 20 } else { score += 10 };
    if (latestEntry.waterIntake >= 2.0) { score += 15 } else { score += 5 };
    score += 15;
    score.toInt().toNat();
  };

  //////////////////////////
  // Feature 3: Chat History
  //////////////////////////

  public shared ({ caller }) func addMessage(message : Message) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
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
      Runtime.trap("Unauthorized");
    };
    switch (chatHistory.get(caller)) {
      case (null) { [] };
      case (?messages) { messages.toArray() };
    };
  };

  public shared ({ caller }) func clearChatHistory() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    chatHistory.remove(caller);
  };

  //////////////////////////
  // Feature 4: Reminder System
  //////////////////////////

  public shared ({ caller }) func addReminder(title : Text, time : Text, createdAt : Int) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let reminder : Reminder = { id = nextReminderId; title; time; active = true; createdAt };
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
      Runtime.trap("Unauthorized");
    };
    switch (reminders.get(caller)) {
      case (null) { [] };
      case (?rem) { rem.toArray() };
    };
  };

  public shared ({ caller }) func toggleReminder(reminderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let existingReminders = switch (reminders.get(caller)) {
      case (null) { [] };
      case (?rem) { rem.toArray() };
    };
    let updatedReminders = existingReminders.map(func(r) {
      if (r.id == reminderId) { { r with active = not r.active } } else { r };
    });
    reminders.add(caller, List.fromArray<Reminder>(updatedReminders));
  };

  public shared ({ caller }) func deleteReminder(reminderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    let existingReminders = switch (reminders.get(caller)) {
      case (null) { List.empty<Reminder>() };
      case (?rem) { rem };
    };
    let filtered = existingReminders.filter(func(r) { r.id != reminderId });
    reminders.add(caller, filtered);
  };
};
