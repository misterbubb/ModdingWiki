---
prev: true
next: true
description: Tips on making your modding workflow faster.
---

# Mod Testing Tips

Before we get into making our mods, it's a good idea to optimize our testing setup so we'll waste less time.

### Opening The Game Faster

For opening the game faster, you can open the game directly from the exe file. This means the game is not run through Steam.

### Testing Your Mods

When testing mods for Crawlspace 2, you can:
- Use the BepInEx console to view logs in real-time
- Check the BepInEx log file at `BepInEx/LogOutput.log` for detailed information
- Use Unity's Debug.Log statements which will appear in the BepInEx console

### Debugging Tips

- Enable debug logging in your BepInEx config to see all log levels
- Use Harmony patches to hook into game methods and log their execution
- Test with different game scenarios to ensure your mod works correctly
- Check for null references and edge cases in your code