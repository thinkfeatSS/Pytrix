# 02 - React Native Engineering & Dependency Rules

**Project:** Pytrix — Python Learning Mobile Application  
**Document Type:** Mandatory React Native & Native Bridge Rules  
**Scope:** Mobile application layer, platform conventions, hooks, performance, and dependencies.

---

## 1. React Native Engineering Rules

1. **Functional Components:** Use functional components and React hooks exclusively.
2. **React Native CLI Conventions:** Follow standard React Native CLI conventions without Expo proprietary dependencies unless explicitly approved.
3. **Version Compatibility:** Maintain strict compatibility with the selected React Native version.
4. **Minimal Native Dependencies:** Avoid unnecessary native dependencies to minimize build complexity and binary size.
5. **Isolate Native Modules:** Keep all native modules isolated behind clean, reusable JavaScript abstraction interfaces.
6. **Platform Differences:** Explicitly handle Android and iOS platform-specific differences (styling, status bar, navigation bar, file paths).
7. **Keyboard Handling:** Thoroughly test keyboard appearance, dismissal, and input shifting on both Android and iOS.
8. **Lifecycle & Screen Focus:** Properly manage React Navigation lifecycle and screen focus/blur events.
9. **Prevent Memory Leaks:** Prevent memory leaks from event listeners, subscriptions, intervals, and timeouts.
10. **Clean Up on Unmount:** Always return cleanup functions in `useEffect` for all subscriptions, timers, and native listeners.
11. **Do Not Block JS Thread:** Avoid blocking the JavaScript thread with expensive calculations; offload or break up heavy tasks.
12. **Minimize Bridge Traffic:** Avoid high-frequency or unnecessarily large data serialization across the React Native bridge or WebView bridge.
13. **Virtualized Lists:** Use `FlatList` or an appropriate virtualized list for lists with more than a few items. Never map arrays to views inside a ScrollView for unbounded collections.
14. **Stable List Keys:** Provide stable, unique keys (e.g., entity IDs) for list items. Never use item array indices as keys when lists can change order or length.
15. **Avoid Massive Simultaneous Renders:** Do not render large datasets simultaneously; use windowing, batching, and pagination.
16. **Asset Optimization:** Optimize image sizes, compress assets, and use appropriate vector/raster formats.
17. **Guard Animations:** Avoid unnecessary or expensive animations on low-end devices.
18. **App Lifecycle:** Handle application backgrounding and foregrounding gracefully, pausing timers and non-critical operations.
19. **Session Restoration:** Restore unfinished exercises and draft code after application restarts or background termination.
20. **Interrupted Execution:** Test and handle application behavior when interrupted by incoming calls, notifications, or task switching.

---

## 2. Dependency Management Rules

1. **Understand Purpose:** Never install a library without thoroughly understanding its purpose, license, and architectural fit.
2. **Compatibility Verification:** Check compatibility with the current React Native version before adding any dependency.
3. **Platform Support:** Verify full Android and iOS platform support.
4. **Maintenance Status:** Inspect maintenance status, active repository issues, and release cadence before adopting third-party code.
5. **Permissive Licensing:** Ensure licenses are compatible with project requirements (e.g., MIT, Apache 2.0, BSD).
6. **Binary Footprint:** Check the bundle and binary size impact of each package.
7. **Security Review:** Check dependencies for known CVEs and security vulnerabilities.
8. **No Abandoned Libraries:** Avoid abandoned or unmaintained packages.
9. **No Redundancy:** Avoid installing multiple libraries that solve the same underlying problem.
10. **Pin Dependency Versions:** Pin dependencies appropriately to avoid breaking changes during automated installs.
11. **Test Upgrades:** Thoroughly test dependency upgrades on both platforms before committing.
12. **Document Important Packages:** Document critical dependencies and their specific configuration nuances in project docs.
13. **No Blind Upgrades:** Never upgrade major dependencies blindly without reviewing migration guides and release notes.
14. **Check Before Removing:** Never remove an existing dependency without auditing the entire codebase for references.
15. **Avoid Unnecessary Native Modules:** Prefer pure JavaScript/TypeScript solutions when performance is adequate to avoid native linkage friction.

