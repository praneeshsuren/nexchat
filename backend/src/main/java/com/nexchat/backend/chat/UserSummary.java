package com.nexchat.backend.chat;

public class UserSummary {
    private String userName; // internal username (may be email); used for DM addressing
    private String givenName;
    private String familyName;
    private String displayName;

    public UserSummary() {}

    public UserSummary(String userName, String givenName, String familyName) {
        this.userName = userName;
        this.givenName = givenName;
        this.familyName = familyName;
    }

    public UserSummary(String userName, String givenName, String familyName, String displayName) {
        this.userName = userName;
        this.givenName = givenName;
        this.familyName = familyName;
        this.displayName = displayName;
    }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getGivenName() { return givenName; }
    public void setGivenName(String givenName) { this.givenName = givenName; }

    public String getFamilyName() { return familyName; }
    public void setFamilyName(String familyName) { this.familyName = familyName; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
}
