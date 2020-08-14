# School of Computing &mdash; Year 4 Project Proposal Form

## SECTION A

|                     |                                            |
|---------------------|--------------------------------------------|
|Project Title:       | ICE - a cross platform personal safety app |
|Student 1 Name:      | Hannah O'Connor                            |
|Student 1 ID:        | 16282283                                   |
|Student 2 Name:      | Catherine Mooney                           |
|Student 2 ID:        | 16416052                                   |
|Project Supervisor:  | Renaat Verbruggen                          |

## SECTION B

### Introduction

> Describe the general area covered by the project.

Safety has always a big concern and priority for people and their children. From doing regular day to day errands to making your way home, alone, especially at night. Parents are constantly worried about where their children are and if they made it to their destination ok.
Young girls have the constant fear of getting into taxis unaccompanied or walking down unlit streets. Men and women of all ages are aware of the on-going dangers faced by society today. It’s inevitable that people have to make trips alone, be it short or long journeys. But it wouldn’t be near as daunting if you had reassurance that your guardians knew where you were and that help was easily accessible. This is where our application comes into use, providing that reassurance and extra comfort for those within today's society.

### Outline

> Outline the proposed project.

`ICE` is a cross-platform iOS and Android personal safety mobile application built through the React Native framework. The app will be designed for all to use, with the idea being that only those within your trusted circle of contacts can monitor your real time location, communicate and be updated with notifications and alerts about your current status. Our mission is to establish a platform aiding those without protection and help to make a difference to when a situation could get serious.
We plan to develop a web application alongside this, one that can be accessed via phone or desktop as
another means of receiving updates from those within your inner circle.

### Background

> Where did the ideas come from?

This idea came to mind as a result of hearing stories on social media platforms and within online news articles. We know that personal safety is a huge issue with everyone of all ages and wanted to develop a step towards creating a potential solution. As safety among women and children especially is extremely topical at the moment, we began to think of ways to increase this. We decided on an application for both iOS and Android, as after some research, we found there is nothing quite like it on the various Irish app stores. Our goal is to create a useful everyday app that one could use with their close personal friends & families, normalizing the idea of ensuring that all loved ones are always kept safe. We also decided to incorporate a web app, for the likes of parents without smartphones.

Although there is a security app with some similar functionality on campus in DCU, it doesn’t deliver the goal that we wish to meet. With that app, it’s designed more toward on campus safety in relation to DCU security.
Yet, our idea is round the clock personal safety amongst close family and friends.

### Achievements

> What functions will the project provide? Who will the users be?

This app would be built for all user and all ages. In terms of functionality of the application itself, we are ambitious to implement majority of the following features:

* SOS/help button: this button could be activated by touching it within the main screen and/or activate by voice (scream) or by shaking device, alerting those within your circle.
* Child Mode: for parents to monitor their young children through the app.
* Phone number authentication system for new users. This ensures that only one user per device.
* Circle of family & friends: select those within your trusted circle through searching for users or inviting them to join.
* Web App to monitor activity of those in your circle of trust/children and check updates.
* User Profile: last known location shown for user, along with battery status and history location log.
* Realtime tracking allowing those within your circle to track your movements on a private map. Through selecting your desired destination and be notified of arrival.
* Area Ratings & safe zones.
* Messaging System among circle of trust.
* Social Media feed and forums relating to safety precautions (users could remain anonymous unless in circle of trust)
* Live snapshots updates to circle of trust.
* Push Notifications and alerts to your network providing updates.
* Help mode: This would be triggered through activating the SOS button on the device. Here, we’d like to access the phones audio during this time and stream it the user’s circle of trust.
* Hold button on app and release when safe.
* Optimal routes on google maps.
* If phone turned off while starting a session.
* Geofencing and get alerts when those in circle leave an area.
* Generate fake calls when feeling uneasy in a particular situation.
* Built in alarms if user goes off track.

### Justification

> Why/when/where/how will it be useful?

The app could be extremely useful in terms of our safety among our day-to-day activities. Some examples of scenarios were the application could be leveraged include:
  
* Children walking/cycling to school
* Nights out in town - walk/taxi home
* Travelling alone
* Late evenings in library/on campus
* General users in unsafe/unfamiliar zones

### Programming language(s)

> List the proposed language(s) to be used.

* JavaScript

### Programming tools / Tech stack

> Describe the compiler, database, web server, etc., and any other software tools you plan to use.
  
* Android Studio
* Xcode
* React Library
* React Native Framework
* Visual Studio Code
* Git
* Firebase (Authenication, Real-time database, Cloud Storage)
* Expo CLI / React Native CLI (for React Native development environment)
* Redux (For stateful applications)
* Native Base (React Native UI Kit)
* ESLint ( Linting tool for JavaScript)
* JEST (automation test framework for JS)
* Codecov (Code coverage tool)
* yarn/npm (JS package manager)

### Hardware

> Describe any non-standard hardware components which will be required.

* iOS device for testing
* Android Device for testing

### Learning Challenges

> List the main new things (technologies, languages, tools, etc) that you will have to learn.

* We have working knowledge of how to build native android applications with Java, however we are inexperienced with the creation of an iOS applications,
    web applications and with the react native framework itself. Yet through adopting this framework, it makes for more efficient use of our time rather than building individual native mobile applications. It simply makes for a better development workflow.
* Implementing and managing a pipeline for deployment and testing.
* Minimal to no experience developing with JavaScript, react native and developing/managing cross-platfrom apps.

### Breakdown of work

In order to manage our team for the duration of our project we plan to make use of management tools like Trello. Here we can plan out and divide all the
various subtasks needing to be completed, each taking up a task within various different elements of the project and making note of what is being currently worked on. That way each member will get hand-ons experience which each aspect to our applications' architecture.
In terms of communication, we’ll use a messaging platform like Slack.

In addition, rather than deploying any new code in GitLab changes directly to master, we’ll develop new features on branches and require the other member to peer review the code before the change is merged, along with ensuring that all tests and checks have passed.

In terms of the project documentation, we plan to take an equal responsibilty with it.

#### Student 1 - Hannah

> *Student 1 should complete this section.*

I plan to take main ownership of managing and testing the iOS application given that I’ve a MacBook and iOS applications are not testable on Windows machines. In spite of this, both members will still meet for pair programming sessions to understand each feature, its requirements and how it could be developed but each individual would take the responsibility of ensuring the quality of their own platform based off the shared codebase.

#### Student 2 - Catherine

> *Student 2 should complete this section.*

I am going to take responsibility of the Android application, as I have a Windows laptop, it would suit us better to be responsible for one platform. Therefore we can each test the applications on the separate platforms and maintain communication throughout. We will schedule regular meetings with each other where we will make decisions about the apps features and UI.
